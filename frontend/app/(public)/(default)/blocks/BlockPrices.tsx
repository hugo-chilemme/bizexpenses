"use client";
import { useEffect } from "react";
import { useAnimation, motion } from "framer-motion";
import TicketLanding from "../components/TicketLanding";
import { CATEGORIES, DEFAULT_RULES } from "../types/categories";
import { FaCheck } from "react-icons/fa6";
import { Input } from "@/components/ui/input";


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
            Contrôlez les dépenses par catégorie
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-2xl text-white/90 mb-10 text-left"
          >
            Gérez les dépenses de vos salariés en définissant des catégories autorisées pour une meilleure visibilité et contrôle des coûts.
          </motion.p>

          <motion.div 
            className="flex flex-wrap gap-4 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {CATEGORIES.filter(category => rules.allowedCategories.includes(category) || !rules.allowedCategories.length).map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`font-semibold flex gap-2 items-center px-4 py-2 rounded-lg mb-2 bg-white text-indigo-700`}
                >
                  {category}
                  <Input
                    type="number"
                    className="ml-2 w-20 text-left border-none bg-indigo-200/25 text-indigo-600"
                    value={rules.maxExpensePerCategory[category] ?? ""}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setRules(prev => ({
                        ...prev,
                        maxExpensePerCategory: {
                          ...prev.maxExpensePerCategory,
                          [category]: isNaN(value) ? 0 : value
                        }
                      }));
                    }}
                    min={0}
                    // Hide the spin buttons
                    inputMode="decimal"
                    pattern="[0-9]*"
                    onWheel={e => e.currentTarget.blur()}
                  />
                </motion.div>
            ))}

          </motion.div>
        </div>
         <div className="flex-1 z-10 relative flex items-start justify-start">
        </div>
      </div>
  );
}