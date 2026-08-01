import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainHeader from "@/components/layout/MainHeader";
import BottomNav from "@/components/layout/BottomNav";
import CommandK from "@/components/CommandK";
import { ThemeProvider } from "@/components/Contexts/ThemeProvider";
import { UserProvider } from "@/hooks/User";
import { Toaster } from "@/components/ui/sonner";
import { getLoggedInUser } from "@/lib/server/appwriteServer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Providers } from "@/app/providers";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-states";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { template: '%s · Watchlist', default: 'Watchlist' },
  description: "Track movies, TV shows, and games — and see where to stream them.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Lets env(safe-area-inset-bottom) be non-zero on iOS so the bottom tab bar
  // clears the home indicator.
  viewportFit: 'cover',
}

// The root layout reads auth cookies via getLoggedInUser(), so every route is
// inherently dynamic. Declaring it explicitly stops `next build` from attempting
// static prerender (which would throw DYNAMIC_SERVER_USAGE on cookies access).
export const dynamic = 'force-dynamic'

function LoadingFallback() {
  return <LoadingSpinner size="lg" className="min-h-screen" />;
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
          <Providers>
          <UserProvider serverUser={user}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <main className="relative z-0 w-full bg-background max-w-7xl mx-auto min-h-screen border-x border-x-primary/10">
                <header className="sticky top-0 z-20 bg-background md:border-b md:border-primary/20 mb-4">
                  <MainHeader />
                </header>
                
                {/* pb clears the fixed mobile bottom tab bar (h-16 + safe area) */}
                <div className="pb-24 md:pb-0">
                  <Suspense fallback={<LoadingFallback />}>
                    {children}
                  </Suspense>
                </div>
              </main>

              <BottomNav />
              <CommandK />

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
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}