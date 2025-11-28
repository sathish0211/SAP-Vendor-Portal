import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  vendorId = '';
  password = '';
  showPassword = false;

  errorMessage = '';
  loading = false;

  constructor(private router: Router) {

    // 🔥 Prevent browser from going back to the cached previous page
    history.pushState(null, '');
    history.pushState(null, '');

    window.addEventListener('popstate', () => {
      // block swipe-left on login page
      location.replace(location.href);
      history.pushState(null, '');
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    this.errorMessage = '';
    this.loading = true;

    const paddedVendorId = this.vendorId.padStart(10, '0');

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: paddedVendorId,
          password: this.password
        })
      });

      const result = await response.json();
      this.loading = false;

      if (result.success) {
        localStorage.setItem("token", "true");  // REQUIRED for guard
        localStorage.setItem("vendorId", paddedVendorId);

        this.router.navigate(['/profile']);
      } else {
        this.errorMessage = result.message || "Invalid Login";
      }

    } catch (error) {
      this.loading = false;
      this.errorMessage = "Unable to connect to server";
      console.error(error);
    }
  }
}
