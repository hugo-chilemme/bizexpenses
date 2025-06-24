"use client";
import { useEffect, useState } from "react";
import { FaRegBuilding, FaUserTie, FaUsers } from "react-icons/fa";
import { MdOutlinePersonAdd } from "react-icons/md";
import { motion } from "framer-motion";
import ApiController from "@/lib/api-controller";
import { useUser } from "@/components/context/User";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {Input} from "@/components/ui/input";
import { toast } from "sonner";


export default function AdminDashboard() {
	const { user } = useUser();
	const [employees, setEmployees] = useState([]);
	const [rhList, setRhList] = useState([]);


	const [newEmployeeFirstName, setNewEmployeeFirstName] = useState("");
	const [newEmployeeLastName, setNewEmployeeLastName] = useState("");
	const [newEmployeeEmail, setNewEmployeeEmail] = useState("");

	useEffect(() => {
		const fetchEmployees = async () => {
			try {
				const response = await ApiController("users", "GET");
				const rhList = response.data.filter(u => u.role === "rh");
				setEmployees(response.data);
				setRhList(rhList);
			} catch (error) {
				console.error("Error fetching employees:", error);
			}
		};

		fetchEmployees();
	}, []);


	async function handleAddEmployee() {

		if (!newEmployeeFirstName || !newEmployeeLastName || !newEmployeeEmail) {
			toast.error("Veuillez remplir tous les champs.");
			return;
		}

		// Vérification du format de l'email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(newEmployeeEmail)) {
			toast.error("Veuillez entrer un email valide.");
			return;
		}

		// Vérification du format du prénom et nom (lettres uniquement, min 2 caractères)
		const nameRegex = /^[a-zA-ZÀ-ÿ' -]{2,}$/;
		if (!nameRegex.test(newEmployeeFirstName) || !nameRegex.test(newEmployeeLastName)) {
			toast.error("Le prénom et le nom doivent contenir au moins 2 lettres et uniquement des caractères valides.");
			return;
		}

		// check if email already exists
		const emailExists = employees.some(emp => emp.email === newEmployeeEmail);
		if (emailExists) {
			toast.error("Un employé avec cet email existe déjà.");
			return;
		}

		const newEmployee = {
			firstName: newEmployeeFirstName,
			lastName: newEmployeeLastName,
			email: newEmployeeEmail,
		};

		try {
			const response = await ApiController("users", "POST", newEmployee);
			if (response.status === "success") {
				setEmployees([...employees, response.data]);
				setNewEmployeeFirstName("");
				setNewEmployeeLastName("");
				setNewEmployeeEmail("");
				toast.success("Employé ajouté avec succès.");
			} else {
				toast.error("Erreur lors de l'ajout de l'employé.");
			}
		} catch (error) {
			console.error("Error adding employee:", error);
			toast.error("Erreur lors de l'ajout de l'employé.");
		}

	}
		

	return (
		<main className="h-full flex flex-col p-8 lg:p-24 justify-start items-start">
			<h1 className="text-4xl text-indigo-600 mt-8 font-bold">
				{user.entreprise?.name}
			</h1>

			<section className="mt-12 w-full">
				<h2 className="text-lg text-indigo-600 font-semibold mb-4">
					Liste des employés
				</h2>
				<div className="w-full overflow-x-auto">
					<table className="min-w-full ">
						<thead>
							<tr>
								<th className="py-3 px-4 text-left">Nom</th>
								<th className="py-3 px-4 text-left">Email</th>
								<th className="py-3 px-4 text-left">Poste</th>
								<th className="py-3 px-4 text-left">Statut</th>
								<th className="py-3 px-4 text-left">Actions</th>
							</tr>
						</thead>
						<tbody>
							{employees.length > 0 ? (
								employees.map((emp) => (
									<tr
										key={emp.id}
										className="border-b text-sm last:border-b-0"
									>
										<td className="py-3 px-4">{emp.firstName} {emp.lastName}</td>
										<td className="py-3 px-4">{emp.email}</td>
										<td className="py-3 px-4">
											<Select
												value={emp.role}
												onValueChange={(value) => {
													// handleRoleChange(value, emp.id)
												}}
											>
												<SelectTrigger className="w-[160px] text-xs shadow-none">
													<SelectValue
														placeholder="Sélectionner un rôle"
														defaultValue={
															emp.role === "user"
																? "Salary"
																: emp.role === "hr"
																? "Human Resource"
																: emp.role === "owner"
																? "Director Human Resources"
																: "—"
														}
													/>
												</SelectTrigger>
												<SelectContent>
													<SelectGroup>
														<SelectLabel>Rôle</SelectLabel>
														<SelectItem value="user" disabled={emp.role === "user"}>
															Salary
														</SelectItem>
														<SelectItem value="hr" disabled={emp.role === "hr"}>
															Human Resource
														</SelectItem>
														<SelectItem value="owner" disabled={emp.role === "owner"}>
															Director Human Resources
														</SelectItem>
													</SelectGroup>
												</SelectContent>
											</Select>
										</td>
										<td className="py-3 px-4">
											{emp.active ? (
												<span className="bg-green-100/50 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
													Actif
												</span>
											) : (
												<span className="bg-gray-100/50 text-gray-500 px-2 py-1 rounded-full text-xs font-semibold">
													Inactif
												</span>
											)}
										</td>
										<td className="py-3 px-4">
											<Link
												href={`/dashboard/admin/employees/${emp.id}`}
												className="text-indigo-700 hover:underline text-xs"
											>
												Gérer
											</Link>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td className="py-4 px-4 text-neutral-500" colSpan={5}>
										Aucun employé enregistré.
									</td>
								</tr>
							)}
						</tbody>
					</table>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<button className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">
								Ajouter un employé
							</button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Ajouter un employé</AlertDialogTitle>
								<AlertDialogDescription>
									Remplissez les informations ci-dessous pour ajouter un nouvel employé.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<form className="space-y-4" id="add-employee-form">
								<div className="flex gap-4">
									<div className="flex-1">
										<label className="block text-sm font-medium mb-1" htmlFor="firstname">
											Prénom
										</label>
										<Input
											id="firstname"
											name="firstname"
											type="text"
											className="w-full"
											value={newEmployeeFirstName}
											onChange={(e) => setNewEmployeeFirstName(e.target.value)}
											required
											placeholder="Entrez le prénom"
										/>
									</div>
									<div className="flex-1">
										<label className="block text-sm font-medium mb-1" htmlFor="lastname">
											Nom
										</label>
										<Input
											id="lastname"
											name="lastname"
											type="text"
											className="w-full"
											value={newEmployeeLastName}
											onChange={(e) => setNewEmployeeLastName(e.target.value)}
											required
											placeholder="Entrez le nom"
										/>
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1" htmlFor="email">
										Email
									</label>
									<input
										id="email"
										name="email"
										type="email"
										value={newEmployeeEmail}
										onChange={(e) => setNewEmployeeEmail(e.target.value)}
										className="w-full border rounded px-3 py-2 text-sm"
										required
										placeholder="Entrez l'email"
									/>
								</div>
							</form>
							<AlertDialogFooter>
								<AlertDialogCancel>Annuler</AlertDialogCancel>
								<AlertDialogAction onClick={handleAddEmployee} form="add-employee-form">
									Ajouter
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</section>

		</main>
	);
}