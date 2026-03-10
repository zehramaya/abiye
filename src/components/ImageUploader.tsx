import React, { useState, useRef } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadFile } from "../services/falApi";

interface Props {
  label: string;
  onUpload: (url: string) => void;
  isLoading?: boolean;
}

export const ImageUploader: React.FC<Props> = ({ label, onUpload, isLoading = false }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    try {
      setLocalLoading(true);
      const url = URL.createObjectURL(file);
      setPreview(url);

      const falUrl = await uploadFile(file);
      onUpload(falUrl);
    } catch (error) {
      console.error("Upload error:", error);
      alert("İşlem sırasında hata! Lütfen tekrar deneyin.");
      setPreview(null);
    } finally {
      setLocalLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onUpload("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center px-0.5">
        <label className="text-[9px] font-semibold tracking-[0.12em] text-white/35 uppercase">{label}</label>
        <AnimatePresence>
          {preview && !localLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0 }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20"
            >
              <div className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
              <span className="text-[6px] font-bold text-emerald-400/80 uppercase tracking-widest">Hazır</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        whileHover={!preview ? { scale: 1.01 } : {}}
        className={`dropzone-container group h-[100px] flex items-center justify-center relative overflow-hidden
          ${preview ? 'border-solid !border-white/[0.08] !bg-black/50' : ''}
          ${isDragging ? '!border-[#c5a059]/30 !bg-[#c5a059]/[0.03] scale-[1.02]' : ''}
        `}
        onClick={() => !localLoading && !isLoading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          accept="image/*"
          onChange={onFileChange}
          disabled={localLoading || isLoading}
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative w-full h-full p-1.5 flex items-center justify-center z-10"
            >
              <img
                src={preview}
                alt="Önizleme"
                className="h-full max-w-full object-contain rounded-md shadow-2xl shadow-black/60"
              />
              <motion.button
                whileHover={{ scale: 1.15, backgroundColor: 'rgba(255, 50, 50, 0.15)' }}
                whileTap={{ scale: 0.9 }}
                onClick={removeImage}
                className="absolute top-2 right-2 w-5 h-5 rounded-md bg-black/60 backdrop-blur-md text-white/25 hover:text-red-400 flex items-center justify-center transition-all duration-200 border border-white/[0.06]"
              >
                <X size={10} />
              </motion.button>

              {localLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center rounded-lg backdrop-blur-xl z-30"
                >
                  <div className="w-16 h-[2px] bg-white/[0.04] relative overflow-hidden rounded-full mb-3">
                    <motion.div
                      animate={{ x: [-64, 64] }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent"
                    />
                  </div>
                  <span className="text-[7px] text-[#c5a059]/70 font-bold tracking-[0.4em] uppercase">Yükleniyor</span>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 z-10"
            >
              <motion.div
                animate={isDragging ? { scale: 1.15, borderColor: 'rgba(197, 160, 89, 0.3)' } : {}}
                className="w-9 h-9 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-white/20 group-hover:text-white/50 group-hover:border-white/[0.1] group-hover:bg-white/[0.04] transition-all duration-400 flex-shrink-0"
              >
                <ImageIcon size={16} strokeWidth={1.5} />
              </motion.div>
              <div className="text-left space-y-0.5">
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.15em] group-hover:text-white/55 transition-colors duration-400">Kaynak Seç</p>
                <p className="text-[7px] text-white/[0.08] font-medium group-hover:text-white/15 transition-colors duration-400">veya sürükle-bırak</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
