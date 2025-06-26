"use client";
import Link from "next/link";
import AnimatedLogo from "@/components/AnimatedLogo";
import { useUser } from "@/components/context/User";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {

	const { user, logout } = useUser();

	return (
		<header className="fixed top-0 h-32 container text-sm mx-auto left-0 right-0 flex items-center justify-between px-4 z-50">
			<div>
				<Link href="/" className="text-xl md:text-3xl font-semibold text-white flex items-center gap-6">
					<AnimatedLogo width={6} />
					<span className="hidden md:inline">BizExpenses</span>
				</Link>
			</div>
			<div className="flex items-center gap-4">
				{ user ? (
					<>
						<Link href="/dashboard" className="border px-6 py-2 rounded-full border-white text-lg font-medium text-white hover:bg-gray-100/10">
							Tableau de bord
						</Link>
						<DropdownMenu>
							<DropdownMenuTrigger className="border h-12 w-12 rounded-full border-white text-lg font-medium text-white hover:bg-gray-100/10 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-600">
								{user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase()}
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem>
									<Link href="/dashboard/profile">Profil</Link>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Link href="/dashboard/settings">Paramètres</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem className="text-red-600 hover:bg-red-50 focus:bg-red-50" onClick={logout}>
										Se déconnecter
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</>
				) : (
					<>
						<Link href="/signup" className="border px-6 py-2 rounded-full border-white text-lg text-indigo-500 bg-white font-medium hover:bg-gray-100">
							Commencer
						</Link>
						<Link href="/signin" className="border px-6 py-2 rounded-full border-white text-lg font-medium text-white hover:bg-gray-100/10">
							Se connecter
						</Link>
					</>
				)}
			</div>
		</header>
	);
}