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
    if(req.files === undefined){
        return res.status(400).send({
            "message": "No File Uploaded"
        })
    }
    
    
    const ktp = req.files.ktp;
    const foto = req.files.foto;
    // const selfie = req.files.selfie;

    if(!ktp || !foto){
        return res.status(400).send({
            "message": "KTP or Photo has not been uploaded"
        })
    }

    const ktpSize = ktp.data.length;
    const fotoSize = foto.data.length;
    // const selfieSize = selfie.data.length;

    const extKTP = path.extname(ktp.name);
    const extFoto = path.extname(foto.name);
    // const extSelfie = path.extname(selfie.name);

    const ktpName = ktp.md5 + extKTP;
    const fotoName = foto.md5 + extFoto;
    // const selfieName = selfie.md5 + ext;

    const urlKTP = `${req.protocol}://${req.get("host")}/images/${ktpName}`;
    // console.log(urlKTP);
    const urlFoto = `${req.protocol}://${req.get("host")}/images/${fotoName}`;
    // console.log(urlFoto);
    // const urlSelfie = `${req.protocol}://${req.get("host")}/images/${selfieName}`;
    // console.log(urlSelfie);

    const allowedType = ['.png', '.jpg'];
    
    if(!allowedType.includes(extKTP.toLowerCase()) || !allowedType.includes(extFoto.toLowerCase())){
        return res.status(422).send({
            "message": "Invalid Image Extension"
        })
    }

    if(ktpSize > 2000000 || fotoSize > 2000000){
        return res.status(422).send({
            "message": "Image must be less than 2 MB"
        })
    }

    const uploadImage = (image, imageName) => {
        return new Promise((resolve, reject) => {
          image.mv(`./public/images/${imageName}`, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      };


    try {
        await uploadImage(ktp, ktpName);
        await uploadImage(foto, fotoName);

        const newKTP = await prisma.kTP.create({
            data: {
                image: urlKTP
            }
        })
    
        const newFoto = await prisma.selfie.create({
            data: {
                image: urlFoto
            }
        })
    
        
        const identityScoring = await axios.post(`${process.env.ML_API}/api/ktpverification/`, {
            ktpid: newKTP.id,
            selfieid: newFoto.id
        })
        // const identityScoring = await axios.get(`${process.env.ML_API}/api/image/all/`)
        return res.status(200).send({
            message: "Identity verified successfully",
            identityScoring: identityScoring.data,
        });
    } catch (error) {
        return res.status(500).send({
            message: "Internal Server Error",
            error: error.message,
        });
    } finally {
        await prisma.$disconnect();
    }
    



})


app.listen(port, () => {
    console.log(`Server listening on ${port}`);
})