import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { NetworkProvider } from "@/context/network-context";
import { BlockfrostCacheProvider } from "@/context/blockfrost-cache-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans dark`} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryClientProvider client={queryClient}>
            <NetworkProvider>
              <BlockfrostCacheProvider>
                {children}
                <Toaster />
              </BlockfrostCacheProvider>
            </NetworkProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 