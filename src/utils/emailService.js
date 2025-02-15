import { getContactData } from "./firebaseDataService";

const sendUpdateEmailToAdmin = async (applicantId) => {
    const applicantData = await getContactData(applicantId);
    try {
        const emailContent = {
            to: "nisaldayan@gmail.com", //admin email
            message: {
                subject: 'NOTCHLN - Form Resubmission Notification',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4A90E2; font-size: 30px; font-weight: bold; margin: 0;">NOTCHLN</h1>
            </div>
            
            <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
              <h2 style="color: #333; font-size: 24px; margin-bottom: 20px; text-align: center;">Form Resubmission Notice</h2>
              
              <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px; text-align: center;">
                A user has resubmitted their application form with updated information.
              </p>
              
              <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 25px 0;">
                <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">User Details:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #555; width: 40%;">Full Name:</td>
                    <td style="padding: 8px 0; color: #333;">${applicantData.contactPersonTitle} ${applicantData.contactPersonName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555;">Email:</td>
                    <td style="padding: 8px 0; color: #333;">${applicantData.contactPersonEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555;">Phone:</td>
                    <td style="padding: 8px 0; color: #333;">${applicantData.contactPersonPhone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555;">Resubmission Date:</td>
                    <td style="padding: 8px 0; color: #333;">${new Date().toLocaleDateString()}</td>
                  </tr>
                </table>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://notchln.com/admin/dashboard" 
                   style="background-color: #4A90E2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Review Updates
                </a>
              </div>
            </div>
            
            <div style="color: #777; font-size: 12px; text-align: center; margin-top: 20px;">
              <p>This is an automated notification from the NOTCHLN application system.</p>
              <p>A user has updated their application information and requires review.</p>
            </div>
            
            <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center;">
              <p style="color: #777; font-size: 12px;">
                © ${new Date().getFullYear()} NOTCHLN. All rights reserved.
              </p>
            </div>
          </div>
        `
            }
        };

        const response = await fetch('https://us-central1-e-corporate.cloudfunctions.net/sendEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailContent)
        });

        if (!response.ok) {
            throw new Error('Failed to send email');
        }

        console.log('Resubmission notification sent to admin successfully');
        return true;
    } catch (error) {
        console.error('Error sending resubmission notification:', error);
        return false;
    }
};

const sendUpdateEmailToUser = async (applicantId) => {
    const applicantData = await getContactData(applicantId);
    try {
        const emailContent = {
            to: "nisaldayan@gmail.com", //user email
            message: {
                subject: 'NOTCHLN - Form Resubmission Request',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #4A90E2; font-size: 30px; font-weight: bold; margin: 0;">NOTCHLN</h1>
                        </div>
                        
                        <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
                            <h2 style="color: #333; font-size: 24px; margin-bottom: 20px; text-align: center;">Form Resubmission Request</h2>
                            
                            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px; text-align: center;">
                                The administrator has requested you to update and resubmit your application form.
                            </p>
                            
                            <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 25px 0;">
                                <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">Request Details:</h3>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #555; width: 40%;">Full Name:</td>
                                        <td style="padding: 8px 0; color: #333;">${applicantData.contactPersonTitle} ${applicantData.contactPersonName}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #555;">Request Date:</td>
                                        <td style="padding: 8px 0; color: #333;">${new Date().toLocaleDateString()}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="https://notchln.com/dashboard" 
                                   style="background-color: #4A90E2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                    Update Application
                                </a>
                            </div>
                        </div>
                        
                        <div style="color: #777; font-size: 12px; text-align: center; margin-top: 20px;">
                            <p>Please review and update your application as requested.</p>
                            <p>If you have any questions, please contact our support team.</p>
                        </div>
                        
                        <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center;">
                            <p style="color: #777; font-size: 12px;">
                                © ${new Date().getFullYear()} NOTCHLN. All rights reserved.
                            </p>
                        </div>
                    </div>
                `
            }
        };

        const response = await fetch('https://us-central1-e-corporate.cloudfunctions.net/sendEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailContent)
        });

        if (!response.ok) throw new Error('Failed to send email');
        console.log('Resubmission request sent to user successfully');
        return true;
    } catch (error) {
        console.error('Error sending resubmission request:', error);
        return false;
    }
};

export { sendUpdateEmailToAdmin, sendUpdateEmailToUser }; 