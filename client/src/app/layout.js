/* eslint-disable @next/next/no-page-custom-font */
import "./globals.css";
import ClientLayout from "@/components/common/ClientLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "🌴 WanderWise - Discover Sri Lanka",
  description: "Your personalized Sri Lanka travel companion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect + Google Fonts (Inter for UI, Merriweather for headings) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Merriweather:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/* Lightweight inline styles to map fonts to the UI */}
        <style>{`
          :root {
            --font-sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
            --font-serif: "Merriweather", Georgia, "Times New Roman", serif;
          }
          /* Prefer using your globals.css, but ensure fallback if not present */
          body { font-family: var(--font-sans); }
          h1, h2, h3, h4, h5, h6 { font-family: var(--font-serif); }
        `}</style>
      </head>

      <body
        suppressHydrationWarning={true}
        className="antialiased bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-950 min-h-screen relative overflow-x-hidden"
      >
        <AuthProvider>
          {/* Toaster mounted once at app root */}
          <Toaster position="top-center" />
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}