// src/components/TopBarNavbar.tsx
'use client';

import Image from 'next/image';

export default function TopBarNavbar() {
  return (
    <div className="fixed top-0 inset-x-0 flex justify-between items-center p-4 bg-[rgba(0,0,0,0.6)] backdrop-blur-md border-b border-white z-40">
      <div className="flex items-center space-x-2">
        <Image
          src="/AntiHeroLogo.png"
          alt="AntiHero Logo"
          width={50}
          height={50}
          priority
        />
        <div
          className="text-white text-7xl"
          style={{ fontFamily: '"Devil3", sans-serif' }}
        >
          ANTI HERO
        </div>
      </div>
      <div className="flex space-x-4">
        <a
          href="https://twitter.com"
          className="text-white hover:text-[var(--secondary-color)]"
        >
          Twitter
        </a>
        <a
          href="https://instagram.com"
          className="text-white hover:text-[var(--secondary-color)]"
        >
          Instagram
        </a>
        <a
          href="https://facebook.com"
          className="text-white hover:text-[var(--secondary-color)]"
        >
          Facebook
        </a>
      </div>
    </div>
  );
}
