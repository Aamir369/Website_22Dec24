"use client"; // ✅ Make this a Client Component

import React, { useState, useEffect } from "react";
import UserTable from "./component/UserTable";

function RegisteredUserPage() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsVisible(false); // Hide when scrolling down
      } else {
        setIsVisible(true); // Show when at the top
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/*<header className={`text-center pt-40 transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>*/}
      <header
        className={`fixed top-0 w-full bg-white shadow-md text-center py-5 transition-opacity duration-500 z-50 ${
          isVisible ? "opacity-300" : "opacity-0"
        }`}
      >

        <h2 className="text-5xl text-slate-900 mt-10">Registered Users</h2>
      </header>
      <main className="min-h-screen pt-28 py-24">
        <UserTable />
      </main>
    </>
  );
}

export default RegisteredUserPage;
