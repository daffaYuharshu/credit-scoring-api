const Joi = require("joi");

const PostAuthenticationPayloadSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email harus berupa format email yang valid.",
    "any.required": "Email wajib diisi.",
  }),
  password: Joi.string().required().messages({
    "any.required": "Kata sandi wajib diisi.",
  }),
});

const PutAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "any.required": "Refresh token wajib diisi.",
  }),
});

const DeleteAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "any.required": "Refresh token wajib diisi.",
  }),
});

module.exports = {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
};
