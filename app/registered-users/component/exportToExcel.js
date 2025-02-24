import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DateTimeUtility } from "@/lib/utils/DateTimeUtility";
import * as FLHA from "./constant_titles";

export const exportToExcel = (data, fileName, table, attendance) => {

  let headers = [];
  let formattedData = [];
    
  if(table === "flha"){
      headers =   [
        
        "Company ID", "Company Name", "User Name", "User Email", "PPE Inspected",
        "To Do Work", "Site Location", "Submitted Date and Time",
        "Environmental Hazards (Flhf) - Description", "Environmental Hazards (Flhf) - Status",
        "Ergonomics Hazards - Description", "Ergonomics Hazards - Status",
        "Access/Egress Hazards - Description", "Access/Egress Hazards - Status",
        "Overhead/Underground Hazards - Description", "Overhead/Underground Hazards - Status",
        "Equipment/Vac Truck Hazards - Description", "Equipment/Vac Truck Hazards - Status",
        "Personal Limitations Hazards - Description", "Personal Limitations Hazards - Status",
        "All Hazard Remaining", "All Permits Closed Out", "Any Incident",
        "Area Cleaned Up At End", "Master Point Location",
        "Permit Job Number", "Signature URL", "Suggestion Page"
      ] ;
      formattedData = data.flatMap(flha => {
         // Create individual rows for each hazard type to make them appear in separate rows
        return FLHA.environmentalHazards.map((hazard, index) => [
           
          index === 0 ? flha.company_id : "",
          index === 0 ? flha.company_name : "",
          index === 0 ? flha.user_name : "",
          index === 0 ? flha.user_email : "",
          index === 0 ? (flha.data.ppe_inspected ? "True" : "False") : "",
          index === 0 ? flha.data.to_do_work : "",
          index === 0 ? flha.data.site_location : "",
          index === 0 ? dateTimeConversion(flha.submitted_at) : "",
          hazard,
          flha.data.flhf[index] ?? "N/A",
          FLHA.ergonomicsHazards[index] ?? "", flha.data.ergonomics[index] ?? "N/A",
          FLHA.accessEgressHazards[index] ?? "", flha.data.aeHazards[index] ?? "N/A",
          FLHA.overHeadUnderGroundHazards[index] ?? "", flha.data.ouHazards[index] ?? "N/A",
          FLHA.equipmentVacTruckHazards[index] ?? "", flha.data.evtHazards[index] ?? "N/A",
          FLHA.personalLimitationsHazards[index] ?? "", flha.data.plHazards[index] ?? "N/A",
          index === 0 ? (flha.data.job_completion?.all_hazard_remaining ? "True" : "False") : "",
          index === 0 ? (flha.data.job_completion?.all_permits_closed_out ? "True" : "False") : "",
          index === 0 ? (flha.data.job_completion?.any_incident ? "True" : "False") : "",
          index === 0 ? (flha.data.job_completion?.area_cleaned_up_at_end ? "True" : "False") : "",
          index === 0 ? flha.data.job_completion?.master_point_location : "",
          index === 0 ? flha.data.permit_job_number : "",
          index === 0 ? flha.data.signature_url : "",
          index === 0 ? flha.data.suggestionPage.suggestions : ""
        ]);
      });
    }
    else if (table === "users") {
      headers = [ 
        "FullName", "Email", "CompanyName", "BirthDate", "CompanyID",
        "CreatedAt", "JobID", "JoinedDate", "ProfilePic", "Role", "SiteID", "LastLoginAt"
      ];

      function getLastLoginTime(user) {
        if (attendance.find((report) => report.id === user.fullName)) {
          return Object.entries(
            attendance.find((report) => report.id === user.fullName)
          )[1][1].last_login_time;
        } else {
          return "-";
        }
      }

      formattedData = data.map(user  => [ 
        user.fullName, user.email, user.companyName, user.birthDate, user.companyID,
        user.createdAt, user.jobID, user.joinedDate, user.profilePic, user.role, user.siteID,
        formatLoginTime(getLastLoginTime(user))
      ]);
    }
    else if (table === "injury_reports") {
      headers = [        
        "Company Name", "Date", "Reported By", "Category", "Location",
        "Incident Date", "Reported To OHS Date", "Images", "Organizational Factors",
        "Other Circumstances", "Tools/Materials/Equipment", "Work Site Conditions"
      ];
  
      formattedData = data.map(report => [         
        report.company_name, report.date, report.reported_by,
        report.injury_data.category, report.injury_data.location,
        report.injury_data.incidentDateAndTime, report.injury_data.incidentReportedToOHSDateAndTime,
        report.injury_data.events.flatMap(event => event.images).join(", "),
        report.injury_data.organizationalFactors, report.injury_data.otherCircumstances,
        report.injury_data.toolsMaterialsEquipment, report.injury_data.workSiteConditions
      ]);
    }
 
  const wrapTextStyle = { alignment: { wrapText: true, vertical: "top" } };

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...formattedData]);

  // Set wrapText and column widths
  Object.keys(worksheet).forEach(cell => {
    if (cell[0] !== "!") {
      worksheet[cell].s = wrapTextStyle;
    }
  });
  worksheet["!cols"] = headers.map(() => ({ width: 30 }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, table === "injury_reports" ? "Injury Reports" : "FLHA");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
  
};

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
  const formattedTimeIn12Hour = timeFormatter.format(date);
  return `${formattedDate} ${formattedTimeIn12Hour}`;
};

const formatLoginTime = (timestamp) => {
  if (!timestamp) return "-";
  const date = new Date(Number(timestamp));
  return date.toLocaleString();
};