const jwt = require("jsonwebtoken");
const User = require("../models/User");
const HttpError = require("../utils/Errors");
const { ACCESS_TOKEN_SECRET_KEY, REFRESH_TOKEN_SECRET_KEY } = process.env;
const assignTokens = require("../utils/assignTokens");

const auth = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");

  let fetchedUser;

  try {
    if (!bearer === "Bearer" || !token) {
      throw new HttpError(401, "Invalid or absent token");
    }

    const decoded = jwt.decode(token);

    fetchedUser = await User.findById(decoded.id);

    if (!fetchedUser || !fetchedUser.refresh_token) {
      throw new HttpError(401, "User or token not found");
    }

    jwt.verify(token, ACCESS_TOKEN_SECRET_KEY);
    req.user = fetchedUser;
    next();
  } catch (e) {
    if (e.name !== "TokenExpiredError") {
      return next(new HttpError(401, e.message || "Not authorized"));
    }

    try {
      jwt.verify(fetchedUser.refresh_token, REFRESH_TOKEN_SECRET_KEY);
      const { accessToken, refreshToken } = assignTokens(fetchedUser);

      await User.findByIdAndUpdate(fetchedUser._id, {
        refreresh_token: refreshToken,
      });
      res.json({ accessToken });
    } catch (e) {
      next(new HttpError(401, "RefreshToken is expired"));
    }
  }
};

module.exports = auth;
