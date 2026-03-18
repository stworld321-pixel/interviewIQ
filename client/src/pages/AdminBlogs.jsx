import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
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

function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editorMode, setEditorMode] = useState("visual");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const contentRef = useRef(null);
  const richEditorRef = useRef(null);

  const toImageSrc = (imageUrl = "") => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
    return `${ServerUrl}${imageUrl}`;
  };

  const [selectedImagePreview, setSelectedImagePreview] = useState("");

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
    if (!richEditorRef.current) return;
    if (editorMode !== "visual") return;
    if (richEditorRef.current.innerHTML !== form.content) {
      richEditorRef.current.innerHTML = form.content || "<p></p>";
    }
  }, [form.content, editorMode]);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const sanitizePreviewHtml = (html = "") => {
    if (typeof window === "undefined") return html;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    doc.querySelectorAll("script,iframe,object,embed").forEach((el) => el.remove());
    doc.querySelectorAll("*").forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = (attr.value || "").toLowerCase().trim();
        if (name.startsWith("on")) el.removeAttribute(attr.name);
        if ((name === "href" || name === "src") && value.startsWith("javascript:")) {
          el.removeAttribute(attr.name);
        }
      });
    });
    return doc.body.innerHTML;
  };

  const applyWrap = (prefix, suffix = prefix) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = form.content.slice(start, end);
    const inserted = `${prefix}${selected || "text"}${suffix}`;

    const nextContent = form.content.slice(0, start) + inserted + form.content.slice(end);

    setForm((prev) => ({ ...prev, content: nextContent }));
  };

  const insertAtCursor = (snippet) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextContent = form.content.slice(0, start) + snippet + form.content.slice(end);
    setForm((prev) => ({ ...prev, content: nextContent }));
  };

  const getSafeLink = () => {
    const url = linkUrl.trim();
    if (!url) return "";
    return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
  };

  const insertLink = () => {
    const safeUrl = getSafeLink();
    if (!safeUrl) return;
    const text = linkText.trim() || "Read more";
    insertAtCursor(`<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`);
  };

  const syncFromVisualEditor = () => {
    const editor = richEditorRef.current;
    if (!editor) return;
    updateForm("content", editor.innerHTML);
  };

  const execVisual = (command, value = null) => {
    richEditorRef.current?.focus();
    document.execCommand(command, false, value);
    syncFromVisualEditor();
  };

  const setBlock = (tag) => execVisual("formatBlock", tag);

  const insertVisualLink = () => {
    const safeUrl = getSafeLink();
    if (!safeUrl) return;
    const text = linkText.trim() || "Read more";
    richEditorRef.current?.focus();
    document.execCommand(
      "insertHTML",
      false,
      `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`
    );
    syncFromVisualEditor();
  };

  const resetForm = () => {
    setForm(defaultForm);
    setImageFile(null);
    setSelectedImagePreview("");
    setEditingId(null);
    setEditorMode("visual");
    if (richEditorRef.current) {
      richEditorRef.current.innerHTML = "<p></p>";
    }
  };

  const startEdit = (blog) => {
    setEditingId(blog._id);
    setForm({
      title: blog.title || "",
      content: blog.content || "",
      category: blog.category || "General",
      tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : "",
      metaTitle: blog.metaTitle || "",
      metaDescription: blog.metaDescription || "",
      isPublished: !!blog.isPublished,
    });
    setImageFile(null);
    setEditorMode("visual");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const editingBlog = blogs.find((item) => item._id === editingId);

  const submitBlog = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage("");

      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("content", form.content);
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
            Add and manage blog posts with SEO metadata, categories, tags, images, and publish control.
          </p>
          {message && <p className="text-sm text-[#0B3C6D] mt-2">{message}</p>}
        </div>

        <section className="grid lg:grid-cols-2 gap-6">
          <form
            onSubmit={submitBlog}
            className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4"
          >
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
              <p className="text-sm font-medium text-slate-700 mb-2">Content Editor</p>

              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="inline-flex rounded-lg border border-slate-300 p-1 bg-slate-50">
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
              </div>

              <div className="grid md:grid-cols-[1fr_1fr_auto] gap-2 mb-3">
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Link URL (https://...)"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E88E5]/30"
                />
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Anchor text (e.g. Read more)"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E88E5]/30"
                />
                <button
                  type="button"
                  onClick={editorMode === "visual" ? insertVisualLink : insertLink}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-100"
                >
                  Insert Link
                </button>
              </div>

              {editorMode === "visual" && (
                <>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => execVisual("bold")}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      Bold
                    </button>
                    <button
                      type="button"
                      onClick={() => execVisual("italic")}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      Italic
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlock("h2")}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlock("h3")}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlock("p")}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      Paragraph
                    </button>
                    <button
                      type="button"
                      onClick={() => execVisual("insertUnorderedList")}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      List
                    </button>
                    <button
                      type="button"
                      onClick={() => execVisual("formatBlock", "blockquote")}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      Quote
                    </button>
                    <button
                      type="button"
                      onClick={insertVisualLink}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      Link
                    </button>
                  </div>
                  <div
                    ref={richEditorRef}
                    contentEditable
                    onInput={syncFromVisualEditor}
                    className="min-h-[280px] w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1E88E5]/30 bg-white text-slate-800 overflow-y-auto"
                    style={{ whiteSpace: "pre-wrap" }}
                  />
                </>
              )}

              {editorMode === "html" && (
                <>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => applyWrap("<strong>", "</strong>")}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      Bold
                    </button>
                    <button
                      type="button"
                      onClick={() => applyWrap("<em>", "</em>")}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      Italic
                    </button>
                    <button
                      type="button"
                      onClick={() => applyWrap("<h2>", "</h2>")}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => applyWrap("<h3>", "</h3>")}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => applyWrap("<p>", "</p>")}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      Paragraph
                    </button>
                    <button
                      type="button"
                      onClick={insertLink}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      Link
                    </button>
                    <button
                      type="button"
                      onClick={() => applyWrap("<ul><li>", "</li></ul>")}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      List
                    </button>
                    <button
                      type="button"
                      onClick={() => applyWrap("<blockquote>", "</blockquote>")}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      Quote
                    </button>
                    <button
                      type="button"
                      onClick={() => applyWrap("<pre><code>", "</code></pre>")}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      Code
                    </button>
                  </div>
                  <textarea
                    ref={contentRef}
                    value={form.content}
                    onChange={(e) => updateForm("content", e.target.value)}
                    placeholder="Write blog HTML content here..."
                    rows={12}
                    required
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1E88E5]/30 resize-y"
                  />
                </>
              )}

              <p className="text-xs text-slate-500 mt-3">
                Use h2 and h3 headings to auto-generate table of contents in single post page.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-3 bg-white">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Live Preview</h3>
              <div
                className="prose max-w-none prose-headings:text-[#0B3C6D] prose-a:text-[#1E88E5] min-h-[180px]"
                dangerouslySetInnerHTML={{ __html: sanitizePreviewHtml(form.content || "<p>Preview appears here...</p>") }}
              />
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
