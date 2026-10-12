import type { Metadata } from "next";
import { BRAND, getBrandLogoUrl } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: BRAND.name,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.tagline,
  icons: {
    icon: [
      { url: BRAND.faviconPath, sizes: "any" },
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: BRAND.iconMarkPath, sizes: "32x32", type: "image/png" },
    ],
    apple: BRAND.appleTouchIconPath,
  },
  openGraph: {
    title: BRAND.name,
    description: BRAND.tagline,
    images: [{ url: getBrandLogoUrl(), width: 480, height: 118, alt: BRAND.name }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
