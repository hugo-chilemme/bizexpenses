"use client";
import { useEffect } from "react";
import { useAnimation, motion } from "framer-motion";
import TicketLanding from "../components/TicketLanding";
import { CATEGORIES, DEFAULT_RULES } from "../types/categories";
import { FaCheck } from "react-icons/fa6";


export default function BlockLanding({rules, setRules}) {
  return (
<div className="2xl:w-[70vw] min-h-screen  mx-auto relative flex flex-col md:flex-row items-center justify-between">
        {/* Texte à gauche */}
        <div className="flex-1 flex flex-col justify-center items-start">
          <motion.h1
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-black text-white mb-6 text-left"
          >
            Gérer les catégories de dépenses
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-2xl text-white/90 mb-10 text-left"
          >
            Organisez vos dépenses en catégories pour une gestion plus efficace et une meilleure visibilité des coûts.
          </motion.p>

          <motion.div 
            className="flex flex-wrap gap-4 mt-6 w-[75%]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            { CATEGORIES.map((category, index) => (
                <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`font-semibold text-sm px-4 py-2 rounded-full shadow-lg mb-2 ${
                  rules.allowedCategories.includes(category)
                  ? "bg-green-300 text-green-950"
                  : "bg-red-300 text-red-950"
                }`}
                onClick={() => {
                  if (rules.allowedCategories.includes(category)) {
                    setRules(prev => ({
                      ...prev,
                      allowedCategories: prev.allowedCategories.filter(cat => cat !== category)
                    }));
                  } else {
                    setRules(prev => ({
                      ...prev,
                      allowedCategories: [...prev.allowedCategories, category]
                    }));
                  }}
                }
                >
                {category}
                {rules.allowedCategories.includes(category) && (
                  <FaCheck className="inline-block ml-2 text-green-950 -mt-1" />
                )}
                </motion.div>
            ))}

          </motion.div>
        </div>
           <div className="flex-1 z-10 relative flex items-start justify-start">
        </div>

      </div>
  );
}