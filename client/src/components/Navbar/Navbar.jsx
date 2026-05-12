import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuth, user, logout } = useAuth();
  const navigate = useNavigate();
  const close = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    close();
  };

  const NAV_LINKS = isAuth
    ? [
        { to: '/meals', label: 'My Meals' },
        { to: '/daily-plan', label: 'Daily Plan' },
        { to: '/ai-advisor', label: 'AI Advisor' },
        { to: '/weekly-plan', label: 'Weekly Plan' },
      ]
    : [];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo" onClick={close}>
          <span className="logo-text">Meal Planner </span>
          <span className="logo-highlight">Buddy</span>
        </NavLink>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} className="navbar-link" onClick={close}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="navbar-auth">
            {isAuth ? (
              <>
                <span className="navbar-user">Hi, {user?.name?.split(' ')[0]}</span>
                <button className="navbar-logout" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="navbar-link" onClick={close}>Login</NavLink>
                <NavLink to="/login?tab=register" className="navbar-signup" onClick={close}>Sign Up</NavLink>
              </>
            )}
          </div>
        </div>

        <div
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(v => !v)}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
