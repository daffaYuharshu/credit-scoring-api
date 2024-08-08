const express = require("express");
const prisma = require("../database/prisma");
const {
  getAllRequestByOwner,
  getCountRequestByOwner,
  getAllRequestByOwnerFilteredByJenisPermintaan,
  getCountRequestByOwnerFilteredByJenisPermintaan,
} = require("../services/request-service");

const router = express.Router();

router.get("/", async (req, res) => {
  const userId = req.userId;
  const size = parseInt(req.query.size) || 5;
  const current = parseInt(req.query.current) || 1;
  const skip = (current - 1) * size;
  const { permintaan } = req.query;

  let requests;
  let totalRequests;
  let totalPages;

  try {
    if (permintaan) {
      requests = await getAllRequestByOwnerFilteredByJenisPermintaan(
        userId,
        size,
        skip,
        permintaan
      );
      totalRequests = await getCountRequestByOwnerFilteredByJenisPermintaan(
        userId,
        permintaan
      );
      totalPages = Math.ceil(totalRequests / size);
    } else {
      requests = await getAllRequestByOwner(userId, size, skip);
      totalRequests = await getCountRequestByOwner(userId);
      totalPages = Math.ceil(totalRequests / size);
    }

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
