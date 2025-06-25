"use client";
import Image from "next/image";
import AnimatedLogo from "@/components/AnimatedLogo";
import TypeWriter from "@/components/animations/TypeWriter";
import { motion } from "framer-motion";
import Link from "next/link";
import { LuChevronRight } from "react-icons/lu";
import { useUser } from "@/components/context/User";


import SalaryDashboard from "./adaptatives/salary";
import AdminDashboard from "./adaptatives/admin";
import HrDashboard from "./adaptatives/rh";

export default function Page() {

	const { user } = useUser();

	return (
		<>
			{ user.entreprise.role === "owner" && <AdminDashboard /> }
			{ user.entreprise.role === "user" && <SalaryDashboard /> }
			{ user.entreprise.role === "hr" && <HrDashboard /> }
		</>
	);
}