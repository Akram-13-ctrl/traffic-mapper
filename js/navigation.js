import { getCurrentUser, logout } from "./auth.js";
import { getTheme, toggleTheme } from "./theme.js";

document.addEventListener("DOMContentLoaded", () => {
  const user = getCurrentUser();
  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  // 1. Inject Sidebar if #sidebar-container is present
  const sidebarContainer = document.getElementById("sidebar-container");
  if (sidebarContainer) {
    injectSidebar(sidebarContainer, currentPath, user);
  }

  // 2. Inject User/Public Navbar if #navbar-container is present
  const navbarContainer = document.getElementById("navbar-container");
  if (navbarContainer) {
    injectUserNavbar(navbarContainer, currentPath, user);
  }

  updateThemeToggleUI();
});

// Robust document-level event delegation
document.addEventListener("click", (e) => {
  const themeBtn = e.target.closest(".theme-toggle-btn");
  if (themeBtn) {
    e.preventDefault();
    e.stopPropagation();
    toggleTheme();
    updateThemeToggleUI();
  }

  const logoutBtn = e.target.closest(".logout-btn");
  if (logoutBtn) {
    e.preventDefault();
    e.stopPropagation();
    logout();
  }
});

function updateThemeToggleUI() {
  const isDark = getTheme() === "dark";
  document.querySelectorAll(".theme-toggle-btn").forEach(btn => {
    const icon = btn.querySelector(".theme-icon");
    const label = btn.querySelector(".theme-label");
    if (icon) icon.textContent = isDark ? "☀️" : "🌙";
    if (label) label.textContent = isDark ? "Light Mode" : "Dark Mode";
    btn.setAttribute("title", isDark ? "Switch to Light Mode" : "Switch to Dark Mode");
    btn.setAttribute("aria-label", isDark ? "Switch to Light Mode" : "Switch to Dark Mode");
  });
}

// Ensure theme toggle UI responds globally to any theme changes
window.addEventListener("themeChange", updateThemeToggleUI);

function injectSidebar(container, currentPath, user) {
  const isUserRole = user && user.role === "user";
  const userName = user ? user.fullName : (isUserRole ? "User" : "Administrator");
  const userEmail = user ? user.email : (isUserRole ? "user@safety.org" : "admin@safety.org");

  const isDark = getTheme() === "dark";
  const themeIcon = isDark ? "🌙" : "☀️";
  const themeText = isDark ? "Dark Mode" : "Light Mode";

  const adminMenuItems = [
    { label: "Dashboard", href: "admin-dashboard.html", icon: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"/></svg>` 
    },
    { label: "Accident Mapper", href: "admin-mapper.html", icon: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>` 
    },
    { label: "Manage Accidents", href: "manage-accidents.html", icon: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>` 
    },
    { label: "Hotspot Analysis", href: "hotspot-analysis.html", icon: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>` 
    },
    { label: "Road Improvement Recommendations", href: "ai-report.html", icon: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h0a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>` 
    },
    { label: "Manage Users", href: "manage-users.html", icon: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>` 
    },
    { label: "Support Tickets", href: "admin-tickets.html", icon: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>` 
    },
    { label: "Account", href: "admin-account.html", icon: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` 
    },
    { label: "System Overview", href: "about.html", icon: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` 
    }
  ];

  const userMenuItems = [
    { label: "Dashboard", href: "user-dashboard.html", icon: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2h-2a2 2 0 01-2-2v-4z"/></svg>`
    },
    { label: "Accident Mapper", href: "user-mapper.html", icon: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`
    },
    { label: "Contact Us", href: "contact.html", icon: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`
    }
  ];

  const menuItems = isUserRole ? userMenuItems : adminMenuItems;
  const portalBadge = isUserRole ? "USER PORTAL" : "ADMIN PORTAL";

  const listItems = menuItems.map(item => {
    const isActive = currentPath === item.href;
    const activeClass = isActive ? "nav-link-active" : "nav-link-inactive";
    return `
      <a href="${item.href}" class="flex items-center gap-3 px-6 py-3.5 transition-all text-sm rounded-r-xl ${activeClass}">
        ${item.icon}
        <span>${item.label}</span>
      </a>
    `;
  }).join("");

  container.innerHTML = `
    <!-- Desktop Sidebar -->
    <aside class="w-64 bg-white border-r border-slate-100 flex-col h-screen sticky top-0 hidden lg:flex z-30">
      <div class="p-6 border-b border-slate-100 flex items-center gap-2.5">
        <div class="w-9 h-9 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md shadow-red-200">
          ⚠️
        </div>
        <div>
          <h1 class="font-display font-bold text-sm tracking-tight text-slate-800 leading-none">Accident Mapper</h1>
          <span class="text-[10px] font-mono text-red-500 font-semibold tracking-wider uppercase">${portalBadge}</span>
        </div>
      </div>
      
      <div class="flex-1 py-6 space-y-1 overflow-y-auto">
        ${listItems}
      </div>

      <div class="p-4 border-t border-slate-50 bg-slate-50/50 space-y-2">
        <button class="theme-toggle-btn w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 cursor-pointer">
          <span class="flex items-center gap-2">
            <span class="theme-icon text-sm">${themeIcon}</span>
            <span class="theme-label">${themeText}</span>
          </span>
          <span class="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400">Toggle</span>
        </button>

        <div class="flex items-center gap-3 px-2 py-2">
          <div class="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
            ${userName.charAt(0)}
          </div>
          <div class="overflow-hidden">
            <h4 class="text-xs font-semibold text-slate-800 truncate">${userName}</h4>
            <p class="text-[10px] text-slate-400 truncate">${userEmail}</p>
          </div>
        </div>

        <button class="logout-btn w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 rounded-lg transition-all duration-200 cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Log Out
        </button>
      </div>
    </aside>

    <!-- Mobile Header -->
    <header class="lg:hidden w-full h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-40">
      <div class="flex items-center gap-2">
        <span class="text-lg">⚠️</span>
        <h1 class="font-display font-bold text-sm tracking-tight text-slate-800">Accident Mapper</h1>
      </div>
      
      <div class="flex items-center gap-2">
        <button class="theme-toggle-btn p-2 text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer">
          <span class="theme-icon text-lg">${themeIcon}</span>
        </button>
        <button id="mobile-menu-toggle" class="p-2 text-slate-600 focus:outline-none">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
        </button>
      </div>
    </header>

    <!-- Mobile Drawer Sidebar -->
    <div id="mobile-sidebar" class="sidebar sidebar-hidden lg:hidden fixed inset-0 z-50 flex">
      <!-- Backdrop -->
      <div id="mobile-sidebar-backdrop" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
      
      <!-- Drawer body -->
      <div class="relative w-64 max-w-xs bg-white h-full flex flex-col z-10 border-r border-slate-100">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">⚠️</span>
            <span class="font-display font-bold text-sm text-slate-800">Accident Mapper</span>
          </div>
          <button id="mobile-menu-close" class="p-1 text-slate-400 hover:text-slate-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div class="flex-1 py-6 space-y-1 overflow-y-auto">
          ${listItems}
        </div>
        
        <div class="p-4 border-t border-slate-100 space-y-2">
          <button class="theme-toggle-btn w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl cursor-pointer">
            <span class="flex items-center gap-2">
              <span class="theme-icon text-sm">${themeIcon}</span>
              <span class="theme-label">${themeText}</span>
            </span>
            <span class="text-[10px] font-mono text-slate-400">Toggle</span>
          </button>

          <button class="logout-btn w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 rounded-lg transition-all duration-200 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Log Out
          </button>
        </div>
      </div>
    </div>
  `;

  // Mobile Menu Listeners
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const closeBtn = document.getElementById("mobile-menu-close");
  const backdrop = document.getElementById("mobile-sidebar-backdrop");
  const mobileSidebar = document.getElementById("mobile-sidebar");

  function toggleMobileSidebar() {
    if (mobileSidebar) {
      mobileSidebar.classList.toggle("sidebar-hidden");
    }
  }

  if (toggleBtn) toggleBtn.addEventListener("click", toggleMobileSidebar);
  if (closeBtn) closeBtn.addEventListener("click", toggleMobileSidebar);
  if (backdrop) backdrop.addEventListener("click", toggleMobileSidebar);
}

function injectUserNavbar(container, currentPath, user) {
  const isLoggedIn = !!user;
  const isUserRole = user && user.role === "user";

  const isDark = getTheme() === "dark";
  const themeIcon = isDark ? "🌙" : "☀️";
  const themeText = isDark ? "Dark Mode" : "Light Mode";

  const publicLinks = [
    { label: "About System", href: "about.html" },
    { label: "Contact Us", href: "contact.html" }
  ];

  const userLinks = [
    { label: "Dashboard", href: "user-dashboard.html" },
    { label: "Accident Mapper", href: "user-mapper.html" },
    { label: "Contact Us", href: "contact.html" }
  ];

  const linksToRender = isLoggedIn && isUserRole ? userLinks : publicLinks;

  const linksHtml = linksToRender.map(item => {
    const isActive = currentPath === item.href;
    const activeClass = isActive ? "text-blue-600 font-semibold border-b-2 border-blue-600" : "text-slate-600 hover:text-blue-600";
    return `
      <a href="${item.href}" class="py-5 px-1 text-sm font-medium transition-all ${activeClass}">
        ${item.label}
      </a>
    `;
  }).join("");

  const mobileLinksHtml = linksToRender.map(item => {
    const isActive = currentPath === item.href;
    const activeClass = isActive ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-600 hover:bg-slate-50";
    return `
      <a href="${item.href}" class="block px-4 py-3 rounded-lg text-sm font-medium ${activeClass}">
        ${item.label}
      </a>
    `;
  }).join("");

  const themeBtnHtml = `
    <button class="theme-toggle-btn flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer mr-2">
      <span class="theme-icon text-sm">${themeIcon}</span>
      <span class="theme-label hidden sm:inline">${themeText}</span>
    </button>
  `;

  let authSection = "";
  let mobileAuthSection = "";

  if (isLoggedIn) {
    authSection = `
      <div class="flex items-center gap-3">
        ${themeBtnHtml}
        <div class="text-right">
          <p class="text-xs font-semibold text-slate-800 leading-none">${user.fullName}</p>
          <span class="text-[9px] font-mono font-bold text-blue-600 tracking-wider uppercase">${user.role.toUpperCase()}</span>
        </div>
        <button class="logout-btn flex items-center justify-center p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer" title="Log Out">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        </button>
      </div>
    `;
    mobileAuthSection = `
      <div class="pt-4 pb-3 border-t border-slate-100">
        <div class="flex items-center px-4 mb-3">
          <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            ${user.fullName.charAt(0)}
          </div>
          <div class="ml-3">
            <h4 class="text-sm font-semibold text-slate-800">${user.fullName}</h4>
            <p class="text-xs text-slate-400">${user.email}</p>
          </div>
        </div>
        <div class="px-4 mb-2">
          <button class="theme-toggle-btn w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl cursor-pointer">
            <span class="flex items-center gap-2">
              <span class="theme-icon text-sm">${themeIcon}</span>
              <span class="theme-label">${themeText}</span>
            </span>
            <span class="text-[10px] font-mono text-slate-400">Toggle</span>
          </button>
        </div>
        <button class="logout-btn w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 rounded-lg transition-all cursor-pointer">
          Log Out
        </button>
      </div>
    `;
  } else {
    authSection = `
      <div class="flex items-center gap-3">
        ${themeBtnHtml}
        <a href="user-login.html" class="px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-all">Sign In</a>
        <a href="register.html" class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-100 transition-all">Register</a>
      </div>
    `;
    mobileAuthSection = `
      <div class="pt-4 pb-3 border-t border-slate-100 px-4 space-y-2">
        <button class="theme-toggle-btn w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl cursor-pointer">
          <span class="flex items-center gap-2">
            <span class="theme-icon text-sm">${themeIcon}</span>
            <span class="theme-label">${themeText}</span>
          </span>
          <span class="text-[10px] font-mono text-slate-400">Toggle</span>
        </button>
        <a href="user-login.html" class="block w-full text-center py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-all">Sign In</a>
        <a href="register.html" class="block w-full text-center py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all">Register</a>
      </div>
    `;
  }

  container.innerHTML = `
    <nav class="bg-white border-b border-slate-100 w-full sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo Section -->
          <div class="flex items-center gap-8">
            <a href="index.html" class="flex items-center gap-2">
              <span class="text-xl">⚠️</span>
              <span class="font-display font-bold text-base tracking-tight text-slate-800">Hotspot Mapper</span>
            </a>
            
            <!-- Desktop Links -->
            <div class="hidden md:flex space-x-6">
              ${linksHtml}
            </div>
          </div>
          
          <!-- Desktop Auth Section -->
          <div class="hidden md:flex items-center">
            ${authSection}
          </div>
          
          <!-- Mobile Menu Button -->
          <div class="flex items-center md:hidden gap-2">
            <button class="theme-toggle-btn p-2 text-slate-600 focus:outline-none cursor-pointer">
              <span class="theme-icon text-lg">${themeIcon}</span>
            </button>
            <button id="nav-menu-toggle" class="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 focus:outline-none">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Mobile Drawer Navbar Menu -->
      <div id="nav-mobile-menu" class="hidden md:hidden bg-white border-b border-slate-100">
        <div class="px-2 pt-2 pb-3 space-y-1">
          ${mobileLinksHtml}
        </div>
        ${mobileAuthSection}
      </div>
    </nav>
  `;

  // Toggle mobile menu
  const navToggle = document.getElementById("nav-menu-toggle");
  const navMenu = document.getElementById("nav-mobile-menu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("hidden");
    });
  }
}

// Automatically load AI Safety Assistant Chatbot widget if not already injected
if (!document.getElementById("ai-chat-script-tag") && !document.getElementById("ai-chat-widget-root")) {
  const chatScript = document.createElement("script");
  chatScript.id = "ai-chat-script-tag";
  chatScript.type = "module";
  chatScript.src = "/js/ai-chat.js";
  document.body.appendChild(chatScript);
}

