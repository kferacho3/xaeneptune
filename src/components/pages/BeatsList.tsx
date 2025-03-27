import { BeatData, beatsData } from '@/data/beatData';
import React, { useMemo, useState } from 'react';
import { FaCompactDisc, FaHeadphones, FaMusic } from 'react-icons/fa';

interface BeatsListProps {
  onBeatSelect: (audioUrl: string) => void;
}

const BeatsList: React.FC<BeatsListProps> = ({ onBeatSelect }) => {
  // Filter state
  const [filterBeatName, setFilterBeatName] = useState('');
  const [filterBeatKey, setFilterBeatKey] = useState('');
  const [filterBeatProducer, setFilterBeatProducer] = useState('');
  const [filterBeatDate, setFilterBeatDate] = useState('');
  const [filterBeatPerMinMin, setFilterBeatPerMinMin] = useState<number | ''>('');
  const [filterBeatPerMinMax, setFilterBeatPerMinMax] = useState<number | ''>('');
  const [beatsPerPage, setBeatsPerPage] = useState<number | 'all'>(15);
  const [currentPage, setCurrentPage] = useState(1);

  // Advanced filtering: we only filter metadata (no heavy audio is fetched here)
  const filteredBeats = useMemo(() => {
    return beatsData.filter((beat: BeatData) => {
      const matchName = beat.beatName.toLowerCase().includes(filterBeatName.toLowerCase());
      const matchKey = beat.beatKey.toLowerCase().includes(filterBeatKey.toLowerCase());
      const matchProducer = beat.beatProducer.toLowerCase().includes(filterBeatProducer.toLowerCase());
      const matchDate = beat.beatDate.toLowerCase().includes(filterBeatDate.toLowerCase());
      let matchPerMin = true;
      if (filterBeatPerMinMin !== '' && beat.beatPerMin !== null) {
        matchPerMin = beat.beatPerMin >= Number(filterBeatPerMinMin);
      }
      if (matchPerMin && filterBeatPerMinMax !== '' && beat.beatPerMin !== null) {
        matchPerMin = beat.beatPerMin <= Number(filterBeatPerMinMax);
      }
      return matchName && matchKey && matchProducer && matchDate && matchPerMin;
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
  const totalPages = beatsPerPage === 'all' ? 1 : Math.ceil(totalBeats / (beatsPerPage as number));
  const currentBeats =
    beatsPerPage === 'all'
      ? filteredBeats
      : filteredBeats.slice((currentPage - 1) * (beatsPerPage as number), currentPage * (beatsPerPage as number));

  // Choose an icon and color based on the beat's date (year)
  const getBeatIcon = (beat: BeatData) => {
    const yearMatch = beat.beatDate.match(/\d{4}/);
    let colorClass = 'text-gray-500';
    if (yearMatch) {
      const year = parseInt(yearMatch[0]);
      switch (year) {
        case 2021:
          colorClass = 'text-blue-500';
          break;
        case 2022:
          colorClass = 'text-purple-500';
          break;
        case 2023:
          colorClass = 'text-green-500';
          break;
        case 2024:
          colorClass = 'text-orange-500';
          break;
        default:
          colorClass = 'text-gray-500';
      }
    }
    // Randomly choose one of several icons for variety
    const icons = [<FaCompactDisc key="disc" />, <FaHeadphones key="headphones" />, <FaMusic key="music" />];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    return <div className={`w-12 h-12 flex items-center justify-center ${colorClass}`}>{randomIcon}</div>;
  };

  return (
    <div className="beats-list-container w-full min-h-screen mt-20 p-4 relative bg-black bg-opacity-80 text-white">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Beats Available</h1>
      {/* Filters */}
      <div className="filters grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by Beat Name"
          value={filterBeatName}
          onChange={(e) => setFilterBeatName(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-700"
        />
        <input
          type="text"
          placeholder="Filter by Beat Key"
          value={filterBeatKey}
          onChange={(e) => setFilterBeatKey(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-700"
        />
        <input
          type="text"
          placeholder="Filter by Beat Producer"
          value={filterBeatProducer}
          onChange={(e) => setFilterBeatProducer(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-700"
        />
        <input
          type="text"
          placeholder="Filter by Beat Date"
          value={filterBeatDate}
          onChange={(e) => setFilterBeatDate(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-700"
        />
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Min BPM"
            value={filterBeatPerMinMin}
            onChange={(e) => setFilterBeatPerMinMin(e.target.value === '' ? '' : Number(e.target.value))}
            className="p-2 rounded bg-gray-800 border border-gray-700 w-full"
          />
          <input
            type="number"
            placeholder="Max BPM"
            value={filterBeatPerMinMax}
            onChange={(e) => setFilterBeatPerMinMax(e.target.value === '' ? '' : Number(e.target.value))}
            className="p-2 rounded bg-gray-800 border border-gray-700 w-full"
          />
        </div>
        <div className="flex items-center">
          <label htmlFor="beatsPerPage" className="mr-2">
            Beats per page:
          </label>
          <select
            id="beatsPerPage"
            value={beatsPerPage}
            onChange={(e) => setBeatsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="p-2 rounded bg-gray-800 border border-gray-700"
          >
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>
      {/* Beats list */}
      <div
        className="beats-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        style={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        {currentBeats.map((beat, index) => (
          <div
            key={index}
            className="beat-item bg-gray-900 bg-opacity-75 p-4 rounded flex items-center space-x-4 hover:shadow-lg transition-all cursor-pointer"
            // Note: on clicking, only the beat URL is passed. The audio file isn’t loaded until the visualizer mounts.
            onClick={() => onBeatSelect(beat.audioFile)}
          >
            {getBeatIcon(beat)}
            <div>
              <h2 className="text-xl font-semibold">{beat.beatName}</h2>
              <p className="text-sm">Key: {beat.beatKey || 'N/A'}</p>
              <p className="text-sm">Producer: {beat.beatProducer}</p>
              <p className="text-sm">Date: {beat.beatDate}</p>
              <p className="text-sm">BPM: {beat.beatPerMin || 'N/A'}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination */}
      {beatsPerPage !== 'all' && totalPages > 1 && (
        <div className="pagination mt-6 flex justify-center space-x-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BeatsList;
