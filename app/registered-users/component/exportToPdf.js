import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as FLHA from "./constant_titles";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const dateTimeConversion = (timestamp) => {
  const seconds = timestamp.seconds;
  const nanoseconds = timestamp.nanoseconds;
  const milliseconds = seconds * 1000 + nanoseconds / 1000000;
  const date = new Date(milliseconds);
  const formattedDate = date.toISOString().split("T")[0];
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  return `${formattedDate} ${timeFormatter.format(date)}`;
};

const fetchImageAsBase64 = async (firebasePath) => {
  const storage = getStorage();
  const storageRef = ref(storage, firebasePath);

  try {
    const url = await getDownloadURL(storageRef);

    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Error fetching image: ${error.message}`);
    return null;
  }
};

const formatDate = (dateTimeString) => {
  const [datePart, timePart] = dateTimeString.split(" ");
  const [year, month, day] = datePart.split("-");
  return `${day}/${month}/${year}\n${timePart}`;
};

const preloadCompanyLogo = async (logo) => {
  try {
    const image = await fetchImageAsBase64(logo);
    return image;
  } catch (error) {
    console.error("Error preloading company logo:", error);
    return null;
  }
};

const preloadImages = async (imageUrls) => {
  const images = await Promise.all(
    imageUrls.map(async (url) => await fetchImageAsBase64(url))
  );
  return images;
};

export const exportToPDF = async (
  data,
  fileName,
  table,
  signatures,
  currentCompanyData,
  currentUserData,
  attendance
) => {
  const companyLogo = await preloadCompanyLogo(currentCompanyData.logo);

  let headers, formattedData, images;

  if (table === "flha") {
    headers = [
      "Name & Email",
      "Submitted Date and Time",
      "PPE Inspected",
      "Environmental Hazards (Flhf)",
      "Ergonomics Hazards",
      "Access/Egress Hazards",
      "Overhead/Underground Hazards",
      "Equipment/Vac Truck Hazards",
      "Personal Limitations Hazards",
      "All Hazard Remaining",
      "All Permits Closed Out",
      "Any Incident",
      "Area Cleaned Up At End",
      "Master Point Location",
      "Signature",
    ];

    formattedData = data.map((flha) => [
      `${flha.user_name}\n${flha.user_email}`,
      formatDate(dateTimeConversion(flha.submitted_at)),
      flha.data.ppe_inspected ? "True" : "False",
      flha.data.flhf
        .map(
          (item, index) =>
            `${FLHA.environmentalHazards[index]}: ${item ?? "N/A"}`
        )
        .join("\n"),
      flha.data.ergonomics
        .map(
          (item, index) => `${FLHA.ergonomicsHazards[index]}: ${item ?? "N/A"}`
        )
        .join("\n"),
      flha.data.aeHazards
        .map(
          (item, index) =>
            `${FLHA.accessEgressHazards[index]}: ${item ?? "N/A"}`
        )
        .join("\n"),
      flha.data.ouHazards
        .map(
          (item, index) =>
            `${FLHA.overHeadUnderGroundHazards[index]}: ${item ?? "N/A"}`
        )
        .join("\n"),
      flha.data.plHazards
        .map(
          (item, index) =>
            `${FLHA.personalLimitationsHazards[index]}: ${item ?? "N/A"}`
        )
        .join("\n"),
      flha.data.job_completion?.all_hazard_remaining
        ? "True"
        : "False" ?? "N/A",
      flha.data.job_completion?.all_permits_closed_out
        ? "True"
        : "False" ?? "N/A",
      flha.data.job_completion?.any_incident ? "True" : "False" ?? "N/A",
      flha.data.job_completion?.area_cleaned_up_at_end
        ? "True"
        : "False" ?? "N/A",
      null, // Placeholder for signature image
    ]);

    images = await preloadImages(signatures);
  } else if (table === "injury_reports") {
    headers = [
      "Company Name",
      "Date",
      "Reported By",
      "Category",
      "Location",
      "Incident Date",
      "Reported To OHS Date",
      "Organizational Factors",
      "Other Circumstances",
      "Tools/Materials/Equipment",
      "Work Site Conditions",
      "Images",
    ];

    // Extract image URLs from injury reports
    const imageUrls = data.flatMap((report) =>
      report.injury_data.events.flatMap((event) => event.images)
    );

    formattedData = data.map((report) => [
      report.company_name,
      report.date,
      report.reported_by,
      report.injury_data.category,
      report.injury_data.location,
      report.injury_data.incidentDateAndTime,
      report.injury_data.incidentReportedToOHSDateAndTime,
      report.injury_data.organizationalFactors,
      report.injury_data.otherCircumstances,
      report.injury_data.toolsMaterialsEquipment,
      report.injury_data.workSiteConditions,
      null, // Placeholder for images
    ]);

    images = await preloadImages(imageUrls);
  } else if (table === "users") {
    headers = [
      "FullName",
      "Email",
      "CompanyName",
      "BirthDate",
      "CompanyID",
      "CreatedAt",
      "JobID",
      "JoinedDate",
      "Role",
      "SiteID",
      "Last Login",
    ];

    // Helper function to get last login time
    function getLastLoginTime(user) {
      if (attendance?.find((report) => report.id === user.fullName)) {
        return Object.entries(
          attendance.find((report) => report.id === user.fullName)
        )[1][1].last_login_time;
      } else {
        return "-";
      }
    }

    formattedData = data.map((user) => [
      user.fullName,
      user.email,
      user.companyName,
      user.birthDate,
      user.companyID,
      new Date(user.createdAt).toLocaleDateString() +
        " " +
        new Date(user.createdAt).toLocaleTimeString(),
      user.jobID,
      user.joinedDate,
      user.role,
      user.siteID,
      formatLoginTime(getLastLoginTime(user)),
    ]);

    images = await preloadImages(data.map((user) => user.profilePic));
  } else {
    headers = ["FullName", "Email"];
    formattedData = data.map((user) => [user.fullName, user.email]);
  }

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setFontSize(6);
  doc.addImage(companyLogo, "JPEG", 10, 10, 20, 10);
  doc.text(`Company Name: ${currentCompanyData.name ?? "N/A"}`, 10, 25);
  doc.text(`Report Printed By: ${currentUserData.fullName ?? "N/A"}`, 10, 30);

  autoTable(doc, {
    head: [headers],
    body: formattedData,
    startY: 45,
    theme: "grid",
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: 255,
      fontSize: 6,
      fontStyle: "bold",
      valign: "middle",
      halign: "center",
    },
    bodyStyles: {
      fillColor: [245, 245, 245],
      textColor: 50,
      fontSize: 4,
      valign: "top",
      halign: "left",
      overflow: "linebreak",
    },
    didDrawCell: (data) => {
      if (table === "injury_reports") {
        if (data.column.index === headers.length - 1 && data.row.index >= 1) {
          const imageIndex = data.row.index;
          const imageBase64 = images && images[imageIndex];
          if (imageBase64) {
            const cellWidth = data.cell.width;
            const cellHeight = data.cell.height;
            const x = data.cell.x;
            const y = data.cell.y;
            const imageWidth = cellWidth;
            const imageHeight = cellHeight;
            doc.addImage(imageBase64, "JPEG", x, y, imageWidth, imageHeight);
          }
        }
      }
      if (data.column.index === headers.length - 1 && data.row.index >= 0) {
        const imageIndex = data.row.index;
        const imageBase64 = images && images[imageIndex];
        if (imageBase64) {
          const cellWidth = data.cell.width;
          const cellHeight = data.cell.height;
          const x = data.cell.x;
          const y = data.cell.y + 12;
          doc.addImage(imageBase64, "JPEG", x, y, cellWidth, cellHeight / 2);
        }
      }
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "left" },
      2: { halign: "left" },
    },
    pageBreak: "auto",
  });

  // Adding footer with page numbers
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(6);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  doc.save(`${fileName}.pdf`);
};

// Helper function to format login time
const formatLoginTime = (timestamp) => {
  if (!timestamp) return "-";
  const date = new Date(Number(timestamp));
  return date.toLocaleString();
};
