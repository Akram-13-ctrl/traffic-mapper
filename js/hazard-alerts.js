/**
 * Ephemeral Live Road Hazard Warning System
 * Client-side real-time road incident alerts (simulated broadcast).
 * Strictly ephemeral: in-memory & sessionStorage only (NO Firestore writes).
 */

const HAZARD_ALERTS_DATABASE = [
  {
    id: "alert-flood-1",
    severity: "danger",
    icon: "🌊",
    title: "FLASH FLOOD WARNING",
    location: "Federal Highway KM 15.2 (Westbound)",
    message: "Flash flood reported with 0.35m standing water across 2 center lanes. Heavy congestion, traffic diverted to Subang Airport road.",
    timeAgo: "Just now",
    recommendedAction: "Avoid Federal Highway westbound; use KESAS or NPE."
  },
  {
    id: "alert-crash-2",
    severity: "danger",
    icon: "🚨",
    title: "MAJOR COLLISION & OBSTRUCTION",
    location: "Jalan Ampang near Embassy Row",
    message: "Multi-vehicle collision involving lorry and 2 sedans. Right and middle lanes blocked. Paramedics and traffic police on-site.",
    timeAgo: "6 mins ago",
    recommendedAction: "Expect 25-minute delay. Utilize AKLEH elevated highway."
  },
  {
    id: "alert-monsoon-3",
    severity: "warning",
    icon: "🌧️",
    title: "SEVERE MONSOON SQUALL & HYDROPLANING",
    location: "MRR2 (Ampang to Cheras Sector)",
    message: "Torrential downpour with severe visibility reduction below 30 meters. High risk of aquaplaning on curve bends.",
    timeAgo: "12 mins ago",
    recommendedAction: "Reduce speed to 60 km/h and turn on low-beam headlights."
  },
  {
    id: "alert-sinkhole-4",
    severity: "danger",
    icon: "🚧",
    title: "EMERGENCY CAVERN / SINKHOLE INVESTIGATION",
    location: "Jalan Tun Razak (Northbound near RHB Centre)",
    message: "Pavement subsidence detected on inner lane. JKR emergency crew establishing 100-meter safety cordon.",
    timeAgo: "18 mins ago",
    recommendedAction: "Merge to outer lanes early. Obey traffic marshall signals."
  },
  {
    id: "alert-oil-5",
    severity: "warning",
    icon: "⚠️",
    title: "OIL SLICK & SKID HAZARD",
    location: "Persiaran Kewajipan (Summit USJ Roundabout)",
    message: "Diesel spillage across roundabout entry. Critical slipping risk for two-wheelers and motorcyclists.",
    timeAgo: "24 mins ago",
    recommendedAction: "Motorcyclists avoid hard braking on slick pavement."
  }
];

class LiveRoadHazardSystem {
  constructor() {
    this.currentIndex = 0;
    this.isDismissed = sessionStorage.getItem("hazard_alert_dismissed") === "true";
    this.cycleDuration = 15000; // 15 seconds per alert
    this.timer = null;
    this.startTime = 0;
    this.remainingTime = this.cycleDuration;
    this.isPaused = false;
    this.init();
  }

  init() {
    // Check if container already exists
    if (document.getElementById("hazard-alert-banner")) return;

    const banner = document.createElement("div");
    banner.id = "hazard-alert-banner";
    banner.className = `w-full transition-all duration-300 ${this.isDismissed ? "hidden" : "block"}`;

    // Target suitable insertion point: top of main or before map/content
    const main = document.querySelector("main");
    if (!main) return;

    main.insertBefore(banner, main.firstChild);
    this.render();
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  startTimer(duration = this.cycleDuration) {
    this.clearTimer();
    this.remainingTime = duration;
    this.startTime = Date.now();
    this.isPaused = false;

    const progressBar = document.getElementById("hazard-progress-bar");
    if (progressBar) {
      progressBar.style.transition = "none";
      progressBar.style.width = "0%";
      void progressBar.offsetWidth; // Force browser layout reflow
      progressBar.style.transition = `width ${duration}ms linear`;
      progressBar.style.width = "100%";
    }

    this.timer = setTimeout(() => {
      this.nextAlert();
    }, duration);
  }

  pauseTimer() {
    if (!this.timer || this.isPaused) return;
    clearTimeout(this.timer);
    this.timer = null;
    this.isPaused = true;

    const elapsed = Date.now() - this.startTime;
    this.remainingTime = Math.max(500, this.remainingTime - elapsed);

    const progressBar = document.getElementById("hazard-progress-bar");
    if (progressBar) {
      const computedWidth = window.getComputedStyle(progressBar).width;
      progressBar.style.transition = "none";
      progressBar.style.width = computedWidth;
    }
  }

  resumeTimer() {
    if (this.isDismissed || !this.isPaused) return;
    this.isPaused = false;
    this.startTime = Date.now();

    const progressBar = document.getElementById("hazard-progress-bar");
    if (progressBar) {
      progressBar.style.transition = `width ${this.remainingTime}ms linear`;
      progressBar.style.width = "100%";
    }

    this.timer = setTimeout(() => {
      this.nextAlert();
    }, this.remainingTime);
  }

  nextAlert() {
    this.currentIndex = (this.currentIndex + 1) % HAZARD_ALERTS_DATABASE.length;
    this.render();
  }

  render() {
    const banner = document.getElementById("hazard-alert-banner");
    if (!banner) return;

    this.clearTimer();

    if (this.isDismissed) {
      banner.classList.add("hidden");
      this.renderMiniRestorePill();
      return;
    }

    banner.classList.remove("hidden");
    const currentAlert = HAZARD_ALERTS_DATABASE[this.currentIndex];

    const isDanger = currentAlert.severity === "danger";
    const bgClasses = isDanger 
      ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-500/20" 
      : "bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-500/20";

    banner.innerHTML = `
      <div class="${bgClasses} flex flex-col justify-between text-xs select-none relative overflow-hidden transition-colors duration-500">
        
        <!-- Alert Content Body -->
        <div class="px-4 py-3 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          
          <!-- Left: Live Badge & Incident Info -->
          <div class="flex items-start gap-3 flex-1">
            <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-base shrink-0 mt-0.5 shadow-xs">
              ${currentAlert.icon}
            </div>
            <div class="space-y-0.5">
              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-white font-mono font-black text-[10px] tracking-wider uppercase">
                  <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  LIVE ROAD HAZARD
                </span>
                <span class="font-bold text-white uppercase tracking-tight font-display">${currentAlert.title}</span>
                <span class="text-white/85 text-[11px] font-mono">• ${currentAlert.location}</span>
                <span class="text-white/70 text-[10px] bg-black/20 px-2 py-0.5 rounded">${currentAlert.timeAgo}</span>
              </div>
              <p class="text-white/95 text-[11px] leading-relaxed">
                ${currentAlert.message} 
                <strong class="underline decoration-white/50">${currentAlert.recommendedAction}</strong>
              </p>
            </div>
          </div>

          <!-- Right: Auto-rotation indicators and Dismiss -->
          <div class="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            
            <!-- Alert Dots & Counter -->
            <div class="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-full">
              ${HAZARD_ALERTS_DATABASE.map((_, i) => `
                <button class="hazard-dot-btn w-2 h-2 rounded-full transition-all cursor-pointer ${
                  i === this.currentIndex ? 'bg-white scale-125 ring-1 ring-white/50' : 'bg-white/40 hover:bg-white/80'
                }" data-index="${i}" title="Alert ${i + 1} of ${HAZARD_ALERTS_DATABASE.length}"></button>
              `).join("")}
              <span class="ml-1 text-[10px] font-mono text-white/80 font-bold">${this.currentIndex + 1}/${HAZARD_ALERTS_DATABASE.length}</span>
            </div>

            <!-- Dismiss button -->
            <button id="hazard-dismiss-btn" title="Dismiss Ephemeral Banner" class="px-2.5 py-1.5 bg-black/30 hover:bg-black/50 active:bg-black/60 text-white font-bold text-[11px] rounded-lg transition-all cursor-pointer flex items-center gap-1">
              <span>✕ Dismiss</span>
            </button>
          </div>

        </div>

        <!-- Moving Loading Bar on the bottom of the info box (15s duration) -->
        <div class="w-full bg-black/30 h-1 relative overflow-hidden" title="Live hazard auto-cycles every 15 seconds">
          <div id="hazard-progress-bar" class="h-full bg-white/90 shadow-sm shadow-white/50" style="width: 0%;"></div>
        </div>

      </div>
    `;

    this.bindEvents();
    this.removeMiniRestorePill();
    this.startTimer(this.cycleDuration);
  }

  bindEvents() {
    const banner = document.getElementById("hazard-alert-banner");
    const dismissBtn = document.getElementById("hazard-dismiss-btn");

    dismissBtn?.addEventListener("click", () => {
      this.clearTimer();
      this.isDismissed = true;
      sessionStorage.setItem("hazard_alert_dismissed", "true");
      this.render();
    });

    // Dot indicators click
    banner?.querySelectorAll(".hazard-dot-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-index"), 10);
        if (!isNaN(idx) && idx !== this.currentIndex) {
          this.currentIndex = idx;
          this.render();
        }
      });
    });

    // Pause timer on hover so reading isn't interrupted, resume on leave
    banner?.addEventListener("mouseenter", () => this.pauseTimer());
    banner?.addEventListener("mouseleave", () => this.resumeTimer());
  }

  renderMiniRestorePill() {
    if (document.getElementById("hazard-restore-pill")) return;

    const pill = document.createElement("button");
    pill.id = "hazard-restore-pill";
    pill.className = "fixed top-20 right-6 z-40 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transition-all cursor-pointer transform hover:scale-105";
    pill.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
      <span>⚠️ Show Live Hazard Alerts</span>
    `;

    pill.addEventListener("click", () => {
      this.isDismissed = false;
      sessionStorage.removeItem("hazard_alert_dismissed");
      pill.remove();
      this.render();
    });

    document.body.appendChild(pill);
  }

  removeMiniRestorePill() {
    document.getElementById("hazard-restore-pill")?.remove();
  }
}

// Auto-instantiate on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new LiveRoadHazardSystem());
} else {
  new LiveRoadHazardSystem();
}
