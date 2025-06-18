"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import AnimatedLogo from "@/components/AnimatedLogo";
import { toast } from 'sonner';

export default function Page() {
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [step, setStep] = useState<"email" | "password">("email");

	const handleEmailSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		// fake wait to simulate async validation
		await new Promise((resolve) => setTimeout(resolve, 2500));
		setLoading(false);

		if (!email || !/\S+@\S+\.\S+/.test(email)) {
			toast.error("Veuillez entrer une adresse e-mail valide.");
			return;
		}

		const disallowedEmailsDomain = ["gmail.com", "yahoo.com", "hotmail.com"];
		const emailDomain = email.split("@")[1];
		if (disallowedEmailsDomain.includes(emailDomain)) {
			toast.error("Veuillez utiliser une adresse e-mail professionnelle.");
			return;
		}

		setTimeout(() => {
			setStep("password");
		}, 1000);
	};

	const handlePasswordSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!password) {
			toast.error("Veuillez entrer votre mot de passe.");
			return;
		}
		setLoading(true);
		// Simulate async login
		setTimeout(() => {
			setLoading(false);
			toast.success("Connexion réussie !");
			// Rediriger ou autre logique ici
		}, 1500);
	};

	return (
		<main className="min-h-screen flex items-center justify-center ">
			<motion.div
				initial={{ opacity: 0, y: 40 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7, ease: "easeOut" }}
			>
				<Card className={cn("w-[375px] rounded-2xl border-0 bg-white/90 backdrop-blur-lg")}>
					<CardHeader className="flex flex-col items-center gap-2">
						<AnimatedLogo />
						<CardTitle className="text-2xl font-bold text-indigo-700">
							Bon retour !
						</CardTitle>
						<p className="text-sm text-gray-500 text-center">
							Connectez vous à votre compte pour continuer
						</p>
					</CardHeader>
					<CardContent>
						{step === "email" ? (
							<form className="flex flex-col gap-4" onSubmit={handleEmailSubmit}>
								<Input
									type="email"
									placeholder="Email"
									className="bg-white/80"
									autoFocus
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									disabled={loading}
								/>
								<Button
									type="submit"
									className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-600 transition flex items-center justify-center"
									size="lg"
									disabled={loading}
								>
									{ loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
									Suivant
								</Button>
							</form>
						) : (
							<form className="flex flex-col gap-4" onSubmit={handlePasswordSubmit}>
								<div className="flex items-center bg-indigo-500/5 rounded-lg p-0.5 border mb-2">
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => setStep("email")}
										disabled={loading}
									>
										<ArrowLeft className="w-4 h-4" />
									</Button>
									<span className="text-sm text-gray-600 truncate">{email}</span>
								</div>
								<Input
									type="password"
									placeholder="Mot de passe"
									className="bg-white/80"
									autoFocus
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={loading}
								/>
								<Button
									type="submit"
									className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-600 transition flex items-center justify-center"
									size="lg"
									disabled={loading}
								>
									{ loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
									Se connecter
								</Button>
							</form>
						)}
						<div className="mt-4 text-center text-xs text-gray-400">
							© {new Date().getFullYear()} BizExpenses. All rights reserved.
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</main>
	);
}