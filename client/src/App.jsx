import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import { useEffect } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthChecked, setUserData } from './redux/userSlice'
import InterviewPage from './pages/InterviewPage'
import InterviewHistory from './pages/InterviewHistory'
import Pricing from './pages/Pricing'
import InterviewReport from './pages/InterviewReport'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import AdminDashboard from './pages/AdminDashboard'
import Blog from './pages/Blog'
import BlogDetail from './pages/BlogDetail'
import AdminBlogs from './pages/AdminBlogs'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

export const ServerUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:8000" : "https://interviewiq-1-server.onrender.com")

function ProtectedRoute({ children }) {
  const { userData, authChecked } = useSelector((state) => state.user)
  const location = useLocation()

  if (!authChecked) {
    return null
  }

  if (!userData) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}

function AdminRoute({ children }) {
  const { userData, authChecked } = useSelector((state) => state.user)
  const location = useLocation()

  if (!authChecked) {
    return null
  }

  if (!userData) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (userData.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {

  const dispatch = useDispatch()
  useEffect(()=>{
    const storedToken = localStorage.getItem("token")
    const cachedUser = localStorage.getItem("userData")
    if (storedToken) {
      axios.defaults.headers.common.Authorization = `Bearer ${storedToken}`
      if (cachedUser) {
        try {
          dispatch(setUserData(JSON.parse(cachedUser)))
        } catch {
          localStorage.removeItem("userData")
        }
      }
    } else {
      delete axios.defaults.headers.common.Authorization
      localStorage.removeItem("userData")
    }

    const getUser = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/user/current-user", {withCredentials:true})
        dispatch(setUserData(result.data))
        localStorage.setItem("userData", JSON.stringify(result.data))
      } catch (error) {
        const status = error?.response?.status
        if (status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("userData")
          delete axios.defaults.headers.common.Authorization
          dispatch(setUserData(null))
        } else {
          // Keep existing cached session for transient server/network errors.
          console.log("Auth check skipped due to non-auth error:", error?.message || error)
        }
      } finally {
        dispatch(setAuthChecked(true))
      }
    }
    getUser()

  },[dispatch])
  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/auth' element={<Auth/>}/>
      <Route path='/login' element={<Auth defaultMode="login" />}/>
      <Route path='/register' element={<Auth defaultMode="register" />}/>
      <Route path='/forgot-password' element={<ForgotPassword/>}/>
      <Route path='/reset-password/:token' element={<ResetPassword/>}/>
      <Route path='/interview' element={<ProtectedRoute><InterviewPage/></ProtectedRoute>}/>
      <Route path='/history' element={<InterviewHistory/>}/>
      <Route path='/about' element={<AboutUs/>}/>
      <Route path='/contact' element={<ContactUs/>}/>
      <Route path='/pricing' element={<Pricing/>}/>
      <Route path='/blog' element={<Blog/>}/>
      <Route path='/blog/:slug' element={<BlogDetail/>}/>
      <Route path='/report/:id' element={<InterviewReport/>}/>
      <Route path='/admin' element={<AdminRoute><AdminDashboard/></AdminRoute>}/>
      <Route path='/admin/blogs' element={<AdminRoute><AdminBlogs/></AdminRoute>}/>



    </Routes>
  )
}

export default App
