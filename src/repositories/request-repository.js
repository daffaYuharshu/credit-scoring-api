const prisma = require("../database/prisma");

const createRequest = async (
  id,
  jenisPermintaan,
  jumlahCustomer,
  createdAt,
  finishedAt,
  userId
) => {
  const newRequest = await prisma.request.create({
    data: {
      id: id,
      jenis_permintaan: jenisPermintaan,
      jumlah_customer: jumlahCustomer,
      created_at: createdAt,
      finished_at: finishedAt,
      owner: userId,
    },
  });

  return newRequest;
};

const findAllRequestByOwner = async (owner, size, skip) => {
  const requests = await prisma.request.findMany({
    where: {
      owner: owner,
    },
    take: size,
    skip: skip,
  });
  return requests;
};

const findRequestById = async (id) => {
  const request = await prisma.request.findUnique({
    where: {
      id: id,
    },
  });
  return request;
};

const countRequestByOwner = async (owner) => {
  const count = await prisma.request.count({
    where: {
      owner: owner,
    },
  });
  return count;
};

module.exports = {
  createRequest,
  findAllRequestByOwner,
  findRequestById,
  countRequestByOwner,
};
