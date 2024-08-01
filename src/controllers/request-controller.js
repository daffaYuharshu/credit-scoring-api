const express = require("express");
const prisma = require("../database/prisma");
const {
  getAllRequestByOwner,
  getCountRequestByOwner,
} = require("../services/request-service");

const router = express.Router();

router.get("/", async (req, res) => {
  const userId = req.userId;
  const size = parseInt(req.query.size) || 5;
  const current = parseInt(req.query.current) || 1;
  const skip = (current - 1) * size;
  try {
    const requests = await getAllRequestByOwner(userId, size, skip);
    const totalRequests = await getCountRequestByOwner(userId);
    const totalPages = Math.ceil(totalRequests / size);
    return res.status(200).send({
      error: false,
      data: {
        requests: requests,
      },
      page: {
        size: size,
        total: totalRequests,
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
