const prisma = require("../database/prisma");

const insertUser = async (username, email, hash, role) => {
  await prisma.user.create({
    data: {
      username: username,
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
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      img_profile: true,
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

const editUserProfileByIdWithImage = async (userId, { username, urlImage }) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      username: username,
      img_profile: urlImage,
    },
  });
};

const editUserProfileByIdWithoutImage = async (userId, { username }) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      username: username,
    },
  });
};

const editUserAccountById = async (userId, data) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: data.password,
    },
  });
};

module.exports = {
  insertUser,
  findUserById,
  findUserByEmail,
  editUserProfileByIdWithImage,
  editUserProfileByIdWithoutImage,
  editUserAccountById,
};
