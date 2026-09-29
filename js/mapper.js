import { subscribeToAccidents, MALAYSIAN_STATES, STATE_COORDINATES, MALAYSIAN_DISTRICTS, DISTRICT_COORDINATES } from "./accidents.js";
import { getTheme } from "./theme.js";

let map;
let baseTileLayer;
let markerLayer;
let allAccidents = [];
const markerMap = new Map();
let unsubscribeAccidents = null;

function getMapTileUrl() {
  return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
}

document.addEventListener("DOMContentLoaded", async () => {
  const mapElement = document.getElementById("accident-map");
  if (!mapElement) return;

  // Initialize Leaflet Map centered on Peninsular & East Malaysia
  map = L.map("accident-map").setView([4.2105, 101.9758], 6);

  // Base map layer (OpenStreetMap public tile server)
  baseTileLayer = L.tileLayer(getMapTileUrl(), {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  // Listen for global theme changes to switch map tile
  window.addEventListener("themeChange", () => {
    if (baseTileLayer) {
      baseTileLayer.setUrl(getMapTileUrl());
    }
  });

  // Ensure map tiles fit properly when window or container resizes
  window.addEventListener("resize", () => {
    if (map) map.invalidateSize();
  });
  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 250);

  markerLayer = L.layerGroup().addTo(map);

  const loadingOverlay = document.getElementById("loading-overlay");
  if (loadingOverlay) loadingOverlay.classList.remove("hidden");

  // Wire up search input & auto-complete
  initMapSearchBar();
  initGoogleMapsGroundingSidebar();

  // Wire up State (Negeri) filter event with cascading District update & map panning
  const negeriSelect = document.getElementById("filter-negeri");
  if (negeriSelect) {
    negeriSelect.addEventListener("change", (e) => {
      const selectedState = e.target.value;
      populateDistrictFilter(allAccidents, selectedState);
      
      // Auto-pan / flyTo selected state center
      if (selectedState !== "all" && STATE_COORDINATES[selectedState]) {
        const coord = STATE_COORDINATES[selectedState];
        map.flyTo([coord.lat, coord.lng], coord.zoom, { duration: 1.0 });
      } else {
        map.flyTo([4.2105, 101.9758], 6, { duration: 1.0 });
      }
      applyFiltersAndRender();
    });
  }

  // Wire up District (Daerah) filter event with auto-zoom to district
  const daerahSelect = document.getElementById("filter-daerah");
  if (daerahSelect) {
    daerahSelect.addEventListener("change", (e) => {
      const selectedDistrict = e.target.value;
      if (selectedDistrict !== "all") {
        const matchingAccidents = allAccidents.filter(a => {
          const aDaerah = (a.daerah || "").trim().toLowerCase();
          const targetDaerah = selectedDistrict.trim().toLowerCase();
          return aDaerah === targetDaerah || 
                 aDaerah.startsWith(targetDaerah) || 
                 targetDaerah.startsWith(aDaerah) ||
                 aDaerah.includes(targetDaerah) || 
                 targetDaerah.includes(aDaerah);
        });

        if (matchingAccidents.length > 0) {
          const latSum = matchingAccidents.reduce((s, a) => s + Number(a.latitude), 0);
          const lngSum = matchingAccidents.reduce((s, a) => s + Number(a.longitude), 0);
          map.flyTo([latSum / matchingAccidents.length, lngSum / matchingAccidents.length], 12, { duration: 1.0 });
        } else if (DISTRICT_COORDINATES[selectedDistrict]) {
          const coord = DISTRICT_COORDINATES[selectedDistrict];
          map.flyTo([coord.lat, coord.lng], coord.zoom || 12, { duration: 1.0 });
        }
      }
      applyFiltersAndRender();
    });
  }

  // Wire up other filter events
  const filters = ["filter-severity", "filter-vehicle", "filter-start-date", "filter-end-date"];
  filters.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", applyFiltersAndRender);
  });

  // Real-Time Data Synchronization via onSnapshot listener
  unsubscribeAccidents = subscribeToAccidents((accidents) => {
    allAccidents = accidents;
    populateStateFilter(allAccidents);
    const selectedState = document.getElementById("filter-negeri")?.value || "all";
    populateDistrictFilter(allAccidents, selectedState);
    applyFiltersAndRender();
    if (loadingOverlay) loadingOverlay.classList.add("hidden");

    // Check URL parameters for deep-linking (e.g. from user dashboard or direct link)
    handleUrlDeepLinking();
  }, (err) => {
    console.error("Accidents subscription warning:", err);
    if (loadingOverlay) loadingOverlay.classList.add("hidden");
  });

  // Cleanup on unload to prevent memory leaks
  window.addEventListener("beforeunload", () => {
    if (unsubscribeAccidents) {
      unsubscribeAccidents();
    }
  });
});

function populateStateFilter(accidents) {
  const negeriSelect = document.getElementById("filter-negeri");
  if (!negeriSelect) return;

  const currentVal = negeriSelect.value;
  // Get unique states from data, combined with default MALAYSIAN_STATES
  const statesInData = accidents.map(a => a.negeri).filter(Boolean);
  const allStates = [...new Set([...MALAYSIAN_STATES, ...statesInData])].sort();

  negeriSelect.innerHTML = `<option value="all">All States (Seluruh Malaysia)</option>`;
  allStates.forEach(st => {
    const isSelected = st === currentVal ? "selected" : "";
    negeriSelect.innerHTML += `<option value="${st}" ${isSelected}>${st}</option>`;
  });
}

function populateDistrictFilter(accidents, selectedState = "all") {
  const daerahSelect = document.getElementById("filter-daerah");
  if (!daerahSelect) return;

  const currentVal = daerahSelect.value;
  let allDistricts = [];

  if (selectedState === "all") {
    // Show all districts across Malaysia
    const allOfficial = Object.values(MALAYSIAN_DISTRICTS).flat();
    const fromData = (accidents || []).map(a => a.daerah).filter(Boolean);
    allDistricts = [...new Set([...allOfficial, ...fromData])].sort();
  } else {
    // Show all official districts of the selected state
    const official = MALAYSIAN_DISTRICTS[selectedState] || [];
    const fromData = (accidents || [])
      .filter(a => a.negeri === selectedState)
      .map(a => a.daerah)
      .filter(Boolean);
    allDistricts = [...new Set([...official, ...fromData])].sort();
  }

  const labelSuffix = selectedState === "all" ? "All Districts" : `All Districts (${selectedState})`;
  daerahSelect.innerHTML = `<option value="all">${labelSuffix}</option>`;
  
  allDistricts.forEach(d => {
    const isSelected = d === currentVal ? "selected" : "";
    daerahSelect.innerHTML += `<option value="${d}" ${isSelected}>${d}</option>`;
  });
}

function applyFiltersAndRender() {
  const filterNegeri = document.getElementById("filter-negeri")?.value || "all";
  const filterDaerah = document.getElementById("filter-daerah")?.value || "all";
  const filterSeverity = document.getElementById("filter-severity")?.value || "all";
  const filterVehicle = document.getElementById("filter-vehicle")?.value || "all";
  const filterStart = document.getElementById("filter-start-date")?.value || "";
  const filterEnd = document.getElementById("filter-end-date")?.value || "";
  const searchTerm = (document.getElementById("search-location-input")?.value || "").trim().toLowerCase();

  const filtered = allAccidents.filter(a => {
    if (filterNegeri !== "all" && a.negeri && a.negeri !== filterNegeri) return false;
    if (filterDaerah !== "all") {
      const aDaerah = (a.daerah || "").trim().toLowerCase();
      const targetDaerah = filterDaerah.trim().toLowerCase();
      const matches = aDaerah === targetDaerah || 
                      aDaerah.startsWith(targetDaerah) || 
                      targetDaerah.startsWith(aDaerah) ||
                      aDaerah.includes(targetDaerah) || 
                      targetDaerah.includes(aDaerah);
      if (!matches) return false;
    }
    if (filterSeverity !== "all" && a.tahapKeterukan !== filterSeverity) return false;
    if (filterVehicle !== "all" && a.jenisKenderaan !== filterVehicle) return false;
    if (filterStart && a.tarikh < filterStart) return false;
    if (filterEnd && a.tarikh > filterEnd) return false;
    if (searchTerm) {
      const road = (a.namaJalan || "").toLowerCase();
      const district = (a.daerah || "").toLowerCase();
      const state = (a.negeri || "").toLowerCase();
      if (!road.includes(searchTerm) && !district.includes(searchTerm) && !state.includes(searchTerm)) {
        return false;
      }
    }
    return true;
  });

  renderMapLayers(filtered);
  updateMapStats(filtered);
}

function renderMapLayers(filteredAccidents) {
  // Clear existing markers and registry
  markerLayer.clearLayers();
  markerMap.clear();

  // Create markers
  filteredAccidents.forEach(a => {
    let pulseClass = "marker-pulse-green";
    let colorHex = "#22c55e";

    if (a.tahapKeterukan === "Fatal") {
      pulseClass = "marker-pulse-red";
      colorHex = "#ef4444";
    } else if (a.tahapKeterukan === "Serious") {
      pulseClass = "marker-pulse-yellow";
      colorHex = "#eab308";
    }

    // Custom pulsing DivIcon
    const customIcon = L.divIcon({
      html: `<div class="w-4 h-4 rounded-full border border-white shadow-md ${pulseClass}"></div>`,
      className: "custom-div-icon",
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const popupContent = `
      <div class="p-2.5 space-y-2 min-w-[230px]">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-1.5 gap-2">
          <span class="text-xs font-bold text-slate-900 dark:text-white font-display">${a.namaJalan}</span>
          <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" style="background-color: ${colorHex}20; color: ${colorHex}">
            ${a.tahapKeterukan}
          </span>
        </div>
        <div class="text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
          <p><strong>State & District:</strong> ${a.negeri ? a.negeri + ', ' : ''}${a.daerah}</p>
          <p><strong>Vehicle:</strong> ${a.jenisKenderaan}</p>
          <p><strong>Date/Time:</strong> ${a.tarikh} | ${a.masa}</p>
          ${a.typeOfInjuries ? `<p><strong>Injuries:</strong> ${a.typeOfInjuries}</p>` : ""}
        </div>
        <div class="pt-1 flex flex-col gap-1.5">
          <button data-acc-id="${a.id}" class="view-detail-btn w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5">
            <span>📋 Report & Mitigations</span>
          </button>
          <a href="https://www.google.com/maps/search/?api=1&query=${a.latitude},${a.longitude}" target="_blank" rel="noopener noreferrer" class="w-full py-1.5 px-3 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 font-bold text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 transition-all text-center flex items-center justify-center gap-1.5">
            <span>🗺️ Open in Google Maps</span>
          </a>
        </div>
      </div>
    `;

    const marker = L.marker([a.latitude, a.longitude], { icon: customIcon })
      .bindPopup(popupContent)
      .addTo(markerLayer);

    markerMap.set(String(a.id), marker);

    marker.on('popupopen', () => {
      setTimeout(() => {
        const detailBtn = document.querySelector(`.view-detail-btn[data-acc-id="${a.id}"]`);
        if (detailBtn) {
          detailBtn.onclick = () => showAccidentDetailModal(a);
        }
      }, 50);
    });
  });
}

// 5. Enhanced Search Bar with Auto-Zoom and Auto-Complete
function initMapSearchBar() {
  const searchInput = document.getElementById("search-location-input");
  const clearBtn = document.getElementById("clear-search-btn");
  const autoList = document.getElementById("search-autocomplete-list");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const val = searchInput.value.trim();
    if (clearBtn) {
      if (val) clearBtn.classList.remove("hidden");
      else clearBtn.classList.add("hidden");
    }

    if (val.length < 2) {
      if (autoList) autoList.classList.add("hidden");
      applyFiltersAndRender();
      return;
    }

    const matches = allAccidents.filter(a => {
      const road = (a.namaJalan || "").toLowerCase();
      const dist = (a.daerah || "").toLowerCase();
      return road.includes(val.toLowerCase()) || dist.includes(val.toLowerCase());
    }).slice(0, 6);

    if (autoList) {
      if (matches.length === 0) {
        autoList.innerHTML = `<div class="p-3 text-center text-slate-400">No matching roads or districts found.</div>`;
        autoList.classList.remove("hidden");
      } else {
        autoList.innerHTML = matches.map(m => `
          <div class="search-result-item p-2.5 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between" data-acc-id="${m.id}" data-road="${m.namaJalan}">
            <div>
              <div class="font-bold text-slate-800 dark:text-white">${m.namaJalan}</div>
              <div class="text-[10px] text-slate-400">${m.daerah} • ${m.tarikh}</div>
            </div>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded ${
              m.tahapKeterukan === 'Fatal' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
            }">${m.tahapKeterukan}</span>
          </div>
        `).join("");
        autoList.classList.remove("hidden");

        autoList.querySelectorAll(".search-result-item").forEach(item => {
          item.addEventListener("click", () => {
            const accId = item.getAttribute("data-acc-id");
            const roadName = item.getAttribute("data-road");
            searchInput.value = roadName;
            autoList.classList.add("hidden");
            if (clearBtn) clearBtn.classList.remove("hidden");

            const targetAccident = allAccidents.find(a => String(a.id) === String(accId));
            if (targetAccident) {
              zoomToAndOpenMarker(targetAccident);
            }
          });
        });
      }
    }

    applyFiltersAndRender();
  });

  // Enter key support: zoom to top match
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (autoList) autoList.classList.add("hidden");
      const val = searchInput.value.trim().toLowerCase();
      if (!val) return;
      const match = allAccidents.find(a => 
        (a.namaJalan || "").toLowerCase().includes(val) || 
        (a.daerah || "").toLowerCase().includes(val)
      );
      if (match) {
        zoomToAndOpenMarker(match);
      }
    }
  });

  clearBtn?.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.classList.add("hidden");
    if (autoList) autoList.classList.add("hidden");
    applyFiltersAndRender();
    map.flyTo([3.1390, 101.6869], 12, { animate: true, duration: 1.0 });
  });

  // Hide autocomplete on click outside
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !autoList?.contains(e.target)) {
      autoList?.classList.add("hidden");
    }
  });
}

function zoomToAndOpenMarker(accident) {
  if (!accident || !map) return;
  const lat = accident.latitude;
  const lng = accident.longitude;

  map.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });

  setTimeout(() => {
    const marker = markerMap.get(String(accident.id));
    if (marker) {
      marker.openPopup();
    }
  }, 1250);
}

// Deep linking support via URL query parameters
let hasDeepLinked = false;
function handleUrlDeepLinking() {
  if (hasDeepLinked || allAccidents.length === 0) return;

  const urlParams = new URLSearchParams(window.location.search);
  const roadParam = urlParams.get("road");
  const latParam = parseFloat(urlParams.get("lat"));
  const lngParam = parseFloat(urlParams.get("lng"));

  if (roadParam) {
    const searchInput = document.getElementById("search-location-input");
    const clearBtn = document.getElementById("clear-search-btn");
    if (searchInput) {
      searchInput.value = roadParam;
      if (clearBtn) clearBtn.classList.remove("hidden");
    }

    const match = allAccidents.find(a => 
      (a.namaJalan || "").toLowerCase().includes(roadParam.toLowerCase())
    );

    if (match) {
      hasDeepLinked = true;
      setTimeout(() => zoomToAndOpenMarker(match), 500);
    } else if (!isNaN(latParam) && !isNaN(lngParam)) {
      hasDeepLinked = true;
      map.flyTo([latParam, lngParam], 16, { animate: true, duration: 1.2 });
    }
  } else if (!isNaN(latParam) && !isNaN(lngParam)) {
    hasDeepLinked = true;
    map.flyTo([latParam, lngParam], 16, { animate: true, duration: 1.2 });
  }
}

// Global Accident Detail & Mitigation Modal
function showAccidentDetailModal(accident) {
  let modal = document.getElementById("accident-detail-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "accident-detail-modal";
    modal.className = "fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all";
    document.body.appendChild(modal);
  }

  // Mitigation Plan Generator
  const mitigations = [];
  if (accident.jenisKenderaan === "Motorcycle" || accident.jenisKenderaan === "Motosikal") {
    mitigations.push("<strong>Dedicated Motorcycle Lane:</strong> Construct physical segregation barriers and non-slip reflective lane markers.");
    mitigations.push("<strong>High-Friction Surface:</strong> Apply anti-skid road coatings at curve approaches to prevent bike slippage.");
  }
  if (accident.tahapKeterukan === "Fatal") {
    mitigations.push("<strong>Speed Enforcement:</strong> Install Automated Enforcement System (AES) speed cameras and lower speed limit by 15 km/h.");
    mitigations.push("<strong>Impact Attenuators:</strong> Install crash cushions and heavy-duty steel guardrails along concrete pillars.");
  } else if (accident.tahapKeterukan === "Serious") {
    mitigations.push("<strong>Smart Traffic Signals:</strong> Upgrade intersection with red-light camera enforcement and adaptive signal timing.");
    mitigations.push("<strong>Rumble Strips:</strong> Paint high-visibility transverse rumble strips 100 meters prior to high-risk junction.");
  }
  if (accident.catatan && (accident.catatan.toLowerCase().includes("hujan") || accident.catatan.toLowerCase().includes("rain") || accident.catatan.toLowerCase().includes("malam") || accident.catatan.toLowerCase().includes("night"))) {
    mitigations.push("<strong>Smart LED Lighting:</strong> Upgrade street lighting to 200W solar LED luminaires for enhanced night-time visibility.");
  }
  mitigations.push("<strong>Digital Warning Signage:</strong> Deploy solar-powered VMS (Variable Message Sign) displaying real-time accident risk warnings.");

  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
      
      <!-- Modal Header -->
      <div class="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono ${
              accident.tahapKeterukan === 'Fatal' ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300' : 
              accident.tahapKeterukan === 'Serious' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300'
            }">
              ${accident.tahapKeterukan} SEVERITY
            </span>
            <span class="text-xs text-slate-400 font-mono">ID: ${accident.id}</span>
          </div>
          <h3 class="font-display font-extrabold text-xl text-slate-800 dark:text-white mt-1">${accident.namaJalan}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">${accident.daerah} District • Coordinates: ${accident.latitude.toFixed(4)}, ${accident.longitude.toFixed(4)}</p>
        </div>
        <button id="close-modal-btn" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
          ✕
        </button>
      </div>

      <!-- Section 1: Detailed Accident Report -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">1. Accident Incident Report</h4>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span class="text-slate-400 block text-[10px]">Date & Time</span>
            <strong class="text-slate-800 dark:text-white">${accident.tarikh} (${accident.masa})</strong>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px]">Vehicle Involved</span>
            <strong class="text-slate-800 dark:text-white">${accident.jenisKenderaan}</strong>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px]">Gender & Age</span>
            <strong class="text-slate-800 dark:text-white">${accident.gender || 'Male'}, ${accident.age || 28} y/o</strong>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px]">Injury Classification</span>
            <strong class="text-slate-800 dark:text-white">${accident.typeOfInjuries || accident.tahapKeterukan}</strong>
          </div>
          <div class="col-span-2 sm:col-span-2">
            <span class="text-slate-400 block text-[10px]">Injury Description</span>
            <strong class="text-slate-800 dark:text-white">${accident.injuryDetails || 'Fracture or trauma sustained'}</strong>
          </div>
        </div>
        ${accident.catatan ? `
          <div class="p-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-blue-200">
            <strong>Incident Description:</strong> "${accident.catatan}"
          </div>
        ` : ''}
      </div>

      <!-- Section 2: Preventive Mitigation Plan -->
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <span class="text-lg">🛠️</span>
          <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">2. Recommended Road Mitigation Actions</h4>
        </div>
        <div class="space-y-2.5">
          ${mitigations.map(item => `
            <div class="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-xl text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
              <span class="text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-0.5">✓</span>
              <div>${item}</div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Section 3: Google Maps Data & Live Grounding (gemini-3.5-flash with googleMaps) -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">🗺️</span>
            <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">3. Google Maps Data & Grounding</h4>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-mono">gemini-3.5-flash</span>
        </div>

        <div class="p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl border border-blue-100 dark:border-slate-700 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-xs text-slate-600 dark:text-slate-300">
              Live places, emergency hospitals, and transport infrastructure grounded via Google Maps for <strong>${accident.namaJalan}</strong>:
            </p>
            <div class="flex items-center gap-2">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${accident.latitude},${accident.longitude}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5">
                <span>🚗 Directions</span>
              </a>
              <a href="https://www.google.com/maps/search/?api=1&query=${accident.latitude},${accident.longitude}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5">
                <span>📍 View Pin</span>
              </a>
            </div>
          </div>

          <div id="modal-gmaps-places" class="space-y-2 text-xs">
            <div class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-slate-500">
              <span class="animate-spin text-sm">⏳</span> Fetching live Google Maps grounding for this location...
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end">
        <button id="close-modal-bottom-btn" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer">
          Close Report
        </button>
      </div>

    </div>
  `;

  modal.classList.remove("hidden");

  // Fetch Live Google Maps Grounding data for this accident location
  fetchGoogleMapsGrounding(accident.namaJalan + ", " + accident.daerah, accident.latitude, accident.longitude)
    .then(data => {
      const container = document.getElementById("modal-gmaps-places");
      if (!container) return;

      if (!data.places || data.places.length === 0) {
        container.innerHTML = `
          <div class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>Explore live coordinates on Google Maps:</span>
            <a href="${data.googleMapsUrl || 'https://www.google.com/maps'}" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-bold underline">
              Open Google Maps ↗
            </a>
          </div>
        `;
        return;
      }

      container.innerHTML = data.places.map(p => `
        <div class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <div class="space-y-0.5">
            <div class="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 flex-wrap">
              <span>📍</span>
              <a href="${p.uri}" target="_blank" rel="noopener noreferrer" class="hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-2">
                ${p.title}
              </a>
              ${p.rating ? `<span class="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold rounded">⭐ ${p.rating}</span>` : ""}
            </div>
            ${p.address ? `<div class="text-[11px] text-slate-500 dark:text-slate-400">${p.address}</div>` : ""}
            ${p.reviewSnippets && p.reviewSnippets.length > 0 ? `
              <div class="text-[10px] text-slate-400 dark:text-slate-500 italic mt-0.5">"${p.reviewSnippets[0].slice(0, 110)}..."</div>
            ` : ""}
          </div>
          <a href="${p.uri}" target="_blank" rel="noopener noreferrer" class="self-start sm:self-auto shrink-0 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1">
            <span>Open in Maps ↗</span>
          </a>
        </div>
      `).join("");
    })
    .catch(() => {
      const container = document.getElementById("modal-gmaps-places");
      if (container) {
        container.innerHTML = `
          <div class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>Direct Google Maps Search:</span>
            <a href="https://www.google.com/maps/search/?api=1&query=${accident.latitude},${accident.longitude}" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-bold underline">
              Open Google Maps ↗
            </a>
          </div>
        `;
      }
    });

  const closeBtn = document.getElementById("close-modal-btn");
  const closeBtnBottom = document.getElementById("close-modal-bottom-btn");
  if (closeBtn) closeBtn.onclick = () => modal.classList.add("hidden");
  if (closeBtnBottom) closeBtnBottom.onclick = () => modal.classList.add("hidden");
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  };
}

// 6. Google Maps Grounding API Client
async function fetchGoogleMapsGrounding(locationName, latitude, longitude, query = null) {
  const payload = {
    locationName,
    latitude,
    longitude,
    query
  };
  const res = await fetch("/api/maps-grounding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

// 7. Google Maps Grounding Sidebar Explorer Controller
function initGoogleMapsGroundingSidebar() {
  const input = document.getElementById("gmaps-sidebar-input");
  const searchBtn = document.getElementById("gmaps-sidebar-search-btn");
  const resultsContainer = document.getElementById("gmaps-sidebar-results");
  const chips = document.querySelectorAll(".gmaps-chip");

  if (!input || !searchBtn || !resultsContainer) return;

  async function performSearch(query) {
    if (!query) return;
    resultsContainer.classList.remove("hidden");
    resultsContainer.innerHTML = `
      <div class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-slate-500 text-[11px]">
        <span class="animate-spin">⏳</span> Grounding Google Maps data for "${query}"...
      </div>
    `;

    try {
      const center = map ? map.getCenter() : null;
      const payload = {
        query,
        latitude: center ? center.lat : undefined,
        longitude: center ? center.lng : undefined,
      };

      const res = await fetch("/api/maps-grounding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!data.places || data.places.length === 0) {
        resultsContainer.innerHTML = `
          <div class="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px]">
            No direct places returned. <a href="${data.googleMapsUrl || 'https://www.google.com/maps'}" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-bold underline">Search on Google Maps ↗</a>
          </div>
        `;
        return;
      }

      resultsContainer.innerHTML = data.places.map(p => `
        <div class="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
          <div class="flex items-start justify-between gap-1">
            <a href="${p.uri}" target="_blank" rel="noopener noreferrer" class="font-bold text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-xs underline underline-offset-2">
              📍 ${p.title}
            </a>
            ${p.rating ? `<span class="text-[9px] px-1 py-0.2 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold rounded shrink-0">⭐ ${p.rating}</span>` : ""}
          </div>
          ${p.address ? `<div class="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">${p.address}</div>` : ""}
          <div class="pt-1 flex items-center justify-between">
            <span class="text-[9px] text-slate-400">Google Maps Verified</span>
            <a href="${p.uri}" target="_blank" rel="noopener noreferrer" class="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
              View on Maps ↗
            </a>
          </div>
        </div>
      `).join("");
    } catch {
      resultsContainer.innerHTML = `
        <div class="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-red-500 text-[11px]">
          Unable to fetch Google Maps data. <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" class="underline font-bold">Open Google Maps</a>
        </div>
      `;
    }
  }

  searchBtn.addEventListener("click", () => {
    performSearch(input.value.trim());
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      performSearch(input.value.trim());
    }
  });

  chips.forEach(chip => {
    chip.addEventListener("click", (e) => {
      const q = e.currentTarget.getAttribute("data-q");
      if (q) {
        input.value = q;
        performSearch(q);
      }
    });
  });
}

function updateMapStats(filtered) {
  const mapTotalCount = document.getElementById("map-total-count");
  if (mapTotalCount) mapTotalCount.innerText = filtered.length;

  const mapFatalCount = document.getElementById("map-fatal-count");
  if (mapFatalCount) {
    mapFatalCount.innerText = filtered.filter(a => a.tahapKeterukan === "Fatal").length;
  }
}
