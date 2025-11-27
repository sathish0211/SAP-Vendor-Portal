import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { LayoutComponent } from './core/layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProfileComponent } from './features/profile/profile.component';
import { RfqComponent } from './features/rfq/rfq.component';
import { PurchaseOrdersComponent } from './features/purchase-orders/purchase-orders.component';
import { GoodsReceiptComponent } from './features/goods-receipt/goods-receipt.component';
import { FinancialsComponent } from './features/financials/financials.component';
import { InvoiceDetailsComponent } from './features/financials/invoice-details/invoice-details.component';
import { PaymentsAgingComponent } from './features/financials/payments-aging/payments-aging.component';
import { CreditDebitMemoComponent } from './features/financials/credit-debit-memo/credit-debit-memo.component';
import { AuthGuard } from './auth.guard';


export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],     // 🛑 Protect all inside
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'rfq', component: RfqComponent },
      { path: 'purchase-orders', component: PurchaseOrdersComponent },
      { path: 'goods-receipt', component: GoodsReceiptComponent },
      { path: 'financials', component: FinancialsComponent },
      { path: 'financials/invoices', component: InvoiceDetailsComponent },
      { path: 'financials/payments', component: PaymentsAgingComponent },
      { path: 'financials/memos', component: CreditDebitMemoComponent }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
