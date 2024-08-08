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
    orderBy: {
      created_at: "desc",
    },
  });
  return requests;
};

const findAllRequestByOwnerFilteredByJenisPermintaan = async (
  owner,
  size,
  skip,
  jenisPermintaan
) => {
  const requests = await prisma.request.findMany({
    where: {
      owner: owner,
      jenis_permintaan: {
        contains: jenisPermintaan,
        mode: "insensitive",
      },
    },
    take: size,
    skip: skip,
    orderBy: {
      created_at: "desc",
    },
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

const countRequestByOwnerFilteredByJenisPermintaan = async (
  owner,
  jenisPermintaan
) => {
  const count = await prisma.request.count({
    where: {
      owner: owner,
      jenis_permintaan: {
        contains: jenisPermintaan,
        mode: "insensitive",
      },
    },
  });
  return count;
};

module.exports = {
  createRequest,
  findAllRequestByOwner,
  findRequestById,
  countRequestByOwner,
  findAllRequestByOwnerFilteredByJenisPermintaan,
  countRequestByOwnerFilteredByJenisPermintaan,
};
