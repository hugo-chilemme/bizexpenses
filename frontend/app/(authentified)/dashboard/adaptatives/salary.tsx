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
import { useRouter } from "next/navigation";

export default function SalaryDashboard() {

	const router = useRouter();
	const [expenses, setExpenses] = useState([]);

	useEffect(() => {
		const fetchExpenses = async () => {
			try {
				const response = await ApiController("expenses", "GET");
				setExpenses(response.items || []);
			} catch (error) {
				console.error("Error fetching expenses:", error);
			}
		};

		fetchExpenses();
	}, []);


	const { user } = useUser();	
	return (
		<main className="h-full flex flex-col p-8 lg:p-24 justify-start items-start">
			<h1 className="text-4xl text-indigo-600 mt-8 font-bold">Bonjour {user.firstName} 👋</h1>
			{/* <div className="text-neutral-800 text-sm inline-flex w-auto gap-6 items-center mt-12 bg-indigo-400/5 rounded-3xl p-6 pr-12">
				<AnimatedLogo width={5}/>
				<div className="flex flex-col items-start">
					<TypeWriter text={`Bonjour ${user.firstName}, pensez à soumettre vos notes de frais avant le 30, je vous transmet un lien pour le faire.`}>
						<motion.div
							initial={{ opacity: 0, x: -25 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: 0.5 }}
							className="w-full mt-2"
						>
							<Link href="/dashboard/expenses/new" className="text-indigo-700 font-semibold hover:underline">
								Envoyer mes notes de frais <LuChevronRight className="inline-block w-4 h-4 ml-1" />
							</Link>
						</motion.div>
					</TypeWriter>

					
				</div>
			</div> */}
			<div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full mt-12">
				<div className="flex-1 flex flex-col gap-4 max-w-md bg-indigo-100/50 p-6 rounded-2xl">
					<FaRegBuilding className="w-8 h-8 text-indigo-600" />
					<h2 className="text-lg text-indigo-600 font-semibold">{user.entreprise.name}</h2>
					<p className="text-neutral-700 text-balance">Contactez votre service des ressources humaines pour toutes questions.</p>
				</div>
				<div className="flex-1 flex flex-col gap-4 max-w-md bg-indigo-100/50 p-6 rounded-2xl">
					<MdOutlineFileUpload className="w-8 h-8 text-indigo-600" />
					{user.entreprise.rules?.submission_deadline - new Date().getDate() > 0 ? (
						<h2 className="text-lg text-indigo-600 font-semibold">
							Il vous reste {user.entreprise.rules?.submission_deadline - new Date().getDate()} jours
						</h2>
					) : (
						<h2 className="text-lg text-indigo-600 font-semibold">
							Les notes de frais seront envoyées le mois suivant
						</h2>
					)}
					<p className="text-neutral-700 text-balance">Passez ce délai, vos notes de frais seront envoyées le mois suivant.</p>
				</div>
				<div className="flex-1 flex flex-col w-full gap-4 max-w-md bg-indigo-100/50 p-6 rounded-2xl">
					<TfiTicket className="w-8 h-8 text-indigo-600" />
					<h2 className="text-lg text-indigo-600 font-semibold">Soumettez vos notes de frais</h2>
					<Link href="/dashboard/expenses/new" className="text-white p-2 rounded-lg flex items-center justify-center gap-2 bg-indigo-500 text-center font-semibold hover:bg-indigo-600 transition-colors">
						Envoyer mes notes de frais <LuChevronRight className="inline-block w-4 h-4" />
					</Link>
				</div>
			</div>

			<div className="mt-12 w-full">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-lg text-indigo-600 font-semibold mb-4">Vos dernières notes de frais</h2>
					<Link href="/dashboard/expenses" className="flex items-center font-medium justify-center gap-2 text-center text-indigo-600 hover:underline">
						Voir toutes les notes de frais <LuChevronRight className="inline-block w-4 h-4" />
					</Link>
				</div>
				<div className="w-full overflow-x-auto">
					<table className="min-w-full bg-indigo-200/15 rounded-2xl overflow-hidden">
		
						<tbody>
							{expenses.length > 0 ? (
								expenses
									.slice()
									.sort((a, b) => {
										const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
										const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
										return dateB - dateA; // Descending: recent first
									})
									.map((expense) => (
										<tr key={expense.id} className="border-b text-sm last:border-b-0 transition-colors hover:bg-indigo-200/50 cursor-pointer" onClick={() => router.push(`/dashboard/expenses/${expense._id}`)}>
											<td className="py-3 px-4 flex flex-col gap-1">
												<p className="font-medium text-indigo-700">{expense.data.company_name?.value}</p>
												{expense.createdAt &&
													new Date(expense.createdAt).toLocaleDateString("fr-FR", {
														day: "numeric",
														month: "long",
														year: "numeric",
													})}
											</td>
										
											<td className="py-3 px-4 text-neutral-800">
												{expense.data.total_ttc?.value ? parseFloat(expense.data.total_ttc.value).toFixed(2) : "0.00"} €
											</td>
											<td className="py-3 px-4 text-neutral-500">
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

													{expense.status === "processed" && (
														<span className="bg-blue-100/50 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
															<svg className="w-3 h-3 fill-blue-400" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" /></svg>
															Brouillon
														</span>
													)}
													{!expense.status && (
														<span className="bg-gray-100/50 text-gray-500 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
															<svg className="w-3 h-3 fill-gray-400" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" /></svg>
															Statut inconnu
														</span>
													)}
												</span>
											</td>
										</tr>
									))
							) : (
								<tr>
									<td className="py-4 px-4 text-neutral-500" colSpan={5}>
										Aucune note de frais soumise récemment. Pour soumettre une nouvelle note de frais, cliquez sur le bouton dans le bandeau latéral.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</main>
	)
}