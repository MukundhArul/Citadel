import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secured Vault | Terminal",
  description: "Cassette Futurism Secured Vault Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-mono text-foreground bg-background">
        <div className="flex min-h-screen bg-background scanlines">
          {children}
        </div>
      </body>
    </html>
  );
}
