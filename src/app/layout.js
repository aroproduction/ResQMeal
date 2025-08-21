import React from "react"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { SessionProviders } from "./wrappers/SessionProviders"
import UserProtectedRoute from "./wrappers/UserProtectedRoutes"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  fallback: ["system-ui", "arial"],
})

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  fallback: ["Consolas", "Monaco", "Courier New", "monospace"],
  preload: true,
})

export const metadata = {
  title: "🌿 ResQMeal",
  description: "Created to redistribute food surplus",
  // icons: {
  //   icon: '/your-custom-icon.ico',
  //   shortcut: '/your-custom-icon.ico',
  //   apple: '/your-custom-icon.png',
  // },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <SessionProviders>
          <UserProtectedRoute>
            {children}
          </UserProtectedRoute>
        </SessionProviders>
        <Toaster
          position="top-right"
          offset={20}
          visibleToasts={4}
          richColors
          closeButton={false}
          toastOptions={{
            duration: 4500,
            className: "custom-toast",
            style: {
              background: "#ffffff",
              color: "#1f2937",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              fontFamily: "var(--font-sans, system-ui, sans-serif)",
            },
          }}
          theme="light"
        />
      </body>
    </html>
  )
}
