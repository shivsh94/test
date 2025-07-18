export default function Custom404() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center w-screen h-screen">
      <div className="flex items-center gap-8">
        <div className="text-white text-2xl font-bold">404</div>
        <div className="w-px h-16 bg-white/20"></div>
        <div className="text-white text-xl">This page could not be found.</div>
      </div>
    </div>
  );
}
