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

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

admin.initializeApp();

exports.onepayCallback = functions.https.onRequest(async (request, response) => {
    return cors(request, response, async () => {
        // Only allow POST requests
        if (request.method !== 'POST') {
            response.status(405).send('Method Not Allowed');
            return;
        }

        console.log(request);

        try {
            const paymentData = request.body;
            console.log('Payment callback received:', paymentData);

            // Verify the payment status
            if (paymentData.status === '1') {
                // Update payment status in Firestore
                const paymentRef = admin.firestore()
                    .collection('payments')
                    .where('reference', '==', paymentData.reference);

                const snapshot = await paymentRef.get();

                if (!snapshot.empty) {
                    const docId = snapshot.docs[0].id;
                    await admin.firestore()
                        .collection('payments')
                        .doc(docId)
                        .update({
                            status: 'Completed',
                            transactionId: paymentData.transaction_id,
                            paymentDate: admin.firestore.FieldValue.serverTimestamp(),
                            paymentDetails: paymentData
                        });

                    // Update the overall status in contacts collection
                    const userId = snapshot.docs[0].data().userId;
                    const contactRef = admin.firestore()
                        .collection('contacts')
                        .where('userId', '==', userId);

                    const contactSnapshot = await contactRef.get();
                    if (!contactSnapshot.empty) {
                        await contactSnapshot.docs[0].ref.update({
                            overallStatus: 'Pending'
                        });
                    }
                }
            }

            // Send response back to Onepay  
            response.status(200).json({ status: 'success' });
        } catch (error) {
            console.error('Error processing payment callback:', error);
            response.status(500).json({ status: 'error', message: error.message });
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
