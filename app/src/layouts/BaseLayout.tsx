import BaseHead from "@/components/BaseHead";
import Navigation from "@/components/global/Navigation";
import Footer from "@/components/global/Footer";

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="scroll-smooth selection:bg-black selection:text-lila-500 no-touchevents hydrated"
    >
      <head>
        <BaseHead />
      </head>
      <body className="border-x-2 border-black bg-white flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
