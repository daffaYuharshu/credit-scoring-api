const express = require("express");
const FileUpload = require("express-fileupload");
const axios = require("axios");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

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
  
    if (ktpSize > 2000000 || fotoSize > 2000000) {
      return res.status(422).send({
        message: "Image must be less than 2 MB",
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
    console.log(process.env.ML_API)
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
      
      // Debug log for ML API URL and payload
      console.log(`ML API URL: ${process.env.ML_API}`);
      console.log('Payload:', { ktpid: newKTP.id, selfieid: newFoto.id });
      // const getData = await axios.get(process.env.ML_API_GET)
      // let identityScoring;
      // try {
      //   identityScoring = await axios.post(process.env.ML_API, {
      //     ktpid: newKTP.id,
      //     selfieid: newFoto.id,
      //   });
      // } catch (error) {
      //   throw new Error('Error fetching identity scoring');
      // }
  
      return res.status(200).send({
        message: "Identity verified successfully",
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