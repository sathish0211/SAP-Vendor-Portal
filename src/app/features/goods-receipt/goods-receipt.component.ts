import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-goods-receipt',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './goods-receipt.component.html',
  styleUrls: ['./goods-receipt.component.css']
})
export class GoodsReceiptComponent implements OnInit {

  goodsReceipts: any[] = [];
  filteredGoodsReceipts: any[] = [];

  loading = true;
  errorMessage = '';

  searchGrNumber: string = '';
  searchPostingDate: string = '';

  ngOnInit() {
    const vendorId = localStorage.getItem("vendorId");

    if (!vendorId) {
      this.loading = false;
      this.errorMessage = "No vendor ID found in storage.";
      return;
    }

    this.fetchGoodsReceipts(vendorId);
  }

  async fetchGoodsReceipts(vendorId: string) {
    try {
      const response = await fetch("http://localhost:3000/goods-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId })
      });

      const result = await response.json();
      this.loading = false;

      if (result.items) {
        this.goodsReceipts = result.items.map((item: any) => ({
          grNumber: item.materialDocument,
          postingDate: item.postingDate,
          materialNumber: item.materialNumber,
          poNumber: item.purchaseOrder,
          poItem: item.poItem,
          plant: item.plant,
          companyCode: item.companyCode,
          fiscalYear: item.materialYear
        }));

        this.filteredGoodsReceipts = this.goodsReceipts;
      } else {
        this.errorMessage = "No Goods Receipt records found.";
      }

    } catch (error) {
      this.loading = false;
      this.errorMessage = "Failed to connect to server.";
      console.error(error);
    }
  }

  filterGoodsReceipts() {
    this.filteredGoodsReceipts = this.goodsReceipts.filter(gr => {
      const matchesGrNumber =
        this.searchGrNumber === '' ||
        gr.grNumber.toString().includes(this.searchGrNumber);

      const matchesPostingDate =
        this.searchPostingDate === '' ||
        gr.postingDate === this.searchPostingDate;

      return matchesGrNumber && matchesPostingDate;
    });
  }

  clearGrNumber() {
    this.searchGrNumber = '';
    this.filterGoodsReceipts();
  }

  clearPostingDate() {
    this.searchPostingDate = '';
    this.filterGoodsReceipts();
  }
}
