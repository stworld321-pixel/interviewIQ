import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function Footer() {
  return (
    <footer className="bg-slate-50 px-4 pb-10 pt-8">
      <div className="max-w-6xl mx-auto bg-white border border-slate-200 rounded-3xl p-7 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <img src={logo} alt="Brand logo" className="w-40 h-10 object-contain" />
            </div>
            <p className="text-sm text-slate-600 mt-3 max-w-xl">
              AI-powered interview preparation platform built to improve confidence, communication, and technical performance.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <Link to="/" className="text-slate-600 hover:text-black">Home</Link>
            <Link to="/blog" className="text-slate-600 hover:text-black">Blog</Link>
            <Link to="/about" className="text-slate-600 hover:text-black">About</Link>
            <Link to="/contact" className="text-slate-600 hover:text-black">Contact</Link>
            <Link to="/pricing" className="text-slate-600 hover:text-black">Pricing</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
