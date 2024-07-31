const bcrypt = require("bcrypt");
const detenv = require("dotenv");
const { nanoid } = require("nanoid");
const {
  insertUser,
  findUserByEmail,
} = require("../repositories/user-repository");
const AuthorizationError = require("../exceptions/AuthorizationError");

dotenv.config();

const createUser = async () => {
  const email = `user+${nanoid(8)}@gmail.com`;
  const password = nanoid(8);

  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, async (err, hash) => {
    if (err) {
      throw Error("Error hashing password");
    } else {
      await insertUser(email, hash);
    }
  });
};

const verifyAdmin = async (email) => {
  const user = await findUserByEmail(email);
  if (user.email !== "admin@gmail.com") {
    throw AuthorizationError("Anda tidak berhak mengakses resource ini");
  }
};

module.exports = { createUser };
