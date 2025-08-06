import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "../Styles/Signup.css";
import floatingIcons from '../constants/FloatingIcons';

const ForgotPass = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await forgotPassword(email);
      setMessage('Check your email for the reset link.');
    } catch {
      setError('Failed to send reset link. Try again.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <h2>Forgot Password</h2>

        {error && <p className="error">{error}</p>}
        {message && <p style={{ color: '#CDF0EA', marginBottom: '1rem' }}>{message}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button type="submit" disabled={loading}>Send Reset Link</button>
        </form>

        <p className="login-link">
          <Link to="/login">Back to Login</Link>
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

export default ForgotPass;
