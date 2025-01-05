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

export default function App({ Component, pageProps }: AppProps) {
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
          <NetworkProvider>
            <MeshProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </MeshProvider>
          </NetworkProvider>
        </ThemeProvider>
      </TooltipProvider>
    </AppProvider>
  );
}
