import { Inter } from "next/font/google";
import { NetworkProvider } from "@/context/network-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans dark`}>
      <body>
        <NetworkProvider>
          {children}
        </NetworkProvider>
      </body>
    </html>
  );
} 