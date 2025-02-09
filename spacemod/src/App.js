import './App.css';
import Header  from './header';
import React,{useEffect} from 'react';
import TwinklingStars from './twinkle';
function App() {
  return (
    <>
    <Header/>
    <TwinklingStars/>
   
   <div className='button-container'>
    <button className='buttn'>Start</button>
   </div>
   
   </>
  );
}

export default App;
