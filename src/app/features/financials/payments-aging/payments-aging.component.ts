import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-payments-aging',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './payments-aging.component.html',
  styleUrls: ['./payments-aging.component.css']
})
export class PaymentsAgingComponent {
  payments: any[] = [];
  loading = true;
  errorMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const vendorId = localStorage.getItem('vendorId');

    if (!vendorId) {
      this.errorMessage = 'Vendor ID not found. Please login again.';
      this.loading = false;
      return;
    }

    // Call Backend
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
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = 'Failed to fetch Payments Aging data.';
          console.error(err);
        }
      });
  }
}
