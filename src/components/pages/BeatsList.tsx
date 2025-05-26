/* --------------------------------------------------------------------------
   BeatsList.tsx  – modern Spotify-style UI  (preview + visualizer buttons)
--------------------------------------------------------------------------- */
"use client";

import { BeatData, beatsData } from "@/data/beatData";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaListUl,
  FaMusic,
  FaPlay,
  FaRegSquare,
  FaThLarge,
  FaTimes,
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
  const [filterBeatPerMinMin, setFilterBeatPerMinMin] = useState<number | "">(
    ""
  );
  const [filterBeatPerMinMax, setFilterBeatPerMinMax] = useState<number | "">(
    ""
  );
  const [beatsPerPage, setBeatsPerPage] = useState<number | "all">(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid" | "card">("grid");

  /* ───────────── 30-second preview helpers ─────────── */
  const [previewBeat, setPreviewBeat] = useState<{
    name: string;
    cover: string;
  } | null>(null);

  const previewAudioRef   = useRef<HTMLAudioElement | null>(null);
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPreview = () => {
    previewAudioRef.current?.pause();
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    previewAudioRef.current = null;
    previewTimeoutRef.current = null;
    setPreviewBeat(null);
  };

  const startPreview = (beat: BeatData & { cover: string }) => {
    stopPreview();
    const audio = new Audio(beat.audioFile);
    audio.play();
    previewAudioRef.current = audio;
    setPreviewBeat({ name: beat.beatName, cover: beat.cover });
    previewTimeoutRef.current = setTimeout(stopPreview, 30_000);
  };

  /* cleanup on unmount */
  useEffect(() => stopPreview, []);

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
  const BeatRow = (beat: BeatData & { cover: string }) => (
    <tr
      key={beat.audioFile}
      className="group cursor-pointer hover:bg-neutral-800/60"
      onClick={() => onBeatSelect(beat.audioFile)}
    >
      <td className="py-2 pr-4">
        <Image
          src={beat.cover}
          alt=""
          width={48}
          height={48}
          className="rounded object-cover group-hover:scale-105 transition-transform"
        />
      </td>
      <td className="py-2 font-medium">{beat.beatName}</td>
      <td className="py-2 hidden md:table-cell">{beat.beatProducer}</td>
      <td className="py-2 hidden lg:table-cell">{beat.beatKey}</td>
      <td className="py-2 hidden lg:table-cell">{beat.beatPerMin ?? "—"}</td>
      <td className="py-2 hidden xl:table-cell">{beat.beatDate}</td>
      <td className="py-2 pr-1 flex gap-1 justify-end">
        <button
          title="Play 30-sec preview"
          onClick={(e) => {
            e.stopPropagation();
            startPreview(beat);
          }}
          className="p-1 rounded hover:bg-brand/20 text-brand"
        >
          <FaPlay />
        </button>
        <button
          title="Full beat + visualizer"
          onClick={() => onBeatSelect(beat.audioFile)}
          className="p-1 rounded hover:bg-brand/20 text-emerald-400"
        >
          <FaWaveSquare />
        </button>
      </td>
    </tr>
  );

  const BeatTile = (beat: BeatData & { cover: string }) => (
    <div
      key={beat.audioFile}
      className="group relative flex flex-col gap-2 p-3 bg-neutral-900 rounded hover:bg-neutral-800/80 transition-colors cursor-pointer"
      onClick={() => onBeatSelect(beat.audioFile)}
    >
      <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            startPreview(beat);
          }}
          className="p-1 bg-neutral-800/70 rounded hover:text-brand"
          title="Play 30-sec preview"
        >
          <FaPlay />
        </button>
        <button
          onClick={() => onBeatSelect(beat.audioFile)}
          className="p-1 bg-neutral-800/70 rounded hover:text-emerald-400"
          title="Full beat + visualizer"
        >
          <FaWaveSquare />
        </button>
      </div>

      <Image
        src={beat.cover}
        alt=""
        width={512}
        height={512}
        className="w-full rounded object-cover aspect-square"
      />
      <h3 className="font-semibold truncate">{beat.beatName}</h3>
      <p className="text-xs text-neutral-400 truncate">{beat.beatProducer}</p>
    </div>
  );

  const BeatCard = (beat: BeatData & { cover: string }) => (
    <div
      key={beat.audioFile}
      className="group flex items-center gap-4 p-4 bg-neutral-900 rounded-xl shadow hover:shadow-lg/30 transition-all hover:bg-neutral-800/70 cursor-pointer"
      onClick={() => onBeatSelect(beat.audioFile)}
    >
      <Image
        src={beat.cover}
        alt=""
        width={64}
        height={64}
        className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
      />

      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-medium text-sm truncate">{beat.beatName}</span>
        <span className="text-xs text-neutral-400 truncate">
          {beat.beatProducer}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            startPreview(beat);
          }}
          className="p-2 rounded hover:bg-brand/20 text-brand"
          title="Play 30-sec preview"
        >
          <FaPlay />
        </button>
        <button
          onClick={() => onBeatSelect(beat.audioFile)}
          className="p-2 rounded hover:bg-brand/20 text-emerald-400"
          title="Full beat + visualizer"
        >
          <FaWaveSquare />
        </button>
      </div>
    </div>
  );

  /* ───────────── JSX ───────────── */
  return (
    <section className="w-full h-screen flex flex-col bg-neutral-950 text-neutral-100">
      {/* header */}
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 pt-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FaMusic className="text-brand" /> Beats Marketplace
        </h1>

        {/* view toggles */}
        <div className="inline-flex rounded bg-neutral-900">
          <button
            title="List view"
            onClick={() => setViewMode("list")}
            className={`p-2 ${viewMode === "list" ? "text-brand" : ""}`}
          >
            <FaListUl />
          </button>
          <button
            title="Grid view"
            onClick={() => setViewMode("grid")}
            className={`p-2 ${viewMode === "grid" ? "text-brand" : ""}`}
          >
            <FaThLarge />
          </button>
          <button
            title="Card view"
            onClick={() => setViewMode("card")}
            className={`p-2 ${viewMode === "card" ? "text-brand" : ""}`}
          >
            <FaRegSquare />
          </button>
        </div>

        {/* tab switch */}
        <div className="flex gap-1">
          <button
            onClick={() => onTabChange("beats")}
            className={`px-4 py-1 rounded ${
              !isBeatVisualizer ? "bg-brand text-neutral-950" : "bg-neutral-800"
            }`}
          >
            Beats
          </button>
          <button
            onClick={() => onTabChange("visualizer")}
            className={`px-4 py-1 rounded ${
              isBeatVisualizer ? "bg-brand text-neutral-950" : "bg-neutral-800"
            }`}
          >
            Visualizer
          </button>
        </div>
      </header>

      {/* tool row */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="flex items-center gap-1 text-sm hover:text-brand"
        >
          <FaFilter /> Filters
        </button>

        <label className="flex items-center gap-2 text-sm">
          Show
          <select
            value={beatsPerPage}
            onChange={(e) => {
              const v = e.target.value;
              setBeatsPerPage(v === "all" ? "all" : Number(v));
              setCurrentPage(1);
            }}
            className="bg-neutral-800 rounded px-1"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value="all">All</option>
          </select>
          per page
        </label>
      </div>

      {/* filters panel */}
      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 px-4 pb-4">
          <input
            type="text"
            placeholder="Name"
            value={filterBeatName}
            onChange={(e) => setFilterBeatName(e.target.value)}
            className="bg-neutral-900 rounded px-2 py-1 text-sm"
          />
          <input
            type="text"
            placeholder="Key"
            value={filterBeatKey}
            onChange={(e) => setFilterBeatKey(e.target.value)}
            className="bg-neutral-900 rounded px-2 py-1 text-sm"
          />
          <input
            type="text"
            placeholder="Producer"
            value={filterBeatProducer}
            onChange={(e) => setFilterBeatProducer(e.target.value)}
            className="bg-neutral-900 rounded px-2 py-1 text-sm"
          />
          <input
            type="text"
            placeholder="Date"
            value={filterBeatDate}
            onChange={(e) => setFilterBeatDate(e.target.value)}
            className="bg-neutral-900 rounded px-2 py-1 text-sm"
          />
          <input
            type="number"
            placeholder="Min BPM"
            value={filterBeatPerMinMin}
            onChange={(e) =>
              setFilterBeatPerMinMin(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            className="bg-neutral-900 rounded px-2 py-1 text-sm"
          />
          <input
            type="number"
            placeholder="Max BPM"
            value={filterBeatPerMinMax}
            onChange={(e) =>
              setFilterBeatPerMinMax(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            className="bg-neutral-900 rounded px-2 py-1 text-sm"
          />
        </div>
      )}

      {/* content */}
      <main className="flex-1 overflow-y-auto px-4 pb-24">
        {viewMode === "list" && (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-neutral-950 text-neutral-400 text-xs">
              <tr>
                <th className="py-2"></th>
                <th className="py-2 text-left">Title</th>
                <th className="py-2 text-left hidden md:table-cell">
                  Producer
                </th>
                <th className="py-2 text-left hidden lg:table-cell">Key</th>
                <th className="py-2 text-left hidden lg:table-cell">BPM</th>
                <th className="py-2 text-left hidden xl:table-cell">Date</th>
                <th className="py-2 text-right w-20"></th>
              </tr>
            </thead>
            <tbody>{currentBeats.map(BeatRow)}</tbody>
          </table>
        )}

        {viewMode === "grid" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentBeats.map(BeatTile)}
          </div>
        )}

        {viewMode === "card" && (
          <div className="flex flex-col gap-3">
            {currentBeats.map(BeatCard)}
          </div>
        )}
      </main>

      {/* pagination */}
      {beatsPerPage !== "all" && totalPages > 1 && (
        <footer className="fixed bottom-0 left-0 w-full bg-neutral-950/95 backdrop-blur py-2 flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 disabled:opacity-40"
          >
            <FaChevronLeft />
          </button>
          <span className="text-sm">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 disabled:opacity-40"
          >
            <FaChevronRight />
          </button>
        </footer>
      )}

      {/* 30-sec preview popup */}
      {previewBeat && (
        <div className="fixed bottom-4 right-4 flex items-center gap-3 bg-neutral-900/90 backdrop-blur rounded-lg shadow-lg p-3">
          <Image
            src={previewBeat.cover}
            alt=""
            width={40}
            height={40}
            className="rounded object-cover"
          />
          <span className="text-sm">
            Playing preview:&nbsp;
            <span className="font-semibold">{previewBeat.name}</span>
          </span>
          <button
            onClick={stopPreview}
            className="p-1 hover:text-red-400"
            title="Stop preview"
          >
            <FaTimes />
          </button>
        </div>
      )}
    </section>
  );
};

export default BeatsList;
