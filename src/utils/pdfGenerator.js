import { jsPDF } from "jspdf";
import { getApplicationData } from './firebaseDataService';

export const generateApplicationPDF = async (userId) => {
    console.log("Starting PDF generation for userId:", userId);
    try {
        // Get all application data
        const {
            contactData,
            businessData,
            directorData,
            shareholderData,
            paymentData
        } = await getApplicationData(userId);

        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.setTextColor(0, 87, 183);
        doc.text("User Application Details", 20, 20);

        // Contact Information
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Contact Information", 20, 40);
        doc.setFontSize(12);
        doc.text(`Email: ${contactData?.email || 'N/A'}`, 30, 50);
        doc.text(`Registration Plan: ${contactData?.registrationPlan || 'N/A'}`, 30, 60);
        doc.text(`Contact Person Title: ${contactData?.contactPersonTitle || 'N/A'}`, 30, 70);
        doc.text(`Contact Person Name: ${contactData?.contactPersonName || 'N/A'}`, 30, 80);
        doc.text(`Contact Person Email: ${contactData?.contactPersonEmail || 'N/A'}`, 30, 90);
        doc.text(`Contact Person Phone: ${contactData?.contactPersonPhone || 'N/A'}`, 30, 100);

        // Business Information
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Business Information", 20, 20);
        doc.setFontSize(12);
        doc.text(`Company Name: ${businessData?.companyName || 'N/A'}`, 30, 30);
        doc.text(`Business Type: ${businessData?.companyNameType || 'N/A'}`, 30, 40);
        doc.text(`Company Address: ${businessData?.companyAddress || 'N/A'}`, 30, 50);
        doc.text(`Company Province: ${businessData?.companyProvince || 'N/A'}`, 30, 60);
        doc.text(`Company District: ${businessData?.companyDistrict || 'N/A'}`, 30, 70);
        doc.text(`Company Divisional Office: ${businessData?.companyDivisionalOffice || 'N/A'}`, 30, 80);
        doc.text(`Company GN Division: ${businessData?.companyGNDivision || 'N/A'}`, 30, 90);
        doc.text(`Company Postal Code: ${businessData?.companyPostalCode || 'N/A'}`, 30, 100);
        doc.text(`Company Email: ${businessData?.companyEmail || 'N/A'}`, 30, 110);
        doc.text(`Business Description: ${businessData?.businessDescription || 'N/A'}`, 30, 120);

        // Director Information
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Director Information", 20, 20);
        doc.setFontSize(12);

        if (directorData?.directors?.length > 0) {
            let yPosition = 30;
            directorData.directors.forEach((director, index) => {
                if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(`Director ${index + 1}:`, 30, yPosition);
                doc.text(`Title: ${director.title || 'N/A'}`, 40, yPosition + 10);
                doc.text(`Full Name: ${director.fullName || 'N/A'}`, 40, yPosition + 20);
                doc.text(`Date of Birth: ${director.dob || 'N/A'}`, 40, yPosition + 30);
                doc.text(`Province: ${director.province || 'N/A'}`, 40, yPosition + 40);
                doc.text(`District: ${director.district || 'N/A'}`, 40, yPosition + 50);
                doc.text(`Division: ${director.division || 'N/A'}`, 40, yPosition + 60);
                doc.text(`Address 1: ${director.address1 || 'N/A'}`, 40, yPosition + 70);
                doc.text(`Address 2: ${director.address2 || 'N/A'}`, 40, yPosition + 80);
                doc.text(`Post Code: ${director.postCode || 'N/A'}`, 40, yPosition + 90);
                doc.text(`Phone: ${director.phone || 'N/A'}`, 40, yPosition + 100);
                doc.text(`Mobile: ${director.mobile || 'N/A'}`, 40, yPosition + 110);
                doc.text(`Email: ${director.email || 'N/A'}`, 40, yPosition + 120);
                doc.text(`Occupation: ${director.occupation || 'N/A'}`, 40, yPosition + 130);
                yPosition += 150;
            });
        } else {
            doc.text("No director information available", 30, 30);
        }

        // Shareholder Information
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Shareholder Information", 20, 20);
        doc.setFontSize(12);

        if (shareholderData?.shareholders?.length > 0) {
            let yPosition = 30;
            shareholderData.shareholders.forEach((shareholder, index) => {
                if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(`Shareholder ${index + 1}:`, 30, yPosition);
                doc.text(`Title: ${shareholder.title || 'N/A'}`, 40, yPosition + 10);
                doc.text(`Full Name: ${shareholder.fullName || 'N/A'}`, 40, yPosition + 20);
                doc.text(`Date of Birth: ${shareholder.dob || 'N/A'}`, 40, yPosition + 30);
                doc.text(`Province: ${shareholder.province || 'N/A'}`, 40, yPosition + 40);
                doc.text(`District: ${shareholder.district || 'N/A'}`, 40, yPosition + 50);
                doc.text(`Division: ${shareholder.division || 'N/A'}`, 40, yPosition + 60);
                doc.text(`Address 1: ${shareholder.address1 || 'N/A'}`, 40, yPosition + 70);
                doc.text(`Address 2: ${shareholder.address2 || 'N/A'}`, 40, yPosition + 80);
                doc.text(`Post Code: ${shareholder.postCode || 'N/A'}`, 40, yPosition + 90);
                doc.text(`Phone: ${shareholder.phone || 'N/A'}`, 40, yPosition + 100);
                doc.text(`Mobile: ${shareholder.mobile || 'N/A'}`, 40, yPosition + 110);
                doc.text(`Email: ${shareholder.email || 'N/A'}`, 40, yPosition + 120);
                doc.text(`Shares: ${shareholder.shares || 'N/A'}%`, 40, yPosition + 130);
                yPosition += 150;
            });
        } else {
            doc.text("No shareholder information available", 30, 30);
        }

        // Payment Information
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Payment Information", 20, 20);
        doc.setFontSize(12);
        doc.text(`Payment Status: ${paymentData?.status || 'N/A'}`, 30, 30);
        doc.text(`Payment Date: ${paymentData?.date || 'N/A'}`, 30, 40);
        doc.text(`Payment Slip: ${paymentData?.paymentSlip?.url ? 'Uploaded' : 'Not uploaded'}`, 30, 50);

        // Overall Status
        doc.setFontSize(16);
        doc.setTextColor(0, 87, 183);
        doc.text("Application Status", 20, 70);
        doc.setFontSize(14);
        doc.text(`Overall Status: ${contactData?.overallStatus || 'N/A'}`, 30, 80);

        // Save the PDF
        const fileName = `user_application_${contactData?.contactPersonName || 'user'}.pdf`;
        console.log("Saving PDF with filename:", fileName);
        doc.save(fileName);

        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}; 