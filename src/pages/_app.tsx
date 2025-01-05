import "@/styles/globals.css";
import "@meshsdk/react/styles.css";
import type { AppProps } from "next/app";
import { MeshProvider } from "@meshsdk/react";
import Layout from "@/components/layouts/layout";
import { ThemeProvider } from "next-themes";
import { NetworkProvider } from "@/context/network-context";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function App({ Component, pageProps }: AppProps) {
  return (
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
  );
}
