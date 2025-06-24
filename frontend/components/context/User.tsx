"use client";
import React, { createContext, useState, useContext, useEffect } from 'react';
import ApiController from '@/lib/api-controller';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UserContextType {
        uuid?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        role?: string;
        [key: string]: any;
}

const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps {
	children: React.ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<UserContextType | null>(null);

        function logout() {
                localStorage.removeItem("authorization");
                localStorage.removeItem("uuid");
                localStorage.removeItem("role");
                setUser(null);
                toast.success("Vous avez été déconnecté avec succès.");
                router.push("/"); // Rediriger vers la page de connexion
        }
	

	useEffect(() => {
		const fetchUser = async () => {
			if (localStorage.getItem("authorization") === null) {
				return setLoading(false);
			}

                        const response = await ApiController("users/me", "GET");
			if (response.status === "success") {
				console.log("User data fetched successfully:", response.data);
				setUser(response.data);
			}
			setLoading(false);
		};
		fetchUser();
	}, []);

	if (loading) {
		return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
	}

	return (
		<UserContext.Provider value={{ user, logout }}>
			{children}
		</UserContext.Provider>
	);
};

export const useUser = () => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
};
