export interface SafetyQnAItem {
  id: string;
  category: string;
  question: string;
  keywords: string[];
  answer: string;
}

export const ROAD_SAFETY_CATEGORIES = [
  "Traffic Rules & Right of Way",
  "Road Signs, Signals & Markings",
  "Highway Driving & Overtaking",
  "Emergencies & Breakdowns",
  "Adverse Weather & Environmental Conditions",
  "Vehicle Safety Features & Maintenance",
  "Vulnerable Road Users (Pedestrians, Cyclists, Motorcycles)",
  "Licensing, Demerits (KEJARA), & Administration"
] as const;

export const ROAD_SAFETY_QNA: SafetyQnAItem[] = [
  // ==========================================
  // 1. Traffic Rules & Right of Way
  // ==========================================
  {
    id: "tr-speed-expressway",
    category: "Traffic Rules & Right of Way",
    question: "What is the national speed limit on expressways?",
    keywords: ["national speed limit", "speed limit expressway", "highway speed limit", "kelajuan lebuhraya"],
    answer: `### 🚗 National Expressway Speed Limit
* **Standard Limit**: **110 km/h** on controlled-access federal expressways (such as the PLUS North-South Expressway).
* **Restricted Sectors**: Certain curved, hilly, or urban segments (e.g. Menora Tunnel, Klang Valley sectors) are reduced to **80 km/h or 90 km/h**.
* **Festive Seasons**: Limits are routinely temporarily reduced by 10 km/h nationwide during major holiday operations (Ops Bersepadu).`
  },
  {
    id: "tr-speed-school",
    category: "Traffic Rules & Right of Way",
    question: "What is the speed limit in school zones?",
    keywords: ["speed limit in school zones", "school zone speed", "had laju kawasan sekolah"],
    answer: `### 🏫 School Zone Speed Limit
* **Speed Limit**: Strictly **30 km/h** during active school hours (typically 06:30–08:30, 12:30–14:30, and 17:30–18:30).
* **Engineering Calming**: Look out for yellow-painted school zigzag road markings, raised zebra tables, and solar amber flashing beacons.
* **Penalties**: Speeding in school zones carries maximum demerit points under KEJARA and immediate non-compoundable summons.`
  },
  {
    id: "tr-speed-residential",
    category: "Traffic Rules & Right of Way",
    question: "What is the speed limit in residential areas?",
    keywords: ["speed limit residential", "residential area speed", "kawasan perumahan"],
    answer: `### 🏡 Residential Area Speed Limit
* **Standard Limit**: **30 km/h to 50 km/h** (statutory default under local council bylaws is 50 km/h, with designated 30 km/h zones near parks and community roads).
* **Key Hazards**: Watch out for children playing, cyclists, reversing cars from driveways, and speed humps.`
  },
  {
    id: "tr-right-of-way-t-junction",
    category: "Traffic Rules & Right of Way",
    question: "Who has the right of way at an uncontrolled T-junction?",
    keywords: ["t-junction", "right of way t junction", "simpang t"],
    answer: `### 🔀 Right of Way at Uncontrolled T-Junctions
* **Continuing Straight Traffic Has Priority**: Vehicles traveling along the through-road (the top bar of the 'T') have right of way over vehicles approaching from the terminating side road (the stem of the 'T').
* **Rule**: Vehicles on the terminating road must come to a complete stop and yield to all cross-traffic before turning.`
  },
  {
    id: "tr-right-of-way-4-way",
    category: "Traffic Rules & Right of Way",
    question: "Who has the right of way at an uncontrolled four-way intersection?",
    keywords: ["four-way intersection", "uncontrolled 4-way", "simpang empat"],
    answer: `### ➕ Right of Way at Uncontrolled 4-Way Intersections
* **The 'Give Way to the Right' Rule**: If vehicles arrive at the same time, drivers must yield to vehicles approaching from their **right side**.
* **Major vs Minor Road**: Traffic on the wider, designated through-road takes precedence over side roads.
* **Turning Vehicles**: Vehicles turning right must yield to oncoming traffic traveling straight through.`
  },
  {
    id: "tr-roundabout-right-of-way",
    category: "Traffic Rules & Right of Way",
    question: "Who has the right of way in a roundabout?",
    keywords: ["roundabout", "right of way roundabout", "bulatan", "traffic circle"],
    answer: `### 🔄 Roundabout Right of Way
* **Vehicles Inside the Circulatory Lane Have Absolute Priority**: Always give way to traffic approaching from your **right** that is already circulating the roundabout.
* **Lane Selection**:
  * Turning Left (9 o'clock) or Straight (12 o'clock): Approach in the left or middle lane.
  * Turning Right (3 o'clock) or U-Turn (6 o'clock): Approach in the rightmost lane and indicate right until your exit.`
  },
  {
    id: "tr-left-turn-red-light",
    category: "Traffic Rules & Right of Way",
    question: "Is it legal to turn left on a red light?",
    keywords: ["turn left on red", "left on red light", "belok kiri lampu merah"],
    answer: `### 🚦 Turning Left on Red Light
* **General Rule**: **NO**, it is illegal to turn left on a steady red light unless there is a dedicated slip lane or a sign stating **'Belok Kiri Jika Tiada Kereta'** (Turn Left If Clear).
* **Signal Lamps**: If a green left-turn arrow illuminates, you may turn left even if the main circle light remains red.`
  },
  {
    id: "tr-u-turn-yield",
    category: "Traffic Rules & Right of Way",
    question: "When making a U-turn, who must yield?",
    keywords: ["u-turn", "making a u-turn", "who yields u-turn", "pusingan u"],
    answer: `### ↪️ U-Turn Right of Way & Yielding
* **U-Turning Vehicle Must Yield to Everyone**: A vehicle executing a U-turn has the lowest priority and must yield to all oncoming straight-moving vehicles, left-turning vehicles from cross streets, and pedestrians.
* **Prohibitions**: U-turns are strictly forbidden where 'No U-Turn' signs are posted, over double continuous lines, or near crests of hills.`
  },
  {
    id: "tr-school-bus-stopping",
    category: "Traffic Rules & Right of Way",
    question: "Do I have to stop for a school bus with its lights flashing?",
    keywords: ["school bus", "bus with lights flashing", "bas sekolah"],
    answer: `### 🚌 School Bus Safety Rules
* **Mandatory Caution**: When a school bus (bas sekolah) is stopping or has its hazard/flashing warning beacons on, traffic following or approaching must decelerate to a walking pace or stop.
* **Child Safety**: Always expect young children to cross unexpectedly in front of or behind the bus.`
  },
  {
    id: "tr-bac-limit",
    category: "Traffic Rules & Right of Way",
    question: "What is the legal blood alcohol concentration (BAC) limit?",
    keywords: ["blood alcohol", "bac limit", "drink driving", "had alkohol", "kadar alkohol"],
    answer: `### 🍷 Legal Blood Alcohol Concentration (BAC) Limits
Under Road Transport (Amendment) Act 2020:
* **Breath**: **22 micrograms** of alcohol per 100 ml of breath.
* **Blood**: **50 milligrams** of alcohol per 100 ml of blood (0.05% BAC).
* **Urine**: **67 milligrams** of alcohol per 100 ml of urine.
* **Penalties**: Mandatory imprisonment (up to 15 years for fatal crashes), fines up to RM100,000, and minimum 5-year driving license disqualification.`
  },
  {
    id: "tr-phone-traffic-jam",
    category: "Traffic Rules & Right of Way",
    question: "Can I use my phone if I am stuck in a dead-stop traffic jam?",
    keywords: ["phone traffic jam", "phone stuck in traffic", "telefon jem", "guna telefon"],
    answer: `### 📱 Using Phone in a Traffic Jam
* **Legal Status**: **NO**, it is strictly illegal. As long as the vehicle's engine is running and you are on a public carriageway, you are legally considered to be in control of the vehicle.
* **Requirement**: You may only touch or hold a mobile phone if the vehicle is safely parked in a designated parking bay with the engine switched off.`
  },
  {
    id: "tr-hands-free-devices",
    category: "Traffic Rules & Right of Way",
    question: "Are hands-free devices legally permitted while driving?",
    keywords: ["hands-free", "bluetooth driving", "phone holder", "alat bebas tangan"],
    answer: `### 🎧 Hands-Free Device Regulations
* **Permitted**: Voice-activated Bluetooth systems, mounted phone holders, and steering wheel controls are legally permissible under Rule 17A of LN 166/1959.
* **Restrictions**: The phone must be securely locked into a dedicated holder or cradle. Touching, scrolling, or texting while driving remains an offense.`
  },
  {
    id: "tr-rear-seatbelt-responsibility",
    category: "Traffic Rules & Right of Way",
    question: "Who is legally responsible if a rear-seat passenger doesn't wear a seatbelt?",
    keywords: ["rear seatbelt", "passenger seatbelt", "tali pinggang belakang"],
    answer: `### 💺 Rear Seatbelt Liability
* **Adult Passengers (17+ years)**: The individual passenger is personally liable for their own fine (RM300 summons).
* **Minor Passengers (Under 17 years)**: The **driver** is legally responsible and will be summoned for carrying unrestrained minor occupants.`
  },
  {
    id: "tr-eating-drinking-driving",
    category: "Traffic Rules & Right of Way",
    question: "Is it legal to eat or drink while driving?",
    keywords: ["eat or drink while driving", "eating driving", "makan sambil memandu"],
    answer: `### 🥪 Eating or Drinking While Driving
* **Technical Legality**: While taking a quick sip of water is not explicitly forbidden, eating complex meals or drinking can be prosecuted under **Section 43 of Road Transport Act 1987 (Careless and Inconsiderate Driving)**.
* **Driver Duty**: Both hands should remain in control of the steering wheel at all times.`
  },
  {
    id: "tr-barefoot-flip-flops",
    category: "Traffic Rules & Right of Way",
    question: "Can I drive barefoot or in flip-flops?",
    keywords: ["barefoot", "flip-flops", "slippers driving", "memandu berkaki ayam", "selipar"],
    answer: `### 🩴 Driving Barefoot or in Flip-Flops
* **Private Motorists (CDL/GDL Class D)**: There is no statutory prohibition against private car owners driving barefoot or in slippers.
* **Commercial Drivers (GDL/PSV)**: Commercial lorry and bus drivers are legally required to wear proper closed-toe shoes.
* **Safety Advisory**: Loose flip-flops can wedge behind the brake pedal; driving barefoot or with snug flat footwear is safer than loose sandals.`
  },
  {
    id: "tr-child-car-seat-crs",
    category: "Traffic Rules & Right of Way",
    question: "What are the rules for car seat requirements for infants and toddlers?",
    keywords: ["car seat requirements", "child restraint system", "crs", "kerusi keselamatan kanak-kanak"],
    answer: `### 👶 Child Restraint System (CRS) Regulations
* **Mandatory Rule**: Children weighing under **36 kg**, or height below **135 cm**, or age under **12 years old** must use an approved UN R44 or R129 Child Restraint System.
* **Rear-Facing Seats**: Infants up to 15 months / 13 kg must be in rear-facing child seats.
* **Airbag Danger**: Never place a rear-facing child seat in the front passenger seat if the passenger airbag is active.`
  },
  {
    id: "tr-child-front-seat-age",
    category: "Traffic Rules & Right of Way",
    question: "At what age or height can a child sit in the front passenger seat?",
    keywords: ["child front seat", "child sit in front", "kanak-kanak tempat duduk hadapan"],
    answer: `### 🧒 Child Sitting in Front Passenger Seat
* **Minimum Benchmark**: At least **12 years old** AND at least **135 cm tall** (ensuring the adult 3-point seatbelt crosses the collarbone and pelvis, not the neck).
* **Airbag Risk**: The high-velocity explosive deployment of front passenger airbags can cause severe cervical trauma to smaller children.`
  },
  {
    id: "tr-dashcams-requirement",
    category: "Traffic Rules & Right of Way",
    question: "Are dashcams legally required or just recommended?",
    keywords: ["dashcam", "dashcams required", "kamera papan pemuka"],
    answer: `### 📹 Dashcam Legal Status
* **Status**: Not currently mandatory for private passenger vehicles in Malaysia, but **strongly recommended by MIROS and PDRM**.
* **Legal Admissibility**: Dashcam video footage is fully admissible in court and police investigations to establish fault, disprove fraudulent claims, and identify hit-and-run vehicles.`
  },
  {
    id: "tr-funeral-procession",
    category: "Traffic Rules & Right of Way",
    question: "Do I have to give way to funeral processions?",
    keywords: ["funeral procession", "give way to funeral", "perarakan pengebumian"],
    answer: `### ⚰️ Funeral Processions Etiquette & Rules
* **Rule**: Other motorists should show courtesy and yield right-of-way where safe to do so. Cutting through or breaking an escorted funeral procession is unsafe and considered careless driving.
* **Police Escort**: If an escort vehicle (police outrider) is leading the procession, their signals take priority over traffic lights.`
  },
  {
    id: "tr-expired-road-tax-penalty",
    category: "Traffic Rules & Right of Way",
    question: "What is the penalty for driving with an expired road tax?",
    keywords: ["expired road tax", "road tax mati", "cukai jalan tamat"],
    answer: `### 📄 Expired Road Tax Penalties
* **Statutory Offense**: Under Section 15(1) and Section 23 of the Road Transport Act 1987.
* **Fine**: Fine up to **RM3,000** for driving without valid motor vehicle license (road tax).
* **Insurance Invalidation**: An expired road tax voids third-party insurance coverage, exposing the driver to full personal liability in a crash.`
  }
];
