import React from "react";
import { BsRobot } from "react-icons/bs";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-slate-50 px-4 pb-10 pt-8">
      <div className="max-w-6xl mx-auto bg-white border border-slate-200 rounded-3xl p-7 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-black text-white p-2 rounded-lg">
                <BsRobot size={16} />
              </div>
              <h2 className="font-semibold">InterviewIQ.AI</h2>
            </div>
            <p className="text-sm text-slate-600 mt-3 max-w-xl">
              AI-powered interview preparation platform built to improve confidence, communication, and technical performance.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <Link to="/" className="text-slate-600 hover:text-black">Home</Link>
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
