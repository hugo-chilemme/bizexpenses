"use client";
import AnimatedLogo from "@/components/AnimatedLogo";
import { RxDashboard } from "react-icons/rx";
import { IoSettingsOutline, IoFastFoodOutline } from "react-icons/io5";
import { HiMenu, HiX } from "react-icons/hi";
import Link from "next/link";
import { useUser } from "@/components/context/User";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { FaTachometerAlt, FaCog, FaUtensils, FaUsers, FaGavel } from "react-icons/fa";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type RenderLinkProps = {
	href: string;
	icon: React.ReactNode;
	label: string;
	active?: boolean;
	onClick?: () => void;
};

function RenderLink({ href, icon, label, onClick }: RenderLinkProps) {
	const pathname = usePathname();
	const active = (pathname === "/dashboard" && href === "/")  || pathname.endsWith(href);
	
	console.log("Active link:", active, "Current path:", pathname, "Link href:", href);


	return (
		<Link
			href={'/dashboard' + href}
			onClick={onClick}
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
	const router = useRouter();
	const { user, logout } = useUser();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	if (!user) {
		router.push("/signin");
		return null;
	}

	const navSalary = (
		<>
			<RenderLink
				href="/"
				icon={<RxDashboard className="w-6 h-6" />}
				label="Dashboard"
				onClick={() => setMobileMenuOpen(false)}
			/>
			<RenderLink
				href="/expenses"
				icon={<IoFastFoodOutline className="w-6 h-6" />}
				label="Historiques des dépenses"
				onClick={() => setMobileMenuOpen(false)}
			/>
			<RenderLink
				href="/settings"
				icon={<IoSettingsOutline className="w-6 h-6" />}
				label="Paramètres"
				onClick={() => setMobileMenuOpen(false)}
			/>
		</>
	);

	const navLinks = (
		<>
			<RenderLink
				href="/"
				icon={<RxDashboard className="w-6 h-6" />}
				label="Dashboard"
				onClick={() => setMobileMenuOpen(false)}
			/>
			<RenderLink
				href="/expenses/pending"
				icon={<IoFastFoodOutline className="w-6 h-6" />}
				label="Notes de frais en attente"
				onClick={() => setMobileMenuOpen(false)}
			/>
			<RenderLink
				href="/users"
				icon={<FaUsers className="w-6 h-6" />}
				label="Gestion des employés"	
				onClick={() => setMobileMenuOpen(false)}
			/>
			<RenderLink
				href="/expenses"
				icon={<FaUtensils className="w-6 h-6" />}
				label="Mes notes de frais"
				onClick={() => setMobileMenuOpen(false)}
			/>
			<RenderLink
				href="/rules"
				icon={<FaGavel className="w-6 h-6" />}
				label="Règles de l'entreprise"
				onClick={() => setMobileMenuOpen(false)}
			/>
			<RenderLink
				href="/settings"
				icon={<FaCog className="w-6 h-6" />}
				label="Paramètres"
				onClick={() => setMobileMenuOpen(false)}
			/>
		</>
	);

	const navAdmin = (
		<>
			<RenderLink
				href="/"
				icon={<RxDashboard className="w-6 h-6" />}
				label="Dashboard"
				onClick={() => setMobileMenuOpen(false)}
			/>
			<RenderLink
				href="/users"
				icon={<IoFastFoodOutline className="w-6 h-6" />}
				label="Gestion des employés"
				onClick={() => setMobileMenuOpen(false)}
			/>
			<RenderLink
				href="/rules"
				icon={<IoFastFoodOutline className="w-6 h-6" />}
				label="Règles de l'entreprise"
				onClick={() => setMobileMenuOpen(false)}
			/>
			<RenderLink
				href="/settings"
				icon={<IoSettingsOutline className="w-6 h-6" />}
				label="Paramètres"
				onClick={() => setMobileMenuOpen(false)}	
			/>
		</>
	);

	const userMenu = (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<div className="flex gap-4 items-center w-full mb-4 hover:bg-blue-500/10 p-4 rounded-2xl transition-colors cursor-pointer">
					<div className="border h-12 w-12 rounded-full border-white text-lg font-medium text-white hover:bg-gray-100/10 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-600">
						{user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase()}
					</div>
					<div className="flex flex-col gap-1">
						<span className="text-indigo-800 text-sm font-semibold">
							{user.firstName} {user.lastName}
						</span>
						<p className="text-xs text-neutral-500">
							{user.email}
						</p>
					</div>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<DropdownMenuLabel>Mon compte</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link href="/settings">
							Paramètres
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={logout} className="text-red-600 hover:bg-red-50 focus:bg-red-50">
						Se déconnecter
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);

	return (
		<main className="min-h-screen flex flex-col md:flex-row m-2 md:m-4 rounded-2xl">
			{/* Mobile Navbar */}
			<nav className="md:hidden flex flex-col w-full bg-white rounded-2xl shadow px-4 py-2 z-20">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<AnimatedLogo width={5} />
					</div>
					<button
						className="p-2"
						onClick={() => setMobileMenuOpen((open) => !open)}
						aria-label="Ouvrir le menu"
					>
						{mobileMenuOpen ? <HiX className="w-7 h-7" /> : <HiMenu className="w-7 h-7" />}
					</button>
				</div>
				{mobileMenuOpen && (
					<div className="flex flex-col gap-2 mt-2">
						{user.entreprise.role === "user" && navSalary}
						{user.entreprise.role === "hr" && navLinks}
						{user.entreprise.role === "owner" && navAdmin}

						{userMenu}
					</div>
				)}
			</nav>

			{/* Desktop Sidebar */}
			<aside className="fixed top-0 hidden md:flex w-96 text-white h-screen py-6 flex-col justify-start items-start pr-6">
				<div className="flex items-center w-full justify-center gap-4 px-6">
					<AnimatedLogo />
				</div>
				<div className="px-6 my-12 mr-6 flex flex-1 flex-col gap-4 w-full">
					<Link href="/dashboard/expenses/new" className="font-medium bg-indigo-500 p-3 text-white rounded-2xl flex items-center justify-center mb-6 hover:bg-indigo-600 transition-colors">
						Soumettre mes notes de frais
					</Link>
					{user.entreprise.role === "user" && navSalary}
					{user.entreprise.role === "hr" && navLinks}
					{user.entreprise.role === "owner" && navAdmin}
				</div>
				{userMenu}
			</aside>

			{/* Main Content */}
			<div className="w-96 hidden md:flex" />
			<div className="flex-1 bg-blue-100/50 rounded-2xl p-2 md:p-0">{children}</div>
		</main>
	);
}