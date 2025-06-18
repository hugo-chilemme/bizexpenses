"use client";
import Image from "next/image";
import AnimatedLogo from "@/components/AnimatedLogo";
import TypeWriter from "@/components/animations/TypeWriter";
import { motion } from "framer-motion";
import Link from "next/link";
import { LuChevronRight } from "react-icons/lu";

export default function Page() {
	return (
		<main className="h-full flex flex-col p-24 justify-start items-start">
			<h1 className="text-4xl text-indigo-600 mt-8 font-bold">Bonjour John 👋</h1>
			<div className="text-neutral-800 text-sm inline-flex w-auto gap-6 items-center mt-12 bg-indigo-400/5 rounded-3xl p-6 pr-12">
				<AnimatedLogo width={5}/>
				<div className="flex flex-col items-start">
					<TypeWriter text={"Comment allez-vous John ? N'oubliez pas de soumettre vos notes de frais, vous avez jusqu'au 30 du mois pour le faire !"}/>
					<motion.div
						initial={{ opacity: 0, x: -25 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 3.5, duration: 0.5 }}
						className="w-full mt-1"
					>
						<Link href="/dashboard/expenses/new" className="text-blue-700 hover:underline mt-2">
							Envoyer mes notes de frais <LuChevronRight className="inline-block w-4 h-4 ml-1" />
						</Link>
					</motion.div>
				</div>
			</div>


			<div className="mt-12">
				<h2 className="text-lg text-indigo-800 font-semibold mb-4">Vos dernières notes de frais</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{/* Map through your expense items here */}
				</div>
			</div>
		</main>
	);
}