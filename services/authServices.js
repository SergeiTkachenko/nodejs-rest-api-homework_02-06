const bcrypt = require("bcrypt");
const User = require("../models/User");
const assignTokens = require("../utils/assignTokens");
const HttpError = require("../utils/Errors");
const sendEmail = require("../utils/sendEmail");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const { v4: uuidv4 } = require("uuid");

const avatarDir = path.join(__dirname, "../", "public", "avatars");
const { PROJECT_URL } = process.env;

const signupService = async (body) => {
  const { email, userName, password } = body;
  const fatchedUser = await User.findOne({ email });

  if (fatchedUser) {
    throw new HttpError(409, "Email already used");
  }

  //   const hashedPassword = await bcrypt.hash(password, 12);

  const avatarURL = await gravatar.url(email);
  const verificationToken = uuidv4();

  const newUser = await User.create({
    email,
    userName,
    // password: hashedPassword,
    password,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Veryfy email",
    html: `<a target="_blank" href="${PROJECT_URL}/auth/verify/${verificationToken}">Click here to veryfy your email</a>`,
  };

  await sendEmail(verifyEmail);

  return newUser;
};

const verifyService = async (body) => {
  const { verificationToken } = body;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });

  return true;
};

const resendVerifyService = async (body) => {
  const { email } = body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new HttpError(404, "Email not found");
  }
  if (user.verify) {
    throw new HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Veryfy email",
    html: `<a target="_blank" href="${PROJECT_URL}/auth/verify/${user.verificationToken}">Click here to veryfy your email</a>`,
  };

  await sendEmail(verifyEmail);

  return true;
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

  if (!fatchedUserEmail.verify) {
    throw new HttpError(401, "User is not verified");
  }

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
  verifyService,
  resendVerifyService,
};
