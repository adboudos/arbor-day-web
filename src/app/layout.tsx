import type { Metadata } from "next";
import "./globals.css";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "6th Annual Arbor Day",
  description: "Plant a tree. Raise a glass. Friday, April 30, 2027. Venue to be Announced.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full scroll-pt-[env(safe-area-inset-top,0px)] bg-forest antialiased"
    >
      <body className="flex min-h-full flex-col bg-forest text-cream">
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
