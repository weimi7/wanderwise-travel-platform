'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function FooterVisibility() {
  const pathname = usePathname();
  const hideFooter = pathname === '/login' || pathname === '/signup';

  // Don't render footer on login and signup pages
  if (hideFooter) {
    return null;
  }

  return <Footer />;
}