import React, { useState } from "react";
import { motion } from "motion/react";
import { BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import logo from "../assets/logo.png";

const navItems = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "Pricing", path: "/pricing" },
  { label: "Blog", path: "/blog" },
  { label: "Contact Us", path: "/contact" },
];

function Navbar() {
  const { userData } = useSelector((state) => state.user);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const userInitial = userData?.name?.[0]?.toUpperCase() || null;

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + "/api/auth/logout", { withCredentials: true });
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      delete axios.defaults.headers.common.Authorization;
      dispatch(setUserData(null));
      setShowCreditPopup(false);
      setShowUserPopup(false);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex justify-between items-center relative"
      >
        <button onClick={() => navigate("/")} className="flex items-center gap-3">
          <img src={logo} alt="Brand logo" className="w-24 h-24 object-contain" />
        </button>

        <nav className="hidden md:flex items-center gap-5">
          {navItems.map((item) =>
            item.href ? (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-slate-700 hover:text-[#1E88E5] transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? "text-[#0B3C6D]" : "text-slate-700 hover:text-[#1E88E5]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            )
          )}
          {userData?.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-[#0B3C6D]" : "text-slate-700 hover:text-[#1E88E5]"
                }`
              }
            >
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3 relative">
          <div className="relative">
            <button
              onClick={() => {
                if (!userData) {
                  navigate("/login", { state: { from: location.pathname } });
                  return;
                }
                setShowCreditPopup(!showCreditPopup);
                setShowUserPopup(false);
              }}
              className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-full text-sm hover:bg-slate-200 transition"
            >
              <BsCoin size={18} />
              {userData?.credits || 0}
            </button>

            {showCreditPopup && (
              <div className="absolute right-0 mt-3 w-60 bg-white shadow-xl border border-slate-200 rounded-xl p-4 z-50">
                <p className="text-sm text-slate-600 mb-3">Need more credits for more interviews?</p>
                <button
                  onClick={() => navigate("/pricing")}
                  className="w-full bg-[#0B3C6D] hover:bg-[#1E88E5] text-white py-2 rounded-lg text-sm transition"
                >
                  View Plans
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                if (!userData) {
                  navigate("/login", { state: { from: location.pathname } });
                  return;
                }
                setShowUserPopup(!showUserPopup);
                setShowCreditPopup(false);
              }}
              className="w-9 h-9 bg-[#0B3C6D] text-white rounded-full flex items-center justify-center font-semibold"
            >
              {userData && userInitial ? userInitial : <FaUserAstronaut size={15} />}
            </button>

            {showUserPopup && (
              <div className="absolute right-0 mt-3 w-52 bg-white shadow-xl border border-slate-200 rounded-xl p-4 z-50">
                <p className="text-sm text-[#0B3C6D] font-medium mb-2 truncate">{userData?.name}</p>
                <button
                  onClick={() => navigate("/interview")}
                  className="w-full text-left text-sm py-2 hover:text-black text-slate-600"
                >
                  Attend Interview
                </button>
                <button
                  onClick={() => navigate("/history")}
                  className="w-full text-left text-sm py-2 hover:text-black text-slate-600"
                >
                  Interview History
                </button>
                <button onClick={handleLogout} className="w-full text-left text-sm py-2 flex items-center gap-2 text-red-500">
                  <HiOutlineLogout size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </header>
  );
}

export default Navbar;
