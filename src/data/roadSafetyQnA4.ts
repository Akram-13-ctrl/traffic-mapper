import type { SafetyQnAItem } from "./roadSafetyQnA.js";

export const ROAD_SAFETY_QNA_PART4: SafetyQnAItem[] = [
  // ==========================================
  // 6. Vehicle Safety Features & Maintenance
  // ==========================================
  {
    id: "veh-abs-operation",
    category: "Vehicle Safety Features & Maintenance",
    question: "How do anti-lock braking systems (ABS) work in an emergency?",
    keywords: ["anti-lock braking systems", "how abs works", "sistem abs"],
    answer: `### 🛑 Anti-Lock Braking System (ABS) Operation
* **How It Works**: Wheel speed sensors detect when a wheel is about to lock up and slide. The hydraulic modulator rapidly pulses the brake calipers (up to **15 to 20 times per second**).
* **Key Benefit**: Prevents wheel lockup, allowing the driver to **steer and maneuver around obstacles** while braking at maximum force.`
  },
  {
    id: "veh-pump-brakes-abs",
    category: "Vehicle Safety Features & Maintenance",
    question: "Should I pump the brakes if my car has ABS?",
    keywords: ["pump brakes with abs", "pumping brakes abs", "pam brek abs"],
    answer: `### ❌ Pumping Brakes with ABS
* **NO! Never pump ABS brakes**: Pumping the pedal disrupts the electronic sensors and severely increases stopping distance.
* **Correct Technique**: **STOMP, STAY, AND STEER**. Press the brake pedal down as hard as possible and hold it down firmly while steering to safety. You will feel pulsation/vibration in the pedal—this is completely normal.`
  },
  {
    id: "veh-check-engine-light",
    category: "Vehicle Safety Features & Maintenance",
    question: "What does the check engine light usually indicate?",
    keywords: ["check engine light", "lampu check engine"],
    answer: `### ⚠️ Check Engine Light (CEL) Meanings
* **Steady Amber Light**: Advisory fault in the emissions system, oxygen sensor, catalytic converter, or loose fuel cap. Vehicle is safe to drive to a workshop.
* **Flashing Amber Light**: **CRITICAL ENGINE MISFIRE**. Unburnt fuel is dumping into the exhaust, which can melt the catalytic converter or cause engine seizure. Pull over and turn off the engine immediately.`
  },
  {
    id: "veh-oil-pressure-light",
    category: "Vehicle Safety Features & Maintenance",
    question: "What does the oil pressure warning light mean?",
    keywords: ["oil pressure warning light", "engine oil light", "lampu minyak enjin"],
    answer: `### 🛢️ Oil Pressure Warning Light
* **Meaning**: Critical loss of engine oil pressure. Oil is not circulating to lubricate pistons, bearings, and crankshaft.
* **Immediate Action**: **STOP DRIVING IMMEDIATELY**. Turn off the engine within 10 seconds. Continuing to drive will cause catastrophic engine block destruction within minutes.`
  },
  {
    id: "veh-battery-light",
    category: "Vehicle Safety Features & Maintenance",
    question: "What does the battery warning light indicate?",
    keywords: ["battery warning light", "alternator light", "lampu bateri kereta"],
    answer: `### 🔋 Battery Warning Light
* **Meaning**: Charging system malfunction (bad alternator, snapped serpentine belt, or corroded battery terminals). The vehicle is running solely on residual battery charge and will die completely once the battery drains (usually within 15–30 minutes).`
  },
  {
    id: "veh-tire-tread-check",
    category: "Vehicle Safety Features & Maintenance",
    question: "How often should I check my tire tread depth?",
    keywords: ["how often check tire tread", "tire tread check", "periksa bunga tayar"],
    answer: `### 🔍 Tire Tread Depth Inspection
* **Frequency**: Check at least **once every month**, and before any long interstate or festive highway journey.
* **How to Check**: Look for the raised **Tread Wear Indicator (TWI)** bars moulded into the tire grooves, or use a coin/depth gauge.`
  },
  {
    id: "veh-legal-tread-depth",
    category: "Vehicle Safety Features & Maintenance",
    question: "What is the legal minimum tire tread depth?",
    keywords: ["legal minimum tire tread depth", "minimum tread depth", "kedalaman bunga tayar minimum"],
    answer: `### 📏 Legal Minimum Tire Tread Depth
* **Statutory Minimum**: **1.6 mm** across the central three-quarters of the tire circumference.
* **Safety Recommendation (MIROS)**: Replace tires once tread wears down to **3.0 mm** for wet monsoon conditions, as aquaplaning risk multiplies below 3mm.`
  },
  {
    id: "veh-tire-pressure-frequency",
    category: "Vehicle Safety Features & Maintenance",
    question: "How often should I check my tire pressure?",
    keywords: ["how often check tire pressure", "tire pressure frequency", "kekerapan periksa angin tayar"],
    answer: `### 💨 Tire Pressure Check Frequency
* **Frequency**: **Every 2 weeks** (and always when tires are cold, before driving more than 2 km).
* **Reference**: Follow the manufacturer's Cold Tire Pressure sticker located on the driver's door B-pillar frame (typically 30–34 PSI).`
  },
  {
    id: "veh-under-inflated-tires",
    category: "Vehicle Safety Features & Maintenance",
    question: "What is the danger of driving with under-inflated tires?",
    keywords: ["under-inflated tires", "low tire pressure danger", "tayar kurang angin"],
    answer: `### ⚠️ Dangers of Under-Inflated Tires
1. **Severe Blowout Risk**: Under-inflation causes extreme sidewall flexing and overheating at speed, causing sudden delamination.
2. **Longer Braking Distances**: Reduces road contact patch pressure.
3. **High Fuel Consumption**: Increases rolling resistance by up to 10%.`
  },
  {
    id: "veh-airbags-seatbelts",
    category: "Vehicle Safety Features & Maintenance",
    question: "How do airbags work in conjunction with seatbelts?",
    keywords: ["airbags and seatbelts", "airbags work with seatbelts", "beg udara dan tali pinggang"],
    answer: `### 🛡️ Airbags and Seatbelts Synergy
* **Supplemental Restraint System (SRS)**: Airbags are designed to work *with* seatbelts, not replace them.
* **Seatbelt Pre-tensioners**: Cinch you tight into the seat milliseconds before the airbag deploys, keeping your head in the correct alignment.
* **Unbelted Hazard**: An unbelted occupant flies forward directly into the rapidly expanding airbag (expanding at 300 km/h), causing fatal neck and facial fractures.`
  },
  {
    id: "veh-feet-on-dashboard",
    category: "Vehicle Safety Features & Maintenance",
    question: "Why is it dangerous to rest your feet on the dashboard if there is a passenger airbag?",
    keywords: ["feet on dashboard", "resting feet on dashboard", "kaki atas dashboard"],
    answer: `### 🦵 Extreme Hazard: Feet on the Dashboard
* **Explosive Impact**: The passenger airbag explodes out of the dashboard at **over 300 km/h** within 30 milliseconds.
* **Catastrophic Trauma**: Propels the passenger's knees into their chest and eye sockets, shattering hips, femur bones, and causing permanent paralysis.`
  },
  {
    id: "veh-wrong-brake-fluid",
    category: "Vehicle Safety Features & Maintenance",
    question: "What happens if I use the wrong type of brake fluid?",
    keywords: ["wrong brake fluid", "wrong type of brake fluid", "minyak brek salah"],
    answer: `### 🧴 Using the Wrong Brake Fluid
* **Boiling & Brake Fade**: Mixing different DOT ratings (e.g. putting DOT 3 into a DOT 5.1 system) lowers the boiling point, causing total brake failure under heavy braking.
* **Seal Swelling**: Mineral oils or silicone-based DOT 5 will dissolve and destroy rubber seals and caliper pistons in glycol-based systems.`
  },
  {
    id: "veh-worn-shock-absorbers",
    category: "Vehicle Safety Features & Maintenance",
    question: "How do worn shock absorbers affect braking distance?",
    keywords: ["worn shock absorbers", "worn suspension braking distance", "penyerap hentak rosak"],
    answer: `### 🔩 Worn Shock Absorbers & Braking
* **Extended Stopping Distance**: Worn dampers increase emergency braking distance by up to **20% to 30%** because tires bounce and skip along the pavement rather than maintaining solid contact.
* **Instability**: Causes severe body roll during emergency avoidance swerves.`
  },

  // ==========================================
  // 7. Vulnerable Road Users (Pedestrians, Cyclists, Motorcycles)
  // ==========================================
  {
    id: "vru-zebra-crossing-priority",
    category: "Vulnerable Road Users (Pedestrians, Cyclists, Motorcycles)",
    question: "Who has the absolute right of way at a zebra crossing?",
    keywords: ["zebra crossing right of way", "absolute right of way zebra crossing", "lintasan belang"],
    answer: `### 🦓 Zebra Crossing Right of Way
* **Pedestrians Have Absolute Priority**: Under the Highway Code, motorists must come to a complete stop and yield whenever a pedestrian has stepped onto the crossing.
* **Overtaking Ban**: Overtaking another vehicle that is slowing down or stopped at a zebra crossing is strictly forbidden.`
  },
  {
    id: "vru-jaywalking-rules",
    category: "Vulnerable Road Users (Pedestrians, Cyclists, Motorcycles)",
    question: "Do pedestrians have the right of way if they cross outside of a designated crosswalk?",
    keywords: ["pedestrians cross outside crosswalk", "jaywalking", "melintas jalan tanpa lintasan"],
    answer: `### 🚶 Jaywalking & Crossing Outside Designated Zones
* **Legal Duty of Driver**: Drivers must still exercise reasonable care to avoid colliding with any person on the carriageway.
* **Pedestrian Law**: Under Malaysian Road Traffic Rules, pedestrians within **100 meters** of an overhead pedestrian bridge or signalized crossing must use that facility.`
  },
  {
    id: "vru-cyclist-passing-distance",
    category: "Vulnerable Road Users (Pedestrians, Cyclists, Motorcycles)",
    question: "How much distance should I leave when overtaking a cyclist?",
    keywords: ["distance overtaking cyclist", "passing a bicycle", "jarak memotong basikal"],
    answer: `### 🚲 Safe Passing Distance for Cyclists
* **Minimum Clearance**: At least **1.5 meters** of lateral space in urban zones, and **2.0 meters** on high-speed rural roads.
* **Wind Wash**: High-speed vehicles create air turbulence that can knock cyclists into drainage ditches or under wheels.`
  },
  {
    id: "vru-cyclists-single-file",
    category: "Vulnerable Road Users (Pedestrians, Cyclists, Motorcycles)",
    question: "Are cyclists required to ride in a single file on main roads?",
    keywords: ["cyclists single file", "bicycles single file", "penunggang basikal sebaris"],
    answer: `### 🚴 Cycling Formations on Public Roads
* **Single File Requirement**: Under Rule 42 of Road Traffic Rules 1959, cyclists must ride in **single file** and not ride more than one abreast on public roads.
* **Equipment**: Bicycles must be fitted with working front white lights and rear red reflectors.`
  },
  {
    id: "vru-lane-splitting-motorcycles",
    category: "Vulnerable Road Users (Pedestrians, Cyclists, Motorcycles)",
    question: "Is lane-splitting legal for motorcycles in heavy traffic?",
    keywords: ["lane-splitting", "motorcycle filtering", "celah lorong motosikal"],
    answer: `### 🏍️ Lane-Splitting & Filtering in Malaysia
* **Practice**: Widely practiced and permitted in slow traffic under Malaysian conditions.
* **Safety Threshold**: Motorcyclists should only filter when traffic is moving under 30 km/h, and keep their speed differential within 15 km/h of surrounding traffic.`
  },
  {
    id: "vru-dutch-reach",
    category: "Vulnerable Road Users (Pedestrians, Cyclists, Motorcycles)",
    question: "What is the \"Dutch Reach\" and why is it important for cyclists?",
    keywords: ["dutch reach", "opening car door cyclist", "buka pintu kereta basikal"],
    answer: `### 🚪 The "Dutch Reach" Technique
* **The Method**: Open your car door with your **far hand** (use your left hand if you are the driver in a right-hand drive car).
* **Why It Works**: Reaching across automatically swivels your torso and head, forcing you to look into your side mirror and blind spot to avoid 'dooring' approaching cyclists or motorcyclists.`
  },
  {
    id: "vru-e-scooters-public-roads",
    category: "Vulnerable Road Users (Pedestrians, Cyclists, Motorcycles)",
    question: "Are electric scooters (e-scooters) allowed on public roads?",
    keywords: ["electric scooters public roads", "e-scooters allowed", "skuter elektrik atas jalan"],
    answer: `### 🛴 E-Scooter (Micromobility) Regulations
* **Prohibited on Public Roads**: Under the Road Traffic (Prohibition of Use of Micro-mobility Vehicles) Rules 2021, e-scooters are **banned from public roads and highways**.
* **Permitted Zones**: Allowed only on dedicated bicycle lanes, parks, and pedestrian plazas.`
  },
  {
    id: "vru-truck-blind-spots",
    category: "Vulnerable Road Users (Pedestrians, Cyclists, Motorcycles)",
    question: "What specific blind spots should I be aware of around heavy trucks?",
    keywords: ["blind spots heavy trucks", "truck blind spots", "titik buta lori"],
    answer: `### 🚛 Heavy Truck Blind Spots (The "No-Zones")
1. **Directly in Front**: 3 to 6 meters directly in front of the truck cab.
2. **Left Side**: The largest blind spot, spanning across three lanes.
3. **Right Side**: Extends from just behind the cab to the trailer rear.
4. **Directly Behind**: Up to 60 meters behind the trailer.`
  },
  {
    id: "vru-brake-sharp-in-front-of-truck",
    category: "Vulnerable Road Users (Pedestrians, Cyclists, Motorcycles)",
    question: "Why shouldn't I brake sharply directly in front of a heavy truck?",
    keywords: ["brake sharply in front of truck", "braking front of lorry", "brek mengejut depan lori"],
    answer: `### ⚠️ Heavy Truck Braking Physics
* **Extended Momentum**: A loaded 40-tonne commercial truck requires up to **two to three times the distance** of a passenger car to come to a complete halt.
* **Rear-End Crush**: Cutting in and braking sharply gives the truck driver zero physical time to stop, resulting in fatal rear-end crush collisions.`
  },
  {
    id: "vru-pillion-helmet-laws",
    category: "Vulnerable Road Users (Pedestrians, Cyclists, Motorcycles)",
    question: "What are the helmet laws for pillion riders on a motorcycle?",
    keywords: ["helmet laws pillion riders", "pillion helmet", "topi keledar pembonceng"],
    answer: `### 🪖 Motorcycle Helmet Laws (Pillion & Rider)
* **Mandatory Standard**: Both the rider and pillion rider must wear an approved, strapped motorcycle helmet adhering to **MS 1:1996 or ECE 22.05 standards** (SIRIM approved).
* **Penalty**: Riding without a helmet or unfastened chinstrap carries summonses up to RM300.`
  },
  {
    id: "vru-wildlife-crossings",
    category: "Vulnerable Road Users (Pedestrians, Cyclists, Motorcycles)",
    question: "How should I adjust my driving in areas with heavy wildlife crossings?",
    keywords: ["wildlife crossings", "animal crossing highway", "lintasan haiwan liar"],
    answer: `### 🐘 Wildlife Crossing Zones (East-West Highway, Central Spine)
1. **Reduce Speed & Scan Road Shoulders**: Animals' eyes reflect vehicle headlights.
2. **Do Not Flash High Beams or Honk Loudly**: Honking panics elephants or tapirs into charging.
3. **Dim Lights & Wait Patiently**: Allow the herd to cross safely before slowly proceeding.`
  },

  // ==========================================
  // 8. Licensing, Demerits (KEJARA), & Administration
  // ==========================================
  {
    id: "lic-car-license-age",
    category: "Licensing, Demerits (KEJARA), & Administration",
    question: "What is the minimum age to get a car driving license?",
    keywords: ["minimum age car license", "age for driving license", "umur lesen kereta"],
    answer: `### 🚗 Minimum Age for Driving License (Class D/DA)
* **Age Requirement**: **17 years old** to apply for a Learner's Driving License (LDL) and take the practical test for motor cars.`
  },
  {
    id: "lic-motorcycle-license-age",
    category: "Licensing, Demerits (KEJARA), & Administration",
    question: "What is the minimum age to get a motorcycle license?",
    keywords: ["minimum age motorcycle license", "age for motorcycle license", "umur lesen motor"],
    answer: `### 🏍️ Minimum Age for Motorcycle License (Class B2/B)
* **Age Requirement**: **16 years old** for Class B2 (motorcycles up to 250cc) and Class B (unrestricted 500cc+ super-bikes).`
  },
  {
    id: "lic-probationary-restrictions",
    category: "Licensing, Demerits (KEJARA), & Administration",
    question: "What restrictions apply to a Probationary (P) license holder?",
    keywords: ["probationary p license restrictions", "p license rules", "syarat lesen p"],
    answer: `### 🟨 Probationary (P) License Conditions
* **Duration**: 2 years from passing the driving test.
* **P-Plate Display**: Mandatory display of reflective 'P' plates at the front and rear of the vehicle.
* **Zero Alcohol Tolerance**: Strict 0.00% blood alcohol level.
* **Carry License**: Must always carry physical or MyJPJ digital license.`
  },
  {
    id: "lic-p-license-20-points",
    category: "Licensing, Demerits (KEJARA), & Administration",
    question: "What happens if a P license holder accumulates 20 demerit points?",
    keywords: ["p license 20 demerit points", "accumulate 20 points p license", "lesen p 20 mata"],
    answer: `### 🚫 P License: 20 Demerit Points Consequence
* **Revocation of License**: The Probationary Driving License (PDL) is **completely revoked and cancelled** by the Director-General of JPJ.
* **Retest Requirement**: The individual is barred from driving and must start the entire driving school process from scratch as a beginner after a 12-month ban.`
  },
  {
    id: "lic-cdl-20-points",
    category: "Licensing, Demerits (KEJARA), & Administration",
    question: "What happens if a Competent Driving License (CDL) holder gets 20 demerit points?",
    keywords: ["cdl 20 demerit points", "competent driving license 20 points", "lesen cdl 20 mata"],
    answer: `### ⚠️ CDL: 20 Demerit Points Penalties
* **First Tier (20 points)**: License suspended for **6 to 8 months**.
* **Second Tier (Next 20 points)**: License suspended for **8 to 10 months**.
* **Third Tier (Next 20 points)**: License suspended for **10 to 12 months**.
* **Fourth Tier**: License is completely revoked.`
  },
  {
    id: "lic-red-light-demerits",
    category: "Licensing, Demerits (KEJARA), & Administration",
    question: "How many demerit points do I get for running a red light?",
    keywords: ["demerit points running red light", "points for red light", "mata demerit langgar lampu merah"],
    answer: `### 🚦 Running Red Light Demerit Points (KEJARA)
* **Goods / Bus Drivers**: **10 demerit points**.
* **Private Motorists / Cars**: **4 demerit points**.
* **Financial Summons**: Fixed compound fine of RM300.`
  },
  {
    id: "lic-speeding-demerits",
    category: "Licensing, Demerits (KEJARA), & Administration",
    question: "How many points are deducted for speeding more than 40 km/h over the limit?",
    keywords: ["speeding more than 40 km/h", "points speeding over 40", "demerit pandu laju lebih 40"],
    answer: `### 🏎️ Speeding Demerit Points (Exceeding > 40 km/h)
* **Goods & Bus Drivers**: **10 demerit points**.
* **Private Passenger Cars**: **4 to 6 demerit points**.
* **Summons**: Maximum compound fine under Automated Awareness Safety System (AWAS).`
  },
  {
    id: "lic-demerit-reduction-good-behavior",
    category: "Licensing, Demerits (KEJARA), & Administration",
    question: "Can my demerit points be reduced over time for good behavior?",
    keywords: ["demerit points reduced good behavior", "demerit point deduction", "tolak mata demerit"],
    answer: `### 🕊️ Demerit Point Reduction for Clean Driving
* **12-Month Clean Period**: If a driver with active demerit points commits **no traffic offenses for a continuous period of 12 months**, **50% of their accumulated demerit points are wiped clean** from their JPJ record.`
  },
  {
    id: "lic-unlicensed-driving-penalty",
    category: "Licensing, Demerits (KEJARA), & Administration",
    question: "What is the penalty for driving without a valid license?",
    keywords: ["driving without a valid license", "unlicensed driving penalty", "memandu tanpa lesen"],
    answer: `### ⚖️ Driving Without a Valid Driving License
* **Offense**: Section 26(1) of the Road Transport Act 1987.
* **Penalties**: Fine of **up to RM2,000** or imprisonment up to 3 months, or both.
* **Vehicle Owner Liability**: Permitting an unlicensed driver to operate your vehicle carries an equal fine under Section 26(2).`
  },
  {
    id: "lic-auto-license-manual-car",
    category: "Licensing, Demerits (KEJARA), & Administration",
    question: "Can I drive a manual car if I only took the test for an automatic transmission?",
    keywords: ["drive manual car with auto license", "auto license drive manual", "lesen auto pandu manual"],
    answer: `### 🕹️ Class DA (Automatic) vs Class D (Manual)
* **NO**: Drivers holding a **Class DA license (Automatic Transmission Only)** are legally prohibited from driving manual transmission vehicles.
* **Violation**: Treated as driving without an authorized license class under JPJ regulations.`
  },
  {
    id: "lic-renewal-period",
    category: "Licensing, Demerits (KEJARA), & Administration",
    question: "How often do I need to renew my driving license?",
    keywords: ["how often renew driving license", "license renewal period", "pembaharuan lesen memandu"],
    answer: `### 📅 Driving License Renewal Periods
* **Flexibility**: CDL holders can renew for a duration of **1 year up to 10 years** in a single renewal transaction.
* **Lapsed License**: If a CDL is expired for more than **3 consecutive years**, the license lapses and the holder must appeal to JPJ or retake the driving test.`
  },
  {
    id: "lic-asean-driving-validity",
    category: "Licensing, Demerits (KEJARA), & Administration",
    question: "Is my local driving license valid in neighboring countries?",
    keywords: ["local driving license neighboring countries", "license valid in asean", "lesen memandu di negara jiran"],
    answer: `### 🌏 Validity of Malaysian Driving License in ASEAN
* **1985 ASEAN Agreement**: Under the *Agreement on the Recognition of Domestic Driving Licences Issued by ASEAN Countries (1985)*, a valid Malaysian CDL can be used directly for short visits in:
  * **Thailand, Singapore, Brunei, Indonesia, Philippines, Laos, Cambodia, Vietnam, and Myanmar** without needing an International Driving Permit (IDP).`
  }
];
