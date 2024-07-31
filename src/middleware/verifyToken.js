const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).send({
        error: true,
        message: `Unauthorized`,
      });
    }
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.email = user.email;
    next();
  } catch (error) {
    return res.status(500).send({
      error: true,
      message: error.message,
    });
  }
};

module.exports = verifyToken;
