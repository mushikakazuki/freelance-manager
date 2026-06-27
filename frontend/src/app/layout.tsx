import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ApolloClientProvider } from "@/components/providers/ApolloProvider";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "フリーランス管理",
  description: "フリーランス業務管理アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <ApolloClientProvider>
          <AuthProvider>{children}</AuthProvider>
        </ApolloClientProvider>
      </body>
    </html>
  );
}
