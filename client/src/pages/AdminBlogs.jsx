import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import Navbar from "../components/Navbar";
import { ServerUrl } from "../App";

const defaultForm = {
  title: "",
  content: "",
  category: "General",
  tags: "",
  metaTitle: "",
  metaDescription: "",
  isPublished: false,
};

const toolbarOptions = [
  [{ header: [2, 3, 4, false] }],
  ["bold", "italic", "underline", "blockquote"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "clean"],
];

function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedImagePreview, setSelectedImagePreview] = useState("");
  const [editorMode, setEditorMode] = useState("visual");

  const editorMountRef = useRef(null);
  const quillRef = useRef(null);

  const toImageSrc = (imageUrl = "") => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
    return `${ServerUrl}${imageUrl}`;
  };

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setEditorContent = (html = "") => {
    if (!quillRef.current) return;
    const safeHtml = html?.trim() ? html : "<p><br></p>";
    quillRef.current.clipboard.dangerouslyPasteHTML(safeHtml, "api");
  };

  const readEditorContent = () => {
    if (!quillRef.current) return "";
    const html = quillRef.current.root.innerHTML;
    return html === "<p><br></p>" ? "" : html;
  };

  const isEditorEmpty = () => {
    if (!quillRef.current) return true;
    return quillRef.current.getText().trim().length === 0;
  };

  const loadBlogs = async () => {
    try {
      setLoading(true);
      setMessage("");
      const res = await axios.get(ServerUrl + "/api/admin/blogs", { withCredentials: true });
      setBlogs(res.data || []);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setSelectedImagePreview("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImagePreview(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    if (!editorMountRef.current || quillRef.current) return;

    quillRef.current = new Quill(editorMountRef.current, {
      theme: "snow",
      modules: {
        toolbar: toolbarOptions,
        clipboard: {
          matchVisual: false,
        },
      },
      placeholder: "Write your blog content here...",
    });

    quillRef.current.on("text-change", () => {
      updateForm("content", readEditorContent());
    });

    setEditorContent("");
  }, []);

  useEffect(() => {
    if (!quillRef.current) return;
    quillRef.current.enable(editorMode === "visual");
    if (editorMode === "visual") {
      setEditorContent(form.content || "");
    }
  }, [editorMode]);

  const resetForm = () => {
    setForm(defaultForm);
    setImageFile(null);
    setSelectedImagePreview("");
    setEditingId(null);
    setEditorContent("");
  };

  const startEdit = (blog) => {
    const next = {
      title: blog.title || "",
      content: blog.content || "",
      category: blog.category || "General",
      tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : "",
      metaTitle: blog.metaTitle || "",
      metaDescription: blog.metaDescription || "",
      isPublished: !!blog.isPublished,
    };

    setEditingId(blog._id);
    setForm(next);
    setImageFile(null);
    setEditorContent(next.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const editingBlog = useMemo(
    () => blogs.find((item) => item._id === editingId),
    [blogs, editingId]
  );

  const submitBlog = async (e) => {
    e.preventDefault();
    const editorHtml = editorMode === "visual" ? readEditorContent() : form.content;
    const plainText = (editorHtml || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    if (!form.title.trim() || !plainText) {
      setMessage("Title and blog content are required");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("content", editorHtml);
      payload.append("category", form.category);
      payload.append("tags", form.tags);
      payload.append("metaTitle", form.metaTitle);
      payload.append("metaDescription", form.metaDescription);
      payload.append("isPublished", String(form.isPublished));
      if (imageFile) payload.append("image", imageFile);

      if (editingId) {
        await axios.put(ServerUrl + `/api/admin/blogs/${editingId}`, payload, {
          withCredentials: true,
        });
        setMessage("Blog updated");
      } else {
        await axios.post(ServerUrl + "/api/admin/blogs", payload, {
          withCredentials: true,
        });
        setMessage("Blog created");
      }

      resetForm();
      loadBlogs();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to save blog");
    } finally {
      setSaving(false);
    }
  };

  const deleteBlog = async (id) => {
    try {
      await axios.delete(ServerUrl + `/api/admin/blogs/${id}`, { withCredentials: true });
      setMessage("Blog deleted");
      if (editingId === id) resetForm();
      loadBlogs();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to delete blog");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#0B3C6D]">Admin Blog Manager</h1>
          <p className="text-slate-600 mt-1">
            WordPress-style rich editor with headings, lists, links, metadata, and publish control.
          </p>
          {message && <p className="text-sm text-[#0B3C6D] mt-2">{message}</p>}
        </div>

        <section className="grid lg:grid-cols-2 gap-6">
          <form onSubmit={submitBlog} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="text-xl font-semibold">{editingId ? "Edit Blog" : "Create Blog"}</h2>

            <input
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
              placeholder="Title"
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1E88E5]/30"
            />

            <div className="grid md:grid-cols-2 gap-3">
              <input
                value={form.category}
                onChange={(e) => updateForm("category", e.target.value)}
                placeholder="Category"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1E88E5]/30"
              />
              <input
                value={form.tags}
                onChange={(e) => updateForm("tags", e.target.value)}
                placeholder="Tags (comma separated)"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1E88E5]/30"
              />
            </div>

            <input
              value={form.metaTitle}
              onChange={(e) => updateForm("metaTitle", e.target.value)}
              placeholder="Meta Title"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1E88E5]/30"
            />

            <textarea
              value={form.metaDescription}
              onChange={(e) => updateForm("metaDescription", e.target.value)}
              placeholder="Meta Description"
              rows={3}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1E88E5]/30 resize-none"
            />

            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-700 mb-2">Blog Description Editor</p>
              <div className="inline-flex rounded-lg border border-slate-300 p-1 bg-slate-50 mb-3">
                <button
                  type="button"
                  onClick={() => setEditorMode("visual")}
                  className={`px-3 py-1.5 text-xs rounded-md ${
                    editorMode === "visual" ? "bg-white text-[#0B3C6D] shadow-sm" : "text-slate-600"
                  }`}
                >
                  Visual
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode("html")}
                  className={`px-3 py-1.5 text-xs rounded-md ${
                    editorMode === "html" ? "bg-white text-[#0B3C6D] shadow-sm" : "text-slate-600"
                  }`}
                >
                  HTML
                </button>
              </div>

              <div
                ref={editorMountRef}
                className={`min-h-[320px] [&_.ql-editor]:min-h-[260px] ${
                  editorMode === "html" ? "hidden" : "block"
                } [&_.ql-toolbar.ql-snow]:sticky [&_.ql-toolbar.ql-snow]:top-20 [&_.ql-toolbar.ql-snow]:z-20 [&_.ql-toolbar.ql-snow]:bg-white [&_.ql-toolbar.ql-snow]:border-slate-200 [&_.ql-container.ql-snow]:border-slate-200 [&_.ql-editor]:max-h-[560px] [&_.ql-editor]:overflow-y-auto`}
              />

              {editorMode === "html" && (
                <textarea
                  value={form.content}
                  onChange={(e) => updateForm("content", e.target.value)}
                  placeholder="Edit raw HTML here..."
                  rows={14}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1E88E5]/30 resize-y font-mono text-sm"
                />
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-3 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white"
              />
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => updateForm("isPublished", e.target.checked)}
                />
                Published
              </label>
            </div>

            {(selectedImagePreview || editingBlog?.imageUrl) && (
              <div className="border border-slate-200 rounded-xl p-3">
                <p className="text-xs font-medium text-slate-600 mb-2">Image Preview</p>
                <img
                  src={selectedImagePreview || toImageSrc(editingBlog?.imageUrl)}
                  alt="Blog preview"
                  className="w-full max-w-md h-44 object-cover rounded-lg border border-slate-200"
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-full bg-[#0B3C6D] text-white hover:bg-[#1E88E5] transition disabled:opacity-70"
              >
                {saving ? "Saving..." : editingId ? "Update Blog" : "Create Blog"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-3 rounded-full border border-slate-300 hover:bg-slate-100"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <section className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-xl font-semibold mb-4">All Blogs</h2>
            {loading && <p className="text-slate-600">Loading blogs...</p>}
            {!loading && blogs.length === 0 && <p className="text-slate-600">No blogs found.</p>}
            <div className="space-y-3 max-h-[780px] overflow-y-auto pr-1">
              {blogs.map((blog) => (
                <article
                  key={blog._id}
                  className="border border-slate-200 rounded-xl p-4 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    {blog.imageUrl ? (
                      <img
                        src={toImageSrc(blog.imageUrl)}
                        alt={blog.title}
                        className="w-20 h-16 object-cover rounded-md border border-slate-200"
                      />
                    ) : (
                      <div className="w-20 h-16 rounded-md border border-dashed border-slate-300 bg-slate-50" />
                    )}
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        {blog.category || "General"}
                      </p>
                      <h3 className="font-semibold text-[#0B3C6D]">{blog.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {blog.isPublished ? "Published" : "Unpublished"} | {" "}
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(blog)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBlog(blog._id)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default AdminBlogs;
