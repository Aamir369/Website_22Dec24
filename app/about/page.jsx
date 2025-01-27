import Image from "next/image";
import safety1 from "/public/video/aboutus5.jpg";
import { Kanit } from "next/font/google";
import Footer from "@/components/footer/footer";
import clsx from "clsx";
import Link from "next/link";

const roboto = Kanit({
  subsets: ["latin"],
  weight: ["400"],
});

export default async function Home() {
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
      >
        <Image
          alt="safety1"
          src={safety1}
          layout="fill"
          style={{ objectFit: "cover", filter: "blur(4px)" }}
        />
      </div>
      <div
        className={clsx("!pt-36 md:!pt-36", roboto.className)}
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          maxWidth: "1200px",
          minHeight: "100vh",
          margin: "auto",
          padding: "2rem",
          color: "white",
        }}
      >
        <div className="max-w-5xl mx-auto rounded-lg shadow-lg pt-8 z-10 text-white">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-10 mt-16 md:mt-32">
            About Us
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-bold">
            We are a team of professionals experienced in industrial safety. We
            believe in the science of applying data analysis techniques to
            improve workplace safety extending beyond reacting to accidents and
            aims to proactively prevent them by identifying underlying causes
            and predicting potential risks. We rely on gathering data from
            various sources in the workplace by using Incident reports (Records
            of accidents, injuries, and near misses), Inspection reports, and
            Information on temperature, noise levels, air quality, etc., which
            can influence safety risks. We emphasize uploading the Training
            records including data on worker training completion and
            certifications.
            <br />
            <br />
            Our vision is to promote a proactive safety culture by reducing
            costs and improving worker well-being by enhancing employee morale
            and reducing worker turnover. Our target is to play an important
            role in creating safer work environments across various industries.
            <br />
            <br />
            The Construction Safety App introduces a new interactive way to
            enhance productivity, reduce paper usage, and improve safety. The
            app allows users to fill out the FLHA (Field Level Hazard
            Assessment) form, report safety issues to project managers and
            safety managers, upload work permits, and report safety issues
            on-site. Additionally, the app enables project managers or safety
            managers to send immediate safety alerts to users.
          </p>
          <div className="my-8">
            <Link href="/privacy-policy" className="underline text-white-700">
              Read our Privacy Policy
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
