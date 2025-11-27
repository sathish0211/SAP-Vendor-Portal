import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule],
    template: `<h2>Profile Page</h2><p>Coming soon...</p>`
})
export class ProfileComponent { }

@Component({
    selector: 'app-rfq',
    standalone: true,
    imports: [CommonModule],
    template: `<h2>RFQ Page</h2><p>Coming soon...</p>`
})
export class RfqComponent { }

@Component({
    selector: 'app-purchase-orders',
    standalone: true,
    imports: [CommonModule],
    template: `<h2>Purchase Orders Page</h2><p>Coming soon...</p>`
})
export class PurchaseOrdersComponent { }

@Component({
    selector: 'app-goods-receipt',
    standalone: true,
    imports: [CommonModule],
    template: `<h2>Goods Receipt Page</h2><p>Coming soon...</p>`
})
export class GoodsReceiptComponent { }

@Component({
    selector: 'app-financials',
    standalone: true,
    imports: [CommonModule],
    template: `<h2>Financials Page</h2><p>Coming soon...</p>`
})
export class FinancialsComponent { }
