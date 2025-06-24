"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function TypeWriter({
	text,
	className,
	children,
}: {
	text: string;
	className?: string;
	children?: React.ReactNode;
}) {
	const [displayedText, setDisplayedText] = useState("");
	const [inProgress, setInProgress] = useState(true);

	// Split text into words
	const words = text.split(" ");

	// Reset displayedText when text changes
	useEffect(() => {
		setDisplayedText("");
		setInProgress(true);
	}, [text]);

	useEffect(() => {
		const displayedWords = displayedText ? displayedText.split(" ") : [];
		if (displayedWords.length >= words.length) {
			setInProgress(false);
			return;
		}

		function addWord() {
			setDisplayedText((prev) => {
				const prevWords = prev ? prev.split(" ") : [];
				if (prevWords.length < words.length) {
					return words.slice(0, prevWords.length + 1).join(" ");
				}
				return prev;
			});
		}
		const interval = setInterval(addWord, Math.random() * 200 + 0);

		return () => clearInterval(interval);
	}, [text, displayedText]);

	return <span className={className}>
		{displayedText}
		{inProgress && <motion.span className="bg-indigo-600 h-2.5 w-2.5 inline-flex ml-2 rounded-full" 
			animate={{ scale: [1, 0.5, 1], opacity: [1, 0.5, 1] }}
			transition={{ duration: 0.5, repeat: Infinity }}
		/>}

		{!inProgress && children ? children : null}
	</span>;
}