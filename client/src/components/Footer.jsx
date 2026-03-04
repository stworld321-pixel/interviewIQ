import React from "react";
import { BsGrid, BsShare } from "react-icons/bs";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-gradient-to-b from-[#f8fbff] via-white to-[#f3f8ff] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_20px_50px_-30px_rgba(11,60,109,0.35)]">
          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
            <div className="xl:col-span-2">
              <div className="flex items-center gap-2 mb-5">
                <img src={logo} alt="Brand logo" className="w-44 h-14 object-contain" />
              </div>
              <p className="text-sm text-slate-600 max-w-md leading-relaxed">
                AI-powered interview preparation platform for HR and technical readiness with instant scoring,
                feedback, and progress tracking.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-sm mb-5 uppercase tracking-widest text-slate-400">Platform</h5>
              <ul className="space-y-3">
                <li><Link to="/" className="text-sm text-slate-700 hover:text-[#1E88E5] transition-colors">Home</Link></li>
                <li><Link to="/about" className="text-sm text-slate-700 hover:text-[#1E88E5] transition-colors">About Us</Link></li>
                <li><Link to="/pricing" className="text-sm text-slate-700 hover:text-[#1E88E5] transition-colors">Pricing</Link></li>
                <li><Link to="/blog" className="text-sm text-slate-700 hover:text-[#1E88E5] transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="text-sm text-slate-700 hover:text-[#1E88E5] transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-sm mb-5 uppercase tracking-widest text-slate-400">Legal</h5>
              <ul className="space-y-3">
                <li><Link to="/privacy-policy" className="text-sm text-slate-700 hover:text-[#1E88E5] transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="text-sm text-slate-700 hover:text-[#1E88E5] transition-colors">Terms of Service</Link></li>
                <li><Link to="/refund-cancellation-policy" className="text-sm text-slate-700 hover:text-[#1E88E5] transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs text-slate-500 text-center sm:text-left">© 2026 Hireloop. All rights reserved.</p>
            <div className="flex justify-center sm:justify-end gap-4">
              <button className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 hover:text-[#1E88E5] hover:border-[#1E88E5]/40 transition-colors flex items-center justify-center">
                <BsGrid size={16} />
              </button>
              <button className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 hover:text-[#1E88E5] hover:border-[#1E88E5]/40 transition-colors flex items-center justify-center">
                <BsShare size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
