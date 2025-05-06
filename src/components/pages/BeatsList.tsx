/* --------------------------------------------------------------------------
   BeatsList.tsx  –  modern Spotify‑style UI
--------------------------------------------------------------------------- */

import { BeatData, beatsData } from "@/data/beatData";
import React, { useMemo, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaListUl,
  FaMusic,
  FaRegSquare,
  FaThLarge,
} from "react-icons/fa";

interface BeatsListProps {
  onBeatSelect: (audioUrl: string) => void;
  isBeatVisualizer: boolean;
  onTabChange: (tab: "beats" | "visualizer") => void;
}

/* helper – build a random cover URL 1‑100 */
const randomCover = () =>
  `https://xaeneptune.s3.us-east-2.amazonaws.com/beats/Beat+Album+Covers/xaeneptuneBeats${
    Math.floor(Math.random() * 100) + 1
  }.png`;

const BeatsList: React.FC<BeatsListProps> = ({
  onBeatSelect,
  isBeatVisualizer,
  onTabChange,
}) => {
  /* ---------------- state ---------------- */
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

  /* --------------- add random cover (once) --------------- */
  const beatsWithCovers = useMemo(
    () =>
      beatsData.map((b) => ({
        ...b,
        cover: randomCover(),
      })),
    []
  ) as Array<BeatData & { cover: string }>;

  /* ---------------- filtering ---------------- */
  const filteredBeats = useMemo(() => {
    const filtered = beatsWithCovers.filter((beat) => {
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
      let matchPerMin = true;
      if (filterBeatPerMinMin !== "" && beat.beatPerMin !== null) {
        matchPerMin = beat.beatPerMin >= Number(filterBeatPerMinMin);
      }
      if (
        matchPerMin &&
        filterBeatPerMinMax !== "" &&
        beat.beatPerMin !== null
      ) {
        matchPerMin = beat.beatPerMin <= Number(filterBeatPerMinMax);
      }
      return matchName && matchKey && matchProducer && matchDate && matchPerMin;
    });

    return filtered.sort((a, b) => {
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

  /* ---------------- pagination ---------------- */
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

  /* ---------------- render helpers ---------------- */
  const BeatRow = (beat: BeatData & { cover: string }) => (
    <tr
      key={beat.audioFile}
      className="group cursor-pointer hover:bg-neutral-800/60"
      onClick={() => onBeatSelect(beat.audioFile)}
    >
      <td className="py-2 pr-4">
        <img
          src={beat.cover}
          alt=""
          className="h-12 w-12 rounded object-cover group-hover:scale-105 transition-transform"
        />
      </td>
      <td className="py-2 font-medium group-hover:text-brand">
        {beat.beatName}
      </td>
      <td className="py-2 hidden md:table-cell">{beat.beatProducer}</td>
      <td className="py-2 hidden lg:table-cell">{beat.beatKey}</td>
      <td className="py-2 hidden lg:table-cell">{beat.beatPerMin ?? "—"}</td>
      <td className="py-2 hidden xl:table-cell">{beat.beatDate}</td>
    </tr>
  );

  const BeatTile = (beat: BeatData & { cover: string }) => (
    <div
      key={beat.audioFile}
      className="flex flex-col gap-2 p-3 bg-neutral-900 rounded hover:bg-neutral-800/80 cursor-pointer transition-colors"
      onClick={() => onBeatSelect(beat.audioFile)}
    >
      <img
        src={beat.cover}
        alt=""
        className="w-full rounded object-cover aspect-square"
      />
      <h3 className="font-semibold group-hover:text-brand">{beat.beatName}</h3>
      <p className="text-xs text-neutral-400">{beat.beatProducer}</p>
    </div>
  );

  const BeatCard = (beat: BeatData & { cover: string }) => (
    <div
      key={beat.audioFile}
      className="flex items-center gap-4 p-4 bg-neutral-900 rounded-xl shadow hover:shadow-lg/30 cursor-pointer transition-all hover:bg-neutral-800/70"
      onClick={() => onBeatSelect(beat.audioFile)}
    >
      <img
        src={beat.cover}
        alt=""
        className="h-16 w-16 rounded-lg object-cover"
      />
      <div className="flex flex-col">
        <span className="font-medium text-sm">{beat.beatName}</span>
        <span className="text-xs text-neutral-400">{beat.beatProducer}</span>
      </div>
    </div>
  );

  /* ---------------- jsx ---------------- */
  return (
    <section className="w-full h-screen flex flex-col bg-neutral-950 text-neutral-100">
      {/* heading + nav */}
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
                <th className="py-2 text-left hidden md:table-cell">Producer</th>
                <th className="py-2 text-left hidden lg:table-cell">Key</th>
                <th className="py-2 text-left hidden lg:table-cell">BPM</th>
                <th className="py-2 text-left hidden xl:table-cell">Date</th>
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
            Page {currentPage} / {totalPages}
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
    </section>
  );
};

export default BeatsList;
