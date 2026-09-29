import { getCurrentUser } from "./auth.js";

(function() {
  const user = getCurrentUser();
  const path = window.location.pathname.split("/").pop() || "index.html";
  
  // Define page categories
  const adminPages = [
    "admin-dashboard.html",
    "admin-mapper.html",
    "manage-accidents.html",
    "hotspot-analysis.html",
    "ai-report.html",
    "manage-users.html",
    "admin-tickets.html",
    "admin-account.html"
  ];
  
  const userPages = [
    "user-dashboard.html",
    "user-mapper.html"
  ];

  // If page is admin protected
  if (adminPages.includes(path)) {
    if (!user) {
      alert("Please log in as an Administrator to access this page.");
      window.location.href = "admin-login.html";
    } else if (user.role !== "admin") {
      alert("Access denied. This account is not registered as an administrator.");
      window.location.href = "user-dashboard.html";
    }
  }

  // If page is user protected
  if (userPages.includes(path)) {
    if (!user) {
      alert("Please log in to access this page.");
      window.location.href = "user-login.html";
    }
  }
})();

