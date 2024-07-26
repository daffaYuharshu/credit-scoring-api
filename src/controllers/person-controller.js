const express = require("express");
const prisma = require("../database/prisma");
const {
  addPerson,
  getAllPerson,
  getCountPerson,
} = require("../services/person-service");
const { uploadImage, preprocessImage } = require("../utils");
const ClientError = require("../exceptions/ClientError");

const router = express.Router();

router.post("/", async (req, res) => {
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

    const person = await addPerson(req, ktpName, selfieName);

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
