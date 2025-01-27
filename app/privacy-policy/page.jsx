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
          outlines how we collect, use, share and protect your personal
          information when you use our mobile application. By using the
          Construction Safety Mobile App, you agree to the terms described in
          this policy. We are committed to safeguarding your privacy and
          ensuring the security of your personal information. If you have any
          questions or concerns regarding the privacy policy, please contact us
          at <a href="mailto:naitnotes@gmail.com">naitnotes@gmail.com</a>.
        </p>
        <h2 className="text-2xl font-bold mt-4">Information We Collect</h2>
        <p>
          Personal information: When you use the Construction Safety App, we may
          collect certain personally identifiable information such as your name,
          email address, phone number, and any other information you voluntarily
          provide.
        </p>
        <h2 className="text-2xl font-bold mt-4">How We Use Your Information</h2>
        <ul>
          <li>
            <strong>Personal Information:</strong> We may use your personal
            information to provide a personalized experience with the
            Construction Safety Application, including user authentication and
            personalized content delivery.
          </li>
          <li>
            <strong>Communication:</strong> We may use your email address or
            phone number to send you email links to change your password.
          </li>
          <li>
            <strong>Improve Our Services:</strong> By analyzing usage data and
            other metrics, we continually strive to enhance the application's
            functionality, content, and user experience.
          </li>
        </ul>
        <h2 className="text-2xl font-bold mt-4">
          How We Share Your Information
        </h2>
        <p>
          <strong>Legal Requirements:</strong> We may disclose your personal
          information if required by law, court order, or government authority
          through legal means.
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
        <h2 className="text-2xl font-bold mt-4">Contact Us</h2>
        <p>
          If you have any questions or concerns about this privacy policy or our
          data practices, please contact us at:{" "}
          <a href="mailto:naitnotes@gmail.com">naitnotes@gmail.com</a>.
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
