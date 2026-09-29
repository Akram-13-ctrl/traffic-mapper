import { getAccidents } from "./accidents.js";
import { getTheme } from "./theme.js";

let chartInstances = [];
let cachedAccidents = [];

document.addEventListener("DOMContentLoaded", async () => {
  const loadingOverlay = document.getElementById("loading-overlay");
  if (loadingOverlay) loadingOverlay.classList.remove("hidden");

  try {
    cachedAccidents = await getAccidents();
    renderStatisticsCharts(cachedAccidents);
  } catch (error) {
    console.error("Gagal menjana carta statistik:", error);
  } finally {
    if (loadingOverlay) loadingOverlay.classList.add("hidden");
  }

  // Re-render charts on theme change
  window.addEventListener("themeChange", () => {
    if (cachedAccidents && cachedAccidents.length > 0) {
      renderStatisticsCharts(cachedAccidents);
    }
  });
});

function renderStatisticsCharts(accidents) {
  if (!window.Chart) {
    console.warn("Chart.js is not loaded.");
    return;
  }

  // Destroy existing charts to prevent canvas memory leaks
  chartInstances.forEach(c => c && c.destroy());
  chartInstances = [];

  const isDark = getTheme() === "dark";
  const tickColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9";
  const labelColor = isDark ? "#f3f4f6" : "#1e293b";
  const donutBorderColor = isDark ? "#111827" : "#ffffff";

  // Common font styling
  const commonFont = { family: "Inter", size: 11 };

  // 1. Chart by Year (Trend 3 Tahun)
  const yearCounts = {};
  accidents.forEach(a => {
    const year = (a.tarikh || "").split("-")[0] || "2026";
    yearCounts[year] = (yearCounts[year] || 0) + 1;
  });
  const yearsSorted = Object.keys(yearCounts).sort();
  const yearData = yearsSorted.map(y => yearCounts[y]);

  const yearCanvas = document.getElementById("chart-by-year");
  if (yearCanvas) {
    const c1 = new window.Chart(yearCanvas, {
      type: "line",
      data: {
        labels: yearsSorted,
        datasets: [{
          label: "Annual Accident Cases",
          data: yearData,
          borderColor: "#3b82f6",
          backgroundColor: isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(37, 99, 235, 0.1)",
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: "#3b82f6",
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: tickColor, font: commonFont } },
          x: { grid: { display: false }, ticks: { color: tickColor, font: commonFont } }
        }
      }
    });
    chartInstances.push(c1);
  }

  // 2. Chart by District (Daerah)
  const districtCounts = {};
  accidents.forEach(a => {
    if (a.daerah) districtCounts[a.daerah] = (districtCounts[a.daerah] || 0) + 1;
  });
  const districtsSorted = Object.keys(districtCounts).sort((a,b) => districtCounts[b] - districtCounts[a]);
  const districtData = districtsSorted.map(d => districtCounts[d]);

  const districtCanvas = document.getElementById("chart-by-district");
  if (districtCanvas) {
    const c2 = new window.Chart(districtCanvas, {
      type: "bar",
      data: {
        labels: districtsSorted,
        datasets: [{
          data: districtData,
          backgroundColor: "#3b82f6",
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: tickColor, font: commonFont } },
          x: { grid: { display: false }, ticks: { color: tickColor, font: commonFont } }
        }
      }
    });
    chartInstances.push(c2);
  }

  // 3. Chart by Severity (Tahap Keterukan)
  const fatalCount = accidents.filter(a => a.tahapKeterukan === "Fatal").length;
  const seriousCount = accidents.filter(a => a.tahapKeterukan === "Serious").length;
  const minorCount = accidents.filter(a => a.tahapKeterukan === "Minor").length;

  const severityCanvas = document.getElementById("chart-by-severity");
  if (severityCanvas) {
    const c3 = new window.Chart(severityCanvas, {
      type: "doughnut",
      data: {
        labels: ["Fatal", "Serious", "Minor"],
        datasets: [{
          data: [fatalCount, seriousCount, minorCount],
          backgroundColor: ["#ef4444", "#f59e0b", "#10b981"],
          borderWidth: 2,
          borderColor: donutBorderColor
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { font: commonFont, color: labelColor, boxWidth: 12 }
          }
        },
        cutout: "60%"
      }
    });
    chartInstances.push(c3);
  }

  // 4. Chart by Vehicle Type (Jenis Kenderaan)
  const vehicleCounts = {};
  accidents.forEach(a => {
    if (a.jenisKenderaan) vehicleCounts[a.jenisKenderaan] = (vehicleCounts[a.jenisKenderaan] || 0) + 1;
  });
  const vehiclesSorted = Object.keys(vehicleCounts).sort((a,b) => vehicleCounts[b] - vehicleCounts[a]);
  const vehicleData = vehiclesSorted.map(v => vehicleCounts[v]);

  const vehicleCanvas = document.getElementById("chart-by-vehicle");
  if (vehicleCanvas) {
    const c4 = new window.Chart(vehicleCanvas, {
      type: "bar",
      data: {
        labels: vehiclesSorted,
        datasets: [{
          data: vehicleData,
          backgroundColor: "#10b981",
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { display: false }, ticks: { color: tickColor, font: commonFont } },
          x: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: tickColor, font: commonFont } }
        }
      }
    });
    chartInstances.push(c4);
  }

  // 5. Chart by Time of Day (Waktu Kemalangan)
  let pagi = 0, tengahHari = 0, petangMalam = 0, lewatMalam = 0;

  accidents.forEach(a => {
    const hour = parseInt((a.masa || "").split(":")[0]);
    if (isNaN(hour)) return;
    if (hour >= 6 && hour < 12) pagi++;
    else if (hour >= 12 && hour < 18) tengahHari++;
    else if (hour >= 18 && hour < 24) petangMalam++;
    else lewatMalam++;
  });

  const timeCanvas = document.getElementById("chart-by-time");
  if (timeCanvas) {
    const c5 = new window.Chart(timeCanvas, {
      type: "polarArea",
      data: {
        labels: ["Morning (6am-12pm)", "Midday (12pm-6pm)", "Evening (6pm-12am)", "Late Night (12am-6am)"],
        datasets: [{
          data: [pagi, tengahHari, petangMalam, lewatMalam],
          backgroundColor: [
            "rgba(59, 130, 246, 0.7)",
            "rgba(245, 158, 11, 0.7)",
            "rgba(99, 102, 241, 0.7)",
            "rgba(148, 163, 184, 0.7)"
          ],
          borderWidth: 1,
          borderColor: donutBorderColor
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { font: commonFont, color: labelColor, boxWidth: 12 }
          }
        },
        scales: {
          r: {
            grid: { color: gridColor },
            ticks: { backdropColor: "transparent", color: tickColor, font: { size: 9 } }
          }
        }
      }
    });
    chartInstances.push(c5);
  }
}
