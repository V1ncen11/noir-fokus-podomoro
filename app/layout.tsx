import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500"],
  variable: "--font-outfit",
});

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Noir Focus | Minimalist Pomodoro",
  description: "A brutalist ambient pomodoro timer for deep work sessions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased overflow-hidden bg-[#050505]`}
    >
      <body className={`${outfit.className} h-full overflow-hidden bg-[#050505] text-white m-0 p-0`}>
        {children}
      </body>
    </html>
  );
}
