import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Lexend_Deca as FontSans } from "next/font/google";
import { UserProvider } from "@/components/context/User";
import "./globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});
export const metadata: Metadata = {
  title: "BizExpenses - Manage your expenses with ease",
  description: "BizExpenses is a modern expense management application designed to simplify the process of tracking and managing business expenses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-gray-100 font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <UserProvider>
          {children}
          </UserProvider>
          <Toaster richColors position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
