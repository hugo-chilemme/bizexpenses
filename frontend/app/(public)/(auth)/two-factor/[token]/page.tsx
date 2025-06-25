"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";
import AnimatedLogo from "@/components/AnimatedLogo";
import { toast } from "sonner";
import ApiController from "@/lib/api-controller";
import { useRouter } from "next/navigation";

export default function Page({ params }: Readonly<{ params: { token: string } }>) {
	const router = useRouter();
	const token = params.token || "";
	const [isConfirmed, setIsConfirmed] = useState(false);

	useEffect(() => {
		const verifyTwoFactor = async () => {
			const response: any = await ApiController("signin/two-factor", "PUT", {
				token: token,
			});

			if (response.status === "success") {
				toast.success("Identité vérifiée avec succès !");
				setIsConfirmed(true);
			} else {
				toast.error(response.error || "Une erreur est survenue.");
			}
		};

		verifyTwoFactor();
	}, []);

	return (
		<main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100">
			{ !isConfirmed ? (
				<Loader2 className="animate-spin text-indigo-600 mt-6 w-10 h-10" />
			) : (
				<>
				<AnimatedLogo className="w-16 h-16 mb-4" />
				<h1 className="text-2xl font-bold text-indigo-700 mt-4 mb-4">Vérification réussie</h1>
				<p>Vous pouvez fermer cette page.</p>
			</>
			)}
		</main>
	);
}