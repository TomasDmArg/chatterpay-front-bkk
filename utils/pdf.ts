import { jsPDF } from 'jspdf';

export const generatePDF = async (qrCodeDataUrl: string, cashierName: string): Promise<Blob> => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Add title
  pdf.setFontSize(20);
  pdf.text(`Pay with ChatterPay`, 20, 20);
  
  // Add QR code
  pdf.addImage(qrCodeDataUrl, 'PNG', 20, 40, 80, 80);
  
  // Add timestamp
  pdf.setFontSize(12);
  pdf.text(`QR Code for ${cashierName}`, 20, 130);

  return pdf.output('blob');
};