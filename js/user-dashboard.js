import { subscribeToAccidents, MALAYSIAN_DISTRICTS } from "./accidents.js";

let unsubscribeAccidents = null;

document.addEventListener("DOMContentLoaded", async () => {
  const loadingOverlay = document.getElementById("loading-overlay");
  if (loadingOverlay) loadingOverlay.classList.remove("hidden");

  // Initialize time-based advisory and clock
  initTimeAdvisory();

  // Initialize interactive vehicle checklist
  initSafetyChecklist();

  // Real-time synchronization
  unsubscribeAccidents = subscribeToAccidents((accidents) => {
    renderUserKPIs(accidents);
    renderRecentAccidents(accidents);
    initQuickHotspotFinder(accidents);
    if (loadingOverlay) loadingOverlay.classList.add("hidden");
  }, (error) => {
    console.error("Failed to sync user dashboard:", error);
    if (loadingOverlay) loadingOverlay.classList.add("hidden");
  });

  window.addEventListener("beforeunload", () => {
    if (unsubscribeAccidents) unsubscribeAccidents();
  });
});

function renderUserKPIs(accidents) {
  const total = accidents.length;
  const districtCounts = {};

  accidents.forEach(a => {
    if (a.daerah) districtCounts[a.daerah] = (districtCounts[a.daerah] || 0) + 1;
  });

  let topDistrict = "No Data";
  let maxDistrictCount = 0;
  for (const [dist, count] of Object.entries(districtCounts)) {
    if (count > maxDistrictCount) {
      maxDistrictCount = count;
      topDistrict = dist;
    }
  }

  const kpiTotal = document.getElementById("user-kpi-total");
  if (kpiTotal) kpiTotal.innerText = total;

  const kpiHazard = document.getElementById("user-kpi-hazard");
  if (kpiHazard) {
    kpiHazard.innerText = maxDistrictCount > 0 ? `${topDistrict} (${maxDistrictCount} cases)` : "No Data";
  }
}

// 1. Personal Safety Advisory (Time-of-day & Weather awareness)
function initTimeAdvisory() {
  const iconEl = document.getElementById("advisory-icon");
  const titleEl = document.getElementById("advisory-title");
  const descEl = document.getElementById("advisory-desc");
  const timeTagEl = document.getElementById("advisory-time-tag");
  const clockEl = document.getElementById("current-clock-display");

  function updateAdvisory() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timeStr = `${String(hours).padStart(2, "0")}:${minutes}`;

    if (clockEl) clockEl.innerText = `${timeStr} (MYT)`;

    if (hours >= 23 || hours < 5) {
      if (iconEl) iconEl.innerText = "🌙";
      if (titleEl) titleEl.innerText = "Late-Night Fatigue & Micro-Sleep Hazard";
      if (descEl) descEl.innerText = "Cruising visibility drops significantly after 11 PM. If feeling drowsy, pull over at the nearest R&R stop immediately.";
      if (timeTagEl) {
        timeTagEl.innerText = "Nocturnal Caution";
        timeTagEl.className = "text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold";
      }
    } else if (hours >= 5 && hours < 9) {
      if (iconEl) iconEl.innerText = "🌅";
      if (titleEl) titleEl.innerText = "Morning Peak Commute & Merging Zones";
      if (descEl) descEl.innerText = "Heavy traffic volume on highway entry ramps. Watch for filtering motorcyclists and avoid abrupt lane switching.";
      if (timeTagEl) {
        timeTagEl.innerText = "Morning Rush";
        timeTagEl.className = "text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold";
      }
    } else if (hours >= 12 && hours < 15) {
      if (iconEl) iconEl.innerText = "☀️";
      if (titleEl) titleEl.innerText = "Midday Heat & School Zone Caution";
      if (descEl) descEl.innerText = "High pavement temperatures can trigger tire blowouts. Keep speeds under 30 km/h in school vicinities.";
      if (timeTagEl) {
        timeTagEl.innerText = "School Dispersal";
        timeTagEl.className = "text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold";
      }
    } else if (hours >= 17 && hours < 20) {
      if (iconEl) iconEl.innerText = "🌆";
      if (titleEl) titleEl.innerText = "Evening Monsoon Downpour & Congestion";
      if (descEl) descEl.innerText = "Sudden showers create slick road surfaces. Double your following distance to at least 4 seconds to prevent rear-end collisions.";
      if (timeTagEl) {
        timeTagEl.innerText = "Evening Transit";
        timeTagEl.className = "text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold";
      }
    } else {
      if (iconEl) iconEl.innerText = "🌤️";
      if (titleEl) titleEl.innerText = "Standard Daytime Defensive Driving";
      if (descEl) descEl.innerText = "Maintain a steady cruise speed, signal early before lane transitions, and obey active electronic speed displays.";
      if (timeTagEl) {
        timeTagEl.innerText = "Optimal Conditions";
        timeTagEl.className = "text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold";
      }
    }
  }

  updateAdvisory();
  setInterval(updateAdvisory, 30000);
}

// 2. Quick Hotspot Finder with district filter and direct map zoom shortcut
function initQuickHotspotFinder(accidents) {
  const filterSelect = document.getElementById("hotspot-district-filter");
  const listContainer = document.getElementById("quick-hotspot-list");
  if (!listContainer) return;

  // Extract all unique districts, ensuring all official districts are included
  const allOfficial = Object.values(MALAYSIAN_DISTRICTS).flat();
  const fromData = accidents.map(a => a.daerah).filter(Boolean);
  const districts = Array.from(new Set([...allOfficial, ...fromData])).sort();

  if (filterSelect) {
    const currentVal = filterSelect.value;
    filterSelect.innerHTML = `<option value="ALL">All Districts</option>`;
    districts.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      if (d === currentVal) opt.selected = true;
      filterSelect.appendChild(opt);
    });

    filterSelect.onchange = () => {
      renderHotspots(filterSelect.value);
    };
  }

  function renderHotspots(selectedDistrict) {
    const filtered = selectedDistrict === "ALL" 
      ? accidents 
      : accidents.filter(a => a.daerah === selectedDistrict);

    // Group by road name
    const roadMap = {};
    filtered.forEach(a => {
      const road = a.namaJalan || "Unknown Corridor";
      if (!roadMap[road]) {
        roadMap[road] = {
          road,
          district: a.daerah || "General",
          count: 0,
          fatal: 0,
          lat: a.latitud || a.latitude || 3.1390,
          lng: a.longitud || a.longitude || 101.6869
        };
      }
      roadMap[road].count++;
      if (a.tahapKeterukan === "Fatal") {
        roadMap[road].fatal++;
      }
    });

    const topRoads = Object.values(roadMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    if (topRoads.length === 0) {
      listContainer.innerHTML = `
        <div class="col-span-3 p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl">
          No high-risk accident hotspots recorded in this district yet.
        </div>
      `;
      return;
    }

    listContainer.innerHTML = topRoads.map((item, idx) => {
      const rankBadges = ["🥇 High Risk", "🥈 Elevated", "🥉 Watchlist"];
      const badgeColors = [
        "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50",
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50"
      ];

      return `
        <div class="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/50 flex flex-col justify-between space-y-3 hover:border-blue-300 dark:hover:border-slate-700 transition-all shadow-2xs">
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badgeColors[idx]}">
                ${rankBadges[idx]}
              </span>
              <span class="text-[10px] font-semibold text-slate-400">${item.district}</span>
            </div>
            <h4 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1" title="${item.road}">${item.road}</h4>
            <div class="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span><strong>${item.count}</strong> collisions</span>
              <span>•</span>
              <span class="${item.fatal > 0 ? 'text-red-500 font-semibold' : ''}">${item.fatal} fatal</span>
            </div>
          </div>

          <a href="user-mapper.html?road=${encodeURIComponent(item.road)}&lat=${item.lat}&lng=${item.lng}" class="w-full py-2 px-3 bg-slate-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 text-blue-600 dark:text-blue-300 hover:text-blue-700 font-bold text-[11px] rounded-xl border border-slate-200 dark:border-slate-600 text-center transition-colors flex items-center justify-center gap-1.5 shadow-2xs">
            <span>🗺️ View on Map</span>
          </a>
        </div>
      `;
    }).join("");
  }

  renderHotspots("ALL");
}

// 3. Interactive Vehicle Safety Checklist with localStorage persistence
function initSafetyChecklist() {
  const checkboxes = document.querySelectorAll(".checklist-item");
  const progressText = document.getElementById("checklist-progress-text");
  const statusBadge = document.getElementById("checklist-status-badge");
  const resetBtn = document.getElementById("reset-checklist-btn");

  const storageKey = "vehicle-safety-checklist";
  let savedState = {};

  try {
    savedState = JSON.parse(localStorage.getItem(storageKey) || "{}");
  } catch (e) {
    savedState = {};
  }

  // Restore saved checkbox states
  checkboxes.forEach(cb => {
    const key = cb.getAttribute("data-check");
    if (key && savedState[key]) {
      cb.checked = true;
    }

    cb.addEventListener("change", () => {
      if (key) savedState[key] = cb.checked;
      localStorage.setItem(storageKey, JSON.stringify(savedState));
      updateChecklistUI();
    });
  });

  resetBtn?.addEventListener("click", () => {
    checkboxes.forEach(cb => {
      cb.checked = false;
      const key = cb.getAttribute("data-check");
      if (key) delete savedState[key];
    });
    localStorage.removeItem(storageKey);
    updateChecklistUI();
  });

  function updateChecklistUI() {
    let checkedCount = 0;
    checkboxes.forEach(cb => {
      if (cb.checked) checkedCount++;
    });

    const total = checkboxes.length || 6;
    if (progressText) {
      progressText.innerText = `${checkedCount} of ${total} Checked`;
    }

    if (statusBadge) {
      if (checkedCount === total) {
        statusBadge.innerText = "✓ Vehicle Road-Ready";
        statusBadge.className = "text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono";
      } else if (checkedCount >= 3) {
        statusBadge.innerText = "⚡ Partially Inspected";
        statusBadge.className = "text-[10px] text-blue-600 dark:text-blue-400 font-semibold font-mono";
      } else {
        statusBadge.innerText = "⚠️ Inspection Incomplete";
        statusBadge.className = "text-[10px] text-amber-500 font-semibold font-mono";
      }
    }
  }

  updateChecklistUI();
}

function renderRecentAccidents(accidents) {
  const tbody = document.getElementById("user-recent-tbody");
  if (!tbody) return;

  if (!accidents || accidents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-400">No accident records found.</td></tr>`;
    return;
  }

  const sorted = [...accidents].sort((a, b) => new Date(b.tarikh || 0) - new Date(a.tarikh || 0)).slice(0, 5);

  tbody.innerHTML = sorted.map(a => {
    let severityClass = "bg-green-50 text-green-600 border-green-100";
    if (a.tahapKeterukan === "Fatal") severityClass = "bg-red-50 text-red-600 border-red-100";
    if (a.tahapKeterukan === "Serious") severityClass = "bg-yellow-50 text-yellow-600 border-yellow-100";

    return `
      <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
        <td class="p-3 font-semibold text-slate-800 dark:text-slate-200">${a.namaJalan || "-"}</td>
        <td class="p-3">${a.daerah || "-"}</td>
        <td class="p-3">${a.tarikh || "-"} ${a.masa ? `(${a.masa})` : ""}</td>
        <td class="p-3">
          <span class="px-2.5 py-1 text-[11px] font-bold rounded-lg border ${severityClass}">
            ${a.tahapKeterukan || "-"}
          </span>
        </td>
        <td class="p-3">${a.jenisKenderaan || "-"}</td>
      </tr>
    `;
  }).join("");
}
