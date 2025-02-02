import React, { useState } from 'react';
import { signUp } from '../auth'; 
import { addUserToFirestore } from '../firestore'; 
import bgVideo from '../assets/bg.mp4'; // Importing the background video
import logo from '../assets/long.png'; // Importing the logo image
import { useNavigate} from 'react-router-dom'; // Import useNavigate for redirection

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(''); // Reset error state

    try {
      const user = await signUp(email, password); // Sign up the user
      await addUserToFirestore(user.uid, { email, name }); // Add user to Firestore
          navigate('/');
    } catch (error) {
      setError(error.message); // Set error message
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

      {/* Glassmorphism signup form */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="p-8 bg-white rounded-lg shadow-lg bg-opacity-30 backdrop-blur-xl w-96">
          {/* Logo */}
          <div className="mb-6 text-center">
            <img src={logo} alt="Logo" className="w-40 mx-auto" />
          </div>

          {error && <p className="mb-4 text-red-500">{error}</p>}

          <form onSubmit={handleSignUp}>
            <div className="mb-4">
              <label className="block mb-2 font-medium text-black" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium text-black" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium text-black" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block mb-2 font-medium text-black" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-medium text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
            >
              Register
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-black">Already have an account? <a href="/" className="text-blue-500">Login</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
