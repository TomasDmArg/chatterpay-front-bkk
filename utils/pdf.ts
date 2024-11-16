import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

/**
 * Interface for QR code data
 */
interface QRCodeData {
  cashierName: string;
  businessName: string;
  qrValue: string;
}

/**
 * Generates a styled PDF with QR code and business information
 * @param data - QR code and business data
 * @returns Promise<Blob> - PDF as a blob
 */
export const generatePDF = async (data: QRCodeData): Promise<Blob> => {
  // Initialize PDF with better quality
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true,
  });

  // Constants for layout
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const qrSize = 80;

  // Center positions
  const centerX = pageWidth / 2;
  const qrX = centerX - (qrSize / 2);

  // Add logo (if available)
  try {
    pdf.addImage('/logo.png', 'PNG', centerX - 15, margin, 30, 30);
  } catch (error) {
    console.warn('Logo not available:', error);
  }

  // Title styling
  pdf.setFillColor(10, 153, 114); // Emerald color #0A9972
  pdf.rect(0, 60, pageWidth, 15, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.text('Pay with ChatterPay', centerX, 70, { align: 'center' });

  // Reset text color to black
  pdf.setTextColor(0, 0, 0);

  // Business information
  pdf.setFontSize(16);
  pdf.text(data.businessName, centerX, 90, { align: 'center' });
  
  // QR Code with border
  pdf.setDrawColor(10, 153, 114);
  pdf.setLineWidth(0.5);
  pdf.rect(qrX - 2, 100 - 2, qrSize + 4, qrSize + 4);
  pdf.addImage(await QRCode.toDataURL(data.qrValue), 'PNG', qrX, 100, qrSize, qrSize);

  // Cashier information
  pdf.setFontSize(14);
  pdf.text(`Cashier: ${data.cashierName}`, centerX, 200, { align: 'center' });

  // Add timestamp
  const timestamp = new Date().toLocaleString();
  pdf.setFontSize(10);
  pdf.setTextColor(128, 128, 128);
  pdf.text(`Generated on: ${timestamp}`, centerX, pageHeight - margin, { align: 'center' });

  // Add instructions
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  const instructions = [
    '1. Open the Camera App',
    '2. Scan this QR code', 
    '3. Confirm the amount',
    '4. Complete your payment securely'
  ];
  
  let yPos = 220;
  instructions.forEach(instruction => {
    pdf.text(instruction, centerX, yPos, { align: 'center' });
    yPos += 8;
  });

  // Add footer with terms
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(
    'This QR code is for payment purposes only. ChatterPay © 2024',
    centerX,
    pageHeight - (margin / 2),
    { align: 'center' }
  );

  return pdf.output('blob');
};

/**
 * Usage example:
 * 
 * const qrData = {
 *   cashierName: "John Doe",
 *   businessName: "My Store",
 *   qrValue: "https://pay.chatterpay.com/abc123",
 * };
 * 
 * const pdfBlob = await generatePDF(qrData);
 * const url = URL.createObjectURL(pdfBlob);
 * window.open(url);
 */