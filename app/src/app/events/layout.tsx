import Navigation from '@/components/global/Navigation';
import Footer from '@/components/global/Footer';
import LandingLayout from '@/layouts/LandingLayout';
export default function ExplorerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  );
} 