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

export const ServerUrl  = import.meta.env.VITE_API_URL || "http://localhost:8000"

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

function App() {

  const dispatch = useDispatch()
  useEffect(()=>{
    const getUser = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/user/current-user", {withCredentials:true})
        dispatch(setUserData(result.data))
      } catch (error) {
        console.log(error)
        dispatch(setUserData(null))
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
      <Route path='/interview' element={<ProtectedRoute><InterviewPage/></ProtectedRoute>}/>
      <Route path='/history' element={<InterviewHistory/>}/>
      <Route path='/about' element={<AboutUs/>}/>
      <Route path='/contact' element={<ContactUs/>}/>
      <Route path='/pricing' element={<Pricing/>}/>
      <Route path='/report/:id' element={<InterviewReport/>}/>



    </Routes>
  )
}

export default App
