const bcrypt = require("bcrypt");
const {
  insertUser,
  findUserByEmail,
  findUserById,
} = require("../repositories/user-repository");
const AuthorizationError = require("../exceptions/AuthorizationError");
const InvariantError = require("../exceptions/InvariantError");

const createUser = async (email, password, role) => {
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, async (err, hash) => {
    if (err) {
      throw Error("Error hashing password");
    } else {
      await insertUser(email, hash, role);
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

module.exports = { createUser, verifyAdmin, checkEmail };
