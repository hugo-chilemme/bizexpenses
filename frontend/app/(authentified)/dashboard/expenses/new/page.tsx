"use client";
import { useState, useRef } from "react";
import AnimatedLogo from "@/components/AnimatedLogo";
import TypeWriter from "@/components/animations/TypeWriter";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { motion } from "framer-motion";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ApiController from "@/lib/api-controller";
import { toast } from "sonner";
import { IoCameraOutline } from "react-icons/io5";

type ExpenseAnalysis = any; // Remplacer par le vrai type

const isMobile = typeof window !== "undefined" && /Mobi|Android/i.test(navigator.userAgent);

const FIELDS = [
	{ key: "company_name", label: "Nom de l'entreprise", type: "text", placeholder: "Nom de l'entreprise" },
	{ key: "company_address", label: "Adresse de l'entreprise", type: "text", placeholder: "Adresse de l'entreprise" },
	{ key: "date", label: "Date", type: "date", placeholder: "Date" },
	{ key: "total_ttc", label: "Total TTC", type: "text", placeholder: "Non disponible" },
	{ key: "total_vat", label: "Total TVA", type: "text", placeholder: "Non disponible" },
	{ key: "payment_method", label: "Moyen de paiement", type: "text", placeholder: "Non disponible" },
];

export default function Page() {
	const router = useRouter();
	const [step, setStep] = useState<"upload" | "processing" | "form" | "review" | "saving">("upload");
	const [expense, setExpense] = useState<any>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// UX: Reset everything
	const reset = () => {
		setExpense(null);
		setStep("upload");
	};

	// UX: Upload file
	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files?.length) return;
		const file = e.target.files[0];
		setStep("processing");

		
		// create blob URL and base64 for preview
		if (!file.type.match(/image|pdf/)) {
			toast.error("Veuillez téléverser un fichier image (jpg, jpeg, png) ou PDF.");
			reset();
			return;
		}
		const blobUrl = URL.createObjectURL(file);
		setExpense({ file, blobUrl, base64: null, loading: true, analysis: null });


		const reader = new FileReader();
		reader.onload = async () => {
			const base64 = reader.result as string;
			const blobUrl = URL.createObjectURL(file);
			setExpense({ file, blobUrl, base64, loading: true, analysis: null });

			toast.info("Analyse de votre note de frais en cours...");

			const response: any = await ApiController("expenses/new", "POST", { base64 });

			if (!response || response.status === "error") {
				toast.error("Erreur lors de l'envoi du fichier. Veuillez réessayer.");
				reset();
				return;
			}

			if (response.data.status === "error") {
				toast.error(response.data.error || "Erreur lors de l'analyse du fichier.");
				reset();
				return;
			}


			setExpense((prev: any) => ({
				...prev,
				rowId: response.rowId,
				analysis: response.data,
				loading: false,
			}));
			setStep("form");
		};
		reader.onerror = () => reset();
		reader.readAsDataURL(file);
	};

	// UX: Field change
	const handleFieldChange = (key: string, value: string) => {
		setExpense((prev: any) => ({
			...prev,
			analysis: {
				...prev.analysis,
				[key]: { ...prev.analysis?.[key], value, error: !value }
			}
		}));
	};

	// UX: Items change
	const handleItemChange = (idx: number, field: string, value: string | number) => {
		setExpense((prev: any) => ({
			...prev,
			analysis: {
				...prev.analysis,
				items: prev.analysis.items.map((it: any, i: number) =>
					i === idx ? { ...it, [field]: { ...it[field], value, error: !value } } : it
				)
			}
		}));
	};

	// UX: Validate fields
	const isFormValid = () =>
		FIELDS.every(f => {
			const v = expense.analysis?.[f.key]?.value;
			return v && (f.type !== "date" || !isNaN(new Date(v).getTime()));
		});

	// UX: Save
	const handleSave = async () => {
		if (!isFormValid()) {
			alert("Veuillez remplir tous les champs requis.");
			return;
		}
		setStep("saving");
		try {
			const res = await fetch(`http://localhost:3002/api/v1/expenses/${expense.rowId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ expense: expense.analysis }),
			});
			const data = await res.json();
			if (data.status === "success") {
				router.push("/dashboard");
			} else {
				alert("Erreur lors de l'enregistrement.");
				setStep("review");
			}
		} catch {
			alert("Erreur réseau.");
			setStep("review");
		}
	};

	// --- UI ---
	return (
		<main className="h-full w-full flex flex-col p-8 lg:p-24 justify-start items-start ">
			{/* Step 1: Upload */}
			{step === "upload" && (
				<section className="w-full  flex flex-col items-start gap-8">
					<h1 className="text-3xl text-indigo-600 font-bold mt-8">Nouvelle note de frais</h1>
					<div className="bg-indigo-50 rounded-2xl p-6 flex items-center gap-6 w-full">
						<AnimatedLogo width={5} />
						<TypeWriter text="Téléversez votre note de frais (jpg, jpeg, png, pdf)." />
					</div>
					<div className="flex flex-col lg:flex-row gap-4 w-full">
						<button
							className="flex flex-col items-center justify-center gap-2 p-12 bg-indigo-100 border border-indigo-300 rounded-2xl hover:bg-indigo-200 transition cursor-pointer w-full"
							onClick={() => fileInputRef.current?.click()}
						>
							<AiOutlineCloudUpload className="w-8 h-8 text-indigo-600" />
							<span className="font-medium">Sélectionner un fichier</span>
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
								onClick={() => {
									const cameraInput = document.createElement("input");
									cameraInput.type = "file";
									cameraInput.accept = "image/*";
									(cameraInput as any).capture = "environment";
									cameraInput.onchange = (e: Event) => {
										handleFileChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
										// Nettoyage de l'élément après usage
										setTimeout(() => cameraInput.remove(), 1000);
									};
									cameraInput.style.display = "none";
									document.body.appendChild(cameraInput);
									cameraInput.click();
								}}
							>
								<IoCameraOutline className="w-8 h-8 text-indigo-600" />
								<span className="font-medium">Prendre une photo</span>
							</button>
						)}
					</div>
				</section>
			)}

			{/* Step 2: Processing */}
			{step === "processing" && (
				<section className="w-full flex flex-col md:flex-row gap-8">
					<div className="flex-1 flex flex-col items-center">
						<div className="relative w-full max-w-md h-[600px] overflow-hidden flex items-stretch">
							<Image
								src={expense.blobUrl}
								alt="Aperçu"
								width={1920}
								height={1080}
								className="rounded-xl object-cover bg-white border-4 border-indigo-200 w-full h-full"
								unoptimized
								style={{ position: "absolute", inset: 0 }}
							/>

							<motion.div
								initial={{ top: "0%" }}
								animate={{ top: ["-10%", "110%", "-10%"] }}
								transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
								className="absolute top-0 left-0 right-0 h-4 text-center bg-indigo-500/75 blur-sm z-0"
							/>
						</div>
						<button
							className="mt-4 text-sm text-indigo-600 underline"
							onClick={reset}
						>
							Recommencer
						</button>
					</div>
					<div className="flex-1 flex flex-col gap-6 rounded-2xl p-8 items-center justify-center">
						<h2 className="text-2xl font-bold text-indigo-700 mb-2"><Loader2 className="animate-spin w-6 h-6 inline-block mr-2" /> Traitement en cours...</h2>
						<p className="text-gray-600">Nous analysons votre note de frais. Veuillez patienter quelques instants.</p>
						<p className="text-sm text-gray-500">Si le traitement prend trop de temps, vous pouvez re-téléverser le fichier.</p>
					</div>
				</section>
			)}

			{/* Step 3: Guided Form */}
			{step === "form" && expense && (
				<section className="w-full flex flex-col md:flex-row gap-8">
					<div className="flex-1 flex flex-col items-center">
						<Image
							src={expense.blobUrl}
							alt="Aperçu"
							width={1920}
							height={1080}
							className="rounded-xl object-contain bg-white border-4 border-indigo-200 w-full max-w-md"
							unoptimized
						/>
						<button
							className="mt-4 text-sm text-indigo-600 underline"
							onClick={reset}
						>
							Recommencer
						</button>
					</div>
					<div className="flex-1 flex flex-col gap-6 bg-white rounded-2xl p-8">
						<h2 className="text-2xl font-bold text-indigo-700 mb-2">Vérifiez et complétez les informations</h2>
						<form
							className="flex flex-col gap-4"
							onSubmit={e => {
								e.preventDefault();
								setStep("review");
							}}
						>
							{FIELDS.map(f => (
								<div key={f.key} className="flex flex-col gap-1">
									<label className="font-semibold text-indigo-700">{f.label}</label>
									<input
										type={f.type}
										className={`p-2 border-b focus:outline-none ${!expense.analysis?.[f.key]?.value ? "border-red-400" : "border-indigo-300"}`}
										value={
											f.type === "date"
												? (() => {
														const val = expense.analysis?.[f.key]?.value;
														const date = val ? new Date(val) : null;
														return date && !isNaN(date.getTime())
															? date.toISOString().slice(0, 10)
															: "";
													})()
												: (expense.analysis?.[f.key]?.value || "")
										}
										placeholder={f.placeholder}
										onChange={e => handleFieldChange(f.key, e.target.value)}
									/>
								</div>
							))}
							<button
								type="submit"
								className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-300"
								disabled={!isFormValid()}
							>
								Continuer
							</button>
						</form>
					</div>
				</section>
			)}

			{/* Step 4: Review & Edit Items */}
			{step === "review" && expense && (
				<section className="w-full max-w-4xl flex flex-col gap-8">
					<div className="flex flex-col gap-2">
						<h3 className="text-xl font-semibold text-indigo-700">Résumé</h3>
						<ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
							{FIELDS.map(f => (
								<li key={f.key}>
									<span className="font-semibold">{f.label} :</span>{" "}
									{expense.analysis?.[f.key]?.value || <span className="text-red-700">Non renseigné</span>}
								</li>
							))}
						</ul>
					</div>
					{Array.isArray(expense.analysis?.items) && (
						<div>
							<h4 className="text-lg font-semibold text-indigo-700 mb-2">Détails des articles</h4>
							<div className="overflow-x-auto">
								<table className="min-w-full border border-indigo-200 rounded-lg">
									<thead>
										<tr className="bg-indigo-50">
											<th className="px-2 py-1 border">Nom</th>
											<th className="px-2 py-1 border">Catégorie</th>
											<th className="px-2 py-1 border">Quantité</th>
											<th className="px-2 py-1 border">Prix unitaire</th>
											<th className="px-2 py-1 border">Prix total</th>
										</tr>
									</thead>
									<tbody>
										{expense.analysis.items.map((item: any, idx: number) => (
											<tr key={idx}>
												<td className="border px-2 py-1">
													<input
														type="text"
														className="w-full bg-transparent border-b border-dotted focus:outline-none"
														value={item.name?.value || ""}
														placeholder="Nom"
														onChange={e => handleItemChange(idx, "name", e.target.value)}
													/>
												</td>
												<td className="border px-2 py-1">
													<input
														type="text"
														className="w-full bg-transparent border-b border-dotted focus:outline-none"
														value={item.category?.value || ""}
														placeholder="Catégorie"
														onChange={e => handleItemChange(idx, "category", e.target.value)}
													/>
												</td>
												<td className="border px-2 py-1">
													<input
														type="number"
														min={1}
														className="w-full bg-transparent border-b border-dotted focus:outline-none"
														value={item.quantity?.value ?? ""}
														placeholder="Quantité"
														onChange={e => handleItemChange(idx, "quantity", Number(e.target.value))}
													/>
												</td>
												<td className="border px-2 py-1">
													<input
														type="number"
														min={0}
														step="0.01"
														className="w-full text-right bg-transparent border-b border-dotted focus:outline-none"
														value={item.unit_price?.value ?? ""}
														placeholder="Prix unitaire"
														onChange={e => handleItemChange(idx, "unit_price", Number(e.target.value))}
													/>
												</td>
												<td className="border px-2 py-1">
													<input
														type="number"
														min={0}
														step="0.01"
														className="w-full text-right bg-transparent border-b border-dotted focus:outline-none"
														value={item.total_price?.value ?? ""}
														placeholder="Prix total"
														onChange={e => handleItemChange(idx, "total_price", Number(e.target.value))}
													/>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}
					<div className="flex gap-4 mt-4">
						<button
							className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
							onClick={() => setStep("form")}
						>
							Modifier les infos
						</button>
						<button
							className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
							onClick={handleSave}
						>
							Enregistrer la note de frais
						</button>
					</div>
				</section>
			)}

			{/* Step 5: Saving */}
			{step === "saving" && (
				<section className="flex flex-col items-center gap-4 mt-24">
					<Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
					<p className="text-lg text-indigo-800">Enregistrement en cours...</p>
				</section>
			)}
		</main>
	);
}
