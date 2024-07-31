const prisma = require("../database/prisma");

const createRefreshToken = async (token) => {
  await prisma.authentication.create({
    data: {
      token: token,
    },
  });
};

const findRefreshToken = async (token) => {
  const refreshToken = await prisma.authentication.findUnique({
    where: {
      token: token,
    },
  });
  return refreshToken;
};

const removeRefreshToken = async (token) => {
  await prisma.authentication.delete({
    where: {
      token: token,
    },
  });
};

module.exports = { createRefreshToken, findRefreshToken, removeRefreshToken };
