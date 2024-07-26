const express = require("express");
const prisma = require("../database/prisma");
const {
  getAllReportByReqId,
  getAllReport,
  getCountReport,
  getCountReportByReqId,
  getAllReportByNIK,
  getCountReportByNIK,
  getAllReportByReqIdAndNIK,
  getCountReportByReqIdAndNIK,
  getReportById,
  generateReportPDF,
  getReportByIdJoinPersonAndRequest,
} = require("../services/report-service");
const ClientError = require("../exceptions/ClientError");

const router = express.Router();

router.get("/", async (req, res) => {
  const reqId = req.query.reqId;
  const nik = req.query.nik;

  const size = parseInt(req.query.size) || 5;
  const current = parseInt(req.query.current) || 1;
  const skip = (current - 1) * size;

  let reports;
  let totalReports;
  let totalPages;
  try {
    if (reqId && nik) {
      reports = await getAllReportByReqIdAndNIK(size, skip, reqId, nik);
      totalReports = await getCountReportByReqIdAndNIK(reqId, nik);
      totalPages = Math.ceil(totalReports / size);
    } else if (reqId) {
      reports = await getAllReportByReqId(size, skip, reqId);
      totalReports = await getCountReportByReqId(reqId);
      totalPages = Math.ceil(totalReports / size);
    } else if (nik) {
      reports = await getAllReportByNIK(size, skip, nik);
      totalReports = await getCountReportByNIK(nik);
      totalPages = Math.ceil(totalReports / size);
    } else {
      reports = await getAllReport(size, skip);
      totalReports = await getCountReport();
      totalPages = Math.ceil(totalReports / size);
    }

    return res.status(200).send({
      error: false,
      data: {
        reports: reports,
      },
      page: {
        size: size,
        total: totalReports,
        totalPages: totalPages,
        current: current,
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send({
      error: true,
      message: "Internal Server Error",
    });
  } finally {
    await prisma.$disconnect();
  }
});

router.get("/pdf/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const parseId = parseInt(id);
    const report = await getReportByIdJoinPersonAndRequest(parseId);
    await generateReportPDF(report);
    return res.status(200).send({
      error: false,
      message: "Laporan PDF berhasil ditampilkan",
    });
  } catch (error) {
    if (error instanceof ClientError) {
      return res.status(error.statusCode).send({
        error: true,
        message: error.message,
      });
    }

    console.error(error.message);
    return res.status(500).send({
      error: true,
      message: "Internal Server Error",
    });
  } finally {
    await prisma.$disconnect();
  }
});

router.get("/pdf", async (req, res) => {
  const { arrayOfIdReport } = req.body;
  if (!arrayOfIdReport) {
    return res.status(400).send({
      error: true,
      message: "Laporan belum dipilih",
    });
  }
  const sumOfIdReport = arrayOfIdReport.length;
  if (sumOfIdReport === 0) {
    return res.status(400).send({
      error: true,
      message: "Laporan belum dipilih",
    });
  }
  try {
    let arrayOfReport = [];
    const firstPromises = arrayOfIdReport.map(async (id) => {
      const parseId = parseInt(id);
      const report = await getReportById(parseId);
      arrayOfReport.push(report);
    });

    await Promise.all(firstPromises);

    const secondPromises = arrayOfReport.map(async (report) => {
      await generateReportPDF(report);
    });

    await Promise.all(secondPromises);

    return res.status(200).send({
      error: false,
      message: "Selesai",
    });
  } catch (error) {
    if (error instanceof ClientError) {
      return res.status(error.statusCode).send({
        error: true,
        message: error.message,
      });
    }

    console.error(error.message);
    return res.status(500).send({
      error: true,
      message: "Internal Server Error",
    });
  } finally {
    await prisma.$disconnect();
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
});

module.exports = router;
