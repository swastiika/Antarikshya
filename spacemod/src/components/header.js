import React from "react";
import './header.css';
const Header = ()=>{
    return(
   <header className="header">
    <div className="header-container">
    <div className="header-contents">
        <h3 className="app-name">Antarekshya</h3>
        <ul className="nav-list">
            <li>
                <a className="nav-link" href="/">Home</a>
            </li>
            <li>
                <a className="nav-link" href="/Astrology">Astrology</a>
            </li>
            <li>
                <a className="nav-link" href="/About">About</a>
            </li>
            <li>
                <a className="nav-link" href="/Contact">Contact</a>
            </li>
        </ul>
 
    </div>
    </div>
   </header>
    );
};
export default Header;