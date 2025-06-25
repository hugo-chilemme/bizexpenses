"use client";
import React, { useState } from "react";

const AccountSettingsPage = () => {
	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
	});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);
		// Simulate API call
		setTimeout(() => {
			setLoading(false);
			setSuccess(true);
		}, 1200);
	};

	return (
		<div className="max-w-xl mx-auto py-10 px-4">
			<h1 className="text-3xl font-bold mb-8">Paramètres du compte</h1>
			<p className="mb-8 text-gray-600">
				Gérez vos informations personnelles et la sécurité de votre compte.
			</p>
			<form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
				<div>
					<label className="block text-sm font-medium mb-1" htmlFor="name">
						Nom complet
					</label>
					<input
						id="name"
						name="name"
						type="text"
						autoComplete="name"
						className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Votre nom"
						value={form.name}
						onChange={handleChange}
					/>
				</div>
				<div>
					<label className="block text-sm font-medium mb-1" htmlFor="email">
						Adresse email
					</label>
					<input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Votre email"
						value={form.email}
						onChange={handleChange}
					/>
					<p className="text-xs text-gray-500 mt-1">
						Nous n'utiliserons jamais votre email à des fins commerciales.
					</p>
				</div>
				<div>
					<label className="block text-sm font-medium mb-1" htmlFor="password">
						Nouveau mot de passe
					</label>
					<input
						id="password"
						name="password"
						type="password"
						autoComplete="new-password"
						className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Nouveau mot de passe"
						value={form.password}
						onChange={handleChange}
					/>
					<p className="text-xs text-gray-500 mt-1">
						Laissez vide pour ne pas changer le mot de passe.
					</p>
				</div>
				{error && (
					<div className="text-red-600 text-sm">{error}</div>
				)}
				{success && (
					<div className="text-green-600 text-sm">
						Modifications enregistrées avec succès !
					</div>
				)}
				<button
					type="submit"
					disabled={loading}
					className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition ${
						loading ? "opacity-60 cursor-not-allowed" : ""
					}`}
				>
					{loading ? "Enregistrement..." : "Enregistrer les modifications"}
				</button>
			</form>
			<div className="mt-10 border-t pt-8">
				<h2 className="text-lg font-semibold mb-2">Sécurité du compte</h2>
				<ul className="text-sm text-gray-600 space-y-1">
					<li>
						<strong>Dernière connexion :</strong> il y a 2 jours
					</li>
					<li>
						<strong>Authentification à deux facteurs :</strong> <span className="text-green-600">Activée</span>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default AccountSettingsPage;