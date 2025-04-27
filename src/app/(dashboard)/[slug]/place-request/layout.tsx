// import { RequestCartProvider } from "@/context/RequestCartContext";

export default function CartLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {

  return (
        <div className="w-full max-w-sm min-h-screen flex flex-col bg-white">
          <main className="flex-grow">
            {children}
          </main>
        </div>
  );
}