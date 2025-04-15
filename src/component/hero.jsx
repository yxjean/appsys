import React from "react";
import Logo from "../assets/logo.png";

const Hero = () => {
  return (
    <div
      style={{
        backgroundImage: `url(https://img.freepik.com/free-photo/watercolor-green-sea-wave-white-canvas-background_91008-499.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
      }}
    >
      <div className="flex flex-col justify-center items-center h-full gap-10">
        <img src={Logo} alt="logo" className="w-35" />
        <h1 className="text-7xl font-bold text-black text-center">
          <span className="text-teal-400">Performance</span> Appraisal System
        </h1>
      </div>
    </div>
  );
};

export default Hero;
