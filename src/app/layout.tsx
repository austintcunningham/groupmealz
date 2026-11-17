import type { Metadata } from "next";
import { BRAND, getBrandLogoUrl } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} · ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.supportingMessage,
  keywords: [
    "Catering in Baton Rouge",
    "Office Lunch Catering",
    "Corporate Catering",
    "Catering Near Me",
    "Group Lunch Ordering",
    "Restaurant Catering Delivery",
  ],
  icons: {
    icon: [
      { url: BRAND.faviconPath, sizes: "any" },
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: BRAND.iconMarkPath, sizes: "32x32", type: "image/png" },
    ],
    apple: BRAND.appleTouchIconPath,
  },
  openGraph: {
    title: `${BRAND.name} · ${BRAND.tagline}`,
    description: BRAND.supportingMessage,
    images: [{ url: getBrandLogoUrl(), width: 480, height: 118, alt: BRAND.name }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="geaux-body min-h-screen antialiased">{children}</body>
    </html>
  );
}
