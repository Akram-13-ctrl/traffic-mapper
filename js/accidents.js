import { db, isFirebasePlaceholder } from "./firebase-config.js";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  onSnapshot 
} from "firebase/firestore";

// Nationwide Malaysian State Metadata & Center Coordinates
export const MALAYSIAN_STATES = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Perak",
  "Perlis",
  "Pulau Pinang",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
  "WP Kuala Lumpur",
  "WP Putrajaya",
  "WP Labuan"
];

export const STATE_COORDINATES = {
  "Johor": { lat: 1.4927, lng: 103.7414, zoom: 11 },
  "Kedah": { lat: 6.1248, lng: 100.3678, zoom: 11 },
  "Kelantan": { lat: 6.1254, lng: 102.2482, zoom: 11 },
  "Melaka": { lat: 2.2285, lng: 102.2215, zoom: 11 },
  "Negeri Sembilan": { lat: 2.7258, lng: 101.9424, zoom: 11 },
  "Pahang": { lat: 3.8126, lng: 103.3256, zoom: 10 },
  "Perak": { lat: 4.5921, lng: 101.0901, zoom: 10 },
  "Perlis": { lat: 6.4414, lng: 100.1982, zoom: 12 },
  "Pulau Pinang": { lat: 5.4164, lng: 100.3327, zoom: 12 },
  "Sabah": { lat: 5.9804, lng: 116.0735, zoom: 9 },
  "Sarawak": { lat: 1.5533, lng: 110.3592, zoom: 9 },
  "Selangor": { lat: 3.0738, lng: 101.5183, zoom: 11 },
  "Terengganu": { lat: 5.3117, lng: 103.1324, zoom: 10 },
  "WP Kuala Lumpur": { lat: 3.1390, lng: 101.6869, zoom: 12 },
  "WP Putrajaya": { lat: 2.9264, lng: 101.6964, zoom: 13 },
  "WP Labuan": { lat: 5.2831, lng: 115.2421, zoom: 13 }
};

// Comprehensive Official Administrative Districts for Every Malaysian State & Federal Territory
export const MALAYSIAN_DISTRICTS = {
  "Johor": [
    "Batu Pahat",
    "Johor Bahru",
    "Kluang",
    "Kota Tinggi",
    "Kulai",
    "Mersing",
    "Muar",
    "Pontian",
    "Segamat",
    "Tangkak"
  ],
  "Kedah": [
    "Baling",
    "Bandar Baharu",
    "Kota Setar",
    "Kuala Muda",
    "Kubang Pasu",
    "Kulim",
    "Langkawi",
    "Padang Terap",
    "Pendang",
    "Pokok Sena",
    "Sik",
    "Yan"
  ],
  "Kelantan": [
    "Bachok",
    "Gua Musang",
    "Jeli",
    "Kota Bharu",
    "Kuala Krai",
    "Machang",
    "Pasir Mas",
    "Pasir Puteh",
    "Tanah Merah",
    "Tumpat"
  ],
  "Melaka": [
    "Alor Gajah",
    "Jasin",
    "Melaka Tengah"
  ],
  "Negeri Sembilan": [
    "Jelebu",
    "Jempol",
    "Kuala Pilah",
    "Port Dickson",
    "Rembau",
    "Seremban",
    "Tampin"
  ],
  "Pahang": [
    "Bentong",
    "Bera",
    "Cameron Highlands",
    "Jerantut",
    "Kuantan",
    "Lipis",
    "Maran",
    "Pekan",
    "Raub",
    "Rompin",
    "Temerloh"
  ],
  "Perak": [
    "Bagan Datuk",
    "Batang Padang",
    "Hilir Perak",
    "Hulu Perak",
    "Kampar",
    "Kerian",
    "Kinta",
    "Kuala Kangsar",
    "Larut, Matang dan Selama",
    "Manjung",
    "Muallim",
    "Perak Tengah"
  ],
  "Perlis": [
    "Arau",
    "Kangar",
    "Padang Besar"
  ],
  "Pulau Pinang": [
    "Barat Daya",
    "Seberang Perai Selatan",
    "Seberang Perai Tengah",
    "Seberang Perai Utara",
    "Timur Laut"
  ],
  "Sabah": [
    "Beaufort",
    "Beluran",
    "Kalabakan",
    "Keningau",
    "Kinabatangan",
    "Kota Belud",
    "Kota Kinabalu",
    "Kota Marudu",
    "Kuala Penyu",
    "Kudat",
    "Kunak",
    "Lahad Datu",
    "Nabawan",
    "Papar",
    "Penampang",
    "Pitas",
    "Putatan",
    "Ranau",
    "Sandakan",
    "Semporna",
    "Sipitang",
    "Tambunan",
    "Tawau",
    "Telupid",
    "Tenom",
    "Tongod",
    "Tuaran"
  ],
  "Sarawak": [
    "Asajaya",
    "Bau",
    "Belaga",
    "Beluru",
    "Betong",
    "Bintulu",
    "Dalat",
    "Daro",
    "Julau",
    "Kabong",
    "Kanowit",
    "Kapit",
    "Kuching",
    "Lawas",
    "Limbang",
    "Lubok Antu",
    "Lundu",
    "Marudi",
    "Matu",
    "Meradong",
    "Miri",
    "Mukah",
    "Pakan",
    "Pusa",
    "Samarahan",
    "Saratok",
    "Sarikei",
    "Sebauh",
    "Sebuyau",
    "Selangau",
    "Serian",
    "Sibu",
    "Simunjan",
    "Song",
    "Sri Aman",
    "Subis",
    "Tanjung Manis",
    "Tatau",
    "Tebedu",
    "Telang Usan"
  ],
  "Selangor": [
    "Gombak",
    "Hulu Langat",
    "Hulu Selangor",
    "Klang",
    "Kuala Langat",
    "Kuala Selangor",
    "Petaling",
    "Sabak Bernam",
    "Sepang"
  ],
  "Terengganu": [
    "Besut",
    "Dungun",
    "Hulu Terengganu",
    "Kemaman",
    "Kuala Nerus",
    "Kuala Terengganu",
    "Marang",
    "Setiu"
  ],
  "WP Kuala Lumpur": [
    "Bandar Tun Razak",
    "Batu",
    "Bukit Bintang",
    "Cheras",
    "Kepong",
    "Kuala Lumpur",
    "Lembah Pantai",
    "Segambut",
    "Seputeh",
    "Setiawangsa",
    "Titiwangsa",
    "Wangsa Maju"
  ],
  "WP Putrajaya": [
    "Putrajaya"
  ],
  "WP Labuan": [
    "Labuan"
  ]
};

// District Center Coordinates for Spatial Panning / Auto-Focus
export const DISTRICT_COORDINATES = {
  // Johor
  "Batu Pahat": { lat: 1.8548, lng: 102.9325, zoom: 12 },
  "Johor Bahru": { lat: 1.4927, lng: 103.7414, zoom: 12 },
  "Kluang": { lat: 2.0251, lng: 103.3328, zoom: 12 },
  "Kota Tinggi": { lat: 1.7381, lng: 103.8999, zoom: 12 },
  "Kulai": { lat: 1.6561, lng: 103.6032, zoom: 12 },
  "Mersing": { lat: 2.4312, lng: 103.8405, zoom: 12 },
  "Muar": { lat: 2.0442, lng: 102.5689, zoom: 12 },
  "Pontian": { lat: 1.4877, lng: 103.3896, zoom: 12 },
  "Segamat": { lat: 2.5144, lng: 102.8158, zoom: 12 },
  "Tangkak": { lat: 2.2673, lng: 102.5453, zoom: 12 },

  // Kedah
  "Baling": { lat: 5.6766, lng: 100.9167, zoom: 12 },
  "Bandar Baharu": { lat: 5.1328, lng: 100.4939, zoom: 12 },
  "Kota Setar": { lat: 6.1248, lng: 100.3678, zoom: 12 },
  "Kuala Muda": { lat: 5.6439, lng: 100.4916, zoom: 12 },
  "Kubang Pasu": { lat: 6.3044, lng: 100.4216, zoom: 12 },
  "Kulim": { lat: 5.3649, lng: 100.5617, zoom: 12 },
  "Langkawi": { lat: 6.3500, lng: 99.8000, zoom: 12 },
  "Padang Terap": { lat: 6.2625, lng: 100.6033, zoom: 12 },
  "Pendang": { lat: 5.9922, lng: 100.4800, zoom: 12 },
  "Pokok Sena": { lat: 6.1667, lng: 100.5167, zoom: 12 },
  "Sik": { lat: 5.8206, lng: 100.7450, zoom: 12 },
  "Yan": { lat: 5.7997, lng: 100.3744, zoom: 12 },

  // Kelantan
  "Bachok": { lat: 6.0667, lng: 102.4000, zoom: 12 },
  "Gua Musang": { lat: 4.8823, lng: 101.9686, zoom: 12 },
  "Jeli": { lat: 5.6983, lng: 101.8431, zoom: 12 },
  "Kota Bharu": { lat: 6.1254, lng: 102.2482, zoom: 12 },
  "Kuala Krai": { lat: 5.5317, lng: 102.2008, zoom: 12 },
  "Machang": { lat: 5.7667, lng: 102.2167, zoom: 12 },
  "Pasir Mas": { lat: 6.0431, lng: 102.1414, zoom: 12 },
  "Pasir Puteh": { lat: 5.8333, lng: 102.4000, zoom: 12 },
  "Tanah Merah": { lat: 5.8089, lng: 102.1478, zoom: 12 },
  "Tumpat": { lat: 6.1978, lng: 102.1708, zoom: 12 },

  // Melaka
  "Alor Gajah": { lat: 2.3804, lng: 102.2089, zoom: 12 },
  "Jasin": { lat: 2.3108, lng: 102.4286, zoom: 12 },
  "Melaka Tengah": { lat: 2.2285, lng: 102.2215, zoom: 12 },

  // Negeri Sembilan
  "Jelebu": { lat: 2.9333, lng: 102.0667, zoom: 12 },
  "Jempol": { lat: 2.8083, lng: 102.3917, zoom: 12 },
  "Kuala Pilah": { lat: 2.7389, lng: 102.2486, zoom: 12 },
  "Port Dickson": { lat: 2.5228, lng: 101.7972, zoom: 12 },
  "Rembau": { lat: 2.5897, lng: 102.0917, zoom: 12 },
  "Seremban": { lat: 2.7258, lng: 101.9424, zoom: 12 },
  "Tampin": { lat: 2.4700, lng: 102.2300, zoom: 12 },

  // Pahang
  "Bentong": { lat: 3.5222, lng: 101.9083, zoom: 12 },
  "Bera": { lat: 3.2667, lng: 102.5000, zoom: 12 },
  "Cameron Highlands": { lat: 4.4706, lng: 101.3789, zoom: 12 },
  "Jerantut": { lat: 3.9372, lng: 102.3628, zoom: 12 },
  "Kuantan": { lat: 3.8126, lng: 103.3256, zoom: 12 },
  "Lipis": { lat: 4.1842, lng: 102.0467, zoom: 12 },
  "Maran": { lat: 3.5861, lng: 102.7731, zoom: 12 },
  "Pekan": { lat: 3.4836, lng: 103.3992, zoom: 12 },
  "Raub": { lat: 3.7897, lng: 101.8572, zoom: 12 },
  "Rompin": { lat: 2.8000, lng: 103.4833, zoom: 12 },
  "Temerloh": { lat: 3.4481, lng: 102.4169, zoom: 12 },

  // Perak
  "Bagan Datuk": { lat: 3.9886, lng: 100.7844, zoom: 12 },
  "Batang Padang": { lat: 4.1950, lng: 101.2600, zoom: 12 },
  "Hilir Perak": { lat: 4.0258, lng: 101.0189, zoom: 12 },
  "Hulu Perak": { lat: 5.4333, lng: 101.1333, zoom: 12 },
  "Kampar": { lat: 4.3000, lng: 101.1500, zoom: 12 },
  "Kerian": { lat: 5.0167, lng: 100.5333, zoom: 12 },
  "Kinta": { lat: 4.5921, lng: 101.0901, zoom: 12 },
  "Kuala Kangsar": { lat: 4.7739, lng: 100.9419, zoom: 12 },
  "Larut, Matang dan Selama": { lat: 4.8500, lng: 100.7333, zoom: 12 },
  "Manjung": { lat: 4.2000, lng: 100.6667, zoom: 12 },
  "Muallim": { lat: 3.7833, lng: 101.5167, zoom: 12 },
  "Perak Tengah": { lat: 4.3667, lng: 100.9167, zoom: 12 },

  // Perlis
  "Arau": { lat: 6.4319, lng: 100.2747, zoom: 12 },
  "Kangar": { lat: 6.4414, lng: 100.1982, zoom: 12 },
  "Padang Besar": { lat: 6.6631, lng: 100.3211, zoom: 12 },

  // Pulau Pinang
  "Barat Daya": { lat: 5.3167, lng: 100.2167, zoom: 12 },
  "Seberang Perai Selatan": { lat: 5.2000, lng: 100.5000, zoom: 12 },
  "Seberang Perai Tengah": { lat: 5.3667, lng: 100.4500, zoom: 12 },
  "Seberang Perai Utara": { lat: 5.5333, lng: 100.4333, zoom: 12 },
  "Timur Laut": { lat: 5.4164, lng: 100.3327, zoom: 12 },

  // Sabah
  "Beaufort": { lat: 5.3472, lng: 115.7450, zoom: 12 },
  "Beluran": { lat: 5.8900, lng: 117.5500, zoom: 12 },
  "Kalabakan": { lat: 4.4100, lng: 117.5000, zoom: 12 },
  "Keningau": { lat: 5.3444, lng: 116.1600, zoom: 12 },
  "Kinabatangan": { lat: 5.5333, lng: 117.8333, zoom: 12 },
  "Kota Belud": { lat: 6.3514, lng: 116.4306, zoom: 12 },
  "Kota Kinabalu": { lat: 5.9804, lng: 116.0735, zoom: 12 },
  "Kota Marudu": { lat: 6.4967, lng: 116.7658, zoom: 12 },
  "Kuala Penyu": { lat: 5.5667, lng: 115.6000, zoom: 12 },
  "Kudat": { lat: 6.8833, lng: 116.8333, zoom: 12 },
  "Kunak": { lat: 4.6833, lng: 118.2500, zoom: 12 },
  "Lahad Datu": { lat: 5.0269, lng: 118.3267, zoom: 12 },
  "Nabawan": { lat: 5.0333, lng: 116.4500, zoom: 12 },
  "Papar": { lat: 5.7333, lng: 115.9333, zoom: 12 },
  "Penampang": { lat: 5.9125, lng: 116.1150, zoom: 12 },
  "Pitas": { lat: 6.7167, lng: 117.0333, zoom: 12 },
  "Putatan": { lat: 5.8969, lng: 116.0489, zoom: 12 },
  "Ranau": { lat: 5.9536, lng: 116.6642, zoom: 12 },
  "Sandakan": { lat: 5.8394, lng: 118.1172, zoom: 12 },
  "Semporna": { lat: 4.4817, lng: 118.6111, zoom: 12 },
  "Sipitang": { lat: 5.0833, lng: 115.5500, zoom: 12 },
  "Tambunan": { lat: 5.6667, lng: 116.3667, zoom: 12 },
  "Tawau": { lat: 4.2447, lng: 117.8911, zoom: 12 },
  "Telupid": { lat: 5.6333, lng: 117.1333, zoom: 12 },
  "Tenom": { lat: 5.1333, lng: 115.9500, zoom: 12 },
  "Tongod": { lat: 5.2667, lng: 116.9667, zoom: 12 },
  "Tuaran": { lat: 6.1800, lng: 116.2300, zoom: 12 },

  // Sarawak
  "Asajaya": { lat: 1.5500, lng: 110.6000, zoom: 12 },
  "Bau": { lat: 1.4167, lng: 110.1500, zoom: 12 },
  "Belaga": { lat: 2.7000, lng: 113.7833, zoom: 12 },
  "Beluru": { lat: 4.0333, lng: 114.1000, zoom: 12 },
  "Betong": { lat: 1.4000, lng: 111.5333, zoom: 12 },
  "Bintulu": { lat: 3.1792, lng: 113.0433, zoom: 12 },
  "Dalat": { lat: 2.7500, lng: 111.9500, zoom: 12 },
  "Daro": { lat: 2.5167, lng: 111.4333, zoom: 12 },
  "Julau": { lat: 2.0167, lng: 111.9167, zoom: 12 },
  "Kabong": { lat: 1.8000, lng: 111.1167, zoom: 12 },
  "Kanowit": { lat: 2.1000, lng: 112.1500, zoom: 12 },
  "Kapit": { lat: 2.0167, lng: 112.9333, zoom: 12 },
  "Kuching": { lat: 1.5533, lng: 110.3592, zoom: 12 },
  "Lawas": { lat: 4.8500, lng: 115.4000, zoom: 12 },
  "Limbang": { lat: 4.7500, lng: 115.0000, zoom: 12 },
  "Lubok Antu": { lat: 1.0500, lng: 111.8333, zoom: 12 },
  "Lundu": { lat: 1.6667, lng: 109.8500, zoom: 12 },
  "Marudi": { lat: 4.1833, lng: 114.3167, zoom: 12 },
  "Matu": { lat: 2.6833, lng: 111.5333, zoom: 12 },
  "Meradong": { lat: 2.1667, lng: 111.6667, zoom: 12 },
  "Miri": { lat: 4.3995, lng: 113.9914, zoom: 12 },
  "Mukah": { lat: 2.9000, lng: 112.0833, zoom: 12 },
  "Pakan": { lat: 1.8833, lng: 111.6833, zoom: 12 },
  "Pusa": { lat: 1.6167, lng: 111.2833, zoom: 12 },
  "Samarahan": { lat: 1.4500, lng: 110.4833, zoom: 12 },
  "Saratok": { lat: 1.7333, lng: 111.3333, zoom: 12 },
  "Sarikei": { lat: 2.1167, lng: 111.5167, zoom: 12 },
  "Sebauh": { lat: 3.1167, lng: 113.2667, zoom: 12 },
  "Sebuyau": { lat: 1.5167, lng: 110.9333, zoom: 12 },
  "Selangau": { lat: 2.5333, lng: 112.3167, zoom: 12 },
  "Serian": { lat: 1.1667, lng: 110.5667, zoom: 12 },
  "Sibu": { lat: 2.3000, lng: 111.8167, zoom: 12 },
  "Simunjan": { lat: 1.4000, lng: 110.7500, zoom: 12 },
  "Song": { lat: 2.0000, lng: 112.5500, zoom: 12 },
  "Sri Aman": { lat: 1.2333, lng: 111.4667, zoom: 12 },
  "Subis": { lat: 3.7833, lng: 113.7833, zoom: 12 },
  "Tanjung Manis": { lat: 2.1500, lng: 111.3500, zoom: 12 },
  "Tatau": { lat: 2.8833, lng: 112.8500, zoom: 12 },
  "Tebedu": { lat: 0.9833, lng: 110.3500, zoom: 12 },
  "Telang Usan": { lat: 3.5500, lng: 114.5000, zoom: 12 },

  // Selangor
  "Gombak": { lat: 3.2500, lng: 101.6500, zoom: 12 },
  "Hulu Langat": { lat: 3.1167, lng: 101.8167, zoom: 12 },
  "Hulu Selangor": { lat: 3.5667, lng: 101.6500, zoom: 12 },
  "Klang": { lat: 3.0439, lng: 101.4442, zoom: 12 },
  "Kuala Langat": { lat: 2.8167, lng: 101.5500, zoom: 12 },
  "Kuala Selangor": { lat: 3.3500, lng: 101.2500, zoom: 12 },
  "Petaling": { lat: 3.0738, lng: 101.5183, zoom: 12 },
  "Sabak Bernam": { lat: 3.7667, lng: 100.9833, zoom: 12 },
  "Sepang": { lat: 2.8167, lng: 101.6833, zoom: 12 },

  // Terengganu
  "Besut": { lat: 5.7500, lng: 102.5500, zoom: 12 },
  "Dungun": { lat: 4.7500, lng: 103.4167, zoom: 12 },
  "Hulu Terengganu": { lat: 4.9667, lng: 102.8333, zoom: 12 },
  "Kemaman": { lat: 4.2333, lng: 103.4167, zoom: 12 },
  "Kuala Nerus": { lat: 5.3833, lng: 103.0833, zoom: 12 },
  "Kuala Terengganu": { lat: 5.3117, lng: 103.1324, zoom: 12 },
  "Marang": { lat: 5.2000, lng: 103.2000, zoom: 12 },
  "Setiu": { lat: 5.5333, lng: 102.7333, zoom: 12 },

  // WP
  "Bandar Tun Razak": { lat: 3.0889, lng: 101.7222, zoom: 13 },
  "Batu": { lat: 3.2000, lng: 101.6833, zoom: 13 },
  "Bukit Bintang": { lat: 3.1466, lng: 101.7109, zoom: 13 },
  "Cheras": { lat: 3.1068, lng: 101.7259, zoom: 13 },
  "Kepong": { lat: 3.2175, lng: 101.6378, zoom: 13 },
  "Kuala Lumpur": { lat: 3.1390, lng: 101.6869, zoom: 12 },
  "Lembah Pantai": { lat: 3.1167, lng: 101.6667, zoom: 13 },
  "Segambut": { lat: 3.1833, lng: 101.6500, zoom: 13 },
  "Seputeh": { lat: 3.1167, lng: 101.6833, zoom: 13 },
  "Setiawangsa": { lat: 3.1833, lng: 101.7333, zoom: 13 },
  "Titiwangsa": { lat: 3.1750, lng: 101.7083, zoom: 13 },
  "Wangsa Maju": { lat: 3.2056, lng: 101.7333, zoom: 13 },
  "Putrajaya": { lat: 2.9264, lng: 101.6964, zoom: 13 },
  "Labuan": { lat: 5.2831, lng: 115.2421, zoom: 13 }
};

// Seed Simulation Accident Data Covering ALL 13 States and 3 Federal Territories
const DUMMY_ACCIDENTS = [
  // --- WP KUALA LUMPUR ---
  { 
    id: "acc-kl-1", 
    latitude: 3.1578, 
    longitude: 101.7119, 
    negeri: "WP Kuala Lumpur",
    daerah: "Kuala Lumpur", 
    namaJalan: "Jalan Ampang (Near Embassy Row)", 
    tarikh: "2026-06-15", 
    masa: "23:45", 
    tahapKeterukan: "Fatal", 
    jenisKenderaan: "Motorcycle", 
    typeOfInjuries: "Fatal (Death)",
    injuryDetails: "Fatal head trauma due to collision with streetlight pole",
    gender: "Male",
    age: 26,
    catatan: "Lost control on sharp curve and struck streetlight pole" 
  },
  { 
    id: "acc-kl-2", 
    latitude: 3.1492, 
    longitude: 101.6961, 
    negeri: "WP Kuala Lumpur",
    daerah: "Kuala Lumpur", 
    namaJalan: "Jalan Tun Razak", 
    tarikh: "2026-06-24", 
    masa: "07:45", 
    tahapKeterukan: "Fatal", 
    jenisKenderaan: "Motorcycle", 
    typeOfInjuries: "Fatal (Death)",
    injuryDetails: "Multiple internal organ injuries and fatal chest injury",
    gender: "Male",
    age: 29,
    catatan: "High-speed T-bone collision at signalized intersection" 
  },
  { 
    id: "acc-kl-3", 
    latitude: 3.1025, 
    longitude: 101.7342, 
    negeri: "WP Kuala Lumpur",
    daerah: "Cheras", 
    namaJalan: "MRR2 Highway (Cheras-Ampang)", 
    tarikh: "2026-06-22", 
    masa: "14:10", 
    tahapKeterukan: "Minor", 
    jenisKenderaan: "Lorry", 
    typeOfInjuries: "Minor Cuts & Bruises",
    injuryDetails: "Small abrasions on hand and wrist contusion",
    gender: "Male",
    age: 45,
    catatan: "Rear impact into light commercial van during sudden stop" 
  },

  // --- SELANGOR ---
  { 
    id: "acc-sel-1", 
    latitude: 3.1167, 
    longitude: 101.6253, 
    negeri: "Selangor",
    daerah: "Petaling Jaya", 
    namaJalan: "Federal Highway (KM 14.2)", 
    tarikh: "2026-06-18", 
    masa: "08:15", 
    tahapKeterukan: "Serious", 
    jenisKenderaan: "Car", 
    typeOfInjuries: "Fracture / Broken Bones",
    injuryDetails: "Leg broken (femur fracture) and right hand fracture",
    gender: "Female",
    age: 34,
    catatan: "Multi-vehicle rear-end collision involving 3 sedans" 
  },
  { 
    id: "acc-sel-2", 
    latitude: 3.0489, 
    longitude: 101.5901, 
    negeri: "Selangor",
    daerah: "Subang Jaya", 
    namaJalan: "Persiaran Kewajipan (USJ)", 
    tarikh: "2026-06-20", 
    masa: "18:30", 
    tahapKeterukan: "Serious", 
    jenisKenderaan: "Motorcycle", 
    typeOfInjuries: "Dislocation & Deep Abrasions",
    injuryDetails: "Shoulder dislocation and deep road rash on right arm",
    gender: "Male",
    age: 22,
    catatan: "Skidded due to oil slick on corner near traffic light" 
  },
  { 
    id: "acc-sel-3", 
    latitude: 3.0733, 
    longitude: 101.5185, 
    negeri: "Selangor",
    daerah: "Shah Alam", 
    namaJalan: "Persiaran Mokhtar Dahari", 
    tarikh: "2026-07-02", 
    masa: "21:40", 
    tahapKeterukan: "Fatal", 
    jenisKenderaan: "Car", 
    typeOfInjuries: "Fatal (Death)",
    injuryDetails: "Fatal head injury and chest crushing",
    gender: "Male",
    age: 38,
    catatan: "Loss of control on unlit winding corridor into steel barrier" 
  },

  // --- JOHOR ---
  { 
    id: "acc-jhr-1", 
    latitude: 1.5354, 
    longitude: 103.6622, 
    negeri: "Johor",
    daerah: "Johor Bahru", 
    namaJalan: "Jalan Skudai Highway (KM 16)", 
    tarikh: "2026-06-21", 
    masa: "19:15", 
    tahapKeterukan: "Fatal", 
    jenisKenderaan: "Motorcycle", 
    typeOfInjuries: "Fatal (Death)",
    injuryDetails: "Severe head injuries due to collision with commercial truck",
    gender: "Male",
    age: 24,
    catatan: "Sideswipe collision during lane merging in heavy commuter traffic" 
  },
  { 
    id: "acc-jhr-2", 
    latitude: 1.8548, 
    longitude: 102.9325, 
    negeri: "Johor",
    daerah: "Batu Pahat", 
    namaJalan: "Jalan Kluang (Batu Pahat)", 
    tarikh: "2026-06-29", 
    masa: "08:45", 
    tahapKeterukan: "Serious", 
    jenisKenderaan: "Car", 
    typeOfInjuries: "Fracture / Broken Bones",
    injuryDetails: "Multiple rib fractures and pelvic trauma",
    gender: "Female",
    age: 42,
    catatan: "Head-on collision at non-divided single-carriageway segment" 
  },
  { 
    id: "acc-jhr-3", 
    latitude: 2.0442, 
    longitude: 102.5689, 
    negeri: "Johor",
    daerah: "Muar", 
    namaJalan: "Jalan Bakri (Muar)", 
    tarikh: "2026-07-06", 
    masa: "16:20", 
    tahapKeterukan: "Minor", 
    jenisKenderaan: "Lorry", 
    typeOfInjuries: "Minor Cuts & Bruises",
    injuryDetails: "Arm contusion and glass scratch abrasions",
    gender: "Male",
    age: 39,
    catatan: "Brake malfunction resulting in buffer impact into grass shoulder" 
  },

  // --- PULAU PINANG ---
  { 
    id: "acc-pen-1", 
    latitude: 5.3982, 
    longitude: 100.3122, 
    negeri: "Pulau Pinang",
    daerah: "Timur Laut (George Town)", 
    namaJalan: "Tun Dr Lim Chong Eu Expressway", 
    tarikh: "2026-06-23", 
    masa: "02:15", 
    tahapKeterukan: "Fatal", 
    jenisKenderaan: "Motorcycle", 
    typeOfInjuries: "Fatal (Death)",
    injuryDetails: "Fatal cervical trauma and multiple fractures",
    gender: "Male",
    age: 21,
    catatan: "Illegal speeding and losing balance on expressway curve" 
  },
  { 
    id: "acc-pen-2", 
    latitude: 5.2982, 
    longitude: 100.2654, 
    negeri: "Pulau Pinang",
    daerah: "Barat Daya (Bayan Lepas)", 
    namaJalan: "Jalan Sultan Azlan Shah", 
    tarikh: "2026-06-27", 
    masa: "17:50", 
    tahapKeterukan: "Serious", 
    jenisKenderaan: "Car", 
    typeOfInjuries: "Fracture / Broken Bones",
    injuryDetails: "Compound fracture on right leg and severe concussion",
    gender: "Female",
    age: 36,
    catatan: "Running red light at Bayan Lepas junction during rush hour" 
  },
  { 
    id: "acc-pen-3", 
    latitude: 5.3852, 
    longitude: 100.3982, 
    negeri: "Pulau Pinang",
    daerah: "Seberang Perai Tengah (Butterworth)", 
    namaJalan: "Jalan Baru Perai (Near Megamall)", 
    tarikh: "2026-07-03", 
    masa: "11:30", 
    tahapKeterukan: "Minor", 
    jenisKenderaan: "Bus", 
    typeOfInjuries: "Minor Cuts & Bruises",
    injuryDetails: "Minor facial bruising and wrist strain",
    gender: "Male",
    age: 48,
    catatan: "Glancing sideswipe collision between stage bus and passenger sedan" 
  },

  // --- PERAK ---
  { 
    id: "acc-prk-1", 
    latitude: 4.6231, 
    longitude: 101.0921, 
    negeri: "Perak",
    daerah: "Kinta (Ipoh)", 
    namaJalan: "Jalan Kuala Kangsar (Tasek)", 
    tarikh: "2026-06-19", 
    masa: "19:40", 
    tahapKeterukan: "Fatal", 
    jenisKenderaan: "Motorcycle", 
    typeOfInjuries: "Fatal (Death)",
    injuryDetails: "Fatal skull fracture after impact with curb divider",
    gender: "Male",
    age: 27,
    catatan: "Rider skidded on wet asphalt after sudden braking" 
  },
  { 
    id: "acc-prk-2", 
    latitude: 4.1982, 
    longitude: 101.2582, 
    negeri: "Perak",
    daerah: "Batang Padang (Tapah)", 
    namaJalan: "Lebuhraya PLUS KM 315 (Tapah-Gopeng)", 
    tarikh: "2026-06-26", 
    masa: "04:10", 
    tahapKeterukan: "Fatal", 
    jenisKenderaan: "Lorry", 
    typeOfInjuries: "Fatal (Death)",
    injuryDetails: "Heavy crushing trauma and internal haemorrhage",
    gender: "Male",
    age: 52,
    catatan: "Heavy trailer rear-ended stationary timber lorry in unlit sector" 
  },
  { 
    id: "acc-prk-3", 
    latitude: 4.8523, 
    longitude: 100.7321, 
    negeri: "Perak",
    daerah: "Larut, Matang & Selama (Taiping)", 
    namaJalan: "Kamunting Bypass Corridor", 
    tarikh: "2026-07-05", 
    masa: "15:20", 
    tahapKeterukan: "Minor", 
    jenisKenderaan: "Car", 
    typeOfInjuries: "Minor Cuts & Bruises",
    injuryDetails: "Minor seatbelt bruises and hand scrapes",
    gender: "Female",
    age: 33,
    catatan: "Hydroplaning during torrential rainfall into gravel embankment" 
  },

  // --- KEDAH ---
  { 
    id: "acc-kdh-1", 
    latitude: 6.1248, 
    longitude: 100.3678, 
    negeri: "Kedah",
    daerah: "Kota Setar (Alor Setar)", 
    namaJalan: "Lebuhraya Sultanah Bahiyah", 
    tarikh: "2026-06-17", 
    masa: "20:30", 
    tahapKeterukan: "Serious", 
    jenisKenderaan: "Motorcycle", 
    typeOfInjuries: "Fracture / Broken Bones",
    injuryDetails: "Left tibia and fibula compound fractures",
    gender: "Male",
    age: 23,
    catatan: "Collided with utility pickup performing illegal U-turn" 
  },
  { 
    id: "acc-kdh-2", 
    latitude: 5.6435, 
    longitude: 100.4883, 
    negeri: "Kedah",
    daerah: "Kuala Muda (Sungai Petani)", 
    namaJalan: "Jalan Bakar Arang", 
    tarikh: "2026-06-25", 
    masa: "13:15", 
    tahapKeterukan: "Fatal", 
    jenisKenderaan: "Car", 
    typeOfInjuries: "Fatal (Death)",
    injuryDetails: "Fatal head injury and chest trauma",
    gender: "Male",
    age: 46,
    catatan: "Broadsided by speeding trailer at signalized crossroads" 
  },

  // --- KELANTAN ---
  { 
    id: "acc-ktn-1", 
    latitude: 6.1254, 
    longitude: 102.2482, 
    negeri: "Kelantan",
    daerah: "Kota Bharu", 
    namaJalan: "Jalan Sultan Yahya Petra", 
    tarikh: "2026-06-22", 
    masa: "18:40", 
    tahapKeterukan: "Serious", 
    jenisKenderaan: "Motorcycle", 
    typeOfInjuries: "Fracture / Broken Bones",
    injuryDetails: "Femur fracture and multiple abrasions",
    gender: "Male",
    age: 25,
    catatan: "Collided with passenger car exiting commercial driveway" 
  },
  { 
    id: "acc-ktn-2", 
    latitude: 4.8823, 
    longitude: 101.9686, 
    negeri: "Kelantan",
    daerah: "Gua Musang", 
    namaJalan: "Jalan Kuala Krai - Gua Musang Highway", 
    tarikh: "2026-07-01", 
    masa: "03:50", 
    tahapKeterukan: "Fatal", 
    jenisKenderaan: "Car", 
    typeOfInjuries: "Fatal (Death)",
    injuryDetails: "Severe head injuries due to vehicle rollover",
    gender: "Male",
    age: 35,
    catatan: "Driver micro-sleep on straight dark sector hitting culvert" 
  },

  // --- TERENGGANU ---
  { 
    id: "acc-trg-1", 
    latitude: 5.3182, 
    longitude: 103.1412, 
    negeri: "Terengganu",
    daerah: "Kuala Terengganu", 
    namaJalan: "Jalan Sultan Mahmud (Batu Burok)", 
    tarikh: "2026-06-20", 
    masa: "22:15", 
    tahapKeterukan: "Fatal", 
    jenisKenderaan: "Motorcycle", 
    typeOfInjuries: "Fatal (Death)",
    injuryDetails: "Fatal head trauma due to missing helmet chin strap",
    gender: "Male",
    age: 20,
    catatan: "Hit road island curb at high cruising speed" 
  },
  { 
    id: "acc-trg-2", 
    latitude: 4.2382, 
    longitude: 103.4212, 
    negeri: "Terengganu",
    daerah: "Kemaman", 
    namaJalan: "Lebuhraya Pantai Timur 2 (LPT2 KM 298)", 
    tarikh: "2026-06-28", 
    masa: "16:45", 
    tahapKeterukan: "Serious", 
    jenisKenderaan: "Car", 
    typeOfInjuries: "Fracture / Broken Bones",
    injuryDetails: "Arm fracture and spinal shock",
    gender: "Female",
    age: 29,
    catatan: "Aquaplaning on wet LPT2 surface resulting in multiple spins" 
  },

  // --- PAHANG ---
  { 
    id: "acc-phg-1", 
    latitude: 3.7912, 
    longitude: 103.3122, 
    negeri: "Pahang",
    daerah: "Kuantan", 
    namaJalan: "Jalan Gambang (Kuantan Bypass)", 
    tarikh: "2026-06-16", 
    masa: "07:30", 
    tahapKeterukan: "Serious", 
    jenisKenderaan: "Car", 
    typeOfInjuries: "Fracture / Broken Bones",
    injuryDetails: "Collarbone break and forehead lacerations",
    gender: "Male",
    age: 41,
    catatan: "Rear-ended heavy palm oil tanker on uphill gradient" 
  },
  { 
    id: "acc-phg-2", 
    latitude: 3.5214, 
    longitude: 101.9082, 
    negeri: "Pahang",
    daerah: "Bentong", 
    namaJalan: "Lebuhraya Karak (KM 62 Genting Sempah)", 
    tarikh: "2026-06-29", 
    masa: "23:05", 
    tahapKeterukan: "Fatal", 
    jenisKenderaan: "Bus", 
    typeOfInjuries: "Fatal (Death)",
    injuryDetails: "Multiple fatalities from express bus brake fade on descent",
    gender: "Male",
    age: 49,
    catatan: "Brake overheating on steep downhill descent into concrete divider" 
  },

  // --- NEGERI SEMBILAN ---
  { 
    id: "acc-ns-1", 
    latitude: 2.6923, 
    longitude: 101.9754, 
    negeri: "Negeri Sembilan",
    daerah: "Seremban", 
    namaJalan: "Lebuhraya PLUS KM 262 (Senawang)", 
    tarikh: "2026-06-21", 
    masa: "19:00", 
    tahapKeterukan: "Fatal", 
    jenisKenderaan: "Motorcycle", 
    typeOfInjuries: "Fatal (Death)",
    injuryDetails: "Fatal head injury and internal trauma",
    gender: "Male",
    age: 28,
    catatan: "Hit tire retread debris on middle lane causing fall" 
  },
  { 
    id: "acc-ns-2", 
    latitude: 2.5322, 
    longitude: 101.8152, 
    negeri: "Negeri Sembilan",
    daerah: "Port Dickson", 
    namaJalan: "Lebuhraya Seremban - Port Dickson (SPDH)", 
    tarikh: "2026-07-03", 
    masa: "10:15", 
    tahapKeterukan: "Minor", 
    jenisKenderaan: "Car", 
    typeOfInjuries: "Minor Cuts & Bruises",
    injuryDetails: "Shoulder sprain and abrasions",
    gender: "Female",
    age: 27,
    catatan: "Avoided stray animal and entered roadside gravel trap" 
  },

  // --- MELAKA ---
  { 
    id: "acc-mlk-1", 
    latitude: 2.2285, 
    longitude: 102.2215, 
    negeri: "Melaka",
    daerah: "Melaka Tengah", 
    namaJalan: "Lebuh AMJ (Malim Interchange)", 
    tarikh: "2026-06-24", 
    masa: "18:10", 
    tahapKeterukan: "Fatal", 
    jenisKenderaan: "Motorcycle", 
    typeOfInjuries: "Fatal (Death)",
    injuryDetails: "Fatal thoracic trauma from heavy vehicle wheel runover",
    gender: "Male",
    age: 22,
    catatan: "Sideswiped on curve by cement mixer truck" 
  },
  { 
    id: "acc-mlk-2", 
    latitude: 2.3854, 
    longitude: 102.1812, 
    negeri: "Melaka",
    daerah: "Alor Gajah", 
    namaJalan: "Simpang Ampat PLUS Interchange", 
    tarikh: "2026-07-02", 
    masa: "14:50", 
    tahapKeterukan: "Serious", 
    jenisKenderaan: "Car", 
    typeOfInjuries: "Fracture / Broken Bones",
    injuryDetails: "Shattered wrist and fractured rib",
    gender: "Male",
    age: 39,
    catatan: "Failed to yield at roundabout junction colliding at 70 km/h" 
  },

  // --- PERLIS ---
  { 
    id: "acc-pls-1", 
    latitude: 6.4414, 
    longitude: 100.1982, 
    negeri: "Perlis",
    daerah: "Kangar", 
    namaJalan: "Jalan Raja Syed Alwi", 
    tarikh: "2026-06-23", 
    masa: "21:30", 
    tahapKeterukan: "Serious", 
    jenisKenderaan: "Motorcycle", 
    typeOfInjuries: "Fracture / Broken Bones",
    injuryDetails: "Broken arm and head contusion",
    gender: "Male",
    age: 19,
    catatan: "Collided with tractor trailer carrying agricultural crops" 
  },
  { 
    id: "acc-pls-2", 
    latitude: 6.6621, 
    longitude: 100.3212, 
    negeri: "Perlis",
    daerah: "Padang Besar", 
    namaJalan: "Laluan Persekutuan 7 (Padang Besar)", 
    tarikh: "2026-07-04", 
    masa: "11:20", 
    tahapKeterukan: "Minor", 
    jenisKenderaan: "Car", 
    typeOfInjuries: "Minor Cuts & Bruises",
    injuryDetails: "Minor cuts on forehead and arms",
    gender: "Female",
    age: 45,
    catatan: "Rear-end bump in queue near border customs checkpoint" 
  },

  // --- SABAH ---
  { 
    id: "acc-sbh-1", 
    latitude: 5.9804, 
    longitude: 116.0735, 
    negeri: "Sabah",
    daerah: "Kota Kinabalu", 
    namaJalan: "Jalan Tuaran Bypass (Inanam)", 
    tarikh: "2026-06-25", 
    masa: "22:40", 
    tahapKeterukan: "Fatal", 
    jenisKenderaan: "Motorcycle", 
    typeOfInjuries: "Fatal (Death)",
    injuryDetails: "Fatal head injuries due to collision with 4WD vehicle",
    gender: "Male",
    age: 25,
    catatan: "High-speed crash at non-illuminated U-turn junction" 
  },
  { 
    id: "acc-sbh-2", 
    latitude: 5.8523, 
    longitude: 118.0621, 
    negeri: "Sabah",
    daerah: "Sandakan", 
    namaJalan: "Jalan Labuk KM 14 (Sandakan)", 
    tarikh: "2026-07-01", 
    masa: "17:15", 
    tahapKeterukan: "Serious", 
    jenisKenderaan: "Lorry", 
    typeOfInjuries: "Fracture / Broken Bones",
    injuryDetails: "Multiple fractures on legs and clavicle",
    gender: "Male",
    age: 44,
    catatan: "Timber lorry overturned on sharp steep hill descent" 
  },

  // --- SARAWAK ---
  { 
    id: "acc-swk-1", 
    latitude: 1.5123, 
    longitude: 110.3542, 
    negeri: "Sarawak",
    daerah: "Kuching", 
    namaJalan: "Jalan Tun Jugah (Near Simpang Tiga)", 
    tarikh: "2026-06-26", 
    masa: "18:25", 
    tahapKeterukan: "Fatal", 
    jenisKenderaan: "Car", 
    typeOfInjuries: "Fatal (Death)",
    injuryDetails: "Fatal traumatic brain injury and severe crushing",
    gender: "Male",
    age: 32,
    catatan: "Sideswiped bridge railing and flipped onto median" 
  },
  { 
    id: "acc-swk-2", 
    latitude: 4.3412, 
    longitude: 113.9852, 
    negeri: "Sarawak",
    daerah: "Miri", 
    namaJalan: "Lebuhraya Pan Borneo (Jalan Miri-Bintulu)", 
    tarikh: "2026-07-05", 
    masa: "08:10", 
    tahapKeterukan: "Serious", 
    jenisKenderaan: "Car", 
    typeOfInjuries: "Fracture / Broken Bones",
    injuryDetails: "Broken forearm and leg lacerations",
    gender: "Female",
    age: 38,
    catatan: "Collision at construction diversion bypass on Pan Borneo" 
  },

  // --- WP PUTRAJAYA ---
  { 
    id: "acc-ptj-1", 
    latitude: 2.9264, 
    longitude: 101.6964, 
    negeri: "WP Putrajaya",
    daerah: "Putrajaya", 
    namaJalan: "Persiaran Persekutuan (Presint 1)", 
    tarikh: "2026-06-27", 
    masa: "08:35", 
    tahapKeterukan: "Serious", 
    jenisKenderaan: "Motorcycle", 
    typeOfInjuries: "Fracture / Broken Bones",
    injuryDetails: "Collarbone fracture and knee dislocation",
    gender: "Male",
    age: 30,
    catatan: "Skidded on wet road markings approaching large roundabout" 
  },
  { 
    id: "acc-ptj-2", 
    latitude: 2.9382, 
    longitude: 101.6852, 
    negeri: "WP Putrajaya",
    daerah: "Putrajaya", 
    namaJalan: "Lebuh Sentosa (Presint 9)", 
    tarikh: "2026-07-06", 
    masa: "17:40", 
    tahapKeterukan: "Minor", 
    jenisKenderaan: "Car", 
    typeOfInjuries: "Minor Cuts & Bruises",
    injuryDetails: "Minor whip-lash and bruised thumb",
    gender: "Female",
    age: 26,
    catatan: "Slow speed rear-end collision at pedestrian traffic crossing" 
  },

  // --- WP LABUAN ---
  { 
    id: "acc-lbn-1", 
    latitude: 5.2831, 
    longitude: 115.2421, 
    negeri: "WP Labuan",
    daerah: "Labuan", 
    namaJalan: "Jalan Tun Mustapha (Victoria)", 
    tarikh: "2026-06-30", 
    masa: "21:50", 
    tahapKeterukan: "Serious", 
    jenisKenderaan: "Motorcycle", 
    typeOfInjuries: "Fracture / Broken Bones",
    injuryDetails: "Fractured wrist and deep road rash",
    gender: "Male",
    age: 23,
    catatan: "Loss of control on unlit coastal road bend" 
  }
];

const seedSimulationAccidents = () => {
  const accidentsRaw = localStorage.getItem("sim_accidents");
  // Check if we need to upgrade to nationwide dataset (missing negeri or low count)
  let shouldSeed = false;
  if (!accidentsRaw) {
    shouldSeed = true;
  } else {
    try {
      const parsed = JSON.parse(accidentsRaw);
      if (!Array.isArray(parsed) || parsed.length < 15 || !parsed[0].negeri) {
        shouldSeed = true;
      }
    } catch {
      shouldSeed = true;
    }
  }

  if (shouldSeed) {
    localStorage.setItem("sim_accidents", JSON.stringify(DUMMY_ACCIDENTS));
  }
};
seedSimulationAccidents();

// Fetch All Accidents
export async function getAccidents() {
  if (isFirebasePlaceholder || !db) {
    // Return from localStorage sorted by date decending
    const simList = JSON.parse(localStorage.getItem("sim_accidents") || "[]");
    return simList.sort((a, b) => new Date(b.tarikh + "T" + b.masa) - new Date(a.tarikh + "T" + a.masa));
  }

  // Real Firebase Fetch
  try {
    const q = query(collection(db, "accidents"));
    const snapshot = await getDocs(q);
    const accidents = [];
    snapshot.forEach(docSnap => {
      accidents.push({ id: docSnap.id, ...docSnap.data() });
    });
    // Sort decending
    return accidents.sort((a, b) => new Date(b.tarikh + "T" + b.masa) - new Date(a.tarikh + "T" + a.masa));
  } catch (error) {
    console.error("Firestore getAccidents error:", error);
    // Fallback to local
    const simList = JSON.parse(localStorage.getItem("sim_accidents") || "[]");
    return simList.sort((a, b) => new Date(b.tarikh + "T" + b.masa) - new Date(a.tarikh + "T" + a.masa));
  }
}

// Real-Time Accident Data Synchronization (onSnapshot listener)
export function subscribeToAccidents(callback, onError) {
  if (isFirebasePlaceholder || !db) {
    const emitLocal = () => {
      const simList = JSON.parse(localStorage.getItem("sim_accidents") || "[]");
      const sorted = simList.sort((a, b) => new Date(b.tarikh + "T" + b.masa) - new Date(a.tarikh + "T" + a.masa));
      callback(sorted);
    };

    emitLocal();

    const handleLocalUpdate = () => emitLocal();
    window.addEventListener("accidents_updated", handleLocalUpdate);
    window.addEventListener("storage", handleLocalUpdate);

    // Return cleanup function to unsubscribe
    return () => {
      window.removeEventListener("accidents_updated", handleLocalUpdate);
      window.removeEventListener("storage", handleLocalUpdate);
    };
  }

  try {
    const q = query(collection(db, "accidents"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const accidents = [];
      snapshot.forEach(docSnap => {
        accidents.push({ id: docSnap.id, ...docSnap.data() });
      });
      const sorted = accidents.sort((a, b) => new Date(b.tarikh + "T" + b.masa) - new Date(a.tarikh + "T" + a.masa));
      callback(sorted);
    }, (err) => {
      console.warn("Firestore snapshot subscription error, falling back to local:", err);
      if (onError) onError(err);
      // Fallback
      const simList = JSON.parse(localStorage.getItem("sim_accidents") || "[]");
      callback(simList);
    });

    return unsubscribe;
  } catch (err) {
    console.warn("Could not attach onSnapshot, using local fallback:", err);
    if (onError) onError(err);
    return () => {};
  }
}

// Add New Accident
export async function addAccident(data) {
  const parsedData = {
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude),
    negeri: data.negeri || "Selangor",
    daerah: data.daerah,
    tarikh: data.tarikh,
    masa: data.masa,
    tahapKeterukan: data.tahapKeterukan,
    jenisKenderaan: data.jenisKenderaan,
    namaJalan: data.namaJalan,
    typeOfInjuries: data.typeOfInjuries || data.tahapKeterukan || "Uninjured",
    injuryDetails: data.injuryDetails || "None reported",
    gender: data.gender || "Male",
    age: parseInt(data.age) || 30,
    catatan: data.catatan || "",
    createdAt: new Date().toISOString()
  };

  if (isFirebasePlaceholder || !db) {
    const simList = JSON.parse(localStorage.getItem("sim_accidents") || "[]");
    const newDoc = { id: "acc-" + Date.now(), ...parsedData };
    simList.push(newDoc);
    localStorage.setItem("sim_accidents", JSON.stringify(simList));
    window.dispatchEvent(new CustomEvent("accidents_updated"));
    return newDoc;
  }

  try {
    const docRef = await addDoc(collection(db, "accidents"), parsedData);
    window.dispatchEvent(new CustomEvent("accidents_updated"));
    return { id: docRef.id, ...parsedData };
  } catch (error) {
    console.error("Firestore addAccident error:", error);
    throw new Error("Failed to add accident record.");
  }
}

// Update Existing Accident
export async function updateAccident(id, data) {
  const parsedData = {
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude),
    negeri: data.negeri || "Selangor",
    daerah: data.daerah,
    tarikh: data.tarikh,
    masa: data.masa,
    tahapKeterukan: data.tahapKeterukan,
    jenisKenderaan: data.jenisKenderaan,
    namaJalan: data.namaJalan,
    typeOfInjuries: data.typeOfInjuries || "Uninjured",
    injuryDetails: data.injuryDetails || "None reported",
    gender: data.gender || "Male",
    age: parseInt(data.age) || 30,
    catatan: data.catatan || ""
  };

  if (isFirebasePlaceholder || !db) {
    const simList = JSON.parse(localStorage.getItem("sim_accidents") || "[]");
    const index = simList.findIndex(a => a.id === id);
    if (index !== -1) {
      simList[index] = { ...simList[index], ...parsedData };
      localStorage.setItem("sim_accidents", JSON.stringify(simList));
      window.dispatchEvent(new CustomEvent("accidents_updated"));
      return simList[index];
    }
    throw new Error("Accident record not found.");
  }

  try {
    const docRef = doc(db, "accidents", id);
    await updateDoc(docRef, parsedData);
    window.dispatchEvent(new CustomEvent("accidents_updated"));
    return { id, ...parsedData };
  } catch (error) {
    console.error("Firestore updateAccident error:", error);
    throw new Error("Failed to update accident record.");
  }
}

// Delete Accident
export async function deleteAccident(id) {
  if (isFirebasePlaceholder || !db) {
    const simList = JSON.parse(localStorage.getItem("sim_accidents") || "[]");
    const filtered = simList.filter(a => a.id !== id);
    localStorage.setItem("sim_accidents", JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent("accidents_updated"));
    return true;
  }

  try {
    await deleteDoc(doc(db, "accidents", id));
    window.dispatchEvent(new CustomEvent("accidents_updated"));
    return true;
  } catch (error) {
    console.error("Firestore deleteAccident error:", error);
    throw new Error("Failed to delete accident record.");
  }
}

// Export data to CSV string
export function exportToCSV(accidents) {
  const headers = ["ID", "Latitude", "Longitude", "Date", "Time", "Severity", "Vehicle Type", "Road Name", "District", "Injury Type", "Injury Description", "Gender", "Age", "Notes"];
  const rows = accidents.map(a => [
    a.id,
    a.latitude,
    a.longitude,
    a.tarikh,
    a.masa,
    a.tahapKeterukan,
    a.jenisKenderaan,
    `"${a.namaJalan.replace(/"/g, '""')}"`,
    `"${a.daerah.replace(/"/g, '""')}"`,
    `"${(a.typeOfInjuries || '').replace(/"/g, '""')}"`,
    `"${(a.injuryDetails || '').replace(/"/g, '""')}"`,
    a.gender || 'N/A',
    a.age || 'N/A',
    `"${(a.catatan || "").replace(/"/g, '""')}"`
  ]);

  return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
}

// Parse CSV string into array of objects and merge
export function parseCSV(csvText) {
  const lines = csvText.split("\n");
  if (lines.length <= 1) return [];

  const accidents = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",");
    const cells = matches.map(c => c.replace(/^"|"$/g, '').trim());

    if (cells.length < 8) continue;

    const item = {
      latitude: parseFloat(cells[1]) || 3.15,
      longitude: parseFloat(cells[2]) || 101.65,
      tarikh: cells[3] || new Date().toISOString().split('T')[0],
      masa: cells[4] || "12:00",
      tahapKeterukan: cells[5] || "Minor",
      jenisKenderaan: cells[6] || "Car",
      namaJalan: cells[7] || "Main Road",
      daerah: cells[8] || "Kuala Lumpur",
      typeOfInjuries: cells[9] || "Minor Cuts",
      injuryDetails: cells[10] || "Small abrasions",
      gender: cells[11] || "Male",
      age: parseInt(cells[12]) || 30,
      catatan: cells[13] || ""
    };
    accidents.push(item);
  }

  return accidents;
}
