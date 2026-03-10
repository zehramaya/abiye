import React, { useState, useEffect } from "react";
import { Key, Settings2, X, Zap, LayoutGrid, Shield, Gem, ArrowRight, Layers, Upload, SlidersHorizontal, Sparkles, Grid3X3 } from "lucide-react";
import { Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUploader } from "./components/ImageUploader";
import { ShootModeToggle, ViewSubTabs } from "./components/ViewModeNav";
import { ViewPage } from "./pages/ViewPage";
import { ResultGallery } from "./components/ResultGallery";
import { fal } from "@fal-ai/client";
import { generateBridalImage, AIModelId, ViewMode } from "./services/falApi";
import logoUrl from "./logo.jpg";

interface GenerationResult {
  id: string;
  url: string;
  timestamp: string;
  engine: string;
  seed: number;
  viewMode: string;
}

const FloatingParticles: React.FC = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 15,
    duration: 10 + Math.random() * 20,
    size: 1 + Math.random() * 2,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [dressUrl, setDressUrl] = useState<string>("");
  const [modelUrl, setModelUrl] = useState<string>("");
  const [locationUrl, setLocationUrl] = useState<string>("");
  const [engine, setEngine] = useState<AIModelId>("fal-ai/nano-banana-pro/edit");
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const quality = "quality" as const;
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [falKey, setFalKey] = useState<string>(localStorage.getItem("FAL_KEY") || import.meta.env.VITE_FAL_KEY || "");
  const [showSettings, setShowSettings] = useState<boolean>(!localStorage.getItem("FAL_KEY") && !import.meta.env.VITE_FAL_KEY);
  const [progressMsg, setProgressMsg] = useState<string>("");
  const [shootMode, setShootMode] = useState<"studio" | "location">("studio");

  const location = useLocation();

  const getCurrentViewMode = (): ViewMode => {
    if (location.pathname === "/back") return "back";
    if (location.pathname === "/closeup") return "closeup";
    if (location.pathname === "/location") return "location";
    if (location.pathname === "/location-closeup") return "location-closeup";
    return "front";
  };

  useEffect(() => {
    if (falKey) {
      localStorage.setItem("FAL_KEY", falKey);
      fal.config({ credentials: falKey });
    }
  }, [falKey]);

  // Sync shootMode with route
  useEffect(() => {
    if (location.pathname === "/location" || location.pathname === "/location-closeup") {
      setShootMode("location");
    } else if (shootMode === "location" && location.pathname !== "/location" && location.pathname !== "/location-closeup") {
      setShootMode("studio");
    }
  }, [location.pathname]);

  // Auto-switch to Nano Banana Pro for back/closeup/location views
  useEffect(() => {
    const viewMode = getCurrentViewMode();
    if (viewMode !== "front" && engine !== "fal-ai/nano-banana-pro/edit") {
      setEngine("fal-ai/nano-banana-pro/edit");
    }
  }, [location.pathname]);

  const handleGenerate = async () => {
    const viewMode = getCurrentViewMode();

    if (!dressUrl || !modelUrl) {
      alert("Lütfen hem tasarım hem de model görselini yükleyin.");
      return;
    }

    if ((viewMode === "location" || viewMode === "location-closeup") && !locationUrl) {
      alert("Lütfen mekan fotoğrafını yükleyin.");
      return;
    }

    if (!falKey) {
      alert("Lütfen Fal.ai API anahtarınızı girin.");
      setShowSettings(true);
      return;
    }

    try {
      setIsLoading(true);
      setProgressMsg("Editoryal Veriler Senkronize Ediliyor...");

      const currentSeed = seed || Math.floor(Math.random() * 1000000);

      const response = await generateBridalImage({
        modelId: engine,
        garmentImageUrl: dressUrl,
        modelImageUrl: modelUrl,
        seed: currentSeed,
        quality: quality,
        viewMode: viewMode,
        locationImageUrl: (viewMode === "location" || viewMode === "location-closeup") ? locationUrl : undefined,
      }, (update) => {
        if (update.status === "IN_PROGRESS") {
          const lastLog = update.logs?.[update.logs.length - 1]?.message || "Sanal Couture İşleniyor...";
          setProgressMsg(lastLog);
        }
      });

      const newImageUrl = engine === "fal-ai/fashn/tryon/v1.5"
        ? response.data.images[0].url
        : engine === "fal-ai/idm-vton"
          ? response.data.image.url
          : response.data.images[0].url;

      const viewLabels: Record<string, string> = {
        front: "Ön",
        back: "Arka",
        closeup: "Yakın",
        location: "Mekan",
        "location-closeup": "Dış Yakın",
      };

      const newResult: GenerationResult = {
        id: Math.random().toString(36).substring(7),
        url: newImageUrl,
        timestamp: new Date().toLocaleTimeString(),
        engine: `${viewLabels[viewMode] || "Ön"} · ${engine.split("/").pop() || engine}`,
        seed: currentSeed,
        viewMode: viewMode,
      };

      setResults([newResult, ...results]);
    } catch (error) {
      console.error("Generation error:", error);
      alert("İşlem sırasında bir hata oluştu. Lütfen API anahtarınızı kontrol edin.");
    } finally {
      setIsLoading(false);
      setProgressMsg("");
    }
  };

  const isLocationMode = shootMode === "location";

  return (
    <div className="app-container">
      {/* ─── Sidebar Control Panel ─── */}
      <aside className="sidebar">
        <div className="sidebar-header flex flex-col items-center justify-center pt-6 pb-1">
          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{ width: '100%', height: '50px', position: 'relative', overflow: 'hidden' }}
          >
            <img
              src={logoUrl}
              alt="FashionMaster"
              className="opacity-90 transition-opacity hover:opacity-100"
              style={{
                position: 'absolute',
                top: '55%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200px',
                maxWidth: 'none',
                mixBlendMode: 'screen'
              }}
            />
          </motion.div>
          <div className="text-center">
            <p className="text-[8px] text-white/25 font-bold uppercase tracking-[0.3em]">Haute Couture Stüdyo</p>
          </div>
        </div>

        <div className="sidebar-content scroll-area space-y-2">
          {/* Card 1: Çekim Modu Toggle */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="sidebar-card"
          >
            <div className="section-header">
              <div className="section-header-icon bg-[#c5a059]/10">
                <Layers size={12} className="text-[#c5a059]" />
              </div>
              <h2 className="section-header-title">Çekim Modu</h2>
            </div>
            <ShootModeToggle shootMode={shootMode} onShootModeChange={setShootMode} />
          </motion.section>

          {/* Card 2: Görünüm Seçimi (Sub-Tabs) */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="sidebar-card"
          >
            <div className="section-header">
              <div className="section-header-icon bg-blue-500/10">
                <Grid3X3 size={12} className="text-blue-400" />
              </div>
              <h2 className="section-header-title">Görünüm Seçimi</h2>
            </div>
            <ViewSubTabs shootMode={shootMode} />
          </motion.section>

          {/* Card 3: AI İşlem Düğümleri (Düğüm Seçimi) */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="sidebar-card"
          >
            <div className="section-header">
              <div className="section-header-icon bg-amber-500/10">
                <Settings2 size={12} className="text-amber-400" />
              </div>
              <h2 className="section-header-title">İşlem Düğümü</h2>
            </div>
            <div className="space-y-3">
               <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <select 
                    value={engine}
                    onChange={(e) => setEngine(e.target.value as AIModelId)}
                    className="w-full bg-transparent text-[11px] font-medium text-white/80 outline-none cursor-pointer"
                  >
                    <option value="fal-ai/nano-banana-pro/edit" className="bg-[#121212]">ANA PROTOKOL v.01 (FAL)</option>
                    <option value="fal-ai/fashn/tryon/v1.5" className="bg-[#121212]">FASHN ÇEKİRDEK 1.5</option>
                    <option value="fal-ai/idm-vton" className="bg-[#121212]">IDM HİBRİT</option>
                  </select>
               </div>
               <p className="text-[8px] text-white/20 px-1 italic">Not: Görünüm moduna göre otomatik optimize edilir.</p>
            </div>
          </motion.section>

          {/* Card 4: Parametreler (altta) */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="sidebar-card"
          >
            <div className="section-header">
              <div className="section-header-icon bg-cyan-500/10">
                <SlidersHorizontal size={12} className="text-cyan-400" />
              </div>
              <h2 className="section-header-title">Parametreler</h2>
            </div>
            <div className="space-y-3">
              {/* Quality Badge */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-semibold text-white/35 block pl-0.5 uppercase tracking-[0.12em]">Çıktı Kalitesi</label>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/[0.06] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#c5a059]/[0.03] to-transparent pointer-events-none" />
                  <div className="relative flex items-center gap-1.5">
                    <Sparkles size={10} className="text-[#c5a059]/60" />
                    <span className="text-[10px] font-semibold text-white/90 tracking-wider">4K Ultra</span>
                  </div>
                  <span className="text-[8px] text-[#c5a059]/50 ml-auto font-bold uppercase tracking-widest relative">Sabit</span>
                </div>
              </div>

              {/* Seed Input */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-semibold text-white/35 block pl-0.5 uppercase tracking-[0.12em]">Sabit Tohum (Seed)</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Rastgele Seçim"
                    value={seed || ""}
                    onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="input-modern pr-10 !py-2.5 !text-[12px]"
                  />
                  <Zap size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c5a059]/30" />
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        {/* System Access Button */}
        <div className="px-3 py-2.5 relative z-[1]" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/[0.06] text-[9px] font-semibold text-white/50 hover:text-white/80 hover:border-white/[0.1] hover:from-white/[0.05] hover:to-white/[0.02] transition-all duration-300 uppercase tracking-[0.15em] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#c5a059]/0 via-[#c5a059]/[0.03] to-[#c5a059]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <Shield size={11} className="relative" /> <span className="relative">Sistem Erişimi</span>
          </motion.button>
        </div>
      </aside>

      {/* ─── Main Production Stage ─── */}
      <main className="main-stage">
        <Routes>
          <Route
            path="/"
            element={
              <ViewPage
                title="Ön Görünüm"
                subtitle="Editoryal Ön Çekim Modu"
                accentColor="#c5a059"
                viewMode="front"
                onDressUrlChange={setDressUrl}
                onModelUrlChange={setModelUrl}
                isLoading={isLoading}
                onGenerate={handleGenerate}
                canGenerate={!!dressUrl && !!modelUrl}
                progressMsg={progressMsg}
              />
            }
          />
          <Route
            path="/back"
            element={
              <ViewPage
                title="Arka Görünüm"
                subtitle="Kilitli Arka Çekim Modu"
                accentColor="#59a0c5"
                viewMode="back"
                onDressUrlChange={setDressUrl}
                onModelUrlChange={setModelUrl}
                isLoading={isLoading}
                onGenerate={handleGenerate}
                canGenerate={!!dressUrl && !!modelUrl}
                progressMsg={progressMsg}
              />
            }
          />
          <Route
            path="/closeup"
            element={
              <ViewPage
                title="Yakın Plan"
                subtitle="Makro Detay Çekim Modu"
                accentColor="#a059c5"
                viewMode="closeup"
                onDressUrlChange={setDressUrl}
                onModelUrlChange={setModelUrl}
                isLoading={isLoading}
                onGenerate={handleGenerate}
                canGenerate={!!dressUrl && !!modelUrl}
                progressMsg={progressMsg}
              />
            }
          />
          <Route
            path="/location"
            element={
              <ViewPage
                title="Mekan Çekimi"
                subtitle="Dış Mekan Editoryal Modu"
                accentColor="#59c5a0"
                viewMode="location"
                onDressUrlChange={setDressUrl}
                onModelUrlChange={setModelUrl}
                onLocationUrlChange={setLocationUrl}
                isLoading={isLoading}
                onGenerate={handleGenerate}
                canGenerate={!!dressUrl && !!modelUrl && !!locationUrl}
                progressMsg={progressMsg}
              />
            }
          />
          <Route
            path="/location-closeup"
            element={
              <ViewPage
                title="Dış Mekan Yakın Plan"
                subtitle="Outdoor Arka Plan Üretici"
                accentColor="#a0c559"
                viewMode="location-closeup"
                onDressUrlChange={setDressUrl}
                onModelUrlChange={setModelUrl}
                onLocationUrlChange={setLocationUrl}
                isLoading={isLoading}
                onGenerate={handleGenerate}
                canGenerate={!!dressUrl && !!modelUrl && !!locationUrl}
                progressMsg={progressMsg}
              />
            }
          />
        </Routes>

        {/* System Dock */}
        <div className="h-10 border-t border-white/[0.04] flex items-center justify-between px-6 bg-black/30 backdrop-blur-xl relative z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot" />
              Sunucu: <span className="text-emerald-400/60 ml-1">Optimal</span>
            </div>
            <div className="h-3 w-[1px] bg-white/[0.06]" />
            <div className="flex items-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-widest">
              Mod: <span className="ml-1" style={{ color: isLocationMode ? "#59c5a0aa" : "#c5a059aa" }}>
                {getCurrentViewMode().toUpperCase()}
              </span>
            </div>
            <div className="h-3 w-[1px] bg-white/[0.06]" />
            <div className="flex items-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-widest">
              Düğüm: <span className="text-[#c5a059]/70 ml-1">{engine.split('/').pop()?.toUpperCase()}</span>
            </div>
          </div>
          <div className="text-[9px] font-mono text-white/8 uppercase font-bold tracking-wider">
            FM_{new Date().toISOString().slice(0,10).replace(/-/g,'')}
          </div>
        </div>
      </main>

      {/* ─── Results History Panel ─── */}
      <aside className="gallery-panel p-5 overflow-hidden">
        <ResultGallery results={results} isLoading={isLoading} />
      </aside>

      {/* ─── Enhanced Settings Modal ─── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/90 z-[1000] flex items-center justify-center p-12 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ y: 40, scale: 0.96, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="max-w-lg w-full card-glass p-10 relative overflow-hidden"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#c5a059] to-transparent opacity-40" />

              {/* Subtle corner glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#c5a059]/5 rounded-full blur-[60px] pointer-events-none" />

              <div className="flex justify-between items-start mb-10">
                <div className="space-y-2">
                  <h2 className="font-display text-3xl font-bold tracking-tight">
                    Sistem <span className="text-[#c5a059]">Merkezi</span>
                  </h2>
                  <p className="text-[10px] text-white/25 uppercase tracking-[0.2em] font-bold">Editoryal Erişim Protokolü</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSettings(false)}
                  className="w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/20 hover:text-white flex items-center justify-center transition-all"
                >
                  <X size={20} strokeWidth={1.5} />
                </motion.button>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#c5a059] uppercase tracking-[0.3em] block pl-1">Fal.ai API Kimlik Bilgileri</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10" size={15} />
                    <input
                      type="password"
                      value={falKey}
                      onChange={(e) => setFalKey(e.target.value)}
                      placeholder="API ANAHTARINIZI BURAYA YAPIŞTIRIN"
                      className="input-modern pl-12 pr-12 focus:border-[#c5a059]/50"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setShowSettings(false)}
                  className="w-full btn-primary"
                >
                  Yetkilendir ve Senkronize Et
                </motion.button>

                <div className="flex items-start gap-4 p-5 rounded-xl bg-white/[0.015] border border-white/[0.04]">
                  <div className="p-2 bg-[#c5a059]/8 rounded-lg flex-shrink-0">
                    <Shield size={13} className="text-[#c5a059]/60" />
                  </div>
                  <p className="text-[10px] text-white/25 leading-relaxed font-medium">
                    Kimlik bilgileriniz yerel tarayıcı önbelleğinizde saklanır ve asla sunucularımıza gönderilmez. Yüksek moda güvenlik kuralları uygulanmaktadır.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
