const prisma = require("../database/prisma");

const insertUser = async (email, hash, role) => {
  await prisma.user.create({
    data: {
      email: email,
      password: hash,
      role: role,
    },
  });
};

const findUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  return user;
};

const findUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  return user;
};

module.exports = { insertUser, findUserById, findUserByEmail };
