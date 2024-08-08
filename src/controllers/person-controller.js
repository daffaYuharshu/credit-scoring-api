const express = require("express");
const prisma = require("../database/prisma");
const {
  addPerson,
  getAllPersonByOwner,
  getCountPersonByOwner,
  userId,
  getAllPersonByOwnerHaveReports,
  getCountPersonByOwnerHaveReports,
  getAllPersonByOwnerHaveReportsFilteredByNIK,
  getCountPersonByOwnerHaveReportsFilteredByNIK,
  getAllPersonByOwnerHaveReportsFilteredByNama,
  getCountPersonByOwnerHaveReportsFilteredByNama,
} = require("../services/person-service");
const { uploadImage, preprocessImage } = require("../utils");
const ClientError = require("../exceptions/ClientError");

const router = express.Router();

router.post("/", async (req, res) => {
  const userId = req.userId;

  if (req.files === undefined || req.files === null) {
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

    const person = await addPerson(req, ktpName, selfieName, userId);

    return res.status(201).send({
      error: false,
      message: "Data berhasil ditambahkan",
      result: person,
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

router.get("/", async (req, res) => {
  const userId = req.userId;
  const size = parseInt(req.query.size) || 5;
  const current = parseInt(req.query.current) || 1;
  const skip = (current - 1) * size;
  const reports = req.query.reports ? JSON.parse(req.query.reports) : false;
  const { nik, nama } = req.query;

  let persons;
  let totalPersons;
  let totalPages;

  try {
    if (reports) {
      if (nik) {
        persons = await getAllPersonByOwnerHaveReportsFilteredByNIK(
          userId,
          size,
          skip,
          nik
        );
        totalPersons = await getCountPersonByOwnerHaveReportsFilteredByNIK(
          userId,
          nik
        );
        totalPages = Math.ceil(totalPersons / size);
      } else if (nama) {
        persons = await getAllPersonByOwnerHaveReportsFilteredByNama(
          userId,
          size,
          skip,
          nama
        );
        totalPersons = await getCountPersonByOwnerHaveReportsFilteredByNama(
          userId,
          nama
        );
        totalPages = Math.ceil(totalPersons / size);
      } else {
        persons = await getAllPersonByOwnerHaveReports(userId, size, skip);
        totalPersons = await getCountPersonByOwnerHaveReports(userId);
        totalPages = Math.ceil(totalPersons / size);
      }
    } else {
      persons = await getAllPersonByOwner(userId, size, skip);
      totalPersons = await getCountPersonByOwner(userId);
      totalPages = Math.ceil(totalPersons / size);
    }

    return res.status(200).send({
      error: false,
      data: {
        persons: persons,
      },
      page: {
        size: size,
        total: totalPersons,
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

module.exports = router;
