import React from "react";
import { Eye, RotateCcw, Focus, Camera, MapPin } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type ShootMode = "studio" | "location";

interface ViewTab {
  key: string;
  path: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
}

const studioTabs: ViewTab[] = [
  {
    key: "front",
    path: "/",
    label: "Ön Görünüm",
    sublabel: "Editoryal Çekim",
    icon: <Eye size={16} strokeWidth={1.8} />,
    color: "#c5a059",
  },
  {
    key: "back",
    path: "/back",
    label: "Arka Görünüm",
    sublabel: "Arka Çekim",
    icon: <RotateCcw size={16} strokeWidth={1.8} />,
    color: "#59a0c5",
  },
  {
    key: "closeup",
    path: "/closeup",
    label: "Yakın Plan",
    sublabel: "Detay Çekim",
    icon: <Focus size={16} strokeWidth={1.8} />,
    color: "#a059c5",
  },
];

/* ─── Shoot Mode Toggle (Stüdyo / Mekan) ─── */
interface ShootModeToggleProps {
  shootMode: ShootMode;
  onShootModeChange: (mode: ShootMode) => void;
}

export const ShootModeToggle: React.FC<ShootModeToggleProps> = ({ shootMode, onShootModeChange }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleShootModeChange = (mode: ShootMode) => {
    onShootModeChange(mode);
    if (mode === "location") {
      navigate("/location");
    } else {
      if (location.pathname === "/location" || location.pathname === "/location-closeup") {
        navigate("/");
      }
    }
  };

  return (
    <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-white/[0.015]">
      {/* Stüdyo Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => handleShootModeChange("studio")}
        className={`relative flex items-center gap-2 py-2 px-2.5 rounded-md transition-all duration-400 overflow-hidden
          ${shootMode === "studio"
            ? "bg-[#c5a059]/[0.08] shadow-[0_2px_12px_rgba(197,160,89,0.08)]"
            : "hover:bg-white/[0.03]"
          }`}
      >
        {shootMode === "studio" && (
          <motion.div
            layoutId="shoot-mode-glow"
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(197, 160, 89, 0.08) 0%, transparent 70%)",
            }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          />
        )}

        <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-all duration-400 flex-shrink-0
          ${shootMode === "studio"
            ? "bg-[#c5a059] text-black shadow-[0_0_10px_rgba(197,160,89,0.3)]"
            : "bg-white/[0.04] text-white/40"
          }`}
        >
          <Camera size={13} strokeWidth={1.8} />
        </div>

        <div className="text-left relative z-10">
          <p className={`text-[9px] font-bold tracking-wider transition-colors duration-300
            ${shootMode === "studio" ? "text-white" : "text-white/20"}`}>
            Stüdyo
          </p>
          <p className={`text-[6px] font-bold uppercase tracking-[0.15em] transition-colors duration-300
            ${shootMode === "studio" ? "text-[#c5a059]/50" : "text-white/8"}`}>
            İç Mekan
          </p>
        </div>

        {shootMode === "studio" && (
          <motion.div
            layoutId="shoot-mode-bar"
            className="absolute bottom-0 left-3 right-3 h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-[#c5a059]/60 to-transparent"
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          />
        )}
      </motion.button>

      {/* Mekan Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => handleShootModeChange("location")}
        className={`relative flex items-center gap-2 py-2 px-2.5 rounded-md transition-all duration-400 overflow-hidden
          ${shootMode === "location"
            ? "bg-[#59c5a0]/[0.08] shadow-[0_2px_12px_rgba(89,197,160,0.08)]"
            : "hover:bg-white/[0.03]"
          }`}
      >
        {shootMode === "location" && (
          <motion.div
            layoutId="shoot-mode-glow"
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(89, 197, 160, 0.08) 0%, transparent 70%)",
            }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          />
        )}

        <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-all duration-400 flex-shrink-0
          ${shootMode === "location"
            ? "bg-[#59c5a0] text-black shadow-[0_0_10px_rgba(89,197,160,0.3)]"
            : "bg-white/[0.04] text-white/40"
          }`}
        >
          <MapPin size={13} strokeWidth={1.8} />
        </div>

        <div className="text-left relative z-10">
          <p className={`text-[9px] font-bold tracking-wider transition-colors duration-300
            ${shootMode === "location" ? "text-white" : "text-white/20"}`}>
            Mekan
          </p>
          <p className={`text-[6px] font-bold uppercase tracking-[0.15em] transition-colors duration-300
            ${shootMode === "location" ? "text-[#59c5a0]/50" : "text-white/8"}`}>
            Dış Mekan
          </p>
        </div>

        {shootMode === "location" && (
          <motion.div
            layoutId="shoot-mode-bar"
            className="absolute bottom-0 left-3 right-3 h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-[#59c5a0]/60 to-transparent"
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          />
        )}
      </motion.button>
    </div>
  );
};

/* ─── View Sub-Tabs (Ön Görünüm / Arka Görünüm / Yakın Plan / Location tabs) ─── */
interface ViewSubTabsProps {
  shootMode: ShootMode;
}

export const ViewSubTabs: React.FC<ViewSubTabsProps> = ({ shootMode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveKey = () => {
    if (location.pathname === "/back") return "back";
    if (location.pathname === "/closeup") return "closeup";
    if (location.pathname === "/location") return "location";
    if (location.pathname === "/location-closeup") return "location-closeup";
    return "front";
  };

  const activeKey = getActiveKey();

  return (
    <AnimatePresence mode="wait">
      {shootMode === "studio" && (
        <motion.div
          key="studio-tabs"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-1.5"
        >
          {studioTabs.map((tab) => {
            const isActive = activeKey === tab.key;
            return (
              <motion.button
                key={tab.key}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(tab.path)}
                className={`relative flex items-center gap-2 px-2.5 py-2 rounded-md text-left transition-all duration-300 overflow-hidden
                  ${isActive
                    ? "bg-white/[0.04] border border-white/[0.06]"
                    : "bg-transparent border border-transparent hover:bg-white/[0.02] hover:border-white/[0.03]"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="view-nav-active"
                    className="absolute left-0 top-2.5 bottom-2.5 w-[2px] rounded-full"
                    style={{ background: tab.color, boxShadow: `0 0 8px ${tab.color}40` }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  />
                )}

                {isActive && (
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: `radial-gradient(ellipse at 0% 50%, ${tab.color}08 0%, transparent 60%)`
                  }} />
                )}

                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-300
                    ${isActive ? "text-black" : "bg-white/[0.03] text-white/40"}`}
                  style={
                    isActive
                      ? {
                          background: tab.color,
                          boxShadow: `0 0 10px ${tab.color}30`,
                        }
                      : {}
                  }
                >
                  {tab.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[10px] font-bold tracking-wider transition-colors duration-300
                      ${isActive ? "text-white" : "text-white/25"}`}
                  >
                    {tab.label}
                  </p>
                  <p
                    className={`text-[7px] font-bold uppercase tracking-[0.2em] transition-colors duration-300
                      ${isActive ? "" : "text-white/8"}`}
                    style={isActive ? { color: `${tab.color}80` } : {}}
                  >
                    {tab.sublabel}
                  </p>
                </div>

                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: tab.color, boxShadow: `0 0 6px ${tab.color}50` }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {shootMode === "location" && (
        <motion.div
          key="location-tabs"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-1.5"
        >
          {/* Mekan Çekim */}
          <motion.button
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/location")}
            className={`relative flex items-center gap-2 px-2.5 py-2 rounded-md text-left transition-all duration-300 overflow-hidden
              ${activeKey === "location"
                ? "bg-white/[0.04] border border-white/[0.06]"
                : "bg-transparent border border-transparent hover:bg-white/[0.02] hover:border-white/[0.03]"
              }`}
          >
            {activeKey === "location" && (
              <motion.div
                layoutId="view-nav-active"
                className="absolute left-0 top-2.5 bottom-2.5 w-[2px] rounded-full bg-[#59c5a0]"
                style={{ boxShadow: '0 0 8px rgba(89,197,160,0.4)' }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              />
            )}
            {activeKey === "location" && (
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse at 0% 50%, rgba(89,197,160,0.05) 0%, transparent 60%)'
              }} />
            )}
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-300
                ${activeKey === "location" ? "text-black" : "bg-white/[0.03] text-white/40"}`}
              style={activeKey === "location" ? {
                background: "#59c5a0",
                boxShadow: '0 0 10px rgba(89,197,160,0.3)',
              } : {}}
            >
              <MapPin size={16} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[10px] font-bold tracking-wider transition-colors duration-300
                ${activeKey === "location" ? "text-white" : "text-white/25"}`}>
                Mekan Çekim
              </p>
              <p className={`text-[7px] font-bold uppercase tracking-[0.2em] transition-colors duration-300
                ${activeKey === "location" ? "text-[#59c5a0]/60" : "text-white/8"}`}>
                Dış Mekan Editoryal
              </p>
            </div>
            {activeKey === "location" && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-1.5 h-1.5 rounded-full bg-[#59c5a0] flex-shrink-0" style={{ boxShadow: '0 0 6px rgba(89,197,160,0.5)' }} />
            )}
          </motion.button>

          {/* Yakın Plan (Outdoor Background) */}
          <motion.button
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/location-closeup")}
            className={`relative flex items-center gap-2 px-2.5 py-2 rounded-md text-left transition-all duration-300 overflow-hidden
              ${activeKey === "location-closeup"
                ? "bg-white/[0.04] border border-white/[0.06]"
                : "bg-transparent border border-transparent hover:bg-white/[0.02] hover:border-white/[0.03]"
              }`}
          >
            {activeKey === "location-closeup" && (
              <motion.div
                layoutId="view-nav-active"
                className="absolute left-0 top-2.5 bottom-2.5 w-[2px] rounded-full bg-[#a0c559]"
                style={{ boxShadow: '0 0 8px rgba(160,197,89,0.4)' }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              />
            )}
            {activeKey === "location-closeup" && (
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse at 0% 50%, rgba(160,197,89,0.05) 0%, transparent 60%)'
              }} />
            )}
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-300
                ${activeKey === "location-closeup" ? "text-black" : "bg-white/[0.03] text-white/40"}`}
              style={activeKey === "location-closeup" ? {
                background: "#a0c559",
                boxShadow: '0 0 10px rgba(160,197,89,0.3)',
              } : {}}
            >
              <Focus size={16} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[10px] font-bold tracking-wider transition-colors duration-300
                ${activeKey === "location-closeup" ? "text-white" : "text-white/25"}`}>
                Yakın Plan
              </p>
              <p className={`text-[7px] font-bold uppercase tracking-[0.2em] transition-colors duration-300
                ${activeKey === "location-closeup" ? "text-[#a0c559]/60" : "text-white/8"}`}>
                Dış Mekan Arka Plan
              </p>
            </div>
            {activeKey === "location-closeup" && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-1.5 h-1.5 rounded-full bg-[#a0c559] flex-shrink-0" style={{ boxShadow: '0 0 6px rgba(160,197,89,0.5)' }} />
            )}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ─── Legacy combined component (kept for backward compatibility) ─── */
interface Props {
  shootMode: ShootMode;
  onShootModeChange: (mode: ShootMode) => void;
}

export const ViewModeNav: React.FC<Props> = ({ shootMode, onShootModeChange }) => {
  return (
    <div className="flex flex-col gap-4">
      <ShootModeToggle shootMode={shootMode} onShootModeChange={onShootModeChange} />
      <ViewSubTabs shootMode={shootMode} />
    </div>
  );
};
