// app/cart/layout.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Footer from '@/components/cart/Footer';

export default function CartLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const router = useRouter();

  return (
        <div className="w-full max-w-sm min-h-screen flex flex-col bg-white">
          <div className="flex items-center p-4 border-b sticky top-0 z-50 bg-white">
            <button 
              onClick={() => router.back()}
              className="absolute text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-6 h-6" />
              {/* <span>Back</span> */}
            </button>
            <h1 className="mx-auto text-xl font-semibold">Cart</h1>
          </div>
          <main className="flex-grow p-4">
            {children}
          </main>
          <Footer />
        </div>
  );
}