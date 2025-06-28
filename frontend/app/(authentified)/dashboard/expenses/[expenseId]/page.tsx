"use client";
import { useState, useRef, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GoChevronLeft } from "react-icons/go";

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

export default function Page({params}) {
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


	const reset = () => {
		ApiController(`expenses/${expense._id}`, 'DELETE');
		router.push("/dashboard/expenses");
		toast.success("La note de frais a été supprimée avec succès.");
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
		await new Promise((r) => setTimeout(r, 1000));

		setStep("processing");
		

		const response: any = await ApiController('expenses/new', 'POST', {
			base64: base64
		});

		if (response.status === "error") {
			toast.error(response.error || "Une erreur est survenue lors de l'envoi de la note de frais.");
			reset();
			return;
		}

		const id = response.id;
		history.pushState({}, '', `/dashboard/expenses/${id}`);

		toast.info(id);

		const interval = setInterval(async () => {
			const statusResponse: any = await ApiController(`expenses/${id}/status`, 'GET');
			if (statusResponse.status === "error") {
				toast.error(statusResponse.error || "Une erreur est survenue lors de la récupération du statut.");
				clearInterval(interval);
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
			}, 1000);


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
			const newTotalTVA = prev.total_vat.value;
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
		const response = await ApiController(`expenses/${expense._id}`, 'POST', {
			expense: expenseData,
		});

		console.log(response);

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


		toast.success("La note de frais a été créée avec succès.");
	};

	const handleEdit = () => {
		expense.status = "processed";
		setExpenseData((prev: any) => ({
			...prev,
			status: "processed",
		}));
	}


	useEffect(() => {
		const expenseId = params.expenseId;

		const fetchExpense = async () => {
			const response: any = await ApiController(`expenses/${expenseId}`, 'GET');

			if (response.status === "error") {
				toast.error(response.error || "Une erreur est survenue lors de la récupération de la note de frais.");
				return router.push("/dashboard/expenses");
			}

			const image = await ApiController(`expenses/${expenseId}/image`, 'GET');

			console.log(image);

			if (image.status === "success")
			{
				setImagePreview(image.image);
			}

			console.log(response.data);

			setExpenseData(response.data.data);
			setExpense(response.data);
			setStep("form");

		}

		fetchExpense();

		return () => {
			setExpense(null);
			setExpenseData({});
			setImagePreview(null);
			setFile(null);
			setStep("upload-form");
		}

	}, [])


	async function handleUpdateStatus(status: "pending" | "processed") {
		const response: any = await ApiController(`expenses/${expense._id}/status`, 'PUT', {
			status: status,
		});

		if (response.status === "error") {
			toast.error(response.error || "Une erreur est survenue lors de la mise à jour du statut de la note de frais.");
			return;
		}

		setExpense((prev: any) => ({
			...prev,
			status: status,
		}));
	}

	const isDisabled = () => ["pending", "approved", "rejected"].includes(expense?.status || "");

	return (
		<main className="h-full w-full flex flex-col p-8 lg:p-24 justify-start items-start">
			<div
				className="flex gap-4 items-center mb-8 font-semibold group cursor-pointer"
				onClick={() => {
					// Remove /dashboard/expenses/new from history if present, then go back
					if (typeof window !== "undefined") {
						const { pathname } = window.location;
						if (pathname === "/dashboard/expenses/new") {
							router.replace("/dashboard/expenses");
						} else {
							router.back();
						}
					} else {
						router.back();
					}
				}}
			>
				<GoChevronLeft className="w-6 h-6 cursor-pointer" />
				<span className="group-hover:underline">Revenir en arrière</span>
			</div>
			{step === "upload-form" && (
				<section className="w-full flex flex-col items-start gap-8">
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
							<span className="font-medium mt-6">
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
				<section className="flex flex-col md:flex-row items-start gap-8 justify-between w-full">
					<div className="flex-1">
						{step !== "form" ? (
							<motion.div
								initial={{ opacity: 1, y: 0, height: "30vh" }}
								animate={step === "form" ? { opacity: 0, y: 20, height: 0, margin: 0, padding: 0 } : { opacity: 1, y: 0, height: "30vh" }}
								transition={{ duration: 0.4 }}
								style={{ overflow: "hidden" }}
								className="h-[30vh] border gap-4 bg-white rounded-xl flex flex-col items-center justify-center"
							>
								<Loader2 className="text-2xl animate-spin text-indigo-600" />
								<p className="text-neutral-500 text-sm">Les données de votre note de frais sont en cours de traitement...</p>
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
												placeholder="Nom de l'entreprise"
												disabled={isDisabled()}
												value={expenseData.company_name?.value || ""}
												className={cn("border rounded-lg p-2 text-sm w-full", {
													"bg-neutral-200 text-black cursor-not-allowed": isDisabled(),
												})}
											/>
										</div>
										<div className="flex flex-col flex-1  gap-2">
											<label className="text-xs">Adresse</label>
											<Input
												type="text"
												disabled={isDisabled()}
												placeholder="Adresse de l'entreprise"
												value={expenseData.company_address?.value || ""}
												className={cn("border rounded-lg p-2 text-sm w-full", {
													"bg-neutral-200 text-black cursor-not-allowed": isDisabled(),
												})}
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
													if (isDisabled()) return;
													const newDate = e.target.value;
													setExpenseData((prev: any) => ({
														...prev,
														date: { ...prev.date, value: newDate, error: false },
													}));
												}}
												disabled={isDisabled()}
												placeholder="Date de la note de frais"
												value={expenseData.date?.value || ""}
												className={cn("border rounded-lg p-2 text-sm w-full", {
													"bg-neutral-200 text-black cursor-not-allowed": isDisabled(),
												})}
											/>
										</div>
										<div className="flex flex-col flex-1 gap-2">
											<label className="text-xs">Moyen de paiement</label>
											<Select
												value={expenseData.payment_method?.value || ""}
												disabled={isDisabled()}
												placeholder="Sélectionner un moyen de paiement"
												onValueChange={(value) => {
													if (isDisabled()) return;
													setExpenseData((prev: any) => ({
														...prev,
														payment_method: { ...prev.payment_method, value, error: false },
													}));
												}}
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
												onChange={(e) => {
													if (isDisabled()) return;
													const newTotalHT = e.target.value;
													setExpenseData((prev: any) => ({
														...prev,
														total_ht: { ...prev.total_ht, value: newTotalHT, error: false },
													}));
												}}
												type="text"
												disabled={isDisabled()}
												placeholder="Total HT"
												value={expenseData.total_ht?.value?.toFixed ? expenseData.total_ht.value.toFixed(2) : expenseData.total_ht?.value || ""}
												className={cn("border rounded-lg p-2 text-sm w-full", {
													"bg-neutral-200 text-black cursor-not-allowed": isDisabled(),
												})}
											/>
										</div>
										<div className="flex flex-col flex-1 gap-2">
											<label className="text-xs">Total TVA</label>
											<Input
												onChange={(e) => {
													if (isDisabled()) return;
													const newTotalVAT = e.target.value;
													setExpenseData((prev: any) => ({
														...prev,
														total_vat: { ...prev.total_vat, value: newTotalVAT, error: false },
													}));
													recalculateTTC();
												}}
												type="text"
												disabled={isDisabled()}
												
												placeholder="Total TVA"
												value={expenseData.total_vat?.value?.toFixed ? expenseData.total_vat.value.toFixed(2) : expenseData.total_vat?.value || ""}
												className={cn("border rounded-lg p-2 text-sm w-full", {
													"bg-neutral-200 text-black cursor-not-allowed": isDisabled(),
												})}
											/>
										</div>
										<div className="flex flex-col flex-1 gap-2">
											<label className="text-xs">Total TTC</label>
											<Input
												onChange={(e) => {
													if (isDisabled()) return;
													const newTotalTTC = e.target.value;
													setExpenseData((prev: any) => ({
														...prev,
														total_ttc: { ...prev.total_ttc, value: newTotalTTC, error: false },
													}));
												}}
												type="text"
												disabled={isDisabled()}
												placeholder="Total TTC"

												value={
													(expenseData.total_ht?.value && expenseData.total_vat?.value)
														? (parseFloat(expenseData.total_ht.value) + parseFloat(expenseData.total_vat.value)).toFixed(2) + " €"
														: ""
												}
												className={cn("border rounded-lg p-2 text-sm w-full", {
													"bg-neutral-200 text-black cursor-not-allowed": isDisabled(),
												})}
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
														onChange={(e) => {
															if (isDisabled()) return;
															const newName = e.target.value;
															setExpenseData((prev: any) => {
																const newItems = [...prev.items];
																newItems[index] = { ...newItems[index], name: { value: newName, error: false } };
																return { ...prev, items: newItems };
															});
														}}
														type="text"
														disabled={isDisabled()}
														placeholder="Nom de l'article"
														value={item.name?.value || ""}
														className={cn("border rounded-lg p-2 text-sm w-full", {
															"bg-neutral-200 text-black cursor-not-allowed": isDisabled(),
														})}
													/>
												</div>
												<div className="flex flex-col flex-1 gap-2">
													<label className="text-xs">Quantité</label>
													<Input
														onChange={(e) => {
															if (isDisabled()) return;
															const newQuantity = e.target.value;
															setExpenseData((prev: any) => {
																const newItems = [...prev.items];
																newItems[index] = { ...newItems[index], quantity: { value: newQuantity, error: false } };
																return { ...prev, items: newItems };
															});
														}}
														type="number"
														disabled={isDisabled()}
														
														placeholder="Quantité"
														value={item.quantity?.value || ""}
														className={cn("border rounded-lg p-2 text-sm w-full", {
															"bg-neutral-200 text-black cursor-not-allowed": isDisabled(),
														})}
													/>
												</div>
												<div className="flex flex-col flex-1 gap-2">
													<label className="text-xs">Total</label>
													<Input
														onChange={(e) => {
															if (isDisabled()) return;
															const newTotalPrice = e.target.value;
															setExpenseData((prev: any) => {
																const newItems = [...prev.items];
																newItems[index] = { ...newItems[index], total_price: { value: newTotalPrice, error: false } };
																return { ...prev, items: newItems };
															});
														}}
														type="number"
														disabled={isDisabled()}
														placeholder="Total"
														value={item.total_price?.value || ""}
														className={cn("border rounded-lg p-2 text-sm w-full", {
															"bg-neutral-200 text-black cursor-not-allowed": isDisabled(),
														})}
													/>
												</div>
												
												<div className="flex flex-col flex-1 gap-2">
													<label className="text-xs">Catégorie</label>
													<Select
														onValueChange={(value) => {
															if (isDisabled()) return;
															setExpenseData((prev: any) => {
																const newItems = [...prev.items];
																newItems[index] = { ...newItems[index], category: { value, error: false } };
																return { ...prev, items: newItems };
															});
														}}
														value={item.category?.value || ""}
														disabled={isDisabled()}
														placeholder="Sélectionner une catégorie"
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
					<div className="w-full md:w-1/3 pt-0 flex flex-col gap-4">
						{ step !== "form" && (
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
								<div className={cn("flex items-center gap-4 px-6", {
									"opacity-50": step === "upload",
								})}>
									<div className="w-6 flex items-center justify-center">
										{ step === "upload" ? (
											<Loader2 className="text-2xl text-neutral-200" />
										) : step === "processing" ? (
											<Loader2 className="text-2xl animate-spin text-indigo-600" />
										) : (
											<FaCircleCheck className="text-2xl text-indigo-600" />
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
										{ step === "upload" || step === "processing" ? (
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
											{expenseData.total_vat?.value
												? parseFloat(expenseData.total_vat.value).toFixed(2) + " €"
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
															case "vat_rate":
																errorMessages.push(`Veuillez renseigner le taux de TVA de l'article #${idx + 1}.`);
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
												onClick={() => {
													const isBlocked =
														Object.values(expenseData).some((field: any) => field?.error === true) ||
														(expenseData.items && expenseData.items.some((item: any) =>
															Object.values(item).some((v: any) => v?.error === true)
														));
													if (isBlocked) {
														console.log("Submission blocked due to errors in fields:", expenseData);
													}
													handleSubmit();
												}}
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
												Supprimer définitivement
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

											{user._id === expense.userId && expense.status === "pending" ? (
												<>
													<Button 
														className="mt-2 w-full shadow-none bg-neutral-100 hover:bg-neutral-200 text-neutral-600"
														onClick={handleEdit}
													>
														Modifier la note de frais
													</Button>
													<Button
														variant="outline"
														className="mt-2 w-full"
														onClick={reset}
													>
														Supprimer définitivement
													</Button>
												</>
											) : (
												<>
													{expense.status === "pending" && (
														<div className="flex items-center gap-4">
															<Button 
																className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white"
																onClick={() => handleUpdateStatus("approved")}
															>
																Valider
															</Button>
															<Button
																variant="outline"
																className="mt-2 w-full"
																onClick={() => handleUpdateStatus("rejected")}
															>
																Rejeter
															</Button>
														</div>
													)}
												</>
											)}
										</>
									)}

									

								</div>
							</div>
							<div className="bg-white shadow-sm rounded-xl border flex flex-col gap-4 p-4">
								<p className="text-neutral-500 text-xs">
									L&apos;image que vous avez téléversée sera transmise à votre comptable pour vérification et archivage.
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
											src={imagePreview || ""}
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
