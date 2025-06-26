"use client";
import { useEffect } from "react";
import { useAnimation, motion } from "framer-motion";
import { isMobile } from "@/lib/utils";


export default function BlockLanding({rules}) {
  return (
<div className="2xl:w-[70vw] min-h-screen mx-auto relative flex flex-col md:flex-row items-center justify-between">
        {/* Texte à gauche */}
        <div className="flex-1 flex flex-col justify-center items-center md:items-start">
          <motion.h1
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-black text-white mb-6 text-center md:text-left"
          >
            Simplifiez la gestion des notes de frais
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-2xl text-white/90 mb-10 text-center md:text-left"
          >
            Désormais, gérez les dépenses de vos salariés en toute simplicité avec notre application de gestion des notes de frais.
          </motion.p>
          <div className="flex gap-8 mt-6 items-center">
            <motion.a
              href="/signup"
              whileHover={{ scale: 1.07, boxShadow: "0 8px 32px 0 rgba(0,0,0,0.25)" }}
              whileTap={{ scale: 0.5 }}
              className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-full shadow-lg transition-colors hover:bg-indigo-50"
            >
              Commencer
            </motion.a>
          <motion.a 
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="text-white font-medium hover:underline"
          >
            Commencer la visite
          </motion.a>

          </div>
        </div>
       { !isMobile() && (
         <div className="flex-1 z-10 relative flex items-end justify-end"/>
       )}
      </div>
  );
}