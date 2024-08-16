const express = require("express");
const prisma = require("../database/prisma");
const {
  verifyAdmin,
  checkEmail,
  createUser,
  getUserProfileById,
  updateUserProfileByIdWithImage,
  updateUserProfileByIdWithoutImage,
} = require("../services/user-service");

const ClientError = require("../exceptions/ClientError");
const UsersValidator = require("../validator/users");
const { preprocessImage, uploadImage } = require("../utils");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const userId = req.userId;
    await verifyAdmin(userId);

    UsersValidator.validateUserPayload(req.body);
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).send({
        error: "true",
        message: "username, email, password, atau role belum diisi",
      });
    }
    await checkEmail(email);
    await createUser(username, email, password, role);
    return res.status(201).send({
      error: false,
      message: "Akun berhasil dibuat",
      result: {
        username,
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

router.get("/", async (req, res) => {
  const userId = req.userId;

  try {
    const user = await getUserProfileById(userId);
    return res.status(200).send({
      error: false,
      data: {
        user,
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

router.patch("/", async (req, res) => {
  const userId = req.userId;

  const { username } = req.body;

  if (req.files) {
    try {
      const { image } = req.files;

      const imageName = preprocessImage(image);
      await uploadImage(image, imageName, "./src/public/images/profile");

      await updateUserProfileByIdWithImage(req, userId, { username, imageName });
      return res.status(200).send({
        error: false,
        message: "Profil berhasil diperbarui",
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
  }

  try {
    await updateUserProfileByIdWithoutImage(userId, { username });
    return res.status(200).send({
      error: false,
      message: "Profil berhasil diperbarui",
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
