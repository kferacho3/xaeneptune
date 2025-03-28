// src/app/admin/page.tsx
"use client";

import { useState } from "react";

export default function AdminPage() {
  const [musicContent, setMusicContent] = useState<string>("");
  const [artistContent, setArtistContent] = useState<string>("");
  // Add additional state for Beats, Albums, etc. as needed

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, send updated content to your backend or CMS API
    console.log({ musicContent, artistContent });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-black p-4">
      <h1 className="text-3xl font-bold mb-6">Admin CMS</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4">
        <div>
          <label className="block font-semibold mb-1">Music Page Content</label>
          <textarea
            className="w-full p-2 border rounded"
            value={musicContent}
            onChange={(e) => setMusicContent(e.target.value)}
            rows={4}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">
            Artist Page Content
          </label>
          <textarea
            className="w-full p-2 border rounded"
            value={artistContent}
            onChange={(e) => setArtistContent(e.target.value)}
            rows={4}
          />
        </div>
        {/* Add more fields for Beats, Albums, etc. */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
