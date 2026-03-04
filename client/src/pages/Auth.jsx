import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BsCheckCircleFill,
  BsBriefcase,
  BsBuilding,
  BsEye,
  BsEyeSlash,
  BsEnvelope,
  BsGoogle,
  BsLinkedin,
  BsLock,
  BsMortarboard,
  BsPerson,
  BsRocket,
} from "react-icons/bs";
import { auth, provider } from "../utils/firebase";
import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import signupImage from "../assets/Signup.png";
import logo from "../assets/logo.png";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Auth({ defaultMode = "login" }) {
  const isRegister = defaultMode === "register";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const requestedPath = location.state?.from;
  const redirectTo =
    requestedPath && requestedPath !== "/" && requestedPath !== "/login" && requestedPath !== "/register"
      ? requestedPath
      : "/interview";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("seeker");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const registerSubtitle = useMemo(
    () => "Create your account and start preparing with AI-powered interviews.",
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const safeEmail = email.trim().toLowerCase();
    if (!safeEmail || !password || (isRegister && !name.trim())) {
      setError("Please fill all required fields.");
      return;
    }
    if (isRegister && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      setLoading(true);
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const payload = isRegister
        ? { name: name.trim(), email: safeEmail, password }
        : { email: safeEmail, password, rememberMe };

      const result = await axios.post(ServerUrl + endpoint, payload, { withCredentials: true });
      if (result.data?.token) {
        localStorage.setItem("token", result.data.token);
        axios.defaults.headers.common.Authorization = `Bearer ${result.data.token}`;
      }
      localStorage.setItem("userData", JSON.stringify(result.data));
      dispatch(setUserData(result.data));
      navigate(redirectTo, { replace: true });
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      if (!auth || !provider) {
        setError("Google sign-in is not configured on this deployment.");
        return;
      }
      setError("");
      setLoading(true);
      const response = await signInWithPopup(auth, provider);
      const user = response.user;
      const result = await axios.post(
        ServerUrl + "/api/auth/google",
        { name: user.displayName, email: user.email },
        { withCredentials: true }
      );
      if (result.data?.token) {
        localStorage.setItem("token", result.data.token);
        axios.defaults.headers.common.Authorization = `Bearer ${result.data.token}`;
      }
      localStorage.setItem("userData", JSON.stringify(result.data));
      dispatch(setUserData(result.data));
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.log(err);
      setError("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  if (isRegister) {
    return (
      <div className="font-display bg-[#f6f6f8] text-slate-900 antialiased min-h-screen">
        <Navbar />
        <div className="flex min-h-[calc(100vh-160px)] w-full">
          <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0B3C6D] via-[#1E88E5] to-[#0B3C6D]">
            <div className="absolute inset-0 z-0 opacity-25 bg-[radial-gradient(circle_at_top_right,#fb923c_0%,transparent_40%),radial-gradient(circle_at_bottom_left,#fdba74_0%,transparent_45%)]"></div>
            <div className="absolute inset-0 z-10 flex flex-col justify-center px-20">
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <img src={logo} alt="Brand logo" className="w-50 h-50 object-contain" />
                </div>
                <h1 className="text-6xl font-black leading-tight mb-6 text-white">
                  The future of <br />
                  <span className="text-[#fdba74]">interview prep</span> <br />
                  is here.
                </h1>
                <p className="text-xl text-slate-100/90 max-w-md leading-relaxed">
                  Join professionals using our AI assistant to land their dream roles.
                </p>
              </div>

              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
                <img
                  src={signupImage}
                  alt="Signup visual"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-12 flex gap-8">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">98%</span>
                  <span className="text-sm text-slate-200 uppercase tracking-widest font-semibold">Success Rate</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">200+</span>
                  <span className="text-sm text-slate-200 uppercase tracking-widest font-semibold">Skill Modules</span>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#fb923c]/25 rounded-full blur-3xl"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#fdba74]/25 rounded-full blur-3xl"></div>
          </div>

          <div className="w-full lg:w-1/2 h-full flex flex-col bg-white overflow-y-auto">
            <header className="p-8 flex justify-end lg:absolute lg:top-0 lg:right-0">
              <p className="text-sm text-slate-500">
                Already have an account?
                <Link className="text-[#0B3C6D] font-bold hover:underline ml-1" to="/login">
                  Log In
                </Link>
              </p>
            </header>

            <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-[440px]"
              >
                <div className="mb-10">
                  <h2 className="text-3xl font-black mb-2 tracking-tight">Create Account</h2>
                  <p className="text-slate-500 font-medium">{registerSubtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                    <div className="relative">
                      <BsPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border-slate-200 bg-slate-50 focus:ring-[#0B3C6D] focus:border-[#0B3C6D] transition-all"
                        placeholder="John Doe"
                        type="text"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                    <div className="relative">
                      <BsEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border-slate-200 bg-slate-50 focus:ring-[#0B3C6D] focus:border-[#0B3C6D] transition-all"
                        placeholder="john@company.com"
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Create Password</label>
                    <div className="relative">
                      <BsLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border-slate-200 bg-slate-50 focus:ring-[#0B3C6D] focus:border-[#0B3C6D] transition-all"
                        placeholder="••••••••"
                        type="password"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">I am a...</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setUserRole("seeker")}
                        className={`flex flex-col items-center justify-center p-3 text-xs font-bold rounded-lg border transition-all ${
                          userRole === "seeker"
                            ? "border-[#0B3C6D] bg-[#0B3C6D]/5 text-[#0B3C6D]"
                            : "border-slate-200 text-slate-500"
                        }`}
                      >
                        <BsBriefcase className="mb-1" />
                        Job Seeker
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserRole("student")}
                        className={`flex flex-col items-center justify-center p-3 text-xs font-bold rounded-lg border transition-all ${
                          userRole === "student"
                            ? "border-[#0B3C6D] bg-[#0B3C6D]/5 text-[#0B3C6D]"
                            : "border-slate-200 text-slate-500"
                        }`}
                      >
                        <BsMortarboard className="mb-1" />
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserRole("employer")}
                        className={`flex flex-col items-center justify-center p-3 text-xs font-bold rounded-lg border transition-all ${
                          userRole === "employer"
                            ? "border-[#0B3C6D] bg-[#0B3C6D]/5 text-[#0B3C6D]"
                            : "border-slate-200 text-slate-500"
                        }`}
                      >
                        <BsBuilding className="mb-1" />
                        Employer
                      </button>
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <button
                    className="w-full py-4 bg-gradient-to-r from-[#0B3C6D] via-[#1E88E5] to-[#f97316] text-white font-bold rounded-xl shadow-lg shadow-[#0B3C6D]/25 hover:shadow-[#f97316]/30 active:scale-[0.98] transition-all mt-4 disabled:opacity-60"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Please wait..." : "Create Account"}
                  </button>
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or sign up with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="col-span-2 flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-60"
                  >
                    <BsGoogle className="text-[#4285F4]" />
                    <span className="text-sm font-bold text-slate-700">Google</span>
                  </button>
                </div>

                <p className="text-center text-xs text-slate-400 mt-10 px-8">
                  By signing up, you agree to our{" "}
                  <Link to="/terms-of-service" className="underline hover:text-slate-600">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy-policy" className="underline hover:text-slate-600">
                    Privacy Policy
                  </Link>.
                </p>
                <p className="text-center text-sm text-slate-600 mt-5">
                  Already have an account?{" "}
                  <Link className="text-[#0B3C6D] font-bold hover:underline" to="/login">
                    Login
                  </Link>
                </p>
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
                  <Link to="/privacy-policy" className="hover:text-slate-700 underline">
                    Privacy Policy
                  </Link>
                  <span>|</span>
                  <Link to="/terms-of-service" className="hover:text-slate-700 underline">
                    Terms of Service
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-slate-900">
      <Navbar />
      <div className="flex min-h-[calc(100vh-160px)]">
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden bg-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#1d4ed8_0%,transparent_42%),radial-gradient(circle_at_top_right,#0B3C6D_0%,transparent_40%),radial-gradient(circle_at_bottom_right,#1e3a8a_0%,transparent_45%)]" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#0B3C6D]/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0B3C6D]/15 rounded-full blur-[120px]" />

          <div className="relative z-10 w-full max-w-lg">
            <div className="rounded-xl p-8 shadow-2xl border border-white/20 bg-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <img src={logo} alt="Brand logo" className="w-20 h-15 object-contain" />
                <h3 className="text-white font-bold text-xl">AI Feedback Insight</h3>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-slate-300 text-sm mb-2 uppercase tracking-wider font-semibold">Communication Clarity</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#0B3C6D] h-full w-[92%]"></div>
                    </div>
                    <span className="text-white font-bold text-lg">92%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-slate-200 text-lg italic leading-relaxed">
                    "Your communication clarity is in the top 5% of candidates."
                  </p>
                  <div className="flex items-center gap-2 text-[#1E88E5]">
                    <BsCheckCircleFill className="text-sm" />
                    <span className="text-sm font-medium">Verified by Hireloop Engine</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Master Your Next Interview</h2>
                <p className="text-slate-300 text-lg">Join professionals using AI to land their dream jobs.</p>
              </div>
            </div>
          </div>

        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 bg-white">
          <div className="w-full max-w-md">
            <div className="mb-10 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-8">
                <img src={logo} alt="Brand logo" className="w-14 h-14 object-contain" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
              <p className="text-slate-500">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#0B3C6D] focus:border-transparent transition-all shadow-sm"
                  placeholder="name@company.com"
                  type="email"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-semibold text-slate-700">Password</label>
                  <Link to="/forgot-password" className="text-sm font-semibold text-[#0B3C6D] hover:text-[#1E88E5] transition-colors">
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#0B3C6D] focus:border-transparent transition-all shadow-sm pr-12"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <BsEyeSlash size={18} /> : <BsEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  className="h-4 w-4 rounded border-slate-300 text-[#0B3C6D] focus:ring-[#0B3C6D] bg-white"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  type="checkbox"
                  id="remember"
                />
                <label className="ml-2 block text-sm text-slate-600" htmlFor="remember">
                  Remember me for 30 days
                </label>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                className="w-full py-4 px-6 bg-gradient-to-r from-[#0B3C6D] to-[#1E88E5] hover:from-[#1E88E5] hover:to-[#0B3C6D] text-white font-bold rounded-lg shadow-lg shadow-[#0B3C6D]/20 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="col-span-2 flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700 disabled:opacity-60"
              >
                <BsGoogle className="text-[#0B3C6D]" /> Google
              </button>
            </div>

            <p className="mt-10 text-center text-slate-600">
              Don't have an account?{" "}
              <Link to="/register" className="font-bold text-[#0B3C6D] hover:underline transition-all">
                Sign up for free
              </Link>
            </p>
          </div>

          <div className="mt-10 flex gap-6 text-xs text-slate-400 font-medium">
            <Link to="/privacy-policy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-slate-600 transition-colors">Help Center</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Auth;
