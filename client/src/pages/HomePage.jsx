import React from 'react'
import Navbar from '../components/homeComponents/Navbar'
import { Outlet, useParams } from 'react-router-dom';
import Tabs from '../components/homeComponents/Tabs';
import {HomeFooter} from "../components/homeComponents/Footer"

const HomePage = () => {
  const { type } = useParams();
  return (
    <>
      <div className='flex flex-col gap-5'>
        <Navbar/>
        <Tabs/>
        <Outlet/>
        <HomeFooter/>
      </div>
    </>
  )
}

export default HomePage