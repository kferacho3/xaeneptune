// /src/components/pages/Connect.tsx
'use client';

import { useState } from 'react';

export default function Connect() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission (for now, just an alert)
    alert("Message sent!");
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <>
      <div className="min-h-screen text-tertiary p-4 relative flex items-center justify-center">
        {/* Blurred overlay */}
        <div className="absolute inset-0 bg-black opacity-30 backdrop-blur-sm z-0"></div>
        <div className="relative z-10 bg-black bg-opacity-75 p-8 rounded shadow-lg w-full max-w-md">
          <h1 className="text-4xl font-bold text-center mb-6">Connect</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Message</label>
              <textarea 
                name="message" 
                value={formData.message} 
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white"
                rows={4}
                required
              />
            </div>
            <button type="submit" className="w-full py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
