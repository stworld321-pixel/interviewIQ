import express from "express";
import {
  getPublishedBlogBySlug,
  getPublishedBlogs,
} from "../controllers/blog.controller.js";

const blogRouter = express.Router();

blogRouter.get("/", getPublishedBlogs);
blogRouter.get("/:slug", getPublishedBlogBySlug);

export default blogRouter;

