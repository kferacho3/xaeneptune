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

/* ── brand-logo icons from react-icons ──────────────────────────────── */
import {
  FaGlobeAmericas,
  FaInstagram,
  FaLinkedin,
  FaSoundcloud,
  FaYoutube,
} from "react-icons/fa";

/**
 * XaeneptunesWorld (About / Bio page)
 * – Glassmorphic Fortune-500 aesthetic
 * – Immersive avatar (parallax, click to shuffle)
 * – Social cards now use react-icons only
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

  const imgX = useTransform(dampX, [-150, 150], [-25, 25]);
  const imgY = useTransform(dampY, [-150, 150], [-25, 25]);
  const tiltX = useTransform(dampY, [-150, 150], [15, -15]);
  const tiltY = useTransform(dampX, [-150, 150], [-15, 15]);

  /* ────────────────── Cursor listener for avatar ──────────────────── */
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!avatarRef.current) return;
      const rect = avatarRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < 250) {
        rawX.set(dx);
        rawY.set(dy);
        if (dist < 160 && !tooltip) {
          setTooltip(true);
          setTimeout(() => setTooltip(false), 1800);
        }
      } else {
        rawX.set(0);
        rawY.set(0);
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
    <div className="relative min-h-screen overflow-x-clip bg-black text-gray-300 selection:bg-purple-500/20">
      {/* background layers */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900 via-transparent to-transparent opacity-40"
        initial={{ opacity: 0.25, scale: 1 }}
        animate={{ opacity: 0.4, scale: 1.15 }}
        transition={{ duration: 35, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[url('/stars.svg')] bg-[length:450px] opacity-10"
        animate={{ backgroundPositionX: ["0%", "100%"] }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-32 pt-24">
        {/* HERO */}
        <header className="mb-24 flex flex-col items-center text-center">
          <motion.h1
            className="mb-8 bg-gradient-to-r from-white via-purple-200 to-teal-200 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent md:text-8xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            XAE NEPTUNE
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
            className="relative h-48 w-48 cursor-pointer md:h-56 md:w-56"
            onClick={randomizeImg}
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-teal-300/50 shadow-[0_0_60px_-10px_theme(colors.teal.400/50)]"
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
                  sizes="220px"
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* tooltip */}
          <AnimatePresence>
            {tooltip && (
              <motion.span
                className="pointer-events-none absolute mt-48 text-sm font-medium text-purple-300"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                Click me!
              </motion.span>
            )}
          </AnimatePresence>

          <motion.p
            className="mt-10 text-xl font-light md:text-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Record Producer • Composer • Creative Technologist
          </motion.p>
        </header>

        {/* CONTENT SECTIONS */}
        <main className="space-y-28">
          {sections.map(({ id, title, body, accent }) => (
            <motion.section
              key={id}
              className="relative rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_10px_50px_-15px_rgba(0,0,0,0.6)] backdrop-blur"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className={`absolute top-0 h-1 w-full rounded-t-3xl ${accent}`} />
              <h2 className="mb-6 bg-gradient-to-r from-white via-purple-200 to-teal-200 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                {title}
              </h2>
              <p className="leading-relaxed text-lg text-gray-300">{body}</p>
            </motion.section>
          ))}
        </main>

        {/* SOCIAL LINKS */}
        <motion.section
          className="mx-auto mt-32 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
              className={`group relative flex items-center justify-between gap-4 rounded-2xl p-6 ${gradient} backdrop-blur`}
              whileHover={{ y: -6, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div>
                <h3 className="font-bold text-white">{label}</h3>
                <p className="text-sm text-gray-300">{handle}</p>
              </div>
              <Icon className="h-6 w-6 text-white/80 transition-colors group-hover:text-white" />
            </motion.a>
          ))}
        </motion.section>

        {/* FOOTER */}
        <motion.footer
          className="mt-32 text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.hr
            className="mx-auto mb-6 h-px w-2/3 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1.2 }}
          />
          © 2024 Xae Neptune. All rights reserved.
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
