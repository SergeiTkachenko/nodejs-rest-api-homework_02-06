const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  getCurrent,
  uploadAvatar,
  verify,
  resendVerify,
} = require("../controllers/authController");
const {
  createUserSchema,
  loginSchema,
  verifyEmailSchema,
} = require("../utils/authSchema");
const validateBody = require("../utils/validateBody");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");

router.post("/signup", validateBody(createUserSchema), signup);

router.post("/login", validateBody(loginSchema), login);

router.post("/verify", validateBody(verifyEmailSchema), resendVerify);

router.get("/verify/:verificationToken", verify);

router.post("/logout", auth, logout);

router.get("/current", auth, getCurrent);

router.patch("/avatars", auth, upload.single("avatar"), uploadAvatar);

module.exports = { authRouter: router };
