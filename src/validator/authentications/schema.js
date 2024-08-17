const Joi = require("joi");

const PostAuthenticationPayloadSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email harus berupa format email yang valid",
    "any.required": "Email wajib diisi",
    "string.empty": "Email tidak boleh kosong",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password wajib diisi",
    "string.empty": "Password tidak boleh kosong",
  }),
});

const PutAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "any.required": "Refresh token wajib diisi",
    "string.empty": "Refresh token tidak boleh kosong",
  }),
});

const DeleteAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "any.required": "Refresh token wajib diisi.",
    "string.empty": "Refresh token tidak boleh kosong.",
  }),
});

module.exports = {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
};
