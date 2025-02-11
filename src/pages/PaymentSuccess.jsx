import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Wait a moment then redirect to dashboard
        const timer = setTimeout(() => {
            navigate('/dashboard');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 text-center bg-white rounded-lg shadow-xl">
                <h1 className="mb-4 text-3xl font-bold text-green-600">Payment Successful!</h1>
                <p className="text-gray-600">Your payment has been processed successfully.</p>
                <p className="mt-4 text-sm text-gray-500">Redirecting to dashboard...</p>
            </div>
        </div>
    );
};

export default PaymentSuccess; 