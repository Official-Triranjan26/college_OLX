import React from 'react'
import Navbar from '../components/homeComponents/Navbar'
import { RiShoppingCart2Line } from "react-icons/ri";
import { FaRegHeart } from "react-icons/fa";
import { MdOutlineSell } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { Link, Outlet, useParams } from 'react-router-dom';

const ProfilePage = () => {
  return <>

    <Navbar/>
    <aside className='bg-[#002f34] fixed left-0 top-0 w-1/4 h-full flex flex-col gap-2 pt-16 px-10'>
        <div className='w-full'><img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/profile-pic-male_4811a1.svg" alt="" className='w-full h-full object-cover' /></div>

        <Link to={"/profile/wishlist"}>
            <div className='w-full h-10 bg-white rounded-lg flex justify-evenly py-1 px-10'>
                <FaRegHeart className='text-2xl '/>
                <span className='text-xl text-gray-700 font-semibold'>Wishlist</span>
            </div>
        </Link>
        
        <Link to={"/profile/purchased"}>
            <div className='w-full h-10 bg-white rounded-lg flex justify-evenly py-1 px-10'>
                <RiShoppingCart2Line className='text-2xl '/>
                <span className='text-xl text-gray-700 font-semibold'>Purchased</span>
            </div>
        </Link>

        <Link to={"/profile/listed"}>
            <div className='w-full h-10 bg-white rounded-lg flex justify-evenly py-1 px-10'>
                <MdOutlineSell className='text-2xl '/>
                <span className='text-xl text-gray-700 font-semibold'>Listed</span>
            </div>
        </Link>

        <Link to={"/profile/sold"}>
            <div className='w-full h-10 bg-white rounded-lg flex justify-evenly py-1 px-10'>
                <img src="https://www.shutterstock.com/image-vector/sold-stamp-260nw-532020697.jpg"  className='w-10' alt="" />
                <span className='text-xl text-gray-700 font-semibold'>Sold Items</span>
            </div>
        </Link>

        
        <div className='w-full h-10 bg-white rounded-lg flex justify-evenly py-1 px-10'>
            <FaRegEdit className='text-2xl '/>
            <span className='text-xl text-gray-700 font-semibold'>Edit Profile</span>
        </div>
    </aside>
    <Outlet/>




    </>
  
}

export default ProfilePage