import React from 'react'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FaTimes } from "react-icons/fa";
import Auth from '../pages/Auth';

function AuthModel({onClose}) {
    const {userData} = useSelector((state)=>state.user)

    useEffect(()=>{
        if(userData){
            onClose()
        }

    },[userData , onClose])

  return (
    <div className='fixed inset-0 z-[999] bg-black/30 backdrop-blur-sm px-3 sm:px-4 py-4 sm:py-6 overflow-y-auto'>
        <div className='relative w-full max-w-md mx-auto'>
            <button onClick={onClose} className='absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-700 hover:text-black text-xl z-10 bg-white/80 rounded-full p-2'>
             <FaTimes size={18}/>
            </button>
            <Auth isModel={true}/>


        </div>

      
    </div>
  )
}

export default AuthModel
