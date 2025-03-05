"use client";

import Image from "next/image";
import safety1 from "/public/video/ed5.jpg";
import { Montserrat } from "next/font/google";
import Footer from "@/components/footer/footer";
import React, { useState } from "react";
import "@/css/globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const validateName = (name) => /^[A-Za-z'-]+$/.test(name);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhoneNumber = (phone) => {
    // Regex pattern to allow US phone number in formats like: +1 (XXX) XXX-XXXX or +1-XXX-XXX-XXXX
    const isValidFormat = /^\d{10}$/.test(phone.replace(/\D/g, ''));

    // Remove non-digit characters (keeping only the digits) and check if the length is exactly 10
    const digitsOnly = phone.replace(/\D/g, '');
    
    return isValidFormat && digitsOnly.length === 10;
  };

  async function onSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormSuccess(false);

    const formData = new FormData(event.target);
    const firstName = formData.get("name");
    const lastName = formData.get("last_name");
    const email = formData.get("email");

       // Validation checks
       const newErrors = {};
       if (!validateName(firstName)) {
         newErrors.name = "First name can only contain letters, hyphens, and apostrophes.";
       }
       if (!validateName(lastName)) {
         newErrors.last_name = "Last name can only contain letters, hyphens, and apostrophes.";
       }
       if (!validateEmail(email)) {
         newErrors.email = "Please enter a valid email address.";
       }
       if (!validatePhoneNumber(formData.get("phone"))) {
         newErrors.phone = "Please enter a valid US phone number (10 digits).";
       }
       setErrors(newErrors);
       if (Object.keys(newErrors).length > 0) {
        setIsSubmitting(false);
        return; // Exit early if there are validation errors
      }


    formData.append("access_key", "0f21d948-c2a8-4b94-9967-cd4de7beb731");
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);


    

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: json,
      });
      const data = await res.json();

      if (data.success) {
        console.log("Success:", data);
        event.target.reset(); // Reset form fields
        setFormSuccess(true); // Set success state
      } else {
        console.log("Error:", data);
      }
    } catch (error) {
      console.error("Request failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section
        className="pt-28 md:pt-36"
        style={{ position: "relative", overflow: "hidden" }}
      >
        {/* Background Image */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
          }}
        >
          <Image
            alt="safety1"
            src={safety1}
            layout="fill"
            style={{ objectFit: "cover", filter: "blur(4px)" }}
          />
        </div>

        {/* Row Container for Text and Form */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "1400px",
            height: "745px",
            margin: "auto",
            padding: "1.5rem",
            color: "white",
          }}
        >
          <div className="flex flex-col lg:flex-row justify-center gap-8 lg:gap-20 w-full">
            {/* Text Content */}
            <div className="text-center max-w-xlg p-4 lg:p-8 w-full lg:w-1/2">
              <h2 className="text-2xl lg:text-4xl underline underline-offset-8 py-6 lg:py-12 mt-12 lg:mt-20">
                For Business Enquiries :
              </h2>
              <p className="text-3xl lg:text-5xl py-2 lg:py-4">
                Kinetic Data Minds{" "}
                <span style={{ fontSize: "2.5rem", lg: "2.375rem" }}>Inc</span>
              </p>
              <p className="text-2xl lg:text-4xl">Aamir Baig Mughal</p>
              <p className="text-lg lg:text-xl my-2">
                B.Appl Science (Engineering), M.B.A (Business Analytics), DMIT
                (CSD)
              </p>
              <p className="text-2xl lg:text-4xl py-2">Edmonton - Alberta</p>
              <div className="flex items-center justify-center text-xl lg:text-3xl space-x-6 lg:space-x-12 py-2 lg:py-4">
              <div className="flex items-center">
                <svg
                  className="w-8 h-6 lg:w-14 lg:h-10 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="white"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4Zm12 12V5H7v11h10Zm-5 1a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H12Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-white">+1-587-990-6399</span>
              </div>

              <div className="flex items-center">
                <svg
                  className="w-8 h-6 lg:w-14 lg:h-10 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="white"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.978 4a2.553 2.553 0 0 0-1.926.877C4.233 6.7 3.699 8.751 4.153 10.814c.44 1.995 1.778 3.893 3.456 5.572 1.68 1.679 3.577 3.018 5.57 3.459 2.062.456 4.115-.073 5.94-1.885a2.556 2.556 0 0 0 .001-3.861l-1.21-1.21a2.689 2.689 0 0 0-3.802 0l-.617.618a.806.806 0 0 1-1.14 0l-1.854-1.855a.807.807 0 0 1 0-1.14l.618-.62a2.692 2.692 0 0 0 0-3.803l-1.21-1.211A2.555 2.555 0 0 0 7.978 4Z" />
                </svg>
                <span className="text-white">+1-780-465-5595</span>
              </div> 
            </div>
            <div className="flex justify-center w-full">
            <a href="mailto:aamir.mughal@kineticdataminds.ca" className="flex items-center text-white hover:text-gray-300 space-x-2 text-lg lg:text-2xl">
                <svg
                  className="w-8 h-6 lg:w-10 lg:h-8 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="white"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm16 4l-8 5-8-5v10h16V8zm-8 3l8-5H4l8 5z" />
                </svg>
                aamir.mughal@kineticdataminds.ca
              </a> 
            </div> 
            </div>

            {/* Contact Form */}
            <form
              onSubmit={onSubmit}
              className="bg-red-800 bg-opacity-90 rounded-lg p-4 lg:p-8 shadow-lg w-full lg:max-w-lg mx-auto mt-8 lg:mt-16"
            >
              <h2 className="text-white text-lg lg:text-xl mb-1 font-medium title-font">
                Contact Us
              </h2>
              <p className="leading-relaxed mb-5 text-white">
                Please fill up the form below to send us a message
              </p>

              <div className="flex flex-col lg:flex-row mb-4 lg:mb-6 lg:space-x-4">
                <div className="w-full lg:w-1/2 mb-4 lg:mb-0">
                  <label
                    htmlFor="first_name"
                    className="block mb-2 text-sm text-white"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="first_name"
                    placeholder="John"
                    required
                    pattern="[A-Za-z'-]+"
                    className={`w-full px-3 py-2 border-2 rounded-md text-gray-900 ${errors.name ? "border-red-500" : "border-gray-200"}`}
                    onKeyPress={(e) => {
                      if (!/[A-Za-z'-]/.test(e.key)) {
                        e.preventDefault(); // Block input if not a valid character
                      }
                    }}
                    onInvalid={(e) => e.target.setCustomValidity("First name can only contain letters, hyphens, and apostrophes.")}
                    onInput={(e) => e.target.setCustomValidity("")} // Clear custom error on input
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  
                </div>
                <div className="w-full lg:w-1/2">
                  <label
                    htmlFor="lname"
                    className="block mb-2 text-sm text-white"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    id="lname"
                    placeholder="Doe"
                    required
                    className={`w-full px-3 py-2 border-2 rounded-md text-gray-900 ${errors.last_name ? "border-red-500" : "border-gray-200"}`}
                    onKeyPress={(e) => {
                      if (!/[A-Za-z'-]/.test(e.key)) {
                        e.preventDefault(); // Block input if not a valid character
                      }
                    }}
                    onInvalid={(e) => e.target.setCustomValidity("First name can only contain letters, hyphens, and apostrophes.")}
                    onInput={(e) => e.target.setCustomValidity("")} // Clear custom error on input
                  />
                  {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
                </div>
              </div>

              <div className="flex flex-col lg:flex-row mb-4 lg:mb-6 lg:space-x-4">
                <div className="w-full lg:w-1/2 mb-4 lg:mb-0">
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm text-white"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="you@company.com"
                    required
                    className={`w-full px-3 py-2 border-2 rounded-md text-gray-900 ${errors.email ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div className="w-full lg:w-1/2">
                  <label
                    htmlFor="phone"
                    className="block text-sm mb-2 text-white"
                  >
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    placeholder="+1(587) 1234-567"
                    required
                    maxLength="10"
                    pattern="\d{10}"
                    className={`w-full px-3 py-2 border-2 rounded-md text-gray-900 ${errors.phone ? "border-red-500" : "border-gray-200"}`}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div className="relative mb-4">
                <label htmlFor="message" className="text-sm text-white">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="w-full bg-white rounded border border-gray-300 h-32 text-base px-3 py-1 resize-none text-gray-900"
                  placeholder="Please enter your message or suggestions here"
                ></textarea>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center items-center bg-blue-950 text-white py-2 lg:py-4 px-4 lg:px-6 rounded"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
              {formSuccess && (
                <p className="mt-4 text-green-600">
                  Form submitted successfully!
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </>
  );
}
