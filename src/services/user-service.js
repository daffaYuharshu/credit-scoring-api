const bcrypt = require("bcrypt");
const {
  insertUser,
  findUserByEmail,
  findUserById,
  editUserProfileById,
  editUserAccountById,
  editUserProfileByIdWithImage,
  editUserProfileByIdWithoutImage,
} = require("../repositories/user-repository");
const AuthorizationError = require("../exceptions/AuthorizationError");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");
const { user } = require("../database/prisma");

const createUser = async (username, email, password, role) => {
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, async (err, hash) => {
    if (err) {
      throw Error("Error hashing password");
    } else {
      await insertUser(username, email, hash, role);
    }
  });
};

const verifyAdmin = async (userId) => {
  const user = await findUserById(userId);
  if (user.role !== "admin") {
    throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
  }
};

const checkEmail = async (email) => {
  const user = await findUserByEmail(email);
  if (user) {
    throw new InvariantError("Email sudah digunakan");
  }
};

const getUserProfileById = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new NotFoundError("Profil tidak ditemukan");
  }
  return user;
};

const updateUserProfileByIdWithImage = async (
  req,
  userId,
  { username, imageName }
) => {
  const urlImage = `${req.protocol}://${req.get(
    "host"
  )}/images/profile/${imageName}`;
  await getUserProfileById(userId);
  await editUserProfileByIdWithImage(userId, { username, urlImage });
};

const updateUserProfileByIdWithoutImage = async (userId, { username }) => {
  await getUserProfileById(userId);
  await editUserProfileByIdWithoutImage(userId, { username });
};

const updateUserAccountById = async (userId, data) => {
  await getUserProfileById(userId);
  await editUserAccountById(userId, data);
};

module.exports = {
  createUser,
  verifyAdmin,
  checkEmail,
  getUserProfileById,
  updateUserProfileByIdWithImage,
  updateUserProfileByIdWithoutImage,
  updateUserAccountById,
};
