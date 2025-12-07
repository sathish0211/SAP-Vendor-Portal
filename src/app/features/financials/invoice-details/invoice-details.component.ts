import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invoice-details',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.css']
})
export class InvoiceDetailsComponent implements OnInit {

  invoices: any[] = [];
  filteredInvoices: any[] = [];

  loading = true;
  errorMessage = '';

  searchInvoiceNo: string = '';
  searchDocumentDate: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const vendorId = localStorage.getItem("vendorId");

    if (!vendorId) {
      this.errorMessage = "Vendor ID missing. Please login again.";
      this.loading = false;
      return;
    }

    this.http.post("http://localhost:3000/invoice", { vendorId })
      .subscribe({
        next: (result: any) => {
          this.loading = false;

          if (result.items) {
            this.invoices = result.items.map((item: any) => ({
              invoiceNo: item.invoiceNumber,
              invoiceDate: item.documentDate,
              postingDate: item.postingDate,
              amount: item.amount,
              currency: item.currency,
              vendorId: item.vendorId,
              fiscalYear: item.fiscalYear,
              poNumber: item.poNumber,
              poItem: item.poItem
            }));

            this.filteredInvoices = this.invoices;
          }
        },
        error: () => {
          this.loading = false;
          this.errorMessage = "Failed to load invoice details.";
        }
      });
  }

  filterInvoices() {
    this.filteredInvoices = this.invoices.filter(inv => {
      const matchesInvoiceNo =
        this.searchInvoiceNo === '' ||
        inv.invoiceNo.toString().includes(this.searchInvoiceNo);

      const matchesDocumentDate =
        this.searchDocumentDate === '' ||
        inv.invoiceDate === this.searchDocumentDate;

      return matchesInvoiceNo && matchesDocumentDate;
    });
  }

  clearInvoiceNo() {
    this.searchInvoiceNo = '';
    this.filterInvoices();
  }

  clearDocumentDate() {
    this.searchDocumentDate = '';
    this.filterInvoices();
  }

  // ---------------------------
  // PREVIEW INVOICE PDF
  // ---------------------------
  previewInvoice(invoiceNo: string) {
    const vendorId = localStorage.getItem("vendorId");

    this.http.post("http://localhost:3000/invoice-download",
      { invoiceNo, vendorId })
      .subscribe({
        next: (res: any) => {
          const base64 = res.base64;
          const pdfWindow = window.open("");
          pdfWindow?.document.write(
            `<iframe width='100%' height='100%' src='data:application/pdf;base64,${base64}'></iframe>`
          );
        },
        error: () => alert("Failed to preview invoice")
      });
  }

  // ---------------------------
  // DOWNLOAD INVOICE PDF
  // ---------------------------
  downloadInvoice(invoiceNo: string) {
    const vendorId = localStorage.getItem("vendorId");

    this.http.post("http://localhost:3000/invoice-download",
      { invoiceNo, vendorId })
      .subscribe({
        next: (res: any) => {
          const link = document.createElement("a");
          link.href = "data:application/pdf;base64," + res.base64;
          link.download = `${invoiceNo}.pdf`;
          link.click();
        },
        error: () => alert("Failed to download invoice")
      });
  }
}
