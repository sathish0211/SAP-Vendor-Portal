import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.css']
})
export class LayoutComponent {

    constructor(private router: Router) {

        // 🔥 Prevent going back to login when logged in
        history.pushState(null, '');
        history.pushState(null, '');

        window.addEventListener('popstate', () => {

            const loggedIn = !!localStorage.getItem('token');

            if (loggedIn) {
                // Stay in Layout (Dashboard)
                history.pushState(null, '');
                this.router.navigate(['/dashboard']);
            } else {
                this.router.navigate(['/login']);
            }
        });

    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('vendorId');
        this.router.navigate(['/login']);
    }
}
