import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-container">

      <h2>Login</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>

        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
        
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;