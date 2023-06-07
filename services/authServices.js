const bcrypt = require("bcrypt");
const User = require("../models/User");
const assignTokens = require("../utils/assignTokens");
const HttpError = require("../utils/Errors");

const signupService = async (body) => {
  const { email, userName, password } = body;
  const fatchedUser = await User.findOne({ email });

  if (fatchedUser) {
    throw new HttpError(409, "Email already used");
  }

  //   const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await User.create({
    email,
    userName,
    // password: hashedPassword,
    password,
  });

  return newUser;
};

const loginService = async (body) => {
  const { email, password, userName } = body;
  const fatchedUserEmail = await User.findOne({ email });
  const fatchedUserName = await User.findOne({ userName });

  if (!fatchedUserEmail) {
    throw new HttpError(401, "Email not found");
  }

  if (!fatchedUserName) {
    throw new HttpError(401, "userName not found");
  }

  const isPasswordCorrect = bcrypt.compare(password, fatchedUserEmail.password);

  if (!isPasswordCorrect) {
    throw new HttpError(401, "Password not correct");
  }

  const { refreshToken, accessToken } = assignTokens(fatchedUserEmail);
  await User.findByIdAndUpdate(fatchedUserEmail._id, {
    refresh_token: refreshToken,
  });

  return { user: fatchedUserEmail, accessToken };
};

const logoutService = async (user) => {
  const { _id: id } = user;
  await User.findByIdAndUpdate(id, { accessToken: "" });

  return id;
};

module.exports = { signupService, loginService, logoutService };
