import React from "react";

export interface AudioVisualizerProps {
  audioUrl: string;
  onGoBack: () => void;
  onShuffle: () => void;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  audioUrl,
  onGoBack,
  onShuffle,
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File uploaded", e.target.files);
    // You could create an object URL and update global state here if needed.
  };

  return (
    <div className="audio-visualizer-ui p-4 bg-black bg-opacity-50 fixed inset-0 z-50 flex flex-col items-center justify-center text-white">
      <h1 className="text-2xl font-bold mb-4 text-center">Audio Visualizer</h1>
      <div className="upload-section text-center mb-6">
        <label
          htmlFor="audio-upload"
          className="cursor-pointer text-white font-bold bg-gradient-to-r from-indigo-800 via-red-700 to-indigo-900 px-4 py-2 rounded"
        >
          Upload Audio
        </label>
        <input
          id="audio-upload"
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      <p className="mb-4">Now playing: {audioUrl || "No beat selected"}</p>
      <div className="flex space-x-4">
        <button onClick={onGoBack} className="px-4 py-2 bg-red-600 rounded">
          Go Back
        </button>
        <button onClick={onShuffle} className="px-4 py-2 bg-green-600 rounded">
          Shuffle Beat
        </button>
      </div>
    </div>
  );
};

export default AudioVisualizer;
