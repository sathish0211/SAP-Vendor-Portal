import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.css']
})
export class PurchaseOrdersComponent implements OnInit {

  purchaseOrders: any[] = [];
  filteredOrders: any[] = [];

  loading = true;
  errorMessage = '';

  searchPoNumber: string = '';
  searchPoDate: string = '';

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
          status: new Date(item.deliveryDate) < new Date() ? "Completed" : "Open"
        }));

        this.filteredOrders = this.purchaseOrders;
      } else {
        this.errorMessage = "No Purchase Orders found.";
      }

    } catch (error) {
      this.loading = false;
      this.errorMessage = "Failed to connect to server.";
      console.error(error);
    }
  }

  filterOrders() {
    this.filteredOrders = this.purchaseOrders.filter(po => {
      const matchesPoNumber =
        this.searchPoNumber === '' ||
        po.poNumber.toString().includes(this.searchPoNumber);

      const matchesPoDate =
        this.searchPoDate === '' ||
        po.poDate === this.searchPoDate;

      return matchesPoNumber && matchesPoDate;
    });
  }

  clearPoNumber() {
    this.searchPoNumber = '';
    this.filterOrders();
  }

  clearPoDate() {
    this.searchPoDate = '';
    this.filterOrders();
  }
}
