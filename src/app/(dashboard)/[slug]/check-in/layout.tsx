
export default function CartLayout({ 
    children 
  }: { 
    children: React.ReactNode 
  }) {
  
    return (
          <div className="w-full max-w-sm min-h-screen relative flex flex-col bg-white">
            <main className="flex flex-col flex-grow">
              {children}
            </main>
          </div>
    );
  }