import Footer from "@/components/footer/footer";

export default function PrivacyPolicy() {
  return (
    <>
      <div
        style={{
          zIndex: -1,
          position: "fixed",
          width: "100vw",
          height: "100vh",
          top: 0,
          left: 0,
        }}
      ></div>
      <div
        className="!pt-60 md:!pt-72"
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1200px",
          margin: "auto",
          padding: "2rem",
          color: "black",
        }}
      >
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p>
          <strong>Effective Date:</strong> 2 January 2025
        </p>
        <p>
        Thank you for choosing Kinetic Data Minds Inc! This privacy policy 
        outlines how we collect, use, share, and protect your personal information 
        when you use our mobile application. By using the Construction Safety Mobile
        App, you agree to the terms described in this policy. We are committed to 
        safeguarding your privacy and ensuring the security of your personal information.
         If you have any questions or concerns regarding the privacy policy, 
         please contact us at <a a href="mailto:aamir.mughal@kineticdataminds.ca" 
         class="email-link">aamir.mughal@kineticdataminds.ca</a>.
           
        </p>
        <h2 className="text-2xl font-bold mt-4">Information We Collect</h2>
        <p>
          Personal information: We may collect personally identifiable 
          information such as your name, email address, phone number, 
          and any other information you voluntarily provide.
        </p>
        <p>
        Location Data: We collect location data solely to verify that
         you are logging in from a designated construction or work area. 
         This ensures compliance with worksite requirements and app 
         functionality. But this may restrict access to certain app features.
        </p>
        <p>
        - Location data is only collected during login and is not continuously tracked or stored.
        </p>
        <p>
        - You can disable location access in your device settings 
        </p>
        <h2 className="text-2xl font-bold mt-4">How We Use Your Information</h2>
        <ul>
          <li>
            <strong>Personal Information:</strong> To provide a personalized experience, including user authentication and content delivery.  
            <strong>Location Data:</strong> To confirm your location at a designated construction or work area during login, ensuring compliance with worksite requirements. 
          </li> 
        </ul>
        <h2 className="text-2xl font-bold mt-4">
          How We Share Your Information
        </h2>
        <p>
          <strong>Personal Information :</strong> We may disclose your personal information if 
          required by law, court order, or government authority through legal means.  
        </p>
        <p>
          <strong>Location Data :</strong> :We do not sell or share your location data with third parties. 
          Location data is used strictly for login verification purposes and is not retained after verification  
        </p>
        <h2 className="text-2xl font-bold mt-4">Data Security</h2>
        <p>
          We take data security seriously and employ reasonable measures to
          protect your information from unauthorized access, alteration,
          disclosure, or destruction. Despite our best efforts, no method of
          data transmission over the internet or electronic storage is entirely
          secure. Therefore, we cannot guarantee the absolute security of your
          data.
        </p>
        <p>
        - Location data is not stored and is only used momentarily during the login verification 
        </p>
        <h2 className="text-2xl font-bold mt-4">Contact Us</h2>
        <p>
          If you have any questions or concerns about this privacy policy or our
          data practices, please contact us at:{" "}
          <a href="mailto:aamir.mughal@kineticdataminds.ca" class="email-link">aamir.mughal@kineticdataminds.ca</a>.
        </p>
        <p className="mt-4">
          By using the Construction Safety Mobile application, you agree to the
          terms of this privacy policy and never share your login credentials
          with any person. Thank you for trusting us with your information and
          for using Construction Safety Mobile Application.
        </p>
      </div>
      <Footer />
    </>
  );
}
