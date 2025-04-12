import { BeatData, beatsData } from "@/data/beatData";
import React, { useMemo, useState } from "react";
import { FaCompactDisc, FaHeadphones, FaMusic, FaSlidersH } from "react-icons/fa";

interface BeatsListProps {
  onBeatSelect: (audioUrl: string) => void;
  isBeatVisualizer: boolean;
  onTabChange: (tab: "beats" | "visualizer") => void;
}

const BeatsList: React.FC<BeatsListProps> = ({ onBeatSelect, isBeatVisualizer, onTabChange }) => {
  // Filter state
  const [filterBeatName, setFilterBeatName] = useState("");
  const [filterBeatKey, setFilterBeatKey] = useState("");
  const [filterBeatProducer, setFilterBeatProducer] = useState("");
  const [filterBeatDate, setFilterBeatDate] = useState("");
  const [filterBeatPerMinMin, setFilterBeatPerMinMin] = useState<number | "">("");
  const [filterBeatPerMinMax, setFilterBeatPerMinMax] = useState<number | "">("");
  const [beatsPerPage, setBeatsPerPage] = useState<number | "all">(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Advanced filtering: we only filter metadata (no heavy audio is fetched here)
const filteredBeats = useMemo(() => {
  const filtered = beatsData.filter((beat: BeatData) => {
    const matchName = beat.beatName.toLowerCase().includes(filterBeatName.toLowerCase());
    const matchKey = beat.beatKey.toLowerCase().includes(filterBeatKey.toLowerCase());
    const matchProducer = beat.beatProducer.toLowerCase().includes(filterBeatProducer.toLowerCase());
    const matchDate = beat.beatDate.toLowerCase().includes(filterBeatDate.toLowerCase());
    let matchPerMin = true;
    if (filterBeatPerMinMin !== "" && beat.beatPerMin !== null) {
      matchPerMin = beat.beatPerMin >= Number(filterBeatPerMinMin);
    }
    if (matchPerMin && filterBeatPerMinMax !== "" && beat.beatPerMin !== null) {
      matchPerMin = beat.beatPerMin <= Number(filterBeatPerMinMax);
    }
    return matchName && matchKey && matchProducer && matchDate && matchPerMin;
  });
  return filtered.slice().sort((a, b) => {
    const yearA = parseInt(a.beatDate.match(/\d{4}/)?.[0] || "0", 10);
    const yearB = parseInt(b.beatDate.match(/\d{4}/)?.[0] || "0", 10);
    return yearB - yearA; // descending order: most recent first
  });
}, [
  filterBeatName,
  filterBeatKey,
  filterBeatProducer,
  filterBeatDate,
  filterBeatPerMinMin,
  filterBeatPerMinMax,
]);


  // Pagination logic
  const totalBeats = filteredBeats.length;
  const totalPages =
    beatsPerPage === "all" ? 1 : Math.ceil(totalBeats / (beatsPerPage as number));
  const currentBeats =
    beatsPerPage === "all"
      ? filteredBeats
      : filteredBeats.slice(
          (currentPage - 1) * (beatsPerPage as number),
          currentPage * (beatsPerPage as number)
        );

  // Choose an icon and color based on the beat's date (year)
  const getBeatIcon = (beat: BeatData) => {
    const yearMatch = beat.beatDate.match(/\d{4}/);
    let colorClass = "text-gray-500";
    if (yearMatch) {
      const year = parseInt(yearMatch[0]);
      switch (year) {
        case 2021:
          colorClass = "text-blue-500";
          break;
        case 2022:
          colorClass = "text-purple-500";
          break;
        case 2023:
          colorClass = "text-green-500";
          break;
        case 2024:
          colorClass = "text-orange-500";
          break;
        default:
          colorClass = "text-gray-500";
      }
    }
    // Randomly choose one of several icons for variety
    const icons = [
      <FaCompactDisc key="disc" />,
      <FaHeadphones key="headphones" />,
      <FaMusic key="music" />,
    ];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    return (
      <div className={`w-12 h-12 flex items-center justify-center ${colorClass}`}>
        {randomIcon}
      </div>
    );
  };

  return (
    <div className="beats-list-container w-full h-screen p-4 bg-black bg-opacity-80 text-white flex flex-col">
      <h1 className="text-2xl md:text-3xl font-bold text-center mt-12">Beats Available</h1>
      
      {/* Top Row: Filter toggle, Beats tab, and Audio Visualizer tab */}
      <div className="flex justify-around items-center my-2">
        <button
          onClick={() => setShowFilters((prev) => !prev)}
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800 hover:from-indigo-700 hover:via-blue-700 hover:to-indigo-900 transition-colors duration-300 px-3 py-2 rounded text-sm"
        >
          <FaSlidersH />
          <span>Filters</span>
        </button>
        <button
          onClick={() => onTabChange("beats")}
          className={`px-3 py-2 rounded text-sm ${
            !isBeatVisualizer
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Beats For Sale
        </button>
        <button
          onClick={() => onTabChange("visualizer")}
          className={`px-3 py-2 rounded text-sm ${
            isBeatVisualizer
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Audio Visualizer
        </button>
      </div>
      
      {/* Filter Dropdown Content */}
      {showFilters && (
        <div className="filters grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 p-2 border border-gray-700 rounded bg-gray-900">
          <input
            type="text"
            placeholder="Beat Name"
            value={filterBeatName}
            onChange={(e) => setFilterBeatName(e.target.value)}
            className="p-1 text-sm rounded bg-gray-800 border border-gray-700"
          />
          <input
            type="text"
            placeholder="Beat Key"
            value={filterBeatKey}
            onChange={(e) => setFilterBeatKey(e.target.value)}
            className="p-1 text-sm rounded bg-gray-800 border border-gray-700"
          />
          <input
            type="text"
            placeholder="Beat Producer"
            value={filterBeatProducer}
            onChange={(e) => setFilterBeatProducer(e.target.value)}
            className="p-1 text-sm rounded bg-gray-800 border border-gray-700"
          />
          <input
            type="text"
            placeholder="Beat Date"
            value={filterBeatDate}
            onChange={(e) => setFilterBeatDate(e.target.value)}
            className="p-1 text-sm rounded bg-gray-800 border border-gray-700"
          />
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min BPM"
              value={filterBeatPerMinMin}
              onChange={(e) =>
                setFilterBeatPerMinMin(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="p-1 text-sm rounded bg-gray-800 border border-gray-700 w-full"
            />
            <input
              type="number"
              placeholder="Max BPM"
              value={filterBeatPerMinMax}
              onChange={(e) =>
                setFilterBeatPerMinMax(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="p-1 text-sm rounded bg-gray-800 border border-gray-700 w-full"
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="beatsPerPage" className="mr-2 text-sm">
              Beats per page:
            </label>
            <select
              id="beatsPerPage"
              value={beatsPerPage}
              onChange={(e) =>
                setBeatsPerPage(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="p-1 text-sm rounded bg-gray-800 border border-gray-700"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
      )}
      
      {/* Scrollable Beats Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {currentBeats.map((beat, index) => (
            <div
              key={index}
              className="beat-item bg-gradient-to-br from-indigo-900 via-blue-900 to-black p-2 rounded-lg flex items-center space-x-2 transform transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_5px_1px_rgba(75,0,130,0.8)] cursor-pointer"
              onClick={() => onBeatSelect(beat.audioFile)}
            >
              {getBeatIcon(beat)}
              <div>
                <h2 className="text-base font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-600">
                  {beat.beatName}
                </h2>
                <p className="text-xs">Key: {beat.beatKey || "N/A"}</p>
                <p className="text-xs">Producer: {beat.beatProducer}</p>
                <p className="text-xs">Date: {beat.beatDate}</p>
                <p className="text-xs">BPM: {beat.beatPerMin || "N/A"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      
      {/* Fixed Pagination at Bottom */}
      {beatsPerPage !== "all" && totalPages > 1 && (
        <div className="fixed bottom-0 left-0 w-full flex justify-center items-center p-2 bg-black bg-opacity-80">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-900 text-white disabled:opacity-50 text-sm"
          >
            Previous
          </button>
          <span className="text-white text-sm mx-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-900 text-white disabled:opacity-50 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BeatsList;
