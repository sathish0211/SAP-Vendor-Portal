import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  vendorData: any = null;
  loading = true;
  errorMessage = '';

  ngOnInit() {
    const vendorId = localStorage.getItem("vendorId");

    if (!vendorId) {
      this.errorMessage = "No vendor ID found in storage.";
      this.loading = false;
      return;
    }

    this.fetchProfile(vendorId);
  }

  async fetchProfile(vendorId: string) {
    try {
      const response = await fetch("http://localhost:3000/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ vendorId })
      });

      const result = await response.json();
      this.loading = false;

      if (result.vendorId) {
        this.vendorData = {
          id: result.vendorId,
          name: result.vendorName,
          street: result.street,
          city: result.city,
          country: result.country || "N/A",
          postalCode: result.postal,
          phone: result.telephone || "N/A",
          region: result.region
        };
      } else {
        this.errorMessage = "Unable to load vendor profile.";
      }

    } catch (error) {
      this.loading = false;
      this.errorMessage = "Failed to connect to server.";
      console.error(error);
    }
  }
}
