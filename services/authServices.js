const bcrypt = require("bcrypt");
const User = require("../models/User");
const assignTokens = require("../utils/assignTokens");
const HttpError = require("../utils/Errors");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");

const avatarDir = path.join(__dirname, "../", "public", "avatars");

const signupService = async (body) => {
  const { email, userName, password } = body;
  const fatchedUser = await User.findOne({ email });

  if (fatchedUser) {
    throw new HttpError(409, "Email already used");
  }

  //   const hashedPassword = await bcrypt.hash(password, 12);

  const avatarURL = await gravatar.url(email);

  const newUser = await User.create({
    email,
    userName,
    // password: hashedPassword,
    password,
    avatarURL,
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

const uploadAvatarService = async (body) => {
  const { _id: id } = body.user;
  const { path: tempUpload, originalname } = body.file;
  const filename = `${id}_${originalname}`;
  const resultUpload = path.join(avatarDir, filename);

  await fs.rename(tempUpload, resultUpload);

  (async function resize() {
    const image = await Jimp.read(resultUpload);
    image.resize(250, 250);
    await image.writeAsync(resultUpload);
  })();

  const avatarURL = path.join("avatars", filename);

  await User.findByIdAndUpdate(id, { avatarURL });

  return avatarURL;
};

module.exports = {
  signupService,
  loginService,
  logoutService,
  uploadAvatarService,
};
