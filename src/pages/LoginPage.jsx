import React, { useState } from 'react';
import { signIn } from '../auth';
import { getUserRole, getUserDocumentByEmail } from '../firestore';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import bgVideo from '../assets/bg.mp4'; // Importing the background video
import logo from '../assets/long.png'; // Importing the new logo image

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { dispatch } = useUserContext();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const user = await signIn(email, password);
      const userDoc = await getUserDocumentByEmail(email);
      const role = await getUserRole(userDoc.id);

      dispatch({
        type: 'SET_USER',
        payload: {
          email: user.email,
          uid: user.uid,
          role: role,
        }
      });

      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* Background video */}
      <video
        className="absolute top-0 left-0 object-cover w-full h-full"
        src={bgVideo}
        autoPlay
        loop
        muted
      />

      {/* White opacity overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-white opacity-50"></div>

      {/* Glassmorphism login form */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="p-8 bg-white rounded-lg shadow-lg bg-opacity-30 backdrop-blur-xl w-96">
          {/* Logo */}
          <div className="mb-6 text-center">
            <img src={logo} alt="Logo" className="w-40 mx-auto" />
          </div>

          {error && <p className="text-red-500 error">{error}</p>}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block mb-2 font-medium text-black" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block mb-2 font-medium text-black" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                required
              />
            </div>
            {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full px-4 py-2 font-medium text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
            >
              Login
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-black">Don't have an account? <a href="/signup" className="text-blue-500">Sign Up</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
