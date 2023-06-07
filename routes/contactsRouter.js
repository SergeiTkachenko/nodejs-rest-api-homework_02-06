const express = require("express");
const {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  updateStatusContact,
} = require("../controllers/contactsControllers");
const auth = require("../middlewares/auth");
const router = express.Router();

router.use(auth);

router.get("/", getContacts);

router.get("/:contactId", getContactById);

router.post("/", createContact);

router.patch("/:contactId", updateContact);

router.delete("/:contactId", deleteContact);

router.patch("/:contactId/favorite", updateStatusContact);

module.exports = { contactsRouter: router };
