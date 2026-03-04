import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ServerUrl } from "../App";

function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(ServerUrl + "/api/blogs");
        setBlogs(res.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load blogs");
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  const categories = useMemo(() => {
    const values = new Set(["All"]);
    blogs.forEach((blog) => values.add(blog.category || "General"));
    return Array.from(values);
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const inCategory = selectedCategory === "All" || blog.category === selectedCategory;
      return inCategory;
    });
  }, [blogs, selectedCategory]);

  const toImageSrc = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
    return `${ServerUrl}${imageUrl}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pb-10">
        <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-[#0B3C6D] to-[#1E88E5] py-16 md:py-20">
          <div className="absolute -top-16 -left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-[#F97316]/20 blur-3xl"></div>
          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <p className="text-white/80 text-sm uppercase tracking-widest font-semibold">Hireloop Blog</p>
            <h1 className="text-4xl md:text-5xl font-black text-white mt-3 max-w-3xl leading-tight">
              Career Strategy, Interview Mastery, and AI Preparation Guides
            </h1>
            <p className="text-white/85 text-lg mt-4 max-w-2xl">
              Learn practical tactics for HR and technical interviews, resume optimization, and faster job readiness.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1E88E5]/30 bg-white"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {loading && <p className="text-slate-600">Loading blogs...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && filteredBlogs.length === 0 && (
            <p className="text-slate-600">No published blogs found.</p>
          )}

          <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <article
                key={blog._id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
              >
                {blog.imageUrl && (
                  <img
                    src={toImageSrc(blog.imageUrl)}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#1E88E5]">
                    {blog.category || "General"}
                  </p>
                  <h2 className="text-xl font-semibold mt-2 text-[#0B3C6D] line-clamp-2">
                    {blog.title}
                  </h2>
                  <p className="text-sm text-slate-600 mt-3 line-clamp-3">
                    {blog.metaDescription || "Read this blog to improve your interview performance."}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/blog/${blog.slug}`}
                      className="text-sm font-semibold text-[#0B3C6D] hover:text-[#1E88E5]"
                    >
                      Read more
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Blog;
