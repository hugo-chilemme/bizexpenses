


export const CATEGORIES = [
	"Transports",
	"Restauration",
	"Hotel",
	"Fournitures",
	"Alcools",
	"Autres",
] as const;


export const FAKE_PRODUCTS_BY_CATEGORY = {
	Transports: [
		{ name: "Uber", price: 18 },
		{ name: "Taxi Parisien", price: 22 },
		{ name: "Billet de Train SNCF", price: 45 },
		{ name: "Ticket de Bus RATP", price: 2 },
		{ name: "Vol Air France", price: 120 },
	],
	Restauration: [
		{ name: "Espresso", price: 2 },
		{ name: "Menu Burger", price: 12 },
		{ name: "Sandwich Jambon", price: 5 },
		{ name: "Salade César", price: 10 },
		{ name: "Plat du Jour", price: 15 },
	],
	Hotel: [
		{ name: "Nuitée Hotel Luxe", price: 180 },
		{ name: "Nuitée Hotel Standard", price: 90 },
		{ name: "Nuitée Hotel Economique", price: 55 },
		{ name: "Airbnb Studio", price: 70 },
		{ name: "Chambre d'hôte", price: 60 },
	],
	Fournitures: [
		{ name: "Bloc-notes", price: 3 },
		{ name: "Stylo Bille", price: 1 },
		{ name: "Clé USB 32Go", price: 12 },
		{ name: "Cartouche d'encre", price: 25 },
		{ name: "Cahier", price: 2 },
	],
	Alcools: [
		{ name: "Bière pression", price: 6 },
		{ name: "Verre de vin", price: 7 },
		{ name: "Cocktail", price: 10 },
		{ name: "Bouteille de champagne", price: 45 },
		{ name: "Whisky", price: 9 },
	],
	Autres: [
		{ name: "Frais de parking", price: 8 },
		{ name: "Frais de photocopie", price: 3 },
		{ name: "Frais de téléphone", price: 15 },
		{ name: "Frais de représentation", price: 25 },
		{ name: "Frais de livraison", price: 5 },
	],
} as const;


export const DEFAULT_RULES = {
	maxExpense: 80,
	allowedCategories: ["Transports", "Restauration", "Hotel"],
	maxExpensePerCategory: {
		Transports: 50,
		Restauration: 30,
		Hotel: 100,
		Fournitures: 20,
		Alcools: 20,
		Autres: 20,
	},
};