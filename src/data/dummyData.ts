export interface AccidentRecord {
  id: string;
  latitude: number;
  longitude: number;
  tarikh: string; // YYYY-MM-DD
  masa: string; // HH:MM
  tahapKeterukan: "Fatal" | "Serious" | "Minor";
  jenisKenderaan: string;
  namaJalan: string;
  daerah: string;
  createdAt?: string;
  createdBy?: string;
}

export const DUMMY_ACCIDENTS: AccidentRecord[] = [
  {
    id: "acc_001",
    latitude: 3.1579,
    longitude: 101.7116,
    tarikh: "2026-05-12",
    masa: "23:45",
    tahapKeterukan: "Fatal",
    jenisKenderaan: "Motosikal",
    namaJalan: "Jalan Ampang (berhampiran KLCC)",
    daerah: "Kuala Lumpur"
  },
  {
    id: "acc_002",
    latitude: 3.1584,
    longitude: 101.7150,
    tarikh: "2026-05-18",
    masa: "08:15",
    tahapKeterukan: "Minor",
    jenisKenderaan: "Kereta",
    namaJalan: "Jalan Ampang",
    daerah: "Kuala Lumpur"
  },
  {
    id: "acc_003",
    latitude: 3.1422,
    longitude: 101.6966,
    tarikh: "2026-06-01",
    masa: "14:30",
    tahapKeterukan: "Serious",
    jenisKenderaan: "Lori",
    namaJalan: "Jalan Kinabalu",
    daerah: "Kuala Lumpur"
  },
  {
    id: "acc_004",
    latitude: 3.1415,
    longitude: 101.6980,
    tarikh: "2026-06-05",
    masa: "18:20",
    tahapKeterukan: "Minor",
    jenisKenderaan: "Kereta",
    namaJalan: "Jalan Kinabalu",
    daerah: "Kuala Lumpur"
  },
  {
    id: "acc_005",
    latitude: 3.0825,
    longitude: 101.5834,
    tarikh: "2026-06-10",
    masa: "11:00",
    tahapKeterukan: "Serious",
    jenisKenderaan: "Motosikal",
    namaJalan: "Lebuhraya Persekutuan (Federal Highway)",
    daerah: "Petaling Jaya"
  },
  {
    id: "acc_006",
    latitude: 3.0831,
    longitude: 101.5850,
    tarikh: "2026-06-12",
    masa: "07:45",
    tahapKeterukan: "Fatal",
    jenisKenderaan: "Kereta",
    namaJalan: "Lebuhraya Persekutuan (Federal Highway)",
    daerah: "Petaling Jaya"
  },
  {
    id: "acc_007",
    latitude: 3.0810,
    longitude: 101.5790,
    tarikh: "2026-06-15",
    masa: "19:10",
    tahapKeterukan: "Minor",
    jenisKenderaan: "Bas",
    namaJalan: "Lebuhraya Persekutuan (Federal Highway)",
    daerah: "Petaling Jaya"
  },
  {
    id: "acc_008",
    latitude: 3.0489,
    longitude: 101.5183,
    tarikh: "2026-05-20",
    masa: "16:40",
    tahapKeterukan: "Minor",
    jenisKenderaan: "Kereta",
    namaJalan: "Persiaran Kewajipan",
    daerah: "Subang Jaya"
  },
  {
    id: "acc_009",
    latitude: 3.0512,
    longitude: 101.5190,
    tarikh: "2026-05-22",
    masa: "08:55",
    tahapKeterukan: "Serious",
    jenisKenderaan: "Motosikal",
    namaJalan: "Persiaran Kewajipan",
    daerah: "Subang Jaya"
  },
  {
    id: "acc_010",
    latitude: 5.4132,
    longitude: 100.3292,
    tarikh: "2026-06-02",
    masa: "21:30",
    tahapKeterukan: "Fatal",
    jenisKenderaan: "Motosikal",
    namaJalan: "Jalan Penang",
    daerah: "Georgetown"
  },
  {
    id: "acc_011",
    latitude: 5.4140,
    longitude: 100.3280,
    tarikh: "2026-06-08",
    masa: "13:15",
    tahapKeterukan: "Minor",
    jenisKenderaan: "Kereta",
    namaJalan: "Jalan Penang",
    daerah: "Georgetown"
  },
  {
    id: "acc_012",
    latitude: 5.3528,
    longitude: 100.3012,
    tarikh: "2026-06-14",
    masa: "10:20",
    tahapKeterukan: "Serious",
    jenisKenderaan: "Lori",
    namaJalan: "Jalan Sultan Azlan Shah",
    daerah: "Bayan Lepas"
  },
  {
    id: "acc_013",
    latitude: 1.4854,
    longitude: 103.7614,
    tarikh: "2026-05-30",
    masa: "03:10",
    tahapKeterukan: "Fatal",
    jenisKenderaan: "Kereta",
    namaJalan: "Jalan Wong Ah Fook",
    daerah: "Johor Bahru"
  },
  {
    id: "acc_014",
    latitude: 1.4862,
    longitude: 103.7625,
    tarikh: "2026-06-03",
    masa: "17:40",
    tahapKeterukan: "Minor",
    jenisKenderaan: "Kereta",
    namaJalan: "Jalan Wong Ah Fook",
    daerah: "Johor Bahru"
  },
  {
    id: "acc_015",
    latitude: 1.4628,
    longitude: 103.7542,
    tarikh: "2026-06-11",
    masa: "12:05",
    tahapKeterukan: "Serious",
    jenisKenderaan: "Motosikal",
    namaJalan: "Lebuhraya Skudai",
    daerah: "Johor Bahru"
  }
];

export const VEHICLE_TYPES = [
  "Kereta",
  "Motosikal",
  "Lori",
  "Bas",
  "Van",
  "Basikal",
  "Lain-lain"
];

export const DISTRICTS = [
  "Kuala Lumpur",
  "Petaling Jaya",
  "Subang Jaya",
  "Georgetown",
  "Bayan Lepas",
  "Johor Bahru"
];
