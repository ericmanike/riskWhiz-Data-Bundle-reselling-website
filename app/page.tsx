'use client'

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Wifi, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";
import { FaPhone, FaWhatsapp } from "react-icons/fa";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/hero_bg.png" 
            alt="Hero Background" 
            fill
            className="object-cover"
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent z-10" />
        </div>

        <main className="relative z-20 w-full max-w-7xl mx-auto flex flex-col items-start text-left px-6 sm:px-12 md:px-20 mt-16 md:mt-24">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 max-w-3xl"
          >
            Buy <span className="text-yellow-400">Affordable Data</span> <br className="hidden md:block" /> Bundles Instantly
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-200 text-base sm:text-lg md:text-xl mb-10 max-w-2xl font-light"
          >
            RiskWhiz provides faster, affordable data delivery across Ghana. Stay connected without breaking the bank.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full sm:w-auto"
          >
            <Link href="/buy" className="block w-full">
              <div className="group flex items-center justify-center gap-2 sm:gap-3 w-full bg-yellow-500 text-slate-900 px-6 py-4 sm:px-10 sm:py-5 md:px-7 md:py-3.5 rounded-full font-bold text-base sm:text-xl md:text-lg hover:bg-yellow-400 transition-all shadow-[0_0_40px_rgba(234,179,8,0.3)] hover:shadow-[0_0_60px_rgba(234,179,8,0.5)] hover:-translate-y-1">
                Place Your Order Now
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
          </motion.div>
        </main>
      </section>

      {/* Features Section */}
      <section className="py-24 w-full max-w-7xl mx-auto px-6 sm:px-12 md:px-20 relative z-30 -mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 sm:p-10 rounded-[2rem] border border-gray-100 bg-white/90 backdrop-blur-xl shadow-2xl shadow-gray-200/50 hover:shadow-blue-900/10 transition-all hover:-translate-y-2 group"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors duration-500">
              <Wifi className="text-blue-600 group-hover:text-white transition-colors duration-500" size={32} />
            </div>
            <h3 className="font-bold text-2xl mb-4 text-slate-900">
              All Major Networks
            </h3>
            <p className="text-slate-600 text-lg leading-relaxed">
              Fully supported access to MTN, Telecel, and AirtelTigo. Never get disconnected regardless of your carrier.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-8 sm:p-10 rounded-[2rem] border border-gray-100 bg-white/90 backdrop-blur-xl shadow-2xl shadow-gray-200/50 hover:shadow-green-900/10 transition-all hover:-translate-y-2 group"
          >
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-green-500 transition-colors duration-500">
              <Shield className="text-green-500 group-hover:text-white transition-colors duration-500" size={32} />
            </div>
            <h3 className="font-bold text-2xl mb-4 text-slate-900">
              Affordable Prices
            </h3>
            <p className="text-slate-600 text-lg leading-relaxed">
              Enjoy competitive rates with great value for money. We ensure you get the most out of every cedi spent.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-8 sm:p-10 rounded-[2rem] border border-gray-100 bg-white/90 backdrop-blur-xl shadow-2xl shadow-gray-200/50 hover:shadow-yellow-900/10 transition-all hover:-translate-y-2 group"
          >
            <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-yellow-400 transition-colors duration-500">
              <Zap className="text-yellow-500 group-hover:text-white transition-colors duration-500" size={32} />
            </div>
            <h3 className="font-bold text-2xl mb-4 text-slate-900">
              Fastest Delivery
            </h3>
            <p className="text-slate-600 text-lg leading-relaxed">
              Receive your data bundle within minutes after payment. Our automated system works 24/7 for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer Actions */}
      <footer className="w-full bg-slate-900 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="https://chat.whatsapp.com/JxpJjBisX0BGOO5BY8yWJJ?mode=gi_t"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 md:gap-2 lg:gap-3 bg-slate-800/80 text-white rounded-2xl p-4 md:p-3 lg:p-4 hover:bg-green-600 transition-all duration-300 shadow-lg border border-slate-700/50 hover:border-green-500"
            >
              <FaWhatsapp className="w-6 h-6 md:w-5 md:h-5" />
              <span className="font-medium text-base md:text-sm lg:text-base">Join us on WhatsApp</span>
            </motion.a>

            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="https://wa.me/233551043686"
              className="flex items-center justify-center gap-3 md:gap-2 lg:gap-3 bg-slate-800/80 text-white rounded-2xl p-4 md:p-3 lg:p-4 hover:bg-blue-600 transition-all duration-300 shadow-lg border border-slate-700/50 hover:border-blue-500"
            >
              <FaPhone className="w-5 h-5 md:w-4 md:h-4" />
              <span className="font-medium text-base md:text-sm lg:text-base">Contact Support</span>
            </motion.a>

            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="/terms"
              className="flex items-center justify-center bg-slate-800/80 text-white rounded-2xl p-4 md:p-3 lg:p-4 hover:bg-slate-700 transition-all duration-300 shadow-lg border border-slate-700/50"
            >
              <span className="font-medium text-base md:text-sm lg:text-base">Terms of Service</span>
            </motion.a>
          </div>
          <div className="text-center text-slate-500 mt-16 text-sm font-medium">
            &copy; {new Date().getFullYear()} RiskWhiz. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
