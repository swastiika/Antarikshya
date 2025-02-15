import './App.css';
import Header from './components/header';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from 'react';
import TwinklingStars from './components/twinkle';
import Antarikshya from "./components/start";
import { Link, Outlet } from "react-router-dom";

function Layout() {
  return (
    <div>
      <Header />
     
      <Outlet /> 
    </div>
  );
}

function Home() {
  return (
    <div className='button-container'>
       <TwinklingStars /> 
      <Link to={"/antarikshya"}>
        <button className='buttn'>Start</button>
      </Link>
      <p className='text-1'>Let me take you to our Antarikshya</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="antarikshya" element={<Antarikshya />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
