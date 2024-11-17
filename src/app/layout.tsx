import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Masumi AI Agents Dashboard',
  description: 'Monitor and manage your AI agents on the Cardano blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
        >
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}