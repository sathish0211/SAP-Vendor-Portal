import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-rfq',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './rfq.component.html',
  styleUrls: ['./rfq.component.css']
})
export class RfqComponent implements OnInit {

  rfqs: any[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit() {
    const vendorId = localStorage.getItem("vendorId");

    if (!vendorId) {
      this.loading = false;
      this.errorMessage = "No vendor ID found in storage.";
      return;
    }

    this.fetchRFQ(vendorId);
  }

  async fetchRFQ(vendorId: string) {
    try {
      const response = await fetch("http://localhost:3000/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId })
      });

      const result = await response.json();
      this.loading = false;

      if (result.items) {
        this.rfqs = result.items.map((item: any) => ({
          rfqNumber: item.rfqNumber,
          rfqDate: item.createdDate,
          materialNumber: item.materialNumber,
          description: item.materialDesc,
          quantity: item.quantity,
          unit: item.unit,
          deliveryDate: item.deliveryDate,
          bidSubmissionDate: item.deliveryDate   // If SAP doesn't provide, reuse delivery date
        }));
      } else {
        this.errorMessage = "No RFQ records found.";
      }

    } catch (error) {
      this.loading = false;
      this.errorMessage = "Failed to connect to server.";
      console.error(error);
    }
  }
}
