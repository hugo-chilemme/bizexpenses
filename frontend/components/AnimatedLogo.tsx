"use client";
import { motion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

export default function AnimatedLogo({ width = 8 }: { width?: number }) {
	const containerSize = `${width / 2}rem`;
	const dotSize = `${width / 5}rem`;

	return (
		<div
			className="flex relative flex-col items-center justify-center bg-gradient-to-tr from-indigo-400 to-blue-400 rounded-full gap-0.5 pb-3"
			style={{
				width: containerSize,
				height: containerSize,
				minWidth: containerSize,
				minHeight: containerSize,
			}}
		>
			<div className="flex gap-2 items-center justify-center">
				{[0, 1].map((i) => (
					<div
						key={i}
						className="bg-white rounded-full shadow-2xl"
						style={{
							width: dotSize,
							height: dotSize,
							minWidth: dotSize,
							minHeight: dotSize,
						}}
					/>
				))}
			</div>
		</div>
	);
}
