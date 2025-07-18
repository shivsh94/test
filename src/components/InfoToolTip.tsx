import { Info } from "lucide-react";

const InfoTooltip = ({ helpText }: { helpText: string }) => {
  return (
    <div className="relative inline-flex mb-2 group">
      <button
        type="button"
        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none"
        aria-label="More information"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <Info className="h-4 w-4" />
      </button>

      <div
        role="tooltip"
        className="absolute z-20 hidden group-hover:block w-64 p-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg 
                    left-full top-1/2 transform -translate-y-1/2 ml-2
                    animate-fade-in opacity-0 group-hover:opacity-100 transition-opacity duration-200
                    before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-left-2 before:border-8 before:border-transparent before:border-r-gray-200"
      >
        <div className="whitespace-normal">{helpText}</div>
      </div>
    </div>
  );
};

export default InfoTooltip;
