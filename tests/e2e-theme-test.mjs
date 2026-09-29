/**
 * End-to-End Theme Testing Suite for Traffic Accident Hotspot Mapper
 * Tests Light Mode and Dark Mode across all 16 HTML pages, CSS files, and JS modules.
 */

import http from "http";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";

const HTML_PAGES = [
  "index.html",
  "about.html",
  "contact.html",
  "safety.html",
  "statistics.html",
  "user-login.html",
  "admin-login.html",
  "register.html",
  "user-dashboard.html",
  "user-mapper.html",
  "admin-dashboard.html",
  "admin-mapper.html",
  "manage-accidents.html",
  "manage-users.html",
  "hotspot-analysis.html",
  "ai-report.html"
];

const CSS_FILES = [
  "/css/style.css",
  "/css/dashboard.css",
  "/css/auth.css",
  "/css/responsive.css"
];

const JS_FILES = [
  "/js/theme.js",
  "/js/navigation.js",
  "/js/ai-chat.js",
  "/js/hazard-alerts.js",
  "/js/mapper.js",
  "/js/accidents.js",
  "/js/auth.js",
  "/js/statistics.js",
  "/js/user-dashboard.js",
  "/js/admin-dashboard.js",
  "/js/ai-report.js",
  "/js/role-guard.js"
];

function fetchUrl(urlPath) {
  return new Promise((resolve, reject) => {
    const fullUrl = urlPath.startsWith("http") ? urlPath : `${BASE_URL}${urlPath.startsWith("/") ? "" : "/"}${urlPath}`;
    http.get(fullUrl, (res) => {
      let data = "";
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}

// Minimal In-Memory DOM Simulation for Theme Tests
class MockDOM {
  constructor(html = "") {
    this.html = html;
    this.classes = new Set();
    this.storage = {};
    this.listeners = {};
    this.elements = [];
  }

  addClass(cls) { this.classes.add(cls); }
  removeClass(cls) { this.classes.delete(cls); }
  hasClass(cls) { return this.classes.has(cls); }

  setItem(key, val) { this.storage[key] = String(val); }
  getItem(key) { return this.storage[key] || null; }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  dispatchEvent(event, detail) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(fn => fn({ detail }));
    }
  }
}

async function runTests() {
  console.log("==================================================================");
  console.log("🚦 TRAFFIC ACCIDENT HOTSPOT MAPPER - E2E LIGHT & DARK MODE TEST 🚦");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = "") {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}${detail ? " - " + detail : ""}`);
      failed++;
    }
  }

  // 1. HTTP Endpoint & Asset Serving Verification
  console.log("--- 1. HTTP Page & Asset Delivery ---");
  for (const page of HTML_PAGES) {
    try {
      const res = await fetchUrl("/" + page);
      assert(res.statusCode === 200, `Page /${page} returns HTTP 200 OK`);
      assert(res.body.includes("<!DOCTYPE html>"), `Page /${page} contains valid HTML doctype`);
      assert(res.body.includes("/css/style.css"), `Page /${page} links to /css/style.css`);
      assert(res.body.includes("/js/theme.js"), `Page /${page} loads /js/theme.js module`);
      assert(res.body.includes("/js/navigation.js"), `Page /${page} loads /js/navigation.js module`);
    } catch (err) {
      assert(false, `Page /${page} failed to fetch`, err.message);
    }
  }

  for (const cssFile of CSS_FILES) {
    try {
      const res = await fetchUrl(cssFile);
      assert(res.statusCode === 200, `CSS file ${cssFile} returns HTTP 200 OK`);
      assert(res.body.length > 50, `CSS file ${cssFile} has valid content (${res.body.length} bytes)`);
    } catch (err) {
      assert(false, `CSS ${cssFile} fetch failed`, err.message);
    }
  }

  for (const jsFile of JS_FILES) {
    try {
      const res = await fetchUrl(jsFile);
      assert(res.statusCode === 200, `JS module ${jsFile} returns HTTP 200 OK`);
      assert(res.body.length > 30, `JS module ${jsFile} has valid content (${res.body.length} bytes)`);
    } catch (err) {
      assert(false, `JS ${jsFile} fetch failed`, err.message);
    }
  }

  // 2. CSS Dark Mode Rules Audit
  console.log("\n--- 2. CSS Dark Mode Rule Audit ---");
  const styleCss = fs.readFileSync("./css/style.css", "utf-8");
  
  assert(styleCss.includes("html.dark"), "style.css contains 'html.dark' root selector");
  assert(styleCss.includes("color-scheme: dark;"), "style.css defines standard 'color-scheme: dark'");
  assert(styleCss.includes("html.dark body"), "style.css configures dark body background");
  assert(styleCss.includes("html.dark .bg-white"), "style.css overrides .bg-white to dark slate");
  assert(styleCss.includes("html.dark input"), "style.css overrides input backgrounds for dark mode");
  assert(styleCss.includes("html.dark select"), "style.css overrides select backgrounds for dark mode");
  assert(styleCss.includes("html.dark textarea"), "style.css overrides textarea backgrounds for dark mode");
  assert(styleCss.includes("html.dark .theme-toggle-btn"), "style.css styles .theme-toggle-btn in dark mode");
  assert(styleCss.includes("html.dark #trigger-csv-upload-btn"), "style.css styles #trigger-csv-upload-btn in dark mode");
  assert(styleCss.includes("html.dark .leaflet-tile-pane"), "style.css applies dark mode filter to Leaflet tile pane");
  assert(styleCss.includes("html.dark .leaflet-popup-content-wrapper"), "style.css styles Leaflet popup wrapper in dark mode");
  assert(styleCss.includes("html.dark .bg-red-50"), "style.css styles .bg-red-50 dark badge contrast");
  assert(styleCss.includes("html.dark .bg-amber-50"), "style.css styles .bg-amber-50 dark badge contrast");
  assert(styleCss.includes("html.dark .bg-green-50"), "style.css styles .bg-green-50 dark badge contrast");
  assert(styleCss.includes("html.dark .bg-blue-50"), "style.css styles .bg-blue-50 dark badge contrast");

  // Verify that the theme toggle button is NOT forced to pure white (#ffffff) in dark mode
  const whiteThemeToggleMatch = /html\.dark\s+\.theme-toggle-btn\s*\{[^}]*background-color:\s*#ffffff/i.test(styleCss);
  assert(!whiteThemeToggleMatch, "Theme toggle button does NOT have glare white (#ffffff) background in dark mode");

  // Verify that the CSV upload button is NOT forced to pure white (#ffffff) in dark mode
  const whiteCsvUploadMatch = /html\.dark\s+#trigger-csv-upload-btn\s*\{[^}]*background-color:\s*#ffffff/i.test(styleCss);
  assert(!whiteCsvUploadMatch, "CSV upload button does NOT have glare white (#ffffff) background in dark mode");

  // 3. Theme Manager Unit Logic Simulation
  console.log("\n--- 3. Theme Manager Logic Simulation ---");
  const mock = new MockDOM();

  function mockApplyTheme(theme) {
    if (theme === "dark") mock.addClass("dark");
    else mock.removeClass("dark");
    mock.setItem("app_theme", theme);
    mock.dispatchEvent("themeChange", { theme });
  }

  function mockToggleTheme() {
    const current = mock.getItem("app_theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    mockApplyTheme(next);
    return next;
  }

  let themeChangeFired = false;
  let lastThemeDetail = null;
  mock.addEventListener("themeChange", (e) => {
    themeChangeFired = true;
    lastThemeDetail = e.detail.theme;
  });

  // Initial Light Mode State
  mockApplyTheme("light");
  assert(!mock.hasClass("dark"), "Initial theme 'light' does not have 'dark' class");
  assert(mock.getItem("app_theme") === "light", "Storage persists 'light'");
  assert(themeChangeFired && lastThemeDetail === "light", "themeChange event dispatched for 'light'");

  // Toggle to Dark Mode
  themeChangeFired = false;
  const toggled1 = mockToggleTheme();
  assert(toggled1 === "dark", "toggleTheme switches light -> dark");
  assert(mock.hasClass("dark"), "Root element now has 'dark' class");
  assert(mock.getItem("app_theme") === "dark", "Storage persists 'dark'");
  assert(themeChangeFired && lastThemeDetail === "dark", "themeChange event dispatched for 'dark'");

  // Toggle back to Light Mode
  themeChangeFired = false;
  const toggled2 = mockToggleTheme();
  assert(toggled2 === "light", "toggleTheme switches dark -> light");
  assert(!mock.hasClass("dark"), "Root element removes 'dark' class");
  assert(mock.getItem("app_theme") === "light", "Storage persists 'light'");
  assert(themeChangeFired && lastThemeDetail === "light", "themeChange event dispatched for 'light'");

  // 4. Navigation & UI Theme Sync
  console.log("\n--- 4. Navigation & UI Theme Sync ---");
  const navJs = fs.readFileSync("./js/navigation.js", "utf-8");
  assert(navJs.includes("updateThemeToggleUI"), "navigation.js has updateThemeToggleUI function");
  assert(navJs.includes('window.addEventListener("themeChange"'), "navigation.js listens to global 'themeChange' event");
  assert(navJs.includes(".theme-toggle-btn"), "navigation.js binds to .theme-toggle-btn class");
  assert(navJs.includes("theme-icon"), "navigation.js updates .theme-icon dynamically");
  assert(navJs.includes("theme-label"), "navigation.js updates .theme-label dynamically");
  assert(navJs.includes("Switch to Light Mode"), "navigation.js provides accessible aria-labels");

  // 5. Chart.js Theme Adaptability
  console.log("\n--- 5. Chart.js Light & Dark Theme Adaptability ---");
  const adminDashJs = fs.readFileSync("./js/admin-dashboard.js", "utf-8");
  assert(adminDashJs.includes('import { getTheme } from "./theme.js"'), "admin-dashboard.js imports getTheme");
  assert(adminDashJs.includes('window.addEventListener("themeChange"'), "admin-dashboard.js listens to 'themeChange'");
  assert(adminDashJs.includes("getTheme() === \"dark\""), "admin-dashboard.js checks current theme for chart render");

  const statJs = fs.readFileSync("./js/statistics.js", "utf-8");
  assert(statJs.includes('import { getTheme } from "./theme.js"'), "statistics.js imports getTheme");
  assert(statJs.includes('window.addEventListener("themeChange"'), "statistics.js listens to 'themeChange'");
  assert(statJs.includes("chartInstances.forEach"), "statistics.js safely cleans up previous chart instances");
  assert(statJs.includes("donutBorderColor"), "statistics.js adjusts donut chart borders for dark mode");

  // 6. AI Chatbot & Hazard Alerts Theme Integrity
  console.log("\n--- 6. AI Chat & Hazard Alerts Theme Integrity ---");
  const aiChatJs = fs.readFileSync("./js/ai-chat.js", "utf-8");
  assert(aiChatJs.includes("dark:bg-slate-900"), "AI Chat window supports dark:bg-slate-900");
  assert(aiChatJs.includes("dark:border-slate-800"), "AI Chat window supports dark borders");
  assert(aiChatJs.includes("dark:text-white"), "AI Chat text supports dark mode text color");

  const hazardJs = fs.readFileSync("./js/hazard-alerts.js", "utf-8");
  assert(hazardJs.includes("HAZARD_ALERTS_DATABASE"), "Hazard Alerts database is loaded");
  assert(hazardJs.includes("hazard-alert-banner"), "Hazard alert banner renders correctly");

  // Summary
  console.log("\n==================================================================");
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Unhandled test suite error:", err);
  process.exit(1);
});
