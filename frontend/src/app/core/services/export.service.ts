import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private snackBar = inject(MatSnackBar);

  /**
   * Exports data to a CSV file.
   * @param data Array of objects containing row data.
   * @param filename Desired name of the exported file.
   * @param headers Optional custom headers to display.
   * @param keys Optional keys to pluck from the data.
   */
  exportToCsv(data: any[], filename: string, headers?: string[], keys?: string[]): void {
    if (!data || data.length === 0) {
      this.snackBar.open('No data available to export.', 'Close', { duration: 3000 });
      return;
    }

    const resolvedKeys = keys || Object.keys(data[0]);
    const resolvedHeaders = headers || resolvedKeys;

    // Build CSV content
    const csvRows: string[] = [];
    csvRows.push(resolvedHeaders.map(h => `"${this.escapeCsvCell(h)}"`).join(','));

    for (const row of data) {
      const values = resolvedKeys.map(key => {
        const val = row[key];
        const formatted = val === null || val === undefined ? '' : String(val);
        return `"${this.escapeCsvCell(formatted)}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);

    // Create hidden link and download
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${this.getTimestamp()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.snackBar.open('CSV export completed successfully.', 'Close', { duration: 3000 });
  }

  /**
   * Exports data to a PDF file using jsPDF + jspdf-autotable.
   */
  async exportToPdf(data: any[], filename: string, title: string, headers: string[], keys: string[]): Promise<void> {
    if (!data || data.length === 0) {
      this.snackBar.open('No data available to export.', 'Close', { duration: 3000 });
      return;
    }

    try {
      // Dynamically load jsPDF to optimize bundle splitting
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();

      // Set Document Header Info
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(99, 102, 241); // Indigo color
      doc.text(title, 14, 20);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(115, 115, 115);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 27);
      doc.text('Confidential - NSQTech Enterprise Portal', 14, 32);

      // Draw horizontal divider line
      doc.setDrawColor(229, 231, 235);
      doc.line(14, 36, 196, 36);

      // Build rows mapping keys
      const body = data.map((row) =>
        keys.map((key) => {
          const val = row[key];
          if (val === null || val === undefined) return '';
          
          // Format date columns dynamically
          if (key === 'createdAt' || key === 'timestamp' || key === 'lastLogin') {
            return new Date(val).toLocaleDateString() + ' ' + new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
          return String(val);
        })
      );

      // Render table using jspdf-autotable
      autoTable(doc, {
        startY: 42,
        head: [headers],
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], halign: 'left', fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 },
      });

      // Save file
      doc.save(`${filename}_${this.getTimestamp()}.pdf`);
      this.snackBar.open('PDF export completed successfully.', 'Close', { duration: 3000 });
    } catch (err) {
      console.error('Failed to export PDF:', err);
      this.snackBar.open('Failed to generate PDF file.', 'Close', { duration: 4000 });
    }
  }

  private escapeCsvCell(cell: string): string {
    return cell.replace(/"/g, '""');
  }

  private getTimestamp(): string {
    const d = new Date();
    return `${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}_${d.getHours().toString().padStart(2, '0')}${d.getMinutes().toString().padStart(2, '0')}`;
  }
}
