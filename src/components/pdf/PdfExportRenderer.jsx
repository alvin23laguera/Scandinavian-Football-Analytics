import { useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';

const PdfExportRenderer = ({ 
    pdfSelections, 
    selectedTeams,
    onComplete 
}) => {
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const buildPdf = async () => {
            try {
                // A4 dimensions
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
                const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
                const margin = 10;
                let cursorY = margin;

                // Title
                pdf.setFontSize(22);
                pdf.setTextColor(15, 23, 42); // slate-900
                const titleText = `Match Analysis Report: ${selectedTeams.join(' vs ')}`;
                pdf.text(titleText, pdfWidth / 2, cursorY + 10, { align: 'center' });
                cursorY += 25;

                const PHASES = ['Attack', 'Defence', 'Transitions', 'Set-Pieces'];
                const selections = Object.values(pdfSelections);

                for (const phase of PHASES) {
                    const phaseItems = selections.filter(s => s.phase === phase);
                    if (phaseItems.length === 0) continue;

                    // Phase Header
                    if (cursorY > pdfHeight - 40) {
                        pdf.addPage();
                        cursorY = margin + 10;
                    }

                    pdf.setFontSize(18);
                    pdf.setTextColor(59, 130, 246); // blue-500
                    pdf.text(`-- ${phase} --`, pdfWidth / 2, cursorY, { align: 'center' });
                    cursorY += 15;

                    // Render items in a 2-column grid
                    for (let i = 0; i < phaseItems.length; i += 2) {
                        const rowItems = [phaseItems[i]];
                        if (phaseItems[i+1]) rowItems.push(phaseItems[i+1]);

                        const colWidth = (pdfWidth - (margin * 3)) / 2;
                        let maxRowHeight = 0;

                        // First pass: Calculate required heights
                        const rowLayouts = rowItems.map((item, idx) => {
                            const imgProps = pdf.getImageProperties(item.imageData);
                            const ratio = imgProps.width / imgProps.height;
                            let renderWidth = colWidth;
                            let renderHeight = renderWidth / ratio;
                            
                            // Scale down if it's crazily tall
                            if (renderHeight > (pdfHeight - margin * 4)) {
                                renderHeight = pdfHeight - margin * 4;
                                renderWidth = renderHeight * ratio;
                            }

                            let notesHeight = 0;
                            let splitNotes = [];
                            if (item.notes && item.notes.trim() !== '') {
                                splitNotes = pdf.splitTextToSize(`Observations: ${item.notes}`, colWidth - 6);
                                notesHeight = splitNotes.length * 5 + 10; // 5mm per line + padding
                            }

                            return { item, renderWidth, renderHeight, notesHeight, splitNotes };
                        });

                        // Find the tallest element in this row to see if we need a page break
                        const tallestElement = Math.max(...rowLayouts.map(l => l.renderHeight + l.notesHeight + 15));

                        // Page Break check
                        if (cursorY + tallestElement > pdfHeight - margin) {
                            pdf.addPage();
                            cursorY = margin + 10;
                        }

                        // Second pass: Render
                        rowLayouts.forEach((layout, idx) => {
                            const xBase = idx === 0 ? margin : margin * 2 + colWidth;
                            let currentY = cursorY;

                            pdf.setFontSize(12);
                            pdf.setTextColor(15, 23, 42);
                            // Title
                            const titleLines = pdf.splitTextToSize(layout.item.title, colWidth);
                            pdf.text(titleLines, xBase, currentY);
                            currentY += (titleLines.length * 5) + 3;

                            // Center image within its column
                            const xOffset = xBase + (colWidth - layout.renderWidth) / 2;
                            pdf.addImage(layout.item.imageData, 'PNG', xOffset, currentY, layout.renderWidth, layout.renderHeight);
                            currentY += layout.renderHeight + 8;

                            // Notes
                            if (layout.notesHeight > 0) {
                                pdf.setFontSize(10);
                                pdf.setTextColor(71, 85, 105);
                                pdf.setFillColor(241, 245, 249);
                                pdf.rect(xBase, currentY - 4, colWidth, layout.notesHeight, 'F');
                                pdf.text(layout.splitNotes, xBase + 3, currentY);
                            }
                        });

                        cursorY += tallestElement;
                    }
                    
                    cursorY += 10; // Extra padding between phases
                }

                pdf.save(`${selectedTeams.join('_vs_')}_Report.pdf`);
                onComplete(true);
            } catch (error) {
                console.error("Failed to build PDF", error);
                onComplete(false);
            }
        };

        buildPdf();
    }, []);

    return null; // This is a logical component, it renders nothing
};

export default PdfExportRenderer;
