"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import AnimatedLogo from "@/components/AnimatedLogo";
import { toast } from "sonner";
import ApiController from "@/lib/api-controller";
import { useRouter } from "next/navigation";
import { getDeviceInfo } from "@/lib/utils";

type Step = "companyName" | "companySize" | "userName" | "userEmail" | "done";


const companySizes = [
	"1-10",
	"11-50",
	"51-200",
	"201-500",
	"501-1000",
	"1001+",
];

export default function Page() {

	const router = useRouter();

	const [step, setStep] = useState<Step>("companyName");
	const [loading, setLoading] = useState(false);
	const [errorId, setErrorId] = useState<string | null>(null);

	const [companyName, setCompanyName] = useState("");
	const [companySize, setCompanySize] = useState("");
	const [userFirstName, setUserFirstName] = useState("");
	const [userLastName, setUserLastName] = useState("");
	const [userEmail, setUserEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleCompanyName = (e: React.FormEvent) => {
		e.preventDefault();
		if (!companyName.trim()) {
			toast.error("Veuillez entrer le nom de votre entreprise.");
			return;
		}
		setStep("companySize");
	};

	const handleCompanySize = (e: React.FormEvent) => {
		e.preventDefault();
		if (!companySize) {
			toast.error("Veuillez sélectionner la taille de votre entreprise.");
			return;
		}
		setStep("userName");
	};

	const handleUserName = (e: React.FormEvent) => {
		e.preventDefault();
		if (!userFirstName.trim() || !userLastName.trim()) {
			toast.error("Veuillez entrer votre prénom et nom.");
			return;
		}
		setStep("userEmail");
	};

	const handleUserEmail = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!userEmail || !/\S+@\S+\.\S+/.test(userEmail)) {
			toast.error("Veuillez entrer une adresse e-mail valide.");
			return;
		}

		if (!password || password.length < 6) {
			toast.error("Le mot de passe doit contenir au moins 6 caractères.");
			return;
		}
		

		const { userAgent, platform, language, deviceId } = getDeviceInfo();

		
		setLoading(true);
		// Simulate async
		const response: any = await ApiController("signup", "POST", {
			companyName,
			companySize,	
			firstName: userFirstName,
			lastName: userLastName,
			email: userEmail,
			password,
			userAgent,
			platform,
			language,
			deviceId,
		});

		setLoading(false);
		if (response.status === "error") {
			toast.error(response.error || "Une erreur est survenue lors de l'inscription.");
			setErrorId(response.errorId || "unknown_error");
			return;
		}

		setStep("done");
		toast.success("Inscription réussie !");


		localStorage.setItem("authorization", response.data.authorization);
		localStorage.setItem("uuid", response.data.user.uuid);
		if (response.data.user.role) {
			localStorage.setItem("role", response.data.user.role);
		}

		router.push(`/dashboard`);
	};

	const handleBack = () => {
		if (step === "companySize") setStep("companyName");
		else if (step === "userName") setStep("companySize");
		else if (step === "userEmail") setStep("userName");
	};

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
							Inscription
						</CardTitle>
						<p className="text-sm text-gray-500 text-center">
							Créez votre compte BizExpenses
						</p>
					</CardHeader>
					<CardContent>
						{step === "companyName" && (
							<form className="flex flex-col gap-4" onSubmit={handleCompanyName}>
								<Input
									type="text"
									placeholder="Nom de l'entreprise"
									className="bg-white/80"
									autoFocus
									value={companyName}
									onChange={(e) => setCompanyName(e.target.value)}
									disabled={loading}
								/>
								<Button
									type="submit"
									className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-600 transition flex items-center justify-center"
									size="lg"
									disabled={loading}
								>
									{loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
									Suivant
								</Button>
							</form>
						)}

						{step === "companySize" && (
							<form className="flex flex-col gap-4" onSubmit={handleCompanySize}>
								<div className="flex items-center mb-2">
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={handleBack}
										disabled={loading}
									>
										<ArrowLeft className="w-4 h-4" />
									</Button>
									<span className="ml-2 text-sm text-gray-600 truncate">{companyName}</span>
								</div>
								<select
									className="bg-white/80 text-sm border rounded-lg p-2"
									value={companySize}
									onChange={(e) => setCompanySize(e.target.value)}
									disabled={loading}
									autoFocus
								>
									<option value="">Taille de l&apos;entreprise</option>
									{companySizes.map((size) => (
										<option key={size} value={size}>{size} employés</option>
									))}
								</select>
								<Button
									type="submit"
									className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-600 transition flex items-center justify-center"
									size="lg"
									disabled={loading}
								>
									{loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
									Suivant
								</Button>
							</form>
						)}

						{step === "userName" && (
							<form className="flex flex-col gap-4" onSubmit={handleUserName}>
								<div className="flex items-center mb-2">
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={handleBack}
										disabled={loading}
									>
										<ArrowLeft className="w-4 h-4" />
									</Button>
									<span className="ml-2 text-sm text-gray-600 truncate">
										{companyName} • {companySize} employés
									</span>
								</div>
								<Input
									type="text"
									placeholder="Prénom"
									className="bg-white/80"
									autoFocus
									value={userFirstName}
									onChange={(e) => setUserFirstName(e.target.value)}
									disabled={loading}
								/>
								<Input
									type="text"
									placeholder="Nom"
									className="bg-white/80"
									value={userLastName}
									onChange={(e) => setUserLastName(e.target.value)}
									disabled={loading}
								/>
								<Button
									type="submit"
									className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-600 transition flex items-center justify-center"
									size="lg"
									disabled={loading}
								>
									{loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
									Suivant
								</Button>
							</form>
						)}

						{step === "userEmail" && (
							<form className="flex flex-col gap-4" onSubmit={handleUserEmail}>
								<div className="flex items-center mb-2">
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={handleBack}
										disabled={loading}
									>
										<ArrowLeft className="w-4 h-4" />
									</Button>
									<span className="ml-2 text-sm text-gray-600 truncate">
										{userFirstName} {userLastName}
									</span>
								</div>
								<Input
									type="email"
									placeholder="Adresse e-mail professionnelle"
									className="bg-white/80"
									autoFocus
									value={userEmail}
									onChange={(e) => setUserEmail(e.target.value)}
									disabled={loading}
								/>
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
									disabled={loading}
								>
									{loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
									Terminer
								</Button>
							</form>
						)}

						{step === "done" && (
							<div className="flex flex-col items-center gap-4 py-8">
								<Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
							</div>
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