"use client";
import { useState, useRef } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { IoCameraOutline } from "react-icons/io5";
import { FaCircleCheck } from "react-icons/fa6";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/components/context/User";
import { cn } from "@/lib/utils";
import { Button} from "@/components/ui/button";
import ApiController from "@/lib/api-controller";
import { IoIosInformationCircle } from "react-icons/io";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/types/categories";
import { GoChevronLeft } from "react-icons/go";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/*
example of expenseData data;
  "company_name": { "value": "Hiboutik", "error": false },
  "company_address": { "value": "30 place du Centre - 01214 MAYTILLe", "error": false },
  "date": { "value": "2020-02-03", "error": false },
  "transaction_number": { "value": "", "error": true },
  "items": [
    {
      "name": { "value": "Croisine", "error": false },
      "quantity": { "value": 1, "error": false },
      "unit_price": { "value": 52.00, "error": false },
      "total_price": { "value": 52.00, "error": false },
      "vat_rate": { "value": "20%", "error": false },
      "vat_amount": { "value": 8.67, "error": false },
      "category": { "value": "Autres", "error": false }
    }
  ],
  "total_ht": { "value": "", "error": true },
  "total_vat": { "value": 8.67, "error": false },
  "total_ttc": { "value": 52.00, "error": false },
  "payment_method": { "value": "", "error": true }
}



*/
const isMobile =
	typeof window !== "undefined" && /Mobi|Android/i.test(navigator.userAgent);

const FIELDS = [
	{ key: "company_name", label: "Nom de l'entreprise", type: "text", placeholder: "Nom de l'entreprise" },
	{ key: "date", label: "Date", type: "date", placeholder: "Date" },
	{ key: "total_ttc", label: "Total TTC", type: "text", placeholder: "Non disponible" },
	{ key: "total_vat", label: "Total TVA", type: "text", placeholder: "Non disponible" },
	{ key: "payment_method", label: "Moyen de paiement", type: "text", placeholder: "Non disponible" },
];

export default function Page() {
	const router = useRouter();
	const [step, setStep] = useState<"upload-form" | "upload" | "processing" | "form">("upload-form");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [expense, setExpense] = useState<any>(null);
	const [expenseData, setExpenseData] = useState<any>({});
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const { user } = useUser();
	const [loading, setLoading] = useState<boolean>(false);

	const [showPreview, setShowPreview] = useState<boolean>(false);

	const [companyName, setCompanyName] = useState<string>("");
	const [companyAddress, setCompanyAddress] = useState<string>("");
	const [date, setDate] = useState<string>("");
	const [totalTTC, setTotalTTC] = useState<string>("");
	const [totalVAT, setTotalVAT] = useState<string>("");
	const [paymentMethod, setPaymentMethod] = useState<string>("");


	const reset = async () => {
		if (expense?.id)
		{
			ApiController(`expenses/${expense.id}`, 'DELETE');
		}


		setImagePreview(null);
		setFile(null);
		setStep("upload-form");
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (!selectedFile) return;
		handleUploadFile(selectedFile);
	};

	const handleUploadFile = async (selectedFile: File) => {
		if (!selectedFile.type.match(/image|pdf/)) {
			toast.error("Veuillez téléverser un fichier image (jpg, jpeg, png) ou PDF.");
			reset();
			return;
		}
		const blobUrl = URL.createObjectURL(selectedFile);
		const base64 = await new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				if (typeof reader.result === "string") {
					resolve(reader.result);
				} else {
					reject(new Error("Failed to read file"));
				}
			};
			reader.readAsDataURL(selectedFile);
		});


		selectedFile.blobUrl = blobUrl;
		selectedFile.base64 = base64;

		setImagePreview(blobUrl);
		setFile(selectedFile);
		setStep("upload");


		const response: any = await ApiController('expenses/new', 'POST', {
			base64: base64
		});

		if (response.status === "error") {
			toast.error(response.error || "Une erreur est survenue lors de l'envoi de la note de frais.");
			reset();
			return;
		}

		setStep("file-check");

		await new Promise((resolve) => setTimeout(resolve, 2000));

		setStep("processing");

		const id = response.id;
		history.pushState({}, '', `/dashboard/expenses/${id}`);

		const interval = setInterval(async () => {
			const statusResponse: any = await ApiController(`expenses/${id}/status`, 'GET');
			if (statusResponse.status === "error") {
				toast.error(statusResponse.error || "Une erreur est survenue lors de la récupération du statut.");
				clearInterval(interval);
				reset();
				return;
			}

			if (statusResponse.data.status === "error") {
				toast.error("Nous n'avons pas pu traiter votre note de frais. Veuillez vérifier le fichier et réessayer.");
				clearInterval(interval);
				setStep("upload-form");
				history.pushState({}, '', '/dashboard/expenses/new');
				reset();
				return;
			}

			if (statusResponse.data.status !== "processed") {
				return;
			}


			clearInterval(interval);

			setStep("preform");

			setTimeout(async () => {
				setStep("form");
				setExpense(statusResponse.data);
				setExpenseData(statusResponse.data.data);
			}, 250);


		}, 2000);


	};

	const handleCameraClick = () => {
		const cameraInput = document.createElement("input");
		cameraInput.type = "file";
		cameraInput.accept = "image/*";
		(cameraInput as any).capture = "environment";
		cameraInput.onchange = (e: Event) => {
			handleFileChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
			setTimeout(() => cameraInput.remove(), 1000);
		};
		cameraInput.style.display = "none";
		document.body.appendChild(cameraInput);
		cameraInput.click();
	};


	// detecter le changement de HT et TVA et recalculer le TTC
	const recalculateTTC = () => {
		setExpenseData((prev: any) => {
			const newTotalHT = prev.total_ht.value;
			const newTotalTVA = prev.total_tva.value;
			const newTotalTTC = parseFloat(newTotalHT) + parseFloat(newTotalTVA);
			return {
				...prev,
				total_ttc: { ...prev.total_ttc, value: newTotalTTC, error: false },
			};
		});
	};

	const handleSubmit = async () => {
		if (!expenseData) return;
		setLoading(true);
		const response = await ApiController(`expenses/${expense.id}`, 'POST', {
			expense: expenseData,
		});

		await new Promise((r) => setTimeout(r, 2000));

		setLoading(false);
		if (response.status === "error") {
			toast.error(response.error || "Une erreur est survenue lors de la création de la note de frais.");
			return;
		}

		expense.status = "pending";
		setExpenseData((prev: any) => ({
			...prev,
			status: "pending",
		}));

		router.push(`/dashboard/expenses/${expense.id}`);

		toast.success("La note de frais a été créée avec succès.");
	};

	return (
		<main className="h-full w-full flex flex-col p-8 lg:p-24 justify-start items-start">

			
			{step === "upload-form" && (
				<section className="w-full flex flex-col items-start gap-8">
					<div
						className="flex gap-4 items-center font-semibold group cursor-pointer"
						onClick={() => router.push('/dashboard')}
					>
						<GoChevronLeft className="w-6 h-6 cursor-pointer" />
						<span className="group-hover:underline">Revenir en arrière</span>
					</div>

					<h1 className="text-3xl text-indigo-600 font-bold mt-8">Nouvelle note de frais</h1>
					<div className="flex flex-col lg:flex-row gap-4 w-full">
						<button
							className="flex flex-col items-center justify-center gap-2 bg-indigo-100 border border-indigo-300 rounded-2xl hover:bg-indigo-200 transition cursor-pointer w-full h-96"
							onClick={() => fileInputRef.current?.click()}
							onDragOver={e => {
								e.preventDefault();
								e.currentTarget.classList.add("bg-indigo-200");
							}}
							onDragLeave={e => {
								e.preventDefault();
								e.currentTarget.classList.remove("bg-indigo-200");
							}}
							onDrop={e => {
								e.preventDefault();
								handleFileChange({ target: { files: e.dataTransfer.files } } as any);
								e.currentTarget.classList.remove("bg-indigo-200");
							}}
						>
							<AiOutlineCloudUpload className="w-8 h-8 text-indigo-600" />
							<span className="font-medium mt-6 text-neutral-700 text-sm">
								Pour commencer, téléversez votre note de frais (ou glissez-la ici)
							</span>
							<input
								ref={fileInputRef}
								type="file"
								accept=".jpg, .jpeg, .png, .pdf"
								onChange={handleFileChange}
								className="hidden"
							/>
						</button>
						{isMobile && (
							<button
								className="flex flex-col items-center justify-center gap-2 p-12 bg-indigo-100 border border-indigo-300 rounded-2xl hover:bg-indigo-200 transition cursor-pointer w-full"
								onClick={handleCameraClick}
							>
								<IoCameraOutline className="w-8 h-8 text-indigo-600" />
								<span className="font-medium">Prendre une photo</span>
							</button>
						)}
					</div>
				</section>
			)}

			{step !== "upload-form" && (
				<section className="flex items-start gap-8 justify-between w-full">
					<div className="flex-1">
						{step !== "form" ? (
							<motion.div
								initial={{ opacity: 1, y: 0, height: "auto" }}
								animate={
									step === "form"
										? { opacity: 0, y: 20, height: 0, margin: 0, padding: 0 }
										: { opacity: 1, y: 0, height: "auto" }
								}
								transition={{
									duration: 0.4,
									staggerChildren: 0.12, // delay between children
								}}
								style={{ overflow: "hidden" }}
								className=""
							>
								{/* Skeleton blocks matching the actual form layout */}
								<div className="w-full flex flex-col gap-6">
									{/* Informations du commerçant */}
									<motion.div
										className="border gap-4 bg-white rounded-xl flex flex-col  justify-center p-8"
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.05, duration: 0.4 }}
									>
										<div className="h-8 w-64 bg-neutral-200 rounded-lg mb-2 animate-pulse" />
										<div className="flex gap-4 w-full">
											<motion.div
												className="flex-1"
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.1, duration: 0.4 }}
											>
												<div className="h-3 w-32 bg-neutral-200 rounded mb-2 animate-pulse" />
												<div className="h-8 w-full bg-neutral-100 rounded animate-pulse delay-500" />
											</motion.div>
											<motion.div
												className="flex-1"
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.15, duration: 0.4 }}
											>
												<div className="h-3 w-24 bg-neutral-200 rounded mb-2 animate-pulse" />
												<div className="h-8 w-full bg-neutral-100 rounded animate-pulse delay-500" />
											</motion.div>
										</div>
									</motion.div>
									{/* Informations de la note de frais */}
									<motion.div
										className="border gap-4 bg-white rounded-xl flex flex-col  justify-center p-8"
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.2, duration: 0.4 }}
									>
										<div className="h-8 mt-4 w-64 bg-neutral-200 rounded-lg mb-2 animate-pulse" />
										<div className="flex gap-4 w-full">
											<motion.div
												className="flex-1"
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.25, duration: 0.4 }}
											>
												<div className="h-3 w-20 bg-neutral-200 rounded mb-2 animate-pulse" />
												<div className="h-8 w-full bg-neutral-100 rounded animate-pulse delay-500" />
											</motion.div>
											<motion.div
												className="flex-1"
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.3, duration: 0.4 }}
											>
												<div className="h-3 w-28 bg-neutral-200 rounded mb-2 animate-pulse" />
												<div className="h-8 w-full bg-neutral-100 rounded animate-pulse delay-500" />
											</motion.div>
										</div>
										<div className="flex gap-4 w-full">
											<motion.div
												className="flex-1"
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.35, duration: 0.4 }}
											>
												<div className="h-3 w-20 bg-neutral-200 rounded mb-2 animate-pulse" />
												<div className="h-8 w-full bg-neutral-100 rounded animate-pulse delay-500" />
											</motion.div>
											<motion.div
												className="flex-1"
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.4, duration: 0.4 }}
											>
												<div className="h-3 w-20 bg-neutral-200 rounded mb-2 animate-pulse" />
												<div className="h-8 w-full bg-neutral-100 rounded animate-pulse delay-500" />
											</motion.div>
											<motion.div
												className="flex-1"
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.45, duration: 0.4 }}
											>
												<div className="h-3 w-20 bg-neutral-200 rounded mb-2 animate-pulse" />
												<div className="h-8 w-full bg-neutral-100 rounded animate-pulse delay-500" />
											</motion.div>
										</div>
									</motion.div>
									{/* Détails de la note de frais */}
									<motion.div
										className="border gap-4 bg-white rounded-xl flex flex-col  justify-center p-8"
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.5, duration: 0.4 }}
									>
										<div className="h-8 mt-4 w-64 bg-neutral-200 rounded-lg mb-2 animate-pulse" />
										{/* Simulate 1 item row */}
										<div className="flex gap-4 w-full">
											<motion.div
												className="flex-1"
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.55, duration: 0.4 }}
											>
												<div className="h-3 w-16 bg-neutral-200 rounded mb-2 animate-pulse" />
												<div className="h-8 w-full bg-neutral-100 rounded animate-pulse delay-500" />
											</motion.div>
											<motion.div
												className="flex-1"
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.6, duration: 0.4 }}
											>
												<div className="h-3 w-16 bg-neutral-200 rounded mb-2 animate-pulse" />
												<div className="h-8 w-full bg-neutral-100 rounded animate-pulse delay-500" />
											</motion.div>
											<motion.div
												className="flex-1"
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.65, duration: 0.4 }}
											>
												<div className="h-3 w-16 bg-neutral-200 rounded mb-2 animate-pulse" />
												<div className="h-8 w-full bg-neutral-100 rounded animate-pulse delay-500" />
											</motion.div>
											<motion.div
												className="flex-1"
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.7, duration: 0.4 }}
											>
												<div className="h-3 w-20 bg-neutral-200 rounded mb-2 animate-pulse" />
												<div className="h-8 w-full bg-neutral-100 rounded animate-pulse delay-500" />
											</motion.div>
										</div>
									</motion.div>
								</div>
							</motion.div>
						) : (
							<div className="flex flex-col gap-6">
								<div className="flex flex-col gap-4 bg-white border rounded-xl p-4 shadow-sm">
									<h3 className="font-semibold text-sm">Informations du commerçant</h3>
									<div className="flex justify-between items-center gap-4">
										<div className="flex flex-col flex-1 gap-2">
											<label className="text-xs">Nom de l&apos;entreprise</label>
											<Input
												type="text"
												onChange={(e) =>
													setExpenseData((prev: any) => ({
														...prev,
														company_name: { ...prev.company_name, value: e.target.value, error: false }
													}))
												}
												placeholder="Nom de l'entreprise"
												value={expenseData.company_name?.value || ""}
												className="border rounded-lg p-2 text-sm w-full"
											/>
										</div>
										<div className="flex flex-col flex-1  gap-2">
											<label className="text-xs">Adresse</label>
											<Input
												type="text"
												onChange={(e) =>
													setExpenseData((prev: any) => ({
														...prev,
														company_address: { ...prev.company_address, value: e.target.value, error: false }
													}))
												}
												placeholder="Adresse de l'entreprise"
												value={expenseData.company_address?.value || ""}
												className="border rounded-lg p-2 text-sm w-full"
											/>
										</div>

									</div>

								</div>
								<div className="flex flex-col gap-4 bg-white border rounded-xl p-4 shadow-sm">
									<h3 className="font-semibold text-sm">Informations de la note de frais</h3>
									<div className="flex justify-between items-center gap-4">
										<div className="flex flex-col flex-1 gap-2">
											<label className="text-xs">Date</label>
											<Input
												type="date"
												onChange={(e) => {
													const selectedDate = new Date(e.target.value);
													const now = new Date();
													const sixMonthsAgo = new Date();
													sixMonthsAgo.setMonth(now.getMonth() - 6);

													if (selectedDate < sixMonthsAgo) {
														setExpenseData((prev: any) => ({
															...prev,
															date: { ...prev.date, value: e.target.value, error: true }
														}));
														toast.error("La date ne peut pas être antérieure à 6 mois.");
													} else {
														setExpenseData((prev: any) => ({
															...prev,
															date: { ...prev.date, value: e.target.value, error: false }
														}));
													}
												}}
												placeholder="Date de la note de frais"
												value={expenseData.date?.value || ""}
												className="border rounded-lg p-2 text-sm w-full"
											/>
											{expenseData.date?.error && (
												<span className="text-xs text-red-600">La date ne peut pas être antérieure à 6 mois.</span>
											)}
										</div>
										<div className="flex flex-col flex-1 gap-2">
											<label className="text-xs">Moyen de paiement</label>
											<Select
												value={expenseData.payment_method?.value || ""}
												onValueChange={(value) =>
													setExpenseData((prev: any) => ({
														...prev,
														payment_method: { ...prev.payment_method, value, error: false }
													}))
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Sélectionner" />
												</SelectTrigger>
												<SelectContent>
													<SelectGroup>
														<SelectItem value="Titre Restaurant">Titre restaurant</SelectItem>
														<SelectItem value="Carte Bancaire">Carte bancaire</SelectItem>
														<SelectItem value="Espèce">Par espèce</SelectItem>
													</SelectGroup>
												</SelectContent>
											</Select>
										</div>
									</div>
									<div className="flex justify-between items-center gap-4">
										<div className="flex flex-col flex-1 gap-2">
											<label className="text-xs">Total HT</label>
											<Input
												type="text"
												onChange={(e) => {
													setExpenseData((prev: any) => ({
														...prev,
														total_ht: { ...prev.total_ht, value: e.target.value, error: false }
													}));
													recalculateTTC();
												}}
												placeholder="Total HT"
												value={expenseData.total_ht?.value?.toFixed ? expenseData.total_ht.value.toFixed(2) : expenseData.total_ht?.value || ""}
												className="border rounded-lg p-2 text-sm w-full"
											/>
										</div>
										<div className="flex flex-col flex-1 gap-2">
											<label className="text-xs">Total TVA</label>
											<Input
												type="text"
												onChange={(e) => {
													setExpenseData((prev: any) => ({
														...prev,
														total_tva: { ...prev.total_tva, value: e.target.value, error: false }
													}));
													recalculateTTC();
												}}
												placeholder="Total TVA"
												value={expenseData.total_tva?.value?.toFixed ? expenseData.total_tva.value.toFixed(2) : expenseData.total_tva?.value || ""}
												className="border rounded-lg p-2 text-sm w-full"
											/>
										</div>
										<div className="flex flex-col flex-1 gap-2">
											<label className="text-xs">Total TTC</label>
											<Input
												type="text"
												disabled
												placeholder="Total TTC"
												value={
													(expenseData.total_ht?.value && expenseData.total_tva?.value)
														? (parseFloat(expenseData.total_ht.value) + parseFloat(expenseData.total_tva.value)).toFixed(2) + " €"
														: ""
												}
												className="border rounded-lg p-2 text-sm w-full bg-neutral-200 text-black cursor-not-allowed"
											/>
										</div>
									</div>
								</div>
								<div className="flex flex-col gap-4 bg-white border rounded-xl p-4 shadow-sm">
									<h3 className="font-semibold text-sm">Détails de la note de frais</h3>
									{expenseData.items && expenseData.items.length > 0 ? (
										expenseData.items.map((item: any, index: number) => (
											<div key={index} className="flex justify-between items-center gap-4">
												<div className="flex flex-col flex-1 gap-2">
													<label className="text-xs">Nom</label>
													<Input
														type="text"
														onChange={(e) =>
															setExpenseData((prev: any) => {
																const newItems = [...prev.items];
																newItems[index] = {
																	...newItems[index],
																	name: { ...newItems[index].name, value: e.target.value, error: false }
																};
																return { ...prev, items: newItems };
															})
														}
														placeholder="Nom de l'article"
														value={item.name?.value || ""}
														className="border rounded-lg p-2 text-sm w-full"
													/>
												</div>
												<div className="flex flex-col flex-1 gap-2">
													<label className="text-xs">Quantité</label>
													<Input
														type="number"
														onChange={(e) =>
															setExpenseData((prev: any) => {
																const newItems = [...prev.items];
																newItems[index] = {
																	...newItems[index],
																	quantity: { ...newItems[index].quantity, value: e.target.value, error: false }
																};
																return { ...prev, items: newItems };
															})
														}
														placeholder="Quantité"
														value={item.quantity?.value || ""}
														className="border rounded-lg p-2 text-sm w-full"
													/>
												</div>
												<div className="flex flex-col flex-1 gap-2">
													<label className="text-xs">Total</label>
													<Input
														type="number"
														onChange={(e) =>
															setExpenseData((prev: any) => {
																const newItems = [...prev.items];
																newItems[index] = {
																	...newItems[index],
																	total_price: { ...newItems[index].total_price, value: e.target.value, error: false }
																};
																return { ...prev, items: newItems };
															})
														}
														placeholder="Total"
														value={item.total_price?.value || ""}
														className="border rounded-lg p-2 text-sm w-full"
													/>
												</div>
												
												<div className="flex flex-col flex-1 gap-2">
													<label className="text-xs">Catégorie</label>
													<Select
														value={item.category?.value || ""}
														onValueChange={(value) =>
															setExpenseData((prev: any) => {
																const newItems = [...prev.items];
																newItems[index] = {
																	...newItems[index],
																	category: { ...newItems[index].category, value, error: false }
																};
																return { ...prev, items: newItems };
															})
														}
													>
														<SelectTrigger>
															<SelectValue placeholder="Sélectionner" />
														</SelectTrigger>
														<SelectContent>
															<SelectGroup>
																<SelectItem value="Restauration">Restauration</SelectItem>
																<SelectItem value="Transport">Transport</SelectItem>
																<SelectItem value="Hébergement">Hébergement</SelectItem>
																<SelectItem value="Autres">Autres</SelectItem>
															</SelectGroup>
														</SelectContent>
													</Select>
												</div>
											</div>
										))
									) : (
										<p className="text-neutral-500 text-sm">Aucun détail de note de frais disponible.</p>
									)}
								</div>
							</div>
						)}



					</div>
					<div className="w-1/3 pt-0 flex flex-col gap-4">
						{ step !== "form" && (
							<>
							<div className="bg-white shadow-sm rounded-xl border flex flex-col gap-4 py-4">
								<div className="flex items-center gap-4 px-6">
									<div className="w-6 flex items-center justify-center">
										{ step === "upload" ? (
											<Loader2 className="text-2xl animate-spin text-indigo-600" />	
										) : (
											<FaCircleCheck className="text-lg text-indigo-600" />
										)}
									</div>
									<div className="flex flex-col gap-1">
										<p className="text-sm text-indigo-600 font-semibold">Importation de la note de frais</p>
										<motion.p
											className="text-xs text-neutral-600"
											initial={{ opacity: 1, height: "auto" }}
											animate={step === "upload" ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
											transition={{ duration: 0.3 }}
										>
											Cela peut prendre quelques secondes.
										</motion.p>
									</div>
								</div>
								{/* Nouveau bloc : Contrôle du fichier */}
								<div className={cn("flex items-center gap-4 px-6", {
									"opacity-50": step !== "file-check" && step !== "processing" && step !== "preform",
								})}>
									<div className="w-6 flex items-center justify-center">
										{ step === "upload" ? (
											<Loader2 className="text-2xl text-neutral-200" />
										) : step === "file-check" ? (
											<Loader2 className="text-2xl animate-spin text-indigo-600" />
										) : (
											<FaCircleCheck className="text-lg text-indigo-600" />
										)}
									</div>
									<div className="flex items-center justify-between gap-1 w-full">
										<div>
											<p className="text-sm text-indigo-600 font-semibold w-full">
												<span>Détection des fausses notes de frais</span>
											</p>
											{/* Animation conditionnelle pour le texte */}
											<motion.p
												className="text-xs text-neutral-600"
												initial={{ opacity: 1, height: "auto" }}
												animate={step === "file-check"
													? { opacity: 1, height: "auto", y: 0 }
													: { opacity: 0, height: 0, y: 20 }
												}
												exit={{ opacity: 0, height: 0, y: 20 }}
												transition={{ duration: 0.3 }}
											>
												Nous vérifions l&apos;authenticité de votre note de frais.
											</motion.p>
										</div>

										<span className="bg-red-500/10 font-semibold text-red-700 uppercase px-3 py-1 rounded text-xs ">Bêta</span>
									</div>
								</div>
								<div className={cn("flex items-center gap-4 px-6", {
									"opacity-50": step !== "processing" && step !== "preform",
								})}>
									<div className="w-6 flex items-center justify-center">
										{ step === "upload" || step === "file-check" ? (
											<Loader2 className="text-2xl text-neutral-200" />
										) : step === "processing" ? (
											<Loader2 className="text-2xl animate-spin text-indigo-600" />
										) : (
											<FaCircleCheck className="text-lg text-indigo-600" />
										)}
									</div>
									<div className="flex flex-col gap-1">
										<p className="text-sm text-indigo-600 font-semibold">Traitement de la note de frais</p>
										<motion.p
											className="text-xs text-neutral-600"
											initial={{ opacity: 1, height: "auto" }}
											animate={step === "processing"
												? { opacity: 1, height: "auto", y: 0 }
												: { opacity: 0, height: 0, y: 20 }
											}
											exit={{ opacity: 0, height: 0, y: 20 }}
											transition={{ duration: 0.3 }}
										>
											Nous analysons les données de votre note de frais.
										</motion.p>
									</div>
								</div>
								<div
									className={cn("flex items-center gap-4 px-6", {
										"opacity-50": step !== "preform",
									})}
								>
									<div className="w-6 flex items-center justify-center">
										{ step === "upload" || step === "file-check" || step === "processing" ? (
											<Loader2 className="text-2xl text-neutral-200" />
										) : step === "preform" ? (
											<Loader2 className="text-2xl animate-spin text-indigo-600" />
										) : (
											<FaCircleCheck className="text-2xl text-indigo-600" />
										)}
									</div>
									<div className="flex flex-col gap-1">
										<p className="text-sm text-indigo-600 font-semibold">Réception des données</p>
										<motion.p
											className="text-xs text-neutral-600"
											initial={{ opacity: 1, height: "auto" }}
											animate={step === "preform" ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
											transition={{ duration: 0.3 }}
										>
											Nous avons reçu les données de votre note de frais.
										</motion.p>
									</div>
								</div>
							</div>
							<motion.div
								className="border gap-4 bg-white rounded-xl flex flex-col  justify-center p-8"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.5, duration: 0.4 }}
							>
								<div className="h-8 w-full bg-neutral-200 rounded-lg animate-pulse" />
								{/* Simulate paragraph */}
								<div className="h-4 w-3/4 bg-neutral-200 rounded animate-pulse" />
								<div className="h-4 w-1/2 bg-neutral-200 rounded animate-pulse" />
							</motion.div>
							</>
						)}

						{step=== "form" && (
							<>
							<div className="bg-white shadow-sm rounded-xl border flex flex-col gap-4 p-4">
								<h3 className="font-semibold text-sm">Récapitulatif de la note de frais</h3>
								<div className="flex flex-col gap-2">
									<div className="flex justify-between items-center">
										<span className="text-xs text-neutral-500">Nom de l&apos;entreprise</span>
										<span className="text-sm text-neutral-800">{expenseData.company_name?.value || "Non renseigné"}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-xs text-neutral-500">Date</span>
										<span className="text-sm text-neutral-800">{expenseData.date?.value || "Non renseigné"}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-xs text-neutral-500">Moyen de paiement</span>
										<span className="text-sm text-neutral-800">{expenseData.payment_method?.value || "Non renseigné"}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-xs text-neutral-500">Total TVA</span>
										<span className="text-sm text-neutral-800">
											{expenseData.total_tva?.value
												? parseFloat(expenseData.total_tva.value).toFixed(2) + " €"
												: "Non renseigné"}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-xs text-neutral-500">Total HT</span>
										<span className="text-sm text-neutral-800">
											{expenseData.total_ht?.value
												? parseFloat(expenseData.total_ht.value).toFixed(2) + " €"
												: "Non renseigné"}
										</span>
									</div>
									<div className="flex justify-between items-center border-t pt-2">
										<span className="text-sm text-neutral-800 font-medium">Total TTC</span>
										<span className="text-neutral-800 font-medium">
											{expenseData.total_ttc?.value
												? parseFloat(expenseData.total_ttc.value).toFixed(2) + " €"
												: "Non renseigné"}
										</span>
									</div>

									<div className="border-t pt-2"/>


									{(() => {
										const errorField = Object.entries(expenseData).find(
											([key, field]: [string, any]) => field?.error === true
										);
										const errorItem = expenseData.items && expenseData.items.find((item: any) =>
											Object.values(item).some((v: any) => v?.error === true)
										);
										const errorMessages: string[] = [];

										// Check main fields
										Object.entries(expenseData).forEach(([key, field]: [string, any]) => {
											if (field?.error === true) {
												switch (key) {
													case "company_name":
														errorMessages.push("Veuillez renseigner le nom de l'entreprise.");
														break;
													case "company_address":
														errorMessages.push("Veuillez renseigner l'adresse de l'entreprise.");
														break;
													case "date":
														errorMessages.push("Veuillez renseigner la date.");
														break;
													case "payment_method":
														errorMessages.push("Veuillez sélectionner le moyen de paiement.");
														break;
													case "total_ht":
														errorMessages.push("Veuillez renseigner le total HT.");
														break;
													case "total_vat":
														errorMessages.push("Veuillez renseigner le total TVA.");
														break;
													case "total_ttc":
														errorMessages.push("Veuillez renseigner le total TTC.");
														break;
													default:
														errorMessages.push("Veuillez corriger le champ " + key + ".");
												}
											}
										});

										// Check items
										if (expenseData.items && Array.isArray(expenseData.items)) {
											expenseData.items.forEach((item: any, idx: number) => {
												Object.entries(item).forEach(([key, field]: [string, any]) => {
													if (field?.error === true) {
														switch (key) {
															case "name":
																errorMessages.push(`Veuillez renseigner le nom de l'article #${idx + 1}.`);
																break;
															case "quantity":
																errorMessages.push(`Veuillez renseigner la quantité de l'article #${idx + 1}.`);
																break;
															case "unit_price":
																errorMessages.push(`Veuillez renseigner le prix unitaire de l'article #${idx + 1}.`);
																break;
															case "total_price":
																errorMessages.push(`Veuillez renseigner le total de l'article #${idx + 1}.`);
																break;
															case "total_tva":
																errorMessages.push(`Veuillez renseigner le total de TVA de l'article #${idx + 1}.`);
																break;
															case "vat_amount":
																errorMessages.push(`Veuillez renseigner le montant de TVA de l'article #${idx + 1}.`);
																break;
															case "category":
																errorMessages.push(`Veuillez renseigner la catégorie de l'article #${idx + 1}.`);
																break;
															default:
																errorMessages.push(`Veuillez corriger le champ ${key} de l'article #${idx + 1}.`);
														}
													}
												});
											});
										}

										return errorMessages.length > 0 ? (
											<ul className="text-xs text-red-600 mb-2 list-disc list-inside">
												{errorMessages.map((msg, i) => (
													<li key={i}>{msg}</li>
												))}
											</ul>
										) : null;
									})()}


									{ expense.status === "processed" ? (
										<>
											<div className="flex items-center gap-4 bg-neutral-500/5 rounded-lg p-4">
												<div className="w-6 flex items-center justify-center">
													<IoIosInformationCircle className="text-neutral-500 w-5 h-5" />
												</div>
												<p className="text-xs text-neutral-500">
													Les informations sont basées sur les données extraites de votre note de frais. Veuillez vérifier leur exactitude avant de soumettre.
												</p>
											</div>

											<Button 
												className={cn("mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white", {
													"bg-indigo-100 cursor-not-allowed hover:bg-indigo-100 text-neutral-500": loading
												})}
												disabled={
													Object.values(expenseData).some((field: any) => field?.error === true) ||
													(expenseData.items && expenseData.items.some((item: any) =>
														Object.values(item).some((v: any) => v?.error === true)
													))
												}
												onClick={handleSubmit}
											>
												{ loading && (
													<Loader2 className="w-4 h-4 animate-spin mr-2" />
												)}
												Soumettre la note de frais
											</Button>
											<Button
												variant="outline"
												className="mt-2 w-full"
												onClick={reset}
											>
												Annuler et supprimer
											</Button>
										</>	
									) : (
										<>
											<div className="flex justify-between items-center">
												<span className="text-xs text-neutral-500">Statut de la note de frais</span>
												<span className="text-neutral-800 font-medium">
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
											
										</>
									)}

									

								</div>
							</div>
							<div className="bg-white shadow-sm rounded-xl border flex flex-col gap-4 p-4">
								<p className="text-neutral-500 text-xs">
									L&apos;image que vous avez téléversée sera transmise à votre comptable pour vérification et archivage.{" "}
									<span className="text-xs text-indigo-500 hover:underline cursor-pointer" onClick={() => {
									// display in browser tab
									if (file && file.blobUrl) {
										window.open(file.blobUrl, "_blank");
									}
								}}>
									{file.name} ({(file.size / 1024).toFixed(2)} Ko)
								</span>
								</p>
								<motion.div
									initial={false}
									animate={showPreview ? { opacity: 1,  height: "auto" } : { opacity: 0, height: 0 }}
									transition={{ duration: 0.3, ease: "easeInOut" }}
									exit={{ opacity: 0, height: 0 }}
									style={{ overflow: "hidden" }}
									className="w-full h-auto flex items-center justify-center -mt-3"
								>
									{showPreview && (
										<Image 
											src={file.base64 || ""}
											alt="Aperçu de la note de frais"
											width={1920}
											height={1080}
										/>
									)}
								</motion.div>
								<Button
									variant="outline"
									className=" w-full"
									onClick={() => setShowPreview((prev: boolean) => !prev)}
								>
									{showPreview ? "Masquer l’aperçu" : "Afficher l’aperçu"}
								</Button>
								
							</div>

							</>
						)}
					</div>
				</section>
			)}
		</main>
	);
}
