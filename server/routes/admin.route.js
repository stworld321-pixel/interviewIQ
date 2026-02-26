import express from "express";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/isAdmin.js";
import {
  deleteUserByAdmin,
  getDashboardStats,
  getEarningsOverview,
  getUsers,
  updateUserByAdmin,
} from "../controllers/admin.controller.js";

const adminRouter = express.Router();

adminRouter.use(isAuth, isAdmin);

adminRouter.get("/stats", getDashboardStats);
adminRouter.get("/earnings", getEarningsOverview);
adminRouter.get("/users", getUsers);
adminRouter.patch("/users/:id", updateUserByAdmin);
adminRouter.delete("/users/:id", deleteUserByAdmin);

export default adminRouter;
