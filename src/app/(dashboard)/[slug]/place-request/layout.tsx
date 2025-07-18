interface CartLayoutProps {
  children: React.ReactNode;
}

export default function CartLayout({ children }: Readonly<CartLayoutProps>) {
  return (
    <div className="w-full max-w-sm min-h-screen flex flex-col bg-white">
      <main className="flex-grow">{children}</main>
    </div>
  );
}
