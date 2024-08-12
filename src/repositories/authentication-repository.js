const prisma = require("../database/prisma");

const createAuthentication = async (userAgent, ipAddress, token) => {
  await prisma.authentication.create({
    data: {
      user_agent: userAgent,
      ip_address: ipAddress,
      token: token,
    },
  });
};

const findAuthentication = async (token) => {
  const refreshToken = await prisma.authentication.findUnique({
    where: {
      token: token,
    },
  });
  return refreshToken;
};

const removeAuthentication = async (token) => {
  await prisma.authentication.delete({
    where: {
      token: token,
    },
  });
};

module.exports = {
  createAuthentication,
  findAuthentication,
  removeAuthentication,
};
