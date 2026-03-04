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
import {
  createBlog,
  deleteBlog,
  getAllBlogsForAdmin,
  updateBlog,
} from "../controllers/blog.controller.js";
import { upload } from "../middlewares/multer.js";

const adminRouter = express.Router();

adminRouter.use(isAuth, isAdmin);

adminRouter.get("/stats", getDashboardStats);
adminRouter.get("/earnings", getEarningsOverview);
adminRouter.get("/users", getUsers);
adminRouter.patch("/users/:id", updateUserByAdmin);
adminRouter.delete("/users/:id", deleteUserByAdmin);
adminRouter.get("/blogs", getAllBlogsForAdmin);
adminRouter.post("/blogs", upload.single("image"), createBlog);
adminRouter.put("/blogs/:id", upload.single("image"), updateBlog);
adminRouter.delete("/blogs/:id", deleteBlog);

export default adminRouter;
