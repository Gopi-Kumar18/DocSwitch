

import React, {useContext} from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../otherComponents/ThemeContext';
import '../Styles/Footer.css';
import logo from '../assets/logo-1.png'; 

const Footer = () => {
  const { darkMode } = useContext(ThemeContext);
  return (
    <>
     <footer
      className={`footer ${darkMode ? 'dark-theme' : 'light-theme'}`}
    >
      <div className="footer-container">

        
        <div className="footer-section">
          <div className="section-header">
            <h3>Company</h3>
          </div>
          <ul>
            <li><Link to="/about-us">About Us</Link></li>
            <li><Link to="/contact-us">Contact Us</Link></li>
            <li><Link to="/faqs">FAQs</Link></li>
            <li><Link to="/features">Features</Link></li>
           <li><Link to="/docswitch-web-developers">Developers</Link></li>
          </ul>
        </div>

       

        {/* Follow Us */}
        <div className="footer-section follow-us-section">
          <div className="section-header">
            <h3>Follow Us</h3>
          </div>
          <div className="social-media-links">
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-linkedin"></i>
            </a>
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-instagram"></i>
            </a>

            <a
  href="https://x.com/"
  target="_blank"
  rel="noopener noreferrer">
  <i className="fab fa-twitter"></i>
</a>


            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer">
              <i className="fab fa-github"></i>
          </a>

          </div>
        </div>

        <div className="footer-section">
          <div className="section-header">
            <h3>Terms and Privacy</h3>
           <ul>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms-and-conditions">Terms And Conditions</Link></li>
          </ul>
          </div>
        </div>

    </div>

    </footer>

    <footer>
      <div className="footer-bottom" style={{
            backgroundImage: `url(${logo})`,
          }}>
      </div>
    </footer>
    </>
  );
};

export default Footer;


