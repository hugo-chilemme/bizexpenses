"use client";
import Image from "next/image";
import AnimatedLogo from "@/components/AnimatedLogo";
import TypeWriter from "@/components/animations/TypeWriter";
import { motion } from "framer-motion";
import Link from "next/link";
import { LuChevronRight } from "react-icons/lu";
import { useUser } from "@/components/context/User";

export default function Page() {

	const { user } = useUser();

	return (
		<main className="h-full flex flex-col p-8 lg:p-24 justify-start items-start">
			<h1 className="text-4xl text-indigo-600 mt-8 font-bold">Bonjour {user.firstName} 👋</h1>
			<div className="text-neutral-800 text-sm inline-flex w-auto gap-6 items-center mt-12 bg-indigo-400/5 rounded-3xl p-6 pr-12">
				<AnimatedLogo width={5}/>
				<div className="flex flex-col items-start">
					<TypeWriter text={`Bonjour ${user.firstName}, pensez à soumettre vos notes de frais avant le 30, je vous transmet un lien pour le faire.`}>
						<motion.div
							initial={{ opacity: 0, x: -25 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: 0.5 }}
							className="w-full mt-2"
						>
							<Link href="/dashboard/expenses/new" className="text-indigo-700 font-semibold hover:underline">
								Envoyer mes notes de frais <LuChevronRight className="inline-block w-4 h-4 ml-1" />
							</Link>
						</motion.div>
					</TypeWriter>

					
				</div>
			</div>


			<div className="mt-12 w-full">
				<h2 className="text-lg text-indigo-800 font-semibold mb-4">Vos dernières notes de frais</h2>
				<div className="flex flex-col w-full gap-4">
					<div className="bg-indigo-400/5 p-6 rounded-lg flex items-center gap-6">
						<h4 className="font-semibold">Déplacement professionnel</h4>
						<p className="text-sm text-gray-600">Date : 15/10/2023</p>
						<p className="text-sm text-gray-600">Montant : 150,00 €</p>
						<span className="ml-auto px-3 py-1 rounded-full bg-neutral-200 text-neutral-800 text-xs font-bold">EN ATTENTE</span>
					</div>
					<div className="bg-indigo-400/5 p-6 rounded-lg flex items-center gap-6">
						<h4 className="font-semibold">Déjeuner client</h4>
						<p className="text-sm text-gray-600">Date : 12/10/2023</p>
						<p className="text-sm text-gray-600">Montant : 45,50 €</p>
						<span className="ml-auto px-3 py-1 rounded-full bg-neutral-200 text-neutral-800 text-xs font-bold">EN ATTENTE</span>
					</div>
					<div className="bg-indigo-400/5 p-6 rounded-lg flex items-center gap-6">
						<h4 className="font-semibold">Achat fournitures</h4>
						<p className="text-sm text-gray-600">Date : 10/10/2023</p>
						<p className="text-sm text-gray-600">Montant : 32,90 €</p>
						<span className="ml-auto px-3 py-1 rounded-full bg-neutral-200 text-neutral-800 text-xs font-bold">EN ATTENTE</span>
					</div>
				</div>
			</div>
		</main>
	);
}