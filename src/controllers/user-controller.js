const express = require("express");
const prisma = require("../database/prisma");

const router = express.Router();

router.post("/", async (req, res) => {
  const userId = req.userId;
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).send({
      error: "true",
      message: "email, password, atau role belum diisi",
    });
  }
  try {
  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
});

module.exports = router;
