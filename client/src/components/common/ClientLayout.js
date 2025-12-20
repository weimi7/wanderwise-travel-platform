'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';
import Navbar from './Navbar';
import { BackgroundElements } from './BackgroundElements';
import ScrollToTopButton from './ScrollToTopButton';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const hideFooter = pathname === '/auth/login' || pathname === '/auth/signup' || pathname === '/auth/forgot-password' || pathname === '/auth/reset-password' || pathname.startsWith('/dashboard');
  const hideNavbar = pathname === '/auth/login' || pathname === '/auth/signup' || pathname === '/auth/forgot-password' || pathname.startsWith('/dashboard');
  const hideScrollToTop = pathname === '/auth/login' || pathname === '/auth/signup' || pathname === '/auth/forgot-password' || pathname === '/auth/reset-password' || pathname.startsWith('/dashboard');

  return (
    <>
      {/* Background decorative elements */}
      <BackgroundElements />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Conditionally render navbar */}
        {!hideNavbar && <Navbar />}
        <main className="flex-grow">
          {children}
        </main>
        {/* Conditionally render footer */}
        {!hideFooter && <Footer />}
      </div>

      {/* Conditionally render smooth scroll to top button */}
      {!hideScrollToTop && <ScrollToTopButton />}
    </>
  );
}