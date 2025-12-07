import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payments-aging',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
  templateUrl: './payments-aging.component.html',
  styleUrls: ['./payments-aging.component.css']
})
export class PaymentsAgingComponent {
  payments: any[] = [];
  filteredPayments: any[] = [];

  loading = true;
  errorMessage = '';

  searchBillingDocument: string = '';
  searchBillingDate: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const vendorId = localStorage.getItem('vendorId');

    if (!vendorId) {
      this.errorMessage = 'Vendor ID not found. Please login again.';
      this.loading = false;
      return;
    }

    this.http.post<any>('http://localhost:3000/payments-aging', { vendorId })
      .subscribe({
        next: (response) => {
          this.loading = false;

          if (response.items) {
            this.payments = response.items.map((item: any) => ({
              billingDocument: item.documentNumber,
              billingDate: item.documentDate,
              dueDate: item.dueDate,
              amount: item.amount,
              currency: item.currency,
              agingDays: Number(item.overdueDays)
            }));

            this.filteredPayments = this.payments;
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = 'Failed to fetch Payments Aging data.';
          console.error(err);
        }
      });
  }

  // -------------------------
  // FILTER FUNCTION
  // -------------------------
  filterPayments() {
    this.filteredPayments = this.payments.filter(payment => {
      const matchesBillingDoc =
        this.searchBillingDocument === '' ||
        payment.billingDocument.toString().includes(this.searchBillingDocument);

      const matchesBillingDate =
        this.searchBillingDate === '' ||
        payment.billingDate === this.searchBillingDate;

      return matchesBillingDoc && matchesBillingDate;
    });
  }

  // -------------------------
  // CLEAR FUNCTIONS
  // -------------------------
  clearBillingDocument() {
    this.searchBillingDocument = '';
    this.filterPayments();
  }

  clearBillingDate() {
    this.searchBillingDate = '';
    this.filterPayments();
  }
}
