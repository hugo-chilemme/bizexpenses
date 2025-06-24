
export default function Footer() {
	return (
		<footer className="bg-white h-64 flex flex-col items-center justify-center">
			<div className="container mx-auto flex flex-col gap-4 ">
				<p className="text-6xl text-indigo-500 font-semibold">BizExpenses</p>
				<p className="text-gray-400">
					<a href="/privacy-policy" className="text-indigo-500 hover:underline">Privacy Policy</a> | 
					<a href="/terms-of-service" className="text-indigo-500 hover:underline"> Terms of Service</a>
				</p>
			</div>
		</footer>
	);
}