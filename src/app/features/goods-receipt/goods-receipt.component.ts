import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-goods-receipt',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './goods-receipt.component.html',
  styleUrls: ['./goods-receipt.component.css']
})
export class GoodsReceiptComponent implements OnInit {

  goodsReceipts: any[] = [];
  loading = true;
  errorMessage = '';

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
          grNumber: item.materialDocument,   // MBLNR
          postingDate: item.postingDate,    // BUDAT
          materialNumber: item.materialNumber,
          poNumber: item.purchaseOrder,
          poItem: item.poItem,
          plant: item.plant,
          companyCode: item.companyCode,
          fiscalYear: item.materialYear
        }));
      } else {
        this.errorMessage = "No Goods Receipt records found.";
      }

    } catch (error) {
      this.loading = false;
      this.errorMessage = "Failed to connect to server.";
      console.error(error);
    }
  }
}
