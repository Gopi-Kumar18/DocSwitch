import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import "../Styles/Signup.css";
import floatingIcons from '../constants/FloatingIcons';

const emailRegex    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const Login = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    const em = email.trim();
    const pw = password.trim();

    if (!emailRegex.test(em)) {
      return setError('Email must be a valid gmail.com or hotmail.com address.');
    }
    // if (!passwordRegex.test(pw)) {
    //   return setError(
    //     'Password must be ≥8 chars, include 1 uppercase, 1 lowercase, 1 digit & 1 special.'
    //   );
    // }

    try {
      await login(em, pw);
      navigate('/');
    } catch {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
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
            Login
          </button>

          <p className="forgot-password">
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>
        </form>
      </div>

      <p className="signup-link">
        Don’t have an account? <Link to="/signup">Sign up</Link>
      </p>

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

export default Login;

