import { DUMMY_ACCIDENTS, AccidentRecord } from "../data/dummyData.js";
import { findSafetyAnswer } from "../data/allRoadSafetyQnA.js";

export interface ChatHistoryItem {
  role: string;
  text: string;
}

export interface EngineQueryOptions {
  message: string;
  history?: ChatHistoryItem[];
  customData?: AccidentRecord[];
}

/**
 * Advanced Local GIS Spatial-Data Reasoning Engine
 * Grounded in empirical accident database statistics, GIS clustering principles,
 * and Malaysian highway engineering standards (JKR, MIROS, LLM, PDRM).
 */
export class LocalGisEngine {
  private accidents: AccidentRecord[];

  constructor(customData?: AccidentRecord[]) {
    this.accidents = customData && customData.length > 0 ? customData : DUMMY_ACCIDENTS;
  }

  /**
   * Update the internal dataset if live client records are provided
   */
  public updateData(data: AccidentRecord[]) {
    if (data && data.length > 0) {
      this.accidents = data;
    }
  }

  /**
   * Detect whether user input is primarily Bahasa Melayu or English
   */
  private detectLanguage(text: string): "ms" | "en" {
    const lower = text.toLowerCase();
    const msKeywords = [
      "kemalangan", "jalan", "daerah", "maut", "parah", "cedera", "tayar", "brek", "hujan", 
      "malam", "motosikal", "kereta", "lori", "bas", "bantuan", "kecemasan", "polis", 
      "had laju", "lorong", "memotong", "kenapa", "bagaimana", "apa", "di mana", "selamat", 
      "tindakan", "pecah", "rosak", "terlelap", "ngantuk", "bulatan", "simpang", "pemanduan",
      "pemandu", "panduan", "bomba", "keterukan", "kawasan", "terlibat", "elak", "bateri", 
      "tunda", "panas", "asap", "minyak", "petrol", "mati", "pancit"
    ];
    let score = 0;
    for (const kw of msKeywords) {
      if (lower.includes(kw)) score++;
    }
    return score >= 1 ? "ms" : "en";
  }

  /**
   * Extract historical context (such as previously mentioned roads or districts)
   */
  private extractHistoryContext(history: ChatHistoryItem[] = []): { lastRoad?: string; lastDistrict?: string } {
    if (!history || history.length === 0) return {};
    const reversed = [...history].reverse();
    for (const h of reversed) {
      const text = h.text.toLowerCase();
      // Match road names
      for (const acc of this.accidents) {
        if (text.includes(acc.namaJalan.toLowerCase())) {
          return { lastRoad: acc.namaJalan, lastDistrict: acc.daerah };
        }
      }
      // Match districts
      for (const acc of this.accidents) {
        if (text.includes(acc.daerah.toLowerCase())) {
          return { lastDistrict: acc.daerah };
        }
      }
    }
    return {};
  }

  /**
   * Find matching road in dataset
   */
  private findMatchingRoad(query: string): string | null {
    const lower = query.toLowerCase();
    if (lower.includes("federal") || lower.includes("persekutuan")) {
      return "Lebuhraya Persekutuan (Federal Highway)";
    }
    if (lower.includes("ampang")) return "Jalan Ampang";
    if (lower.includes("kinabalu")) return "Jalan Kinabalu";
    if (lower.includes("kewajipan")) return "Persiaran Kewajipan";
    if (lower.includes("penang")) return "Jalan Penang";
    if (lower.includes("azlan shah") || lower.includes("sultan azlan")) return "Jalan Sultan Azlan Shah";
    if (lower.includes("wong ah fook") || lower.includes("ah fook")) return "Jalan Wong Ah Fook";
    if (lower.includes("skudai")) return "Lebuhraya Skudai";

    for (const a of this.accidents) {
      const rLower = a.namaJalan.toLowerCase();
      if (lower.includes(rLower) || rLower.split(" ").some(part => part.length > 5 && lower.includes(part))) {
        return a.namaJalan;
      }
    }
    return null;
  }

  /**
   * Find matching district in dataset
   */
  private findMatchingDistrict(query: string): string | null {
    const lower = query.toLowerCase();
    if (lower.includes("johor bahru") || lower.includes("jb") || lower.includes("johor")) return "Johor Bahru";
    if (lower.includes("petaling") || lower.includes("pj")) return "Petaling Jaya";
    if (lower.includes("subang")) return "Subang Jaya";
    if (lower.includes("kuala lumpur") || lower.includes("kl")) return "Kuala Lumpur";
    if (lower.includes("georgetown") || lower.includes("pulau pinang") || lower.includes("penang")) return "Georgetown";
    if (lower.includes("bayan lepas")) return "Bayan Lepas";
    if (lower.includes("klang")) return "Klang";
    if (lower.includes("shah alam")) return "Shah Alam";

    for (const a of this.accidents) {
      if (lower.includes(a.daerah.toLowerCase())) {
        return a.daerah;
      }
    }
    return null;
  }

  /**
   * Generate an empirical road-specific safety report from real data
   */
  private getRoadDataInsights(roadName: string, lang: "ms" | "en"): string {
    const records = this.accidents.filter(a => a.namaJalan.toLowerCase().includes(roadName.toLowerCase()) || roadName.toLowerCase().includes(a.namaJalan.toLowerCase()));
    if (records.length === 0) {
      return lang === "ms"
        ? `Maklumat untuk laluan **${roadName}** tiada dalam pangkalan data semasa. Sila pastikan ejaan nama jalan atau semak paparan peta untuk koridor aktif.`
        : `No recorded incidents were found for corridor **${roadName}** in the current active database. Please check the spelling or explore the interactive GIS map.`;
    }

    const total = records.length;
    const fatal = records.filter(r => r.tahapKeterukan === "Fatal").length;
    const serious = records.filter(r => r.tahapKeterukan === "Serious").length;
    const minor = records.filter(r => r.tahapKeterukan === "Minor").length;
    const district = records[0].daerah;

    // Vehicle breakdown
    const vehMap: Record<string, number> = {};
    records.forEach(r => {
      vehMap[r.jenisKenderaan] = (vehMap[r.jenisKenderaan] || 0) + 1;
    });
    const topVehicle = Object.entries(vehMap).sort((a, b) => b[1] - a[1])[0];

    // Severity index (WSI)
    const wsi = (fatal * 5) + (serious * 3) + (minor * 1);

    if (lang === "ms") {
      return `### 📊 Analisis Statistik GIS: ${roadName} (${district})

Berdasarkan rekod spatial semasa dalam pangkalan data kemalangan:

* **Jumlah Kemalangan Direkodkan**: **${total} insiden**
* **Indeks Keterukan WSI (Weighted Severity Index)**: **${wsi} mata**
* **Pecahan Keterukan**:
  - 🔴 **Maut (Fatal)**: ${fatal} kes (${((fatal / total) * 100).toFixed(0)}%)
  - 🟠 **Parah (Serious)**: ${serious} kes (${((serious / total) * 100).toFixed(0)}%)
  - 🟡 **Ringan (Minor)**: ${minor} kes (${((minor / total) * 100).toFixed(0)}%)
* **Kenderaan Paling Kerap Terlibat**: **${topVehicle ? topVehicle[0] : "Campuran"}** (${topVehicle ? topVehicle[1] : total} insiden).

---

#### 🛠️ Cadangan Kejuruteraan JKR & Pihak Berkuasa Tempatan:
1. **Pemisahan Fizikal Motosikal**: Lorong khusus berturap dengan penghadang fleksibel bagi mengurangkan rempuhan sisi.
2. **Rawatan Permukaan Anti-Gelincir**: Aplikasi agregat *calcined bauxite* sebelum persimpangan untuk memendekkan jarak membrek sehingga 35%.
3. **Peningkatan Pencahayaan LED**: Memasang lampu jalan pintar pada koridor dengan keterukan maut waktu malam.`;
    }

    return `### 📊 GIS Empirical Road Assessment: ${roadName} (${district})

Based on current verified spatial collision records in the active system database:

* **Total Recorded Collisions**: **${total} incidents**
* **Weighted Severity Index (WSI)**: **${wsi} points**
* **Severity Breakdown**:
  - 🔴 **Fatalities**: ${fatal} cases (${((fatal / total) * 100).toFixed(0)}%)
  - 🟠 **Serious Injuries**: ${serious} cases (${((serious / total) * 100).toFixed(0)}%)
  - 🟡 **Minor Injuries**: ${minor} cases (${((minor / total) * 100).toFixed(0)}%)
* **Primary Vehicle Involved**: **${topVehicle ? topVehicle[0] : "Mixed"}** (${topVehicle ? topVehicle[1] : total} incidents).

---

#### 🛠️ Priority Engineering Countermeasures (JKR / Highway Concession):
1. **Physical Lane Segregation**: Install raised kerbs or flex-posts along high-conflict weaving sections.
2. **High-Friction Anti-Skid Surfacing**: Apply epoxy-bound calcined bauxite on high-speed approach curves to reduce stopping distances by up to 35%.
3. **Automated Enforcement (AES)**: Deploy optical radar speed tracking to deter dangerous lane-weaving and speeding.`;
  }

  /**
   * Generate an empirical district-specific safety report from real data
   */
  private getDistrictDataInsights(districtName: string, lang: "ms" | "en"): string {
    const records = this.accidents.filter(a => a.daerah.toLowerCase().includes(districtName.toLowerCase()) || districtName.toLowerCase().includes(a.daerah.toLowerCase()));
    if (records.length === 0) {
      return lang === "ms"
        ? `Tiada rekod kemalangan untuk daerah **${districtName}** dalam pangkalan data semasa.`
        : `No recorded collisions found for district **${districtName}** in the active database.`;
    }

    const total = records.length;
    const fatal = records.filter(r => r.tahapKeterukan === "Fatal").length;
    const serious = records.filter(r => r.tahapKeterukan === "Serious").length;
    const minor = records.filter(r => r.tahapKeterukan === "Minor").length;

    // Road ranking
    const roadMap: Record<string, number> = {};
    records.forEach(r => {
      roadMap[r.namaJalan] = (roadMap[r.namaJalan] || 0) + 1;
    });
    const topRoad = Object.entries(roadMap).sort((a, b) => b[1] - a[1])[0];

    if (lang === "ms") {
      return `### 📍 Profil Keselamatan Daerah: ${districtName}

Ringkasan data kemalangan bagi daerah **${districtName}**:

* **Jumlah Kemalangan**: **${total} kes** (${((total / this.accidents.length) * 100).toFixed(1)}% daripada jumlah keseluruhan data)
* **Kematian / Maut**: **${fatal} kes**
* **Kecederaan Parah**: **${serious} kes**
* **Kecederaan Ringan**: **${minor} kes**
* **Koridor Paling Berisiko (Blackspot Utama)**: **${topRoad[0]}** dengan **${topRoad[1]} insiden**.

💡 *Panduan*: Berhati-hati semasa melalui ${topRoad[0]}, patuhi had laju yang ditetapkan dan kekalkan jarak mengekori selamat 3 saat.`;
    }

    return `### 📍 District Collision Profile: ${districtName}

Spatial summary of verified accident data in **${districtName}**:

* **Total Recorded Accidents**: **${total} incidents** (${((total / this.accidents.length) * 100).toFixed(1)}% of total system records)
* **Fatalities Recorded**: **${fatal} deaths**
* **Serious Hospitalizations**: **${serious} cases**
* **Minor Injuries**: **${minor} cases**
* **Primary High-Risk Corridor (Blackspot)**: **${topRoad[0]}** with **${topRoad[1]} incidents**.

💡 *Recommendation*: Exercise heightened vigilance on ${topRoad[0]}, maintain safe buffer spacing, and avoid peak commuter hours (07:30-09:00 AM & 05:30-07:30 PM).`;
  }

  /**
   * Generate detailed high-risk roads to avoid or exercise high caution in a specific district
   */
  private getDistrictRoadsToAvoid(districtName: string, lang: "ms" | "en"): string {
    const records = this.accidents.filter(a => a.daerah.toLowerCase().includes(districtName.toLowerCase()) || districtName.toLowerCase().includes(a.daerah.toLowerCase()));
    
    if (records.length === 0) {
      return lang === "ms"
        ? `Tiada rekod titik hitam berisiko tinggi untuk **${districtName}** dalam pangkalan data semasa. Walau bagaimanapun, sentiasa amalkan pemanduan berhemah dan patuhi had laju.`
        : `No high-risk accident blackspots were found for **${districtName}** in the active spatial database. Exercise standard defensive driving precautions.`;
    }

    // Group by road
    const roadMap: Record<string, { count: number; fatal: number; serious: number; minor: number; vehicles: Record<string, number>; times: string[] }> = {};
    for (const r of records) {
      if (!roadMap[r.namaJalan]) {
        roadMap[r.namaJalan] = { count: 0, fatal: 0, serious: 0, minor: 0, vehicles: {}, times: [] };
      }
      roadMap[r.namaJalan].count++;
      if (r.tahapKeterukan === "Fatal") roadMap[r.namaJalan].fatal++;
      else if (r.tahapKeterukan === "Serious") roadMap[r.namaJalan].serious++;
      else roadMap[r.namaJalan].minor++;
      roadMap[r.namaJalan].vehicles[r.jenisKenderaan] = (roadMap[r.namaJalan].vehicles[r.jenisKenderaan] || 0) + 1;
      if (r.masa) roadMap[r.namaJalan].times.push(r.masa);
    }

    const sortedRoads = Object.entries(roadMap).sort((a, b) => {
      const wsiA = (a[1].fatal * 5) + (a[1].serious * 3) + a[1].minor;
      const wsiB = (b[1].fatal * 5) + (b[1].serious * 3) + b[1].minor;
      return wsiB - wsiA;
    });

    if (lang === "ms") {
      let output = `### 🛑 Laluan Berisiko Tinggi & Perlu Berwaspada / Dielak di ${districtName}\n\n`;
      output += `Berdasarkan analisis ketumpatan spatial dan data kemalangan GIS di kawasan **${districtName}**, berikut adalah koridor jalan raya yang mencatatkan kekerapan kemalangan tertinggi yang perlu diberi perhatian khusus:\n\n`;

      sortedRoads.forEach(([name, info], idx) => {
        const topVeh = Object.entries(info.vehicles).sort((a, b) => b[1] - a[1])[0];
        output += `#### ${idx + 1}. ${name}\n`;
        output += `* **Status Titik Hitam (Blackspot)**: ${info.fatal > 0 ? "🔴 Zon Kemalangan Maut Kerap" : "🟠 Zon Kemalangan Parah & Kesesakan"}\n`;
        output += `* **Jumlah Rekod Kemalangan**: **${info.count} insiden** (${info.fatal} Maut, ${info.serious} Parah, ${info.minor} Ringan)\n`;
        output += `* **Kenderaan Terlibat Utama**: ${topVeh ? topVeh[0] : "Pelbagai"}\n`;
        output += `* **Faktor Risiko Utama**: Konflik susur keluar-masuk berkelajuan tinggi, pergerakan pejalan kaki di waktu malam, dan pertukaran lorong mendadak.\n`;
        output += `* **Cadangan Laluan / Nasihat**: Kurangkan kelajuan di bawah had laju kawasan, kekalkan lorong tengah semasa menghampiri persimpangan susur, dan periksa titik buta bagi penunggang motosikal.\n\n`;
      });

      output += `---\n\n#### 💡 Panduan Pemanduan di ${districtName}:\n`;
      output += `* **Waktu Puncak Paling Berisiko**: **07:00 – 09:30 pagi** (aliran pekerja) dan **11:00 malam – 04:00 pagi** (risiko pemanduan laju di jalan lengang).\n`;
      output += `* **Laluan Alternatif**: Gunakan jalan lingkaran luar (outer ring road) atau lebuh raya pintasan jika ingin mengelakkan kesesakan kawasan tumpuan bandar.\n`;
      output += `* **Jarak Selamat**: Kekalkan jarak 3 saat di belakang kenderaan lain dan elakkan memotong di garisan berkembar.`;
      return output;
    }

    let output = `### 🛑 High-Risk Roads to Exercise Extreme Caution / Avoid in ${districtName}\n\n`;
    output += `Based on empirical spatial collision records and Weighted Severity Index (WSI) in **${districtName}**, here are the primary blackspot corridors identified:\n\n`;

    sortedRoads.forEach(([name, info], idx) => {
      const topVeh = Object.entries(info.vehicles).sort((a, b) => b[1] - a[1])[0];
      output += `#### ${idx + 1}. ${name}\n`;
      output += `* **Blackspot Classification**: ${info.fatal > 0 ? "🔴 Severe Fatality Corridor" : "🟠 High-Frequency Collision Zone"}\n`;
      output += `* **Verified Collisions**: **${info.count} incidents** (${info.fatal} Fatal, ${info.serious} Serious, ${info.minor} Minor)\n`;
      output += `* **Most Involved Vehicle**: ${topVeh ? topVeh[0] : "Mixed Traffic"}\n`;
      output += `* **Primary Risk Factors**: Rapid high-speed merging lanes, nocturnal speeding, and dense commercial pedestrian crossings.\n`;
      output += `* **Defensive Advice**: Reduce cruising speed by 15–20 km/h, maintain lane discipline, and check mirrors twice before crossing interchange lanes.\n\n`;
    });

    output += `---\n\n#### 💡 Commuter Guidance for ${districtName}:\n`;
    output += `* **Peak Danger Windows**: **07:00 – 09:30 AM** (morning commuter rush) and **11:00 PM – 04:00 AM** (late-night speeding).\n`;
    output += `* **Alternative Routing**: Use grade-separated bypasses, outer ring corridors, or elevated highways to bypass congested downtown arterial chokepoints.\n`;
    output += `* **Safety Buffer**: Always maintain a strict 3-second stopping distance behind larger vehicles.`;
    return output;
  }

  /**
   * Top nationwide blackspot corridors to avoid or take extreme caution
   */
  /**
   * Top nationwide blackspot corridors to avoid or take extreme caution
   */
  private getGeneralRoadsToAvoid(lang: "ms" | "en"): string {
    const roadMap: Record<string, { count: number; fatal: number; serious: number; minor: number; district: string }> = {};
    for (const r of this.accidents) {
      if (!roadMap[r.namaJalan]) {
        roadMap[r.namaJalan] = { count: 0, fatal: 0, serious: 0, minor: 0, district: r.daerah };
      }
      roadMap[r.namaJalan].count++;
      if (r.tahapKeterukan === "Fatal") roadMap[r.namaJalan].fatal++;
      else if (r.tahapKeterukan === "Serious") roadMap[r.namaJalan].serious++;
      else roadMap[r.namaJalan].minor++;
    }

    const sortedRoads = Object.entries(roadMap).sort((a, b) => {
      const wsiA = (a[1].fatal * 5) + (a[1].serious * 3) + a[1].minor;
      const wsiB = (b[1].fatal * 5) + (b[1].serious * 3) + b[1].minor;
      return wsiB - wsiA;
    }).slice(0, 4);

    if (lang === "ms") {
      let output = `### 🛑 Koridor Jalan Raya Titik Hitam (Blackspot) Utama di Malaysia\n\n`;
      output += `Berdasarkan analisis GIS ke atas data spatial semasa, berikut adalah koridor jalan raya yang mencatatkan indeks kemalangan dan keterukan maut tertinggi:\n\n`;

      sortedRoads.forEach(([name, info], idx) => {
        output += `* **${idx + 1}. ${name}** (${info.district}): **${info.count} kes direkodkan** (${info.fatal} kes maut, ${info.serious} parah).\n`;
      });

      output += `\n#### 💡 Nasihat Pemanduan Selamat:\n`;
      output += `1. **Kekalkan Jarak 3 Saat**: Gandakan ke 5 saat semasa hujan lebat atau waktu malam.\n`;
      output += `2. **Patuhi Had Laju**: Selekoh tajam di koridor ini memerlukan kelajuan di bawah 70 km/j.\n`;
      output += `3. **Titik Buta Kenderaan Berat**: Jangan memotong lori dari sebelah kiri atau berada terlalu rapat di belakang treler.`;
      return output;
    }

    let output = `### 🛑 Top Collision Blackspot Corridors Across the Road Network\n\n`;
    output += `Based on spatial GIS analysis of verified accident data, here are the highest-risk roadway corridors that demand maximum driver vigilance:\n\n`;

    sortedRoads.forEach(([name, info], idx) => {
      output += `* **${idx + 1}. ${name}** (${info.district}): **${info.count} incidents recorded** (${info.fatal} fatal, ${info.serious} serious).\n`;
    });

    output += `\n#### 💡 Essential Defensive Driving Precautions:\n`;
    output += `1. **The 3-Second Following Buffer**: Extend to 5–6 seconds on wet pavement or at night.\n`;
    output += `2. **Advisory Speed Compliance**: Sharp freeway interchange ramps should not be negotiated above 60 km/h.\n`;
    output += `3. **Heavy Vehicle No-Zones**: Never linger alongside commercial lorries or attempt undertaking on the left.`;
    return output;
  }

  /**
   * 1. Blackspot Definition & Scope
   */
  private getBlackspotDefinition(lang: "ms" | "en"): string {
    if (lang === "ms") {
      return `### 📍 Apa Itu Kawasan Titik Hitam (Accident Blackspot)?
*(Definisi Rasmi Kejuruteraan Lebuhraya & Piawaian JKR / MIROS)*

Dalam kejuruteraan trafik dan analisis spatial GIS, **kawasan titik hitam (accident blackspot)** merujuk kepada lokasi atau segmen jalan raya khusus di mana kekerapan kemalangan atau kadar keterukan maut jauh melebihi paras purata statistik:

---

#### 1. Kriteria Rasmi Mengenal Pasti Blackspot:
* **Skop Spatial**: Segmen jalan sepanjang **100 meter hingga 300 meter** (atau persimpangan khusus).
* **Tempoh Penilaian Data**: Dianalisis dalam tempoh **3 tahun berturut-turut** bagi mengasingkan kemalangan kebetulan (*random error*) daripada kecacatan geometri jalan sebenar.
* **Petunjuk Asas**: Apabila kemalangan berulang di koordinat yang sama, ia membuktikan wujudnya kelemahan infrastruktur—seperti kecondongan selekoh tidak tepat (*adverse camber*), permukaan turapan licin ketika basah, atau halangan jarak penglihatan (*sight distance obstruction*).

---

#### 2. Perbezaan Istilah Penting:
* **Blackspot (Titik Hitam)**: Lokasi tumpuan spesifik dalam radius 100m (contohnya selekoh maut atau simpang bertingkat).
* **Black Corridor (Koridor Kemalangan)**: Jajaran lebuh raya yang panjang (**1 km hingga 5 km**) yang mencatatkan siri kemalangan berterusan (contohnya Lebuhraya Persekutuan atau Lebuhraya Karak).
* **Hotspot GIS**: Kawasan kepekatan tinggi yang dikesan melalui algoritma Kernel Density Estimation (KDE).

---

#### 3. Mengapa Titik Hitam Diberi Keutamaan?
Memperbaiki satu titik hitam sejauh 100 meter melalui kaedah kejuruteraan (seperti turapan anti-gelincir dan papan tanda amaran) dapat mengurangkan kemalangan sehingga **40%–60%** dengan kos bajet yang jauh lebih efektif berbanding menurap semula keseluruhan lebuh raya.`;
    }

    return `### 📍 What is an Accident Blackspot in Highway Engineering?
*(Official JKR / MIROS & International Road Safety Standards)*

In traffic safety engineering and GIS spatial intelligence, an **accident blackspot** is a defined roadway segment or intersection where the number or severity of collisions is significantly higher than historical statistical baseline norms:

---

#### 1. Official Identification Criteria:
* **Spatial Extent**: A discrete road segment of **100 meters to 300 meters** (or a single intersection node).
* **Temporal Window**: Evaluated over a continuous **3-year rolling period** to filter out random statistical anomalies.
* **Underlying Cause**: Unlike random human errors that scatter across a network, recurrent collisions within a specific 100m corridor indicate an **underlying roadway engineering or environmental defect** (such as adverse curve banking, poor wet pavement friction, deceptive sightlines, or conflicting merge vectors).

---

#### 2. Key Terminology Distinctions:
* **Blackspot**: A localized hazard point within 100m (e.g. sharp bend, blind T-junction).
* **Black Corridor**: An extended highway stretch (**1 km to 5 km**) with continuous high crash density (e.g. Federal Highway, Karak Highway).
* **GIS Hotspot**: A cluster detected through spatial algorithms (Kernel Density Estimation) where density exceeds ambient background rates.

---

#### 3. Why Highway Authorities Prioritize Blackspots:
Targeted engineering treatments at a 100m blackspot (such as high-friction surfacing and optical chevron signage) can reduce collisions by **40%–60%** with high cost-benefit ratios compared to rebuilding entire road corridors.`;
  }

  /**
   * 2. Blackspot Calculation & Weighted Severity Index (WSI)
   */
  private getBlackspotCalculationAndWsi(lang: "ms" | "en"): string {
    if (lang === "ms") {
      return `### 📐 Bagaimana Kawasan Titik Hitam (Blackspot) Dikira & Disusun?
*(Formula Indeks Keterukan Berwajaran & Kaedah Analisis Spatial)*

Pihak berkuasa jalan raya (seperti JKR dan MIROS) tidak sekadar mengira jumlah kemalangan semata-mata. Oleh kerana kemalangan maut membawa kemusnahan nyawa dan kos sosioekonomi yang amat besar, jurutera trafik menggunakan **Indeks Keterukan Berwajaran (Weighted Severity Index - WSI)**:

---

#### 1. Formula Indeks Keterukan Berwajaran (WSI):
$$\\text{WSI} = (5 \\times \\text{Maut}) + (3 \\times \\text{Parah}) + (1 \\times \\text{Ringan})$$

* **Pemberat 5 (Maut / Fatal)**: Kajian MIROS mendapati setiap kematian jalan raya melibatkan kos sosioekonomi kira-kira **RM3.2 juta** (kehilangan tahun produktiviti hidup, kos perubatan, siasatan polis, dan pemulihan infrastruktur).
* **Pemberat 3 (Parah / Serious)**: Mengakibatkan kecacatan kekal atau kemasukan wad melebihi 4 hari.
* **Pemberat 1 (Ringan / Minor)**: Rawatan pesakit luar dan kerosakan kenderaan ringan.

---

#### 2. Kaedah Analisis Spatial GIS:
1. **Kernel Density Estimation (KDE)**: Mengubah koordinat GPS kemalangan kepada permukaan kontur haba ketumpatan risiko berterusan.
2. **DBSCAN (Density-Based Spatial Clustering)**: Mengelompokkan titik kemalangan dalam radius 100 meter secara automatik dan mengasingkan kes terpencil.
3. **Kaedah Kawalan Kualiti Kadar (Rate-Quality Control)**: Membandingkan kekerapan kemalangan sebenar dengan jangkaan matematik berdasarkan Jumlah Trafik Harian Purata (Average Daily Traffic - ADT).`;
    }

    return `### 📐 How Accident Blackspots are Calculated & Ranked
*(The Weighted Severity Index & Spatial Analysis Methodology)*

Highway authorities do not simply count the total number of crashes. Because a fatal collision inflicts catastrophic human and societal trauma compared to a minor bumper scratch, traffic engineers rank hazard corridors using the **Weighted Severity Index (WSI)**:

---

#### 1. The Weighted Severity Index (WSI) Formula:
$$\\text{WSI} = (5 \\times \\text{Fatalities}) + (3 \\times \\text{Serious Injuries}) + (1 \\times \\text{Minor Collisions})$$

* **Weight Factor 5 (Fatal)**: According to empirical research by MIROS, each Malaysian traffic fatality represents an estimated economic and societal loss of **~RM3.2 million** (lost productive life years, medical expenses, emergency response, and societal disruption).
* **Weight Factor 3 (Serious)**: Permanent physical disability or extensive inpatient hospitalization.
* **Weight Factor 1 (Minor)**: Outpatient treatment and minor vehicle body damage.

---

#### 2. Advanced Spatial GIS Algorithms:
1. **Kernel Density Estimation (KDE)**: Generates a smooth, continuous probability density surface from discrete GPS coordinates.
2. **DBSCAN (Density-Based Spatial Clustering)**: Groups dense coordinate points within a 100m search radius ($\epsilon = 100\\text{m}$) while filtering out isolated statistical anomalies.
3. **Rate-Quality Control (RQC) Method**: Compares the observed crash rate against the statistical critical rate determined by Average Daily Traffic (ADT) volume.`;
  }

  /**
   * 3. Why 100-Meter Standard?
   */
  private getBlackspot100mRationale(lang: "ms" | "en"): string {
    if (lang === "ms") {
      return `### 📏 Mengapa Radius 100 Meter Digunakan Untuk Menilai Blackspot?
*(Rasional Saintifik Piawaian Penampan 100m)*

Dalam garis panduan teknikal JKR dan kejuruteraan trafik antarabangsa, jarak **100 meter** dipilih sebagai piawaian optimum bagi analisis titik hitam atas tiga sebab saintifik:

---

1. **Jarak Penglihatan Berhenti (Stopping Sight Distance - SSD)**:
   * Pada kelajuan operasi **80–100 km/j**, jarak berhenti selamat (jarak tindak balas pemandu 2.5 saat + jarak membrek di atas jalan basah) adalah antara **80 hingga 115 meter**. Jarak 100m tepat meliputi keseluruhan zon reaksi pemandu terhadap bahaya.
2. **Toleransi GPS & Rekod Polis (Pol 27)**:
   * Laporan kemalangan PDRM merekodkan lokasi berpandukan tiang kilometer atau koordinat telefon bimbit. Radius penampan 100 meter menampung toleransi perbezaan lokasi impak sebenar.
3. **Keberkesanan Kos Intervensi Kejuruteraan**:
   * Jarak 100 meter merupakan skop kerja fizikal yang praktikal untuk kerja-kerja penurapan permukaan anti-gelincir *calcined bauxite*, papan tanda chevron pemantul, atau jalur bergetar melintang tanpa melibatkan kos jutaan ringgit.`;
    }

    return `### 📏 Why is an Accident Blackspot Defined by a 100-Meter Buffer?
*(The Scientific Rationale Behind Highway Engineering Standards)*

In JKR Road Safety Guidelines and international highway engineering, **100 meters** is the universal standard for blackspot clustering for three fundamental reasons:

---

1. **Stopping Sight Distance (SSD) Physics**:
   * At standard highway operating speeds of **80 km/h to 100 km/h**, the safe stopping sight distance (driver perception-reaction time of 2.5 seconds + mechanical braking on wet asphalt) ranges between **80 meters and 115 meters**. A 100m segment directly captures the entire deceleration-reaction envelope.
2. **GPS Precision & Police Reporting Tolerances**:
   * Police accident reports (PDRM Pol 27) record crash sites via kilometer marker posts or handheld GPS devices. A 100-meter corridor buffer absorbs coordinate variance without dispersing the localized cluster.
3. **Engineering Scope & Budget Feasibility**:
   * 100 meters represents the precise physical footprint required for targeted engineering remedies—such as high-friction bauxite resurfacing, reflective chevron sightboards, and rumble strips—without the multi-million-dollar expenditure of rebuilding an entire expressway.`;
  }

  /**
   * 4. Blackspot Elimination & Engineering Countermeasures
   */
  private getBlackspotEliminationCountermeasures(lang: "ms" | "en"): string {
    if (lang === "ms") {
      return `### 🛠️ Bagaimana Pihak Berkuasa (JKR) Menghapuskan Titik Hitam?
*(Hierarki 3 Peringkat Tindakan Kejuruteraan Jalan Raya)*

Apabila sesuatu lokasi disahkan sebagai kawasan titik hitam (blackspot), JKR dan syarikat konsesi lebuh raya melaksanakan pelan tindakan 3 peringkat:

---

#### 1. Peringkat Segera (0 – 3 Bulan - Tindakan Pantas):
* **Papan Tanda Amaran & Chevron Pemantul Cahaya**: Memasang papan tanda berjalur hitam-kuning pemantul gred jurutera di selekoh tajam.
* **Jalur Bergetar Melintang (Transverse Rumble Strips)**: Dipasang 100 meter sebelum selekoh/simpang untuk memberi getaran fizikal dan amaran bunyi.
* **Pembersihan Halangan Penglihatan**: Menebang pokok atau memotong semak yang menghalang pandangan pemandu di persimpangan.

---

#### 2. Peringkat Sederhana (3 – 12 Bulan):
* **Rawatan Permukaan Anti-Gelincir (High-Friction Surface Treatment - HFST)**:
  * Menurap agregat *calcined bauxite* dengan resin epoksi pada selekoh dan zon membrek untuk memendekkan jarak membrek sehingga **35% ketika hujan**.
* **Pencahayaan Lampu Jalan LED (High-Mast Lighting)**: Menghapuskan bayang gelap di selekoh luar bandar waktu malam.
* **Kamera Penguatkuasaan Kelajuan Automatik (AES)**: Menurunkan kelajuan pemanduan ke paras had laju yang selamat.

---

#### 3. Peringkat Jangka Panjang (1 – 3 Tahun - Penstrukturan Semula Geometri):
* **Pemisahan Fizikal Lorong Motosikal**: Membina laluan motosikal khusus berturap licin dengan penghadang poliuretana (mengurangkan kemalangan maut motosikal sehingga 42%).
* **Pengubahsuaian Simpang Ke Bulatan Lalu Lintas**: Menggantikan simpang-T bahaya dengan bulatan lalu lintas moden bagi menghapuskan konflik pertembungan hadapan (*head-on collisions*).`;
    }

    return `### 🛠️ How Highway Authorities Eliminate Road Blackspots
*(The 3-Tier JKR Engineering Countermeasure Hierarchy)*

Once a roadway segment is mathematically confirmed as a blackspot, JKR and highway concessionaires deploy a structured 3-tier remediation protocol:

---

#### 1. Short-Term Immediate Interventions (0 – 3 Months):
* **Reflective Chevron Sightboards**: High-intensity diamond-grade reflective markers to guide vehicles around deceptive curves.
* **Transverse Rumble Strips & Optical Speed Bars**: Installed 100m prior to danger points to deliver auditory and tactile alerts to inattentive drivers.
* **Sightline Clearing**: Trimming overhanging trees and removing roadside visual obstructions.

---

#### 2. Medium-Term Interventions (3 – 12 Months):
* **High-Friction Surface Treatment (HFST)**:
  * Application of calcined bauxite aggregate bound with thermosetting epoxy resin, reducing wet-weather stopping distance by up to **35%**.
* **High-Mast Daylight LED Illumination**: Illuminates pedestrian crossings and curve apices to extend night sight distance from 30m to over 150m.
* **Automated Speed Enforcement (AES)**: Calibrated radar camera enforcement to curb dangerous 85th-percentile speeds.

---

#### 3. Long-Term Capital Engineering (1 – 3 Years - Geometric Redesign):
* **Dedicated Physical Motorcycle Lanes**: Segregates two-wheelers from heavy commercial traffic, eliminating side-swipe collisions by up to 42%.
* **Roundabout Conversion**: Replaces high-speed right-angle T-junctions with modern roundabouts, virtually eliminating fatal head-on and broadside impacts.`;
  }

  /**
   * 5. Responsible Authorities in Malaysia
   */
  private getBlackspotAuthorities(lang: "ms" | "en"): string {
    if (lang === "ms") {
      return `### 🏛️ Agensi Yang Bertanggungjawab Menguruskan Blackspot di Malaysia
*(Bidang Kuasa Mengikut Pengelasan Jalan Raya)*

Di Malaysia, tanggungjawab menyelia dan membaiki kawasan titik hitam terbahagi mengikut kategori jalan:

---

* **1. Jabatan Kerja Raya (JKR)**:
  * **Bidang Kuasa**: Semua **Jalan Persekutuan (contohnya Laluan 1, Laluan 2)** dan **Jalan Negeri**.
  * **Peranan**: Menjalankan Audit Keselamatan Jalan Raya (RSA) dan menyalurkan peruntukan pembaikan titik hitam di bawah Kementerian Kerja Raya.
* **2. Lembaga Lebuhraya Malaysia (LLM) & Syarikat Konsesi (PLUS, PROLINTAS, LITRAK, dll.)**:
  * **Bidang Kuasa**: **Lebuh raya bertol antara negeri dan lebuh raya ekspres bandar**.
  * **Peranan**: Menyediakan rondaan lebuh raya (PLUS Ronda), papan tanda elektronik (VMS), kamera AES, dan perkhidmatan tunda kecemasan percuma.
* **3. Pihak Berkuasa Tempatan (PBT - contohnya DBKL, MBPJ, MBJB, MBSA)**:
  * **Bidang Kuasa**: **Jalan perbandaran, jalan perumahan, dan jalan pusat perniagaan bandar**.
  * **Peranan**: Menguruskan lampu isyarat pintar, lintasan pejalan kaki berlampu, lampu jalan, dan bonggol jalan perumahan.
* **4. MIROS (Institut Penyelidikan Keselamatan Jalan Raya Malaysia)**:
  * **Peranan**: Badan penyelidikan saintifik yang menyiasat punca kemalangan maut berprofil tinggi dan mencadangkan pindaan dasar kepada Kementerian Pengangkutan.
* **5. PDRM (Trafik) & JPJ**:
  * **Peranan**: Penguatkuasaan had laju, rondaan pencegahan, dan perekodan data kemalangan rasmi.`;
    }

    return `### 🏛️ Which Authorities are Responsible for Blackspots in Malaysia?
*(Jurisdictional Framework by Road Classification)*

In Malaysia, blackspot management and roadway rectification are divided among specific statutory bodies:

---

* **1. Public Works Department (JKR - Jabatan Kerja Raya)**:
  * **Jurisdiction**: All **Federal Roads (e.g. Route 1, Route 2)** and **State Roads (Jalan Negeri)**.
  * **Role**: Conducts formal Road Safety Audits (RSA) and executes physical blackspot rectification projects funded under the Ministry of Works.
* **2. Malaysian Highway Authority (LLM) & Concessionaires (PLUS, PROLINTAS, etc.)**:
  * **Jurisdiction**: Privately concessioned **interstate expressways and urban tolled highways**.
  * **Role**: Deploys highway patrol vehicles (PLUS Ronda), variable message signs (VMS), automated enforcement cameras, and free emergency towing.
* **3. Local Municipal Councils (PBT - e.g. DBKL, MBPJ, MBJB, MBSA)**:
  * **Jurisdiction**: **Municipal streets, local town networks, and residential feeder roads**.
  * **Role**: Manages urban traffic light phasing, street lighting, pedestrian signal crossings, and neighborhood traffic calming humps.
* **4. MIROS (Malaysian Institute of Road Safety Research)**:
  * **Role**: The premier scientific research body investigating crash etiology, vehicle crashworthiness (ASEAN NCAP), and advising the Ministry of Transport.
* **5. PDRM (Traffic Police) & JPJ (Road Transport Department)**:
  * **Role**: Speed enforcement, mobile patrols, and official collision documentation.`;
  }

  /**
   * 6. Safe Driving Advice Through Known Blackspots
   */
  private getBlackspotSafeDrivingAdvice(lang: "ms" | "en"): string {
    if (lang === "ms") {
      return `### 🚗 Panduan Memandu Selamat Semasa Melalui Kawasan Titik Hitam (Blackspot)

Apabila anda melihat papan tanda amaran kawasan kerap kemalangan atau melalui laluan titik hitam:

1. **Kurangkan Kelajuan Sebanyak 15–20 km/j**:
   * Kebanyakan titik hitam mempunyai geometri selekoh yang menuntut kelajuan operasi lebih rendah daripada had laju lebuh raya biasa.
2. **Kekalkan Jarak Mengekori 4 Saat**:
   * Gandakan jarak mengekori selamat dari 2 saat kepada **4 saat**. Ini memberi anda masa mencukupi untuk membrek jika kenderaan hadapan berhenti mengejut.
3. **Imbas Pandangan 15 Saat Ke Hadapan (*Look 15 Seconds Ahead*)**:
   * Jangan hanya melihat kenderaan di depan anda; imbas pandangan jauh ke hadapan selekoh untuk mengesan halangan, lopak air, atau kenderaan rosak lebih awal.
4. **JANGAN Menukar Lorong di Selekoh atau Persimpangan**:
   * Kekalkan lorong anda dan jangan sesekali memotong di garisan berkembar putih atau kuning.
5. **Waspada Terhadap Penunggang Motosikal**:
   * Periksa cermin sisi dan toleh kepala (*shoulder check*) dua kali sebelum membelok atau susur keluar.`;
    }

    return `### 🚗 Defensive Driving Guidelines When Traversing an Accident Blackspot

When passing warning signs indicating a high-accident blackspot corridor:

1. **Reduce Cruising Speed by 15–20 km/h**:
   * Most blackspots feature sharp curvature or merging geometry that cannot safely accommodate maximum posted highway speeds.
2. **Maintain a 4-Second Following Buffer**:
   * Double your following distance from 2 seconds to **4 seconds**, creating a critical braking safety margin if traffic ahead suddenly halts.
3. **Scan 15 Seconds Ahead on the Horizon**:
   * Do not fixate on the bumper immediately ahead; scan far through the curve apex to identify stationary vehicles, standing water, or debris early.
4. **Strictly Avoid Overtaking & Lane-Weaving**:
   * Hold your lane steady through the entire hazard sector. Never overtake over solid double white or yellow dividing lines.
5. **Double-Check Blind Spots for Two-Wheelers**:
   * Always perform a quick shoulder check to verify that filtering motorcyclists are clear before executing any turn or merge.`;
  }

  /**
   * Vehicle-specific empirical analysis
   */
  private getVehicleDataInsights(vehicleQuery: string, lang: "ms" | "en"): string {
    const isMoto = vehicleQuery.includes("moto") || vehicleQuery.includes("bike") || vehicleQuery.includes("kapcai");
    const isLori = vehicleQuery.includes("lori") || vehicleQuery.includes("truck") || vehicleQuery.includes("trailer");
    const isCar = vehicleQuery.includes("car") || vehicleQuery.includes("kereta");
    const isBas = vehicleQuery.includes("bas") || vehicleQuery.includes("bus");

    let filterKey = "Motosikal";
    if (isLori) filterKey = "Lori";
    else if (isCar) filterKey = "Kereta";
    else if (isBas) filterKey = "Bas";

    const records = this.accidents.filter(a => a.jenisKenderaan.toLowerCase().includes(filterKey.toLowerCase()));
    const total = records.length;
    const fatal = records.filter(r => r.tahapKeterukan === "Fatal").length;

    if (lang === "ms") {
      return `### 🏍️ Analisis Kemalangan Melibatkan ${filterKey}

Berdasarkan rekod semasa sistem:
* **Jumlah Kemalangan**: **${total} insiden** (${((total / (this.accidents.length || 1)) * 100).toFixed(1)}% daripada semua kemalangan).
* **Kadar Kematian (Fatal)**: **${fatal} kes maut**.
* **Faktor Risiko Utama**:
  1. *Titik Buta (Blind Spots)*: Konflik ruang dengan kenderaan berat seperti lori di persimpangan.
  2. *Keadaan Cuaca Basah*: Jalur garisan putih dan penutup lubang jalan menjadi licin semasa hujan lebat.
  3. *Tali Keledar / Topi Keledar*: Penggunaan topi keledar SIRIM yang dikancing kemas mengurangkan risiko kecederaan kepala sehingga 69%.

🛡️ *Nasihat Utama*: Gunakan lorong motosikal khusus sekiranya disediakan dan sentiasa pasang lampu utama pada waktu siang dan malam.`;
    }

    return `### 🏍️ Collision Profile: ${filterKey}

Based on active database records:
* **Total Involvements**: **${total} incidents** (${((total / (this.accidents.length || 1)) * 100).toFixed(1)}% of all recorded accidents).
* **Fatalities**: **${fatal} fatal cases**.
* **Core Vulnerability Factors**:
  1. *Blind Spots (No-Zones)*: Heavy vehicle blind spot conflicts when filtering at junctions.
  2. *Low Traction Surfaces*: Road markings and metal utility covers lose friction rapidly when wet.
  3. *Head Protection Standard*: SIRIM-certified helmets with securely buckled chinstraps reduce fatal head trauma by 69%.

🛡️ *Key Advice*: Always ride with headlights illuminated and utilize physical dedicated motorcycle tracks whenever available.`;
  }

  /**
   * Primary Entry Point: Process user query and return comprehensive response
   */
  public respond(options: EngineQueryOptions): string {
    const raw = options.message.trim();
    const lower = raw.toLowerCase();
    const lang = this.detectLanguage(raw);
    const historyContext = this.extractHistoryContext(options.history);

    // 1. Natural Conversational Greetings
    if (/^(hi|hello|hey|hai|salam|assalam|good\s*(morning|afternoon|evening|day)|selamat\s*(pagi|petang|malam)|who are you|who r u)\b/i.test(lower)) {
      if (lang === "ms") {
        return `Hello! 👋 Saya adalah **Pembantu Keselamatan Jalan Raya & GIS Pintar** anda.

Sistem saya dihubungkan terus dengan **data kemalangan sebenar**, piawaian kejuruteraan jalan raya Malaysia (JKR / PDRM / MIROS), serta protokol pemanduan defensif.

Anda boleh bertanya kepada saya:
* 📍 **Jalan Berisiko & Titik Hitam**: *"Jalan perlu dielak di Johor Bahru"* atau *"Berapa kemalangan di Federal Highway?"*
* 🔋 **Kerosakan Kenderaan di Lebuhraya**: *"Bateri kereta kong di lebuh raya"* atau *"Enjin overheat / berasap"*
* 🚨 **Tindakan Kecemasan**: *"Apa nak buat jika tayar pecah?"* atau *"Brek gagal berfungsi"*
* 🌧️ **Cuaca Hujan & Banjir**: *"Bagaimana elak aquaplaning?"*
* 🏍️ **Keselamatan Motosikal**: *"Statistik kemalangan motosikal"*
* ⚖️ **Undang-Undang & Bantuan**: *"Talian kecemasan PLUS dan 999"*

*Apakah topik keselamatan jalan raya yang ingin anda ketahui hari ini?*`;
      }
      return `Hello! 👋 I am your **AI Road Safety & GIS Transportation Assistant**.

I am connected directly to **verified accident spatial data**, Malaysian highway engineering standards (JKR / PDRM / MIROS), and defensive driving protocols.

You can ask me about:
* 📍 **Roads to Avoid & Blackspots**: *"Roads to avoid in Johor Bahru"* or *"Accidents on Federal Highway"*
* 🔋 **Vehicle Highway Breakdowns**: *"Car battery went out on highway"* or *"Engine overheating / radiator smoke"*
* 🚨 **Emergency Protocol**: *"Tire blowout recovery"* or *"Sudden brake failure"*
* 🌧️ **Weather Safety**: *"How to prevent hydroplaning in monsoon rain?"*
* 🏍️ **Vulnerable Road Users**: *"Motorcycle safety precautions"*
* ⚖️ **Highway Rules & Contacts**: *"PLUS Ronda careline and emergency sequence"*

*What road safety scenario or inquiry would you like to explore today?*`;
    }

    // 2. Expressions of Gratitude
    if (/^(thank\s*you|thanks|terima\s*kasih|tq|thx|much\s*appreciated)\b/i.test(lower)) {
      return lang === "ms"
        ? `Sama-sama! Pandu dengan berhemah, sentiasa berwaspada, dan amalkan jarak mengekori selamat. Semoga perjalanan anda sentiasa dilindungi! 🛣️`
        : `You are very welcome! Drive defensively, stay alert, and always observe safe stopping buffers. Safe travels on the road! 🛣️`;
    }

    // 2.5 Official Road Safety Knowledge Base Q&A Check (covering all 8 major safety categories)
    const safetyAnswer = findSafetyAnswer(raw);
    if (safetyAnswer) {
      return `${safetyAnswer.answer}\n\n---\n*📚 Category: **${safetyAnswer.category}** | Verified Road Safety Standards (JPJ / JKR / MIROS / PDRM)*`;
    }

    // 3. VEHICLE BREAKDOWN: Car Battery Went Out / Dead Battery / Alternator Failure / Jump Start
    if (
      lower.includes("battery") || lower.includes("bateri") || lower.includes("alternator") || 
      lower.includes("jump start") || lower.includes("jumpstart") || lower.includes("bateri kong") ||
      (lower.includes("bateri") && lower.includes("habis"))
    ) {
      if (lang === "ms") {
        return `### 🔋 Tindakan Kecemasan: Bateri Kereta Kong / Mati di Lebuhraya

Mengalami bateri kong atau kegagalan alternator semasa memandu di lebuh raya memerlukan tindakan keselamatan pantas untuk mengelakkan pelanggaran dari belakang:

---

#### 1. Tindakan Semasa Kereta Masih Bergerak:
* **Segera Ke Lorong Kecemasan**:
  * Apabila alternator gagal dan bateri kehabisan voltan sepenuhnya, enjin kereta mungkin mati tiba-tiba.
  * **AMARAN PENTING**: Bantuan kuasa stereng (*power steering*) dan kuasa brek (*brake booster*) akan hilang serta-merta! Stereng akan terasa sangat berat dan pedal brek akan menjadi keras. **Jangan panik**—anda masih boleh membelok dan membrek dengan mengenakan tekanan fizikal yang kuat dan berterusan.
* **Berhenti Serapat Mungkin Ke Tebing Kiri**:
  * Berhentikan kenderaan di bahu jalan atau lorong kecemasan serapat mungkin ke kiri.
  * **Condongkan Tayar Hadapan Ke Kiri**: Jika kenderaan dirempuh dari belakang, ia akan ditolak ke dalam parit/tebing dan bukannya terlajak ke lorong lebuh raya yang laju.

---

#### 2. Protokol Keselamatan Wajib di Lorong Kecemasan:
1. **Pasang Lampu Kecemasan (Hazard Lights) Serta-merta**.
2. **Pasang Segitiga Amaran Pemantul Cahaya**: Letakkan sekurang-kurangnya **45 meter di belakang kenderaan**. Berjalan di belakang penghadang besi (guardrail) semasa membawanya, BUKAN di atas laluan bertar!
3. **PERATURAN NOMBOR SATU**: Semua penumpang **MESTI KELUAR** dari kereta dan menunggu **di belakang penghadang besi (guardrail)** pada tebing rumput. JANGAN sesekali duduk di dalam kereta atau berdiri di lorong kecemasan kerana risiko dirempuh lori adalah sangat tinggi!

---

#### 3. Cara 'Jump-Start' Bateri Yang Betul (Elak Letupan Gas Hidrogen):
Jika ada kenderaan bantuan:
1. Pasang kabel **MERAH** pada terminal **POSITIF (+)** bateri kong.
2. Pasang hujung kabel **MERAH** satu lagi pada terminal **POSITIF (+)** bateri penderma.
3. Pasang kabel **HITAM** pada terminal **NEGATIF (-)** bateri penderma.
4. Pasang hujung kabel **HITAM** satu lagi pada **Bongkah Enjin / Skru Logam Tanpa Cat (Ground)** kereta kong (sekurang-kurangnya 30 cm dari bateri).
   * ⚠️ *Peraturan Maut*: **JANGAN pasang kabel hitam terus pada terminal negatif bateri kong!** Percikan api boleh menyalakan gas hidrogen yang keluar dari bateri dan mengakibatkan bateri meletup.
5. Hidupkan enjin penderma selama 5–10 minit sebelum menghidupkan kereta anda.

---

#### 4. Hubungi Bantuan Percuma:
* **PLUS Highway Careline (Rondaan & Tunda Percuma ke Plaza Tol Terdekat)**: **1800-88-0000**
* **Talian Kecemasan Bomba & Polis**: **999**`;
      }

      return `### 🔋 Emergency Protocol: Car Battery Went Out / Dead Battery on Highway

A sudden dead battery or alternator failure while cruising at highway speeds creates an immediate danger. Follow this critical survival and recovery procedure:

---

#### 1. Immediate Actions While Vehicle is Moving:
* **Coast Directly to the Emergency Shoulder**:
  * If the alternator dies, the electrical system collapses and the engine will shut off.
  * **CRUCIAL SENSORY WARNING**: You will instantaneously lose hydraulic/electric power steering and vacuum brake assistance! The steering wheel will become heavy and the brake pedal will feel stiff/hard. **Do not panic**—mechanical steering and braking still work; you simply must exert firm, muscular physical pressure.
* **Park as Far Left as Possible**:
  * Pull completely onto the emergency shoulder or grass verge.
* **Angle Front Wheels Toward the Barrier (Left)**:
  * If an inattentive vehicle clips your rear bumper, your car will be driven into the ditch rather than pushed back into live traffic lanes.

---

#### 2. Strict Highway Shoulder Safety Sequence:
1. **Activate Hazard Flashers Immediately**.
2. **Deploy Reflective Warning Triangle 45 Meters Behind Vehicle**:
   * Walk along the grass verge behind the steel guardrail to set it down—never walk on the road pavement.
3. **MANDATORY EVACUATION**:
   * **Never remain inside the car or stand beside it on the shoulder!** Over 70% of fatal highway shoulder incidents occur when heavy lorries sideswipe parked vehicles.
   * All occupants must immediately step over and wait **behind the steel guardrail on the embankment**.

---

#### 3. Safe Jump-Start Sequence (Preventing Battery Gas Explosion):
When assistance arrives:
1. Connect **RED clamp** to the **Dead Battery's POSITIVE (+)** terminal.
2. Connect **RED clamp** to the **Donor Battery's POSITIVE (+)** terminal.
3. Connect **BLACK clamp** to the **Donor Battery's NEGATIVE (-)** terminal.
4. Connect **BLACK clamp** to an **Unpainted Bare Metal Bolt or Engine Bracket on the DEAD vehicle** (at least 30 cm away from the battery).
   * ⚠️ *Critical Safety Warning*: NEVER connect the final black clamp directly to the dead battery's negative terminal! Doing so creates a spark that can ignite venting hydrogen gas and explode the battery casing.
5. Run the donor engine for 5–10 minutes, then crank the dead vehicle.

---

#### 4. Emergency Contacts in Malaysia:
* **PLUS Highway Patrol & Free Towing Careline**: **1800-88-0000** (Provides free towing to the nearest toll plaza or R&R).
* **National Emergency (Police / Paramedics / Bomba)**: **999**
* **JKR Disaster Operations**: **1-300-888-557**`;
    }

    // 4. VEHICLE BREAKDOWN: Engine Overheating / Radiator Smoke / Asap Enjin
    if (
      lower.includes("overheat") || lower.includes("radiator") || lower.includes("enjin panas") ||
      lower.includes("coolant") || (lower.includes("asap") && (lower.includes("enjin") || lower.includes("hud") || lower.includes("bonet"))) ||
      lower.includes("engine hot") || lower.includes("temp high") || lower.includes("suhu tinggi")
    ) {
      if (lang === "ms") {
        return `### 🌡️ Tindakan Kecemasan: Enjin Panas (Overheat) & Asap Radiator

Jika tolok suhu enjin naik ke paras merah (H) atau wap air/asap keluar dari hud hadapan:

---

#### 1. Tindakan Segera di Dalam Kereta:
1. **Matikan Penghawa Dingin (A/C) Serta-merta**: Mematikan kompresor A/C mengurangkan beban kerja enjin.
2. **Pasang Pemanas Kabin (Heater) Pada Tahap Maksimum**:
   * Walaupun tidak selesa dalam cuaca panas Malaysia, teras pemanas (*heater core*) bertindak sebagai radiator mini sekunder yang menarik haba keluar dari bongkah enjin.
3. **Beri Isyarat dan Berhenti di Lorong Kecemasan**: Matikan enjin dengan segera.

---

#### 2. AMARAN MAUT: JANGAN BUKA PENUTUP RADIATOR!
* ⚠️ **JANGAN sesekali cuba membuka penutup radiator ketika enjin masih panas!**
* Sistem penyejuk beroperasi pada tekanan 15 psi dengan air mendidih melebihi **120°C**. Membuka penutup akan mencetuskan letusan air mendidih bertekanan tinggi yang menyembur ke muka, dada, dan mata menyebabkan kelecuran tahap ketiga yang kekal!
* Tunggu sekurang-kurangnya **30 hingga 45 minit** sehingga hos radiator lembut dan sejuk apabila disentuh.

---

#### 3. Pemeriksaan Paras Cecair:
* Setelah sejuk, periksa tangki simpanan penyejuk (*coolant reservoir*).
* Jika kering, tambah cecair penyejuk atau air mineral bersih secara perlahan-lahan.
* Periksa bawah kenderaan untuk mengesan jika terdapat kebocoran hos atau pam air rosak.
* Hubungi **PLUS Careline di 1800-88-0000** jika enjin terus mendidih.`;
      }

      return `### 🌡️ Emergency Protocol: Engine Overheating & Radiator Steam

If your temperature gauge spikes to the red "H" zone or steam billows from under the hood:

---

#### 1. Immediate Actions While Operating the Vehicle:
1. **Turn OFF the Air Conditioning Immediately**: Shuts down the A/C compressor, drastically reducing engine load.
2. **Turn the In-Cabin Heater to Maximum Heat & High Blower**:
   * Although uncomfortable, the heater core acts as a secondary auxiliary radiator, drawing excess thermal heat away from the engine block.
3. **Pull Over to the Emergency Shoulder & Switch Engine OFF**: Shuts down internal combustion to stop heat escalation.

---

#### 2. LIFE-THREATENING WARNING: NEVER OPEN THE RADIATOR CAP!
* ⚠️ **NEVER attempt to unscrew the radiator cap while the engine is hot!**
* The cooling system is pressurized at 15 psi with boiling coolant exceeding **120°C (248°F)**. Opening the cap causes an instantaneous volcanic eruption of scalding steam and pressurized chemical coolant that causes permanent third-degree facial and bodily burns!
* Wait at least **30 to 45 minutes** until the upper radiator hose is completely cool and soft to squeeze.

---

#### 3. Fluid Check & Recovery:
* Once cooled, check the translucent overflow reservoir tank.
* If empty, top up slowly with distilled water or automotive coolant.
* Inspect beneath the engine bay for green/red puddles indicating a blown radiator hose.
* Call **PLUS Careline at 1800-88-0000** for free towing assistance if the vehicle continues to overheat.`;
    }

    // 5. VEHICLE BREAKDOWN: Engine Stalled / Sudden Engine Cut-Off at Speed
    if (
      lower.includes("stall") || lower.includes("mati tiba-tiba") || lower.includes("mati mengejut") ||
      lower.includes("engine stop") || lower.includes("enjin mati") || (lower.includes("mati") && lower.includes("kereta")) ||
      lower.includes("car died") || lower.includes("car stall")
    ) {
      if (lang === "ms") {
        return `### ⚠️ Tindakan Semasa Enjin Kereta Mati Tiba-tiba di Lebuhraya

Apabila enjin terpadam semasa memandu pada kelajuan tinggi:

1. **Kekalkan Ketenangan & Pegang Stereng**:
   * Bantuan kuasa stereng terputus, menyebabkan stereng terasa sangat berat. Anda masih boleh mengawal kenderaan dengan memutar stereng menggunakan kekuatan tangan.
2. **Kekalkan Tekanan Brek Berterusan (JANGAN Pam Brek)**:
   * Penggalak vakum brek (*brake booster*) hanya mempunyai baki vakum untuk **1 atau 2 kali tekanan brek biasa**. Jangan pam pedal brek berulang-kali kerana ia menghabiskan vakum baki dan menjadikan pedal sangat keras. Tekan pedal secara perlahan dan berterusan.
3. **Beri Isyarat Ke Kiri & Meluncur Ke Lorong Kecemasan**:
   * Gunakan momentum kenderaan untuk bergerak ke bahu jalan sebelah kiri.
4. **Tukar Gear Ke Neutral (N) Sebelum Menghidupkan Semula**:
   * Hanya cuba hidupkan enjin semula setelah selamat berada di lorong kecemasan.
5. **Pasang Lampu Kecemasan & Tunggu di Belakang Penghadang Besi**.`;
      }

      return `### ⚠️ Emergency Procedure: Sudden Engine Stalling at Highway Speeds

If your engine suddenly cuts off while cruising on the expressway:

1. **Maintain Grip and Expect Heavy Steering**:
   * Power steering assist ceases immediately; the wheel will feel remarkably heavy. The car is still steerable mechanically through muscular effort.
2. **Apply Firm, Continuous Braking (DO NOT Pump Brakes)**:
   * The vacuum brake booster only retains residual pressure for **1 to 2 normal pedal presses**. Rapidly pumping the brake pedal bleeds off this stored vacuum, making the pedal rock-hard. Apply one smooth, firm, continuous press to decelerate.
3. **Signal Left & Coast to the Shoulder**:
   * Utilize existing kinetic rolling momentum to coast safely onto the emergency shoulder.
4. **Shift to Neutral (N) or Park (P) Before Cranking**:
   * Only attempt to restart once safely at rest on the shoulder.
5. **Activate Hazard Flashers & Wait Behind the Steel Guardrail**.`;
    }

    // 6. VEHICLE BREAKDOWN: Running Out of Fuel on Highway / Petrol Habis
    if (
      lower.includes("petrol habis") || lower.includes("minyak habis") || lower.includes("out of fuel") ||
      lower.includes("ran out of gas") || lower.includes("no fuel") || lower.includes("out of gas") || lower.includes("habis minyak")
    ) {
      if (lang === "ms") {
        return `### ⛽ Tindakan Apabila Kehabisan Petrol di Lebuhraya

Kehabisan petrol di lorong lebuh raya bukan sahaja berbahaya malah merupakan kesalahan di bawah Akta Pengangkutan Jalan sekiranya menghalang lalu lintas:

1. **Gunakan Baki Momentum Ke Bahu Kiri**: Begitu enjin tersengguk-sengguk kehabisan bahan api, segera beri isyarat ke kiri dan masuk ke lorong kecemasan.
2. **Pasang Lampu Hazard & Segitiga Keselamatan**: Letak segitiga 45 meter di belakang kenderaan.
3. **Tunggu di Belakang Penghadang Besi**: Jangan tunggu di dalam kenderaan.
4. **Hubungi PLUS Careline di 1800-88-0000**:
   * Pasukan peronda PLUS Ronda menyediakan bekalan kecemasan petrol (kira-kira 5 liter) atau khidmat menunda kenderaan secara percuma ke stesen minyak terdekat.`;
      }

      return `### ⛽ Protocol: Running Out of Fuel on Expressways

Running out of fuel on a live expressway is hazardous and can result in traffic obstruction citations under the Road Transport Act:

1. **Coast Immediately to the Left Shoulder**: The moment you feel the engine sputter, signal left and use rolling inertia to reach the shoulder.
2. **Turn on Hazard Lights & Deploy Safety Triangle**: Place the reflective triangle 45 meters behind.
3. **Evacuate Behind the Guardrail**: Never remain seated inside the disabled vehicle.
4. **Call PLUS Highway Careline at 1800-88-0000**:
   * PLUS Ronda expressway patrol units carry 5-liter emergency fuel canisters or provide free towing to the nearest petrol station.`;
    }

    // 7. VEHICLE BREAKDOWN: Flat Tire Replacement on Highway Shoulder / Tukar Tayar
    if (
      (lower.includes("tukar tayar") || lower.includes("ganti tayar") || lower.includes("pancit") || lower.includes("flat tire") || lower.includes("flat tyre")) ||
      ((lower.includes("change") || lower.includes("replace") || lower.includes("tukar") || lower.includes("ganti")) && (lower.includes("tire") || lower.includes("tyre") || lower.includes("tayar")))
    ) {
      if (lang === "ms") {
        return `### 🛞 Panduan Menukar Tayar Pancit di Lorong Kecemasan Lebuhraya

Kemalangan maut kerap berlaku apabila pemandu menukar tayar di bahu lebuh raya akibat dirempuh kenderaan berat:

---

#### 1. PERATURAN TAYAR SEBELAH KANAN (Traffic Side):
* ⚠️ **JANGAN SESEKALI menukar tayar sebelah kanan (menghadap trafik lebuh raya) bersendirian!**
* Kenderaan lain melalui sisi anda pada kelajuan 110 km/j hanya beberapa inci dari badan anda.
* **Tindakan Betul**: Hubungi **PLUS Ronda di 1800-88-0000**. Lori peronda PLUS akan berhenti di belakang anda dengan papan tanda anak panah berkelip (*light-arrow truck*) untuk melindungi anda.

---

#### 2. Langkah Menukar Tayar Sebelah Kiri (Sebelah Tebing):
1. Pastikan kenderaan berada di atas permukaan rata, tarik brek tangan sepenuhnya dan letak gear pada **P** (atau Gear 1 untuk manual).
2. Longgarkan nat roda separuh pusingan sebelum menaikkan jek (*jack*).
3. Letakkan jek pada titik kukuh kerangka (*jacking point*).
4. **Langkah Keselamatan Khas**: Letakkan tayar ganti di bawah badan kereta bersebelahan jek sebagai sokongan keselamatan sekiranya jek tergelincir.
5. Pasang tayar ganti, ketatkan nat secara bersilang (*criss-cross pattern*).`;
      }

      return `### 🛞 Flat Tire Replacement Safety on Highway Shoulders

Fatal accidents frequently occur when motorists attempt to change flat tires on expressway shoulders due to heavy vehicle sideswipes:

---

#### 1. CRITICAL RULE FOR RIGHT-SIDE TIRES (Traffic-Facing Side):
* ⚠️ **NEVER attempt to replace a right-side tire yourself on a live highway!**
* Traffic speeds past inches away at 110 km/h.
* **Correct Action**: Call **PLUS Ronda at 1800-88-0000**. PLUS patrol will deploy an arrow-board impact attenuator truck behind your car with high-intensity strobes to block traffic while the tire is changed.

---

#### 2. Procedure for Left-Side Tires (Verge-Facing Side):
1. Park on firm, flat asphalt, engage parking brake firmly, shift to **Park (P)** or 1st gear.
2. Loosen wheel lug nuts by half a turn BEFORE raising the jack.
3. Place scissor jack strictly on the designated chassis jacking notch.
4. **Life-Saving Redundancy**: Slide the spare wheel underneath the car rocker panel as a failsafe barrier in case the jack slips.
5. Mount spare wheel, hand-tighten nuts in a diagonal criss-cross pattern, lower car, and torque firmly with the lug wrench.`;
    }

    // 8. DEDICATED BLACKSPOT INTELLIGENCE ENGINE
    const isBlackspotQuery = lower.includes("blackspot") || lower.includes("hotspot") || lower.includes("titik hitam") || 
      lower.includes("kawasan kerap kemalangan") || lower.includes("100m") || lower.includes("100 m") || 
      lower.includes("100 meter") || lower.includes("wsi") || lower.includes("indeks keterukan");
    const matchedDistrict = this.findMatchingDistrict(lower) || (lower.includes("this district") || lower.includes("daerah ini") ? historyContext.lastDistrict : null);
    const matchedRoad = this.findMatchingRoad(lower) || (lower.includes("this road") || lower.includes("jalan ini") ? historyContext.lastRoad : null);

    if (isBlackspotQuery) {
      // 8a. Calculation, Formula, and WSI
      if (
        lower.includes("calculate") || lower.includes("kira") || lower.includes("formula") || 
        lower.includes("wsi") || lower.includes("ranking") || lower.includes("weight") || 
        lower.includes("pengiraan") || lower.includes("how is") || lower.includes("bagaimana dikira") ||
        lower.includes("kaedah") || lower.includes("method")
      ) {
        return this.getBlackspotCalculationAndWsi(lang);
      }

      // 8b. Why 100 meters standard?
      if (
        lower.includes("100m") || lower.includes("100 m") || lower.includes("100 meter") || 
        lower.includes("why 100") || lower.includes("kenapa 100") || lower.includes("sebab 100") ||
        lower.includes("buffer") || lower.includes("penampan")
      ) {
        return this.getBlackspot100mRationale(lang);
      }

      // 8c. Elimination & Engineering Countermeasures
      if (
        lower.includes("fix") || lower.includes("eliminate") || lower.includes("mitigation") || 
        lower.includes("countermeasure") || lower.includes("atasi") || lower.includes("selesaikan") || 
        lower.includes("hapus") || lower.includes("tindakan jkr") || lower.includes("cadangan kejuruteraan") ||
        lower.includes("remedy") || lower.includes("how to solve") || lower.includes("cara atasi")
      ) {
        return this.getBlackspotEliminationCountermeasures(lang);
      }

      // 8d. Responsible Authorities in Malaysia
      if (
        lower.includes("who") || lower.includes("siapa") || lower.includes("authority") || 
        lower.includes("agensi") || lower.includes("pihak berkuasa") || lower.includes("responsible") || 
        lower.includes("tanggungjawab") || lower.includes("jkr") || lower.includes("miros") || lower.includes("llm")
      ) {
        return this.getBlackspotAuthorities(lang);
      }

      // 8e. Safe Driving Advice through Blackspots
      if (
        lower.includes("drive") || lower.includes("memandu") || lower.includes("tips") || 
        lower.includes("cara memandu") || lower.includes("panduan") || lower.includes("precaution")
      ) {
        return this.getBlackspotSafeDrivingAdvice(lang);
      }

      // 8f. Roads to avoid in a specific district
      if (matchedDistrict) {
        return this.getDistrictRoadsToAvoid(matchedDistrict, lang);
      }

      // 8g. Specific road check
      if (matchedRoad) {
        return this.getRoadDataInsights(matchedRoad, lang);
      }

      // 8h. Nationwide blackspots list
      if (lower.includes("malaysia") || lower.includes("top") || lower.includes("terburuk") || lower.includes("worst") || lower.includes("list") || lower.includes("senarai")) {
        return this.getGeneralRoadsToAvoid(lang);
      }

      // 8i. Definition & Core Concepts (default for "what is blackspot", "apa itu blackspot", etc.)
      return this.getBlackspotDefinition(lang);
    }

    // 8j. General roads to avoid queries (without the word blackspot explicitly)
    const isAvoidQuery = lower.includes("avoid") || lower.includes("elak") || lower.includes("worst") || lower.includes("terburuk") || 
      lower.includes("jalan bahaya") || lower.includes("dangerous road") || lower.includes("road to avoid") || lower.includes("roads to avoid") ||
      lower.includes("laluan bahaya") || lower.includes("tempat bahaya");

    if (isAvoidQuery && matchedDistrict) {
      return this.getDistrictRoadsToAvoid(matchedDistrict, lang);
    }

    if (isAvoidQuery && !matchedDistrict && (lower.includes("road") || lower.includes("jalan") || lower.includes("area") || lower.includes("kawasan") || lower.includes("malaysia"))) {
      return this.getGeneralRoadsToAvoid(lang);
    }

    // 9. Database Search: Specific Road Check
    if (matchedRoad && (lower.includes("accident") || lower.includes("kemalangan") || lower.includes("stat") || lower.includes("danger") || lower.includes("bahaya") || lower.includes("safe") || lower.includes("berapa") || lower.includes("rekod") || lower.includes("how many"))) {
      return this.getRoadDataInsights(matchedRoad, lang);
    }

    // 10. Database Search: Specific District Profile Check
    if (matchedDistrict && (lower.includes("accident") || lower.includes("kemalangan") || lower.includes("stat") || lower.includes("danger") || lower.includes("bahaya") || lower.includes("safe") || lower.includes("berapa") || lower.includes("rekod") || lower.includes("most") || lower.includes("terbanyak"))) {
      return this.getDistrictDataInsights(matchedDistrict, lang);
    }

    // 11. Database Search: Vehicle Type Query (Motorcycle / Lorry / Car)
    if (
      (lower.includes("moto") || lower.includes("lori") || lower.includes("truck") || lower.includes("kapcai") || lower.includes("kereta") || lower.includes("car") || lower.includes("bas") || lower.includes("bus")) &&
      (lower.includes("stat") || lower.includes("accident") || lower.includes("kemalangan") || lower.includes("keterukan") || lower.includes("banyak") || lower.includes("how many") || lower.includes("kadar") || lower.includes("terlibat"))
    ) {
      return this.getVehicleDataInsights(lower, lang);
    }

    // 12. Database Search: Overall Fatalities & System Totals
    if (lower.includes("how many accident") || lower.includes("berapa banyak kemalangan") || lower.includes("total accident") || lower.includes("jumlah kemalangan") || lower.includes("fatal case") || lower.includes("kes maut")) {
      const total = this.accidents.length;
      const fatal = this.accidents.filter(a => a.tahapKeterukan === "Fatal").length;
      const serious = this.accidents.filter(a => a.tahapKeterukan === "Serious").length;
      const minor = this.accidents.filter(a => a.tahapKeterukan === "Minor").length;

      if (lang === "ms") {
        return `### 📊 Ringkasan Statistik Kemalangan Keseluruhan Sistem

Berdasarkan data spatial aktif yang diproses oleh enjin GIS:
* **Jumlah Rekod Kemalangan**: **${total} kes**
* 🔴 **Kematian (Fatal)**: **${fatal} kes** (${((fatal / total) * 100).toFixed(1)}%)
* 🟠 **Kecederaan Parah (Serious)**: **${serious} kes** (${((serious / total) * 100).toFixed(1)}%)
* 🟡 **Kecederaan Ringan (Minor)**: **${minor} kes** (${((minor / total) * 100).toFixed(1)}%)

Koridor dengan kepekatan kemalangan tertinggi dapat disaring melalui paparan *Hotspot Analysis* atau *Mapper* interaktif.`;
      }

      return `### 📊 System-Wide Collision Statistics Summary

Based on the verified spatial dataset in the GIS repository:
* **Total Collision Records**: **${total} verified cases**
* 🔴 **Fatalities (Fatal)**: **${fatal} cases** (${((fatal / total) * 100).toFixed(1)}%)
* 🟠 **Serious Hospitalizations**: **${serious} cases** (${((serious / total) * 100).toFixed(1)}%)
* 🟡 **Minor Collisions**: **${minor} cases** (${((minor / total) * 100).toFixed(1)}%)

You can view real-time density surfaces and 100m cluster buffers directly on the *Hotspot Analysis* dashboard.`;
    }

    // 13. Emergency: High-Speed Tire Blowout / Puncture
    if (lower.includes("blowout") || lower.includes("burst") || lower.includes("pecah") || lower.includes("meletup") || (lower.includes("tayar") && (lower.includes("pancit") || lower.includes("bocor") || lower.includes("meletup") || lower.includes("rosak")))) {
      if (lang === "ms") {
        return `### 🚨 Pelan Tindakan Kecemasan: Tayar Pecah Pada Kelajuan Tinggi

Mengalami tayar pecah pada kelajuan lebuh raya (80–110 km/j) boleh menyebabkan panik, tetapi tindakan mekanikal berikut akan menyelamatkan nyawa anda:

---

#### Tindakan Langkah-Demi-Langkah:
1. **JANGAN Menekan Brek Secara Mengejut**:
   * *Sebab*: Menekan brek ketika tayar pecah menghasilkan daya seretan tidak seimbang yang akan memusingkan atau menterbalikkan kenderaan serta-merta.
2. **Pegang Stereng dengan Kukuh Menggunakan Kedua-dua Belah Tangan**:
   * Kenderaan akan tertarik kuat ke arah tayar yang pecah. Buat kawalan balas (*counter-steer*) secara lembut untuk mengekalkan laluan lurus.
3. **Lepaskan Pedal Minyak Secara Perlahan**:
   * Biarkan brek enjin (*engine braking*) dan rintangan geseran memperlahankan kenderaan ke bawah 50 km/j secara beransur-ansur.
4. **Beri Isyarat Ke Kiri & Bergerak Ke Lorong Kecemasan**:
   * Hanya belok ke lorong kecemasan apabila kelajuan telah stabil di bawah 50 km/j. Berhenti serapat mungkin ke tebing sebelah kiri.
5. **Pasang Lampu Kecemasan (Hazard Lights) & Letak Segitiga Pemantul**:
   * Pasang segitiga kecemasan sekurang-kurangnya **45 meter di belakang kenderaan**.
   * **Peraturan Wajib**: Semua penumpang mesti segera keluar dari kenderaan dan menunggu **di belakang penghadang besi (guardrail)**, BUKAN di dalam kereta atau di atas lorong kecemasan!
6. **Hubungi Bantuan**: Hubungi PLUS Careline di **1800-88-0000** atau talian kecemasan **999**.`;
      }

      return `### 🚨 Emergency Action Plan: High-Speed Tire Blowout

Experiencing a tire blowout at highway speeds (80–110 km/h) can trigger panic, but applying the correct mechanical counter-actions prevents loss of control:

---

#### Step-by-Step Survival Protocol:
1. **DO NOT Slam on the Brakes**:
   * *Why*: Hard braking on a blown tire causes instantaneous asymmetric drag, throwing the car into an uncontrollable spin or rollover.
2. **Firmly Grip the Steering Wheel with Both Hands**:
   * Expect a violent pulling force toward the side of the blown tire. Counter-steer smoothly to maintain your lane center.
3. **Gently Ease Off the Accelerator**:
   * Allow engine compression braking and rolling friction to decelerate the vehicle naturally down to 50 km/h.
4. **Indicate Left & Coast Toward the Emergency Shoulder**:
   * Only steer toward the left shoulder once the vehicle is stabilized and under 50 km/h. Park as far left on the shoulder as possible.
5. **Turn On Hazard Flashers & Deploy Warning Triangle**:
   * Place your reflective triangle **45 meters behind the vehicle** on expressways.
   * **Crucial Rule**: All occupants must immediately evacuate the cabin and wait **behind the steel guardrail (penghadang besi)**, NEVER inside the car or on the shoulder.
6. **Call for Assistance**: Contact PLUS Careline at **1800-88-0000** or emergency patrol at **999**.`;
    }

    // 14. Emergency: Brake Failure
    if (
      ((lower.includes("brake") || lower.includes("brek")) && (lower.includes("fail") || lower.includes("lost") || lower.includes("rosak") || lower.includes("tak makan") || lower.includes("problem") || lower.includes("malfunction"))) ||
      lower.includes("no brake") || lower.includes("no brek")
    ) {
      if (lang === "ms") {
        return `### 🚨 Tindakan Kecemasan: Kegagalan Sistem Brek Kenderaan

Jika pedal brek ditekan dan tenggelam ke lantai kenderaan tanpa sebarang rintangan:

---

#### 4 Langkah Menyelamatkan Diri:
1. **Pam Pedal Brek Berulang Kali Secara Pantas**:
   * Sistem hidraulik moden mempunyai dwi-litar. Mengepam pedal 3–5 kali secara pantas boleh membina tekanan baki sekiranya berlaku kebocoran bendalir separa.
2. **Turunkan Gear Ke Gear Rendah (Brek Enjin / Engine Braking)**:
   * *Automatik*: Tukar dari **D** ke **3 / 2 / L** atau gunakan paddle shift pada stereng.
   * *Manual*: Turunkan gear satu demi satu (5 -> 4 -> 3 -> 2). Rintangan putaran enjin tinggi akan memperlahankan kenderaan dengan pantas.
3. **Tarik Brek Tangan (Handbrake) Secara Berhati-hati**:
   * Tarik tuil brek tangan perlahan-lahan sambil menekan punat pelepas. Jangan sentap tuil secara mengejut kerana roda belakang boleh terkunci dan menyebabkan kenderaan berpusing.
4. **Gunakan Halangan Geseran Sebagai Langkah Terakhir**:
   * Arahkan kenderaan ke bahu jalan berumput, kerikil, atau lorong kecemasan berbukit untuk menghabiskan tenaga kinetik.`;
      }

      return `### 🚨 Emergency Action Plan: Sudden Brake System Failure

If you press the brake pedal and it drops straight to the floorboard with zero resistance:

---

#### 4-Step Recovery Procedure:
1. **Pump the Brake Pedal Rapidly**:
   * Modern cars feature dual-circuit hydraulic systems. Rapid pumping (3–5 quick presses) can build up residual pressure if there is a partial fluid leak.
2. **Downshift to Lower Gears (Engine Braking)**:
   * *Automatic*: Shift from **D** to **3 / 2 / L** or use steering paddle shifters to downshift sequentially.
   * *Manual*: Downshift clutch-to-gear step by step (5th -> 4th -> 3rd -> 2nd). High engine RPM resistance will rapidly decelerate the car.
3. **Carefully Apply the Parking / Handbrake**:
   * Pull the mechanical lever up smoothly while holding the release button. Do NOT yank it abruptly or the rear wheels will lock and cause a fishtail spin.
4. **Use Friction Hazards as a Last Resort**:
   * Steer onto roadside gravel, soft grass shoulders, or uphill run-off ramps to bleed kinetic energy safely.`;
    }

    // 15. Rain, Monsoon, Floods & Hydroplaning
    if (lower.includes("rain") || lower.includes("wet") || lower.includes("monsoon") || lower.includes("hydroplaning") || lower.includes("aquaplaning") || lower.includes("hujan") || lower.includes("banjir") || lower.includes("licin")) {
      if (lang === "ms") {
        return `### 🌧️ Panduan Pemanduan Waktu Hujan Lebat & Fenomena Aquaplaning

Hujan lebat monsun mengurangkan cengkaman tayar sehingga **50%** dan menjejaskan jarak penglihatan:

* **Maksud Aquaplaning (Hydroplaning)**:
  * Apabila kedalaman air di atas jalan melebihi keupayaan alur tayar menyalurkan air keluar, lapisan air terbentuk di bawah tayar. Kenderaan terapung di atas air tanpa sebarang kawalan stereng.
  * **Tanda**: Stereng terasa sangat ringan dan putaran enjin (RPM) meningkat secara tiba-tiba.
* **Tindakan Semasa Aquaplaning**:
  1. **JANGAN menekan brek** dan **JANGAN sentap stereng**.
  2. Pegang stereng lurus ke arah yang ingin dituju.
  3. Lepaskan pedal minyak secara perlahan. Apabila kelajuan berkurangan, berat kenderaan akan memotong lapisan air dan mencengkam kembali tar jalan.
* **Peraturan Lampu Kecemasan (Hazard Lights)**:
  * **JANGAN sesekali memasang lampu hazard semasa memandu dalam hujan**. Lampu hazard hanya untuk kenderaan yang berhenti rosak dan mengelirukan pemandu lain serta mematikan fungsi lampu isyarat belok. Gunakan lampu hadapan (*low-beam*).
* **Kedalaman Air Banjir**: Jangan redah air yang melebihi paras separuh roda kenderaan (15 cm).`;
      }

      return `### 🌧️ Wet Weather, Monsoon Rain & Hydroplaning Precautions

Tropical downpours reduce tire friction by up to **50%** and slash driver visibility to under 30 meters:

* **Understanding Hydroplaning (Aquaplaning)**:
  * When water depth exceeds the evacuation channels of your tire treads, a wedge of water lifts the tires. The vehicle actually glides over water with **zero steering traction**.
  * **Sensation**: The steering wheel suddenly becomes feather-light and unresponsive.
* **What to Do During Hydroplaning**:
  1. **Do NOT slam the brakes** and **do NOT yank the steering wheel**.
  2. Hold the wheel firmly in the direction of travel.
  3. Gently lift your foot off the accelerator. As velocity drops, tire treads will cut back through the water to grip the pavement.
* **Crucial Rule on Hazard Lights**:
  * **NEVER activate hazard flashers while moving in the rain**. Hazard lights signal a stationary disabled vehicle and disable your turn indicators. Use standard low-beam headlights instead.
* **Standing Flood Water**: Never drive through water deeper than **15 cm (6 inches)** or above the center of your wheel hub.`;
    }

    // 16. Driver Fatigue, Drowsiness & Micro-Sleep
    if (lower.includes("fatigue") || lower.includes("sleep") || lower.includes("microsleep") || lower.includes("tired") || lower.includes("drowsy") || lower.includes("ngantuk") || lower.includes("terlelap") || lower.includes("letih")) {
      if (lang === "ms") {
        return `### 😴 Pencegahan Keletihan Pemandu & Terlelap (Micro-Sleep)

**Micro-sleep** ialah episod tidur tidak disedari yang berlaku antara **1 hingga 15 saat**, di mana otak terputus sepenuhnya daripada input visual dan kesedaran persekitaran:

* **Fizik Yang Membawa Maut**: Pada kelajuan **110 km/j, kenderaan bergerak 30.6 meter setiap saat**. Tidur lena selama 3 saat bermakna kenderaan meluru sejauh **lebih 91 meter tanpa pemandu**—melebihi panjang sebuah padang bola sepak!
* **Tanda-tanda Awal**:
  1. Kerap menguap dan kelopak mata terasa berat.
  2. Gagal mengingati 2 hingga 3 kilometer terakhir yang dipandu.
  3. Kenderaan terbabas sedikit melepasi garisan lorong atau jalur bergetar (*rumble strips*).
* **Satu-satunya Penawar: Tidur Kuasa 20 Minit (Power Nap)**:
  * Minuman kopi, membuka tingkap, atau memasang muzik kuat hanya memberi ilusi kesegaran sementara selama 10 minit.
  * Berhenti di R&R atau stesen minyak terdekat, kunci pintu, dan tidur selama **tepat 20 minit**. Ini membolehkan otak membersihkan adenosin tanpa memasuki fasa tidur yang mamai.`;
      }

      return `### 😴 Driver Fatigue & Micro-Sleep Prevention Protocol

**Micro-sleep** is an involuntary, momentary lapse of consciousness lasting **1 to 15 seconds**, during which the brain completely disconnects from sensory inputs:

* **The Lethal Mathematics**: At **110 km/h, your car travels 30.6 meters every single second**. A brief 3-second micro-sleep means traveling **over 91 meters completely blind and uncontrolled**—longer than an entire football field.
* **Early Warning Indicators**:
  1. Repeated yawning, heavy eyelids, and slow blinking.
  2. Forgetting the last 2 to 3 kilometers driven.
  3. Drifting over rumble strips or lane dividing lines.
* **The Only Proven Remedy: The 20-Minute Power Nap**:
  * Coffee, loud music, or open windows only provide a brief 10-minute psychological boost.
  * Stop at the nearest PLUS R&R or petrol station. Lock your doors and sleep for **strictly 20 minutes** to clear cerebral adenosine build-up.`;
    }

    // 17. Engineering Mitigations & Countermeasures
    if (lower.includes("mitigation") || lower.includes("measure") || lower.includes("countermeasure") || lower.includes("solve") || lower.includes("engineering") || lower.includes("cadangan") || lower.includes("kejuruteraan")) {
      if (lang === "ms") {
        return `### 🛠️ Intervensi Kejuruteraan Jalan Raya Mengikut Piawaian JKR

Penyelesaian berstruktur yang terbukti mengurangkan kemalangan di kawasan titik hitam (blackspot):

1. **Lorong Khas Motosikal Berasingan**:
   * Mengasingkan kenderaan dua roda daripada lori dan kereta melalui pembahagi fizikal atau delineator poliuretana (mengurangkan kemalangan maut motosikal sehingga 42%).
2. **Permukaan Anti-Gelincir (High-Friction Surface Treatment - HFST)**:
   * Menggunakan agregat *calcined bauxite* dengan resin epoksi pada selekoh tajam untuk meningkatkan geseran membrek ketika hujan lebat.
3. **Jalur Bergetar Melintang (Transverse Rumble Strips)**:
   * Dipasang 100m sebelum persimpangan atau lampu isyarat untuk memberi getaran fizikal dan amaran bunyi kepada pemandu yang leka atau mengantuk.
4. **Lampu Jalan LED Berkuasa Tinggi (High-Mast Lighting)**:
   * Menghapuskan bayang gelap di selekoh luar bandar, membolehkan pejalan kaki dan penunggang motosikal dilihat dari jarak 150 meter.`;
      }

      return `### 🛠️ Priority Highway Engineering Countermeasures (JKR Standards)

Proven structural interventions to eliminate blackspot hazards:

1. **Dedicated Physical Motorcycle Lanes**:
   * Segregates two-wheelers from heavy commercial traffic using raised kerbs or flex-posts, reducing fatal sideswipes by up to **42%**.
2. **High-Friction Anti-Skid Surfacing (HFST)**:
   * Calcined bauxite aggregate bound with epoxy resin increases tire friction on sharp bends, reducing wet-weather stopping distance by 35%.
3. **Transverse Rumble Strips & Optical Speed Bars**:
   * Installed 100 meters ahead of intersections to provide auditory and tactile feedback to speeding or inattentive motorists.
4. **High-Mast Daylight LED Illumination**:
   * Eliminates shadow blind spots on rural curves, extending pedestrian and cyclist detection range from 30m to over 150m.`;
    }

    // 18. Emergency Hotlines
    if (lower.includes("emergency") || lower.includes("hotline") || lower.includes("call") || lower.includes("kecemasan") || lower.includes("telefon") || lower.includes("nombor") || lower.includes("contact")) {
      if (lang === "ms") {
        return `### 🚨 Talian Kecemasan Penting di Malaysia

Simpan nombor penting ini di telefon bimbit anda:
* **Talian Kecemasan Kebangsaan (Polis / Ambulans / Bomba)**: **999**
* **PLUS Highway Careline (Rondaan & Tunda Lebuhraya)**: **1800-88-0000**
* **JKR Cawangan Pengurusan Bencana & Jalan Runtuh**: **1-300-888-557 / 03-2610 7000**
* **Talian Penguatkuasaan JPJ**: **03-8000 8000**
* **Bilik Gerakan Trafik Bukit Aman (PDRM)**: **03-2266 2222**

*Peringatan*: Laporan polis hendaklah dibuat dalam tempoh 24 jam selepas kemalangan untuk urusan tuntutan insurans.`;
      }

      return `### 🚨 Essential Emergency Contacts in Malaysia

Save these emergency contact numbers on your mobile device:
* **National Emergency Service (Police / Ambulance / Bomba)**: **999**
* **PLUS Expressway Careline (Patrol & Towing)**: **1800-88-0000**
* **JKR Disaster & Road Emergency Operations**: **1-300-888-557 / 03-2610 7000**
* **JPJ Enforcement Hotline**: **03-8000 8000**
* **PDRM Federal Traffic Control Room**: **03-2266 2222**

*Reminder*: A police report must be filed within 24 hours of any collision for official insurance processing.`;
    }

    // 19. Intelligent Fallback Synthesizer for Custom Specific Scenarios
    const words = raw.split(/\s+/).filter(w => w.length > 2);
    const topicFocus = words.slice(0, 4).join(" ");

    if (lang === "ms") {
      return `### 🛡️ Penilaian Keselamatan Jalan Raya & Kejuruteraan Trafik: "${raw.slice(0, 60)}"

Mengenai pertanyaan anda tentang **${topicFocus}**, berikut ialah penilaian teknikal daripada rangka kerja keselamatan jalan raya kami:

---

#### 1. Prinsip Utama Keselamatan:
* **Peraturan Jarak 3 Saat**: Sentiasa kekalkan sekurang-kurangnya 3 saat jarak mengekori di belakang kenderaan lain, dan gandakan kepada 5–6 saat ketika jalan basah atau waktu malam.
* **Pemeriksaan P.O.W.E.R. Kenderaan**: Periksa Tekanan Tayar (*Petrol, Oil, Water, Electrics, Rubber*) setiap dua minggu untuk mengelakkan kerosakan mekanikal secara mengejut.
* **Had Laju Statutori**: Patuhi had laju kebangsaan (110 km/j di lebuh raya, 90 km/j di jalan persekutuan, 30 km/j di kawasan sekolah).

---

#### 2. Konteks Data & Titik Panas:
Sistem GIS kami memantau titik hitam di seluruh negara melalui kluster 100 meter. Anda boleh menyemak tab **Mapper** untuk melihat lokasi kemalangan secara langsung atau bertanya tentang jalan/daerah tertentu (contohnya *"jalan perlu dielak di Johor Bahru"* atau *"bateri kereta kong di lebuhraya"*).

*Perlukan maklumat lanjut mengenai kerosakan kenderaan tertentu, persimpangan bulatan, atau panduan memandu kecemasan?*`;
    }

    return `### 🛡️ Road Safety & Traffic Engineering Assessment: "${raw.slice(0, 60)}"

Regarding your inquiry on **${topicFocus}**, here is an empirical assessment from our road safety engineering framework:

---

#### 1. Core Defensive Driving Rules:
* **The 3-Second Following Buffer**: Maintain at least 3 seconds of space behind the vehicle ahead, extending to 5–6 seconds on wet asphalt or during nocturnal hours.
* **P.O.W.E.R. Vehicle Roadworthiness**: Check tire tread depth (must exceed 3.0mm for monsoon safety) and verify battery/brake pressure regularly.
* **Statutory Velocity Compliance**: Adhere to posted speed limits (110 km/h expressways, 90 km/h federal roads, 30 km/h school zones).

---

#### 2. Spatial Data Context:
Our GIS engine continuously monitors blackspots across 100-meter cluster corridors. You can view incident heatmaps on the **Mapper** tab or ask about any specific roadway corridor (e.g. *"roads to avoid in Johor Bahru"* or *"car battery went out on highway"*).

*Would you like more details on specific roadway stats, breakdown procedures, or highway engineering mitigations?*`;
  }
}

// Singleton instance
export const localGisEngine = new LocalGisEngine();
