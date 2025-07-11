import React from 'react';
import {
  FaYoutube,
  FaLinkedin,
  FaTwitter,
  FaHeart
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <h2 className="footer-logo">Meal Planner Buddy</h2>
        <div className="footer-social">
            <a href="https://www.youtube.com/@MedTechDiaries8" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube /></a>
            <a href="https://www.linkedin.com/in/akshit-kumar-7069392b9" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="https://x.com/Akshit_iitb_27" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaTwitter /></a>

        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Meal Planner Buddy — Made with <FaHeart className="footer-heart" /> by Akshit Kumar</p>
      </div>
    </footer>
  );
};

export default Footer;
