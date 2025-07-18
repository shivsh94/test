import { Eraser, Undo } from "lucide-react";
import React, { useEffect, useRef } from "react";
import SignaturePad from "signature_pad";

import { Button } from "@/components/ui/button";

interface SignatureComponentProps {
  fieldName: string;
  defaultValue?: string;
  onValidationChange: (isValid: boolean) => void;
  onSignatureChange: (dataUrl: string) => void;
}

const SignatureComponent: React.FC<SignatureComponentProps> = ({
  fieldName,
  defaultValue,
  onValidationChange,
  onSignatureChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  // Initialize signature pad
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const signaturePad = new SignaturePad(canvas, {
        backgroundColor: "rgb(255, 255, 255)",
        penColor: "rgb(0, 0, 0)",
      });
      signaturePadRef.current = signaturePad;

      if (defaultValue) {
        signaturePad.fromDataURL(defaultValue);
        onValidationChange(!signaturePad.isEmpty());
      }

      const handleResize = () => {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d")?.scale(ratio, ratio);
        signaturePad.clear();
        if (defaultValue) {
          signaturePad.fromDataURL(defaultValue);
        }
      };

      window.addEventListener("resize", handleResize);
      handleResize();

      signaturePad.addEventListener("beginStroke", () => {
        onValidationChange(true);
      });

      signaturePad.addEventListener("endStroke", () => {
        if (signaturePad.isEmpty()) {
          onValidationChange(false);
          onSignatureChange("");
        } else {
          onSignatureChange(signaturePad.toDataURL("image/png"));
        }
      });

      return () => {
        window.removeEventListener("resize", handleResize);
        signaturePad.off();
      };
    }
  }, [fieldName, defaultValue]);

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      onValidationChange(false);
      onSignatureChange("");
    }
  };

  const undoSignature = () => {
    if (signaturePadRef.current) {
      const data = signaturePadRef.current.toData();
      if (data.length > 0) {
        data.pop();
        signaturePadRef.current.fromData(data);
        onValidationChange(data.length > 0);
        if (data.length === 0) {
          onSignatureChange("");
        } else {
          onSignatureChange(signaturePadRef.current.toDataURL("image/png"));
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="w-full border border-gray-300 rounded-md shadow-sm bg-white">
        <canvas
          ref={canvasRef}
          className="w-full touch-none"
          style={{ height: "200px", touchAction: "none" }}
          data-field={fieldName}
        />
      </div>
      <div className="flex items-center justify-between w-full mt-2 space-x-2">
        <Button
          variant="outline"
          onClick={clearSignature}
          className="flex items-center gap-2"
          type="button"
        >
          <Eraser className="w-4 h-4" /> Clear
        </Button>
        <Button
          variant="outline"
          onClick={undoSignature}
          className="flex items-center gap-2"
          type="button"
        >
          <Undo className="w-4 h-4" /> Undo
        </Button>
      </div>
    </div>
  );
};

export default SignatureComponent;
