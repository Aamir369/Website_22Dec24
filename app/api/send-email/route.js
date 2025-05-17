import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
  // Authorization check
  const authToken = request.headers.get("authorization");
  if (authToken !== `Bearer ${process.env.API_SECRET}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { toEmail, reportData, canvasImage } = await request.json();

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NEXT_PUBLIC_GMAIL_USER,
        pass: process.env.NEXT_PUBLIC_GMAIL_PASS,
      },
    });

    // Helper functions
    const formatList = (items) => {
      if (!items || items.length === 0) return "None";
      return items.map((item) => `• ${item}`).join("<br>");
    };

    const formatEmployee = (emp) => {
      return `
        <div style="margin-left: 20px; margin-bottom: 10px;">
          <strong>Name:</strong> ${emp.name || "N/A"}<br>
          <strong>ID:</strong> ${emp.id || "N/A"}<br>
          <strong>Department:</strong> ${emp.department || "N/A"}<br>
          <strong>Job Title:</strong> ${emp.jobTitle || "N/A"}
        </div>
      `;
    };

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f5f5f5; padding: 20px; text-align: center; border-bottom: 1px solid #ddd; margin-bottom: 20px; }
          .section { margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
          .section-title { color: #2c3e50; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .subsection { margin-left: 15px; margin-bottom: 10px; }
          .item { margin-bottom: 8px; }
          .label { font-weight: bold; }
          .body-map { max-width: 100%; border: 1px solid #ddd; margin: 10px 0; }
          .signature-block { margin-top: 15px; padding-top: 10px; border-top: 1px dashed #ccc; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Incident Investigation Report</h1>
          <p>Submitted on ${new Date(reportData.date).toLocaleDateString()}</p>
        </div>

        <!-- Company Information -->
        <div class="section">
          <div class="section-title">Company Information</div>
          <div class="item"><span class="label">Company ID:</span> ${
            reportData.company_id || "N/A"
          }</div>
          <div class="item"><span class="label">Company Name:</span> ${
            reportData.company_name || "N/A"
          }</div>
        </div>

        <!-- Incident Details -->
        <div class="section">
          <div class="section-title">Incident Details</div>
          <div class="item"><span class="label">Date/Time of Incident:</span> ${
            reportData.injury_data.incidentDateAndTime || "N/A"
          }</div>
          <div class="item"><span class="label">Reported to OHS:</span> ${
            reportData.injury_data.incidentReportedToOHSDateAndTime || "N/A"
          }</div>
          <div class="item"><span class="label">Location:</span> ${
            reportData.injury_data.location || "N/A"
          }</div>
          <div class="item"><span class="label">Injury Category:</span> ${
            reportData.injury_data.category || "N/A"
          }</div>
          
          <div class="subsection">
            <div class="section-title">Event Description</div>
            <p>${reportData.injury_data.events[0].content || "N/A"}</p>
          </div>
          
          ${
            canvasImage
              ? `
            <div class="subsection">
              <div class="section-title">Body Map</div>
              <img src="${canvasImage}" alt="Body Map" class="body-map" />
            </div>
          `
              : ""
          }
        </div>

        <!-- Injured Employees -->
        <div class="section">
          <div class="section-title">Injured Employee(s)</div>
          ${
            reportData.injury_data.injuredEmployees
              ?.map((emp) => formatEmployee(emp))
              .join("") || "None"
          }
        </div>

        <!-- Workplace Conditions -->
        <div class="section">
          <div class="section-title">Workplace Conditions</div>
          <div class="item"><span class="label">Tools/Equipment:</span> ${
            reportData.injury_data.toolsMaterialsEquipment || "N/A"
          }</div>
          <div class="item"><span class="label">Site Conditions:</span> ${
            reportData.injury_data.workSiteConditions || "N/A"
          }</div>
          <div class="subsection">
            <div class="section-title">Unsafe Conditions</div>
            ${formatList(reportData.injury_data.unsafeWorkplaceConditions)}
          </div>
          <div class="subsection">
            <div class="section-title">Unsafe Acts</div>
            ${formatList(reportData.injury_data.unsafeActsByPeople)}
          </div>
        </div>

        <!-- Root Cause Analysis -->
        <div class="section">
          <div class="section-title">Root Cause Analysis</div>
          <div class="subsection">
            <div class="item"><span class="label">Why unsafe conditions exist:</span></div>
            <p>${reportData.injury_data.whyUnsafeConditionsExist || "N/A"}</p>
          </div>
          <div class="subsection">
            <div class="item"><span class="label">Why unsafe acts occurred:</span></div>
            <p>${reportData.injury_data.whyUnsafeActsOccur || "N/A"}</p>
          </div>
        </div>

        <!-- Prevention -->
        <div class="section">
          <div class="section-title">Prevention Measures</div>
          <div class="subsection">
            <div class="item"><span class="label">Suggested Changes:</span></div>
            ${formatList(reportData.injury_data.preventionSuggestions)}
          </div>
          <div class="subsection">
            <div class="item"><span class="label">Actions Taken/Planned:</span></div>
            <p>${reportData.injury_data.preventionActionsTaken || "N/A"}</p>
          </div>
        </div>

        <!-- Signatures -->
        <div class="section">
          <div class="section-title">Signatures</div>
          <div class="subsection signature-block">
            <div class="item"><span class="label">Report Completed By:</span> ${
              reportData.metadata.reportCompletedBy.name || "N/A"
            } (${reportData.metadata.reportCompletedBy.title || "N/A"})</div>
          </div>
          <div class="subsection signature-block">
            <div class="item"><span class="label">Written By:</span> ${
              reportData.metadata.signatures.writtenBy.name || "N/A"
            } (${reportData.metadata.signatures.writtenBy.title || "N/A"})</div>
            <div class="item"><span class="label">Department:</span> ${
              reportData.metadata.signatures.writtenBy.department || "N/A"
            }</div>
            <div class="item"><span class="label">Date:</span> ${
              reportData.metadata.signatures.writtenBy.date || "N/A"
            }</div>
          </div>
          <div class="subsection signature-block">
            <div class="item"><span class="label">Reviewed By:</span> ${
              reportData.metadata.signatures.reviewedBy.name || "N/A"
            } (${
      reportData.metadata.signatures.reviewedBy.title || "N/A"
    })</div>
            <div class="item"><span class="label">Department:</span> ${
              reportData.metadata.signatures.reviewedBy.department || "N/A"
            }</div>
            <div class="item"><span class="label">Date:</span> ${
              reportData.metadata.signatures.reviewedBy.date || "N/A"
            }</div>
          </div>
        </div>

        <!-- Attachments -->
        ${
          reportData.injury_data.attachments?.length > 0
            ? `
          <div class="section">
            <div class="section-title">Attachments</div>
            ${formatList(reportData.injury_data.attachments)}
          </div>
        `
            : ""
        }
      </body>
      </html>
    `;

    // Prepare attachments
    const attachments = [];
    if (canvasImage) {
      attachments.push({
        filename: "body-map.png",
        content: canvasImage.split("base64,")[1],
        encoding: "base64",
      });
    }

    // Send email
    await transporter.sendMail({
      from: `Incident Reporting System <${process.env.NEXT_PUBLIC_GMAIL_USER}>`,
      to: toEmail,
      subject: `Incident Report - ${
        reportData.company_name || "Unknown Company"
      } - ${
        new Date(
          reportData.injury_data.incidentDateAndTime
        ).toLocaleDateString() || "No Date"
      }`,
      html: emailHtml,
      attachments: attachments,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
