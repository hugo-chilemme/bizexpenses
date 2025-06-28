"use client";
import { useUser } from "@/components/context/User";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ApiController from "@/lib/api-controller";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CATEGORIES } from "@/types/categories";


export default function Page() {

	const router = useRouter();
	const { user } = useUser();

	const [submitDate, setSubmitDate] = useState(user.entreprise?.rules?.submission_deadline || "");


	return (
		<div className="p-12 md:p-24">
			<h1 className="text-2xl font-bold mb-6">Règles de l&apos;entreprise</h1>
			<div className="mt-6 bg-white rounded-xl flex flex-col gap-2 items-start shadow-md border p-8">
				<h3 className="font-semibold">Dates de soumission des notes de frais</h3>
				<p className="text-sm">Ce système vous permet de collecter les notes de frais de vos employés et de les soumettre à votre comptable à une date précise chaque mois.</p>
				<Input
					type="number"
					name="submissionDeadline"
					placeholder="Date limite de soumission (1-31)"
					className="mt-4 border rounded-md p-2 w-full text-sm"
					value={submitDate}
					onChange={(e) => setSubmitDate(e.target.value)}
				/>
				<Button
					className="mt-4 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
					onClick={async () => {
						if (!submitDate || isNaN(submitDate) || submitDate < 1 || submitDate > 31) {
							toast.error("Veuillez entrer une date valide entre 1 et 31.");
							return;
						}
						try {
							await ApiController("rules", "PUT", { submission_deadline: parseInt(submitDate) });
							toast.success("Date de soumission mise à jour avec succès.");
							router.refresh();
						} catch (error) {
							console.error("Erreur lors de la mise à jour de la date de soumission :", error);
							toast.error("Une erreur est survenue lors de la mise à jour de la date de soumission.");
						}
					}}
				>
					Sauvegarder
				</Button>
			</div>

			<div className="mt-6 bg-white opacity-50 rounded-xl flex flex-col gap-2 items-start shadow-md border p-8" disabled>
				<h3 className="font-semibold">Catégories autorisées</h3>
				<p className="text-sm">Sélectionnez les catégories de dépenses autorisées pour vos employés.</p>
				<div className="mt-4 flex flex-col gap-2 w-full">
					{CATEGORIES.map((category) => (
						<div key={category.id} className="flex items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 justify-between transition-colors w-full">
							<div>
								<input
									type="checkbox"
									id={`category-${category.id}`}
									className="mr-2"
									checked={user.entreprise?.rules?.allowed_categories?.includes(category.toLowerCase()) || false}
									onChange={(e) => {
										const isChecked = e.target.checked;
										setAllowedCategories((prev) =>
											isChecked ? [...prev, category.id] : prev.filter((id) => id !== category.id)
										);
									}}
								/>
								<label htmlFor={`category-${category}`} className="text-sm">
									{category}
								</label>
							</div>
							<div className="flex items-center gap-4">
								<Input
									type="number"	
									className="ml-2 w-48 text-left border-none bg-indigo-200/25 text-indigo-600"
									value={user.entreprise?.rules?.limits?.[category.toLowerCase()] || ""}
									onChange={(e) => {
										const value = parseFloat(e.target.value);
										setMaxExpensePerCategory((prev) => ({
											...prev,
											[category.id]: isNaN(value) ? 0 : value
										}));
									}}
									min={0}
									// Hide the spin buttons
									inputMode="decimal"
									pattern="[0-9]*"
									onWheel={(e) => e.currentTarget.blur()}
								/>
							{" €"}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}