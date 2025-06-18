"use client";
import { useState, useRef } from "react";
import AnimatedLogo from "@/components/AnimatedLogo";
import TypeWriter from "@/components/animations/TypeWriter";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { motion } from "framer-motion";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function Page() {
	const [expensesManager, setExpensesManager] = useState<boolean>(false);

	const [expenses, setExpenses] = useState<File[]>([]);

	const [loading, setLoading] = useState<boolean>(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setLoading(true);
			setExpensesManager(true);

			// convert FileList to object with blob URLs
			const filesArray = Array.from(e.target.files);
			const expensesWithBlobUrls = filesArray.map((file) => {
				const blobUrl = URL.createObjectURL(file);
				return {
					file,
					blobUrl,
				};
			});
			setExpenses(expensesWithBlobUrls);
		}
	};

	return (
		<main className="h-full flex flex-col p-24 justify-start items-start">
			{ !expensesManager ? (
				<>
					<h1 className="text-3xl text-indigo-600 mt-8 font-bold">Téléversez vos frais</h1>
					<div className="text-neutral-800 text-sm inline-flex w-auto gap-6 items-center mt-12 bg-indigo-400/5 rounded-3xl p-6 pr-12">
						<AnimatedLogo width={5} />
						<div className="flex flex-col items-start">
							<TypeWriter text="Vous pouvez téléverser vos notes de frais ici. Assurez-vous de respecter les formats acceptés (jpg, jpeg, png, pdf)." />
						</div>
					</div>
					<div className="flex w-full gap-6">
						<div
							className="flex-1 flex flex-col justify-center items-center p-24 bg-indigo-100/50 border border-indigo-300 rounded-2xl mt-12 cursor-pointer hover:bg-indigo-200/50 transition"
							onClick={() => fileInputRef.current?.click()}
						>
							<AiOutlineCloudUpload className="w-8 h-8 text-indigo-600 mb-4" />
							<p>Télécharger une note de frais</p>
							<input
								ref={fileInputRef}
								id="file-upload"
								type="file"
								multiple
								accept=".jpg, .jpeg, .png, .pdf"
								onChange={handleFileChange}
								className="hidden"
							/>
						</div>
					</div>
				</>
			) : (
				<div className="flex flex-col w-full gap-8">
					{expenses.map((expense, index) => (
						<div className="flex w-full justify-between gap-8">
							<div>
								<motion.div
									className="relative h-[65vh] mb-8 overflow-hidden flex items-center justify-center rounded-2xl shadow-lg bg-white"
								>
									<Image 
										src={expense.blobUrl}
										alt={`Expense `}
										width={400}
										height={400}
										className="rounded-lg object-cover h-[65vh]"
									/>
									<div className="absolute inset-0 bg-black/60 rounded-lg pointer-events-none" />
									<p className="absolute z-10 text-white font-normal text-balance text-xl text-center mx-4">
										Veuillez patienter pendant que nous traitons votre note de frais...
									</p>
									<motion.div
										className="top-0 absolute w-full bg-indigo-500 h-3 background-blend-multiply rounded-lg"
										style={{ filter: "blur(4px)" }}
										animate={{
											top: ["-5%", "100%", "-5%", "-5%"],
										}}
										transition={{
											duration: 2.5,
											ease: "easeInOut",
											repeat: Infinity,
											repeatType: "loop",
										}}
									/>

								</motion.div>
							</div>
							<div className="flex flex-col justify-start items-start gap-6 flex-1 p-12">
								<h2 className="text-3xl font-bold text-indigo-800">
									<Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" /> Traitement en cours...
								</h2>
								<p className="text-neutral-600 text-sm">
									Nous traitons votre note de frais. Cela peut prendre quelques instants. Merci de votre patience.
								</p>
							</div>
						</div>

					))}

				</div>
			)}
		</main>
	);
}
