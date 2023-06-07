const controllerWrapper = require("../utils/controllerWrapper");
const {
  signupService,
  loginService,
  logoutService,
} = require("../services/authServices");

const signup = controllerWrapper(async (req, res) => {
  const user = await signupService(req.body);
  res.status(201).json({
    userName: user.userName,
    email: user.email,
    _id: user._id,
    password: user.password,
  });
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

module.exports = { signup, login, logout, getCurrent };
