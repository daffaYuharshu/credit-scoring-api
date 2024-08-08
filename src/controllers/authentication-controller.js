const express = require("express");
const prisma = require("../database/prisma");
const {
  verifyUserCredential,
  verifyRefreshToken,
  deleteRefreshToken,
  renewAccessToken,
} = require("../services/authentication-service");
const ClientError = require("../exceptions/ClientError");

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send({
      error: "true",
      message: "Email atau password kosong",
    });
  }

  try {
    const { accessToken, refreshToken, expiresIn } = await verifyUserCredential(
      email,
      password
    );
    return res.status(201).send({
      error: false,
      message: `Login berhasil`,
      data: {
        accessToken,
        refreshToken,
        expiresIn,
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

router.put("/", async (req, res) => {
  const { refreshToken } = req.body;
  try {
    await verifyRefreshToken(refreshToken);
    const { accessToken, expiresIn } = await renewAccessToken(refreshToken);
    return res.status(200).send({
      error: false,
      message: "Akses token berhasil diperbarui",
      data: {
        accessToken,
        expiresIn,
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

router.delete("/", async (req, res) => {
  const { refreshToken } = req.body;
  try {
    await verifyRefreshToken(refreshToken);
    await deleteRefreshToken(refreshToken);
    return res.status(200).send({
      error: false,
      message: "Logout berhasil",
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
