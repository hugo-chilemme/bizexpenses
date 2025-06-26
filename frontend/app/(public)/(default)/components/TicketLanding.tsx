"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IoChevronUp } from "react-icons/io5";
import { CATEGORIES, DEFAULT_RULES, FAKE_PRODUCTS_BY_CATEGORY } from "../types/categories";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { isMobile } from "@/lib/utils";



type Category = typeof CATEGORIES[number];
type Rules = typeof DEFAULT_RULES;

interface Row {
	category: Category;
	amount: number;
	widthPercent: number;
}

interface AnimatedTicketProps {
	rules?: Rules;
	rotation?: number;
}

const HEADER_ANIMATION = {
	backgroundColor: [
		"#e0e7ff",
		"#dbeafe",
		"#dbeafe",
		"#dbeafe",
		"#a5b4fc",
	],
};

const getRowColor = (
	allowed: boolean,
	overMax: boolean
) => {
	if (!allowed) return "#fbcfe8";
	if (overMax) return "#fbcfe8";
	return "#bbf7d0";
};

export default function AnimatedTicket({
	rules = DEFAULT_RULES,
	rotation = 8,
	subtext = true,
}: AnimatedTicketProps) {
	const [rows, setRows] = useState<Row[]>([]);
	const [transitionType, setTransitionType] = useState("first");

	const framer = (transitions) => {
		if (transitionType === "first") return transitions;
		else return { duration: 0.5, ease: "easeInOut", delay: 2 };
	};




	useEffect(() => {
		// Flatten FAKE_PRODUCTS_BY_CATEGORY into a list of { category, amount }
		const allProducts: Row[] = [];
		for (const category of Object.keys(FAKE_PRODUCTS_BY_CATEGORY) as Category[]) {
			const products = FAKE_PRODUCTS_BY_CATEGORY[category];
			products.forEach((product) => {
				allProducts.push({
					category,
					productName: product.name,
					amount: product.price,
					widthPercent: product.name.length * 5.75,
				});
			});
		}

		// Shuffle and pick up to 7 items
		const shuffled = allProducts.sort(() => Math.random() - 0.5).slice(0, 7);

		setRows(shuffled);
		setTimeout(() => {
			setTransitionType("second");
		}, 2000);
	}, []);

	return (
		<motion.div
			initial={{ y: 120, x: -60, scale: 0.5, opacity: 0, rotate: -8 }}
			animate={{ y: 0, x: 0, opacity: 1, rotate: rotation, scale: isMobile() ? 1.0 : 1.23 }}
			exit={{ opacity: 0 }}
			transition={framer({
				duration: 1.5,
				ease: "easeInOut",
				type: "spring",
				stiffness: 100,
			})}
			className={`absolute top-[75vh] md:left-auto md:top-[50vh] md:rotate-12 origin-center`}
			style={{
				width: 270,
				height: 330,
				zIndex: 2,
				marginLeft: -110,
				marginTop: -150,
			}}
		>
			{/* Animated top bar */}
			<motion.div
				key={JSON.stringify(rules)}
				className="h-1 bg-indigo-500 w-[120%] absolute z-50 -top-[10%]"
				initial={{ width: "0%", top: "0%" }}
				animate={{
					width: ["0%", "120%", "120%", "120%", "0%"],
					marginLeft: ["-10%", "-10%", "-10%", "-10%", "50%"],
					top: ["-10%", "-10%", "-10%", "105%", "105%"],
				}}
				transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
			/>

			{/* Ticket content */}
			<div className="w-full h-full bg-white rounded-xl shadow-lg z-20 border border-gray-200 flex flex-col px-4 py-6 overflow-hidden gap-2">
				{/* Header */}
				<div className="flex items-center justify-between flex-col mb-4">
					<div className="relative w-32 h-8">
						<motion.div
							initial={{ backgroundColor: "#e0e7ff" }}
							animate={framer(HEADER_ANIMATION)}
							transition={{ duration: 0.3, delay: 2 }}
							className="h-8 rounded absolute top-0 left-0 w-full"
						/>
					</div>
					<div className="relative w-36 h-4 mt-1">
						<motion.div
							initial={{ backgroundColor: "#e0e7ff" }}
							animate={framer(HEADER_ANIMATION)}
							transition={{ duration: 0.3, delay: 2.1 }}
							className="h-4 rounded absolute top-0 left-0 w-full"
						/>
					</div>
				</div>

				{/* Rows */}
				{rows.map((row, index) => {
					const allowed = rules.allowedCategories.includes(row.category);
					const overMax = row.amount > rules.maxExpensePerCategory[row.category] || false;
					const bgColor = getRowColor(allowed, overMax);

					return (
						<div className="flex justify-between items-start" key={index}>
							<div className="relative flex-1 w-full">
								<motion.div
									initial={{ backgroundColor: "#f3f4f6" }}
									animate={{
										backgroundColor: [
											"#e5e7eb",
											"#f3f4f6",
											"#f3f4f6",
											"#f3f4f6",
											(allowed ? "#bbf7d0" : "#fbcfe8"),
										],
									}}
									transition={framer({ duration: 0.3, delay: 2 + index * 0.1 })}
									className="h-5 rounded top-0 left-0 absolute max-w-[80%] overflow-hidden"
									style={{ width: `${row.widthPercent}%` }}
								>
									<motion.div
										className="absolute top-0 left-0 w-full h-full flex items-center pr-1 text-xxs"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={framer({ duration: 0.3, delay: 2 + index * 0.1 })}
									>
										<span className="truncate text-xxs font-semibold text-gray-700 ml-1">
											{row.productName}
										</span>
									</motion.div>
								</motion.div>
							</div>
							<motion.div
								className={`text-gray-700 text-xs h-5 flex items-center font-semibold pl-3 pr-2 py-0 rounded
									${overMax ? "#fbcfe8" : "#bbf7d0"}`}
								initial={{ backgroundColor: ["#f3f4f6"] }}
								animate={{
									backgroundColor: [
										"#f3f4f6",
										"#e5e7eb",
										"#f3f4f6",
										"#f3f4f6",
										bgColor,
									],
								}}
								transition={framer({ duration: 0.3, delay: 2.1 + index * 0.1 })}
							>
								{row.amount} €
							</motion.div>
						</div>
					);
				})}

				<div className="text-xs flex items-center justify-between">
					<div>
						Remboursés
					</div>
					<div className="text-sm">
						<NumberTicker
							value={rows
								.filter(
									row =>
										rules.allowedCategories.includes(row.category) &&
										row.amount <= (rules.maxExpensePerCategory[row.category] || 0)
								)
								.reduce((acc, row) => acc + row.amount, 0)
							}
							transition={{ duration: 0.5, ease: "easeInOut" }}
							className="inline-block ml-1"
							delay={2.5}
						/>{" €"}
					</div>
				</div>
			</div>

			{/* Footer */}
			{subtext && (
				<div className="flex flex-col items-center justify-center mt-4 w-[150%] -ml-[25%]">
					<IoChevronUp className="text-white" style={{ width: 24, height: 24 }} />
					<p className="text-balance text-sm text-white text-center">
						En fonction des règles de l'entreprise, certains frais peuvent être remboursés ou non.
					</p>
				</div>
			)}
		</motion.div>
	);
}
