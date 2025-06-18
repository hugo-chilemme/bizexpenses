"use client";
import { useEffect, useState } from "react";

export default function TypeWriter({
	text,
	className,
}: {
	text: string;
	className?: string;
}) {
	const [displayedText, setDisplayedText] = useState("");

	// Reset displayedText when text changes
	useEffect(() => {
		setDisplayedText("");
	}, [text]);

	useEffect(() => {
		if (displayedText.length >= text.length) return;

		function addLetter() {
			setDisplayedText((prev) => {
				if (prev.length < text.length) {
					return text.slice(0, prev.length + 1);
				}
				return prev;
			});
		}
		const interval = setInterval(addLetter, Math.floor(Math.random() * 0) + 25);

		return () => clearInterval(interval);
	}, [text, displayedText]);

	return <span className={className}>{displayedText}</span>;
}