// components/DebugStore.tsx
// import { useDocumentFormStore } from "@/store/useDocumentFormStore";
import { useDetailFormStore } from "@/store/useDetailFormStore";
import { useDocumentFormStore } from "@/store/useDocumentFormStore";


export const DebugDetailStore = () => {
  const state = useDetailFormStore();
  
  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 shadow-lg rounded-lg max-w-md max-h-96 overflow-auto">
      <h3 className="font-bold mb-2">Zustand Store State</h3>
      <pre className="text-xs">{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
};

export const DebugDocumentStore = () => {
  const state = useDocumentFormStore();
  
  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 shadow-lg rounded-lg max-w-md max-h-96 overflow-auto">
      <h3 className="font-bold mb-2">Zustand Store State</h3>
      <pre className="text-xs">{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
};