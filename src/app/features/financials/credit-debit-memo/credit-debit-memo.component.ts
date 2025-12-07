import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import axios from 'axios';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-credit-debit-memo',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './credit-debit-memo.component.html',
  styleUrls: ['./credit-debit-memo.component.css']
})
export class CreditDebitMemoComponent implements OnInit {

  memos: any[] = [];
  filteredMemos: any[] = [];

  loading = true;

  // FILTER VARIABLES
  searchMemoNo: string = '';
  searchMemoDate: string = '';

  ngOnInit() {
    const vendorId = localStorage.getItem('vendorId');

    if (!vendorId) {
      alert("Vendor ID not found! Please login again.");
      return;
    }

    const cached = localStorage.getItem("memoData");
    if (cached) {
      this.memos = JSON.parse(cached);
      this.filteredMemos = this.memos;
      this.loading = false;
      this.fetchMemoFromBackend(vendorId);
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
      this.filteredMemos = this.memos;

      localStorage.setItem("memoData", JSON.stringify(this.memos));

    } catch (error) {
      console.error("Memo API Error:", error);
      alert("Failed to load memo data from SAP");
    } finally {
      this.loading = false;
    }
  }

  filterMemos() {
    this.filteredMemos = this.memos.filter(memo => {
      const matchesMemoNo =
        this.searchMemoNo === '' ||
        memo.memoNumber.toString().includes(this.searchMemoNo);

      const matchesDate =
        this.searchMemoDate === '' ||
        memo.documentDate === this.searchMemoDate;

      return matchesMemoNo && matchesDate;
    });
  }

  clearMemoNo() {
    this.searchMemoNo = '';
    this.filterMemos();
  }

  clearMemoDate() {
    this.searchMemoDate = '';
    this.filterMemos();
  }

  getMemoType(indicator: string): string {
    return indicator === "S" ? "Credit" : "Debit";
  }
}
