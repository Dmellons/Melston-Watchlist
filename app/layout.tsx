
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainHeader from "@/components/layout/MainHeader";
import { ThemeProvider } from "@/components/Contexts/ThemeProvider";
import { UserProvider } from "@/hooks/User";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Melston Watchlist",
  description: "Watchlist",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >

            <MainHeader />
            {children}

          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}
