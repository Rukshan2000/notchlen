// App.js
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
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
import SideNav from './components/SideNav';  // Import the SideNav component
import AdminDashboard from './pages/AdminDashboard';
import { UserProvider } from './context/UserContext';
import PaymentSuccess from './pages/PaymentSuccess';
import EmailVerificationCallback from './pages/EmailVerificationCallback';


const App = () => {
  return (
    <UserProvider>
      <BrowserRouter>
        <div className="flex h-screen">
          <SideNav />  {/* Render the SideNav component */}

          <div className="flex-grow p-4">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/form" element={<Form />} />
              <Route path="/section-one" element={<SectionOne />} />
              <Route path="/section-two" element={<SectionTwo />} />
              <Route path="/section-three" element={<SectionThree />} />
              <Route path="/section-four" element={<SectionFour />} />
              <Route path="/section-five" element={<SectionFive />} />
              <Route path='/section-six' element={<SectionSix />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/adminDashboard" element={<AdminDashboard />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/verify-email" element={<EmailVerificationCallback />} />

              {/* You can add more routes here */}
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;
