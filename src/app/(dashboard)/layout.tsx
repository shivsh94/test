import { Providers } from "../providers/QueryProvider";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <div className="min-h-screen bg-white shadow-xl relative flex flex-col w-full max-w-sm">
        <div className="flex flex-col flex-grow">{children}</div>

        {/* <Toaster
          /> */}
      </div>
    </Providers>
  );
}
