import { generatePDF } from '@/utils/pdf';
import { generateQRCode } from '@/utils/qrcode';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { Cashier } from '@/types/main';
import { Download, Trash2, ChevronDown, QrCode } from 'lucide-react';

interface CashierActionsProps {
  cashier: Cashier;
  onDelete: (id: number) => void;
}

export function CashierActions({ cashier, onDelete }: CashierActionsProps) {
  const handleQRCodeDownload = async () => {
    try {
      // Generate unique data for the QR code (e.g., cashier ID and timestamp)
      const qrData = JSON.stringify({
        cashierId: cashier.id,
        name: cashier.name,
        timestamp: new Date().toISOString()
      });

      // Generate QR code
      const qrCodeDataUrl = await generateQRCode(qrData);

      // Generate PDF with QR code
      const pdfBlob = await generatePDF(qrCodeDataUrl, cashier.name);

      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code-${cashier.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "QR code PDF has been downloaded",
        variant: "default",
      });
    } catch (error) {
      console.error('Error generating QR code PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code PDF",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    try {
      onDelete(cashier.id);
      toast({
        title: "Success",
        description: `Cashier ${cashier.name} has been deleted`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete cashier",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2 w-full flex flex-row items-center justify-end">
      <Button variant="ghost" size="sm" onClick={handleQRCodeDownload}>
        <QrCode className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={handleDelete}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}