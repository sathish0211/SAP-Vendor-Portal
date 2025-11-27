import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-credit-debit-memo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './credit-debit-memo.component.html',
  styleUrls: ['./credit-debit-memo.component.css']
})
export class CreditDebitMemoComponent implements OnInit {

  memos: any[] = [];
  loading = true;

  ngOnInit() {
    const vendorId = localStorage.getItem('vendorId');

    if (!vendorId) {
      alert("Vendor ID not found! Please login again.");
      return;
    }

    // Check if cached in localStorage
    const cached = localStorage.getItem("memoData");
    if (cached) {
      this.memos = JSON.parse(cached);
      this.loading = false;
      this.fetchMemoFromBackend(vendorId); // background refresh
    } else {
      this.fetchMemoFromBackend(vendorId);
    }
  }

  async fetchMemoFromBackend(vendorId: string) {
    try {
      const response = await axios.post("http://localhost:3000/memo", {
        vendorId: vendorId
      });

      this.memos = response.data.items || [];

      // Save to local storage
      localStorage.setItem("memoData", JSON.stringify(this.memos));

    } catch (error) {
      console.error("Memo API Error:", error);
      alert("Failed to load memo data from SAP");
    } finally {
      this.loading = false;
    }
  }

  // Convert S / H to readable type
  getMemoType(indicator: string): string {
    return indicator === "S" ? "Credit" : "Debit";
  }
}
