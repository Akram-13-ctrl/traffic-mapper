import { db } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Seed Simulation Inquiries/Tickets if not present
export const seedSimulationInquiries = () => {
  const existing = localStorage.getItem("inquiries");
  if (!existing || JSON.parse(existing).length === 0) {
    const defaultTickets = [
      {
        id: "TCK-849102",
        fullName: "Ahmad Zulkifli",
        email: "zulkifli.ahmad@gmail.com",
        category: "Road Blackspot Report",
        subject: "Dangerous blind curve on Federal Highway KM 14",
        message: "There have been multiple wet-weather spin-outs on the westbound flyover ramp near Batu Tiga. The drainage appears clogged and causes 3 inches of standing water during thunderstorms. Urgent anti-skid resurfacing requested.",
        status: "New",
        timestamp: "2026-09-27T14:30:00Z",
        adminNotes: ""
      },
      {
        id: "TCK-712940",
        fullName: "Siti Nurhaliza Tan",
        email: "siti.tan@outlook.com",
        category: "Pavement & Lighting Damage",
        subject: "Streetlight malfunction along Jalan Ampang Embassy Row",
        message: "Five consecutive high-mast streetlights have been completely unlit for the past week between the Thai Embassy and Great Eastern Mall. Pedestrians crossing at night are practically invisible.",
        status: "In Review",
        timestamp: "2026-09-26T09:15:00Z",
        adminNotes: "Notified DBKL electrical engineering department for lamp replacement inspection."
      },
      {
        id: "TCK-551029",
        fullName: "David Raj",
        email: "david.raj@gmail.com",
        category: "Traffic Calming Request",
        subject: "Request for speed humps near SK Subang Jaya",
        message: "Vehicles speeding over 70 km/h during school dismissal times along Persiaran Kewajipan feeder road. We urge the authorities to install raised pedestrian tables or rumble strips.",
        status: "Resolved",
        timestamp: "2026-09-24T11:45:00Z",
        adminNotes: "JKR Subang Jaya confirmed deployment of transverse optical speed bars and 30 km/h school zone signage."
      }
    ];
    localStorage.setItem("inquiries", JSON.stringify(defaultTickets));
  }
};
seedSimulationInquiries();

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-inquiry-form");
  const statusDiv = document.getElementById("contact-form-status");
  const submitBtn = document.getElementById("contact-submit-btn");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("contact-name")?.value.trim();
    const email = document.getElementById("contact-email")?.value.trim();
    const subject = document.getElementById("contact-subject")?.value.trim();
    const message = document.getElementById("contact-message")?.value.trim();
    const category = document.getElementById("contact-category")?.value || "General Road Inquiry";

    if (!fullName || !email || !subject || !message) {
      showStatus("Please fill in all required fields.", "error");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showStatus("Please enter a valid email address.", "error");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span>Submitting Ticket...</span>
      `;
    }

    const ticketId = "TCK-" + Math.floor(100000 + Math.random() * 900000);

    try {
      const inquiryData = {
        id: ticketId,
        fullName,
        email,
        category,
        subject,
        message,
        status: "New",
        timestamp: new Date().toISOString(),
        adminNotes: ""
      };

      // Always save to local buffer so admin can inspect immediately
      const existing = JSON.parse(localStorage.getItem("inquiries") || "[]");
      existing.unshift(inquiryData);
      localStorage.setItem("inquiries", JSON.stringify(existing));
      window.dispatchEvent(new CustomEvent("inquiries_updated"));

      if (db) {
        try {
          await addDoc(collection(db, "inquiries"), {
            ...inquiryData,
            serverTimestamp: serverTimestamp()
          });
        } catch (fbErr) {
          console.warn("Firestore sync deferred, saved to local store:", fbErr);
        }
      }

      form.reset();
      showStatus(`Thank you! Your ticket #${ticketId} has been successfully submitted to the Road Safety Administration unit.`, "success");
    } catch (err) {
      console.error("Error submitting inquiry:", err);
      showStatus("An unexpected error occurred. Please try again.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>✉️ Send Message</span>`;
      }
    }
  });

  function showStatus(text, type) {
    if (!statusDiv) return;
    statusDiv.classList.remove("hidden", "bg-emerald-50", "text-emerald-800", "border-emerald-200", "bg-red-50", "text-red-800", "border-red-200", "border");
    if (type === "success") {
      statusDiv.classList.add("bg-emerald-50", "text-emerald-800", "border", "border-emerald-200");
      statusDiv.innerHTML = `<strong>✓ Success:</strong> ${text}`;
    } else {
      statusDiv.classList.add("bg-red-50", "text-red-800", "border", "border-red-200");
      statusDiv.innerHTML = `<strong>⚠️ Warning:</strong> ${text}`;
    }
  }
});
