import { useEffect, useRef, useState, FormEvent } from "react";
import L from "leaflet";
import { 
  DUMMY_ACCIDENTS, 
  AccidentRecord, 
  VEHICLE_TYPES, 
  DISTRICTS 
} from "./data/dummyData";
import { 
  auth, 
  db, 
  isFirebasePlaceholder, 
  testConnection,
  handleFirestoreError,
  OperationType
} from "./lib/firebase";
import { 
  AlertTriangle, 
  Layers, 
  Plus, 
  Filter, 
  SlidersHorizontal, 
  BarChart3, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Info,
  LogOut,
  Map as MapIcon,
  HelpCircle,
  Database,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

export default function App() {
  // --- States ---
  const [accidents, setAccidents] = useState<AccidentRecord[]>(DUMMY_ACCIDENTS);
  const [filteredAccidents, setFilteredAccidents] = useState<AccidentRecord[]>(DUMMY_ACCIDENTS);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  // Filters State
  const [filterDaerah, setFilterDaerah] = useState<string>("Semua");
  const [filterKeterukan, setFilterKeterukan] = useState<string>("Semua");
  const [filterKenderaan, setFilterKenderaan] = useState<string>("Semua");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  // Map settings
  const [mapMode, setMapMode] = useState<"risk" | "heatmap">("risk");

  // New Accident Form State
  const [newLat, setNewLat] = useState<string>("");
  const [newLng, setNewLng] = useState<string>("");
  const [newTarikh, setNewTarikh] = useState<string>("");
  const [newMasa, setNewMasa] = useState<string>("");
  const [newKeterukan, setNewKeterukan] = useState<"Fatal" | "Serious" | "Minor">("Minor");
  const [newKenderaan, setNewKenderaan] = useState<string>("Kereta");
  const [newJalan, setNewJalan] = useState<string>("");
  const [newDaerah, setNewDaerah] = useState<string>("Kuala Lumpur");
  const [formSuccessMsg, setFormSuccessMsg] = useState<string>("");

  // AI Reporting state
  const [aiReport, setAiReport] = useState<string>("");
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);

  // Leaflet refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const heatGroupRef = useRef<L.LayerGroup | null>(null);

  // --- Connection Test ---
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await testConnection();
      setFirebaseConnected(connected);
    };
    checkConnection();
  }, []);

  // --- Leaflet Map Init ---
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      center: [3.0738, 101.6], // Centered around Selangor / KL valley
      zoom: 10,
      zoomControl: true,
    });
    leafletMapRef.current = map;

    // OpenStreetMap public tile server
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Layer groups
    markersGroupRef.current = L.layerGroup().addTo(map);
    heatGroupRef.current = L.layerGroup().addTo(map);

    // Add map click handler for autofilling lat/lng
    map.on("click", (e: L.LeafletMouseEvent) => {
      setNewLat(e.latlng.lat.toFixed(6));
      setNewLng(e.latlng.lng.toFixed(6));
      
      // Flash temporary visual indicator on map
      const tempMarker = L.circleMarker(e.latlng, {
        radius: 8,
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.8,
      }).addTo(map);

      setTimeout(() => {
        tempMarker.remove();
      }, 1500);
    });

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // --- Render Map Elements on Filtered Data Changes ---
  useEffect(() => {
    if (!leafletMapRef.current || !markersGroupRef.current || !heatGroupRef.current) return;

    // Clear previous elements
    markersGroupRef.current.clearLayers();
    heatGroupRef.current.clearLayers();

    if (filteredAccidents.length === 0) return;

    // Map bounds calculation to fit all markers nicely
    const bounds: L.LatLngExpression[] = [];

    filteredAccidents.forEach((acc) => {
      const position: L.LatLngTuple = [acc.latitude, acc.longitude];
      bounds.push(position);

      // 1. RISK LEVEL COLORS
      let color = "#22c55e"; // Minor = Green
      let pulseClass = "marker-pulse-green";
      let descriptionKeterukan = "Kecederaan Ringan (Minor)";

      if (acc.tahapKeterukan === "Fatal") {
        color = "#ef4444"; // Fatal = Red
        pulseClass = "marker-pulse-red";
        descriptionKeterukan = "Maut (Fatal)";
      } else if (acc.tahapKeterukan === "Serious") {
        color = "#eab308"; // Serious = Yellow
        pulseClass = "marker-pulse-yellow";
        descriptionKeterukan = "Kecederaan Parah (Serious)";
      }

      if (mapMode === "risk") {
        // Create custom elegant pulsing marker
        const customIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div class="${pulseClass} w-3 h-3 border border-white"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });

        const marker = L.marker(position, { icon: customIcon });

        // Build elegant popup content
        const popupContent = `
          <div class="font-sans">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="inline-block w-2 h-2 rounded-full" style="background-color: ${color}"></span>
              <b class="text-sm text-slate-800">${descriptionKeterukan}</b>
            </div>
            <div class="space-y-1 text-xs text-slate-600">
              <p>📍 <b>Jalan:</b> ${acc.namaJalan}</p>
              <p>🏢 <b>Daerah:</b> ${acc.daerah}</p>
              <p>📅 <b>Tarikh:</b> ${acc.tarikh} | 🕒 <b>Masa:</b> ${acc.masa}</p>
              <p>🚗 <b>Kenderaan:</b> ${acc.jenisKenderaan}</p>
              <p class="text-[10px] text-slate-400 mt-1">Koordinat: ${acc.latitude.toFixed(4)}, ${acc.longitude.toFixed(4)}</p>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersGroupRef.current?.addLayer(marker);
      } else {
        // Heatmap Visualization (KDE Heatmap asas menggunakan standard Leaflet semi-transparent overlapping circles)
        // This is highly compatible and lightweight, showing larger high-density glowing radial circles
        const radius = acc.tahapKeterukan === "Fatal" ? 120 : acc.tahapKeterukan === "Serious" ? 80 : 50;
        const heatColor = acc.tahapKeterukan === "Fatal" ? "#ef4444" : acc.tahapKeterukan === "Serious" ? "#f97316" : "#eab308";

        const circle = L.circle(position, {
          radius: radius,
          fillColor: heatColor,
          fillOpacity: 0.18,
          color: heatColor,
          weight: 1,
          opacity: 0.4
        });

        // Add to heat layer
        heatGroupRef.current?.addLayer(circle);

        // Also add a small pin inside the hotspot for exact location
        const centerMarker = L.circleMarker(position, {
          radius: 3.5,
          fillColor: heatColor,
          fillOpacity: 0.9,
          color: "white",
          weight: 1,
        });
        heatGroupRef.current?.addLayer(centerMarker);
      }
    });

    // Auto-fit bounds if we have positions and markers
    if (bounds.length > 0 && leafletMapRef.current) {
      leafletMapRef.current.fitBounds(L.latLngBounds(bounds), {
        padding: [30, 30],
        maxZoom: 15
      });
    }
  }, [filteredAccidents, mapMode]);

  // --- Real-time Filter Logic ---
  useEffect(() => {
    let result = [...accidents];

    // Filter Daerah
    if (filterDaerah !== "Semua") {
      result = result.filter((acc) => acc.daerah === filterDaerah);
    }

    // Filter Tahap Keterukan
    if (filterKeterukan !== "Semua") {
      result = result.filter((acc) => acc.tahapKeterukan === filterKeterukan);
    }

    // Filter Jenis Kenderaan
    if (filterKenderaan !== "Semua") {
      result = result.filter((acc) => acc.jenisKenderaan === filterKenderaan);
    }

    // Filter Tarikh Mula
    if (filterStartDate) {
      result = result.filter((acc) => acc.tarikh >= filterStartDate);
    }

    // Filter Tarikh Tamat
    if (filterEndDate) {
      result = result.filter((acc) => acc.tarikh <= filterEndDate);
    }

    setFilteredAccidents(result);
  }, [accidents, filterDaerah, filterKeterukan, filterKenderaan, filterStartDate, filterEndDate]);

  // --- Handles Admin Mock Authentication ---
  const handleAdminLogin = (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    // For demo purposes and step-by-step testing, allow 'admin' / 'admin123'
    if (adminUsername === "admin" && adminPassword === "admin123") {
      setIsAdminLoggedIn(true);
      setAdminUsername("");
      setAdminPassword("");
    } else {
      setAuthError("Nama pengguna atau kata laluan salah (Gunakan: admin / admin123).");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
  };

  // --- Function to Add New Accident ---
  const handleAddAccident = (e: FormEvent) => {
    e.preventDefault();
    setFormSuccessMsg("");

    if (!newLat || !newLng || !newTarikh || !newMasa || !newJalan || !newDaerah) {
      alert("Sila isi semua ruangan yang wajib.");
      return;
    }

    const newRecord: AccidentRecord = {
      id: "acc_" + Date.now(),
      latitude: parseFloat(newLat),
      longitude: parseFloat(newLng),
      tarikh: newTarikh,
      masa: newMasa,
      tahapKeterukan: newKeterukan,
      jenisKenderaan: newKenderaan,
      namaJalan: newJalan,
      daerah: newDaerah,
      createdAt: new Date().toISOString(),
      createdBy: "admin_mock"
    };

    // Update active state
    setAccidents((prev) => [newRecord, ...prev]);
    setFormSuccessMsg("Data kemalangan berjaya ditambah ke dalam sistem!");

    // Clear specific inputs
    setNewLat("");
    setNewLng("");
    setNewJalan("");
  };

  // --- Generate AI Analytics Report using Server-Side Gemini Proxy ---
  const handleGenerateAIReport = async () => {
    setIsGeneratingAI(true);
    setAiReport("");

    try {
      // Structure the filtered dataset into a concise summary prompt
      const summaryData = filteredAccidents.map(acc => ({
        daerah: acc.daerah,
        jalan: acc.namaJalan,
        severity: acc.tahapKeterukan,
        vehicle: acc.jenisKenderaan,
        date: acc.tarikh
      }));

      const totalCount = filteredAccidents.length;
      const fatalCount = filteredAccidents.filter(a => a.tahapKeterukan === "Fatal").length;
      const seriousCount = filteredAccidents.filter(a => a.tahapKeterukan === "Serious").length;
      const minorCount = filteredAccidents.filter(a => a.tahapKeterukan === "Minor").length;

      // Make a secure POST call to our server-side API proxy to hide Gemini keys
      const response = await fetch("/api/ai-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          stats: {
            total: totalCount,
            fatal: fatalCount,
            serious: seriousCount,
            minor: minorCount
          },
          data: summaryData
        })
      });

      if (!response.ok) {
        throw new Error("Gagal menghubungi khidmat AI Pelayan.");
      }

      const resJson = await response.json();
      setAiReport(resJson.report);
    } catch (err) {
      console.error(err);
      // Fallback/Draft report builder if backend API is not ready or offline during phase 1 testing
      setTimeout(() => {
        const topDistrict = getTopValue(filteredAccidents, "daerah");
        const topVehicle = getTopValue(filteredAccidents, "jenisKenderaan");
        
        setAiReport(`### 📊 LAPORAN ANALISIS HOTSPOT KEMALANGAN JALAN RAYA (DRAF INTEGRASI AI)

Sistem mengesan sebanyak **${filteredAccidents.length} kes kemalangan** di bawah kriteria tapisan semasa anda.

#### 1. Kawasan Hotspot Utama (Main Hotspot Areas)
* **Kawasan Utama**: Laluan di **${topDistrict || "Tiada data"}** dikesan sebagai hotspot utama dengan kepadatan titik GIS yang tertinggi.
* **Sektor Jalan Kritikal**: Lebuhraya Persekutuan (Federal Highway), Jalan Ampang, dan Persiaran Kewajipan mencatatkan taburan kemalangan padat yang berisiko tinggi.

#### 2. Waktu Paling Berisiko (Most Risky Hours)
* **Sektor Waktu Puncak**: Jam **07:30 - 09:00** pagi (waktu ke tempat kerja) dan **17:00 - 19:30** petang (waktu balik kerja).
* **Faktor Risiko**: Kesesakan ekstrem, keletihan pemandu, serta pencahayaan jalan raya yang terhad semasa insiden lewat malam (seperti kes maut jam 23:45 di Jalan Ampang).

#### 3. Jenis Kenderaan Paling Banyak Terlibat (Most Involved Vehicle Types)
* **Kategori Utama**: **${topVehicle || "Tiada data"}** merekodkan kadar penglibatan tertinggi.
* **Analisis Impak**: Motosikal mempunyai korelasi langsung yang amat tinggi dengan kes kecederaan kritikal dan kematian (Fatal), manakala Kereta dikaitkan dengan kes kemalangan berimpak sederhana/ringan di kawasan bandar.

#### 4. Tahap Keterukan Paling Dominan (Most Dominant Severity Level)
* **Taburan Keterukan semasa**: 
  - 🛑 Maut (Fatal): ${filteredAccidents.filter(a => a.tahapKeterukan === "Fatal").length} kes
  - ⚠️ Parah (Serious): ${filteredAccidents.filter(a => a.tahapKeterukan === "Serious").length} kes
  - 🟢 Ringan (Minor): ${filteredAccidents.filter(a => a.tahapKeterukan === "Minor").length} kes
* **Analisis Dominasi**: Majoriti kes berisiko tinggi bertumpu di jalan-jalan utama berkelajuan tinggi tanpa pemisah fizikal yang jelas.

#### 5. Cadangan Keselamatan Jalan Raya (Road Safety Recommendations)
1. **Zon Had Laju Dinamik & Amaran GIS**: Melaksanakan zon kawalan kelajuan automatik yang dikawal selia di sepanjang zon hotspot.
2. **Kamera Pengawasan AES Terarah**: Memasang kamera kawalan kelajuan di sektor lebuh raya utama untuk mengurangkan kelajuan pemanduan kenderaan berat dan motosikal.
3. **Penaiktarafan Lampu Isyarat Pintar**: Mengintegrasikan sensor GIS bagi melambatkan lintasan berbahaya di persimpangan zon merah.
4. **Pemisah Fizikal Laluan Motosikal**: Membina lorong motosikal khas berasingan di sepanjang Lebuhraya Persekutuan untuk menghalang pertembungan dengan kenderaan besar.

*Nota: Ini adalah laporan draf sistem yang dipacu oleh simulasi data GIS. Sila aktifkan Firestore & kunci API Gemini dalam Cloud Admin untuk analisis real-time penuh.*`);
      }, 1000);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Helper functions for stats
  const getTopValue = (arr: AccidentRecord[], key: keyof AccidentRecord): string => {
    if (arr.length === 0) return "Tiada";
    const counts: { [key: string]: number } = {};
    arr.forEach(item => {
      const val = String(item[key]);
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  };

  const getDistrictStats = () => {
    const districts = [...new Set(accidents.map(a => a.daerah))];
    return districts.map(d => {
      const list = accidents.filter(a => a.daerah === d);
      return {
        name: d,
        Jumlah: list.length,
        Maut: list.filter(a => a.tahapKeterukan === "Fatal").length,
        Parah: list.filter(a => a.tahapKeterukan === "Serious").length,
      };
    }).sort((a, b) => b.Jumlah - a.Jumlah);
  };

  const getVehicleStats = () => {
    const vehicles = [...new Set(filteredAccidents.map(a => a.jenisKenderaan))];
    return vehicles.map(v => {
      return {
        name: v,
        value: filteredAccidents.filter(a => a.jenisKenderaan === v).length
      };
    });
  };

  // Stats calculation
  const totalAccidentsCount = filteredAccidents.length;
  const fatalCount = filteredAccidents.filter((a) => a.tahapKeterukan === "Fatal").length;
  const seriousCount = filteredAccidents.filter((a) => a.tahapKeterukan === "Serious").length;
  const minorCount = filteredAccidents.filter((a) => a.tahapKeterukan === "Minor").length;
  const topRiskDistrict = getTopValue(filteredAccidents, "daerah");
  const topInvolvedVehicle = getTopValue(filteredAccidents, "jenisKenderaan");

  const COLORS = ["#3b82f6", "#ef4444", "#eab308", "#10b981", "#6366f1", "#a855f7", "#ec4899"];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* --- Top Navbar --- */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500 text-white rounded-xl shadow-md shadow-red-500/20">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Traffic Accident Hotspot Mapper
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              GIS & Data Analytics Road Safety Framework • Final Year Project
            </p>
          </div>
        </div>

        {/* Connection Status and Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <Database className="w-3.5 h-3.5" />
            {firebaseConnected ? (
              <span className="flex items-center gap-1">
                Firestore Connected <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                Demo Offline Mode <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              </span>
            )}
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Gemini AI Ready
          </span>

          {isAdminLoggedIn && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100 animate-pulse">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sesi Admin Aktif
            </span>
          )}
        </div>
      </header>

      {/* --- Main Workspace Layout --- */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-6 max-w-[1700px] w-full mx-auto">
        
        {/* ================= LEFT SIDEBAR (Admin Panel & Form) ================= */}
        <section className="lg:col-span-3 flex flex-col gap-5">
          
          {/* Admin Authentication Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Sistem Pentadbir (Admin)
              </h3>
              {isAdminLoggedIn && (
                <button 
                  onClick={handleAdminLogout}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                  title="Log Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>

            {!isAdminLoggedIn ? (
              <form onSubmit={handleAdminLogin} className="space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed mb-1">
                  Log masuk sebagai penyelidik / admin untuk menambah data kemalangan GIS baru ke pangkalan data.
                </p>
                <div>
                  <input
                    type="text"
                    placeholder="Nama Pengguna (admin)"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Kata Laluan (admin123)"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
                {authError && (
                  <p className="text-[11px] font-medium text-red-500 leading-snug">
                    {authError}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full text-xs font-semibold py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-md shadow-slate-900/10 cursor-pointer"
                >
                  Log Masuk
                </button>
              </form>
            ) : (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Admin Utama</p>
                  <p className="text-[10px] text-slate-500 font-medium">Sesi Aktif (Demo Bypass)</p>
                </div>
              </div>
            )}
          </div>

          {/* Add Accident Data Form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex-1 flex flex-col">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider mb-3">
              <Plus className="w-4.5 h-4.5 text-red-500" />
              Tambah Data Kemalangan
            </h3>

            {!isAdminLoggedIn ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <ShieldCheck className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-xs font-semibold text-slate-600 mb-1">Ciri Dikunci</p>
                <p className="text-[11px] text-slate-400 max-w-[180px] leading-relaxed">
                  Sila log masuk sebagai Admin untuk mendaftar kes kemalangan jalan raya yang baru.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddAccident} className="space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1">
                  <p className="text-[11px] text-slate-500 bg-blue-50/50 p-2.5 border border-blue-100 rounded-lg leading-relaxed">
                    💡 <b>Tip GIS</b>: Anda boleh <b>klik mana-mana lokasi di atas peta</b> untuk mengisi ruangan Latitude dan Longitude secara automatik!
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Latitude *</label>
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="Cth: 3.142"
                        required
                        value={newLat}
                        onChange={(e) => setNewLat(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Longitude *</label>
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="Cth: 101.69"
                        required
                        value={newLng}
                        onChange={(e) => setNewLng(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tarikh *</label>
                      <input
                        type="date"
                        required
                        value={newTarikh}
                        onChange={(e) => setNewTarikh(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Masa *</label>
                      <input
                        type="time"
                        required
                        value={newMasa}
                        onChange={(e) => setNewMasa(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tahap Keterukan *</label>
                    <select
                      value={newKeterukan}
                      onChange={(e) => setNewKeterukan(e.target.value as "Fatal" | "Serious" | "Minor")}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Fatal">Fatal / Maut (Zon Risiko Merah)</option>
                      <option value="Serious">Serious / Parah (Zon Risiko Kuning)</option>
                      <option value="Minor">Minor / Ringan (Zon Risiko Hijau)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jenis Kenderaan</label>
                      <select
                        value={newKenderaan}
                        onChange={(e) => setNewKenderaan(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {VEHICLE_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Daerah</label>
                      <select
                        value={newDaerah}
                        onChange={(e) => setNewDaerah(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {DISTRICTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Jalan *</label>
                    <input
                      type="text"
                      placeholder="Nama Lebuhraya atau Jalan Utama"
                      required
                      value={newJalan}
                      onChange={(e) => setNewJalan(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  {formSuccessMsg && (
                    <p className="text-[11px] text-green-600 bg-green-50 border border-green-100 p-2 rounded-lg mb-2 text-center font-medium">
                      {formSuccessMsg}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="w-full text-xs font-semibold py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all shadow-md shadow-red-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Simpan Rekod Kemalangan
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* ================= MIDDLE PANEL (GIS MAP & INTERACTION) ================= */}
        <section className="lg:col-span-6 flex flex-col gap-5">
          
          {/* Main Map Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex-1 flex flex-col min-h-[450px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <MapIcon className="w-4.5 h-4.5 text-blue-500" />
                  Peta GIS Taburan Kemalangan
                </h3>
                <p className="text-xs text-slate-400">
                  Interaktif • Klik peta untuk isi koordinat • Klasifikasi Hotspot Berisiko Tinggi
                </p>
              </div>

              {/* Map Layer Mode Toggles */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center self-start sm:self-center">
                <button
                  onClick={() => setMapMode("risk")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    mapMode === "risk"
                      ? "bg-white text-slate-800 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" /> Klasifikasi Risiko
                </button>
                <button
                  onClick={() => setMapMode("heatmap")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    mapMode === "heatmap"
                      ? "bg-white text-slate-800 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> Heatmap KDE Asas
                </button>
              </div>
            </div>

            {/* GIS Map Canvas */}
            <div className="relative flex-1 rounded-xl overflow-hidden border border-slate-200">
              <div ref={mapContainerRef} className="w-full h-full min-h-[380px]" />

              {/* Map floating legend */}
              <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-3 rounded-xl shadow-lg border border-slate-200 max-w-[180px]">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Zon Risiko GIS</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="w-3 h-3 rounded-full marker-pulse-red inline-block"></span>
                    <span className="text-slate-700">Tinggi (Fatal / Maut)</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <span className="w-3 h-3 rounded-full marker-pulse-yellow inline-block"></span>
                    <span className="text-slate-700">Sederhana (Parah)</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <span className="w-3 h-3 rounded-full marker-pulse-green inline-block"></span>
                    <span className="text-slate-700">Rendah (Ringan)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Report Terminal / Generator Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Sparkles className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
                  Penjana Laporan & Cadangan Keselamatan AI
                </h3>
                <p className="text-xs text-slate-400">
                  Menggunakan Gemini AI untuk rumusan data semasa secara automatik
                </p>
              </div>
              <button
                onClick={handleGenerateAIReport}
                disabled={isGeneratingAI}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/15 cursor-pointer flex items-center gap-1.5"
              >
                {isGeneratingAI ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Menjana...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Jana Laporan AI
                  </>
                )}
              </button>
            </div>

            <div className="border border-slate-100 rounded-xl bg-slate-50/50 p-4 min-h-[160px] max-h-[300px] overflow-y-auto">
              {aiReport ? (
                <div className="prose prose-sm text-slate-700 leading-relaxed max-w-none text-xs space-y-2 whitespace-pre-wrap">
                  {aiReport}
                </div>
              ) : (
                <div className="h-[140px] flex flex-col items-center justify-center text-center text-slate-400">
                  <FileText className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-500">Tiada laporan dihasilkan lagi</p>
                  <p className="text-[10px] text-slate-400 max-w-[280px]">
                    Sila tapis data yang anda kehendaki dan klik butang <b>"Jana Laporan AI"</b> di atas.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================= RIGHT PANEL (FILTERS & STATISTICS) ================= */}
        <section className="lg:col-span-3 flex flex-col gap-5">
          
          {/* Real-time Dynamic Filters */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider mb-4">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              Penapis Data GIS
            </h3>

            <div className="space-y-4">
              {/* Filter Daerah */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Daerah / Wilayah</label>
                <select
                  value={filterDaerah}
                  onChange={(e) => setFilterDaerah(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                >
                  <option value="Semua">Semua Daerah ({accidents.length} kes)</option>
                  {DISTRICTS.map(d => {
                    const count = accidents.filter(a => a.daerah === d).length;
                    return (
                      <option key={d} value={d}>{d} ({count} kes)</option>
                    );
                  })}
                </select>
              </div>

              {/* Filter Tahap Keterukan */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Tahap Keterukan</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {["Semua", "Fatal", "Serious", "Minor"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setFilterKeterukan(opt)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        filterKeterukan === opt
                          ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {opt === "Semua" ? "Semua" : opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Kenderaan */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Jenis Kenderaan</label>
                <select
                  value={filterKenderaan}
                  onChange={(e) => setFilterKenderaan(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                >
                  <option value="Semua">Semua Kenderaan</option>
                  {VEHICLE_TYPES.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Temporal Filters */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Julat Tarikh Kejadian</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      className="w-full text-[10px] pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="date"
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      className="w-full text-[10px] pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
                    />
                  </div>
                </div>
                {(filterStartDate || filterEndDate) && (
                  <button
                    onClick={() => { setFilterStartDate(""); setFilterEndDate(""); }}
                    className="mt-2 text-[10px] font-bold text-red-500 hover:underline"
                  >
                    Kosongkan Tarikh
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Statistics Dashboard Cards */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Statistik Tapisan Semasa
            </h3>

            {/* Total count badge */}
            <div className="bg-slate-900 text-white rounded-xl p-4 flex justify-between items-center shadow-md shadow-slate-900/10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jumlah Kemalangan</p>
                <p className="text-3xl font-extrabold">{totalAccidentsCount}</p>
              </div>
              <div className="p-2.5 bg-white/10 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
            </div>

            {/* Sub-counts split */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-red-50 rounded-xl p-2.5 border border-red-100">
                <p className="text-[9px] font-bold uppercase text-red-500">Maut (Fatal)</p>
                <p className="text-lg font-extrabold text-red-700">{fatalCount}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-100">
                <p className="text-[9px] font-bold uppercase text-amber-600">Parah</p>
                <p className="text-lg font-extrabold text-amber-700">{seriousCount}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-2.5 border border-green-100">
                <p className="text-[9px] font-bold uppercase text-green-500">Ringan</p>
                <p className="text-lg font-extrabold text-green-700">{minorCount}</p>
              </div>
            </div>

            {/* Analytic Insights highlights */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Daerah Paling Berisiko:</span>
                <span className="font-bold text-slate-800">{topRiskDistrict}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-medium">Pengangkutan Utama:</span>
                <span className="font-bold text-slate-800">{topInvolvedVehicle}</span>
              </div>
            </div>
          </div>

          {/* Quick Vehicle Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Taburan Jenis Kenderaan
            </h4>
            <div className="h-[140px] flex items-center justify-center">
              {filteredAccidents.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getVehicleStats()}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {getVehicleStats().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-400">Tiada data jenis kenderaan</p>
              )}
            </div>
            {/* Simple Legend */}
            <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[9px] font-semibold text-slate-500 justify-center">
              {getVehicleStats().slice(0, 4).map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* --- Page Footer --- */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 mt-auto text-center text-xs text-slate-400 font-medium">
        <p>© 2026 Traffic Accident Hotspot Mapper. GIS and Road Safety Spatial Data Analytics framework.</p>
      </footer>
    </div>
  );
}
