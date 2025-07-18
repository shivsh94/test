"use client";
import logo from "../../../public/logo.webp";
import StarRating from "../StarRating/StarRating";
import { Events } from "./Events";
import Navigation from "./Navigation";
import Activities from "./upsell/Activities";
import WelcomeClient from "./WelcomeClient";

function Homepage() {
  return (
    <div>
      <WelcomeClient />
      <Navigation />
      <Events />
      <Activities />
      <StarRating />
      <a
        href="https://www.swyftin.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center flex-col justify-center pt-10 cursor-pointer"
      >
        <p className="text-xs">powered by</p>
        <div className="flex items-center space-x-1">
          <img width={30} height={30} src={logo.src} alt="logo" />
          <p>Swyftin</p>
        </div>
      </a>
      <div className="mb-5"></div>
    </div>
  );
}

export default Homepage;
