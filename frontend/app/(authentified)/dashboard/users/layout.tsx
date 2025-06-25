"use client";
import { useUser } from "@/components/context/User";
import { useRouter } from "next/navigation";



export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const router = useRouter();
	const { user } = useUser();

	console.log(user);
	if (!user || (user.entreprise.role !== "owner" && user.entreprise.role !== "hr")) {
		toast.error("Vous n'avez pas accès à cette page.");
		return router.push("/dashboard");
	}


	return (
		<>
			{children}
		</>
	);
}