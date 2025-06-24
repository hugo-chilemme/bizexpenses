"use client";
import { motion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";


export default function AnimatedLogo({width = 8}: { width?: number }) {
	return (
		<div
			className="flex relative flex-col  border-white items-center justify-center bg-gradient-to-tr from-indigo-400 to-blue-400 rounded-full gap-0.5 pb-3"
			style={{ width: `${width/2}rem`, height: `${width/2}rem`, minWidth: `${width/2}rem`, minHeight: `${width/2}rem` }}
		>
			<div className="flex gap-2 items-center justify-center">
				<div
					className="bg-white rounded-full shadow-2xl" style={{ width: `${width/5}rem`, height: `${width/5}rem`, minWidth: `${width/5}rem`, minHeight: `${width/5}rem` }}
				>
				</div>
				<div
					className="bg-white rounded-full shadow-2xl" style={{ width: `${width/5}rem`, height: `${width/5}rem`, minWidth: `${width/5}rem`, minHeight: `${width/5}rem` }}
				>
				</div>
			</div>
			
		</div>
	);
}
