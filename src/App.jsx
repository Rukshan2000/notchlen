// App.js
import React from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Form from './components/PaginatedForm';
import SectionOne from './form/sectionOne'
import SectionTwo from './form/sectionTwo'
import SectionThree from './form/sectionThree'
import SectionFour from './form/sectionFour'
import SectionFive from './form/sectionFive'
import SectionSix from './form/sectionSix'
import Login from './pages/LoginPage';
import SignUp from './pages/SignUp';
import Dashboard from './pages/UserDashboard';
import SideNav from './components/TopNav';  // Import the SideNav component
import AdminDashboard from './pages/AdminDashboard';
import { UserProvider } from './context/UserContext';
import PaymentSuccess from './pages/PaymentSuccess';
import EmailVerificationCallback from './pages/EmailVerificationCallback';
import favicon from './assets/favicon.png'; // Updated favicon path
import ProtectedRoute from './components/ProtectedRoute';
import TopNav from './components/TopNav';


const setFavicon = (faviconUrl) => {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = faviconUrl;
  document.head.appendChild(link);
};

const setTitle = (title) => {
  document.title = title;
};

setFavicon(favicon);
setTitle('Dashboard');

// Create a wrapper component to handle conditional rendering of TopNav
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';
  const isSignupPage = location.pathname === '/signup';

  return (
    <div className="flex h-screen">
      {!isLoginPage && !isSignupPage && <SideNav />}
      {!isLoginPage && !isSignupPage && <TopNav />}
      <div className="flex-grow p-4">
        {children}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-email" element={<EmailVerificationCallback />} />

            {/* Protected Routes */}
            <Route path="/form" element={
              <ProtectedRoute>
                <Form />
              </ProtectedRoute>
            } />
            <Route path="/section-one" element={
              <ProtectedRoute>
                <SectionOne />
              </ProtectedRoute>
            } />
            <Route path="/section-two" element={
              <ProtectedRoute>
                <SectionTwo />
              </ProtectedRoute>
            } />
            <Route path="/section-three" element={
              <ProtectedRoute>
                <SectionThree />
              </ProtectedRoute>
            } />
            <Route path="/section-four" element={
              <ProtectedRoute>
                <SectionFour />
              </ProtectedRoute>
            } />
            <Route path="/section-five" element={
              <ProtectedRoute>
                <SectionFive />
              </ProtectedRoute>
            } />
            <Route path="/section-six" element={
              <ProtectedRoute>
                <SectionSix />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/adminDashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/payment-success" element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            } />

            {/* You can add more routes here */}
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;
