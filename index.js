const express = require("express");
const FileUpload = require("express-fileupload");
const axios = require("axios");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const FormData = require('form-data');

const app = express();
const port = 3000;
const prisma = new PrismaClient();

dotenv.config();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(FileUpload());
app.use(express.static("public"));


const imagesDir = path.join(__dirname, "public", "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

app.get("/", (req, res) => {
    res.send(`Hello World`);
})

app.post("/identity", async (req, res) => {
    if (req.files === undefined) {
      return res.status(400).send({
        message: "No File Uploaded",
      });
    }
  
    const ktp = req.files.ktp;
    const foto = req.files.foto;
  
    if (!ktp || !foto) {
      return res.status(400).send({
        message: "KTP or Photo has not been uploaded",
      });
    }
  
    const ktpSize = ktp.data.length;
    const fotoSize = foto.data.length;
  
    const extKTP = path.extname(ktp.name);
    const extFoto = path.extname(foto.name);
  
    const ktpName = ktp.md5 + extKTP;
    const fotoName = foto.md5 + extFoto;
  
    const urlKTP = `${req.protocol}://${req.get("host")}/images/${ktpName}`;
    const urlFoto = `${req.protocol}://${req.get("host")}/images/${fotoName}`;
  
    const allowedType = [".png", ".jpg"];
  
    if (
      !allowedType.includes(extKTP.toLowerCase()) ||
      !allowedType.includes(extFoto.toLowerCase())
    ) {
      return res.status(422).send({
        message: "Invalid Image Extension",
      });
    }
  
    if (ktpSize > 1000000 || fotoSize > 1000000) {
      return res.status(422).send({
        message: "Image must be less than 1 MB",
      });
    }
  
    const uploadImage = (image, imageName) => {
      return new Promise((resolve, reject) => {
        const uploadPath = `./public/images/${imageName}`;
        image.mv(uploadPath, (err) => {
          if (err) {
            reject(err);
          } else {
            // Check if file exists after upload
            fs.access(uploadPath, fs.constants.F_OK, (err) => {
              if (err) {
                reject(new Error('File not found after upload'));
              } else {
                resolve();
              }
            });
          }
        });
      });
    };

    
    try {
      await uploadImage(ktp, ktpName);
      await uploadImage(foto, fotoName);
  
      const newKTP = await prisma.kTP.create({
        data: {
          image: urlKTP,
        },
      });
  
      const newFoto = await prisma.selfie.create({
        data: {
          image: urlFoto,
        },
      });
      
      // console.log(newKTP.id)
      // console.log(newFoto.id)
      // Debug log for ML API URL and payload
      // console.log('Payload:', { ktpid: newKTP.id, selfieid: newFoto.id });

      const ktpPath = path.join(__dirname, 'public', 'images', ktpName);
      const fotoPath = path.join(__dirname, 'public', 'images', fotoName);

      // Buat objek FormData
      const formDataKTP = new FormData();
      formDataKTP.append('image', fs.createReadStream(ktpPath));

      const formDataFoto = new FormData();
      formDataFoto.append('image', fs.createReadStream(fotoPath));

      // Konfigurasi untuk mengirimkan FormData
      const axiosConfig = {
        headers: {
          ...formDataKTP.getHeaders() // Mendapatkan header dari FormData
        }
      };
     
      const uploadKtp = await axios.post(process.env.UPLOAD_IMAGE_API, formDataKTP, axiosConfig);
      const uploadFoto = await axios.post(process.env.UPLOAD_IMAGE_API, formDataFoto, axiosConfig);

      // const getData = await axios.get(process.env.ML_API_GET)
      // const images = getData.data.data.images;
      // console.log(images[images.length - 1])
      // console.log(images[images.length - 2])
    
      const ktpId = uploadKtp.data.data.image.id;
      const selfieId = uploadFoto.data.data.image.id;

      const identityScore = await axios.post(process.env.ML_API, {
        ktpid: ktpId,
        selfieid: selfieId
      })

      const result = identityScore.data.data.result;
      const nik = result.nik;
      const nama = result.nama;
      const jenisKelamin = result.jenis_kelamin;
      const alamat = result.alamat;
      const tempatLahir = result.tempat_lahir;
      const tanggalLahir = result.tanggal_lahir;
      const golonganDarah = result.golongan_darah;
      const rt = result.rt;
      const rw = result.rw;
      const kelurahan = result.kelurahan_atau_desa;
      const kecamatan = result.kecamatan;
      const agama = result.agama;
      const status = result.status_perkawinan;
      const pekerjaan = result.pekerjaan;
      const kewarganegaraan = result.kewarganegaraan;

      const newPerson = await prisma.person.create({
        data: {
          nik: nik,
          nama: nama,
          jenis_kelamin: jenisKelamin,
          alamat: alamat,
          tempat_lahir: tempatLahir,
          tanggal_lahir: tanggalLahir,
          gol_darah: golonganDarah,
          rt: rt,
          rw: rw,
          kelurahan: kelurahan,
          kecamatan: kecamatan,
          agama: agama,
          status: status,
          pekerjaan: pekerjaan,
          kewarganegaraan: kewarganegaraan
        }
      })

      // console.log(newPerson);

      return res.status(200).send({
        message: "Identity verified successfully",
        result: identityScore.data
      });
    } catch (error) {
      return res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    } finally {
      await prisma.$disconnect();
    }
  });
  


app.listen(port, () => {
    console.log(`Server listening on ${port}`);
})