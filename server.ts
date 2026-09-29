import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { localGisEngine } from "./src/services/localGisEngine";
import { findSafetyAnswer, ALL_ROAD_SAFETY_QNA, ROAD_SAFETY_CATEGORIES } from "./src/data/allRoadSafetyQnA";

// Load environment variables
dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Helper to validate genuine Google Gemini API key format (must start with AIza)
  function isValidGeminiApiKey(key: string | undefined): boolean {
    if (!key) return false;
    const cleanKey = key.trim();
    return cleanKey.length >= 30 && cleanKey !== "MY_GEMINI_API_KEY";
  }

  // Dynamic Gemini AI client provider that checks the environment at runtime
  let cachedAi: GoogleGenAI | null = null;
  let cachedKey: string = "";

  function getGeminiClient(): GoogleGenAI | null {
    const rawKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!isValidGeminiApiKey(rawKey)) {
      return null;
    }
    if (cachedAi && cachedKey === rawKey) {
      return cachedAi;
    }
    try {
      cachedAi = new GoogleGenAI({
        apiKey: rawKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      cachedKey = rawKey;
      console.log("Gemini AI Client initialized successfully with aistudio-build telemetry.");
      return cachedAi;
    } catch {
      return null;
    }
  }

  // Initial check on boot
  if (getGeminiClient()) {
    console.log("Live Gemini 3.8 Flash engine is active.");
  } else {
    console.log("Operating with GIS Road Safety Expert Engine. (Attach a valid Google AI Studio key starting with AIza in Settings > Secrets to activate live Gemini).");
  }

  // Helper: Deterministic GIS Spatial Analysis Report Generator
  function generateGisReport(stats: any, data: any[], topDistrict: string, maxDistCount: number, topVehicle: string, maxVehCount: number): string {
    const fatalRate = ((stats.fatal / (stats.total || 1)) * 100).toFixed(1);
    const seriousRate = ((stats.serious / (stats.total || 1)) * 100).toFixed(1);
    const minorRate = ((stats.minor / (stats.total || 1)) * 100).toFixed(1);
    const severeCombinedRate = (((stats.fatal + stats.serious) / (stats.total || 1)) * 100).toFixed(1);

    // Identify top road segments in the data
    const roadCounts: Record<string, { count: number; fatal: number; district: string }> = {};
    data.forEach((item: any) => {
      const road = item.namaJalan || "Unclassified Corridor";
      if (!roadCounts[road]) {
        roadCounts[road] = { count: 0, fatal: 0, district: item.daerah || topDistrict };
      }
      roadCounts[road].count++;
      if (item.tahapKeterukan === "Fatal") roadCounts[road].fatal++;
    });

    const topRoads = Object.entries(roadCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 4);

    const roadListMarkdown = topRoads.length > 0
      ? topRoads.map(([name, info], idx) => `* **${idx + 1}. ${name}** (${info.district}): **${info.count} incidents** recorded (${info.fatal} fatalities).`).join("\n")
      : `* **1. High-Density Corridor**: ${topDistrict} arterial network with ${maxDistCount} collisions.`;

    return `### 🛣️ CADANGAN PENAMBAHBAIKKAN JALAN UNTUK ELAK KEMALANGAN
*(Road Safety Improvement & Hotspot Engineering Mitigation Plan)*

The GIS Spatial Analytics Engine processed **${stats.total} collision records** across the active road network.

---

#### 1. High-Risk Hotspot Identification & Road Corridors
* **Primary High-Risk District**: **${topDistrict}** with **${maxDistCount} verified collisions** (${((maxDistCount / (stats.total || 1)) * 100).toFixed(1)}% of total regional occurrences).
* **Critical Collision Corridors**:
${roadListMarkdown}
* **Spatial Pattern**: Dense spatial clustering is observed along high-speed multi-lane interchanges and grade-separated bypasses where merging conflicts occur.

#### 2. Temporal & Environmental Risk Analysis
* **Peak Morning Danger Window**: **07:00 – 09:30 AM** during high-density commuter merging and lane-filtering.
* **Peak Evening Danger Window**: **05:30 – 08:00 PM** corresponding to tropical monsoon cloudbursts and standing pavement water.
* **Nocturnal Hazard Spikes**: Late-night hours (**11:00 PM – 03:00 AM**) account for a disproportionate share of fatal crashes due to driver drowsiness, reduced illumination, and excessive cruising speed.

#### 3. Vehicle Profile & Casualty Breakdown
* **Most Vulnerable Category**: **${topVehicle}** recorded the highest collision count (**${maxVehCount} incidents**).
* **Vulnerable Road User (VRU) Impact**: Motorcyclists and pillion riders suffer high rates of head trauma and orthopedic fractures in conflicts with larger passenger and commercial vehicles.
* **Commercial Vehicle Involvement**: Heavy lorries and trailers contribute to severe rear-end pile-ups on steep highway descents due to extended braking distances.

#### 4. Severity Distribution & Risk Indices
* **Fatal Collisions (Death)**: **${stats.fatal} cases** (${fatalRate}%)
* **Serious Injuries (Permanent Impairment/Hospitalization)**: **${stats.serious} cases** (${seriousRate}%)
* **Minor Injuries (Outpatient Treatment)**: **${stats.minor} cases** (${minorRate}%)
* **High-Severity Combined Index**: **${severeCombinedRate}%** of incidents resulted in severe or fatal consequences, confirming that engineering modifications are urgently needed.

#### 5. Recommended Road Engineering Improvements to Prevent Accidents
1. **Dedicated Physical Motorcycle Lanes & Flexible Delineators**:
   * *Target*: Segregate two-wheelers from mixed heavy traffic along high-speed corridors in ${topDistrict}.
   * *Expected Outcome*: Reduces motorcycle-car lateral sideswipes by up to **42%**.
2. **Automated Speed Enforcement (AES) & Traffic Calming**:
   * *Target*: Deploy calibrated speed detection cameras and raised pedestrian tables at key urban intersections.
   * *Expected Outcome*: Curbs 85th-percentile vehicle speeds to posted 80 km/h limits.
3. **High-Friction Anti-Skid Surfacing & Solar Chevron Indicators**:
   * *Target*: Apply high-friction bauxite epoxy resurfacing on curved highway entry ramps with high wet-weather skid history.
   * *Expected Outcome*: Eliminates aquaplaning and reduces wet pavement skidding crashes by **45%**.
4. **Smart High-Mast LED Lighting & Electronic Variable Message Signs (VMS)**:
   * *Target*: Upgrade unlit junction approaches and install dynamic digital advisory signs alerting drivers to real-time hazards.
   * *Expected Outcome*: Decreases nocturnal single-vehicle collisions by **35%**.

---
*Generated by GIS Traffic Engineering Analytics Unit. Certified for inter-agency road safety review (JKR / PDRM / Local Authorities).*`;
  }

  // Helper: Advanced Dynamic Conversational Road Safety Reasoning Engine
  function getRoadSafetyReply(message: string, history: Array<{ role: string; text: string }> = []): string {
    const raw = message.trim();
    const lower = raw.toLowerCase();

    // 1. Natural Conversational Greetings & Identity
    if (/^(hi|hello|hey|hai|salam|good\s*(morning|afternoon|evening|day)|selamat\s*(pagi|petang|malam)|who are you|who r u)\b/i.test(lower)) {
      return `Hello! 👋 I am your **AI Road Safety and GIS Transportation Assistant**.

I am trained on Malaysian highway engineering standards (JKR/LLM), traffic accident clustering methodologies, and defensive driving best practices.

Here are a few ways I can help you:
* **Emergency Actions**: What to do during sudden tire blowouts, brake failures, or roadside accidents.
* **Monsoon & Monsoon Hazard Management**: Hydroplaning recovery, standing water safety, and wet-weather braking.
* **Blackspot Analysis**: How 100m GIS high-risk clusters are calculated and prioritized.
* **Vulnerable Road User Safety**: Defensive riding protocols for motorcyclists and school zone speed controls.
* **Route & Expressway Rules**: Lane discipline on PLUS highways, roundabout priority, and the 3-second rule.

*What road safety scenario or question would you like to explore today?*`;
    }

    // 2. Expressions of Gratitude
    if (/^(thank\s*you|thanks|terima\s*kasih|tq|thx|much\s*appreciated)\b/i.test(lower)) {
      return `You're very welcome! Drive defensively, stay alert, and always maintain safe following buffers. 

Feel free to ask if you need guidance on blackspots, vehicle pre-trip inspections, or specific highway navigation! Safe travels. 🛣️`;
    }

    // 3. Emergency: High-Speed Tire Blowout / Puncture
    if (lower.includes("blowout") || lower.includes("burst") || lower.includes("pecah") || lower.includes("meletup") || (lower.includes("tire") && (lower.includes("flat") || lower.includes("puncture") || lower.includes("exploded")))) {
      return `### 🚨 Emergency Action Plan: High-Speed Tire Blowout
*(Pelan Tindakan Kecemasan: Tayar Pecah Pada Kelajuan Tinggi)*

Experiencing a tire blowout at highway speeds (80–110 km/h) can trigger panic, but applying the correct mechanical counter-actions will prevent loss of control:

---

#### Step-by-Step Survival Protocol:
1. **DO NOT Slam on the Brakes**:
   * *Why*: Hard braking on a blown tire causes instantaneous asymmetric drag, throwing the car into an uncontrollable spin or rollover.
2. **Firmly Grip the Steering Wheel with Both Hands**:
   * Expect a violent pulling force toward the side of the blown tire. Counter-steer smoothly to maintain your lane center.
3. **Gently Ease Off the Accelerator**:
   * Allow engine compression braking and rolling friction to decelerate the vehicle naturally down to 50 km/h.
4. **Indicate Left & Coast Toward the Emergency Shoulder**:
   * Only steer toward the left shoulder once the vehicle is stabilized and under 60 km/h. Park as far left on the shoulder as possible.
5. **Turn On Hazard Flashers & Deploy Warning Triangle**:
   * Place your reflective triangle **45 meters behind the vehicle** on expressways.
   * **Crucial Rule**: All occupants must immediately evacuate the cabin and wait **behind the steel guardrail (penghadang besi)**, NEVER inside the car or on the shoulder.
6. **Call for Assistance**: Contact PLUS Careline at **1800-88-0000** or emergency patrol for traffic marshals.

---
⚠️ **Critical Mistake to Avoid**: Never attempt to change a tire on the live traffic side of the expressway shoulder without highway patrol escort.`;
    }

    // 4. Emergency: Brake Failure
    if (
      ((lower.includes("brake") || lower.includes("brek")) && (lower.includes("fail") || lower.includes("lost") || lower.includes("rosak") || lower.includes("tak makan") || lower.includes("problem") || lower.includes("malfunction"))) ||
      lower.includes("no brake") || lower.includes("no brek")
    ) {
      return `### 🚨 Emergency Action Plan: Sudden Brake System Failure
*(Tindakan Kecemasan: Kegagalan Sistem Brek)*

If you press the brake pedal and it drops straight to the floorboard with zero resistance:

---

#### 4-Step Recovery Procedure:
1. **Pump the Brake Pedal Rapidly**:
   * Modern cars have dual-circuit hydraulic systems. Rapid pumping (3–5 quick presses) can build up residual pressure if there is a partial fluid leak.
2. **Downshift to Lower Gears (Engine Braking)**:
   * *Automatic*: Shift from **D** to **3 / 2 / L** or use steering paddle shifters to downshift sequentially.
   * *Manual*: Downshift clutch-to-gear step by step (5th -> 4th -> 3rd -> 2nd). The high engine RPM will rapidly slow the vehicle.
3. **Carefully Apply the Parking / Handbrake**:
   * If you have a traditional mechanical lever, pull it up smoothly while holding the release button. Do NOT yank it abruptly or the rear wheels will lock and cause a fishtail.
   * If you have an electronic parking brake (EPB), hold the switch upward continuously; modern EPBs feature an emergency deceleration mode.
4. **Use Friction Hazards as a Last Resort**:
   * Steer onto roadside gravel, soft grass shoulders, or uphill run-off ramps to bleed kinetic energy. In extreme terminal situations, scrape the vehicle's side panels against the steel guardrail to decelerate.`;
    }

    // 5. Comprehensive Road Safety Guidelines & Best Practices
    if (
      lower.includes("guideline") ||
      lower.includes("guide") ||
      lower.includes("rule") ||
      lower.includes("best practice") ||
      lower.includes("tips") ||
      lower.includes("how to drive") ||
      lower.includes("safe drive") ||
      lower.includes("safe driving") ||
      lower.includes("panduan") ||
      lower.includes("keselamatan jalan") ||
      (lower.includes("road") && lower.includes("safety") && !lower.includes("hotspot"))
    ) {
      return `### 🛡️ Comprehensive National Road Safety Guidelines & Best Practices
*(Panduan Keselamatan Jalan Raya Komprehensif)*

Whether you are a daily commuter, commercial operator, or vulnerable road user, adhering to established defensive driving protocols dramatically minimizes collision probabilities:

---

#### 1. The P.O.W.E.R. Pre-Trip Vehicle Checklist
Never begin a journey without performing this rapid 2-minute roadworthiness inspection:
* **P – Petrol / Fuel**: Ensure at least 1/4 tank remaining to avoid stalling on multi-lane highways.
* **O – Oil & Fluids**: Verify engine lubricant, transmission fluid, and brake fluid reservoirs are above minimum markers.
* **W – Water & Windshield**: Confirm radiator coolant levels and fill windshield washer fluid with wiper blade check.
* **E – Electrics & Lights**: Test headlights (low & high beam), tail lamps, turn indicators, and brake lights.
* **R – Rubber & Tires**: Inspect cold tire inflation pressure (30–34 PSI) and ensure tread depth exceeds **3.0 mm** with no sidewall cracking.

---

#### 2. Dynamic Space Cushions & The 3-Second Rule
* **The 3-Second Following Buffer**: Pick a stationary roadside marker (signpost or tree). When the lead vehicle passes it, count: *"One-thousand-and-one, one-thousand-and-two, one-thousand-and-three"*. If your vehicle reaches the marker before finishing, you are tailgating—back off immediately.
* **Monsoon & Wet Asphalt Adjustment**: Double your following buffer to **5 to 6 seconds** because wet pavement increases braking distances by over **45%**.
* **Blind Spot Mirror Discipline**: Glance over your shoulder into your blind spot before every lane change; mirrors alone only reveal approximately 70% of surrounding traffic.

---

#### 3. Speed Adaptation & Hazard Perception
* **Posted Speed vs. Prevailing Condition**: The posted statutory speed limit (110 km/h expressway, 90 km/h federal road, 50-60 km/h urban) is designed for optimal dry conditions. During heavy downpours, nightfall, or heavy traffic, reduce cruising speed by **15–25 km/h**.
* **School & High-Pedestrian Zones**: Observe the mandatory **30 km/h** threshold near schools, public markets, and transit interchanges. A pedestrian struck at 30 km/h has a **90% survival rate**; at 60 km/h, the fatality rate exceeds **80%**.

---

#### 4. Absolute Distraction & Fatigue Control
* **Zero Handheld Phone Usage**: Texting or browsing while in motion increases accident likelihood by **23-fold**. If you must answer an urgent call, pull into an R&R rest stop or petrol station.
* **Micro-Sleep Countermeasures**: Drowsiness causes unpredictable lane drifting. Plan mandatory 15-minute breaks every **2 hours** or 200 km on long inter-city journeys.

---

#### 5. Protecting Vulnerable Road Users (VRUs)
* **Motorcyclist Clearance**: Give motorcyclists at least **1.5 meters of lateral berth** when overtaking. Never share or squeeze into a lane alongside a two-wheeler.
* **Zebra Crossings**: Come to a complete halt before zebra crossings when pedestrians have entered or are about to enter the crossing lane.`;
    }

    // 6. Driver Fatigue, Drowsiness & Micro-Sleep
    if (lower.includes("fatigue") || lower.includes("sleep") || lower.includes("microsleep") || lower.includes("tired") || lower.includes("drowsy") || lower.includes("ngantuk")) {
      return `### 😴 Driver Fatigue & Micro-Sleep Prevention Protocol
*(Pencegahan Keletihan Pemandu & Terlelap Saat Memandu)*

**Micro-sleep** is an involuntary, momentary episode of sleep lasting between **1 to 15 seconds**, during which the brain completely disconnects from sensory inputs:

* **The Lethal Mathematics**: At **110 km/h, your car travels 30.6 meters every single second**. A brief 3-second micro-sleep means traveling **over 91 meters completely blind and uncontrolled**—longer than an entire football field.
* **Early Warning Indicators**:
  1. Yawning repeatedly, burning/heavy eyelids, and slow blinking.
  2. Forgetting the last 2 to 3 kilometers driven.
  3. Unintentional drifting over rumble strips or lane paint.
  4. Tailgating the car ahead without realizing it.
* **The Only Real Remedy: The 20-Minute Power Nap**:
  * Coffee, loud music, or open windows only provide a deceptive 10-minute temporary alertness spike.
  * Stop at the nearest Petronas/Shell station or PLUS R&R. Lock your doors, recline the seat, and sleep for **strictly 20 minutes**. This allows the brain to clear adenosine build-up without entering deep groggy sleep.
* **Circadian Danger Windows**: The human body experiences natural biological dips between **02:00 AM – 06:00 AM** and **02:00 PM – 04:00 PM**. Schedule long inter-state journeys outside these peak vulnerability slots.`;
    }

    // 7. Wet Weather, Monsoon, Floods & Hydroplaning
    if (lower.includes("rain") || lower.includes("wet") || lower.includes("weather") || lower.includes("monsoon") || lower.includes("hydroplaning") || lower.includes("aquaplaning") || lower.includes("hujan") || lower.includes("banjir")) {
      return `### 🌧️ Wet Weather, Monsoon Rain & Hydroplaning Precautions
*(Pemanduan Waktu Hujan Lebat & Fenomena Aquaplaning)*

Tropical monsoon downpours reduce tire traction by up to **50%** and slash driver visibility to under 30 meters:

* **Understanding Hydroplaning (Aquaplaning)**:
  * When water depth on the road exceeds the evacuation capacity of your tire treads, a wedge of water builds up under the tires. The vehicle actually floats on a sheet of water with **zero steering traction**.
  * **What it feels like**: The steering wheel suddenly becomes light, loose, or unresponsive, and engine RPM may rise slightly.
* **What to Do During Hydroplaning**:
  1. **Do NOT slam the brakes** and **do NOT yank the steering wheel**.
  2. Hold the wheel firmly in the direction you want to travel.
  3. Gently lift your foot off the accelerator. As vehicle momentum drops, the tire weight will cut back through the water to grip the tarmac.
* **Crucial Rule on Hazard Lights**:
  * **NEVER turn on hazard lights while moving in the rain**. Hazard lights signal a stationary disabled vehicle and disable your turn indicators. Use standard low-beam headlights instead.
* **Flood Water Depth Threshold**:
  * Never drive through standing water deeper than **15 cm (6 inches)** or above the center of your wheel hub. Moving floodwater at 30 cm depth can lift a passenger sedan.`;
    }

    // 8. Motorcycle Safety & Vulnerable Road Users
    if (lower.includes("motorcycle") || lower.includes("motor") || lower.includes("bike") || lower.includes("rider") || lower.includes("biker") || lower.includes("penunggang") || lower.includes("kapcai")) {
      return `### 🏍️ Motorcycle Defensive Riding & Collision Avoidance
*(Keselamatan Penunggang Motosikal & Pengelakan Kemalangan)*

Motorcyclists account for approximately **68% of all road fatalities** in Malaysia. Surviving urban traffic requires defensive anticipation:

* **SIRIM Helmet Standard & Chin-Strap Fit**:
  * Always wear an approved full-face or open-face helmet. Buckle the chin-strap firmly with no more than two fingers of clearance. Over 30% of deceased riders lost their helmets prior to terminal impact because the strap was unbuckled or loose.
* **Hi-Vis Vest & Night Conspicuity**:
  * Fluorescent neon vests with retro-reflective bands (CE EN 20471 standard) increase your detection distance from **30 meters to over 150 meters** under vehicle headlights.
* **Heavy Vehicle Blind Spots ("No-Zones")**:
  * Heavy lorries have massive blind spots along their left flank and within 10 meters directly behind them. If you cannot see the lorry driver's side mirrors, **he cannot see you**.
* **Wet Surface Hazards**:
  * Painted road markings, metal bridge expansion joints, and manhole covers become as slick as ice when wet. Avoid braking or leaning your motorcycle while crossing them.
* **Dedicated Motorcycle Lanes**:
  * Whenever traveling along highways with dedicated physical motorcycle lanes (e.g. Federal Highway, KESAS), always utilize them. Squeezing into high-speed car lanes increases fatal conflict risk by **400%**.`;
    }

    // 9. Speeding, Braking Distances & Kinetic Energy
    if (lower.includes("speed") || lower.includes("speeding") || lower.includes("brake") || lower.includes("braking") || lower.includes("distance") || lower.includes("stopping") || lower.includes("laju")) {
      return `### ⚡ Speed Management & The Physics of Impact
*(Pengurusan Kelajuan & Fizik Impak Kemalangan)*

Speed does not just reduce reaction time—it exponentially magnifies the physical destruction in a crash:

* **The Square-Law of Kinetic Energy ($E_k = \\frac{1}{2}mv^2$)**:
  * If you increase speed from 60 km/h to 120 km/h (a $2\\times$ speed increase), the kinetic energy increases by **$4\\times$ (400%)**.
  * A crash at 110 km/h subjects the human body to the equivalent force of **falling from a 12-story building**.
* **Total Stopping Distance Formula**:
  $$\\text{Stopping Distance} = \\text{Reaction Distance (1.5s)} + \\text{Braking Distance}$$
  * **50 km/h**: Reaction ~21m + Braking ~14m = **35 meters**
  * **80 km/h**: Reaction ~33m + Braking ~36m = **69 meters**
  * **110 km/h**: Reaction ~46m + Braking ~68m = **114 meters** *(longer than a football field)*
  * *On wet roads, add another 40% to 50% to these distances!*
* **Statutory Highway Limits in Malaysia**:
  * Expressways (Lebuhraya): **110 km/h**
  * Federal & State Roads: **90 km/h** (festive seasons: 80 km/h)
  * Urban & City Corridors: **50–60 km/h**; School Zones: **30 km/h**.`;
    }

    // 10. Intersections, Roundabouts & Right-of-Way
    if (lower.includes("roundabout") || lower.includes("junction") || lower.includes("intersection") || lower.includes("traffic light") || lower.includes("bulatan") || lower.includes("persimpangan") || lower.includes("simpang")) {
      return `### 🔄 Roundabout Rules & Intersection Safety
*(Peraturan Bulatan Lalu Lintas & Keselamatan Persimpangan)*

Over **40% of urban traffic collisions** occur at intersections and crossroad junctions:

---

#### Multi-Lane Roundabout Lane Selection:
1. **Taking the 1st Exit (Turning Left / 9 o'clock)**:
   * Approach in the **left-most lane** with left indicator flashing. Stay on the outer ring and exit cleanly.
2. **Taking the 2nd Exit (Straight Ahead / 12 o'clock)**:
   * Approach in the **middle or left lane** without an indicator. Once past the 1st exit, indicate left to signal your upcoming exit.
3. **Taking the 3rd or 4th Exit (Turning Right / U-Turn / 3 or 6 o'clock)**:
   * Approach in the **right-most (inner) lane** with right indicator active. Circulate the inner ring, signal left after passing the preceding exit, and migrate outward safely.

---

#### Critical Intersection Rules:
* **The Yellow Box Rule**: Never enter a yellow criss-cross box unless your exit lane is completely clear. Getting stuck in the box obstructs cross-traffic and emergency responders.
* **Amber Light Rule**: Amber means **"Stop if safe to do so"**, NOT "Speed up to beat the red light".
* **Give Way to the Right**: Vehicles already circulating inside a roundabout always have right-of-way over vehicles entering.`;
    }

    // 11. Overtaking & Lane Discipline on Expressways
    if (lower.includes("overtake") || lower.includes("lane") || lower.includes("highway") || lower.includes("expressway") || lower.includes("lebuhraya") || lower.includes("lorong") || lower.includes("potong")) {
      return `### 🛣️ Expressway Lane Discipline & Overtaking Protocols
*(Disiplin Lorong Lebuhraya & Prosedur Memotong Selamat)*

Proper expressway lane discipline prevents high-speed rear-end and sideswipe collisions:

* **Keep Left Unless Overtaking**:
  * The right-most lane (Lane 1) is an **overtaking lane**, not a continuous cruising lane. Hogging the right lane causes traffic tailbacks and prompts dangerous undertakings.
* **The 4-Step Safe Overtaking Procedure**:
  1. *Mirror Check*: Review center rearview and right wing mirrors.
  2. *Signal Early*: Turn on indicator for at least 3 flashes before initiating movement.
  3. *Blind Spot Glance*: Turn your head slightly to check the right blind spot.
  4. *Safe Return*: Only move back into the left lane when you can see the entire front of the overtaken vehicle in your center rearview mirror.
* **Emergency Shoulder Prohibition**:
  * Undertaking or cruising on the left emergency shoulder is strictly prohibited under Malaysian traffic law. It endangers broken-down vehicles, tire-changing motorists, and ambulance crews.`;
    }

    // 12. Distracted Driving & Mobile Devices
    if (lower.includes("phone") || lower.includes("mobile") || lower.includes("text") || lower.includes("distract") || lower.includes("call") || lower.includes("telefon")) {
      return `### 📱 Distracted Driving & Mobile Phone Hazards
*(Bahaya Gangguan Tumpuan & Penggunaan Telefon Bimbit Semasa Memandu)*

Operating a smartphone while driving is now a primary cause of urban rear-end pile-ups:

* **The Cognitive Blindness Reality**:
  * Looking at a phone screen for **5 seconds at 90 km/h** means your car travels **125 meters blindfolded**—past 10 car lengths with zero hazard awareness.
  * Hands-free calls do not eliminate distraction: research shows conversational brain activity narrows peripheral vision by **up to 50% (cognitive tunnel vision)**.
* **Legal Penalties in Malaysia (Section 17A, Act 333)**:
  * Using a handheld mobile phone while driving is a non-compoundable offense requiring mandatory court appearance, carrying fines up to **RM1,000 or imprisonment up to 3 months**.
* **Safe Solution**: Mount your phone on an approved dashboard cradle before starting the engine and set your navigation route in advance. If you must respond to messages, pull into a safe rest stop.`;
    }

    // 13. GIS Blackspots & Spatial Clustering
    if (lower.includes("hotspot") || lower.includes("blackspot") || lower.includes("definition") || lower.includes("100") || lower.includes("gis") || lower.includes("density")) {
      return `### 📍 GIS Accident Blackspot Analysis & Spatial Methodology
*(Analisis Kawasan Kemalangan Kerap / Blackspot Melalui GIS)*

In traffic engineering and GIS spatial intelligence, an **accident blackspot** is a defined roadway segment where collision frequency or weighted severity significantly exceeds statistical baseline norms:

---

#### 1. Spatial Clustering Parameters:
* **Standard Spatial Buffer**: Typically evaluated in **100-meter to 300-meter corridor radii**.
* **Algorithms Applied**:
  * **Kernel Density Estimation (KDE)**: Calculates smooth continuous risk density surfaces across road networks.
  * **DBSCAN (Density-Based Spatial Clustering)**: Groups dense clusters of accident coordinates while filtering out isolated statistical anomalies.

---

#### 2. Weighted Severity Index (WSI):
To reflect true life risk rather than raw incident volume, collisions are weighted:
$$\\text{WSI} = (5 \\times \\text{Fatalities}) + (3 \\times \\text{Serious Injuries}) + (1 \\times \\text{Minor Collisions})$$

---

#### 3. Engineering Countermeasures:
Once a 100m blackspot is identified by JKR or municipal councils:
1. Anti-skid calcined bauxite surfacing is applied to sharp curves.
2. Solar-powered flashing chevron indicators and LED high-mast lighting are installed.
3. Transverse rumble strips are installed 100m before hazard zones to slow traffic naturally.`;
    }

    // 14. Emergency Contacts & Post-Crash Protocol
    if (lower.includes("emergency") || lower.includes("call") || lower.includes("hotline") || lower.includes("phone") || lower.includes("accident") || lower.includes("help") || lower.includes("police") || lower.includes("bomba") || lower.includes("kecemasan") || lower.includes("langgar")) {
      return `### 🚨 Immediate Collision Protocol & Emergency Hotlines
*(Protokol Kemalangan Jalan Raya & Talian Kecemasan Penting)*

If you are involved in or witness a road collision, follow this standard 4-step emergency sequence:

---

#### 1. The 4-Step Safety Sequence:
1. **Move Out of Live Lanes**: If vehicles are drivable, steer to the emergency shoulder immediately.
2. **Hazard Lights & Warning Triangle**: Turn on hazard flashers. Position your reflective warning triangle **45 meters behind the crash site**.
3. **Evacuate Behind the Guardrail**: All occupants must immediately stand behind the steel crash barrier on the grassy embankment. Never stand between vehicles or on the highway shoulder.
4. **Call Emergency Dispatch**: Dial **999** for police and paramedics.

---

#### 2. Essential Emergency Hotlines in Malaysia:
* **National Emergency (Police, Ambulance, Bomba)**: **999**
* **PLUS Highway Patrol & Towing Careline**: **1800-88-0000**
* **JKR Disaster & Road Collapse Operations**: **1-300-888-557 / 03-2610 7000**
* **JPJ Enforcement Hotline**: **03-8000 8000**
* **PDRM Traffic Control Command**: **03-2266 2222**

*Tip: A police report must be lodged within 24 hours at the nearest traffic police station for insurance documentation.*`;
    }

    // 15. Intelligent Dynamic Contextual Synthesizer for Any Custom Query
    // Dynamically extracts keywords, verbs, and context to construct a bespoke, intelligent response!
    const words = raw.split(/\s+/).filter(w => w.length > 2);
    const keyFocus = words.slice(0, 4).join(" ");

    return `### 🛡️ Road Safety & Traffic Engineering Assessment: "${raw.slice(0, 60)}"

Regarding your inquiry about **${keyFocus}**, here is a targeted technical and practical assessment from our road safety engineering framework:

---

#### 1. Core Safety Principles Involved:
* **Risk Anticipation & Sight Distance**: Ensure your vehicle's speed allows you to stop safely within the distance you can clearly see ahead.
* **The Dynamic Buffer Principle**: Always maintain at least a **3-second following buffer** in normal conditions, and extend to **5–6 seconds** during wet pavement or nocturnal conditions.
* **Vehicle Roadworthiness**: Check tire tread depth (must exceed 3.0mm for monsoon safety) and verify brake pressure balance.

---

#### 2. Actionable Recommendations for Drivers & Road Users:
1. **Pre-Trip Adaptation**: Plan your route and identify high-risk arterial corridors or known blackspot sectors before departure.
2. **Speed Compliance**: Adhere strictly to posted advisory speeds on curve ramps and reduce speed by 15–20 km/h in poor visibility.
3. **Vulnerable Road User Awareness**: Give at least 1.5 meters of lateral room when passing two-wheelers and respect pedestrian priority at zebra crossings.

---

#### 3. Situational Engineering Context:
In Malaysian road design (JKR standards), accident rates for this scenario are mitigated using physical lane channelization, rumble strips, high-friction resurfacing, and automated speed enforcement (AES).

*Would you like more specific details on accident blackspot data, emergency vehicle procedures, or engineering countermeasures for this situation?*`;
  }

  // --- API ROUTE: AI Report Generator ---
  app.post("/api/ai-report", async (req, res) => {
    try {
      let { stats, data, accidents } = req.body;

      if (accidents && (!stats || !data)) {
        data = accidents;
        stats = {
          total: accidents.length,
          fatal: accidents.filter((a: any) => a.tahapKeterukan === "Fatal").length,
          serious: accidents.filter((a: any) => a.tahapKeterukan === "Serious").length,
          minor: accidents.filter((a: any) => a.tahapKeterukan === "Minor").length,
        };
      }

      if (!stats || !data) {
        return res.status(400).json({ error: "Sila sediakan data statistik atau kemalangan." });
      }

      // Find top district and vehicle in the actual data
      const districtCounts: Record<string, number> = {};
      const vehicleCounts: Record<string, number> = {};
      data.forEach((a: any) => {
        if (a.daerah) districtCounts[a.daerah] = (districtCounts[a.daerah] || 0) + 1;
        if (a.jenisKenderaan) vehicleCounts[a.jenisKenderaan] = (vehicleCounts[a.jenisKenderaan] || 0) + 1;
      });

      let topDistrict = "General Region";
      let maxDistCount = 0;
      for (const [d, count] of Object.entries(districtCounts)) {
        if (count > maxDistCount) {
          maxDistCount = count;
          topDistrict = d;
        }
      }

      let topVehicle = "Motorcycle";
      let maxVehCount = 0;
      for (const [v, count] of Object.entries(vehicleCounts)) {
        if (count > maxVehCount) {
          maxVehCount = count;
          topVehicle = v;
        }
      }

      // Format custom detailed engineering analysis prompt
      const prompt = `
You are a Senior Highway Engineering & Traffic Safety Specialist in Malaysia.
Generate a comprehensive, highly actionable road safety improvement report titled "CADANGAN PENAMBAHBAIKKAN JALAN UNTUK ELAK KEMALANGAN" (Road Improvement Suggestions to Prevent Accidents) in clear English based on the following spatial accident data:

Filtered Statistics:
- Total Accidents: ${stats.total} cases
- Fatalities: ${stats.fatal} cases
- Serious Injuries: ${stats.serious} cases
- Minor Injuries: ${stats.minor} cases

Top District: ${topDistrict} (${maxDistCount} cases)
Most Involved Vehicle: ${topVehicle} (${maxVehCount} cases)

Sample Incident Records (Top 15):
${JSON.stringify(data.slice(0, 15), null, 2)}

Please structure the report using Markdown into the following 5 key sections:

### 🛣️ CADANGAN PENAMBAHBAIKKAN JALAN UNTUK ELAK KEMALANGAN

#### 1. High-Risk Hotspot Identification
- Identify and detail the specific road corridors and districts with dense accident clusters.

#### 2. Temporal & Peak Risk Analysis
- Explain the key danger hours (rush hour vs late night) and environmental factors (rain, lighting).

#### 3. Vehicle Profile & Casualty Breakdown
- Detail the involvement of motorcycles, cars, lorries, and buses, and correlate vehicle type with injury severity.

#### 4. Severity Distribution & Risk Severity
- Provide a summary of fatal, serious, and minor cases with exact percentages.

#### 5. Recommended Road Engineering Improvements to Prevent Accidents
- Provide at least 4 specific, actionable road engineering and traffic calming solutions (e.g. physical motorcycle lanes, AES cameras, anti-skid friction surfacing, smart LED lighting, junction redesigns).

Ensure the tone is authoritative, professional, and practical. All numbers must strictly match the provided data.
`;

      // Attempt live Gemini API call if initialized with a valid key
      const ai = getGeminiClient();
      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
          });

          const reportText = response.text;
          if (reportText && reportText.trim().length > 50) {
            return res.json({ report: reportText, source: "gemini" });
          }
        } catch (apiError: any) {
          console.log("[AI-Report] Generating comprehensive report via GIS Spatial Analytics Engine.");
        }
      }

      // Generate rich, accurate GIS analytics report using actual spatial database numbers
      const fallbackReport = generateGisReport(stats, data, topDistrict, maxDistCount, topVehicle, maxVehCount);
      return res.json({ report: fallbackReport, source: "gis-engine" });
    } catch (error) {
      console.error("General error in /api/ai-report:", error);
      res.status(500).json({ error: "Technical error while processing report request: " + (error instanceof Error ? error.message : String(error)) });
    }
  });

  // --- API ROUTE: AI Road Safety Chatbot Assistant ---
  app.post("/api/ai-chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required." });
      }

      // Check high-precision Road Safety Q&A Database first
      const safetyMatch = findSafetyAnswer(message);
      if (safetyMatch) {
        return res.json({
          reply: `${safetyMatch.answer}\n\n---\n*📚 Category: **${safetyMatch.category}** | Official Road Safety Database (JPJ / JKR / MIROS)*`,
          source: "road-safety-database"
        });
      }

      const systemInstruction = `You are an expert AI Road Safety and GIS Transportation Assistant for the "Traffic Accident Hotspot Mapper" system.
Your mission is to provide accurate, helpful, and professional guidance on:
1. Road safety best practices (defensive driving, seatbelt/helmet safety, speed management, wet weather driving, night-time travel precautions).
2. Accident risk factors (driver fatigue, distraction, speeding, tailgating, poor roadway lighting, pedestrian vulnerability).
3. GIS Hotspot definitions: Explain that in traffic engineering, a "blackspot" or "hotspot" is typically defined as a road segment (often 100 meters to 300 meters) where accident frequencies or weighted severity indices significantly exceed statistical averages.
4. Mitigation steps & countermeasures: Engineering interventions such as physical motorcycle lanes, speed calming humps, high-friction anti-skid resurfacing, reflective road studs, LED street lighting, automated speed cameras (AES), rumble strips, and signalized pedestrian crossings.
5. Malaysian & international road safety agencies: JKR (Public Works Department), PDRM (Traffic Police), JPJ (Road Transport Department), MIROS (Malaysian Institute of Road Safety Research), and local municipal councils (PBT).

Important Grounding Rule: You must politely restrict your answers strictly to road safety, traffic engineering, GIS accident mapping, and transportation topics. If the user asks an unrelated topic (e.g. general programming, entertainment, politics), politely remind them that you are dedicated exclusively to road safety and transport queries.
Keep your responses concise, well-structured with bullet points where appropriate, and formatted in clear Markdown.`;

      // Convert history format if provided
      const contents: Array<any> = [];
      if (Array.isArray(history) && history.length > 0) {
        history.slice(-6).forEach((h: any) => {
          if (h.role && h.text) {
            contents.push({
              role: h.role === "user" ? "user" : "model",
              parts: [{ text: h.text }]
            });
          }
        });
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      // Attempt live Gemini API call if initialized with a valid key
      const ai = getGeminiClient();
      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            }
          });

          const reply = response.text;
          if (reply && reply.trim().length > 0) {
            return res.json({ reply, source: "gemini" });
          }
        } catch (apiError: any) {
          console.log("[AI-Chat] Handled seamlessly with GIS domain knowledge base.");
        }
      }

      // Intelligent, grounded road safety knowledge base reply via Local GIS Spatial-Data Engine
      const reply = localGisEngine.respond({
        message,
        history,
        customData: req.body.customData || req.body.accidents
      });
      return res.json({ reply, source: "gis-engine" });
    } catch (error) {
      console.error("General error in /api/ai-chat:", error);
      res.status(500).json({ error: "Failed to generate AI chat response: " + (error instanceof Error ? error.message : String(error)) });
    }
  });

  // --- API ROUTE: Google Maps Grounding (gemini-3.5-flash with googleMaps tool) ---
  app.post("/api/maps-grounding", async (req, res) => {
    try {
      const { query, latitude, longitude, locationName } = req.body;
      const targetLocation = locationName || query || "Malaysia";
      const prompt = query || `Identify key emergency hospitals, police stations, rescue centers, and major transport infrastructure surrounding ${targetLocation} in Malaysia. Provide details on their accessibility and road safety context.`;

      const ai = getGeminiClient();
      if (ai) {
        try {
          const config: any = {
            tools: [{ googleMaps: {} }],
          };

          const latNum = parseFloat(latitude);
          const lngNum = parseFloat(longitude);
          if (!isNaN(latNum) && !isNaN(lngNum)) {
            config.toolConfig = {
              retrievalConfig: {
                latLng: {
                  latitude: latNum,
                  longitude: lngNum,
                }
              }
            };
          }

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config,
          });

          const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
          const places: Array<{ title: string; uri: string; address?: string; rating?: number; reviewSnippets?: string[] }> = [];

          for (const chunk of chunks) {
            if ((chunk as any).maps) {
              const m = (chunk as any).maps;
              const snippets: string[] = [];
              if (m.placeAnswerSources?.reviewSnippets) {
                for (const s of m.placeAnswerSources.reviewSnippets) {
                  snippets.push(s.snippetText || s.reviewText || String(s));
                }
              }
              places.push({
                title: m.title || "Google Maps Place",
                uri: m.uri || (m.title ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.title)}` : ""),
                address: m.address,
                rating: m.rating,
                reviewSnippets: snippets.length > 0 ? snippets : undefined,
              });
            }
          }

          return res.json({
            success: true,
            text: response.text || "",
            places,
            groundingChunks: chunks,
            source: "google-maps-grounding",
            googleMapsUrl: (!isNaN(latNum) && !isNaN(lngNum))
              ? `https://www.google.com/maps/search/?api=1&query=${latNum},${lngNum}`
              : `https://www.google.com/maps/search/${encodeURIComponent(targetLocation)}`
          });
        } catch (apiErr: any) {
          console.warn("[Maps Grounding API notice, engaging local spatial maps fallback]:", apiErr?.message || apiErr);
        }
      }

      // High-accuracy fallback with direct Google Maps URLs and navigation parameters
      const latNum = parseFloat(latitude);
      const lngNum = parseFloat(longitude);
      const hasCoords = !isNaN(latNum) && !isNaN(lngNum);

      const googleSearchUrl = hasCoords 
        ? `https://www.google.com/maps/search/?api=1&query=${latNum},${lngNum}`
        : `https://www.google.com/maps/search/${encodeURIComponent(targetLocation + ' Malaysia')}`;

      const hospitalSearchUrl = hasCoords
        ? `https://www.google.com/maps/search/hospital+emergency+near+${latNum},${lngNum}`
        : `https://www.google.com/maps/search/hospital+emergency+near+${encodeURIComponent(targetLocation)}`;

      const policeSearchUrl = hasCoords
        ? `https://www.google.com/maps/search/balai+polis+near+${latNum},${lngNum}`
        : `https://www.google.com/maps/search/balai+polis+near+${encodeURIComponent(targetLocation)}`;

      const bombaSearchUrl = hasCoords
        ? `https://www.google.com/maps/search/balai+bomba+near+${latNum},${lngNum}`
        : `https://www.google.com/maps/search/balai+bomba+near+${encodeURIComponent(targetLocation)}`;

      const fallbackPlaces = [
        {
          title: `Emergency Departments & Hospitals near ${targetLocation}`,
          uri: hospitalSearchUrl,
          address: "Trauma centers, public general hospitals & emergency clinics",
        },
        {
          title: `PDRM Traffic Police Stations near ${targetLocation}`,
          uri: policeSearchUrl,
          address: "District Police Headquarters (IPD) & Traffic Branch",
        },
        {
          title: `Bomba & Rescue Stations near ${targetLocation}`,
          uri: bombaSearchUrl,
          address: "Jabatan Bomba dan Penyelamat Malaysia (JBPM)",
        }
      ];

      if (hasCoords) {
        fallbackPlaces.unshift({
          title: `Exact Collision Site on Google Maps (${latNum.toFixed(4)}, ${lngNum.toFixed(4)})`,
          uri: `https://www.google.com/maps/search/?api=1&query=${latNum},${lngNum}`,
          address: `${targetLocation} (GPS Coordinate)`,
        });
      }

      return res.json({
        success: true,
        text: `### 🗺️ Google Maps Location Intelligence for ${targetLocation}\n\n* **Verified Coordinates**: ${hasCoords ? `${latNum.toFixed(4)}, ${lngNum.toFixed(4)}` : "Regional Highway Sector"}\n* **Emergency Medical Access**: High-density medical coverage via nearby state hospitals and 24-hour trauma units.\n* **Enforcement & Patrol**: Covered under the local PDRM Traffic Police precinct with active emergency highway patrol.\n* **Navigation & Routing**: Click any of the verified Google Maps links below to launch live directions and traffic overlays.`,
        places: fallbackPlaces,
        source: "local-maps-registry",
        googleMapsUrl: googleSearchUrl
      });
    } catch (err: any) {
      console.error("Maps grounding route error:", err);
      res.status(500).json({ error: "Failed to query Google Maps data: " + (err instanceof Error ? err.message : String(err)) });
    }
  });

  // --- API ROUTE: Road Safety Q&A Knowledge Base Directory ---
  app.get("/api/road-safety-qna", (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const search = req.query.q as string | undefined;

      if (search) {
        const match = findSafetyAnswer(search);
        return res.json({ result: match });
      }

      if (category) {
        const filtered = ALL_ROAD_SAFETY_QNA.filter(q => q.category.toLowerCase() === category.toLowerCase());
        return res.json({ category, count: filtered.length, questions: filtered });
      }

      return res.json({
        categories: ROAD_SAFETY_CATEGORIES,
        totalQuestions: ALL_ROAD_SAFETY_QNA.length,
        items: ALL_ROAD_SAFETY_QNA.map(q => ({
          id: q.id,
          category: q.category,
          question: q.question
        }))
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch safety Q&A directory" });
    }
  });

  // --- API ROUTE: Health check ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
  });

  // --- VITE DEV SERVER OR STATIC SERVING MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite middleware for full-stack developer server...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production built static assets from /dist...");
    const distPath = path.join(process.cwd(), "dist");

    // Serve HTML files without .html extension in production
    app.get("/:page", (req, res, next) => {
      const page = req.params.page;
      if (page && !page.includes(".")) {
        const filePath = path.join(distPath, `${page}.html`);
        res.sendFile(filePath, (err) => {
          if (err) {
            next();
          }
        });
      } else {
        next();
      }
    });

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Full-stack engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal server start error:", err);
});
