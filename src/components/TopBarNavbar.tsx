// src/components/TopBarNavbar.tsx
'use client';

export default function TopBarNavbar() {
  return (
    <div className="fixed top-0 inset-x-0 flex justify-between items-center p-4 bg-[rgba(0,0,0,0.6)] backdrop-blur-md border-b border-white z-40">
      <div className="text-white font-futuristic">Logo</div>
      <div className="flex space-x-4">
        {/* Add or remove social links as needed */}
        <a href="https://twitter.com" className="text-white hover:text-[var(--secondary-color)]">Twitter</a>
        <a href="https://instagram.com" className="text-white hover:text-[var(--secondary-color)]">Instagram</a>
        <a href="https://facebook.com" className="text-white hover:text-[var(--secondary-color)]">Facebook</a>
      </div>
    </div>
  );
}
