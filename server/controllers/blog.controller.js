import Blog from "../models/blog.model.js";
import fs from "fs/promises";
import { uploadFileToMinio, isMinioEnabled } from "../config/minio.js";

const normalizeTags = (tagsInput) => {
  if (Array.isArray(tagsInput)) {
    return tagsInput
      .map((tag) => String(tag).trim())
      .filter(Boolean);
  }

  if (typeof tagsInput === "string") {
    return tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

const slugify = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const generateUniqueSlug = async (title, excludeId = null) => {
  const baseSlug = slugify(title) || "blog-post";
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const existing = await Blog.findOne({ slug }).select("_id");
    if (!existing || (excludeId && String(existing._id) === String(excludeId))) {
      return slug;
    }
    slug = `${baseSlug}-${count++}`;
  }
};

const uploadBlogImage = async (file, slug) => {
  if (!file) return "";

  if (!isMinioEnabled()) {
    return `/uploads/${file.filename}`;
  }

  const safeSlug = slug || "blog";
  const objectName = `blogs/${safeSlug}/${Date.now()}-${file.filename}`;
  const imageUrl = await uploadFileToMinio({
    filePath: file.path,
    objectName,
    contentType: file.mimetype,
  });

  try {
    await fs.unlink(file.path);
  } catch {
    // best-effort cleanup after successful MinIO upload
  }

  return imageUrl;
};

export const getPublishedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .select(
        "title slug category tags metaTitle metaDescription imageUrl createdAt updatedAt"
      );

    return res.status(200).json(blogs);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get blogs ${error}` });
  }
};

export const getPublishedBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug, isPublished: true }).populate(
      "authorId",
      "name email"
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.status(200).json(blog);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get blog ${error}` });
  }
};

export const getAllBlogsForAdmin = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .populate("authorId", "name email");
    return res.status(200).json(blogs);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get admin blogs ${error}` });
  }
};

export const createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      category = "General",
      tags = [],
      metaTitle = "",
      metaDescription = "",
      isPublished = false,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const slug = await generateUniqueSlug(title);
    const imageUrl = req.file ? await uploadBlogImage(req.file, slug) : "";

    const blog = await Blog.create({
      title: title.trim(),
      slug,
      content,
      category: category?.trim() || "General",
      tags: normalizeTags(tags),
      metaTitle: metaTitle.trim(),
      metaDescription: metaDescription.trim(),
      imageUrl,
      isPublished: String(isPublished) === "true" || isPublished === true,
      authorId: req.userId,
    });

    return res.status(201).json(blog);
  } catch (error) {
    return res.status(500).json({ message: `Failed to create blog ${error}` });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const {
      title,
      content,
      category,
      tags,
      metaTitle,
      metaDescription,
      isPublished,
    } = req.body;

    if (typeof title === "string" && title.trim() && title.trim() !== blog.title) {
      blog.title = title.trim();
      blog.slug = await generateUniqueSlug(title, blog._id);
    }

    if (typeof content === "string") blog.content = content;
    if (typeof category === "string") blog.category = category.trim() || "General";
    if (typeof metaTitle === "string") blog.metaTitle = metaTitle.trim();
    if (typeof metaDescription === "string") blog.metaDescription = metaDescription.trim();
    if (tags !== undefined) blog.tags = normalizeTags(tags);
    if (isPublished !== undefined) {
      blog.isPublished = String(isPublished) === "true" || isPublished === true;
    }
    if (req.file) {
      blog.imageUrl = await uploadBlogImage(req.file, blog.slug);
    }

    await blog.save();
    return res.status(200).json(blog);
  } catch (error) {
    return res.status(500).json({ message: `Failed to update blog ${error}` });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Blog.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Failed to delete blog ${error}` });
  }
};
