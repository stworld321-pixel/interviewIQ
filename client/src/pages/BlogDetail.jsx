import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ServerUrl } from "../App";

const headingToId = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const sanitizeHtml = (html = "") => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc.querySelectorAll("script,iframe,object,embed").forEach((el) => el.remove());

  doc.querySelectorAll("*").forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value || "";
      if (name.startsWith("on")) el.removeAttribute(attr.name);
      if ((name === "href" || name === "src") && value.trim().toLowerCase().startsWith("javascript:")) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return doc.body.innerHTML;
};

const buildContentWithToc = (html = "") => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitizeHtml(html), "text/html");
  const headings = Array.from(doc.querySelectorAll("h2, h3"));
  const toc = [];

  headings.forEach((heading, index) => {
    const text = heading.textContent?.trim() || `section-${index + 1}`;
    const id = headingToId(text) || `section-${index + 1}`;
    heading.id = id;
    toc.push({
      id,
      text,
      level: heading.tagName.toLowerCase(),
    });
  });

  return {
    html: doc.body.innerHTML,
    toc,
  };
};

function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBlog = async () => {
      try {
        setLoading(true);
        setError("");
        const [blogRes, postsRes] = await Promise.all([
          axios.get(ServerUrl + `/api/blogs/${slug}`),
          axios.get(ServerUrl + "/api/blogs"),
        ]);
        const loadedBlog = blogRes.data;
        setBlog(loadedBlog);
        const posts = (postsRes.data || [])
          .filter((item) => item.slug !== loadedBlog.slug)
          .slice(0, 5);
        setRecentPosts(posts);
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

  const parsedContent = useMemo(() => {
    if (!blog?.content) return { html: "", toc: [] };
    return buildContentWithToc(blog.content);
  }, [blog]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <Link to="/blog" className="text-sm text-[#0B3C6D] hover:text-[#1E88E5]">
          Back to Blog
        </Link>

        {loading && <p className="mt-4 text-slate-600">Loading article...</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}

        {!loading && !error && blog && (
          <section className="mt-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] gap-7 items-start">
            <article className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8">
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
                  className="w-full h-[260px] md:h-[380px] object-cover rounded-2xl mt-6"
                />
              )}

              <div
                className="mt-7 prose max-w-none prose-headings:text-[#0B3C6D] prose-a:text-[#1E88E5] prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: parsedContent.html }}
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

            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <h2 className="text-lg font-bold text-[#0B3C6D] mb-3">Table of Contents</h2>
                {parsedContent.toc.length === 0 ? (
                  <p className="text-sm text-slate-500">Add `h2` or `h3` in content to generate TOC.</p>
                ) : (
                  <ul className="space-y-2">
                    {parsedContent.toc.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className={`text-sm hover:text-[#1E88E5] ${item.level === "h3" ? "pl-4 text-slate-600" : "text-slate-800 font-medium"}`}
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <h2 className="text-lg font-bold text-[#0B3C6D] mb-3">Recent Posts</h2>
                <div className="space-y-3">
                  {recentPosts.length === 0 && <p className="text-sm text-slate-500">No recent posts.</p>}
                  {recentPosts.map((post) => (
                    <Link key={post._id} to={`/blog/${post.slug}`} className="block group">
                      <p className="text-sm font-medium text-slate-800 group-hover:text-[#1E88E5] line-clamp-2">
                        {post.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-5 bg-gradient-to-br from-[#0B3C6D] to-[#1E88E5] text-white">
                <p className="text-sm uppercase tracking-wider text-white/80 font-semibold">Free Practice</p>
                <h3 className="text-lg font-bold mt-2">Ready to attend a free AI mock interview?</h3>
                <p className="text-sm text-white/90 mt-2">
                  Start now and get instant feedback on communication, confidence, and answer quality.
                </p>
                <Link
                  to="/interview"
                  className="inline-flex mt-4 px-4 py-2 rounded-full bg-white text-[#0B3C6D] font-semibold hover:bg-slate-100 transition"
                >
                  Attend Free Interview
                </Link>
              </div>
            </aside>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default BlogDetail;
