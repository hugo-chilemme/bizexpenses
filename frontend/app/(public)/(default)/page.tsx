"use client";
import TicketLanding from "./components/TicketLanding";
import { CATEGORIES, DEFAULT_RULES } from "./types/categories";
import BlockLanding from "./blocks/BlockLanding";
import BlockCategories from "./blocks/BlockCategories";
import BlockPrices from "./blocks/BlockPrices";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function Page() {
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [activeBlock, setActiveBlock] = useState(0);

  // Create refs for each block
  const landingRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const pricesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // change active block when the active page in height is detected by scroll
    const handleScroll = () => {
      const OFFSET = 300; // 200px before each div
      const blocks = [
        { id: "landing", ref: landingRef, n: 0 },
        { id: "categories", ref: categoriesRef, n: 1 },
        { id: "prices", ref: pricesRef, n: 2 },
      ];

      let found = false;
      for (const block of blocks) {
        if (block.ref.current) {
          const rect = block.ref.current.getBoundingClientRect();
          // Check if the block is in the viewport (top <= OFFSET && bottom > OFFSET)
          if (rect.top <= OFFSET && rect.bottom > OFFSET) {
            setActiveBlock(block.n);
            found = true;
            break;
          }
        }
      }
      if (!found) setActiveBlock(0);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check on mount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-tr from-indigo-500 via-sky-400 to-blue-500 px-4">
      <div ref={landingRef}>
        <BlockLanding rules={rules} setRules={setRules} />
      </div>
      <div ref={categoriesRef}>
        <BlockCategories rules={rules} setRules={setRules} />
      </div>
      <div ref={pricesRef}>
        <BlockPrices rules={rules} setRules={setRules} />
      </div>
      <motion.div
        className="absolute right-[49vh]"
        initial={false}
        animate={{
          top: typeof window !== "undefined" ? window.innerHeight * activeBlock : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 80, // plus lent
          damping: 30,   // plus lent
        }}
        style={{ transitionProperty: "top" }}
      >
        <TicketLanding rules={rules}/>
      </motion.div>
      
    </div>
  );
}
