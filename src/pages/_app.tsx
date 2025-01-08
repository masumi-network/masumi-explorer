import "@/styles/globals.css";
import "@meshsdk/react/styles.css";
import type { AppProps } from "next/app";
import { MeshProvider } from "@meshsdk/react";
import Layout from "@/components/layouts/layout";
import { ThemeProvider } from "next-themes";
import { NetworkProvider } from "@/context/network-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from 'react';
import { AppProvider } from '@/context/app-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BlockfrostCacheProvider } from '@/context/blockfrost-cache-context';
import { useRouter } from 'next/router';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Initialize WebAssembly lazily when needed
    const loadWasm = async () => {
      try {
        if (typeof window !== 'undefined' && typeof WebAssembly === 'object') {
          // Import the module directly
          await import('@sidan-lab/sidan-csl-rs-browser');
        }
      } catch (error) {
        console.error('WebAssembly initialization failed:', error);
        // Handle the error gracefully - maybe set some state to show a fallback UI
      }
    };

    loadWasm();
  }, []);

  return (
    <AppProvider>
      <TooltipProvider>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <QueryClientProvider client={queryClient}>
            <NetworkProvider>
              <BlockfrostCacheProvider>
                <MeshProvider>
                  <Layout>
                    <Component {...pageProps} />
                  </Layout>
                </MeshProvider>
              </BlockfrostCacheProvider>
            </NetworkProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </TooltipProvider>
    </AppProvider>
  );
}
