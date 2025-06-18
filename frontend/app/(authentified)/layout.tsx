"use client";
import AnimatedLogo from "@/components/AnimatedLogo";
import { RxDashboard } from "react-icons/rx";
import { IoSettingsOutline, IoFastFoodOutline } from "react-icons/io5";
import Link from "next/link";

type RenderLinkProps = {
	href: string;
	icon: React.ReactNode;
	label: string;
	active?: boolean;
};

function RenderLink({ href, icon, label, active }: RenderLinkProps) {
	return (
		<Link
			href={href}
			className={`cursor-pointer px-4 font-semibold flex items-center gap-6 py-4 rounded-xl
				${active
					? "text-blue-700 hover:underline bg-blue-100/50"
					: "text-neutral-400 hover:underline hover:text-neutral-600 hover:bg-neutral-300/25"
				}`}
		>
			{active ? (
				<span className="w-1 h-8 bg-blue-500 rounded-full" />
			) : (
				<span className="w-1 h-8 bg-transparent rounded-full" />
			)}
			<div>{icon}</div>
			<div>{label}</div>
		</Link>
	);
}

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<main className="min-h-screen flex justify-between m-4 rounded-2xl">
			<div className="w-96 text-white py-6 flex flex-col justify-between items-center">
				<AnimatedLogo />

				<div className="px-6 my-24 mr-6 flex flex-1 flex-col gap-4 w-full">
					<RenderLink
						href="/dashboard"
						icon={<RxDashboard className="w-6 h-6" />}
						label="Dashboard"
						active={true}
					/>
					<RenderLink
						href="/expenses"
						icon={<IoFastFoodOutline className="w-6 h-6" />}
						label="Historiques des dépenses"
					/>
					<RenderLink
						href="/settings"
						icon={<IoSettingsOutline className="w-6 h-6" />}
						label="Paramètres"
					/>
				</div>

				<div className="text-xs text-gray-300">
					© {new Date().getFullYear()} BizExpenses. All rights reserved.
				</div>
			</div>
			<div className="flex-1 bg-blue-100/50 rounded-2xl">{children}</div>
		</main>
	);
}