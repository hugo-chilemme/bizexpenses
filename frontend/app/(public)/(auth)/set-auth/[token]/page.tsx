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
	params: { token: string };
}>)
{

	const router = useRouter();
	const token = params.token;

	const [loading, setLoading] = useState(true);
	const [password, setPassword] = useState("");
	const [userFirstName, setUserFirstName] = useState("");
	const [uuid, setUuid] = useState("");




	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await ApiController(`signup`, "GET", { resettoken: token });
				if (response.status === "success") {
					setUserFirstName(response.data.firstName);
					setLoading(false);
					setUuid(response.data.uuid);
				} else {
					toast.error("Utilisateur non trouvé ou erreur lors de la récupération des informations.");
				}
			} catch (error) {
				toast.error("Erreur lors de la récupération des informations utilisateur.");
			}
		};
		fetchUser();
	}, [token, router]);


	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!password) {
			toast.error("Veuillez entrer un mot de passe.");
			return;
		}

		setLoading(true);
		try {
			const response = await ApiController(`signup`, "PUT", {
				resettoken: token,
				password,
			});

			if (response.status === "success") {
				toast.success("Compte créé avec succès !");

				localStorage.setItem("authorization", response.authorization);
                localStorage.setItem("uuid", response.user.uuid);
                if (response.user.role) {
					localStorage.setItem("role", response.user.role);
                }
				router.push("/dashboard");
			} else {
				toast.error(response.message || "Erreur lors de la création du compte.");
			}
		} catch (error) {
			toast.error("Erreur lors de la création du compte.");
		} finally {
			setLoading(false);
		}
	};

	if (!token) {
		return <div className="text-red-500">Aucun utilisateur trouvé</div>;
	}


	if (loading)
	{
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
								Finalisation
							</CardTitle>
							<p className="text-sm text-gray-500 text-center">
								Nous finalisons la création de votre compte, veuillez patienter...
							</p>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-center h-32">
								<Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</main>
		)
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
							Définir votre mot de passe
						</CardTitle>
						<p className="text-sm text-gray-500 text-center">
							Veuillez définir un mot de passe pour finaliser la création de votre compte.
						</p>
					</CardHeader>
					<CardContent>
							<form className="flex flex-col gap-4" >
								<div className="flex items-center mb-2">
									<span className="ml-2 text-sm text-gray-600 truncate">
										{userFirstName}, définissez votre mot de passe
									</span>
								</div>
								<Input
									type="password"
									placeholder="Mot de passe"
									className="bg-white/80"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
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