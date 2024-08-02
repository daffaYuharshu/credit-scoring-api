const express = require("express");
const prisma = require("../database/prisma");
const {
  verifyAdmin,
  checkEmail,
  createUser,
} = require("../services/user-service");

const ClientError = require("../exceptions/ClientError");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const userId = req.userId;
    await verifyAdmin(userId);

    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).send({
        error: "true",
        message: "email, password, atau role belum diisi",
      });
    }
    await checkEmail(email);
    await createUser(email, password, role);
    return res.status(200).send({
      error: false,
      message: "Akun berhasil dibuat",
      result: {
        email,
        role,
      },
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
