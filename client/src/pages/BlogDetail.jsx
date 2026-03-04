import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ServerUrl } from "../App";

function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBlog = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(ServerUrl + `/api/blogs/${slug}`);
        setBlog(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Blog not found");
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [slug]);

  useEffect(() => {
    if (!blog) return;
    document.title = blog.metaTitle || blog.title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = blog.metaDescription || "";
  }, [blog]);

  const imageSrc = useMemo(() => {
    if (!blog?.imageUrl) return "";
    if (blog.imageUrl.startsWith("http://") || blog.imageUrl.startsWith("https://")) {
      return blog.imageUrl;
    }
    return `${ServerUrl}${blog.imageUrl}`;
  }, [blog]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <Link to="/blog" className="text-sm text-[#0B3C6D] hover:text-[#1E88E5]">
          Back to Blog
        </Link>

        {loading && <p className="mt-4 text-slate-600">Loading article...</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}

        {!loading && !error && blog && (
          <article className="mt-5 bg-white border border-slate-200 rounded-3xl p-6 md:p-8">
            <p className="text-xs uppercase tracking-wider font-semibold text-[#1E88E5]">
              {blog.category || "General"}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0B3C6D] mt-3">{blog.title}</h1>
            <div className="mt-4 text-sm text-slate-500">
              <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
              <span className="mx-2">|</span>
              <span>{blog.authorId?.name || "Admin"}</span>
            </div>

            {imageSrc && (
              <img
                src={imageSrc}
                alt={blog.title}
                className="w-full h-[260px] md:h-[360px] object-cover rounded-2xl mt-6"
              />
            )}

            <div
              className="mt-6 prose max-w-none text-slate-700"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {Array.isArray(blog.tags) && blog.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs rounded-full bg-[#1E88E5]/10 text-[#0B3C6D]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default BlogDetail;

