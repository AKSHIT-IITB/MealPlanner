import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
 
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo" onClick={() => setIsMenuOpen(false)}>
          <span className="logo-text">Meal Planner </span>
          <span className="logo-highlight">Buddy</span>
        </NavLink>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li className="navbar-item">
              <NavLink to="/" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                Home
              </NavLink>
            </li>
            <li className="navbar-item">
              <NavLink to="/daily-plan" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                Daily Plan
              </NavLink>
            </li> 
          </ul>
        </div>

        <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav> 
  );
};

export default Navbar;
