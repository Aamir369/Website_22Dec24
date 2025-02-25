import React from "react";
import { Poppins } from "next/font/google";
import Footer from "@/components/footer/footer";
import styles from "../css/globals.css";

const roboto = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Home() {
  return (
    <>
      <main className="relative w-full h-screen overflow-hidden">
        {/* Background Video */}
        <video
          src="video/video1.webm"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay Content */}
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center px-4">
          <div className={`text-center ${roboto.className}`}>
            <h1 className="text-white text-2xl sm:text-4xl md:text-5xl font-bold mb-4">
              Welcome to Construction Safety App
            </h1>
            <p className="text-lime-100 text-sm sm:text-lg md:text-xl font-bold mb-8">
              Optimization and Productivity is our top priority
            </p>

            {/* Card Section */}
            <div className="grid gap-8">
              <div className="bg-white bg-opacity-20 shadow-md rounded-lg p-6 md:p-8">
                <h1 className="text-xl md:text-2xl font-bold italic mb-4">
                  We Excel in providing solutions
                </h1>
                <h2 className="text-lime-100 text-lg md:text-xl font-bold mb-2">
                  for Optimization and Productivity Problems
                </h2>
                <p className="text-white text-sm sm:text-base font-bold">
                  Our aim is to enhance your profits and productivity
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
