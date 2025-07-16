
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../Styles/Navbar.css';
import { ThemeContext } from '../otherComponents/ThemeContext';
import useAuth from '../hooks/useAuth'; 

const Navbar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    logout();
    navigate('/'); 
    setIsCollapsed(true); 
  };

  // useEffect(() => {
  //   if (darkMode) {
  //     document.body.classList.add('dark-theme');
  //     document.body.classList.remove('light-theme');
  //   } else {
  //     document.body.classList.add('light-theme');
  //     document.body.classList.remove('dark-theme');
  //   }
  // }, [darkMode]);

  return (
    <nav className={`custom-navbar navbar navbar-expand-lg ${darkMode ? 'dark-mode' : ''}`}>
      <div className="container">
        <Link className="navbar-brand" to="/">DocSwitch</Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={handleToggle} 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isCollapsed ? '' : 'show'}`}>
          <ul className="navbar-nav ms-auto">

            {user && (
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard" onClick={() => setIsCollapsed(true)}>
                  Dashboard
                </Link>
              </li>
            )}
            
            {!user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login" onClick={() => setIsCollapsed(true)}>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/signup" onClick={() => setIsCollapsed(true)}>
                    Sign Up
                  </Link>
                </li>
              </>
            )}
            
            {user && (
              <li className="nav-item">
                <button 
                  className="nav-link btn btn-link" 
                  onClick={handleLogout}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Logout
                </button>
              </li>
            )}
            
            <li className="nav-item">
              {/* <button 
                className="theme-toggle-btn" 
                onClick={toggleTheme}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? (
                  <i className="fas fa-sun"></i> // Sun icon for light mode
                ) : (
                  <i className="fas fa-moon"></i> // Moon icon for dark mode
                )}
              </button> */}
              <button className="theme-toggle-btn" onClick={toggleTheme}>
  {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
</button>

            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
