import { getAccidents } from "./accidents.js";

document.addEventListener("DOMContentLoaded", async () => {
  const generateBtn = document.getElementById("generate-ai-btn");
  const copyBtn = document.getElementById("copy-report-btn");
  const printBtn = document.getElementById("print-report-btn");
  const loadSampleBtn = document.getElementById("load-sample-report-btn");
  const quickLoadSampleBtn = document.getElementById("quick-load-sample-btn");
  const reportContainer = document.getElementById("ai-report-content");
  const emptyState = document.getElementById("report-empty-state");
  const loadingSpinner = document.getElementById("report-loading-spinner");

  let latestRawReport = "";

  const sampleBenchmarkReport = `### 🛣️ ROAD SAFETY IMPROVEMENT & BLACKSPOT MITIGATION AUDIT

**Target Location**: Federal Highway / KM 14.2 (High-Risk Hotspot Corridor)
**Audit Period**: 3-Year Retrospective Multi-Agency Analysis (JKR / PDRM / GIS Unit)
**Status**: Critical Priority 1 Hotspot Sector

---

#### 1. High-Risk Hotspot Identification & Geometry
* **Primary Hotspot Sector**: KM 14.0 to KM 14.6 interchange connecting Subang Jaya and Shah Alam.
* **Corridor Profile**: 3-lane dual carriageway with high-speed merge ramps, sub-standard superelevation on westbound curve, and severe bottlenecking during peak rush hours.
* **Incident Frequency**: A total of **48 verified collisions** recorded within this 600-meter segment over the 3-year audit window.

#### 2. Temporal & Environmental Risk Factors
* **Peak Danger Windows**: 07:15 – 09:00 AM (morning congestion) and 10:30 PM – 03:00 AM (high-speed nocturnal transit).
* **Nighttime Disproportion**: **62.5% of severe crashes** occurred between dusk and dawn, amplified by defective high-mast illumination fixtures.
* **Weather Exacerbation**: Wet pavement friction tests revealed severe hydroplaning potential during tropical downpours.

#### 3. Casualty Breakdown & Vulnerable Road Users (VRU)
* **Vulnerable Road Users (71.0%)**: Motorcyclists and pillion riders represent 34 of the 48 recorded collision casualties.
* **Severity Distribution**:
  - 🛑 Fatal Collisions: **12 cases (25.0%)**
  - ⚠️ Serious Injuries (Permanent Disability/Hospitalization): **19 cases (39.6%)**
  - 🟢 Minor Injuries: **17 cases (35.4%)**
* **Dominant Collision Typology**: Lateral sideswipes during abrupt lane merges, followed by fixed-object guardrail collisions.

#### 4. Prioritized Engineering Interventions & Mitigation Plan

1. **Install High-Friction Anti-Skid Surfacing & Chevron Reflectors**
   * **Priority**: High (Immediate 30-day implementation)
   * **Responsible Agency**: JKR (Public Works Department)
   * **Expected Safety Outcome**: Restores skid resistance coefficient above 0.65; projected to reduce wet-weather skids by 45%.

2. **Deploy Dedicated Physical Motorcycle Buffer Zone & Delineators**
   * **Priority**: High (60-day target)
   * **Responsible Agency**: JKR / Majlis Bandaraya Subang Jaya (MBSJ)
   * **Expected Safety Outcome**: Segregates two-wheelers from heavy goods vehicles, reducing peak-hour sideswipes by up to 50%.

3. **Upgrade High-Mast LED Lighting & Solar Hazard Warning Flashers**
   * **Priority**: Medium (90-day capital works)
   * **Responsible Agency**: Lembaga Lebuhraya Malaysia (LLM) / Concessionaire
   * **Expected Safety Outcome**: Eliminates blind visual pockets on sharp entry curves; nocturnal accident reduction estimated at 35%.

4. **Automated Speed Enforcement (AES) Integration & Speed Limit Warning Signage**
   * **Priority**: Medium
   * **Responsible Agency**: JPJ / PDRM Traffic Enforcement
   * **Expected Safety Outcome**: Curbs 85th-percentile speeds from 110 km/h down to the designated 80 km/h design speed.

---

*Certified by Road Safety Engineering & GIS Research Unit. Official benchmark audit for inter-agency technical review.*`;

  function printAudit() {
    window.print();
  }

  printBtn?.addEventListener("click", printAudit);
  quickLoadSampleBtn?.addEventListener("click", printAudit);

  if (generateBtn) {
    generateBtn.addEventListener("click", async () => {
      // Show loading
      emptyState.classList.add("hidden");
      loadingSpinner.classList.remove("hidden");
      reportContainer.classList.add("hidden");
      generateBtn.disabled = true;
      generateBtn.innerText = "Generating Road Improvement Plan...";

      try {
        const accidents = await getAccidents();
        
        if (accidents.length === 0) {
          alert("No accident data available for analysis.");
          return;
        }

        // Send to Express Backend API
        const response = await fetch("/api/ai-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ accidents })
        });

        if (!response.ok) {
          throw new Error("Failed to connect to Gemini API service.");
        }

        const result = await response.json();
        latestRawReport = result.report;
        
        // Render Markdown to HTML
        reportContainer.innerHTML = parseSimpleMarkdown(latestRawReport);
        
        // Show report
        loadingSpinner.classList.add("hidden");
        reportContainer.classList.remove("hidden");
        
        // Enable action buttons
        copyBtn.disabled = false;
        printBtn.disabled = false;
      } catch (error) {
        console.error("AI Report generation failed:", error);
        emptyState.classList.remove("hidden");
        loadingSpinner.classList.add("hidden");
        const emptyStateText = emptyState.querySelector("p");
        if (emptyStateText) {
          emptyStateText.textContent = "Unable to generate road improvement suggestions. Please ensure accident records are loaded and try again.";
        }
      } finally {
        generateBtn.disabled = false;
        generateBtn.innerText = "Generate Road Improvement Suggestions";
      }
    });
  }

  // Copy to Clipboard
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      if (!latestRawReport) return;
      navigator.clipboard.writeText(latestRawReport)
        .then(() => {
          const originalText = copyBtn.innerHTML;
          copyBtn.innerHTML = "✓ Copied to Clipboard";
          copyBtn.classList.add("bg-green-500", "text-white");
          setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove("bg-green-500", "text-white");
          }, 2000);
        })
        .catch(err => {
          console.error("Failed to copy:", err);
        });
    });
  }

  // Print Report
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }
});

// A simple but effective regex markdown parser for beautiful PDF generation
function parseSimpleMarkdown(mdText) {
  let html = mdText
    // Headings
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-slate-800 mt-6 mb-2 font-display border-b pb-1">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 class="text-base font-bold text-slate-800 mt-5 mb-1.5 font-display">$1</h4>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-slate-800 mt-8 mb-3 font-display border-b-2 border-slate-100 pb-1.5">$2</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black text-slate-900 mt-10 mb-4 font-display">$1</h1>')
    
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
    
    // Unordered List Items
    .replace(/^\* (.*$)/gim, '<li class="ml-5 list-disc text-sm text-slate-600 mb-1.5">$1</li>')
    .replace(/^- (.*$)/gim, '<li class="ml-5 list-disc text-sm text-slate-600 mb-1.5">$1</li>')
    
    // Numbered lists
    .replace(/^\d+\.\s(.*$)/gim, '<li class="ml-5 list-decimal text-sm text-slate-600 mb-1.5">$1</li>')
    
    // Paras
    .replace(/^\s*([^<].*)\s*$/gim, '<p class="text-sm text-slate-600 leading-relaxed mb-4">$1</p>');

  return `<div class="prose max-w-none">${html}</div>`;
}
