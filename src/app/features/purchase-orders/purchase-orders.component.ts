import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.css']
})
export class PurchaseOrdersComponent implements OnInit {

  purchaseOrders: any[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit() {
    const vendorId = localStorage.getItem("vendorId");

    if (!vendorId) {
      this.loading = false;
      this.errorMessage = "No vendor ID found in storage.";
      return;
    }

    this.fetchPurchaseOrders(vendorId);
  }

  async fetchPurchaseOrders(vendorId: string) {
    try {
      const response = await fetch("http://localhost:3000/po", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId })
      });

      const result = await response.json();
      this.loading = false;

     if (result.items) {
  this.purchaseOrders = result.items.map((item: any) => ({
    poNumber: item.poNumber,
    poDate: item.poDate,
    poItem: item.poItem,
    materialNumber: item.materialNumber,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    netPrice: item.price,
    currency: item.currency,
    deliveryDate: item.deliveryDate,

    // Auto status
    status: new Date(item.deliveryDate) < new Date() ? "Completed" : "Open"
  }));
}
 else {
        this.errorMessage = "No Purchase Orders found.";
      }

    } catch (error) {
      this.loading = false;
      this.errorMessage = "Failed to connect to server.";
      console.error(error);
    }
  }
}
