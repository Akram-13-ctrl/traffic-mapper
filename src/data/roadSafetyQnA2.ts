import type { SafetyQnAItem } from "./roadSafetyQnA.js";

export const ROAD_SAFETY_QNA_PART2: SafetyQnAItem[] = [
  // ==========================================
  // 2. Road Signs, Signals & Markings
  // ==========================================
  {
    id: "sign-double-yellow",
    category: "Road Signs, Signals & Markings",
    question: "What does a double continuous yellow line mean?",
    keywords: ["double continuous yellow", "double yellow line", "garisan kuning berkembar"],
    answer: `### 🟡🟡 Double Continuous Yellow Line
* **Meaning**: Strictly **NO PARKING AT ANY TIME** (24/7 prohibition).
* **Waiting / Unloading**: Stopping or waiting is forbidden along the curb.
* **Enforcement**: Vehicles parked along double yellow lines are subject to immediate towing, wheel clamping, and summonses by PDRM and municipal councils (PBT).`
  },
  {
    id: "sign-single-yellow",
    category: "Road Signs, Signals & Markings",
    question: "What does a single continuous yellow line on the side of the road indicate?",
    keywords: ["single continuous yellow line", "single yellow line", "garisan kuning tunggal"],
    answer: `### 🟡 Single Continuous Yellow Line (Edge of Road)
* **Meaning**: **NO PARKING** during stipulated daytime hours (standard default: 07:00 to 19:00, Monday through Saturday).
* **Exceptions**: Quick drop-offs or pick-ups of passengers are permitted, provided the driver remains in the vehicle and does not cause obstruction.`
  },
  {
    id: "sign-dashed-white",
    category: "Road Signs, Signals & Markings",
    question: "What does a dashed white center line mean?",
    keywords: ["dashed white center line", "broken white line", "garisan putih putus-putus"],
    answer: `### ⚪- - - Dashed White Center Line
* **Meaning**: Separates lanes moving in the same direction or traffic flows. Motorists are **permitted to change lanes or overtake** when clear and safe to do so.`
  },
  {
    id: "sign-solid-white",
    category: "Road Signs, Signals & Markings",
    question: "What does a solid white center line mean?",
    keywords: ["solid white center line", "single solid white line", "garisan putih berterusan"],
    answer: `### ⚪ Solid Continuous White Center Line
* **Meaning**: **NO OVERTAKING OR LANE CHANGING**. Motorists must stay within their lane. Commonly painted on approaches to junctions, pedestrian crossings, bridges, and curves.`
  },
  {
    id: "sign-double-white",
    category: "Road Signs, Signals & Markings",
    question: "What does a double continuous white line mean?",
    keywords: ["double continuous white line", "double white lines", "garisan berkembar putih"],
    answer: `### ⚪⚪ Double Continuous White Line
* **Meaning**: **ABSOLUTE PROHIBITION ON OVERTAKING OR CROSSING** from either direction. Straddling or crossing this line is a severe traffic offense under Section 119 of the Road Transport Act.`
  },
  {
    id: "sign-yellow-box-junction",
    category: "Road Signs, Signals & Markings",
    question: "What is a yellow box junction and what are the rules for it?",
    keywords: ["yellow box junction", "yellow box rules", "kotak kuning"],
    answer: `### 🟨 Yellow Box Junction Rules
* **Core Rule**: You **MUST NOT enter the yellow criss-cross box** unless your exit path is completely clear.
* **Sole Exception**: You may enter and wait inside the box only if you are turning right and are prevented from turning solely by oncoming traffic or other vehicles waiting to turn right.`
  },
  {
    id: "sign-zigzag-white-pedestrian",
    category: "Road Signs, Signals & Markings",
    question: "What do zig-zag white lines before a pedestrian crossing mean?",
    keywords: ["zig-zag white lines", "zigzag lines pedestrian crossing", "garisan zig-zag"],
    answer: `### 〰️ Zig-Zag White Lines Ahead of Crossings
* **Dual Meaning**:
  1. Warns drivers that a pedestrian zebra crossing is immediately ahead.
  2. **Strictly prohibits overtaking** the leading vehicle or parking along the roadside within the zig-zag zone.`
  },
  {
    id: "sign-red-circle-white-bar",
    category: "Road Signs, Signals & Markings",
    question: "What does a red circle with a white horizontal bar mean?",
    keywords: ["red circle white bar", "no entry sign", "papan tanda dilarang masuk"],
    answer: `### ⛔ Red Circle with White Horizontal Bar
* **Meaning**: **NO ENTRY (Dilarang Masuk)** for all motorized vehicles. Frequently found at the exit points of one-way streets, divided ramps, and restricted bus lanes.`
  },
  {
    id: "sign-blue-circle-number",
    category: "Road Signs, Signals & Markings",
    question: "What does a blue circular sign with a number mean?",
    keywords: ["blue circular sign with a number", "blue circle number", "papan tanda biru bulat"],
    answer: `### 🔵 Blue Circular Sign with a White Number
* **Meaning**: **MANDATORY MINIMUM SPEED LIMIT** (e.g. '60' means vehicles must not travel slower than 60 km/h unless traffic conditions dictate). Contrasts with red circular signs which indicate maximum speed limits.`
  },
  {
    id: "sign-yellow-diamond",
    category: "Road Signs, Signals & Markings",
    question: "What does a yellow diamond-shaped sign indicate?",
    keywords: ["yellow diamond sign", "diamond-shaped sign", "papan tanda kuning berlian"],
    answer: `### 🔶 Yellow Diamond-Shaped Sign
* **Meaning**: **GENERAL WARNING HAZARD SIGN**. Alerts motorists of upcoming hazards such as sharp bends, merging lanes, crossroads, narrow bridges, or slippery road conditions ahead.`
  },
  {
    id: "sign-flashing-yellow-light",
    category: "Road Signs, Signals & Markings",
    question: "What does a flashing yellow traffic light mean?",
    keywords: ["flashing yellow light", "flashing amber", "lampu kuning berkelip"],
    answer: `### 🟡 Flashing Yellow Traffic Light
* **Meaning**: **PROCEED WITH CAUTION**. The traffic signal system is in advisory mode. Slow down, check both ways, and yield right of way to any pedestrians or cross traffic.`
  },
  {
    id: "sign-flashing-red-light",
    category: "Road Signs, Signals & Markings",
    question: "What does a flashing red traffic light mean?",
    keywords: ["flashing red light", "lampu merah berkelip"],
    answer: `### 🔴 Flashing Red Traffic Light
* **Meaning**: Equivalent to a **STOP SIGN**. You must bring your vehicle to a complete halt, yield to any cross-traffic or pedestrians, and only proceed when completely clear.`
  },
  {
    id: "sign-orange-construction",
    category: "Road Signs, Signals & Markings",
    question: "How do I interpret temporary orange road signs in a construction zone?",
    keywords: ["orange road signs", "construction zone signs", "papan tanda oren pembinaan"],
    answer: `### 🟠 Temporary Orange Construction Road Signs
* **Priority Rule**: Temporary orange signs **override standard permanent road signs and speed limits**.
* **Meaning**: Active road works, detour alignments, lane closures, or construction machinery ahead. Speed limits are typically reduced by 20–30 km/h for worker safety.`
  },
  {
    id: "sign-painted-arrows",
    category: "Road Signs, Signals & Markings",
    question: "What do arrows painted on the road surface dictate?",
    keywords: ["arrows painted on road", "lane arrows", "anak panah atas jalan"],
    answer: `### ⬆️➡️ Road Surface Lane Direction Arrows
* **Mandatory Lane Guidance**: Motorists must follow the direction shown by the arrow in their lane (straight, left-turn only, or right-turn only). Changing lanes once within the solid channelization line is an offense.`
  },
  {
    id: "sign-green-vs-blue-highway",
    category: "Road Signs, Signals & Markings",
    question: "What does a green sign board vs a blue sign board indicate on highways?",
    keywords: ["green sign vs blue sign", "green board vs blue board", "papan tanda hijau biru"],
    answer: `### 🛣️ Green vs Blue Signboards on Malaysian Roads
* **Green Signboards with Yellow Lettering**: Designate **Toll Expressways** managed by federal concessionaires (e.g., E1 PLUS Expressway, E11 LDP).
* **Blue Signboards with White Lettering**: Designate **Non-Toll Federal, State, and Municipal Roads** (e.g. Route 1, State Roads).
* **Lettering Colors**: Yellow text denotes the town name; white text denotes the road/street name.`
  },

  // ==========================================
  // 3. Highway Driving & Overtaking
  // ==========================================
  {
    id: "hwy-overtake-left",
    category: "Highway Driving & Overtaking",
    question: "Is it ever legal to overtake on the left side?",
    keywords: ["overtake on left", "undertaking", "memotong sebelah kiri"],
    answer: `### ⬅️ Overtaking on the Left (Undertaking)
* **General Rule**: Strictly illegal. Overtaking must always be done on the right.
* **Exceptions Under Highway Code**:
  1. When the vehicle in front is indicating and waiting to make a right turn.
  2. In slow-moving congested traffic queues where lane-by-lane movement causes the left line to move faster.
  3. On designated one-way multi-lane roads.`
  },
  {
    id: "hwy-merge-correctly",
    category: "Highway Driving & Overtaking",
    question: "What is the correct way to merge onto a highway?",
    keywords: ["merge onto highway", "highway merging", "masuk lebuhraya"],
    answer: `### 🛣️ Correct Way to Merge onto a Highway
1. **Accelerate in the Acceleration Slip Lane**: Match the cruising speed of highway traffic (approx. 70–90 km/h) before entering the live lane.
2. **Signal Early**: Turn on right-hand indicator.
3. **Check Mirrors and Blind Spot**: Perform a quick shoulder check over your right shoulder.
4. **Merge Smoothly into a Gap**: Do not come to a full stop on the acceleration ramp unless completely blocked.`
  },
  {
    id: "hwy-heavy-vehicle-lane",
    category: "Highway Driving & Overtaking",
    question: "Which lane is designated for heavy vehicles on a three-lane highway?",
    keywords: ["heavy vehicles lane", "truck lane 3-lane highway", "lorong kenderaan berat"],
    answer: `### 🚛 Heavy Vehicle Lane Designation
* **Rule**: Heavy commercial vehicles, trucks, and buses are legally restricted to the **leftmost lane (Lane 1)**.
* **Overtaking**: They may use the middle lane (Lane 2) temporarily to overtake slower vehicles, but are **strictly prohibited from the rightmost lane (Lane 3)**.`
  },
  {
    id: "hwy-rightmost-lane-rules",
    category: "Highway Driving & Overtaking",
    question: "When am I allowed to drive in the rightmost overtaking lane?",
    keywords: ["rightmost overtaking lane", "fast lane rules", "lorong kanan"],
    answer: `### 🏎️ The Rightmost Lane (Fast Lane / Overtaking Lane)
* **Overtaking Only**: The rightmost lane is legally designated **solely for overtaking slower traffic**.
* **Lane Hogging**: Continuous cruising or 'lane hogging' in the right lane—even at the speed limit—is an offense under Rule 4 of Road Traffic Rules 1959. Once an overtake is complete, safely return to the middle or left lane.`
  },
  {
    id: "hwy-minimum-speed",
    category: "Highway Driving & Overtaking",
    question: "What is the minimum speed I should maintain on a highway?",
    keywords: ["minimum speed highway", "highway minimum speed", "kelajuan minimum"],
    answer: `### ⏱️ Minimum Speed on Highways
* **Advisory Minimum**: Drivers should maintain at least **60 km/h** on open expressways in dry conditions.
* **Hazard of Slow Driving**: Traveling abnormally slowly disrupts traffic flow and creates severe closing-speed collision hazards.`
  },
  {
    id: "hwy-reverse-missed-exit",
    category: "Highway Driving & Overtaking",
    question: "Can I reverse on a highway if I miss my exit?",
    keywords: ["reverse highway", "missed exit reverse", "undur lebuhraya"],
    answer: `### 🚫 Reversing on a Highway
* **Rule**: **ABSOLUTELY ILLEGAL AND EXTREMELY DANGEROUS**.
* **Proper Procedure**: If you miss your exit, continue cruising at normal speed to the **next toll plaza or U-turn interchange** to turn around safely.`
  },
  {
    id: "hwy-emergency-lane-use",
    category: "Highway Driving & Overtaking",
    question: "When is it acceptable to drive in the emergency lane?",
    keywords: ["emergency lane acceptable", "when to use emergency lane", "lorong kecemasan"],
    answer: `### 🚑 Emergency Lane Usage Rules
* **Permitted Exclusively for Real Emergencies**:
  1. Genuine vehicle breakdowns or mechanical immobilization.
  2. Severe medical emergencies requiring immediate stopping.
  3. Authorized emergency service vehicles (ambulances, police, bomba, PLUS Ronda).
* **Illegal**: Using the emergency lane to bypass traffic jams is a non-compoundable offense.`
  },
  {
    id: "hwy-turn-signal-distance",
    category: "Highway Driving & Overtaking",
    question: "How far in advance should I use my turn signal before exiting a highway?",
    keywords: ["turn signal before exiting", "signal distance highway exit", "jarak bagi signal"],
    answer: `### 💡 Turn Signal Timing for Highway Exits
* **Standard Distance**: Signal at least **300 meters (or at minimum 5–8 seconds)** before entering the deceleration exit slip road.
* **Deceleration**: Do not brake abruptly in live highway traffic; brake smoothly inside the deceleration lane.`
  },
  {
    id: "hwy-2-second-rule",
    category: "Highway Driving & Overtaking",
    question: "What is the 2-second rule for following distance?",
    keywords: ["2-second rule", "two second rule", "peraturan 2 saat"],
    answer: `### ⏱️ The 2-Second Following Rule
1. Pick a fixed landmark ahead (overhead gantry, lamp post, bridge).
2. When the vehicle in front passes that object, count: *"One thousand and one, one thousand and two."*
3. If your front bumper reaches that landmark before you finish counting, you are tailgating and must back off.
* **Wet Weather**: Double this buffer to **4 to 6 seconds** on wet asphalt.`
  },
  {
    id: "hwy-following-distance-truck",
    category: "Highway Driving & Overtaking",
    question: "How should I adjust my following distance behind a heavy truck?",
    keywords: ["following distance behind heavy truck", "behind a lorry", "jarak belakang lori"],
    answer: `### 🚛 Following Heavy Trucks Safely
* **Extend Buffer to 4–5 Seconds**: Heavy trucks block forward visibility and have massive rear underrun crash risks.
* **The Mirror Rule**: If you cannot see the truck driver's side mirrors, you are in their **blind spot (No-Zone)** and they cannot see you.`
  },
  {
    id: "hwy-aggressive-tailgater",
    category: "Highway Driving & Overtaking",
    question: "What should I do if a driver is aggressively tailgating me in the fast lane?",
    keywords: ["aggressive tailgating", "tailgater fast lane", "kereta cucuk belakang"],
    answer: `### 😡 Dealing with Aggressive Tailgaters
1. **Do NOT Brake Check**: Brake-checking is reckless and causes high-speed multi-car pile-ups.
2. **Indicate Left and Move Over**: At the earliest safe gap, signal and transition to the left lane.
3. **Maintain Steady Speed**: Allow the aggressive vehicle to pass safely.`
  },
  {
    id: "hwy-overtake-towed-trailer",
    category: "Highway Driving & Overtaking",
    question: "How do I safely overtake a vehicle towing a trailer?",
    keywords: ["overtake vehicle towing trailer", "overtaking trailer", "memotong treler"],
    answer: `### 🚚 Overtaking Vehicles Towing Trailers
* **Account for Extended Length**: Towing combinations require twice the straight-line passing distance of standard cars.
* **Watch for Trailer Sway**: Wind turbulence or sudden steering can cause the trailer to fishtail.
* **Do Not Cut In Sharply**: Wait until you can see both headlights of the towing vehicle in your center rearview mirror before merging back in.`
  },
  {
    id: "hwy-motorcycles-fast-lane",
    category: "Highway Driving & Overtaking",
    question: "Are motorcycles allowed in the fast lane on a highway?",
    keywords: ["motorcycles in fast lane", "motosikal lorong kanan"],
    answer: `### 🏍️ Motorcycles in the Right Lane
* **Rules**: Under Malaysian highway traffic guidelines, motorcycles should ride in dedicated motorcycle lanes where available (e.g. Federal Highway, KESAS).
* **Main Carriageway**: On open expressways without motorcycle paths, riders should keep to the leftmost lane and only use outer lanes momentarily to overtake.`
  },
  {
    id: "hwy-emergency-lane-penalty",
    category: "Highway Driving & Overtaking",
    question: "What is the penalty for abusing the emergency lane?",
    keywords: ["penalty abusing emergency lane", "fine emergency lane", "saman lorong kecemasan"],
    answer: `### ⚖️ Penalty for Emergency Lane Abuse
* **Direct Court Action**: Under Section 53 of Road Transport Act 1987, emergency lane abuse is a **non-compoundable offense** requiring mandatory court attendance.
* **Penalties**: Fines up to **RM2,000** or imprisonment up to 6 months, plus **KEJARA demerit points**.`
  }
];
