// /src/components/pages/XaeneptunesWorld.tsx
"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  FaGlobeAmericas,
  FaInstagram,
  FaLinkedin,
  FaSoundcloud,
  FaYoutube,
} from "react-icons/fa";

/**
 * XaeneptunesWorld (About / Bio page) – snap-back + blank-space fixed
 */
export default function XaeneptunesWorld() {
  /* ───────────────────────── State & refs ─────────────────────────── */
  const [imgIdx, setImgIdx] = useState(() => Math.floor(Math.random() * 16) + 1);
  const [tooltip, setTooltip] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  /* ───────────────────── Mouse-parallax values ────────────────────── */
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const dampX = useSpring(rawX, { stiffness: 50, damping: 10 });
  const dampY = useSpring(rawY, { stiffness: 50, damping: 10 });

  const imgX  = useTransform(dampX, [-150, 150], [-25, 25]);
  const imgY  = useTransform(dampY, [-150, 150], [-25, 25]);
  const tiltX = useTransform(dampY, [-150, 150], [ 15, -15]);
  const tiltY = useTransform(dampX, [-150, 150], [-15,  15]);

  /* ────────────────── Cursor listener for avatar ──────────────────── */
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!avatarRef.current) return;
      const rect = avatarRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < 250) {
        rawX.set(dx); rawY.set(dy);
        if (dist < 160 && !tooltip) {
          setTooltip(true);
          setTimeout(() => setTooltip(false), 1800);
        }
      } else {
        rawX.set(0); rawY.set(0);
      }
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [tooltip, rawX, rawY]);

  /* ─────────────────── Helpers & constants ────────────────────────── */
  const randomizeImg = () => setImgIdx((p) => (p % 16) + 1);
  const imgSrc = `https://xaeneptune.s3.us-east-2.amazonaws.com/images/Xaeneptune/Xaeneptune${imgIdx}.webp`;

  /* ────────────────────────── Render ──────────────────────────────── */
  return (
    <div
      className=" overscroll-y-none 
                 text-gray-300"
    >
      {/* ────── background layers ────── */}
      <motion.div
        className="pointer-events-none absolute inset-0  via-transparent to-transparent opacity-40"
        initial={{ opacity: 0.25, scale: 1 }}
        animate={{ opacity: 0.4,  scale: 1.15 }}
        transition={{ duration: 35, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[url('/stars.svg')]
                   bg-[length:450px] opacity-10"
        animate={{ backgroundPositionX: ["0%", "100%"] }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      />


      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-32 pt-24
                      sm:px-6 lg:px-8">
        {/* ─────────── HERO ─────────── */}
        <header className="mb-20 flex flex-col items-center text-center sm:mb-24">
          <motion.h1
            className="mb-8 bg-gradient-to-r from-white via-purple-200 to-teal-200
                       bg-clip-text text-5xl font-extrabold tracking-tighter
                       text-transparent sm:text-6xl md:text-8xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            XAE&nbsp;NEPTUNE
          </motion.h1>

          {/* Avatar */}
          <motion.div
            ref={avatarRef}
            style={{
              x: imgX,
              y: imgY,
              rotateX: tiltX,
              rotateY: tiltY,
              transformStyle: "preserve-3d",
            }}
            className="relative h-40 w-40 cursor-pointer sm:h-48 sm:w-48 md:h-56 md:w-56"
            onClick={randomizeImg}
            whileHover={{ scale: 1.15 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full border-4
                         border-teal-300/50 shadow-[0_0_60px_-10px_rgba(45,212,191,0.5)]"
              whileHover={{
                scale: 1.1,
                borderColor: "rgba(147, 51, 234, 0.85)",
                boxShadow: "0 0 80px -20px rgba(147, 51, 234, 0.85)",
              }}
              transition={{ type: "spring", stiffness: 150 }}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={imgIdx}
                className="absolute inset-0 overflow-hidden rounded-full"
                initial={{ opacity: 0, scale: 0.4, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.4, rotate: 90 }}
                transition={{ duration: 0.45 }}
              >
                <Image
                  src={imgSrc}
                  alt="Xae Neptune portrait"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 640px) 160px, 220px"
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* tooltip */}
          <AnimatePresence>
            {tooltip && (
              <motion.span
                className="pointer-events-none absolute mt-48 text-sm font-medium
                           text-purple-300 sm:mt-56"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0,  opacity: 1 }}
                exit={{   y: 10, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                Tap to shuffle
              </motion.span>
            )}
          </AnimatePresence>

          <motion.p
            className="mt-8 text-lg font-light leading-relaxed
                       sm:mt-10 sm:text-xl md:text-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Record Producer • Composer • Creative Technologist
          </motion.p>
        </header>

        {/* ──────── CONTENT SECTIONS ──────── */}
        <main className="space-y-16 sm:space-y-20 lg:space-y-24">
          {sections.map(({ id, title, body, accent }) => (
            <motion.section
              key={id}
              className="relative overflow-hidden rounded-3xl border border-white/10
                         bg-white/5 p-6 shadow-[0_10px_50px_-15px_rgba(0,0,0,0.6)]
                         backdrop-blur sm:p-8 lg:p-10"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              {/* accent bar */}
              <div
                className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${accent}`}
              />

              <h2 className="mb-4 bg-gradient-to-r from-white via-purple-200 to-teal-200
                             bg-clip-text text-3xl font-bold text-transparent
                             sm:text-4xl md:text-5xl">
                {title}
              </h2>
              <p className="text-base leading-relaxed text-gray-300
                             sm:text-lg md:text-xl">
                {body}
              </p>
            </motion.section>
          ))}
        </main>

        {/* ──────── SOCIAL LINKS ──────── */}
        <motion.section
          className="mx-auto mt-28 grid max-w-4xl gap-6
                     sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {social.map(({ id, href, label, handle, gradient, Icon }) => (
            <motion.a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative flex items-center justify-between gap-4
                          rounded-2xl p-6 ${gradient} backdrop-blur
                          transition-shadow duration-200`}
              whileHover={{ y: -6, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div>
                <h3 className="font-semibold text-white">{label}</h3>
                <p className="text-sm text-gray-300">{handle}</p>
              </div>
              <Icon className="h-6 w-6 text-white/80
                               transition-colors group-hover:text-white" />
            </motion.a>
          ))}
        </motion.section>

        {/* ──────── FOOTER ──────── */}
        <motion.footer
          className="mt-28 text-center text-xs text-gray-500 sm:text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.hr
            className="mx-auto mb-6 h-px w-2/3
                       bg-gradient-to-r from-transparent via-purple-500 to-transparent"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1.2 }}
          />
          © {new Date().getFullYear()}&nbsp;Xae&nbsp;Neptune. All rights reserved.
        </motion.footer>
      </div>
    </div>
  );
}

/* ─────────────── Static data ─────────────── */
const sections = [
  {
    id: "craft",
    title: "Learning the Craft",
    body: `YouTube is an essential tool for any producer starting out. Looking up tutorials for whatever style or genre you want to emulate is crucial to finding your sound. You have to be willing to absorb new info daily; there's always something more to master.`,
    accent: "bg-purple-500",
  },
  {
    id: "context",
    title: "Background & Context",
    body: `Producing since 2021, I've carved out a sonic identity that fuses unorthodox melodies with hard-hitting rhythms. In three years I've released 20+ songs, executive-produced six projects and crafted 100+ beats.`,
    accent: "bg-teal-500",
  },
  {
    id: "project",
    title: "Current Project",
    body: `I'm deep into my debut solo EP SECURITY, dropping 2025: a raw response to imposter syndrome and creative comparison. Whatever the world thinks, it'll be work I'm proud of.`,
    accent: "bg-purple-500",
  },
  {
    id: "mission",
    title: "Mission",
    body: `My north star: have fun. If the spark fades, I pause until it returns. Beyond that, I aim to earn a living through creativity—consistent work turns dreams tangible.`,
    accent: "bg-teal-500",
  },
  {
    id: "resources",
    title: "Books & Resources That Hit Home",
    body: `Two YouTube essays I revisit when I need focus: “Basquiat's Work Ethic” & “Prince's Work Ethic” by Make Art Not Content—concise masterclasses in relentless creativity.`,
    accent: "bg-purple-500",
  },
] as const;

const social = [
  {
    id: "site",
    label: "Website",
    handle: "antiheroes.co",
    href: "https://antiheroes.co",
    gradient:
      "bg-gradient-to-br from-purple-900/20 to-purple-600/20 hover:from-purple-900/30 hover:to-purple-600/30",
    Icon: FaGlobeAmericas,
  },
  {
    id: "ig",
    label: "Instagram",
    handle: "@xaeneptune",
    href: "https://www.instagram.com/xaeneptune",
    gradient:
      "bg-gradient-to-br from-pink-900/20 to-purple-600/20 hover:from-pink-900/30 hover:to-purple-600/30",
    Icon: FaInstagram,
  },
  {
    id: "yt",
    label: "YouTube",
    handle: "@xaeneptune",
    href: "https://youtube.com/@xaeneptune",
    gradient:
      "bg-gradient-to-br from-red-900/20 to-pink-600/20 hover:from-red-900/30 hover:to-pink-600/30",
    Icon: FaYoutube,
  },
  {
    id: "sc",
    label: "SoundCloud",
    handle: "xaeneptune",
    href: "https://on.soundcloud.com/bFiGExpCeZr3tLHn9",
    gradient:
      "bg-gradient-to-br from-orange-900/20 to-red-600/20 hover:from-orange-900/30 hover:to-red-600/30",
    Icon: FaSoundcloud,
  },
  {
    id: "li",
    label: "LinkedIn",
    handle: "xavier-lewis",
    href: "https://www.linkedin.com/in/xavier-lewis",
    gradient:
      "bg-gradient-to-br from-blue-900/20 to-cyan-600/20 hover:from-blue-900/30 hover:to-cyan-600/30",
    Icon: FaLinkedin,
  },
] as const;
