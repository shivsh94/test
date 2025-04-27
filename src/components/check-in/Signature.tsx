import React, { useRef } from "react";
import SignaturePad from "signature_pad";
import { Button } from "@/components/ui/button";
import { Undo, Eraser } from "lucide-react";

interface SignatureProps {
  onValidationChange: (isValid: boolean) => void;
}

const SignatureComponent: React.FC<SignatureProps> = ({ onValidationChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  React.useEffect(() => {
    if (canvasRef.current) {
      const signaturePad = new SignaturePad(canvasRef.current);
      signaturePadRef.current = signaturePad;

      // Add event listener for when signature begins
      signaturePad.addEventListener("beginStroke", () => {
        onValidationChange(true);
      });
    }

    return () => {
      signaturePadRef.current?.off();
      signaturePadRef.current = null;
    };
  }, []);

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      onValidationChange(false);
    }
  };

  const undoSignature = () => {
    if (signaturePadRef.current) {
      const data = signaturePadRef.current.toData();
      if (data.length > 0) {
        data.pop(); // Remove the last stroke
        signaturePadRef.current.fromData(data); // Re-draw the remaining strokes
        onValidationChange(data.length > 0);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full px-6">
      <h1 className="mb-2">Sign Below</h1>
      <div className="w-full border border-gray-300 rounded-md shadow-sm">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: '200px' }}
        ></canvas>
      </div>
      <div className="flex items-center justify-between w-full mt-4">
        <div className="flex items-center">
          <Button variant="default" onClick={clearSignature}>
            <Eraser className="w-4 h-4" /> Clear
          </Button>
        </div>
        <div className="flex items-center">
          <Button variant="destructive" onClick={undoSignature}>
            <Undo className="w-4 h-4" /> Undo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignatureComponent;