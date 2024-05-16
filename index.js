const express = require("express");
const FileUpload = require("express-fileupload");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(FileUpload());
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send(`Hello World`);
})

app.post("/identity", (req, res) => {
    if(req.files === undefined){
        return res.status(400).send({
            "message": "No File Uploaded"
        })
    }
    
    
    const ktp = req.files.ktp;
    const foto = req.files.foto;
    const selfie = req.files.selfie;

    if(!ktp || !foto){
        return res.status(400).send({
            "message": "KTP or Photo has not been uploaded"
        })
    }

    const ktpSize = ktp.data.length;
    const fotoSize = foto.data.length;
    
    const extKTP = path.extname(ktp.name);
    const extFoto = path.extname(foto.name);
    
    const ktpName = ktp.md5 + extKTP;
    const fotoName = foto.md5 + extFoto;
    const allowedType = ['.png', '.jpg'];

    const urlKTP = `${req.protocol}://${req.get("host")}/images/${ktpName}`;
    // console.log(urlKTP);
    const urlFoto = `${req.protocol}://${req.get("host")}/images/${fotoName}`;
    // console.log(urlFoto);
    
    
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

    const uploadImage = (images, imagesName) => {
        images.forEach((image, index) => {
            const imageName = imagesName[index];
            image.mv(`./public/images/${imageName}`, err => {
                if (err) return res.status(500).send({ "message": err.message });
                
            });
        })
        return res.status(200).send({
            "message": "Image has been uploaded"
        })
    };

    
    
    const images = [ktp, foto];
    const imageNames = [ktpName, fotoName];

    if(selfie){
        const selfieSize = selfie.data.length;
        const extSelfie = path.extname(selfie.name);
        const selfieName = selfie.md5 + extSelfie;
        const urlSelfie = `${req.protocol}://${req.get("host")}/images/${selfieName}`;
        // console.log(urlSelfie);

        if(!allowedType.includes(extSelfie.toLowerCase())){
            return res.status(422).send({
                "message": "Invalid Image Extension"
            })
        }

        if(selfieSize > 2000000){
            return res.status(422).send({
                "message": "Image must be less than 2 MB"
            })
        }

        images.push(selfie);
        imageNames.push(selfieName);
    }

    uploadImage(images, imageNames);

})


app.listen(port, () => {
    console.log(`Server listening on ${port}`);
})