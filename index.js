const express = require("express");
const FileUpload = require("express-fileupload");
const axios = require("axios");
const dotenv = require("dotenv");
const csv = require('fast-csv');
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const FormData = require('form-data');
const { v4: uuidv4 } = require('uuid');

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

const csvDir = path.join(__dirname, "public", "csv");
if (!fs.existsSync(csvDir)) {
  fs.mkdirSync(csvDir, { recursive: true });
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

      const generateShortUUID = () => {
        let shortUUID;
        do {
          const uuid = uuidv4().replace(/-/g,'');
          shortUUID = uuid.substring(0, 8);
        } while (shortUUID.charAt(0) !== '0');
        return shortUUID;
      }

      const id = generateShortUUID();

      const newRequest = await prisma.request.create({
        data: {
          no: id,
          jenis_permintaan: "IDENTITAS",
          jumlah_customer: 1,
        }
      });


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
      const skorFR = result.SCORE_FR;
      const skor = () => {
        if(skorFR >= 0.9){
          return "Sangat Baik";
        } else if (skorFR >= 0.8){
          return "Baik";
        } else if (skorFR >= 0.7){
          return "Cukup Baik";
        } else if (skorFR >= 0.55){
          return "Buruk";
        } else {
          return "Sangat Buruk";
        }
      }

      const personIsExist = await prisma.person.findUnique({
        where: {
          nik: nik
        }
      })

      if(!personIsExist){
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
      }
      // console.log(newPerson);

      const newMyRequest = await prisma.myRequest.create({
        data: {
          nik: nik,
          nama: nama,
          skor: skor(),
          no_permintaan: id
        }
      })

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
  
app.post("/location", async (req, res) => {
  if (req.files === undefined) {
    return res.status(400).send({
      message: "No File Uploaded",
    });
  }

  const csvFile = req.files.csv;

  if (!csvFile) {
    return res.status(400).send({
      message: "CSV file has not been uploaded",
    });
  }

  const csvSize = csvFile.data.length;
  const extCSV = path.extname(csvFile.name);
  const csvName = csvFile.md5 + extCSV;
  const urlCSV = `${req.protocol}://${req.get("host")}/csv/${csvName}`;
  const allowedType = [".csv"];

  if (
    !allowedType.includes(extCSV.toLowerCase())
  ) {
    return res.status(422).send({
      message: "Invalid csv file Extension",
    });
  }

  if (csvSize > 5000000) {
    return res.status(422).send({
      message: "CSV file must be less than 5 MB",
    });
  }

  const uploadCSV = (csv, csvName) => {
    return new Promise((resolve, reject) => {
      const uploadPath = `./public/csv/${csvName}`;
      csv.mv(uploadPath, (err) => {
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
    await uploadCSV(csvFile, csvName);
    let result = [];
    fs.createReadStream(path.resolve(__dirname, `public/csv/${csvName}`))
      .pipe(csv.parse({ headers: true }))
      .on('error', error => console.error(error))
      .on('data', row => result.push(row))
      .on('end', () => {
        const data = Object.values(result[0]).toString();
        let dataArray = [];
        let currentData = '';
        let inQuotes = false; // variabel untuk melacak apakah sedang berada di dalam tanda kutip ganda

        for (let i = 0; i < data.length; i++) {
            if (data[i] === '"') {
                // Toggling nilai variabel inQuotes saat menemukan tanda kutip
                inQuotes = !inQuotes;
                continue; // Melanjutkan ke iterasi berikutnya tanpa menambahkan tanda kutip ke dataArray
            }

            if (!inQuotes && data[i] === ',') {
                // Jika tidak berada di dalam tanda kutip dan menemukan koma, tambahkan data ke dataArray
                dataArray.push(currentData);
                currentData = ''; // Mengosongkan currentData untuk data selanjutnya
            } else {
                currentData += data[i];
            }
        }


      
        // console.log(dataArray.length);
        // console.log(dataArray)
        const date = dataArray[0];
        // console.log(date)
        const time = dataArray[1];
        // console.log(time);
        const nama = dataArray[2];
        // console.log(nama);
        const alamat_ktp_plus_code = dataArray[3];
        // console.log(alamat_ktp_plus_code)
        const alamat_ktp_jalan = dataArray[4];
        // console.log(alamat_ktp_jalan)
        const alamat_ktp_kelurahan = dataArray[5];
        // console.log(alamat_ktp_kelurahan)
        const alamat_ktp_kecamatan = dataArray[6];
        // console.log(alamat_ktp_kecamatan)
        const alamat_ktp_kabupaten = dataArray[7];
        // console.log(alamat_ktp_kabupaten)
        const alamat_ktp_provinsi = dataArray[8];
        // console.log(alamat_ktp_provinsi)
        const alamat_ktp = dataArray[9];
        // console.log(alamat_ktp)
        const alamat_ktp_lat = dataArray[10];
        // console.log(alamat_ktp_lat)
        const alamat_ktp_lon = dataArray[11];
        // console.log(alamat_ktp_lon)
        const alamat_ktp_tipe_lokasi = dataArray[12];
        // console.log(alamat_ktp_tipe_lokasi)
        const alamat_ktp_place_id = dataArray[13];
        const alamat_ktp_jenis_jalan = dataArray[14];
        const alamat_ktp_pemilik_bangunan = dataArray[15];
        const alamat_ktp_lokasi_bangunan = dataArray[16];
        const alamat_domisili_plus_code = dataArray[17];
        const alamat_domisili_jalan = dataArray[18];
        const alamat_domisili_kelurahan = dataArray[19];
        const alamat_domisili_kecamatan = dataArray[20];
        const alamat_domisili_kabupaten = dataArray[21];
        const alamat_domisili_provinsi = dataArray[22];
        const alamat_domisili = dataArray[23];
        const alamat_domisili_lat = dataArray[24];
        const alamat_domisili_lon = dataArray[25];
        const alamat_domisili_tipe_lokasi = dataArray[26];
        const alamat_domisili_place_id = dataArray[27];
        const alamat_domisili_jenis_jalan = dataArray[28];
        const alamat_domisili_pemilik_bangunan = dataArray[29];
        const alamat_domisili_lokasi_bangunan = dataArray[30];
        const alamat_pekerjaan_plus_code = dataArray[31];
        const alamat_pekerjaan_jalan = dataArray[32];
        const alamat_pekerjaan_kelurahan = dataArray[33];
        const alamat_pekerjaan_kecamatan = dataArray[34];
        const alamat_pekerjaan_kabupaten = dataArray[35];
        const alamat_pekerjaan_provinsi = dataArray[36];
        const alamat_pekerjaan = dataArray[37];
        const alamat_pekerjaan_lat = dataArray[38];
        const alamat_pekerjaan_lon = dataArray[39];
        const alamat_pekerjaan_tipe_lokasi = dataArray[40];
        const alamat_pekerjaan_place_id = dataArray[41];
        const alamat_aset_plus_code = dataArray[42];
        const alamat_aset_jalan = dataArray[43];
        const alamat_aset_kelurahan = dataArray[44];
        const alamat_aset_kecamatan = dataArray[45];
        const alamat_aset_kabupaten = dataArray[46];
        const alamat_aset_provinsi = dataArray[47];
        const alamat_aset = dataArray[48];
        const alamat_aset_lat = dataArray[49];
        const alamat_aset_lon = dataArray[50];
        const alamat_aset_tipe_lokasi = dataArray[51];
        const alamat_aset_place_id = dataArray[52];
        const jenis_aset = dataArray[53];
        const nilai_aset = dataArray[54];
        const lokasi_saat_ini_lat = dataArray[55];
        const lokasi_saat_ini_lon = dataArray[56];
        const lokasi_bts_lat = dataArray[57];
        const lokasi_bts_lon = dataArray[58];
        const lokasi_check_in_digital_lat = dataArray[59];
        const lokasi_check_in_digital_lon = dataArray[60];
        const jenis_check_in_digital = dataArray[61];
        const lokasi_2_minggu_terakhir_lat = dataArray[62];
        const lokasi_2_minggu_terakhir_lon = dataArray[63];
        const lokasi_3_minggu_terakhir_lat = dataArray[64];
        const lokasi_3_minggu_terakhir_lon = dataArray[65];
        const lokasi_4_minggu_terakhir_lat = dataArray[66];
        const lokasi_4_minggu_terakhir_lon = dataArray[67];
        // console.log(lokasi_4_minggu_terakhir_lon)
        const credit_score = dataArray[68];
        // console.log(credit_score)
        // console.log(credit_score)

        const locationScore = axios.post(process.env.LOCATION_ML_API, {
          date,
          time,
          nama,
          alamat_ktp_plus_code,
          alamat_ktp_jalan,
          alamat_ktp_kelurahan,
          alamat_ktp_kecamatan,
          alamat_ktp_kabupaten,
          alamat_ktp_provinsi,
          alamat_ktp,
          alamat_ktp_lat,
          alamat_ktp_lon,
          alamat_ktp_tipe_lokasi,
          alamat_ktp_place_id,
          alamat_ktp_jenis_jalan,
          alamat_ktp_pemilik_bangunan,
          alamat_ktp_lokasi_bangunan,
          alamat_domisili_plus_code,
          alamat_domisili_jalan,
          alamat_domisili_kelurahan,
          alamat_domisili_kecamatan,
          alamat_domisili_kabupaten,
          alamat_domisili_provinsi,
          alamat_domisili,
          alamat_domisili_lat,
          alamat_domisili_lon,
          alamat_domisili_tipe_lokasi,
          alamat_domisili_place_id,
          alamat_domisili_jenis_jalan,
          alamat_domisili_pemilik_bangunan,
          alamat_domisili_lokasi_bangunan,
          alamat_pekerjaan_plus_code,
          alamat_pekerjaan_jalan,
          alamat_pekerjaan_kelurahan,
          alamat_pekerjaan_kecamatan,
          alamat_pekerjaan_kabupaten,
          alamat_pekerjaan_provinsi,
          alamat_pekerjaan,
          alamat_pekerjaan_lat,
          alamat_pekerjaan_lon,
          alamat_pekerjaan_tipe_lokasi,
          alamat_pekerjaan_place_id,
          alamat_aset_plus_code,
          alamat_aset_jalan,
          alamat_aset_kelurahan,
          alamat_aset_kecamatan,
          alamat_aset_kabupaten,
          alamat_aset_provinsi,
          alamat_aset,
          alamat_aset_lat,
          alamat_aset_lon,
          alamat_aset_tipe_lokasi,
          alamat_aset_place_id,
          jenis_aset,
          nilai_aset,
          lokasi_saat_ini_lat,
          lokasi_saat_ini_lon,
          lokasi_bts_lat,
          lokasi_bts_lon,
          lokasi_check_in_digital_lat,
          lokasi_check_in_digital_lon,
          jenis_check_in_digital,
          lokasi_2_minggu_terakhir_lat,
          lokasi_2_minggu_terakhir_lon,
          lokasi_3_minggu_terakhir_lat,
          lokasi_3_minggu_terakhir_lon,
          lokasi_4_minggu_terakhir_lat,
          lokasi_4_minggu_terakhir_lon,
          credit_score
        }).then(response => {
          const generateShortUUID = () => {
            let shortUUID;
            do {
              const uuid = uuidv4().replace(/-/g,'');
              shortUUID = uuid.substring(0, 8);
            } while (shortUUID.charAt(0) !== '0');
            return shortUUID;
          }
    
          const id = generateShortUUID();
    
          const newRequest = prisma.request.create({
            data: {
              no: id,
              jenis_permintaan: "LOKASI",
              jumlah_customer: 1,
            }
          }).then(response => {
            console.log("Uploaded")
          }).catch(err => {
            console.log(err);
          });
          return res.status(200).send({
            message: "Location verified successfully",
            result: response.data
          });
        }).catch(err => {
          console.log(err)
        })
      });  
  } catch (error) {
    console.log(error);
  }
})

app.post("/identityscoring", async (req, res) => {
  if (req.files === undefined) {
    return res.status(400).send({
      message: "No File Uploaded",
    });
  }

  const ktp = req.files.ktp;
  const foto = req.files.foto;
  const csvFile = req.files.csv;

  if (!ktp || !foto || !csvFile) {
    return res.status(400).send({
      message: "KTP, Photo or CSV file has not been uploaded",
    });
  }

  const ktpSize = ktp.data.length;
  const fotoSize = foto.data.length;
  const csvSize = csvFile.data.length;

  const extKTP = path.extname(ktp.name);
  const extFoto = path.extname(foto.name);
  const extCSV = path.extname(csvFile.name);

  const ktpName = ktp.md5 + extKTP;
  const fotoName = foto.md5 + extFoto;
  const csvName = csvFile.md5 + extCSV;

  const urlKTP = `${req.protocol}://${req.get("host")}/images/${ktpName}`;
  const urlFoto = `${req.protocol}://${req.get("host")}/images/${fotoName}`;
  const urlCSV = `${req.protocol}://${req.get("host")}/csv/${csvName}`;

  const allowedImageType = [".png", ".jpg"];
  const allowedCSVType = [".csv"];
  
  if (
    !allowedImageType.includes(extKTP.toLowerCase()) ||
    !allowedImageType.includes(extFoto.toLowerCase())
  ) {
    return res.status(422).send({
      message: "Invalid Image Extension",
    });
  }

  if (
    !allowedCSVType.includes(extCSV.toLowerCase())
  ) {
    return res.status(422).send({
      message: "Invalid csv file Extension",
    });
  }

  if (ktpSize > 1000000 || fotoSize > 1000000) {
    return res.status(422).send({
      message: "Image must be less than 1 MB",
    });
  }

  if (csvSize > 5000000) {
    return res.status(422).send({
      message: "CSV file must be less than 5 MB",
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
  
  const uploadCSV = (csv, csvName) => {
    return new Promise((resolve, reject) => {
      const uploadPath = `./public/csv/${csvName}`;
      csv.mv(uploadPath, (err) => {
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
    await uploadCSV(csvFile, csvName);

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
    
    const ktpId = uploadKtp.data.data.image.id;
    const selfieId = uploadFoto.data.data.image.id;
    let result = [];

    fs.createReadStream(path.resolve(__dirname, `public/csv/${csvName}`))
      .pipe(csv.parse({ headers: true }))
      .on('error', error => console.error(error))
      .on('data', row => result.push(row))
      .on('end', () => {
        const data = Object.values(result[0]).toString();
        let dataArray = [];
        let currentData = '';
        let inQuotes = false; // variabel untuk melacak apakah sedang berada di dalam tanda kutip ganda

        for (let i = 0; i < data.length; i++) {
            if (data[i] === '"') {
                // Toggling nilai variabel inQuotes saat menemukan tanda kutip
                inQuotes = !inQuotes;
                continue; // Melanjutkan ke iterasi berikutnya tanpa menambahkan tanda kutip ke dataArray
            }

            if (!inQuotes && data[i] === ',') {
                // Jika tidak berada di dalam tanda kutip dan menemukan koma, tambahkan data ke dataArray
                dataArray.push(currentData);
                currentData = ''; // Mengosongkan currentData untuk data selanjutnya
            } else {
                currentData += data[i];
            }
        }

        // console.log(dataArray.length);
        // console.log(dataArray)
        const date = dataArray[0];
        // console.log(date)
        const time = dataArray[1];
        // console.log(time);
        const nama = dataArray[2];
        // console.log(nama);
        const alamat_ktp_plus_code = dataArray[3];
        // console.log(alamat_ktp_plus_code)
        const alamat_ktp_jalan = dataArray[4];
        // console.log(alamat_ktp_jalan)
        const alamat_ktp_kelurahan = dataArray[5];
        // console.log(alamat_ktp_kelurahan)
        const alamat_ktp_kecamatan = dataArray[6];
        // console.log(alamat_ktp_kecamatan)
        const alamat_ktp_kabupaten = dataArray[7];
        // console.log(alamat_ktp_kabupaten)
        const alamat_ktp_provinsi = dataArray[8];
        // console.log(alamat_ktp_provinsi)
        const alamat_ktp = dataArray[9];
        // console.log(alamat_ktp)
        const alamat_ktp_lat = dataArray[10];
        // console.log(alamat_ktp_lat)
        const alamat_ktp_lon = dataArray[11];
        // console.log(alamat_ktp_lon)
        const alamat_ktp_tipe_lokasi = dataArray[12];
        // console.log(alamat_ktp_tipe_lokasi)
        const alamat_ktp_place_id = dataArray[13];
        const alamat_ktp_jenis_jalan = dataArray[14];
        const alamat_ktp_pemilik_bangunan = dataArray[15];
        const alamat_ktp_lokasi_bangunan = dataArray[16];
        const alamat_domisili_plus_code = dataArray[17];
        const alamat_domisili_jalan = dataArray[18];
        const alamat_domisili_kelurahan = dataArray[19];
        const alamat_domisili_kecamatan = dataArray[20];
        const alamat_domisili_kabupaten = dataArray[21];
        const alamat_domisili_provinsi = dataArray[22];
        const alamat_domisili = dataArray[23];
        const alamat_domisili_lat = dataArray[24];
        const alamat_domisili_lon = dataArray[25];
        const alamat_domisili_tipe_lokasi = dataArray[26];
        const alamat_domisili_place_id = dataArray[27];
        const alamat_domisili_jenis_jalan = dataArray[28];
        const alamat_domisili_pemilik_bangunan = dataArray[29];
        const alamat_domisili_lokasi_bangunan = dataArray[30];
        const alamat_pekerjaan_plus_code = dataArray[31];
        const alamat_pekerjaan_jalan = dataArray[32];
        const alamat_pekerjaan_kelurahan = dataArray[33];
        const alamat_pekerjaan_kecamatan = dataArray[34];
        const alamat_pekerjaan_kabupaten = dataArray[35];
        const alamat_pekerjaan_provinsi = dataArray[36];
        const alamat_pekerjaan = dataArray[37];
        const alamat_pekerjaan_lat = dataArray[38];
        const alamat_pekerjaan_lon = dataArray[39];
        const alamat_pekerjaan_tipe_lokasi = dataArray[40];
        const alamat_pekerjaan_place_id = dataArray[41];
        const alamat_aset_plus_code = dataArray[42];
        const alamat_aset_jalan = dataArray[43];
        const alamat_aset_kelurahan = dataArray[44];
        const alamat_aset_kecamatan = dataArray[45];
        const alamat_aset_kabupaten = dataArray[46];
        const alamat_aset_provinsi = dataArray[47];
        const alamat_aset = dataArray[48];
        const alamat_aset_lat = dataArray[49];
        const alamat_aset_lon = dataArray[50];
        const alamat_aset_tipe_lokasi = dataArray[51];
        const alamat_aset_place_id = dataArray[52];
        const jenis_aset = dataArray[53];
        const nilai_aset = dataArray[54];
        const lokasi_saat_ini_lat = dataArray[55];
        const lokasi_saat_ini_lon = dataArray[56];
        const lokasi_bts_lat = dataArray[57];
        const lokasi_bts_lon = dataArray[58];
        const lokasi_check_in_digital_lat = dataArray[59];
        const lokasi_check_in_digital_lon = dataArray[60];
        const jenis_check_in_digital = dataArray[61];
        const lokasi_2_minggu_terakhir_lat = dataArray[62];
        const lokasi_2_minggu_terakhir_lon = dataArray[63];
        const lokasi_3_minggu_terakhir_lat = dataArray[64];
        const lokasi_3_minggu_terakhir_lon = dataArray[65];
        const lokasi_4_minggu_terakhir_lat = dataArray[66];
        const lokasi_4_minggu_terakhir_lon = dataArray[67];
        // console.log(lokasi_4_minggu_terakhir_lon)
        const credit_score = dataArray[68];
        // console.log(credit_score)
        // console.log(credit_score)

        const locationScore = axios.post(process.env.IDENTITY_LOCATION_ML, {
          ktpid: ktpId,
          selfieid: selfieId,
          data: {
            date,
            time,
            nama,
            alamat_ktp_plus_code,
            alamat_ktp_jalan,
            alamat_ktp_kelurahan,
            alamat_ktp_kecamatan,
            alamat_ktp_kabupaten,
            alamat_ktp_provinsi,
            alamat_ktp,
            alamat_ktp_lat,
            alamat_ktp_lon,
            alamat_ktp_tipe_lokasi,
            alamat_ktp_place_id,
            alamat_ktp_jenis_jalan,
            alamat_ktp_pemilik_bangunan,
            alamat_ktp_lokasi_bangunan,
            alamat_domisili_plus_code,
            alamat_domisili_jalan,
            alamat_domisili_kelurahan,
            alamat_domisili_kecamatan,
            alamat_domisili_kabupaten,
            alamat_domisili_provinsi,
            alamat_domisili,
            alamat_domisili_lat,
            alamat_domisili_lon,
            alamat_domisili_tipe_lokasi,
            alamat_domisili_place_id,
            alamat_domisili_jenis_jalan,
            alamat_domisili_pemilik_bangunan,
            alamat_domisili_lokasi_bangunan,
            alamat_pekerjaan_plus_code,
            alamat_pekerjaan_jalan,
            alamat_pekerjaan_kelurahan,
            alamat_pekerjaan_kecamatan,
            alamat_pekerjaan_kabupaten,
            alamat_pekerjaan_provinsi,
            alamat_pekerjaan,
            alamat_pekerjaan_lat,
            alamat_pekerjaan_lon,
            alamat_pekerjaan_tipe_lokasi,
            alamat_pekerjaan_place_id,
            alamat_aset_plus_code,
            alamat_aset_jalan,
            alamat_aset_kelurahan,
            alamat_aset_kecamatan,
            alamat_aset_kabupaten,
            alamat_aset_provinsi,
            alamat_aset,
            alamat_aset_lat,
            alamat_aset_lon,
            alamat_aset_tipe_lokasi,
            alamat_aset_place_id,
            jenis_aset,
            nilai_aset,
            lokasi_saat_ini_lat,
            lokasi_saat_ini_lon,
            lokasi_bts_lat,
            lokasi_bts_lon,
            lokasi_check_in_digital_lat,
            lokasi_check_in_digital_lon,
            jenis_check_in_digital,
            lokasi_2_minggu_terakhir_lat,
            lokasi_2_minggu_terakhir_lon,
            lokasi_3_minggu_terakhir_lat,
            lokasi_3_minggu_terakhir_lon,
            lokasi_4_minggu_terakhir_lat,
            lokasi_4_minggu_terakhir_lon,
            credit_score
          }
          
        }).then(response => {
          const generateShortUUID = () => {
            let shortUUID;
            do {
              const uuid = uuidv4().replace(/-/g,'');
              shortUUID = uuid.substring(0, 8);
            } while (shortUUID.charAt(0) !== '0');
            return shortUUID;
          }
    
          const id = generateShortUUID();
    
          const newRequest = prisma.request.create({
            data: {
              no: id,
              jenis_permintaan: "IDENTITAS DAN LOKASI",
              jumlah_customer: 1,
            }
          }).then(response => {
            console.log("Uploaded")
          }).catch(err => {
            console.log(err);
          });;

          return res.status(200).send({
            message: "Credit scoring predicted successfully",
            result: response.data
          });
        }).catch(err => {
          console.log(err)
        })
      });  
  } catch (error) {
    console.log(error)
  }
  
})


app.listen(port, () => {
    console.log(`Server listening on ${port}`);
})