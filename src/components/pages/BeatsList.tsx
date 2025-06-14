"use client";

import { BeatData, beatsData } from "@/data/beatData";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaDollarSign,
  FaEnvelope,
  FaFilter,
  FaHeadphones,
  FaListUl,
  FaMusic,
  FaPaperPlane,
  FaPause,
  FaPlay,
  FaRegSquare,
  FaThLarge,
  FaTimes,
  FaVolumeUp,
  FaWaveSquare,
} from "react-icons/fa";

interface BeatsListProps {
  onBeatSelect: (audioUrl: string) => void;
  isBeatVisualizer: boolean;
  onTabChange: (tab: "beats" | "visualizer") => void;
}

/* deterministic cover so visualizer & list stay in sync */
const coverFor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % 100;
  return `https://xaeneptune.s3.us-east-2.amazonaws.com/beats/Beat+Album+Covers/xaeneptuneBeats${
    hash + 1
  }.png`;
};

// Clean beat name for email subject
const cleanBeatName = (beatName: string) => {
  return beatName
    .replace(/%20/g, ' ')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const BeatsList: React.FC<BeatsListProps> = ({
  onBeatSelect,
  isBeatVisualizer,
  onTabChange,
}) => {
  /* ───────────── filters / paging / view ───────────── */
  const [filterBeatName, setFilterBeatName] = useState("");
  const [filterBeatKey, setFilterBeatKey] = useState("");
  const [filterBeatProducer, setFilterBeatProducer] = useState("");
  const [filterBeatDate, setFilterBeatDate] = useState("");
  const [filterBeatPerMinMin, setFilterBeatPerMinMin] = useState<number | "">("");
  const [filterBeatPerMinMax, setFilterBeatPerMinMax] = useState<number | "">("");
  const [beatsPerPage, setBeatsPerPage] = useState<number | "all">(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid" | "card">("list");
  const [isMobile, setIsMobile] = useState(false);

  /* ───────────── Inquiry Modal State ───────────── */
  const [inquiryBeat, setInquiryBeat] = useState<BeatData & { cover: string } | null>(null);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");

  /* ───────────── Mobile Modal State ───────────── */
  const [mobileModalBeat, setMobileModalBeat] = useState<{
    beat: BeatData & { cover: string };
    audio: HTMLAudioElement;
  } | null>(null);
  const [showVisualizerAnyway, setShowVisualizerAnyway] = useState(false);

  /* ───────────── 30-second preview helpers ─────────── */
  const [previewBeat, setPreviewBeat] = useState<{
    name: string;
    cover: string;
    beat: BeatData & { cover: string };
  } | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [currentPage]);

  const stopPreview = () => {
    previewAudioRef.current?.pause();
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    previewAudioRef.current = null;
    previewTimeoutRef.current = null;
    setPreviewBeat(null);
    setIsPreviewPlaying(false);
  };

  const togglePreview = (beat: BeatData & { cover: string }) => {
    if (previewBeat?.beat.audioFile === beat.audioFile && isPreviewPlaying) {
      previewAudioRef.current?.pause();
      setIsPreviewPlaying(false);
    } else {
      startPreview(beat);
    }
  };

  const startPreview = (beat: BeatData & { cover: string }) => {
    stopPreview();
    const audio = new Audio(beat.audioFile);
    audio.play();
    previewAudioRef.current = audio;
    setPreviewBeat({ name: beat.beatName, cover: beat.cover, beat });
    setIsPreviewPlaying(true);
    previewTimeoutRef.current = setTimeout(stopPreview, 30_000);
  };

  // Handle mobile beat selection
  const handleBeatSelect = (beat: BeatData & { cover: string }) => {
    if (isMobile && !showVisualizerAnyway) {
      const audio = new Audio(beat.audioFile);
      audio.play();
      setMobileModalBeat({ beat, audio });
    } else {
      onBeatSelect(beat.audioFile);
    }
  };

  // Handle inquiry
  const handleInquiry = (beat: BeatData & { cover: string }) => {
    setInquiryBeat(beat);
    const cleanName = cleanBeatName(beat.beatName);
    setInquiryMessage(`Hi, I'm interested in purchasing the beat "${cleanName}". Please provide more information about licensing options and pricing.`);
  };

  // Send inquiry via mailto
  const sendInquiry = () => {
    if (!inquiryBeat) return;
    
    const cleanName = cleanBeatName(inquiryBeat.beatName);
    const subject = `Beat Inquiry: ${cleanName}`;
    const body = `
Name: ${inquiryName}
Email: ${inquiryEmail}
Phone: ${inquiryPhone || 'Not provided'}
Beat: ${cleanName}
Producer: ${inquiryBeat.beatProducer}
Key: ${inquiryBeat.beatKey}
BPM: ${inquiryBeat.beatPerMin || 'N/A'}

Message:
${inquiryMessage}
    `.trim();

    const mailtoLink = `mailto:contact@antiheroes.co?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    // Reset form
    setInquiryBeat(null);
    setInquiryName("");
    setInquiryEmail("");
    setInquiryPhone("");
    setInquiryMessage("");
  };

  // Close mobile modal
  const closeMobileModal = () => {
    if (mobileModalBeat) {
      mobileModalBeat.audio.pause();
      setMobileModalBeat(null);
      setShowVisualizerAnyway(false);
    }
  };

  /* cleanup on unmount */
  useEffect(() => {
    return () => {
      stopPreview();
      if (mobileModalBeat) {
        mobileModalBeat.audio.pause();
      }
    };
  }, [mobileModalBeat]);

  /* ───────────── dataset w/ covers ───────────── */
  const beatsWithCovers = useMemo(
    () =>
      beatsData.map((b) => ({
        ...b,
        cover: coverFor(b.audioFile),
      })),
    []
  ) as Array<BeatData & { cover: string }>;

  /* ───────────── filtering ───────────── */
  const filteredBeats = useMemo(() => {
    const f = beatsWithCovers.filter((beat) => {
      const matchName = beat.beatName
        .toLowerCase()
        .includes(filterBeatName.toLowerCase());
      const matchKey = beat.beatKey
        .toLowerCase()
        .includes(filterBeatKey.toLowerCase());
      const matchProducer = beat.beatProducer
        .toLowerCase()
        .includes(filterBeatProducer.toLowerCase());
      const matchDate = beat.beatDate
        .toLowerCase()
        .includes(filterBeatDate.toLowerCase());

      let matchBpm = true;
      if (filterBeatPerMinMin !== "" && beat.beatPerMin !== null)
        matchBpm = beat.beatPerMin >= Number(filterBeatPerMinMin);
      if (matchBpm && filterBeatPerMinMax !== "" && beat.beatPerMin !== null)
        matchBpm = beat.beatPerMin <= Number(filterBeatPerMinMax);

      return matchName && matchKey && matchProducer && matchDate && matchBpm;
    });

    return f.sort((a, b) => {
      const yA = parseInt(a.beatDate.match(/\d{4}/)?.[0] || "0", 10);
      const yB = parseInt(b.beatDate.match(/\d{4}/)?.[0] || "0", 10);
      return yB - yA;
    });
  }, [
    beatsWithCovers,
    filterBeatName,
    filterBeatKey,
    filterBeatProducer,
    filterBeatDate,
    filterBeatPerMinMin,
    filterBeatPerMinMax,
  ]);

  /* ───────────── pagination ───────────── */
  const totalBeats = filteredBeats.length;
  const totalPages =
    beatsPerPage === "all" ? 1 : Math.ceil(totalBeats / beatsPerPage);
  const currentBeats =
    beatsPerPage === "all"
      ? filteredBeats
      : filteredBeats.slice(
          (currentPage - 1) * beatsPerPage,
          currentPage * beatsPerPage
        );

  /* ───────────── render helpers ───────────── */
  const BeatRow = (beat: BeatData & { cover: string }, index: number) => (
    <motion.tr
      key={beat.audioFile}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className="group cursor-pointer border-b border-gray-800 hover:bg-gradient-to-r hover:from-purple-900/10 hover:to-emerald-900/10 transition-all duration-300"
      onClick={() => handleBeatSelect(beat)}
    >
      <td className="py-4 pl-4 md:pl-6">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="relative w-12 h-12 md:w-14 md:h-14"
        >
          <Image
            src={beat.cover}
            alt=""
            fill
            className="rounded-lg object-cover shadow-lg group-hover:shadow-purple-500/20"
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-purple-600/0 to-emerald-600/0 group-hover:from-purple-600/20 group-hover:to-emerald-600/20 rounded-lg transition-all duration-300"
          />
        </motion.div>
      </td>
      <td className="py-4 px-4">
        <div className="flex flex-col">
          <span className="font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-emerald-300 transition-all duration-300">
            {beat.beatName}
          </span>
          <span className="text-xs text-gray-500 md:hidden">{beat.beatProducer}</span>
        </div>
      </td>
      <td className="py-4 px-4 hidden md:table-cell text-gray-400">
        {beat.beatProducer}
      </td>
      <td className="py-4 px-4 hidden lg:table-cell">
        <span className="px-2 py-1 bg-purple-900/20 text-purple-300 rounded-full text-xs">
          {beat.beatKey}
        </span>
      </td>
      <td className="py-4 px-4 hidden lg:table-cell text-gray-400">
        {beat.beatPerMin ?? "—"}
      </td>
      <td className="py-4 px-4 hidden xl:table-cell text-gray-500 text-sm">
        {beat.beatDate}
      </td>
      <td className="py-4 pr-4 md:pr-6">
        <div className="flex gap-2 justify-end">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Play 30-sec preview"
            onClick={(e) => {
              e.stopPropagation();
              togglePreview(beat);
            }}
            className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 transition-all duration-200"
          >
            {previewBeat?.beat.audioFile === beat.audioFile && isPreviewPlaying ? (
              <FaPause />
            ) : (
              <FaPlay />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Full beat + visualizer"
            onClick={(e) => {
              e.stopPropagation();
              handleBeatSelect(beat);
            }}
            className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 transition-all duration-200"
          >
            <FaWaveSquare />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Inquire about this beat"
            onClick={(e) => {
              e.stopPropagation();
              handleInquiry(beat);
            }}
            className="p-2 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 transition-all duration-200"
          >
            <FaDollarSign />
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );

  const BeatTile = (beat: BeatData & { cover: string }, index: number) => (
    <motion.div
      key={beat.audioFile}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="group relative flex flex-col gap-3 p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => handleBeatSelect(beat)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-emerald-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:via-emerald-600/10 group-hover:to-purple-600/10 transition-all duration-500" />
      
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            togglePreview(beat);
          }}
          className="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-purple-600/30 text-purple-400"
          title="Play 30-sec preview"
        >
          {previewBeat?.beat.audioFile === beat.audioFile && isPreviewPlaying ? (
            <FaPause />
          ) : (
            <FaPlay />
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handleBeatSelect(beat);
          }}
          className="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-emerald-600/30 text-emerald-400"
          title="Full beat + visualizer"
        >
          <FaWaveSquare />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handleInquiry(beat);
          }}
          className="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-yellow-600/30 text-yellow-400"
          title="Inquire about this beat"
        >
          <FaDollarSign />
        </motion.button>
      </div>

      <div className="relative aspect-square rounded-xl overflow-hidden">
        <Image
          src={beat.cover}
          alt=""
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="relative z-10">
        <h3 className="font-bold text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-emerald-300 transition-all duration-300">
          {beat.beatName}
        </h3>
        <p className="text-sm text-gray-400 truncate">{beat.beatProducer}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 bg-purple-900/20 text-purple-300 rounded-full">
            {beat.beatKey}
          </span>
          {beat.beatPerMin && (
            <span className="text-xs text-gray-500">{beat.beatPerMin} BPM</span>
          )}
        </div>
      </div>
    </motion.div>
  );

  const BeatCard = (beat: BeatData & { cover: string }, index: number) => (
    <motion.div
      key={beat.audioFile}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ x: 5 }}
      className="group flex items-center gap-4 p-4 md:p-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700 hover:border-purple-500/50 shadow-lg hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer"
      onClick={() => handleBeatSelect(beat)}
    >
      <motion.div
        whileHover={{ scale: 1.05, rotate: 2 }}
        className="relative h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden flex-shrink-0"
      >
        <Image
          src={beat.cover}
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-emerald-600/0 group-hover:from-purple-600/20 group-hover:to-emerald-600/20 transition-all duration-300" />
      </motion.div>

      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-bold text-lg text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-emerald-300 transition-all duration-300">
          {beat.beatName}
        </span>
        <span className="text-sm text-gray-400 truncate">
          {beat.beatProducer}
        </span>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 bg-purple-900/20 text-purple-300 rounded-full">
            {beat.beatKey}
          </span>
          {beat.beatPerMin && (
            <span className="text-xs text-gray-500">{beat.beatPerMin} BPM</span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            togglePreview(beat);
          }}
          className="p-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 transition-all duration-200"
          title="Play 30-sec preview"
        >
          {previewBeat?.beat.audioFile === beat.audioFile && isPreviewPlaying ? (
            <FaPause className="w-4 h-4" />
          ) : (
            <FaPlay className="w-4 h-4" />
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handleBeatSelect(beat);
          }}
          className="p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 transition-all duration-200"
          title="Full beat + visualizer"
        >
          <FaWaveSquare className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handleInquiry(beat);
          }}
          className="p-3 rounded-xl bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 transition-all duration-200"
          title="Inquire about this beat"
        >
          <FaDollarSign className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );

  /* ───────────── JSX ───────────── */
  return (
    <div className="w-full min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-emerald-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />
      </motion.div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 px-4 md:px-8 py-6 border-b border-gray-800"
        >
          <motion.h1
            className="text-2xl md:text-3xl font-black flex items-center gap-3"
            initial={{ letterSpacing: "0.2em", opacity: 0 }}
            animate={{ letterSpacing: "0.05em", opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FaMusic className="text-purple-400" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-emerald-300">
              BEATS MARKETPLACE
            </span>
          </motion.h1>

          {/* View toggles */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex bg-gray-900/50 backdrop-blur-sm rounded-xl p-1 border border-gray-800"
          >
            {[
              { mode: "list" as const, icon: FaListUl, title: "List view" },
              { mode: "grid" as const, icon: FaThLarge, title: "Grid view" },
              { mode: "card" as const, icon: FaRegSquare, title: "Card view" },
            ].map(({ mode, icon: Icon, title }) => (
              <button
                key={mode}
                title={title}
                onClick={() => setViewMode(mode)}
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  viewMode === mode
                    ? "bg-gradient-to-r from-purple-600 to-emerald-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </motion.div>

          {/* Tab switch */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex bg-gray-900/50 backdrop-blur-sm rounded-xl p-1 border border-gray-800"
          >
            <button
              onClick={() => onTabChange("beats")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                !isBeatVisualizer
                  ? "bg-gradient-to-r from-purple-600 to-emerald-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Beats
            </button>
            <button
              onClick={() => onTabChange("visualizer")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isBeatVisualizer
                  ? "bg-gradient-to-r from-purple-600 to-emerald-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Visualizer
            </button>
          </motion.div>
        </motion.header>

        {/* Tool row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center gap-4 px-4 md:px-8 py-4 border-b border-gray-800"
        >
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <FaFilter className={showFilters ? "text-purple-400" : ""} />
            Filters
          </button>

          <label className="flex items-center gap-2 text-sm text-gray-400">
            Show
            <select
              value={beatsPerPage}
              onChange={(e) => {
                const v = e.target.value;
                setBeatsPerPage(v === "all" ? "all" : Number(v));
                setCurrentPage(1);
              }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-lg px-3 py-1 border border-gray-800 text-white focus:border-purple-500 outline-none transition-colors"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value="all">All</option>
            </select>
            per page
          </label>

          <div className="ml-auto text-sm text-gray-500">
            {totalBeats} beats found
          </div>
        </motion.div>

        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-gray-800"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-4 md:px-8">
                {[
                  { placeholder: "Name", value: filterBeatName, setter: setFilterBeatName },
                  { placeholder: "Key", value: filterBeatKey, setter: setFilterBeatKey },
                  { placeholder: "Producer", value: filterBeatProducer, setter: setFilterBeatProducer },
                  { placeholder: "Date", value: filterBeatDate, setter: setFilterBeatDate },
                ].map(({ placeholder, value, setter }) => (
                  <input
                    key={placeholder}
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="bg-gray-900/50 backdrop-blur-sm rounded-lg px-4 py-2 text-sm border border-gray-800 focus:border-purple-500 outline-none transition-colors placeholder-gray-500"
                  />
                ))}
                <input
                  type="number"
                  placeholder="Min BPM"
                  value={filterBeatPerMinMin}
                  onChange={(e) =>
                    setFilterBeatPerMinMin(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="bg-gray-900/50 backdrop-blur-sm rounded-lg px-4 py-2 text-sm border border-gray-800 focus:border-purple-500 outline-none transition-colors placeholder-gray-500"
                />
                <input
                  type="number"
                  placeholder="Max BPM"
                  value={filterBeatPerMinMax}
                  onChange={(e) =>
                    setFilterBeatPerMinMax(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="bg-gray-900/50 backdrop-blur-sm rounded-lg px-4 py-2 text-sm border border-gray-800 focus:border-purple-500 outline-none transition-colors placeholder-gray-500"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
   <main
  ref={mainContentRef}
  className="flex-1 overflow-y-auto px-4 md:px-8 py-6"
  style={{ paddingBottom: 'var(--footer-h,3.5rem)' }}   // 👈 new
>
{viewMode === "list" && (
    <div /* allow horizontal scroll on very small screens            */
         className="overflow-x-auto">
      <table className="w-full">
        {/* sticky header so column titles stay in view               */}
        <thead className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm">
          <tr className="border-b border-gray-800 text-left text-sm text-gray-400">
            <th className="py-3 pl-4 md:pl-6"></th>
            <th className="py-3 px-4">Title</th>
            <th className="py-3 px-4 hidden md:table-cell">Producer</th>
            <th className="py-3 px-4 hidden lg:table-cell">Key</th>
            <th className="py-3 px-4 hidden lg:table-cell">BPM</th>
            <th className="py-3 px-4 hidden xl:table-cell">Date</th>
            <th className="py-3 pr-4 md:pr-6 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {currentBeats.map((beat, idx) => BeatRow(beat, idx))}
        </tbody>
      </table>
      {/* extra margin so *all* rows can scroll fully into view       */}
      <div className="h-16 md:hidden" />
    </div>
  )}

          {viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {currentBeats.map((beat, index) => BeatTile(beat, index))}
            </div>
          )}

          {viewMode === "card" && (
            <div className="flex flex-col gap-4">
              {currentBeats.map((beat, index) => BeatCard(beat, index))}
            </div>
          )}

          {currentBeats.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <FaMusic className="text-6xl text-gray-700 mb-4" />
              <p className="text-gray-500 text-lg">No beats found matching your criteria</p>
            </motion.div>
          )}
        </main>

        {/* Pagination */}
        <AnimatePresence>
          {beatsPerPage !== "all" && totalPages > 1 && (
  /* pagination footer – mobile-height fixed */
<motion.footer
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 50 }}
  /* ↓ expose the current height through a CSS var */
  style={{ '--footer-h': '3.5rem' } as React.CSSProperties}
  className="
      fixed bottom-0 left-0 right-0 z-20
      bg-black/90 backdrop-blur-md border-t border-gray-800
      /* 60 % shorter bar on mobile            */
      py-2 md:py-4      /* ⇐ was py-4 everywhere */
  "
>
  <div className="flex items-center justify-center gap-2 md:gap-4 scale-90 md:scale-100">
    {/* ◀ previous */}
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
      disabled={currentPage === 1}
      className="
        p-1.5 md:p-2 rounded-lg
        bg-gray-900/50 border border-gray-800
        disabled:opacity-40 disabled:cursor-not-allowed
        hover:border-purple-500 transition-colors
      "
    >
      <FaChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
    </motion.button>

    {/* numeric buttons */}
    <div className="flex items-center gap-1.5 md:gap-2">
      {[...Array(Math.min(5, totalPages))].map((_, i) => {
        let pageNum;
        if (totalPages <= 5)            pageNum = i + 1;
        else if (currentPage <= 3)      pageNum = i + 1;
        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
        else                            pageNum = currentPage - 2 + i;

        return (
          <motion.button
            key={pageNum}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(pageNum)}
            className={`
              w-8 h-8 md:w-10 md:h-10 rounded-lg font-medium
              transition-all duration-200
              ${
                currentPage === pageNum
                  ? "bg-gradient-to-r from-purple-600 to-emerald-600 text-white"
                  : "bg-gray-900/50 border border-gray-800 text-gray-400 hover:text-white hover:border-purple-500"
              }
            `}
          >
            {pageNum}
          </motion.button>
        );
      })}
    </div>

    {/* ▶ next */}
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="
        p-1.5 md:p-2 rounded-lg
        bg-gray-900/50 border border-gray-800
        disabled:opacity-40 disabled:cursor-not-allowed
        hover:border-purple-500 transition-colors
      "
    >
      <FaChevronRight className="w-4 h-4 md:w-5 md:h-5" />
    </motion.button>
  </div>
</motion.footer>

          )}
        </AnimatePresence>
      </div>

      {/* 30-sec preview popup */}
      <AnimatePresence>
        {previewBeat && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-20 md:bottom-8 right-4 md:right-8 flex items-center gap-4 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-500/20 p-4 border border-purple-500/30 max-w-xs md:max-w-sm z-30"
          >
            <motion.div
              animate={{ rotate: isPreviewPlaying ? 360 : 0 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
            >
              <Image
                src={previewBeat.cover}
                alt=""
                fill
                className="object-cover"
              />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-400">Preview playing</p>
              <p className="font-semibold text-white truncate">{previewBeat.name}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopPreview}
              className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
              title="Stop preview"
            >
              <FaTimes />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Modal */}
      <AnimatePresence>
        {mobileModalBeat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={closeMobileModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-6 md:p-8 max-w-md w-full border border-purple-500/30 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeMobileModal}
                className="absolute top-4 right-4 p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </motion.button>

              {/* Album art */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5 }}
                className="relative w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden shadow-2xl"
              >
                <Image
                  src={mobileModalBeat.beat.cover}
                  alt=""
                  fill
                  className="object-cover"
                />
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-emerald-600/20"
                />
              </motion.div>

              {/* Beat info */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {mobileModalBeat.beat.beatName}
                </h3>
                <p className="text-gray-400">{mobileModalBeat.beat.beatProducer}</p>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <span className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm">
                    {mobileModalBeat.beat.beatKey}
                  </span>
                  {mobileModalBeat.beat.beatPerMin && (
                    <span className="text-sm text-gray-500">
                      {mobileModalBeat.beat.beatPerMin} BPM
                    </span>
                  )}
                </div>
              </div>

              {/* Now playing indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="w-3 h-3 bg-purple-500 rounded-full"
                />
                <FaVolumeUp className="text-purple-400" />
                <span className="text-gray-400 text-sm">Now Playing</span>
              </div>

              {/* Warning message */}
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <FaHeadphones className="text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-200 font-medium mb-1">
                      Audio Visualizer Not Available
                    </p>
                    <p className="text-yellow-300/70 text-sm">
                      For the best experience with audio visualizer, please use a desktop device.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleInquiry(mobileModalBeat.beat)}
                  className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FaDollarSign />
                  Inquire About This Beat
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowVisualizerAnyway(true);
                    closeMobileModal();
                    onBeatSelect(mobileModalBeat.beat.audioFile);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                  View Visualizer Anyway
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeMobileModal}
                  className="w-full py-3 bg-gray-800/50 text-gray-300 font-medium rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300"
                >
                  Continue Listening
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inquiry Modal */}
      <AnimatePresence>
        {inquiryBeat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setInquiryBeat(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-purple-500/30 shadow-2xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FaEnvelope className="text-purple-400" />
                  Beat Inquiry
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setInquiryBeat(null)}
                  className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Beat info */}
              <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl mb-6">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={inquiryBeat.cover}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-white">{cleanBeatName(inquiryBeat.beatName)}</h3>
                  <p className="text-sm text-gray-400">{inquiryBeat.beatProducer}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-purple-900/30 text-purple-300 rounded-full">
                      {inquiryBeat.beatKey}
                    </span>
                    {inquiryBeat.beatPerMin && (
                      <span className="text-xs text-gray-500">{inquiryBeat.beatPerMin} BPM</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Form */}
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                sendInquiry();
              }}>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Message *
                  </label>
                  <textarea
                    required
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                    placeholder="Tell us about your project..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <FaPaperPlane />
                    Send Inquiry
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setInquiryBeat(null)}
                    className="px-6 py-3 bg-gray-800/50 text-gray-300 font-medium rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                Your inquiry will be sent to contact@antiheroes.co
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BeatsList;
