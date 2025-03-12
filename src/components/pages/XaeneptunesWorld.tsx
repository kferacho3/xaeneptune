'use client';

import { Html } from '@react-three/drei';

export default function XaeneptunesWorld() {
  return (
    <Html fullscreen>
      <div className="min-h-screen text-tertiary p-8 relative">
        {/* Blurred overlay */}
        <div className="absolute inset-0 bg-black opacity-30 backdrop-blur-sm z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-6">XAENEPTUNE&apos;S WORLD</h1>
          <section className="mb-8">
            <h2 className="text-3xl font-semibold mb-4">Introducing Xavier Lewis</h2>
            <p className="mb-4">
              My passion for music can be traced back to middle school. I started playing violin in the 6th grade and performed throughout middle and high school.
            </p>
            <p className="mb-4">
              During my junior and senior years, I attended orchestra class multiple times per day, learning to play viola, cello, bass, and even percussion instruments such as the djembe (a West African drum).
            </p>
            <p className="mb-4">
              I began making rap songs on SoundCloud during my senior year—my first real attempt at creating my own art. During college, at the peak of the Covid epidemic, I transitioned into music production and beat-making, and I’ve been doing it ever since.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-3xl font-semibold mb-4">Lessons, Challenges & Business</h2>
            <p className="mb-4">
              Getting the equipment you need to fulfill your passions can be discouraging, especially when funds are limited. In my early days as a producer, saving for essentials like FL Studio, a microphone, and an interface was a challenge. Even when I was in orchestra, I often had to borrow instruments until my mom could buy me a better-quality one.
            </p>
            <p className="mb-4">
              I’m a record producer and beatmaker, having executive produced on four projects including my full-length mixtape, <em>Social Networks</em>. This project, which took over a year to complete, is my greatest achievement. I create music that reflects what I love to hear daily—unique, sometimes unorthodox melodies paired with hard-hitting 808s and dynamic drum patterns.
            </p>
            <p className="mb-4">
              I take calculated risks in my work. Even if there’s a chance of failure, I trust my experience and judgment to make worthwhile decisions, balancing caution with creativity.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-3xl font-semibold mb-4">Contact & Social Media</h2>
            <ul className="space-y-2 text-lg">
              <li>
                <strong>Instagram:</strong> <a href="https://www.instagram.com/xaeneptune" target="_blank" className="text-blue-400 hover:underline">https://www.instagram.com/xaeneptune</a>
              </li>
              <li>
                <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/xavier-lewis" target="_blank" className="text-blue-400 hover:underline">https://www.linkedin.com/in/xavier-lewis</a>
              </li>
              <li>
                <strong>YouTube:</strong> <a href="https://youtube.com/@xaeneptune" target="_blank" className="text-blue-400 hover:underline">https://youtube.com/@xaeneptune</a>
              </li>
              <li>
                <strong>SoundCloud:</strong> <a href="https://on.soundcloud.com/bFiGExpCeZr3tLHn9" target="_blank" className="text-blue-400 hover:underline">https://on.soundcloud.com/bFiGExpCeZr3tLHn9</a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </Html>
  );
}
