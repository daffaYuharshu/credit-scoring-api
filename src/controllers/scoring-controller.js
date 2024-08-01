const express = require("express");
const prisma = require("../database/prisma");
const moment = require("moment");
const { getPersonByUserIdAndNIK } = require("../services/person-service");
const { postRequest } = require("../services/request-service");
const { updateReportReqIdByIdReport } = require("../services/report-service");
const { scoringIdentity } = require("../services/scoring-service");
const ClientError = require("../exceptions/ClientError");

const router = express.Router();

router.post("/", async (req, res) => {
  const userId = req.userId;
  const { features } = req.query;
  const { arrayOfNIK } = req.body;
  const sumOfNIK = arrayOfNIK.length;
  if (sumOfNIK === 0) {
    return res.status(400).send({
      error: true,
      message: "Data belum dipilih",
    });
  }
  if (!features) {
    return res.status(400).send({
      error: true,
      message: "Fitur belum dipilih",
    });
  }
  try {
    let arrayOfPerson = [];
    let result = [];
    let jenisPermintaan;
    let report;

    const firstPromises = arrayOfNIK.map(async (nik) => {
      const person = await getPersonByUserIdAndNIK(userId, nik);
      arrayOfPerson.push(person);
    });

    await Promise.all(firstPromises);

    if (features.includes("identity")) {
      let arrayOfReportId = [];
      const secondPromises = arrayOfPerson.map(async (person) => {
        const idPerson = person.id;
        report = await scoringIdentity(person, userId, idPerson);
        jenisPermintaan = "AI Identity Scoring";
        const id = report.id;
        const nik = report.nik;
        const skor = report.skor;
        const nama = person.nama;
        const reportResult = {
          id: id,
          nik: nik,
          nama: nama,
          jenisPermintaan,
          skor: skor,
        };
        result.push(reportResult);
        arrayOfReportId.push(id);
      });
      await Promise.all(secondPromises);

      const finishedAt = moment(new Date().toISOString()).format(
        "DD/MM/YY HH:mm:ss"
      );
      const reqId = await postRequest(
        sumOfNIK,
        finishedAt,
        jenisPermintaan,
        userId
      );

      arrayOfReportId.forEach(async (id) => {
        await updateReportReqIdByIdReport(id, reqId);
      });
    } else {
      return res.status(400).send({
        error: true,
        message: "Fitur belum dipilih",
      });
    }

    return res.status(200).send({
      error: false,
      message: "Scoring berhasil",
      result: result,
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

module.exports = router;
