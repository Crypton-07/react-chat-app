import { Router } from "express";
import { verifyToken } from "../Middleware/authMiddleware.js";
import {
  getAllContacts,
  getContactsForDmList,
  searchContact,
} from "../Controllers/contactsController.js";

const contactsRoutes = Router();
contactsRoutes.post("/search", verifyToken, searchContact);
contactsRoutes.get("/get-contacts-dm", verifyToken, getContactsForDmList);
contactsRoutes.get("/get-all-contacts", verifyToken, getAllContacts);

export default contactsRoutes;
