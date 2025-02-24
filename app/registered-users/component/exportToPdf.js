import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as FLHA from "./constant_titles";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
 
// Utility function to convert a local image to Base64
const convertImageToBase64 = (imagePath) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      const reader = new FileReader();
      reader.onloadend = function () {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = reject;
    xhr.open("GET", imagePath);
    xhr.responseType = "blob";
    xhr.send();
  });
}; 

// Function to convert Firebase timestamp to a formatted date and time
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

// Function to fetch an image from Firebase Storage as Base64
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

// Function to format a date string
const formatDate = (dateTimeString) => {
  const [datePart, timePart] = dateTimeString.split(" ");
  const [year, month, day] = datePart.split("-");
  return `${day}/${month}/${year}\n${timePart}`;
};

// Function to preload the company logo from Firebase
const preloadCompanyLogo = async (logo) => {
  try {
    const image = await fetchImageAsBase64(logo);
    return image;
  } catch (error) {
    console.error("Error preloading company logo:", error);
    return null;
  }
};

// Function to preload multiple images from Firebase


{/*const preloadSecondLogo = async (logoPath) => {
  try {
    const image = await fetchImageAsBase64(logoPath);
    return image;
  } catch (error) {
    console.error("Error preloading second logo:", error);
    return null;
  }
};*/}
const preloadImages = async (imageUrls) => {
  const images = await Promise.all(
    imageUrls.map(async (url) => await fetchImageAsBase64(url))
  );
  return images;
};

{/*const preloadImages = async (signatures) => {
  const images = await Promise.all(
    signatures.map(async (signature) => await fetchImageAsBase64(signature))
  );
  return images;
};*/}

{/*const preloadImages = async (imageUrls = [], signatures = []) => {
  const sources = [...imageUrls, ...signatures]; // Merge both arrays
  return await Promise.all(sources.map(async (source) => await fetchImageAsBase64(source)));
};*/}

// Main function to export data to PDF

export const exportToPDF = async (data, fileName, table, signatures, currentCompanyData, currentUserData,attendance) => {
  const companyLogo = await preloadCompanyLogo(currentCompanyData.logo);
  //const secondLogo = await preloadSecondLogo("/video/fulllogoN.jpg"); // Provide the path to the second logo here
    // Load the local image and convert it to Base64
    const localLogoBase64 = await convertImageToBase64("/video/fulllogo_transparent.png");


  let headers, formattedData, images,reportTitle;
  //const images = table === "flha" ? await preloadImages(signatures) : null;
  //const headers = table === "flha" ? [

  if (table === "flha") {
    reportTitle = "Field Level Hazard Assessment (FLHA) Report";
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
  ] ; ["FullName", "Email", "CompanyName", "BirthDate","CompanyID", "CreatedAt", "JobID","Role","SiteID" ];

  //const formattedData = table === "flha" ? data.map(flha => [

    formattedData = data.map((flha, index) => [
      index + 1,
    `${flha.user_name}\n${flha.user_email}`,
    formatDate(dateTimeConversion(flha.submitted_at)),
    flha.data.ppe_inspected ? "True" : "False",
    flha.data.flhf.map((item, index) => `${FLHA.environmentalHazards[index]}: ${item ?? 'N/A'}`).join("\n"),
    flha.data.ergonomics.map((item, index) => `${FLHA.ergonomicsHazards[index]}: ${item ?? 'N/A'}`).join("\n"),
    flha.data.aeHazards.map((item, index) => `${FLHA.accessEgressHazards[index]}: ${item ?? 'N/A'}`).join("\n"),
    flha.data.ouHazards.map((item, index) => `${FLHA.overHeadUnderGroundHazards[index]}: ${item ?? 'N/A'}`).join("\n"),
    flha.data.plHazards.map((item, index) => `${FLHA.personalLimitationsHazards[index]}: ${item ?? 'N/A'}`).join("\n"),
    flha.data.job_completion?.all_hazard_remaining ? "True" : "False" ?? 'N/A',
    flha.data.job_completion?.all_permits_closed_out ? "True" : "False" ?? 'N/A',
    flha.data.job_completion?.any_incident ? "True" : "False" ?? 'N/A',
    flha.data.job_completion?.area_cleaned_up_at_end ? "True" : "False" ?? 'N/A',
    // flha.data.master_point_location ?? 'N/A',
    null,
    // { content: flha.data?.signature_url, type: "image"}// Use null if there's no image
  ]) ; data.map(user => [
        user.fullName, user.email, user.companyName, user.birthDate, user.companyID,
        user.createdAt, user.jobID, user.joinedDate, user.profilePic, user.role, user.siteID
    // Map other fields similarly
  ]);

  images = await preloadImages(signatures);
} else if (table === "injury_reports") {
  reportTitle = "Injury Report";
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

  formattedData = data.map((report, index) => [
    index + 1,
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
  reportTitle = "User Report";
  headers = [
    "S.No",
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

  formattedData = data.map((user, index) => [
    index + 1,
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
    //formatLoginTime(getLastLoginTime(user)),
  ]);

  images = await preloadImages(data.map((user) => user.profilePic));
} else {
  headers = ["FullName", "Email"];
  formattedData = data.map((user) => [user.fullName, user.email]);
}

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setFontSize(6);
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoWidth = 40;
  const logoX = pageWidth - logoWidth - 10;

  // Replace the Firebase logo with the local logo on the right side
  doc.addImage(localLogoBase64, "PNG", logoX, 5, logoWidth, 30);
  doc.addImage(companyLogo, "JPEG", 10, 10, 20, 10);
 {/* if (secondLogo) {
    doc.addImage(secondLogo, "JPG", doc.internal.pageSize.width - 30, 10, 20, 10); // Adjust coordinates as needed
  }*/}
  doc.text(`Company Name: ${currentCompanyData.name ?? 'N/A'}`, 10, 25);
  doc.text(`Report Printed By: ${currentUserData.fullName ?? 'N/A'}`, 10, 30);
  doc.setFontSize(12);
  doc.text(reportTitle, doc.internal.pageSize.width / 2, 20, { align: "center" });

   
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
      columnStyles: { 0: { halign: 'left' }, 1: { halign: 'left' }, 2: { halign: 'left' } },
      pageBreak: 'auto',
      didDrawPage: (data) => {
        // Add footer with date, time, and user email ID
        const dateTime = new Date().toLocaleString();
        const userEmail = currentUserData.email;
  
        doc.setFontSize(6);
        doc.text(
          `${dateTime} - ${userEmail}`,
          doc.internal.pageSize.width - 10,
          doc.internal.pageSize.height - 10,
          { align: "right" }
        );
      },
 
  });

  // Adding footer with page numbers
  const pageCount = doc.internal.getNumberOfPages();
  {/*const loginUser = currentUserData.fullName ?? "Unknown User";
  function getLastLoginTime(user) {
    if (attendance?.find((report) => report.id === user.fullName)) {
      return Object.entries(
        attendance.find((report) => report.id === user.fullName)
      )[1][1].last_login_time;
    } else {
      return "-";
    }
  }*/}
  
   
  doc.setFontSize(6);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    //const footerRightText  = `Generated by: ${loginUser} `;
    //doc.text(`Page ${i} of ${pageCount}`,footerText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: "center" });
    //doc.text(footerText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: "center" });
   //* const footerRightText = `Generated by: ${loginUser} | Login Time: ${getLastLoginTime(currentUserData)}`;


     // Add the page number in the center
  doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: "center" });

  // Add footer text on the bottom-right
 // doc.text(footerRightText, doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 10, { align: "right" });
  


  doc.save(`${fileName}.pdf`);
};
// Helper function to format login time
const formatLoginTime = (timestamp) => {
  if (!timestamp) return "-";
  const date = new Date(Number(timestamp));
  return date.toLocaleString();
}};