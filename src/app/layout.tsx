import "~/styles/globals.css";

import type { Metadata } from "next";
import localFont from "next/font/local";

const balatro = localFont({
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  preload: true,
  src: "../../public/fonts/balatro.ttf",
  variable: "--font-custom",
});

export const metadata: Metadata = {
  description: "Jacob's weekly and yearly running progress.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  title: "Jacob's year in running",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={balatro.variable} lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
