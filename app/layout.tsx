import './globals.css'
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/context/user'

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--main-font",
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
          fontSans.className,
        )}
      >
        <main className="flex min-h-screen flex-col">
          <AuthProvider>
            {children}
          </AuthProvider>
        </main>
        <Toaster />
      </body>
    </html>
  )
}