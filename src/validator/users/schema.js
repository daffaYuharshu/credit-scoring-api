const Joi = require("joi");

const UserPayloadSchema = Joi.object({
  username: Joi.string().required().messages({
    "any.required": "Nama pengguna wajib diisi.",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email harus berupa format email yang valid.",
    "any.required": "Email wajib diisi.",
  }),
  password: Joi.string().required().messages({
    "any.required": "Kata sandi wajib diisi.",
  }),
  role: Joi.string().valid("user", "admin").required().messages({
    "any.only": 'Role harus salah satu dari "user" atau "admin".',
    "any.required": "Peran wajib diisi.",
  }),
});

module.exports = { UserPayloadSchema };
