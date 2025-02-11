import { getFunctions, httpsCallable } from 'firebase/functions';
const functions = getFunctions();
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
admin.initializeApp();

exports.onepayCallback = functions.https.onRequest(async (request, response) => {
    // Only allow POST requests
    if (request.method !== 'POST') {
        response.status(405).send('Method Not Allowed');
        return;
    }

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

exports.sendEmail = functions.https.onCall(async (data, context) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.ZOHO_EMAIL,
            pass: process.env.ZOHO_PASSWORD
        }
    });

    try {
        await transporter.sendMail({
            from: process.env.ZOHO_EMAIL,
            to: data.to,
            subject: data.message.subject,
            html: data.message.html
        });

        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send email');
    }
}); 