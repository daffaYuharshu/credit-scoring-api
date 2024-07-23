const express = require("express");
const prisma = require("../database/prisma");
const moment = require("moment");
const { uploadImage, preprocessImage, addPerson, scoringIdentity, getAllPerson, getAllRequest, getPersonByNIK, getAllReportByReqId, postRequest, getCountPerson, getCountRequest, updateReqIdByNoReport, getAllReport, getCountReport, getCountReportByReqId, getAllReportByNIK, getCountReportByNIK, getAllReportByReqIdAndNIK, getCountReportByReqIdAndNIK, getReportById, generateReportPDF } = require("../services/scoring-service");
const ClientError = require("../exceptions/ClientError");
const InvariantError = require("../exceptions/InvariantError");


const router = express.Router();

router.post("/upload", async (req, res) => {
    if (req.files === undefined) {
        return res.status(400).send({
            error: true,
            message: "Tidak ada file yang diupload",
        });
    }

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

        const person = await addPerson(req, ktpName, selfieName);
        
        return res.status(201).send({
            error: false,
            message: "Data berhasil ditambahkan",
            result: person
        });
    } catch (error) {
        if (error instanceof ClientError){
            return res.status(error.statusCode).send({
                error: true,
                message: error.message
            });
        }

        console.error(error.message);
        return res.status(500).send({
            error: true,
            message: "Internal Server Error"
        })
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
        message: "Data belum dipilih",
      })
    }
    try {
        let arrayOfMyReqId = []; 
        let arrayOfPerson = []  
        let result = []
        const firstPromises = arrayOfNIK.map(async (nik) => {
            const person = await getPersonByNIK(nik);
            arrayOfPerson.push(person);
        })

        await Promise.all(firstPromises);

        const secondPromises = arrayOfPerson.map(async (person) => {
            const report = await scoringIdentity(person);
            const no = report.no;
            const nama = report.nama;
            const jenisPermintaan = report.jenis_permintaan;
            const skor = report.skor;
            const reportResult = {
                no: no,
                nama: nama,
                jenis_permintaan: jenisPermintaan,
                skor: skor
            }
            result.push(reportResult)
            arrayOfMyReqId.push(no);
        })

        await Promise.all(secondPromises);
        // console.log(arrayOfMyReqId)
        const finishedAt = moment(new Date().toISOString()).format('DD/MM/YY HH:mm:ss');
        const reqId = await postRequest(sumOfNIK, finishedAt);
        
        arrayOfMyReqId.forEach(async (no) => {
            await updateReqIdByNoReport(no, reqId)
        })

        return res.status(200).send({
            error: false,
            message: "AI Scoring berhasil",
            result: result
        });
    } catch (error) {
        if (error instanceof ClientError){
            return res.status(error.statusCode).send({
                error: true,
                message: error.message
            });
        }

        console.error(error.message);
        return res.status(500).send({
            error: true,
            message: "Internal Server Error"
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
            data: {
                persons: persons
            },
            page: {
                size: size,
                total: totalPersons,
                totalPages: totalPages,
                current: current
            }
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).send({
            error: true,
            message: "Internal Server Error"
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
            data: {
                requests: requests
            },
            page: {
                size: size,
                total: totalRequests,
                totalPages: totalPages,
                current: current
            }
        });
      } catch (error) {
        console.error(error.message);
        return res.status(500).send({
            error: true,
            message: "Internal Server Error"
        })
      } finally {
        await prisma.$disconnect();
      }
})

router.get("/reports", async(req, res) => {
    const reqId = req.query.reqId;
    const nik = req.query.nik;
    
    const size = parseInt(req.query.size) || 5;
    const current = parseInt(req.query.current) || 1;
    const skip = (current - 1) * size;

    let reports;
    let totalReports;
    let totalPages
    try {
        if(reqId && nik) {
            reports = await getAllReportByReqIdAndNIK(size, skip, reqId, nik);
            totalReports = await getCountReportByReqIdAndNIK(reqId, nik);
            totalPages = Math.ceil(totalReports / size);
        }else if(reqId){
            reports = await getAllReportByReqId(size, skip, reqId);
            totalReports = await getCountReportByReqId(reqId);
            totalPages = Math.ceil(totalReports / size);
        }else if (nik) {
            reports = await getAllReportByNIK(size, skip, nik);
            totalReports = await getCountReportByNIK(nik);
            totalPages = Math.ceil(totalReports / size);
        }else {
            reports = await getAllReport(size, skip);
            totalReports = await getCountReport();
            totalPages = Math.ceil(totalReports / size);
        }
        
        return res.status(200).send({
            error: false,
            data: {
                reports: reports
            },
            page: {
                size: size,
                total: totalReports,
                totalPages: totalPages,
                current: current
            }
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).send({
            error: true,
            message: "Internal Server Error"
        })
    } finally {
        await prisma.$disconnect();
    }
})

router.get("/reports-pdf", async (req, res) => {
    try {
        await generateReportPDF('<h1>Hello World2!</h1>', 'output2.pdf');
        console.log('Selesai')
    } catch (error) {
        if (error instanceof ClientError){
            return res.status(error.statusCode).send({
                error: true,
                message: error.message
            });
        }

        console.error(error.message);
        return res.status(500).send({
            error: true,
            message: "Internal Server Error"
        })
    }
    
    // const { arrayOfIdReport } = req.body;
    // const sumOfIdReport = arrayOfIdReport.length;
    // if(sumOfIdReport === 0) {
    //     return res.status(400).send({
    //     error: true,
    //     message: "Laporan belum dipilih",
    //     })
    // }

    // try {
    //     let arrayOfReport = [];
    //     const firstPromises = arrayOfIdReport.map(async (id) => {
    //         const parseId = parseInt(id);
    //         const report = await getReportById(parseId);
    //         arrayOfReport.push(report);
    //     })

    //     await Promise.all(firstPromises);

    //     const secondPromises = arrayOfReport.map(async (report) => {
    //         // console.log(report);
    //         generateReportPDF(report);
    //     });

    //     await Promise.all(secondPromises);
    // } catch (error) {
    //     if (error instanceof ClientError){
    //         return res.status(error.statusCode).send({
    //             error: true,
    //             message: error.message
    //         });
    //     }

    //     console.error(error.message);
    //     return res.status(500).send({
    //         error: true,
    //         message: "Internal Server Error"
    //     })
    // } finally {
    //     await prisma.$disconnect();
    // }
})

module.exports = router;