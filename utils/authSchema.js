const Joi = require("joi");

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,160}$/;

const createUserSchema = Joi.object({
  userName: Joi.string().min(3).max(35).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(passwordRegex).required().messages({
    "string.pattern.base":
      "Invalid Password. Use at least one letter and one digit, minimum length of 8 characters.",
  }),
});

const loginSchema = createUserSchema.fork(["email", "password"], (schema) =>
  schema.options({ presence: "required" }).messages({
    "any.required": "Field is required",
  })
);

module.exports = { createUserSchema, loginSchema };
