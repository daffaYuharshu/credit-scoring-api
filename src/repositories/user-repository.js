const prisma = require("../database/prisma");

const insertUser = async (email, hash) => {
  await prisma.user.create({
    data: {
      email: email,
      password: hash,
    },
  });
};

const findUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  return user;
};

module.exports = { insertUser, findUserByEmail };
