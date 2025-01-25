import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const transactionStatus = params.get('status');
        const transactionId = params.get('transaction_id');

        const updatePaymentStatus = async () => {
            try {
                // Update the payment status in Firestore
                const paymentRef = doc(db, 'payments', transactionId);
                await updateDoc(paymentRef, {
                    status: transactionStatus,
                    updatedAt: new Date(),
                    paymentResponse: Object.fromEntries(params)
                });

                setStatus(transactionStatus);

                // Redirect to next section after 3 seconds if payment was successful
                if (transactionStatus === 'SUCCESS') {
                    setTimeout(() => {
                        navigate('/section-six');
                    }, 3000);
                }
            } catch (error) {
                console.error('Error updating payment status:', error);
                setStatus('error');
            }
        };

        updatePaymentStatus();
    }, [location, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-xl">
                <h1 className="mb-4 text-2xl font-bold text-center">
                    {status === 'SUCCESS' ? 'Payment Successful!' :
                        status === 'FAILED' ? 'Payment Failed' :
                            'Processing Payment...'}
                </h1>

                {status === 'SUCCESS' && (
                    <p className="text-center text-gray-600">
                        Redirecting to the next section...
                    </p>
                )}

                {status === 'FAILED' && (
                    <div className="text-center">
                        <p className="text-red-600">Your payment was not successful.</p>
                        <button
                            onClick={() => navigate('/section-five')}
                            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess; 