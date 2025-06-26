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
import { toast } from "sonner";
import Image from "next/image";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useRouter } from "next/navigation";

export default function SalaryDashboard() {
	const [expenses, setExpenses] = useState([]);
	const [selectedExpense, setSelectedExpense] = useState<any>(null);
	const [open, setOpen] = useState(false);
	const [image, setImage] = useState<string>("/images/placeholder.png");
	const router = useRouter();

	useEffect(() => {
		const fetchExpenses = async () => {
			try {
				const response = await ApiController("expenses", "GET", {
					status: "all"
				});
				setExpenses(response.items || []);
			} catch (error) {
				console.error("Error fetching expenses:", error);
			}
		};

		fetchExpenses();
	}, []);


	async function fetchImage(uuid: string) {
		
		const response = await ApiController(`expenses/${uuid}/image`, "GET");
		if (response && response.image) {
			return response.image;
		}
		return "/images/placeholder.png"; // Fallback if image fetch fails
	}

	useEffect(() => {
		const fetchExpenseImage = async () => {
			if (selectedExpense) {
				const imageUrl = await fetchImage(selectedExpense._id);
				setImage(imageUrl);
			} else {
				setImage("/images/placeholder.png");
			}
		};
		fetchExpenseImage();
	}, [selectedExpense]);

	async function openImage() {
		if (selectedExpense) {
			const imageUrl = await fetchImage(selectedExpense._id);

			// can't open the image in a new tab if it's a data URL
			if (imageUrl.startsWith("data:")) {
				const link = document.createElement("a");
				link.href = imageUrl;
				link.download = `expense_${selectedExpense._id}.png`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		}
	}


	async function handleChangeStatus(expenseId: string, newStatus: string) {
		try {
			const response = await ApiController(`expenses/${expenseId}/status`, "PUT", { status: newStatus });
			if (response.status === "success") {
				setExpenses((prevExpenses) =>
					prevExpenses.map((expense) =>
						expense._id === expenseId ? { ...expense, status: newStatus } : expense
					)
				);
				setSelectedExpense(null);
				setOpen(false);
			} else {
				toast.error("An error occurred while updating the expense status.");
				console.error("Failed to update expense status:", response.message);
			}
		} catch (error) {
			toast.error("An error occurred while updating the expense status.");
			console.error("Error updating expense status:", error);
		}
	}


	const { user } = useUser();	
	return (
		<main className="h-full flex flex-col p-8 lg:p-24 justify-start items-start">
			<h1 className="text-4xl text-indigo-600 mt-8 font-bold mb-8">Notes de frais en attente</h1>
			<div className="w-full overflow-x-auto">
				<table className="min-w-full bg-indigo-200/15 rounded-2xl overflow-hidden">
					<tbody>
						{expenses.length > 0 ? (
							expenses
								.slice()
								.sort((a, b) => {
									// First, sort by status: pending first, then approved, then rejected, then others
									const statusOrder = (status: string) => {
										if (status === "pending") return 0;
										if (status === "approved") return 1;
										if (status === "rejected") return 2;
										return 3;
									};
									const statusDiff = statusOrder(a.status) - statusOrder(b.status);
									if (statusDiff !== 0) return statusDiff;

									// If same status, sort by date descending (recent first)
									const dateA = a.data.date?.value
										? new Date(a.data.date.value.replace(/(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1")).getTime()
										: 0;
									const dateB = b.data.date?.value
										? new Date(b.data.date.value.replace(/(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1")).getTime()
										: 0;
									return dateB - dateA;
								})
								.map((expense) => (
									<tr
										key={expense.id}
										className="border-b text-sm last:border-b-0 transition-colors cursor-pointer hover:bg-indigo-500/25 rounded-2xl"
										onClick={() => {
											router.push(`/dashboard/expenses/${expense._id}`);
										}}
									>
										<td className="py-3 px-4 flex flex-col gap-1">
											<p className="font-medium text-indigo-700">{expense.data.company_name?.value}</p>
											{expense.data.date?.value &&
												new Date(
													expense.data.date.value.replace(/(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1")
												).toLocaleDateString("fr-FR", {
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

			<Drawer open={open} onOpenChange={setOpen}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerDescription>
							{selectedExpense && (
								<>
								<div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-8 ">
									{image && (
										<Image src={image} alt="Reçu" className="mb-4 cursor-pointer rounded-lg h-[500px] w-[600px] object-contain" width={600} height={400} onClick={openImage}/>
									)}
									<div className="flex-1">
										<table className="w-full text-sm text-indigo-800">
											<DrawerTitle className="mb-8 text-xl">Détail de la note de frais</DrawerTitle>
											<tbody className="mt-6">
												<tr>
													<td className="font-semibold pr-4 py-1">Entreprise :</td>
													<td>{selectedExpense.data.company_name?.value}</td>
												</tr>
												<tr>
													<td className="font-semibold pr-4 py-1">Date :</td>
													<td>{selectedExpense.data.date?.value}</td>
												</tr>
												<tr>
													<td className="font-semibold pr-4 py-1">Montant TTC :</td>
													<td>{selectedExpense.data.total_ttc?.value} €</td>
												</tr>
												<tr>
													<td className="font-semibold pr-4 py-1">Statut :</td>
													<td>{selectedExpense.status}</td>
												</tr>
											</tbody>
										</table>
										{selectedExpense.data.items && selectedExpense.data.items.length > 0 && (
											<table className="mb-4 w-full rounded-xl border border-indigo-100 mt-8">
												<thead>
													<tr>
														<th className="text-left px-2 py-1 text-indigo-700 font-semibold">#</th>
														<th className="text-left px-2 py-1 text-indigo-700 font-semibold">Description</th>
														<th className="text-left px-2 py-1 text-indigo-700 font-semibold">Quantité</th>
														<th className="text-left px-2 py-1 text-indigo-700 font-semibold">Montant</th>
													</tr>
												</thead>
												<tbody>
													{selectedExpense.data.items.map((item: any, index: number) => (
														<tr key={index}>
															<td className="px-2 py-1 text-indigo-800 font-medium">{index + 1}</td>
															<td className="px-2 py-1 text-neutral-700">{item.name?.value}</td>
															<td className="px-2 py-1 text-neutral-700">{item.quantity?.value || 1}

															</td>
															<td className="px-2 py-1 text-neutral-700">{parseFloat(item.total_price?.value).toFixed(2)} €</td>
														</tr>
													))}
												</tbody>
											</table>
										)}
										<div className="flex items-center gap-1">
											<span className="text-neutral-600 text-sm">Soumis par :</span>
											<span className="text-indigo-700 font-semibold">{selectedExpense.user.firstName} {selectedExpense.user.lastName}</span>
											<span className="text-neutral-500 text-sm">({selectedExpense.user.email})</span>
											<span className="text-neutral-500 text-sm">le {new Date(selectedExpense.createdAt).toLocaleDateString("fr-FR", {
												day: "numeric",
												month: "long",
												year: "numeric",
											})}</span>
											<span className="text-neutral-500 text-sm">à {new Date(selectedExpense.createdAt).toLocaleTimeString("fr-FR", {
												hour: "2-digit",
												minute: "2-digit",
											})}</span>

										</div>
										<div className="flex items-center gap-4 mt-6">
											<span
												className="bg-indigo-500/10 px-4 py-2 text-indigo-500 rounded-lg cursor-pointer hover:bg-indigo-500/20"
												onClick={() => handleChangeStatus(selectedExpense._id, "approved")}
											>
												Accepter
											</span>
											<span
												className="bg-red-500/10 px-4 py-2 text-red-500 rounded-lg cursor-pointer hover:bg-red-500/20"
												onClick={() => handleChangeStatus(selectedExpense._id, "rejected")}
											>
												Rejeter 
											</span>
										</div>
									</div>
									
									
								</div>
								
								</>
							)}
						</DrawerDescription>
					</DrawerHeader>
					<DrawerFooter>
						<DrawerClose asChild>
							<button
								className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
								onClick={() => {
									setSelectedExpense(null);
									setImage("/images/placeholder.png");
								}}
							>
								Fermer
							</button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</main>
	);
}