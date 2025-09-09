import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import "../Styles/Signup.css";
import floatingIcons from '../constants/FloatingIcons';

const nameRegex     = /^[A-Za-z ]{1,25}$/;
const emailRegex    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const Signup = () => {
  const [name,    setName]     = useState('');
  const [email,   setEmail]    = useState('');
  const [password,setPassword] = useState('');
  const [error,   setError]    = useState('');
  const { signup }             = useAuth();
  const navigate               = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    const n  = name.trim();
    const em = email.trim();
    const pw = password.trim();

    if (!nameRegex.test(n)) {
      return setError('Name: letters and spaces only, max 25 characters.');
    }
    if (!emailRegex.test(em)) {
      return setError('Email must include “@” and “.” and a valid domain.');
    }
    if (!passwordRegex.test(pw)) {
      return setError(
        'Password must be ≥8 chars, include 1 uppercase, 1 digit & 1 special.'
      );
    }

    try {
      await signup(n, em, pw);
      navigate('/login');
    } catch {
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <h2>Sign Up</h2>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="mt-4">
            Sign Up
          </button>
        </form>

        <p className="signup-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>

      <div className="doc-floating-icons">
        {floatingIcons.map(({ icon, label, top, left }, i) => (
          <div
            key={i}
            className="doc-floating-icon"
            style={{ top, left }}
            title={label}
          >
            <i className={icon}></i>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Signup;

