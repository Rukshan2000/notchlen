/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({ origin: true });
const axios = require('axios');
const SHA256 = require('crypto-js/sha256');

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

admin.initializeApp();

exports.onepayCallback = functions.https.onRequest((request, response) => {
    return cors(request, response, async () => {
        if (request.method !== 'POST') {
            return response.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const paymentData = request.body;
            console.log('Payment callback received:', paymentData);

            // Parse the additional_data JSON string
            const additionalData = JSON.parse(paymentData.additional_data);
            const userId = additionalData.userId;
            console.log("userId", userId);

            if (paymentData.status === '1' || paymentData.status === 1) {
                console.log("status is 1 doing the update");
                // Update payment status in Firestore
                const onepayRef = admin.firestore()
                    .collection('onepay')
                    .where('reference', '==', additionalData.reference);

                const snapshot = await onepayRef.get();

                if (!snapshot.empty) {
                    const docId = snapshot.docs[0].id;
                    await admin.firestore()
                        .collection('onepay')
                        .doc(docId)
                        .update({
                            status: 'Completed',
                            transactionId: paymentData.transaction_id,
                            paymentDate: admin.firestore.FieldValue.serverTimestamp(),
                            additionalData: additionalData
                        });

                    // // Update the overall status in contacts collection
                    // const userId = snapshot.docs[0].data().userId;
                    // const contactRef = admin.firestore()
                    //     .collection('contacts')
                    //     .where('userId', '==', userId);

                    // const contactSnapshot = await contactRef.get();
                    // if (!contactSnapshot.empty) {
                    //     await contactSnapshot.docs[0].ref.update({
                    //         overallStatus: 'Pending'
                    //     });
                    // }
                }
            }

            // Send response back to Onepay  
            response.status(200).json({ status: 'success' });
        } catch (error) {
            console.error('Error processing payment callback:', error);
            return response.status(500).json({ error: error.message });
        }
    });
});

exports.sendEmail = functions.https.onRequest((request, response) => {
    return cors(request, response, async () => {
        try {
            const data = request.body;
            const transporter = nodemailer.createTransport({
                host: 'smtp.zoho.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.ZOHO_EMAIL,
                    pass: process.env.ZOHO_PASSWORD
                }
            });

            await transporter.sendMail({
                from: process.env.ZOHO_EMAIL,
                to: data.to,
                subject: data.message.subject,
                html: data.message.html
            });

            response.status(200).json({ success: true });
        } catch (error) {
            console.error('Error sending email:', error);
            response.status(500).json({
                status: 'error',
                message: 'Failed to send email'
            });
        }
    });
});

exports.sendSMS = functions.https.onRequest((request, response) => {
    return cors(request, response, async () => {
        try {
            const data = request.body;
            const phoneNumber = data.to;
            const apiKey = process.env.DIALOG_URL_MESSAGE_KEY;
            const mask = 'NOTCHLN';
            const message = data.message;

            const smsUrl = `https://e-sms.dialog.lk/api/v1/message-via-url/create/url-campaign?esmsqk=${apiKey}&list=${phoneNumber}&message=${message}`;
            console.log("smsUrl", smsUrl);
            const smsResponse = await fetch(smsUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            // if (!smsResponse.ok) {
            //     throw new Error('Failed to send SMS');
            // }

            response.status(200).json({ data: smsResponse });
        } catch (error) {
            console.error('Error sending SMS:', error);
            response.status(500).json({
                status: 'error',
                message: 'Failed to send SMS'
            });
        }
    });
});

exports.initiatePayment = functions.https.onRequest((request, response) => {
    return cors(request, response, async () => {
        if (request.method !== 'POST') {
            return response.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { amount, userId } = request.body;
            const reference = `ref${new Date().getTime()}`;
            const currency = "LKR";
            const appId = process.env.ONEPAY_APP_ID;
            const hashSalt = process.env.ONEPAY_HASH_SALT;
            const hashString = appId + currency + amount + hashSalt;
            const hash = SHA256(hashString).toString();

            // Get contact data from Firestore
            const contactSnapshot = await admin.firestore()
                .collection('contacts')
                .where('userId', '==', userId)
                .get();
            const contactData = contactSnapshot.docs[0]?.data();

            // Save reference to Firestore
            await admin.firestore().collection('onepay').add({
                userId: userId,
                reference: reference,
                status: 'Pending',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Prepare payment data
            const paymentData = {
                currency: "LKR",
                amount: amount,
                app_id: appId,
                reference: reference,
                customer_first_name: "Mr./Mrs.",
                customer_last_name: contactData?.contactPersonName || "xxxx",
                customer_phone_number: contactData?.contactPersonPhone || "+94777777777",
                customer_email: contactData?.contactPersonEmail || "user@example.com",
                transaction_redirect_url: `${process.env.APP_URL}/section-five`,
                hash: hash,
                additional_data: JSON.stringify({
                    userId: userId,
                    reference: reference,
                    enteredAmount: amount,
                    timestamp: new Date().toISOString()
                })
            };

            // Make request to Onepay
            const onepayResponse = await axios.post('https://api.onepay.lk/v3/checkout/link/',
                paymentData,
                {
                    headers: {
                        'Authorization': process.env.ONEPAY_AUTH_TOKEN,
                        'Content-Type': 'application/json'
                    }
                }
            );

            response.status(200).json({
                redirectUrl: onepayResponse.data.data.gateway.redirect_url
            });
        } catch (error) {
            console.error('Payment initiation error:', error);
            return response.status(500).json({ error: 'Payment initiation failed' });
        }
    });
}); 
