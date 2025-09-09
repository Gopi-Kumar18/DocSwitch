import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import "../Styles/Signup.css";
import floatingIcons from '../constants/FloatingIcons';


const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const ResetPass = () => {
  const { token } = useParams();
  const navigate  = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [message,  setMessage]  = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    const pw  = password.trim();
    const cpw = confirm.trim();

    if (pw !== cpw) {
      return setError('Passwords do not match.');
    }

    if (!passwordRegex.test(pw)) {
      return setError(
        'Password must be ≥8 chars, include 1 uppercase, 1 digit & 1 special.'
      );
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: pw });
      setMessage('Your password has been reset. You can now log in.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <h2>Reset Password</h2>

        {error   && <p className="error">{error}</p>}
        {message && <p style={{ color: '#CDF0EA', marginBottom: '1rem' }}>{message}</p>}

        {!message && (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />

            <button type="submit" disabled={loading} className="mt-4">
              Reset Password
            </button>
          </form>
        )}

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

export default ResetPass;
