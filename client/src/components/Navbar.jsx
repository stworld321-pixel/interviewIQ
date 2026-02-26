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
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "Pricing", path: "/pricing" },
];

function Navbar() {
  const { userData } = useSelector((state) => state.user);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + "/api/auth/logout", { withCredentials: true });
      localStorage.removeItem("token");
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
    <div className="bg-slate-50 flex justify-center px-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-6xl bg-white rounded-[24px] shadow-sm border border-slate-200 px-5 md:px-8 py-4 flex justify-between items-center relative"
      >
        <button onClick={() => navigate("/")} className="flex items-center gap-3">
          <img src={logo} alt="Brand logo" className="w-50 h-20 object-contain" />
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm transition ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {userData?.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm transition ${
                  isActive ? "bg-[#0B3C6D] text-white" : "text-[#0B3C6D] hover:bg-blue-50"
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
                  className="w-full bg-black text-white py-2 rounded-lg text-sm"
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
              className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold"
            >
              {userData ? userData?.name.slice(0, 1).toUpperCase() : <FaUserAstronaut size={15} />}
            </button>

            {showUserPopup && (
              <div className="absolute right-0 mt-3 w-52 bg-white shadow-xl border border-slate-200 rounded-xl p-4 z-50">
                <p className="text-sm text-emerald-700 font-medium mb-2 truncate">{userData?.name}</p>
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
    </div>
  );
}

export default Navbar;
