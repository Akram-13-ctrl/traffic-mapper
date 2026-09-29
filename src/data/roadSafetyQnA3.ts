import type { SafetyQnAItem } from "./roadSafetyQnA";

export const ROAD_SAFETY_QNA_PART3: SafetyQnAItem[] = [
  // ==========================================
  // 4. Emergencies & Breakdowns
  // ==========================================
  {
    id: "emg-brake-failure-hill",
    category: "Emergencies & Breakdowns",
    question: "What should I do if my brakes fail while driving down a hill?",
    keywords: ["brakes fail down hill", "brake failure downhill", "brek rosak bukit"],
    answer: `### 🛑 Downhill Brake Failure Protocol
1. **Downshift to Low Gear**: Immediately downshift to 2nd or 1st gear (or 'L' / manual mode in automatics) to force engine braking.
2. **Pump the Footbrake**: If not ABS, rapid pumping may rebuild hydraulic pressure.
3. **Use Handbrake Gradual Application**: Gently apply the emergency handbrake while keeping the release button depressed (do NOT yank hard, or rear wheels will lock and spin).
4. **Use Emergency Escape Ramps (Lorong Kecemasan Curam)**: Steer into gravel runaway truck ramps if available, or gently rub your tires against roadside soil embankments.`
  },
  {
    id: "emg-tire-blowout-high-speed",
    category: "Emergencies & Breakdowns",
    question: "How do I handle a sudden tire blowout at high speeds?",
    keywords: ["tire blowout high speeds", "sudden tire blowout", "tayar meletup laju"],
    answer: `### 💥 High-Speed Tire Blowout Procedure
1. **DO NOT Slam on the Brakes**: Hard braking induces violent spinning.
2. **Hold Steering Firmly with Both Hands**: Counteract the pull toward the flat side.
3. **Gradually Ease Off the Throttle**: Let aerodynamic drag and engine friction slow the car down to 50 km/h.
4. **Indicate & Coast to the Left Shoulder**: Park far left, turn on hazard lights, and deploy warning triangles.`
  },
  {
    id: "emg-aquaplaning-recovery",
    category: "Emergencies & Breakdowns",
    question: "What should I do if my vehicle starts aquaplaning or hydroplaning?",
    keywords: ["aquaplaning", "hydroplaning", "kereta meluncur air", "tayar terapung"],
    answer: `### 🌊 Aquaplaning / Hydroplaning Recovery
1. **Stay Calm & Do NOT Brake**: Sudden braking or jerk steering will cause an uncontrollable spin.
2. **Ease Off the Throttle Smoothly**: Allow vehicle weight to settle and tires to cut through the water film.
3. **Keep the Steering Pointing Straight**: Maintain the direction of travel until tire grip is re-established.`
  },
  {
    id: "emg-car-stalls-highway",
    category: "Emergencies & Breakdowns",
    question: "What is the first thing I should do if my car stalls on a busy highway?",
    keywords: ["car stalls on highway", "car died on highway", "kereta mati lebuhraya"],
    answer: `### 🛑 Car Stalling on Highway
1. **Coast Immediately to the Left Shoulder**: Use remaining momentum to steer completely off live lanes.
2. **Switch on Hazard Warning Flashers**.
3. **Evacuate All Occupants Immediately**: Stand behind the steel crash guardrail on the grassy embankment. Never sit inside a stationary car on a highway shoulder!
4. **Call PLUS Ronda / Emergency Dispatch**: Dial **1800-88-0000** or **999**.`
  },
  {
    id: "emg-triangle-distance",
    category: "Emergencies & Breakdowns",
    question: "How far behind my car should I place an emergency warning triangle?",
    keywords: ["warning triangle distance", "emergency triangle", "segitiga kecemasan"],
    answer: `### 🔺 Emergency Warning Triangle Placement
* **On Expressways / Highways**: At least **45 to 100 meters** behind the vehicle.
* **On City & Urban Streets**: At least **30 to 45 meters** behind.
* **Blind Corners / Hills**: Place the triangle *before* the crest or bend so approaching motorists have ample advance warning.`
  },
  {
    id: "emg-engine-overheating",
    category: "Emergencies & Breakdowns",
    question: "What is the correct procedure if my car's engine overheats?",
    keywords: ["engine overheats", "car overheating", "enjin panas berasap"],
    answer: `### 🌡️ Engine Overheating Protocol
1. **Pull Over & Turn Off Engine**: Park safely on the road shoulder.
2. **NEVER Open the Radiator Cap While Hot**: Pressurized boiling coolant will violently spray and cause severe 3rd-degree burns!
3. **Wait at least 20–30 Minutes**: Once cooled, check coolant levels and inspect for broken radiator hoses or fan belt snaps.`
  },
  {
    id: "emg-stuck-accelerator",
    category: "Emergencies & Breakdowns",
    question: "What should I do if my accelerator pedal gets stuck?",
    keywords: ["accelerator pedal stuck", "stuck throttle", "pedal minyak lekat"],
    answer: `### 🚀 Stuck Accelerator Pedal Action Plan
1. **Shift into Neutral (N)**: This disengages the engine from the wheels immediately, stopping runaway acceleration.
2. **Apply Firm, Steady Brakes**: Steer toward the shoulder.
3. **Do NOT Turn Key to 'Lock'**: Turning off the ignition completely locks the steering wheel. Only switch off the engine once safely stopped.`
  },
  {
    id: "emg-sinking-vehicle",
    category: "Emergencies & Breakdowns",
    question: "How do I safely escape a sinking vehicle?",
    keywords: ["sinking vehicle", "car submerged in water", "kereta tenggelam air"],
    answer: `### 🚙 Sinking Vehicle Escape Protocol (SWUG Method)
1. **S - Seatbelts OFF**: Unbuckle yourself and children first.
2. **W - Windows OPEN**: Open windows immediately while electronics still work.
3. **U - Unbuckle Children**: Free children and push them out first.
4. **G - GO Out the Window**: Do NOT waste time opening doors; exterior water pressure makes doors impossible to push open until the cabin fills completely.`
  },
  {
    id: "emg-shattered-windshield",
    category: "Emergencies & Breakdowns",
    question: "What should I do if my windshield shatters while driving?",
    keywords: ["windshield shatters", "broken windscreen driving", "cermin depan pecah"],
    answer: `### 🪟 Shattered Windscreen Procedure
1. **Brake Gently and Turn On Hazard Lights**: Do not panic if vision is obscured by webbed cracks.
2. **Look Through the Driver's Side Window or Gap**: If visibility is completely zero, carefully knock a viewing hole through the driver's side tempered glass.
3. **Coast to the Shoulder**: Safely bring the vehicle to a halt off the carriageway.`
  },
  {
    id: "emg-ambulance-approaching",
    category: "Emergencies & Breakdowns",
    question: "What should I do if I see an ambulance approaching from behind with sirens on?",
    keywords: ["ambulance approaching", "emergency vehicle sirens", "ambulans lalu"],
    answer: `### 🚑 Giving Way to Emergency Ambulances
1. **Check Mirrors and Signal**: Indicate your intention to move aside.
2. **Move Smoothly to the Left**: Clear the right lane or center path for the emergency vehicle.
3. **Do Not Panic-Brake**: Slow down predictably without blocking intersections or emergency exits.`
  },
  {
    id: "emg-police-pull-over",
    category: "Emergencies & Breakdowns",
    question: "How should I react if a police car signals me to pull over?",
    keywords: ["police signals pull over", "police stop", "polis tahan kereta"],
    answer: `### 👮 What to Do When Signaled to Pull Over by Police
1. **Acknowledge and Indicate**: Turn on your left signal and slow down.
2. **Pull Over in a Well-Lit, Safe Location**: Stop on the shoulder away from fast traffic.
3. **Turn On Interior Cabin Light at Night**: Keep your hands visible on top of the steering wheel.
4. **Lower Window & Cooperate**: Politely produce your Driving License and MyKad upon lawful request.`
  },
  {
    id: "emg-minor-fender-bender",
    category: "Emergencies & Breakdowns",
    question: "What are the legal steps to take immediately after a minor fender-bender?",
    keywords: ["minor fender-bender", "minor accident steps", "kemalangan kecil langkah"],
    answer: `### 🚗 Minor Fender-Bender Protocol
1. **Check for Injuries**: Ensure everyone is physically unharmed.
2. **Photograph the Scene**: Take wide photos showing vehicle registration plates, impact points, and lane positions.
3. **Exchange Particulars**: Full name, MyKad number, phone number, vehicle registration number, and insurance company name.
4. **Move Vehicles to a Safe Area**: Clear the live road to prevent secondary pile-ups.`
  },
  {
    id: "emg-police-report-timeframe",
    category: "Emergencies & Breakdowns",
    question: "How long do I have to make a police report after an accident?",
    keywords: ["police report after accident", "time to make police report", "tempoh laporan polis"],
    answer: `### ⏱️ Police Report Timeframe
* **Legal Deadline**: Within **24 hours** of the collision under Malaysian law (Section 52(1) Road Transport Act 1987).
* **Where**: At the Traffic Police Station (Bahagian Siasatan dan Penguatkuasaan Trafik - BSPT) covering the district where the incident occurred.`
  },
  {
    id: "emg-move-car-no-injuries",
    category: "Emergencies & Breakdowns",
    question: "Should I move my car after an accident if there are no injuries?",
    keywords: ["move car after accident", "alihkan kereta kemalangan"],
    answer: `### 📸 Moving Your Car After an Accident
* **YES, after quick photos**: Take 3–4 quick, clear photos of the vehicle positions from safe angles, then **immediately move vehicles to the road shoulder or nearby petrol station**.
* **Secondary Crashes**: Leaving stationary cars in live highway lanes causes deadly secondary crashes and massive traffic gridlock.`
  },

  // ==========================================
  // 5. Adverse Weather & Environmental Conditions
  // ==========================================
  {
    id: "wth-high-beam-use",
    category: "Adverse Weather & Environmental Conditions",
    question: "When should I use my high beam headlights?",
    keywords: ["use high beam headlights", "when to use high beams", "lampu tinggi"],
    answer: `### 💡 High Beam Headlight Usage
* **When Permitted**: On unlit rural highways or deserted roads with zero oncoming traffic.
* **When to Dim (Low Beam)**:
  * Within **150 meters** of oncoming vehicles.
  * When following behind another vehicle within **60 meters** (to prevent blinding through their rearview mirrors).`
  },
  {
    id: "wth-high-beam-fog",
    category: "Adverse Weather & Environmental Conditions",
    question: "Why is it dangerous to use high beams in heavy fog?",
    keywords: ["high beams heavy fog", "high beam kabus tebal"],
    answer: `### 🌫️ High Beams in Heavy Fog
* **Retro-Reflection Hazard**: Fog consists of billions of suspended water droplets. High-beam light reflects directly off these water droplets back into the driver's eyes, creating an impenetrable 'white wall of glare'.
* **Correct Action**: Use low beams combined with designated low-mounted front fog lights.`
  },
  {
    id: "wth-hazard-lights-rain",
    category: "Adverse Weather & Environmental Conditions",
    question: "When should I turn on my hazard lights in heavy rain?",
    keywords: ["hazard lights heavy rain", "lampu kecemasan waktu hujan", "double signal hujan"],
    answer: `### ❌ Hazard Lights in Heavy Rain (Common Mistake)
* **NEVER Drive with Hazard Lights On**: Hazard lights ('double signal') are legally reserved solely for **completely stationary, immobilized vehicles**.
* **Dangers**: Driving with hazard lights disables your turn signals, blinds following drivers, and falsely signals an emergency breakdown.
* **Correct Practice**: Turn on your standard headlights and rear tail lamps.`
  },
  {
    id: "wth-speed-reduction-rain",
    category: "Adverse Weather & Environmental Conditions",
    question: "How much should I reduce my speed when driving in the rain?",
    keywords: ["speed reduction in rain", "reduce speed wet weather", "kurangkan kelajuan hujan"],
    answer: `### 🌧️ Wet Weather Speed Reduction
* **Recommended Reduction**: Reduce speed by at least **20% to 30%** (e.g. from 110 km/h down to 80–90 km/h on expressways).
* **Braking Distance**: Wet asphalt increases total vehicle stopping distance by **over 50%** due to reduced tire friction.`
  },
  {
    id: "wth-flooded-road-driving",
    category: "Adverse Weather & Environmental Conditions",
    question: "What is the safest way to drive through a flooded road?",
    keywords: ["flooded road driving", "driving through flood", "pandu redah banjir"],
    answer: `### 🌊 Driving Through Flooded Roads
1. **Rule of Thumb**: If water covers more than half your wheel rim or exceeds 15 cm (curb height), **DO NOT ATTEMPT TO CROSS**.
2. **Drive in Center of Road**: Where water is shallowest.
3. **Engage 1st or Low Gear & Maintain Steady Throttle**: Keeps engine revs up to prevent water from being sucked into the exhaust pipe.
4. **Never Create Bow Waves**: Do not accelerate violently.`
  },
  {
    id: "wth-test-brakes-after-water",
    category: "Adverse Weather & Environmental Conditions",
    question: "How should I test my brakes after driving through deep water?",
    keywords: ["test brakes after water", "dry brakes after flood", "uji brek lepas air"],
    answer: `### 🛑 Testing & Drying Brakes After Deep Water
* **Procedure**: Immediately after clearing standing water, while driving slowly at 20–30 km/h, **lightly tap the brake pedal several times**.
* **Effect**: Friction heats up the brake rotors/drums, evaporating water films and restoring full hydraulic braking bite.`
  },
  {
    id: "wth-severe-crosswinds",
    category: "Adverse Weather & Environmental Conditions",
    question: "What is the best way to handle severe crosswinds on a highway?",
    keywords: ["severe crosswinds", "crosswinds highway", "angin lintang kuat"],
    answer: `### 💨 Handling Severe Highway Crosswinds
* **Vulnerable Areas**: Open bridges, elevated viaducts, mountain gaps, and highway exits from forest cuts.
* **Actions**:
  1. Reduce cruising speed by 20 km/h.
  2. Hold the steering wheel firmly with both hands (9 and 3 o'clock).
  3. Anticipate sudden wind gusts when passing or being passed by large boxy trucks or container lorries.`
  },
  {
    id: "wth-rear-wheel-skid-oversteer",
    category: "Adverse Weather & Environmental Conditions",
    question: "How do I recover from a rear-wheel skid on a slippery road?",
    keywords: ["rear-wheel skid", "oversteer recovery", "tayar belakang tergelincir", "oversteer"],
    answer: `### 🔄 Rear-Wheel Skid (Oversteer) Recovery
1. **Steer Into the Skid (Counter-Steer)**: Turn your front wheels in the direction the rear of the car is sliding (e.g. if the rear fishtails right, steer right).
2. **Do NOT Slam the Brakes**: Sudden braking transfers weight forward, causing a complete 360-degree spin.
3. **Gently Feather the Throttle**: Smoothly re-establish tire traction.`
  },
  {
    id: "wth-front-wheel-skid-understeer",
    category: "Adverse Weather & Environmental Conditions",
    question: "How do I recover from a front-wheel skid?",
    keywords: ["front-wheel skid", "understeer recovery", "tayar depan tergelincir", "understeer"],
    answer: `### ↔️ Front-Wheel Skid (Understeer) Recovery
1. **Ease Off the Gas Pedal Immediately**: Weight shifts forward onto the front tires to regain grip.
2. **Do NOT Turn the Wheel Sharply**: Turning tighter only prolongs the slide.
3. **Straighten the Wheel Slightly**: Allow the front tire tread to regain mechanical friction, then gently guide the car through the turn.`
  },
  {
    id: "wth-fog-lights-vs-headlights",
    category: "Adverse Weather & Environmental Conditions",
    question: "When should I use fog lights instead of regular headlights?",
    keywords: ["fog lights vs regular headlights", "when to use fog lights", "lampu kabus"],
    answer: `### 💡 Fog Lights Usage Rules
* **Condition**: Use front/rear fog lights **only when visibility drops below 100 meters** (heavy mountain mist, dense tropical storm).
* **Switch Off in Clear Weather**: Rear fog lights are intensely bright red and dazzle following motorists in normal conditions.`
  },
  {
    id: "wth-extreme-heat-tires",
    category: "Adverse Weather & Environmental Conditions",
    question: "How does extreme heat affect tire pressure and safety?",
    keywords: ["extreme heat tire pressure", "heat tire safety", "cuaca panas tekanan tayar"],
    answer: `### ☀️ Extreme Heat & Tire Pressure
* **Pressure Rise**: Tire pressure increases by approximately **1 to 2 PSI for every 5°C increase** in ambient/pavement temperature.
* **Blowout Hazard**: Driving fast on under-inflated tires on hot tarmac creates intense sidewall flexing and heat buildup, leading to catastrophic high-speed tire delamination.`
  },
  {
    id: "wth-sun-glare-blindness",
    category: "Adverse Weather & Environmental Conditions",
    question: "What should I do if sun glare completely blinds my vision?",
    keywords: ["sun glare blinds vision", "sun glare driving", "silau matahari"],
    answer: `### 🕶️ Countering Severe Sun Glare
1. **Lower Sun Visors & Wear Polarized Sunglasses**: Polarized lenses cut horizontal glare by up to 90%.
2. **Keep Windshield Clean Inside and Out**: Dust and film scatter light into a blinding white sheen.
3. **Increase Following Distance**: Double your buffer and follow lane road markings.`
  }
];
