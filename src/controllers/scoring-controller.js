const express = require("express");
const prisma = require("../database/prisma");
const moment = require("moment");
const { uploadImage, preprocessImage, addPerson, scoringIdentity, getAllPerson, getAllRequest, getPersonByNIK, getRequestById, getAllMyRequestByReqId, postRequest, getCountPerson, getCountRequest } = require("../services/scoring-service");


const router = express.Router();

router.post("/upload", async (req, res) => {
    if (req.files === undefined) {
        return res.status(400).send({
            error: true,
            message: "Tidak ada file yang diupload",
        });
    }
    // console.log(req.files);

    const ktp = req.files.ktp;
    const selfie = req.files.selfie;

    if (!ktp || !selfie) {
        return res.status(400).send({
            error: true,
            message: "KTP atau Foto belum diupload",
        });
    }

    try {
        const ktpName = preprocessImage(ktp);
        const selfieName = preprocessImage(selfie);
        await uploadImage(ktp, ktpName);
        await uploadImage(selfie, selfieName);

        await addPerson(req, ktpName, selfieName);
        
        return res.status(201).send({
            error: false,
            message: "Data berhasil ditambahkan"
        });
    } catch (error) {
        return res.status(400).send({
            error: true,
            message: error.message
        });
    } finally {
        await prisma.$disconnect();
    }
})

router.post("/identity", async (req, res) => {
    const { arrayOfNIK } = req.body;
    const sumOfNIK = arrayOfNIK.length;
    if(sumOfNIK === 0) {
      return res.status(400).send({
        error: true,
        message: "Data belum dipilih"
      })
    }
    try {
        // let myReq = [];   
        const promises = arrayOfNIK.map(async (nik) => {
            const person = await getPersonByNIK(nik);
            await scoringIdentity(person);
            // myReq.push({nomorInduk, nama, skor})
        })

        await Promise.all(promises);
        
        const finishedAt = moment(new Date().toISOString()).format('DD/MM/YY HH:mm:ss');
        await postRequest(sumOfNIK, finishedAt);

        return res.status(200).send({
            error: false,
            message: "AI Scoring berhasil"
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
    const size = parseInt(req.query.size) || 5;
    const current = parseInt(req.query.current) || 1;
    const skip = (current - 1) * size;
    try {
        const persons = await getAllPerson(size, skip);
        const totalPersons = await getCountPerson();
        const totalPages = Math.ceil(totalPersons / size);
        return res.status(200).send({
            error: false,
            data: persons,
            page: {
                size: size,
                total: totalPersons,
                totalPages: totalPages,
                current: current
            }
        });
    } catch (error) {
        return res.status(400).send({
            error: true,
            message: error.message
        })
    } finally {
        await prisma.$disconnect();
    }  
})

router.get("/requests", async(req, res) => {
    const size = parseInt(req.query.size) || 5;
    const current = parseInt(req.query.current) || 1;
    const skip = (current - 1) * size;
    try {
        const requests = await getAllRequest(size, skip);
        const totalRequests = await getCountRequest();
        const totalPages = Math.ceil(totalRequests / size);
        return res.status(200).send({
            error: false,
            data: requests,
            page: {
                size: size,
                total: totalRequests,
                totalPages: totalPages,
                current: current
            }
        });
      } catch (error) {
        return res.status(400).send({
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
        return res.status(404).send({
            error: true,
            message: "Request belum dipilih"
        })
    }

    try {
        await getRequestById(reqId);
        const myRequest = await getAllMyRequestByReqId(reqId);
        return res.status(200).send(myRequest);
    } catch (error) {
        return res.status(404).send({
        error: true,
        message: error.message
        })
    } finally {
        await prisma.$disconnect();
    }
})

module.exports = router;