import { subscribeToAccidents } from "./accidents.js";
import { getTheme } from "./theme.js";

let summaryChartInstance = null;
let unsubscribeAccidents = null;
let cachedAccidents = [];

document.addEventListener("DOMContentLoaded", async () => {
  const loadingOverlay = document.getElementById("loading-overlay");
  if (loadingOverlay) loadingOverlay.classList.remove("hidden");

  // Real-time synchronization
  unsubscribeAccidents = subscribeToAccidents((accidents) => {
    cachedAccidents = accidents;
    renderKPIs(accidents);
    renderRecentTable(accidents.slice(0, 5));
    renderAdminCharts(accidents);
    if (loadingOverlay) loadingOverlay.classList.add("hidden");
  }, (err) => {
    console.error("Dashboard real-time sync warning:", err);
    if (loadingOverlay) loadingOverlay.classList.add("hidden");
  });

  // Re-render chart with matching colors when theme toggles
  window.addEventListener("themeChange", () => {
    if (cachedAccidents && cachedAccidents.length > 0) {
      renderAdminCharts(cachedAccidents);
    }
  });

  window.addEventListener("beforeunload", () => {
    if (unsubscribeAccidents) unsubscribeAccidents();
  });
});

function renderKPIs(accidents) {
  const total = accidents.length;
  const fatal = accidents.filter(a => a.tahapKeterukan === "Fatal").length;
  const serious = accidents.filter(a => a.tahapKeterukan === "Serious").length;
  const minor = accidents.filter(a => a.tahapKeterukan === "Minor").length;

  const totalEl = document.getElementById("kpi-total");
  if (totalEl) totalEl.innerText = total;
  const fatalEl = document.getElementById("kpi-fatal");
  if (fatalEl) fatalEl.innerText = fatal;
  const seriousEl = document.getElementById("kpi-serious");
  if (seriousEl) seriousEl.innerText = serious;
  const minorEl = document.getElementById("kpi-minor");
  if (minorEl) minorEl.innerText = minor;

  // Calculate top district and vehicle
  const districtCounts = {};
  const vehicleCounts = {};

  accidents.forEach(a => {
    if (a.daerah) districtCounts[a.daerah] = (districtCounts[a.daerah] || 0) + 1;
    if (a.jenisKenderaan) vehicleCounts[a.jenisKenderaan] = (vehicleCounts[a.jenisKenderaan] || 0) + 1;
  });

  let topDistrict = "No data";
  let maxDistrictCount = 0;
  for (const [dist, count] of Object.entries(districtCounts)) {
    if (count > maxDistrictCount) {
      maxDistrictCount = count;
      topDistrict = dist;
    }
  }

  let topVehicle = "No data";
  let maxVehicleCount = 0;
  for (const [veh, count] of Object.entries(vehicleCounts)) {
    if (count > maxVehicleCount) {
      maxVehicleCount = count;
      topVehicle = veh;
    }
  }

  const topDistEl = document.getElementById("kpi-top-district");
  if (topDistEl) topDistEl.innerText = maxDistrictCount > 0 ? `${topDistrict} (${maxDistrictCount} cases)` : "No data";
  const topVehEl = document.getElementById("kpi-top-vehicle");
  if (topVehEl) topVehEl.innerText = maxVehicleCount > 0 ? `${topVehicle} (${maxVehicleCount} cases)` : "No data";
}

function renderRecentTable(recentList) {
  const tbody = document.getElementById("recent-accidents-tbody");
  if (!tbody) return;

  if (recentList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-400">No accident records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = recentList.map(a => {
    let severityBadge = "";
    if (a.tahapKeterukan === "Fatal") {
      severityBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">🛑 Fatal</span>`;
    } else if (a.tahapKeterukan === "Serious") {
      severityBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">⚠️ Serious</span>`;
    } else {
      severityBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300">🟢 Minor</span>`;
    }

    return `
      <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <td class="p-4 text-sm font-medium text-slate-900 dark:text-white">${a.namaJalan}</td>
        <td class="p-4 text-sm text-slate-600 dark:text-slate-300">${a.daerah}</td>
        <td class="p-4 text-sm text-slate-600 dark:text-slate-300">${a.tarikh}</td>
        <td class="p-4 text-sm text-slate-500 dark:text-slate-400 font-mono">${a.masa}</td>
        <td class="p-4 text-sm">${severityBadge}</td>
        <td class="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">${a.jenisKenderaan}</td>
      </tr>
    `;
  }).join("");
}

function renderAdminCharts(accidents) {
  const ctx = document.getElementById("admin-summary-chart");
  if (!ctx) return;

  // Group by District
  const districts = {};
  accidents.forEach(a => {
    if (a.daerah) districts[a.daerah] = (districts[a.daerah] || 0) + 1;
  });

  const labels = Object.keys(districts);
  const data = Object.values(districts);

  if (summaryChartInstance) {
    summaryChartInstance.destroy();
  }

  if (window.Chart) {
    const isDark = getTheme() === "dark";
    const tickColor = isDark ? "#94a3b8" : "#64748b";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(148, 163, 184, 0.15)";

    summaryChartInstance = new window.Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Total Incident Count",
          data: data,
          backgroundColor: "#3b82f6",
          borderRadius: 8,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: { color: tickColor, font: { family: "Inter" } }
          },
          x: {
            grid: { display: false },
            ticks: { color: tickColor, font: { family: "Inter" } }
          }
        }
      }
    });
  }
}
