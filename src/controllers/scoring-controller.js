const express = require("express");
const prisma = require("../database/prisma");
const { preprocessImage, addPerson, scoringIdentity, getAllPerson, getAllRequest, getPersonByNIK, getRequestById, getAllMyRequestByReqId } = require("../services/scoring-service");


const router = express.Router();

router.post("/upload", async (req, res) => {
    if (req.files === undefined) {
        return res.status(400).send({
            message: "No File Uploaded",
        });
    }
    // console.log(req.files);

    const ktp = req.files.ktp;
    const selfie = req.files.selfie;

    if (!ktp || !selfie) {
        return res.status(400).send({
            message: "KTP or Photo has not been uploaded",
        });
    }

    const ktpName = preprocessImage(ktp);
    const selfieName = preprocessImage(selfie);
    // const ktpSize = ktp.data.length;
    // const fotoSize = foto.data.length;

    // const extKTP = path.extname(ktp.name);
    // const extFoto = path.extname(foto.name);

    // const ktpName = ktp.md5 + extKTP;
    // const fotoName = foto.md5 + extFoto;

    // const urlKTP = `${req.protocol}://${req.get("host")}/images/${ktpName}`;
    // const urlFoto = `${req.protocol}://${req.get("host")}/images/${fotoName}`;

    // const allowedType = [".png", ".jpg"];

    // if (
    //     !allowedType.includes(extKTP.toLowerCase()) ||
    //     !allowedType.includes(extFoto.toLowerCase())
    // ) {
    //     return res.status(422).send({
    //     message: "Invalid Image Extension",
    //     });
    // }

    // if (ktpSize > 1000000 || fotoSize > 1000000) {
    //     return res.status(422).send({
    //     message: "Image must be less than 1 MB",
    //     });
    // }

    // const uploadImage = (image, imageName) => {
    //     return new Promise((resolve, reject) => {
    //     const uploadPath = `./public/images/${imageName}`;
    //     image.mv(uploadPath, (err) => {
    //         if (err) {
    //         reject(err);
    //         } else {
    //         // Check if file exists after upload
    //         fs.access(uploadPath, fs.constants.F_OK, (err) => {
    //             if (err) {
    //             reject(new Error('File not found after upload'));
    //             } else {
    //             resolve();
    //             }
    //         });
    //         }
    //     });
    //     });
    // };

    try {
        await uploadImage(ktp, ktpName);
        await uploadImage(selfie, selfieName);
        
        // console.log(newKTP.id)
        // console.log(newFoto.id)
        // Debug log for ML API URL and payload
        // console.log('Payload:', { ktpid: newKTP.id, selfieid: newFoto.id });

        await addPerson(ktpName, selfieName);
        // const ktpPath = path.join(__dirname, 'public', 'images', ktpName);
        // const selfiePath = path.join(__dirname, 'public', 'images', selfieName);

        // // Buat objek FormData
        // const formDataKTP = new FormData();
        // formDataKTP.append('image', fs.createReadStream(ktpPath));

        // const formDataSelfie = new FormData();
        // formDataSelfie.append('image', fs.createReadStream(selfiePath));

        // // Konfigurasi untuk mengirimkan FormData
        // const axiosConfig = {
        // headers: {
        //     ...formDataKTP.getHeaders() // Mendapatkan header dari FormData
        // }
        // };
    
        // const uploadKtp = await axios.post(process.env.UPLOAD_IMAGE_API, formDataKTP, axiosConfig);
        // const uploadSelfie = await axios.post(process.env.UPLOAD_IMAGE_API, formDataSelfie, axiosConfig);
    
        // const ktpId = uploadKtp.data.data.image.id;
        // const selfieId = uploadSelfie.data.data.image.id;

        // const identityScore = await axios.post(process.env.ML_API, {
        // ktpid: ktpId,
        // selfieid: selfieId
        // })
        
        // const removeKtp = await axios.delete(process.env.DELETE_DB_API, {
        // data: {
        //     id: ktpId
        // }
        // })
        // const removeFoto = await axios.delete(process.env.DELETE_DB_API, {
        // data: {
        //     id: selfieId
        // }
        // })

        // const result = identityScore.data.data.result;
        // const nik = result.nik;
        // const nama = result.nama;
        // const jenisKelamin = result.jenis_kelamin;
        // const alamat = result.alamat;
        // const tempatLahir = result.tempat_lahir;
        // const tanggalLahir = result.tanggal_lahir;
        // const golonganDarah = result.golongan_darah;
        // const rt = result.rt;
        // const rw = result.rw;
        // const kelurahan = result.kelurahan_atau_desa;
        // const kecamatan = result.kecamatan;
        // const agama = result.agama;
        // const status = result.status_perkawinan;
        // const pekerjaan = result.pekerjaan;
        // const kewarganegaraan = result.kewarganegaraan;
        // const skorFR = result.SCORE_FR;
        // const skor = () => {
        // if(skorFR >= 0.9){
        //     return "Sangat Baik";
        // } else if (skorFR >= 0.8){
        //     return "Baik";
        // } else if (skorFR >= 0.7){
        //     return "Cukup Baik";
        // } else if (skorFR >= 0.55){
        //     return "Buruk";
        // } else {
        //     return "Sangat Buruk";
        // }
        // }
        // // console.log(nik)
        

        // const personIsExist = await prisma.person.findUnique({
        // where: {
        //     nik: nik
        // }
        // })

        // if(!personIsExist){
        // const newPerson = await prisma.person.create({
        //     data: {
        //     nik: nik,
        //     nama: nama,
        //     jenis_kelamin: jenisKelamin,
        //     alamat: alamat,
        //     tempat_lahir: tempatLahir,
        //     tanggal_lahir: tanggalLahir,
        //     gol_darah: golonganDarah,
        //     rt: rt,
        //     rw: rw,
        //     kelurahan: kelurahan,
        //     kecamatan: kecamatan,
        //     agama: agama,
        //     status: status,
        //     pekerjaan: pekerjaan,
        //     kewarganegaraan: kewarganegaraan,
        //     image_ktp: ktpPath,
        //     image_selfie: fotoPath
        //     }
        // })
        
        return res.status(200).send({
            error: false,
            message: "Data succefully added",
            result: newPerson.data
        });
        // } else {
        // return res.status(400).send({
        //     error: true,
        //     message: "Data already added"
        // });
        // }
        // console.log(newPerson);

        
    } catch (error) {
        return res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
        });
    } finally {
        await prisma.$disconnect();
    }
})

router.post("identity", async (req, res) => {
    const { nik } = req.body;
    if(!nik) {
      return res.status(400).send({
        error: true,
        message: "Please select one person"
      })
    }
    try {
        const person = await getPersonByNIK(nik);

        const result = await scoringIdentity(person);

        return res.status(200).send({
            error: false,
            message: "Identity verified successfully",
            result: result
        });
    } catch (error) {
        return res.status(500).send({
            error: true,
            message: error.message
          })
    } finally {
        await prisma.$disconnect();
    }
})

router.get("/persons", async (req, res) => {
    try {
        const persons = await getAllPerson();
        return res.status(200).send(persons);
    } catch (error) {
        return res.status(500).send({
            error: true,
            message: error.message
        })
    } finally {
        await prisma.$disconnect();
    }  
})

router.get("/requests", async(req, res) => {
    try {
        const requests = await getAllRequest();
        return res.status(200).send(requests);
      } catch (error) {
        return res.status(500).send({
          error: true,
          message: error.message
        })
      } finally {
        await prisma.$disconnect();
      }
})

router.get("/myrequest/:reqId", async(req, res) => {
    const { reqId } = req.params;
    if(!reqId) {
        return res.status(400).send({
            error: true,
            message: "Request not selected"
        })
    }

    try {
        const requestIsExist = await getRequestById(reqId);

        const myRequest = await getAllMyRequestByReqId(reqId);
        return res.status(200).send(myRequest);
    } catch (error) {
        return res.status(500).send({
        error: true,
        message: error.message
        })
    } finally {
        await prisma.$disconnect();
    }
})

module.exports = router;