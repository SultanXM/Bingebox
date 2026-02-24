import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SearchProvider } from "@/app/comps/search/SearchProvider";
import { NavbarWrapper, FooterWrapper } from "@/app/comps/ui/NavbarWrapper";
import { AuthProvider } from "@/app/comps/auth/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "BingeBox - Watch Movies & TV Shows",
  description: "Stream your favorite movies and TV shows on BingeBox. Watch the latest releases, classics, and trending content all in one place.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-netflix-black">
      <head>
        <meta name="description" content="Stream your favorite movies and TV shows on BingeBox. Watch the latest releases, classics, and trending content all in one place." />

        <meta property="og:url" content={process.env.NEXT_PUBLIC_SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="BingeBox - Watch Movies & TV Shows" />
        <meta
          property="og:description"
          content="Stream your favorite movies and TV shows on BingeBox. Watch the latest releases, classics, and trending content all in one place."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content={process.env.NEXT_PUBLIC_SITE_DOMAIN} />
        <meta property="twitter:url" content={process.env.NEXT_PUBLIC_SITE_URL} />
        <meta name="twitter:title" content="BingeBox - Watch Movies & TV Shows" />
        <meta
          name="twitter:description"
          content="Stream your favorite movies and TV shows on BingeBox. Watch the latest releases, classics, and trending content all in one place."
        />
        <meta
          name="twitter:image"
          content={`${process.env.NEXT_PUBLIC_SITE_URL}/movcover.jpg`}
        />
      </head>
      <Analytics />
      <body
        className={`${inter.variable} ${poppins.variable} antialiased h-full bg-netflix-black text-white`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <SearchProvider>
            <NavbarWrapper />
            <main className="flex-grow bg-netflix-black">{children}</main>
            <FooterWrapper />
          </SearchProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
