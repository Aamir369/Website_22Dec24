import Footer from "@/components/footer/footer";

export default function PrivacyPolicy() {
  return (
    <>
      <div className="max-w-screen-lg mx-auto pt-24 md:pt-40 px-4 font-sans">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-[#201a7a]">Privacy Policy</h1>
          <p className="text-2xl font-bold text-[#201a7a]">Effective Date: 2 January 2025</p>
        </div>

        <p className="mb-2">
          <strong className="text-2xl font-bold text-red-700">Kinetic Data Minds Inc</strong> (“we,” “our,” or “us”) respects your privacy and is committed to protecting your
          personal data. We comply with the Personal Information Protection and Electronics Document Act (PIPEDA) regarding data collection, use, and protection.
          Under PIPEDA, you have the right to access, correct, or delete your personal data. You may also withdraw consent for data collection and usage.
          To request this, contact us at <a href="mailto:aamir.mughal@kineticdataminds.ca" className="text-blue-500">aamir.mughal@kineticdataminds.ca</a> with the subject line: ‘Data Access Request’.
          We will process your request within 30 days, subject to legal or security restrictions.
        </p>

        <p className="mb-2">
          If you have concerns about our data practices, you can file a complaint with us at <a href="mailto:aamir.mughal@kineticdataminds.ca" className="text-blue-500">aamir.mughal@kineticdataminds.ca</a>.
          If unresolved, you may escalate your complaint to the <strong>Office of the Privacy Commissioner of Canada (OPC)</strong>:<br />
          📌 Website: <a href="https://www.priv.gc.ca" className="text-blue-600">www.priv.gc.ca</a> <br />
          📌 Phone: 1-800-282-1376
        </p>

        <section className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {/* Information We Collect */}
          <div className="border p-4">
            <h2 className="text-2xl font-bold underline mb-2 text-[#201a7a]">Information We Collect:</h2>
            <ul className="list-disc pl-5">
              <li><strong className="font-bold">FLHA (Field Level Hazard Assessments):</strong> Manually collected from users to monitor and document hazard assessments for safety compliance.</li>
              <li><strong>Site Injury Reports:</strong> Manually submitted by users to document incidents and ensure appropriate follow-up actions.</li>
              <li><strong>Work Permits:</strong> Users can upload, modify, and delete permits to manage access to construction sites and ensure safety compliance.</li>
              <li><strong>Emergency Contacts:</strong> Provided to the User for reporting emergency situations.</li>
            </ul>
          </div>

          {/* How We Use Your Information */}
          <div className="border p-2">
            <h2 className="text-2xl font-bold underline mb-2 text-[#201a7a]">How We Use Your Information:</h2>
            <ul className="list-disc pl-5">
              <li><strong>Enable Location:</strong> Ensures login is done at construction/work sites.</li>
              <li><strong>Safety Incident Documentation:</strong> Helps analyze and document safety incidents.</li>
              <li><strong>Work Permit Verification:</strong> Verifies user certifications for job roles and ensures compliance with safety and permit requirements.</li>
              <li><strong>Emergency Alerts:</strong> Enables management to communicate with users during critical/emergency incidents.</li>
             
            </ul>
          </div>

          {/* How We Share Your Information */}
          <div className="border p-2">
            <h2 className="text-2xl font-bold underline mb-2 text-[#201a7a]">How We Share Your Information:</h2>
            <ul className="list-disc pl-5">
              <li><strong>Emergency Situations:</strong> Emergency contact information may be shared to ensure user safety.</li>
              <li><strong>Location Data:</strong> <ul><li>User consent is mandatory to verify access to worksites.</li>
              <li>Location data is not stored and is used only during the login verification process.</li>
              <li>Location data is strictly for verification purposes and is not retained after login</li></ul></li>
            </ul>
          </div>

          {/* Data Security */}
          <div className="border p-1">
            <h2 className="text-2xl font-bold underline mb-2 text-[#201a7a]">Data Security:</h2>
            <ul className="list-disc pl-5 mb-4">
          <li>We take data security seriously and implement industry-standard measures to protect your data from unauthorized access, alteration, disclosure, or destruction.</li>
          <li>Despite our best efforts, no method of data transmission or storage is 100% secure. However, we continuously improve our security protocols to protect your information.</li>
          <li>We do not sell or share personal data with third parties for advertising.</li>
          <li>We may use third-party services (cloud storage, analytics) to enhance app functionality. These services comply with strict security standards.</li>
        </ul>
          </div>
        </section>

        {/* Data Disclosure */}
        <h2 className="text-2xl font-bold mt-4 text-[#201a7a]">Data Disclosure – We Only Share Data When Legally Required</h2>
        <ul className="list-disc pl-5 mb-4">
          <li>In response to court orders, subpoenas, or regulatory investigations.</li>
          <li>To prevent fraud, security threats, or illegal activities.</li>
          <li>To comply with financial, tax, or employment laws.</li>
        </ul>

         {/* Data Retention */}
         <h2 className="text-2xl font-bold mt-6 text-[#201a7a]">Data Retention:–We retain your data only as long as necessary to provide our services, ensure safety compliance, and meet legal obligations. </h2>
        <ul className="list-disc pl-5 mb-4">
          <li>Inactive Accounts: After 90 days of inactivity, we permanently delete personal data, except where retention is required by law. Users may receive a notification before deletion.</li>
          <li>Manual Deletion Requests: You may request data deletion at any time by contacting aamir.mughal@kineticdataminds.ca. We will process your request within 30 days.</li> 
        </ul> 

          {/* Data Retention */}
          <h2 className="text-2xl font-bold mt-6 text-[#201a7a]">Your Rights:–Under PIPEDA, you have the right to: </h2>
        <ul className="list-disc pl-5 mb-4">
          <li>Access Your Data: Request a copy of your personal data stored by us.</li>
          <li>Correct Inaccurate Data: Request updates or corrections to your information</li> 
          <li>Withdraw Consent: Revoke consent for data collection (this may limit app functionality).</li>
          <li>Request Data Deletion: Ask us to delete your data, subject to legal and security constraints.</li>
          <li>Lodge a Complaint: Report concerns about data handling to us or the Office of the Privacy Commissioner of Canada.</li>
        </ul> 

        {/* Contact Info */}
        <h2 className="text-2xl font-bold mt-6 text-[#201a7a]">Contact Us</h2>
        <p>
          For any privacy concerns, contact us at: <a href="mailto:aamir.mughal@kineticdataminds.ca" className="text-blue-500">aamir.mughal@kineticdataminds.ca</a> or call +1-(587) 990-6399.
        </p>
      </div>

      <Footer />
    </>
  );
}
