import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  return (
    <>
      <Header/>
      <main className="mx-auto flex-1 overflow-hidden min-h-screen bg-gradient-to-tr from-indigo-500 via-sky-400 to-blue-500">{children}</main>
      <Footer/>
    </>
  );
}
