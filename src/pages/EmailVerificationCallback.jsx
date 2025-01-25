import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { applyActionCode } from 'firebase/auth';

const EmailVerificationCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                // Get the action code from the URL
                const urlParams = new URLSearchParams(window.location.search);
                const actionCode = urlParams.get('oobCode');

                if (actionCode) {
                    // Apply the action code
                    await applyActionCode(auth, actionCode);

                    // Show success message
                    alert('Email verified successfully!');

                    // Redirect back to the form
                    navigate('/section-one');
                } else {
                    throw new Error('No verification code found');
                }
            } catch (error) {
                console.error('Error verifying email:', error);
                alert('Error verifying email. Please try again.');
                navigate('/section-one');
            }
        };

        verifyEmail();
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 text-center bg-white rounded-lg shadow-md">
                <h1 className="mb-4 text-2xl font-bold">Verifying Email...</h1>
                <p>Please wait while we verify your email address.</p>
            </div>
        </div>
    );
};

export default EmailVerificationCallback; 