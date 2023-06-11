const express = require("express");
const { contactsRouter } = require("./routes/contactsRouter");
const { authRouter } = require("./routes/authRouter");
const { globalErrorHandler } = require("./middlewares/globalErrorHandler");

const app = express();

app.use(express.json());

app.use(express.static("public"));

app.use("/auth", authRouter);

app.use("/contacts", contactsRouter);

app.use(globalErrorHandler);

module.exports = app;
