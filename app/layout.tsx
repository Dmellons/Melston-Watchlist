import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainHeader from "@/components/layout/MainHeader";
import { ThemeProvider } from "@/components/Contexts/ThemeProvider";
import { UserProvider } from "@/hooks/User";
import { Toaster } from "@/components/ui/sonner";
import { getLoggedInUser } from "@/lib/server/appwriteServer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Melston Watchlist",
  description: "Track and manage your movie and TV show watchlist",
  viewport: "width=device-width, initial-scale=1",
};

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-primary"></div>
    </div>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getLoggedInUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.svg" sizes="any" />
      </head>
      <body className={`${inter.className} bg-foreground/10`}>
        <ErrorBoundary>
          <UserProvider serverUser={user}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <main className="relative sm:container z-0 w-full bg-background max-w-7xl mx-auto min-h-screen border-x-2 border-x-primary/10 m-auto">
                <header className="sticky top-0 z-20 bg-background md:border-b-2 md:border-primary/40 mb-4">
                  <MainHeader />
                </header>
                
                <Suspense fallback={<LoadingFallback />}>
                  {children}
                </Suspense>
              </main>

              <Toaster
                toastOptions={{
                  classNames: {
                    error: "bg-destructive text-destructive-foreground",
                    success: "bg-success text-success-foreground",
                  }
                }} 
              />
            </ThemeProvider>
          </UserProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}