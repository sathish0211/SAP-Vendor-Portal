import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-financials',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './financials.component.html',
    styleUrls: ['./financials.component.css']
})
export class FinancialsComponent { }
