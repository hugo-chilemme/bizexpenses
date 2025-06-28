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
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [newEmployee, setNewEmployee] = useState(initialEmployee);

	useEffect(() => {
		ApiController("users", "GET")
			.then((response) => setEmployees(response.data))
			.catch((error) => console.error("Error fetching employees:", error));
	}, []);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
	};

	const validateEmployee = () => {
		const { firstName, lastName, email } = newEmployee;
		if (!firstName || !lastName || !email) {
			toast.error("Veuillez remplir tous les champs.");
			return false;
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			toast.error("Veuillez entrer un email valide.");
			return false;
		}
		const nameRegex = /^[a-zA-ZÀ-ÿ' -]{2,}$/;
		if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
			toast.error("Le prénom et le nom doivent contenir au moins 2 lettres et uniquement des caractères valides.");
			return false;
		}
		if (employees.some(emp => emp.email === email)) {
			toast.error("Un employé avec cet email existe déjà.");
			return false;
		}
		return true;
	};

	const handleAddEmployee = async () => {
		if (!validateEmployee()) return;
		try {
			const response = await ApiController("users", "POST", newEmployee);
			if (response.status === "success") {
				setEmployees([...employees, response.data]);
				setNewEmployee(initialEmployee);
				toast.success("Employé ajouté avec succès.");
			} else {
				toast.error("Erreur lors de l'ajout de l'employé.");
			}
		} catch {
			toast.error("Erreur lors de l'ajout de l'employé.");
		}
	};

	const handleDeleteEmployee = async (employeeId: string) => {
		if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) return;
		try {
			const response = await ApiController("users", "DELETE", { userId: employeeId });
			if (response.status === "success") {
				setEmployees(employees.filter(emp => emp.id !== employeeId));
				toast.success("Employé supprimé avec succès.");
			} else {
				toast.error("Erreur lors de la suppression de l'employé.");
			}
		} catch {
			toast.error("Erreur lors de la suppression de l'employé.");
		}
	};

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
					<table className="min-w-full">
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
									<tr key={emp.id} className="border-b text-sm last:border-b-0">
										<td className="py-3 px-4">{emp.firstName} {emp.lastName}</td>
										<td className="py-3 px-4">{emp.email}</td>
										<td className="py-3 px-4">
											{user.entreprise.role === "owner" && emp.role !== "owner" ? (
											<Select
												value={emp.role}
												onValueChange={async (value) => {
													if (value === emp.role) return; // Pas de changement
													const updatedEmployees = employees.map(e =>
														e.id === emp.id ? { ...e, role: value as "user" | "hr" | "owner" } : e
													);

													try {
														const response = await ApiController("users", "PUT", {
															userId: emp.id,
															role: value,
														});
														if (response.status === "success") {
															setEmployees(updatedEmployees);
															toast.success("Rôle mis à jour avec succès.");
														} else {
															toast.error("Erreur lors de la mise à jour du rôle de l'employé.");
														}
													} catch (error) {
														console.error("Error updating employee role:", error);
														toast.error("Erreur lors de la mise à jour du rôle de l'employé.");
													}
												}}
											>
												<SelectTrigger className="w-[220px] border-none text-xs shadow-none">
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
												<SelectContent className="text-xs">
													<SelectGroup>
														<SelectLabel>Rôle</SelectLabel>
														<SelectItem value="user" disabled={emp.role === "user"}>Salary</SelectItem>
														<SelectItem value="hr" disabled={emp.role === "hr"}>Human Resource</SelectItem>
														<SelectItem value="owner" disabled={true}>Director Human Resources</SelectItem>
													</SelectGroup>
												</SelectContent>
											</Select>
											) : (
												<span className="text-xs text-neutral-500">
													{emp.role === "user"
														? "Salary"
														: emp.role === "hr"
														? "Human Resource"
														: emp.role === "owner"
														? "Director Human Resources"
														: "—"}
												</span>
											)}
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
											<button
												onClick={() => handleDeleteEmployee(emp.id)}
												className="text-red-700 hover:underline text-xs"
											>
												Supprimer
											</button>
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
							<form className="space-y-4" id="add-employee-form" onSubmit={e => { e.preventDefault(); handleAddEmployee(); }}>
								<div className="flex gap-4">
									<div className="flex-1">
										<label className="block text-sm font-medium mb-1" htmlFor="firstname">
											Prénom
										</label>
										<Input
											id="firstname"
											name="firstName"
											type="text"
											className="w-full"
											value={newEmployee.firstName}
											onChange={handleInputChange}
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
											name="lastName"
											type="text"
											className="w-full"
											value={newEmployee.lastName}
											onChange={handleInputChange}
											required
											placeholder="Entrez le nom"
										/>
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1" htmlFor="email">
										Email
									</label>
									<Input
										id="email"
										name="email"
										type="email"
										value={newEmployee.email}
										onChange={handleInputChange}
										className="w-full"
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
