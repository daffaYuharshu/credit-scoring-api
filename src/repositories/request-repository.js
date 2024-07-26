const prisma = require("../database/prisma");

const createRequest = async (
  id,
  jenisPermintaan,
  jumlahCustomer,
  createdAt,
  finishedAt
) => {
  const newRequest = await prisma.request.create({
    data: {
      id: id,
      jenis_permintaan: jenisPermintaan,
      jumlah_customer: jumlahCustomer,
      created_at: createdAt,
      finished_at: finishedAt,
    },
  });

  return newRequest;
};

const findAllRequest = async (size, skip) => {
  const requests = await prisma.request.findMany({
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

const countRequest = async () => {
  const count = await prisma.request.count();
  return count;
};

module.exports = {
  createRequest,
  findAllRequest,
  findRequestById,
  countRequest,
};
