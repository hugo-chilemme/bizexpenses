"use client";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ApiController from "@/lib/api-controller";
import { useUser } from "@/components/context/User";

type Employee = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: "user" | "hr" | "owner";
	active: boolean;
};

const initialEmployee = { firstName: "", lastName: "", email: "" };

export default function AdminDashboard() {
	const { user } = useUser();


	return (
		<main className="h-full flex flex-col p-8 lg:p-24 justify-start items-start">
			<h1 className="text-4xl text-indigo-600 mt-8 font-bold">
				{user.entreprise?.name}
			</h1>
			<section className="mt-12 w-full">
				
			</section>
		</main>
	);
}
