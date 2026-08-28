import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Space Grotesk carries headings and anything numeric/technical (module
// numbers, XP, stats) -- its squared-off geometry is the app's one deliberate
// "brand" signal. Inter stays purely for body copy, where a display face
// would hurt readability. JetBrains Mono is reserved for genuinely code-like
// or tabular content (none yet, but keeps the option open over Geist Mono).
const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ByteForge — Computer Systems Servicing NC II Training",
  description:
    "A gamified learning platform to help you build foundational knowledge and hands-on familiarity with Computer Systems Servicing (CSS) NC II concepts. Educational preparation only -- not an official TESDA assessment or certification.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
