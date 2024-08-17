const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AuthenticationError = require("../exceptions/AuthenticationError");
const { findUserByEmail } = require("../repositories/user-repository");
const {
  createAuthentication,
  findAuthentication,
  removeAuthentication,
} = require("../repositories/authentication-repository");
const AuthorizationError = require("../exceptions/AuthorizationError");

const verifyUserCredential = async (email, password) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AuthenticationError("Kredensial salah");
  }

  const userPassword = user.password;
  const match = await bcrypt.compare(password, userPassword);

  if (!match) {
    throw new AuthenticationError("Kredensial salah");
  }

  const userId = user.id;
  const userEmail = user.email;

  const accessToken = jwt.sign(
    { userId, userEmail },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "30s",
    }
  );

  const refreshToken = jwt.sign(
    { userId, userEmail },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );

  return { accessToken, refreshToken, expiresIn: 30 };
};

const addAuthentication = async (userAgent, ipAddress, token) => {
  await createAuthentication(userAgent, ipAddress, token);
};

const verifyAuthentication = async (token) => {
  const refreshToken = await findAuthentication(token);
  if (!refreshToken) {
    throw new AuthenticationError("Refresh token tidak valid");
  }
};

const renewAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const { userId, userEmail } = decoded;
    const accessToken = jwt.sign(
      { userId, userEmail },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "30s",
      }
    );
    return { accessToken, expiresIn: 30 };
  } catch (error) {
    console.error(error);
    throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
  }
};

const deleteAuthentication = async (token) => {
  await removeAuthentication(token);
};

module.exports = {
  verifyUserCredential,
  verifyAuthentication,
  deleteAuthentication,
  renewAccessToken,
  addAuthentication,
};
