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

import { GoDeviceDesktop } from "react-icons/go";

export default function Create({params}: Readonly<{
}>)
{

	const router = useRouter();
	const uuid = localStorage.getItem("uuid") || params.uuid;
	const deviceId = localStorage.getItem("deviceId") || "unknown-device";
	const token = localStorage.getItem("authorization")?.split(" ")[1] || "";

	useEffect(() => {


		const verifyTwoFactor = async () => {
			const response: any = await ApiController("signin/two-factor", "POST", {
				uuid: uuid || params.uuid,
				deviceId: deviceId || "unknown-device",
				token: token || "",
			});

			console.log("Response from two-factor verification:", response);

			if (response.status === "success") {
				toast.success("Identité vérifiée avec succès !");
				router.push(`/dashboard`);
			} else {
			}
		};

		verifyTwoFactor();

		const interval = setInterval(() => {
			verifyTwoFactor();
		}, 5000); // Vérification toutes les 5 secondes
	}, [params.uuid, router]);




	return (
		<main className="min-h-screen flex items-center justify-center">
			<motion.div
				initial={{ opacity: 0, y: 40 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7, ease: "easeOut" }}
			>
				<Card className={cn("w-[575px] rounded-2xl border-0 py-12 bg-white/90 shadow-none")}>
					<CardHeader className="flex flex-col items-center gap-6">
						<GoDeviceDesktop className="w-16 h-16 text-indigo-500" />
						<CardTitle className="text-2xl text-center font-bold text-indigo-700 text-balance">
							Veuillez ouvrir votre messagerie pour valider votre identité
						</CardTitle>
						<p className="text-gray-500 text-center text-balance">
							Cette étape survient dés qu'un appareil ou une localisation inhabituelle est détectée.
						</p>

						<div>
							<Loader2 className="w-6 h-6 animate-spin mt-8" />
						</div>
					</CardHeader>
					<CardContent>
							
					</CardContent>
				</Card>
			</motion.div>
		</main>
	)
}