const Joi = require("joi");

const UserPayloadSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().valid("user", "admin").required(),
});

module.exports = { UserPayloadSchema };
