"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import AnimatedLogo from "@/components/AnimatedLogo";
import { toast } from "sonner";
import ApiController from "@/lib/api-controller";
import { useRouter } from "next/navigation";


export default function Create({params}: Readonly<{
}>)
{

	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [mailSent, setMailSent] = useState(false);


	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !/\S+@\S+\.\S+/.test(email)) {
			toast.error("Veuillez entrer une adresse e-mail valide.");
			return;
		}	

		const response: any = await ApiController("signin", "PUT", { email });
		if (response.status === "error") {
			console.error("Error during password reset:", response);
			toast.error(response.error || "Erreur lors de la réinitialisation du mot de passe. Veuillez réessayer.");
			setLoading(false);
			return;
		}

		setEmail("");
		setMailSent(true);

	}
	


	if (mailSent) {
		return (
			<main className="min-h-screen flex items-center justify-center">
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, ease: "easeOut" }}
				>
					<Card className={cn("w-[375px] rounded-2xl border-0 bg-white/90 backdrop-blur-lg")}>
						<CardHeader className="flex flex-col items-center gap-2">
							<AnimatedLogo />
							<CardTitle className="text-2xl font-bold text-indigo-700">
								Mot de passe oublié
							</CardTitle>
							<p className="text-sm text-gray-500 text-center">
								Votre demande de réinitialisation de mot de passe a été envoyée. Veuillez vérifier votre email.
							</p>
						</CardHeader>
						<CardContent>
							<Button
								className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-600 transition w-full"
								size="lg"
								onClick={() => router.push("/signin")}
							>
								Réessayer
							</Button>
						</CardContent>
					</Card>
				</motion.div>
			</main>
		);
	}


	return (
		<main className="min-h-screen flex items-center justify-center">
			<motion.div
				initial={{ opacity: 0, y: 40 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7, ease: "easeOut" }}
			>
				<Card className={cn("w-[375px] rounded-2xl border-0 bg-white/90 backdrop-blur-lg")}>
					<CardHeader className="flex flex-col items-center gap-2">
						<AnimatedLogo />
						<CardTitle className="text-2xl font-bold text-indigo-700">
							Mot de passe oublié
						</CardTitle>
						<p className="text-sm text-gray-500 text-center">
							Veuillez saisir votre adresse email pour recevoir un lien de réinitialisation de mot de passe.
						</p>
					</CardHeader>
					<CardContent>
							<form className="flex flex-col gap-4" >
								<div className="flex items-center mb-2">
									<span className="ml-2 text-sm text-gray-600 truncate">
										Veuillez saisir votre adresse email
									</span>
								</div>
								<Input
									type="email"
									placeholder="Email"
									className="bg-white/80"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									disabled={loading}
								/>
								<Button
									type="submit"
									className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-600 transition flex items-center justify-center"
									size="lg"
									onClick={handleSubmit}
									disabled={loading}
								>
									{loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
									Terminer
								</Button>
							</form>


						<div className="mt-4 text-center text-xs text-gray-400">
							© {new Date().getFullYear()} BizExpenses. All rights reserved.
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</main>
	)
}