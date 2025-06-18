"use client";
import { useState, useRef } from "react";
import AnimatedLogo from "@/components/AnimatedLogo";
import TypeWriter from "@/components/animations/TypeWriter";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { motion } from "framer-motion";

export default function Page() {
	const [loading, setLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setLoading(true);
			// handle files if needed: Array.from(e.target.files)
		}
	};

	return (
		<main className="h-full flex flex-col p-24 justify-start items-start">
			<h1 className="text-3xl text-indigo-600 mt-8 font-bold">Téléversez vos frais</h1>
			<div className="text-neutral-800 text-sm inline-flex w-auto gap-6 items-center mt-12 bg-indigo-400/5 rounded-3xl p-6 pr-12">
				<AnimatedLogo width={5} />
				<div className="flex flex-col items-start">
					{!loading ? (
						<TypeWriter text="Vous pouvez téléverser vos notes de frais ici. Assurez-vous de respecter les formats acceptés (jpg, jpeg, png, pdf)." />
					) : (
						<>
							<TypeWriter text="Donnez-moi un instant, je traite vos fichiers." />
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: [0.25, 1, 0.25] }}
								transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
								className="flex items-center mt-1"
							>
								Regarde vos fichiers...
							</motion.div>
						</>
					)}
				</div>
			</div>
			{!loading && (
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
			)}
		</main>
	);
}
