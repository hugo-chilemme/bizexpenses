"use client";
import React, { useState } from "react";
import { useUser } from "@/components/context/User";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import ApiController from "@/lib/api-controller";

const AccountSettingsPage = () => {
	const { user } = useUser();
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);


	async function handleDeleteAccount() {
		if (password.length < 6) {
			toast.error("Le mot de passe doit contenir au moins 6 caractères.");
			return;
		}
		setLoading(true);
		const response: any = await ApiController("@me", "DELETE", {
			password,
		});
		setLoading(false);	

		if (response.status === "error") {
			toast.error(response.error || "Une erreur est survenue.");
			return;
		}

		toast.success("Votre compte a été supprimé avec succès.");
		localStorage.removeItem("authorization");
		localStorage.removeItem("uuid");
		localStorage.removeItem("role");
		window.location.href = "/"; // Rediriger vers la page d'accueil ou de connexion
	}

	return (
		<div className="p-12 md:p-24">
			<h1 className="text-2xl font-bold mb-6">Paramètres du compte</h1>

			<div className="mt-6 bg-white rounded-xl shadow-md border p-8">
				<h3>Mes informations</h3>
				<div className="mt-8 flex justify-between items-center gap-4">
					<div className="flex flex-col gap-2 flex-1">
						<label className="text-xs">Prénom</label>
						<input
							type="text"
							name="firstName"
							disabled
							value={user.firstName}
							className="border rounded-md p-2 w-full text-sm bg-gray-100 cursor-not-allowed"
							placeholder="Prénom"
						/>
					</div>
					<div className="flex flex-col gap-2 flex-1">
						<label className="text-xs">Nom</label>
						<input
							type="text"
							name="lastName"
							disabled
							value={user.lastName}
							className="border rounded-md p-2 w-full text-sm bg-gray-100 cursor-not-allowed"
							placeholder="Nom"
						/>
					</div>
				</div>
				<div className="flex-1">
					<div className="mt-4 flex flex-col gap-2">
						<label className="text-xs">Email</label>
						<input
							type="email"
							name="email"
							disabled
							value={user.email}
							className="border rounded-md p-2 w-full text-sm bg-gray-100 cursor-not-allowed"
							placeholder="Email"
						/>
					</div>
				</div>
				<p className="text-xs text-gray-500 mt-8">
					Vous ne pouvez pas modifier vos informations personnelles, car elles ont été définies par votre entreprise. Si vous avez besoin de les modifier, veuillez contacter votre administrateur.
				</p>
			</div>

			<div className="mt-6 bg-white rounded-xl shadow-md border p-8">
				<h3 className="mb-8">Supprimer mon compte</h3>
				<p className="text-sm text-gray-500 mb-4">
					Attention, cette action est irréversible. Si vous supprimez votre compte, toutes vos données seront perdues.<br/>
					Vous devrez contacter votre administrateur pour réactiver votre compte si vous changez d&apos;avis.
				</p>
				<AlertDialog>
					<AlertDialogTrigger className="bg-red-500 border border-red-500 text-sm text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors">
						Supprimer mon compte
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
							<AlertDialogDescription>
								Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.

								<Input type="password" placeholder="Entrez votre mot de passe pour confirmer" className="mt-4" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
								<br />
								En supprimant votre compte, vous perdrez toutes vos données et ne pourrez plus accéder à votre compte. Si vous changez d&apos;avis, vous devrez contacter votre administrateur pour recréer votre compte.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Annuler</AlertDialogCancel>
							<AlertDialogAction className="bg-red-500 text-white hover:bg-red-600 transition-colors" disabled={password.length < 6 || loading} onClick={handleDeleteAccount}>
								{loading ? <Loader2 className="animate-spin" /> : "Supprimer"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
				
			</div>
		</div>
	);
};

export default AccountSettingsPage;