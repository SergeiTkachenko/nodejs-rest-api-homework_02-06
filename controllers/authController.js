const controllerWrapper = require("../utils/controllerWrapper");
const {
  signupService,
  loginService,
  logoutService,
  uploadAvatarService,
  verifyService,
  resendVerifyService,
} = require("../services/authServices");

const signup = controllerWrapper(async (req, res) => {
  const user = await signupService(req.body);
  res.status(201).json({
    userName: user.userName,
    email: user.email,
    _id: user._id,
    password: user.password,
    verificationToken: user.verificationToken,
  });
});

const verify = controllerWrapper(async (req, res) => {
  await verifyService(req.params);
  res.status(200).json({ message: "Verification successful" });
});

const resendVerify = controllerWrapper(async (req, res) => {
  await resendVerifyService(req.body);
  res.status(200).json({ message: "Verification email sent" });
});

const login = controllerWrapper(async (req, res) => {
  const { user, accessToken } = await loginService(req.body);
  res.status(200).json({ user, accessToken });
});

const logout = controllerWrapper(async (req, res) => {
  await logoutService(req.user);

  res.status(204).json({ message: "Successful logout" });
});

const getCurrent = controllerWrapper(async (req, res) => {
  const { email, subscription } = req.user;
  res.status(200).json({
    user: {
      email,
      subscription,
    },
  });
});

const uploadAvatar = controllerWrapper(async (req, res) => {
  const result = await uploadAvatarService(req);
  console.log(1111);

  res.status(200).json({ avatarURL: result });
});

module.exports = {
  signup,
  login,
  logout,
  getCurrent,
  uploadAvatar,
  verify,
  resendVerify,
};
