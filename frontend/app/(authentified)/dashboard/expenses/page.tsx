"use client";
import AnimatedLogo from "@/components/AnimatedLogo";
import TypeWriter from "@/components/animations/TypeWriter";
import { motion } from "framer-motion";	
import Link from "next/link";
import { LuChevronRight } from "react-icons/lu";
import { useUser } from "@/components/context/User";
import ApiController from "@/lib/api-controller";
import { useEffect, useState } from "react";
import { FaRegBuilding } from "react-icons/fa";
import { MdOutlineFileUpload } from "react-icons/md";
import { TfiTicket } from "react-icons/tfi";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SalaryDashboard() {

	const router = useRouter();
	const [expenses, setExpenses] = useState([]);

	useEffect(() => {
		const fetchExpenses = async () => {
			try {
				const response = await ApiController("expenses", "GET", {
					image: true,
				});
				setExpenses(response.items || []);


				await Promise.all(
					(response.items || []).map(async (item) => {
						const id = item._id;
						const imgResponse = await ApiController(`expenses/${id}/image`, "GET");
						if (!imgResponse || !imgResponse.image) {
							console.warn(`No image found for expense with ID: ${id}`);
							return;
						}
						setExpenses((prevExpenses) =>
							prevExpenses.map((expense) =>
								expense._id === id ? { ...expense, data: { ...expense.data, image: imgResponse.image } } : expense
							)
						);
					})
				);


			} catch (error) {
				console.error("Error fetching expenses:", error);
			}
		};

		fetchExpenses();
	}, []);


	const { user } = useUser();	
	return (
		<main className="h-full flex flex-col p-8 lg:p-24 justify-start items-start">
			<h1 className="text-4xl text-indigo-600 mt-8 font-bold">Vos notes de frais</h1>
	

			<div className="mt-12 w-full">
				<div className="w-full overflow-x-auto">
					<div className="min-w-full">
						{expenses.length > 0 ? (
							Object.entries(
								expenses
									.slice()
									.sort((a, b) => {
										const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
										const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
										return dateB - dateA;
									})
									.reduce((acc, expense) => {
										const dateStr = expense.data.date?.value;
										if (!dateStr) return acc;
										const [year, month, day] = dateStr.split("-");
										const key = `${year}-${month}`; // e.g. 2025-06
										if (!acc[key]) acc[key] = [];
										acc[key].push(expense);
										return acc;
									}, {} as Record<string, typeof expenses>)
							)
								.sort(([a], [b]) => b.localeCompare(a)) // Descending by year-month
								.map(([key, group]) => {
									const [year, month] = key.split("-");
									const date = new Date(Number(year), Number(month) - 1);
									const monthLabel = date.toLocaleString("fr-FR", { month: "long", year: "numeric" });
									return (
										<div key={key} className="mb-8">
											<h2 className="text-lg text-indigo-600 font-semibold mb-4 capitalize">
												{monthLabel}
											</h2>
											<div className="bg-indigo-200/15 rounded-2xl p-4">
											{group.map((expense) => (
												<div key={expense.id} className="flex flex-col md:flex-row items-start md:items-center py-3 px-4 gap-2 md:gap-0 hover:bg-indigo-200/50 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/expenses/${expense._id}`)}>
													<div className="flex-1 flex gap-4 items-center">
														<div>
															{ expense.data.image && (
																<Image 
																	src={expense.data.image}
																	alt="Expense receipt"
																	width={100}
																	height={100}
																	className="w-16 h-16 object-cover rounded-lg"
																	onClick={() => window.open(expense.data.image, "_blank")}
																/>
															)}

														</div>
														<div className="flex flex-col gap-2">
															<p className="font-medium text-indigo-700">{expense.data.company_name?.value}</p>
															{expense.data.date?.value &&
																new Date(
																	expense.data.date.value.replace(/(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1")
																).toLocaleDateString("fr-FR", {
																	day: "numeric",
																	month: "long",
																	year: "numeric",
																})}

														</div>
													</div>
													<div className="flex flex-1 gap-2 items-center justify-between w-full">
														<div className="w-32 text-neutral-800">
															{expense.data.total_ttc?.value ? parseFloat(expense.data.total_ttc.value).toFixed(2) : "0.00"} €
														</div>
													<div className="w-48 text-neutral-500">
															<span className="inline-flex items-center gap-1">
																{expense.status === "pending" && (
																	<span className="bg-yellow-100/50 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
																		<svg className="w-3 h-3 fill-yellow-400" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" /></svg>
																		En attente
																	</span>
																)}
																{expense.status === "approved" && (
																	<span className="bg-green-100/50 text-green-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
																		<svg className="w-3 h-3 fill-green-400" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" /></svg>
																		Approuvé
																	</span>
																)}
																{expense.status === "rejected" && (
																	<span className="bg-red-100/50 text-red-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
																		<svg className="w-3 h-3 fill-red-400" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" /></svg>
																		Rejeté
																	</span>
																)}
																{!expense.status && (
																	<span className="bg-gray-100/50 text-gray-500 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
																		<svg className="w-3 h-3 fill-gray-400" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" /></svg>
																		Statut inconnu
																	</span>
																)}
															</span>
														</div>
													</div>
												</div>
											))}
											</div>
										</div>
									);
								})
						) : (
							<div className="py-4 px-4 text-neutral-500">
								Aucune note de frais soumise récemment. Pour soumettre une nouvelle note de frais, cliquez sur le bouton dans le bandeau latéral.
							</div>
						)}

					</div>
				</div>
			</div>
		</main>
	)
}