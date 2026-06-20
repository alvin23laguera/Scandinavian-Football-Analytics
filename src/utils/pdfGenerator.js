import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const generatePdfFromElement = async (element, filename) => {
    try {
        // html2canvas capture
        const canvas = await html2canvas(element, {
            scale: 2, // High resolution for crisp graphs
            useCORS: true,
            logging: false,
            backgroundColor: '#f8fafc' // Slate 50 background for the PDF
        });

        const imgData = canvas.toDataURL('image/png');
        
        // A4 page dimensions in mm
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Calculate image dimensions to fit PDF width
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        
        const renderWidth = pdfWidth;
        const renderHeight = renderWidth / ratio;

        let heightLeft = renderHeight;
        let position = 0;

        // First page
        pdf.addImage(imgData, 'PNG', 0, position, renderWidth, renderHeight);
        heightLeft -= pdfHeight;

        // Subsequent pages if it overflows
        while (heightLeft > 0) {
            position = heightLeft - renderHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, renderWidth, renderHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(filename);
        return true;
    } catch (error) {
        console.error("PDF generation failed:", error);
        throw error;
    }
};
