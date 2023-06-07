const jwt = require("jsonwebtoken");

const {
  ACCESS_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_SECRET_KEY,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} = process.env;

const assignTokens = (user) => {
  const payload = {
    id: user._id,
    userName: user.userName,
    userEmail: user.userEmail,
  };
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

module.exports = assignTokens;
