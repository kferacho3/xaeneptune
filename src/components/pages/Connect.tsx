// /src/components/pages/Connect.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaHandshake,
  FaHeadphones,
  FaMicrophone,
  FaMusic,
  FaPaperPlane,
  FaPhone,
  FaQuestionCircle,
  FaTools,
  FaUser,
} from "react-icons/fa";

/* ─────────────────────── Types ─────────────────────── */
interface FormData {
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  subject: string;
  message: string;
}

const inquiryTypes = [
  { value: "beats", label: "Beat Purchase/Licensing", icon: FaMusic },
  { value: "collab", label: "Collaboration", icon: FaHandshake },
  { value: "studio", label: "Studio Time", icon: FaClock },
  { value: "engineering", label: "Mix & Master", icon: FaTools },
  { value: "production", label: "Music Production", icon: FaHeadphones },
  { value: "features", label: "Feature Request", icon: FaMicrophone },
  { value: "general", label: "General Inquiry", icon: FaQuestionCircle },
];

/* ─────────────────────── Component ─────────────────────── */
export default function Connect() {
  /* State */
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    inquiryType: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  /* Disable body scroll while modal is open */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  /* Handlers --------------------------------------------------------- */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.inquiryType)
      newErrors.inquiryType = "Please select an inquiry type";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const inquiryLabel =
      inquiryTypes.find((t) => t.value === formData.inquiryType)?.label ||
      formData.inquiryType;

    const body = `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || "Not provided"}
Inquiry Type: ${inquiryLabel}

Message:
${formData.message}`.trim();

    const mailto = `mailto:contact@antiheroes.co?subject=${encodeURIComponent(
      `[${inquiryLabel}] ${formData.subject}`
    )}&body=${encodeURIComponent(body)}`;

    setTimeout(() => {
      window.location.href = mailto;
      setIsSubmitting(false);
      setShowSuccess(true);

      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          phone: "",
          inquiryType: "",
          subject: "",
          message: "",
        });
        setShowSuccess(false);
      }, 3000);
    }, 1000);
  };

  /* Render ----------------------------------------------------------- */
  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
      >
        <motion.div
          key="modal"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          /* 95 vw on mobile, 75 vw on ≥ md; hide horizontal overflow */
          className="relative h-[90vh] w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl md:w-[75vw]"
        >
          {/* Decorative orbs (clipped by overflow-x-hidden) */}
          <div className="absolute -top-16 -left-16 h-32 w-32 rounded-full bg-purple-600/20 blur-3xl" />
          <div className="absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-emerald-600/20 blur-3xl" />

          {/* Content */}
          <div className="relative px-4 pb-8 pt-6 sm:px-6 sm:pb-10">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <motion.h1
                  className="bg-gradient-to-r from-purple-300 to-emerald-300 bg-clip-text text-3xl font-black text-transparent sm:text-4xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Let&apos;s Connect
                </motion.h1>
                <motion.p
                  className="mt-2 text-gray-400"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Have a project in mind? Let&apos;s bring your vision to life.
                </motion.p>
              </div>
            </div>

            {/* Success Banner */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-600/30 bg-emerald-600/20 p-4"
                >
                  <FaCheckCircle className="text-xl text-emerald-400" />
                  <p className="text-emerald-300">
                    Your message has been sent successfully!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name & Email */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Name */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="mb-1 block text-sm font-medium text-gray-400">
                    <FaUser className="mr-2 inline" />
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full rounded-xl border px-4 py-2.5 text-white placeholder-gray-500 transition-colors focus:border-purple-500 focus:outline-none ${
                      errors.name
                        ? "border-red-500"
                        : "border-gray-700 bg-gray-800/50"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                  )}
                </motion.div>

                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <label className="mb-1 block text-sm font-medium text-gray-400">
                    <FaEnvelope className="mr-2 inline" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={`w-full rounded-xl border px-4 py-2.5 text-white placeholder-gray-500 transition-colors focus:border-purple-500 focus:outline-none ${
                      errors.email
                        ? "border-red-500"
                        : "border-gray-700 bg-gray-800/50"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                  )}
                </motion.div>
              </div>

              {/* Phone & Inquiry Type */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Phone */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="mb-1 block text-sm font-medium text-gray-400">
                    <FaPhone className="mr-2 inline" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-colors focus:border-purple-500 focus:outline-none"
                  />
                </motion.div>

                {/* Inquiry Type */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <label className="mb-1 block text-sm font-medium text-gray-400">
                    Inquiry Type *
                  </label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className={`w-full cursor-pointer appearance-none rounded-xl border px-4 py-2.5 text-white transition-colors focus:border-purple-500 focus:outline-none ${
                      errors.inquiryType
                        ? "border-red-500 bg-gray-800/50"
                        : "border-gray-700 bg-gray-800/50"
                    }`}
                  >
                    <option value="" className="text-gray-500">
                      Select inquiry type...
                    </option>
                    {inquiryTypes.map((t) => (
                      <option key={t.value} value={t.value} className="bg-gray-800">
                        {t.label}
                      </option>
                    ))}
                  </select>
                  {errors.inquiryType && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.inquiryType}
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Subject */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="mb-1 block text-sm font-medium text-gray-400">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief description of your inquiry"
                  className={`w-full rounded-xl border px-4 py-2.5 text-white placeholder-gray-500 transition-colors focus:border-purple-500 focus:outline-none ${
                    errors.subject
                      ? "border-red-500 bg-gray-800/50"
                      : "border-gray-700 bg-gray-800/50"
                  }`}
                />
                {errors.subject && (
                  <p className="mt-1 text-xs text-red-400">{errors.subject}</p>
                )}
              </motion.div>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <label className="mb-1 block text-sm font-medium text-gray-400">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell me about your project, ideas, or questions..."
                  className={`w-full resize-none rounded-xl border px-4 py-2.5 text-white placeholder-gray-500 transition-colors focus:border-purple-500 focus:outline-none ${
                    errors.message
                      ? "border-red-500 bg-gray-800/50"
                      : "border-gray-700 bg-gray-800/50"
                  }`}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-400">{errors.message}</p>
                )}
              </motion.div>

              {/* Submit */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-600 py-3 font-bold text-white transition-all duration-300 ${
                    isSubmitting
                      ? "cursor-not-allowed opacity-50"
                      : "hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, ease: "linear", repeat: Infinity }}
                        className="h-5 w-5 rounded-full border-2 border-t-transparent border-white"
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Send Message
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            {/* Quick Inquiry Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 border-t border-gray-800 pt-6"
            >
              <p className="mb-3 text-center text-sm text-gray-500">
                Quick inquiry options:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {inquiryTypes.map((t) => {
                  const Icon = t.icon;
                  return (
                    <motion.button
                      key={t.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          inquiryType: t.value,
                          subject: `${t.label} Inquiry`,
                        }))
                      }
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all duration-200 ${
                        formData.inquiryType === t.value
                          ? "border-purple-500 bg-purple-600/20 text-purple-300"
                          : "border-gray-700 bg-gray-800/30 text-gray-400 hover:border-purple-500/50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {t.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-5 text-center text-xs text-gray-500"
            >
              Your message will be sent to contact@antiheroes.co
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
