"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-slate-50 bg-opacity-75 shadow-lg z-50">
      <div className="container mx-auto flex justify-between items-center px-4 py-3 md:py-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/video/fulllogo_transparent.png"
            width={145}
            height={50}
            alt="Logo" 
            priority
          />
        </Link>

        {/* Hamburger Menu Icon */}
        <button
          className="md:hidden text-black focus:outline-none z-50 self-start"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          )}
        </button>

        {/* Navigation Links */}
        <ul
          className={`${
            isMenuOpen ? "block" : "hidden"
          } md:flex md:space-x-6 absolute md:static top-0 left-0 w-full md:w-auto bg-slate-50 md:bg-transparent shadow-md md:shadow-none p-4 md:p-0`}
        >
          <li><Link href="/" className="block md:inline-block text-black font-bold text-lg py-2 md:py-0 hover:text-gray-700 transition">Home</Link></li>
          <li><Link href="/signIn" className="block md:inline-block text-black font-bold text-lg py-0 px-4 md:px-2 bg-slate-400 rounded-md md:rounded-none hover:bg-slate-800 transition">Registered Users SignIn</Link></li>
          <li><Link href="/about" className="block md:inline-block text-black font-bold text-lg py-2 md:py-0 hover:text-gray-700 transition">About Us</Link></li>
          <li><Link href="/contactUs" className="block md:inline-block text-black font-bold text-lg py-2 md:py-0 hover:text-gray-700 transition" > Contact Us </Link> </li>
        </ul>
      </div>
    </nav>
  );
}

export { NavBar };
