import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

import logo from "../../../public/logo.webp";

const SwyftinLogo = () => {
  const pathname = usePathname();

  const [isShown, setIsShown] = useState<boolean>(false);

  useEffect(() => {
    if (
      pathname.includes("/nearby") ||
      pathname.includes("/food") ||
      pathname.includes("/bar")
    ) {
      setIsShown(true);
    } else {
      setIsShown(false);
    }
  }, [pathname]);

  if (isShown) {
    return (
      <a
        href="https://www.swyftin.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center flex-col justify-center pb-5 cursor-pointer"
      >
        <p className="text-xs">powered by</p>
        <div className="flex items-center space-x-1">
          <img width={30} height={30} src={logo.src} alt="logo" />
          <p>Swyftin</p>
        </div>
      </a>
    );
  }
};

export default SwyftinLogo;
