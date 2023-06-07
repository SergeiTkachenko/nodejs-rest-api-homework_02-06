const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  getCurrent,
} = require("../controllers/authController");
const { createUserSchema, loginSchema } = require("../utils/authSchema");
const validateBody = require("../utils/validateBody");
const auth = require("../middlewares/auth");

router.post("/signup", validateBody(createUserSchema), signup);
router.post("/login", validateBody(loginSchema), login);

router.post("/logout", auth, logout);

router.get("/current", auth, getCurrent);

module.exports = { authRouter: router };
