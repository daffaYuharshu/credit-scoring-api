const express = require("express");
const prisma = require("../database/prisma");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
     
  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
});

router.get("/:id", async (req, res) => {});

module.exports = router;