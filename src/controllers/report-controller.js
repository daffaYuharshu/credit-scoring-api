const express = require("express");
const prisma = require("../database/prisma");
const {
  getAllReportByOwnerAndReqId,
  getAllReportByOwner,
  getCountReportByOwner,
  getCountReportByOwnerAndReqId,
  getAllReportByOwnerAndNIK,
  getCountReportByOwnerAndNIK,
  getAllReportByOwnerReqIdAndNIK,
  getCountReportByOwnerReqIdAndNIK,
  getReportByIdJoinPersonAndRequest,
  openReportPDF,
  generateReportPDF,
  downloadReportPDF,
  downloadReportPDFsZip,
  verifyReportAccess,
} = require("../services/report-service");

const ClientError = require("../exceptions/ClientError");

const router = express.Router();

router.get("/", async (req, res) => {
  const userId = req.userId;
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
      reports = await getAllReportByOwnerReqIdAndNIK(
        userId,
        size,
        skip,
        reqId,
        nik
      );
      totalReports = await getCountReportByOwnerReqIdAndNIK(userId, reqId, nik);
      totalPages = Math.ceil(totalReports / size);
    } else if (reqId) {
      reports = await getAllReportByOwnerAndReqId(userId, size, skip, reqId);
      totalReports = await getCountReportByOwnerAndReqId(userId, reqId);
      totalPages = Math.ceil(totalReports / size);
    } else if (nik) {
      reports = await getAllReportByOwnerAndNIK(userId, size, skip, nik);
      totalReports = await getCountReportByOwnerAndNIK(userId, nik);
      totalPages = Math.ceil(totalReports / size);
    } else {
      reports = await getAllReportByOwner(userId, size, skip);
      totalReports = await getCountReportByOwner(userId);
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
  const userId = req.userId;
  const { id } = req.params;
  try {
    const parseId = parseInt(id);
    const report = await getReportByIdJoinPersonAndRequest(parseId);
    const owner = report.owner;
    await verifyReportAccess(userId, owner);
    await openReportPDF(report);
    return res.status(200).send({
      error: false,
      message: "File PDF berhasil ditampilkan",
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
  const userId = req.userId;
  const { arrayOfIdReport } = req.body;
  if (!arrayOfIdReport || arrayOfIdReport.length === 0) {
    return res.status(400).send({
      error: true,
      message: "Laporan belum dipilih",
    });
  }
  try {
    let arrayOfReport = [];
    const firstPromises = arrayOfIdReport.map(async (id) => {
      const parseId = parseInt(id);
      const report = await getReportByIdJoinPersonAndRequest(parseId);
      const owner = report.owner;
      await verifyReportAccess(userId, owner);
      arrayOfReport.push(report);
    });

    await Promise.all(firstPromises);

    const pdfPaths = await Promise.all(
      arrayOfReport.map(async (report) => await generateReportPDF(report))
    );

    if (pdfPaths.length === 1) {
      await downloadReportPDF(res, pdfPaths);
    } else {
      await downloadReportPDFsZip(res, pdfPaths);
    }
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

module.exports = router;
