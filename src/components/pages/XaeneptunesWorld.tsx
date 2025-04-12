"use client";

import Image from "next/image";
import { useMemo } from "react";

export default function XaeneptunesWorld() {
  /** ----------------------------------------------------------------
   *  Pick one of 16 random portrait shots each time the page mounts
   * ----------------------------------------------------------------*/
  const randomImageUrl = useMemo(() => {
    const idx = Math.floor(Math.random() * 16) + 1; // 1‑16 inclusive
    return `https://xaeneptune.s3.us-east-2.amazonaws.com/images/Xaeneptune/Xaeneptune${idx}.webp`;
  }, []);

  return (
    <div
      className="min-h-screen mt-20 text-white p-8 relative flex flex-col"
      style={{
        backgroundImage:
          'url("https://xaeneptune.s3.us-east-2.amazonaws.com/images/Xaeneptune/XaeneptuneSECURITY.webp")',
        backgroundRepeat: "repeat",
        backgroundSize: "260px",
        backgroundAttachment: "fixed", // Parallax effect enabled
      }}
    >
      {/* translucent dark overlay for readability */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0" />

      {/* --------------------------------------------------------------
       *  HERO – borrowed & adapted from the Main‑Artist snippet
       * ------------------------------------------------------------*/}
      <header className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">
          XAE&nbsp;NEPTUNE
        </h1>

        <div className="flex justify-center mb-6 relative w-40 h-40 mx-auto">
          <Image
            src={randomImageUrl}
            alt="Xae Neptune portrait"
            fill
            priority
            className="rounded-full object-cover border-4 border-white shadow-xl"
            sizes="(max-width: 768px) 160px, 200px"
          />
        </div>

        <p className="text-lg mb-2 italic">
          Record Producer • Composer • Creative Technologist
        </p>
      </header>

      {/* --------------------------------------------------------------
       *  BODY CONTENT
       * ------------------------------------------------------------*/}
      <main className="relative z-10 max-w-4xl mx-auto space-y-14 leading-relaxed">
        {/* — Journey / Learning — */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">Learning the Craft</h2>
          <p className="mb-4">
            “YouTube is an essential tool for any producer starting out. Looking
            up tutorials for whatever style or genre you want to emulate is
            crucial to finding your sound. You have to be willing to absorb new
            information on a daily basis. A big mistake that I made was feeling
            as though I didn’t need to keep looking for new techniques or
            shortcuts to get better after learning the basics. There’s always
            something to learn and improve upon when honing your craft.”
          </p>
        </section>

        {/* — Background & Context — */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">Background & Context</h2>
          <p className="mb-4">
            I’ve been producing since 2021, starting with beats in FL Studio and
            gradually carving out a sonic identity that blends unorthodox
            melodies with hard‑hitting rhythms. In just three years I’ve
            released over&nbsp;20 songs with artists across all major streaming
            platforms, executive‑produced six projects, and created well over
            100 beats.
          </p>
          <p className="mb-4">
            What sets me apart is a genuine love of music. I work closely with
            every vocalist I collaborate with to make sure the final product
            feels alive. Vocalists don’t exist without producers and vice versa
            &mdash; that synergy is the foundation of my process.
          </p>
        </section>

        {/* — Current Project — */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">Current Project</h2>
          <p className="mb-4">
            I’m deep into my debut solo EP&nbsp;<strong>SECURITY</strong>,
            expected to debut in <strong>2025</strong>. It’s a response to
            imposter syndrome and creative comparison &mdash; a project where I
            pour raw emotion and lived experience into every track. Whatever the
            world thinks of it, I know it’ll stand as work I’m proud of.
          </p>
        </section>

        {/* — Mission — */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">Mission</h2>
          <p className="mb-4">
            My north star is simple: <em>have fun</em>. If I’m not enjoying the
            process, I step back until the spark returns. Beyond that, my goal
            is to earn a living through creativity. I’m surrounded by people who
            prove it’s possible; the rest is consistent work.
          </p>
        </section>

        {/* — Influential Resources — */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">
            Books &amp; Resources That Hit Home
          </h2>
          <p className="mb-4">
            Two YouTube essays I revisit whenever I need to refocus are&nbsp;
            <em>“Basquiat’s Work Ethic”</em> and&nbsp;
            <em>“Prince’s Work Ethic”</em> by{" "}
            <strong>Make&nbsp;Art&nbsp;Not&nbsp;Content</strong>. Each video is
            a concise masterclass in relentless creativity.
          </p>
        </section>

        {/* — Contact — */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">Contact &amp; Social</h2>
          <ul className="space-y-2 text-lg">
            <li>
              <strong>Website:</strong>{" "}
              <a
                href="https://antiheroes.co"
                target="_blank"
                className="text-emerald-400 hover:underline"
              >
                https://antiheroes.co
              </a>
            </li>
            <li>
              <strong>Instagram:</strong>{" "}
              <a
                href="https://www.instagram.com/xaeneptune"
                target="_blank"
                className="text-emerald-400 hover:underline"
              >
                @xaeneptune
              </a>
            </li>
            <li>
              <strong>YouTube:</strong>{" "}
              <a
                href="https://youtube.com/@xaeneptune"
                target="_blank"
                className="text-emerald-400 hover:underline"
              >
                youtube.com/@xaeneptune
              </a>
            </li>
            <li>
              <strong>SoundCloud:</strong>{" "}
              <a
                href="https://on.soundcloud.com/bFiGExpCeZr3tLHn9"
                target="_blank"
                className="text-emerald-400 hover:underline"
              >
                soundcloud.com/xaeneptune
              </a>
            </li>
            <li>
              <strong>LinkedIn:</strong>{" "}
              <a
                href="https://www.linkedin.com/in/xavier-lewis"
                target="_blank"
                className="text-emerald-400 hover:underline"
              >
                linkedin.com/in/xavier-lewis
              </a>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
