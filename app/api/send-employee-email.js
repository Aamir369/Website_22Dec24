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
    const { toEmail, employeeName, reportData, canvasImage } =
      await request.json();

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NEXT_PUBLIC_GMAIL_USER,
        pass: process.env.NEXT_PUBLIC_GMAIL_PASS,
      },
    });

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
          .body-map { max-width: 100%; border: 1px solid #ddd; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Incident Report Notification</h1>
          <p>Dear ${employeeName || "Employee"},</p>
        </div>

        <div class="section">
          <p>This is to inform you that an incident report has been submitted regarding an incident you were involved in.</p>
          <p><strong>Incident Date:</strong> ${
            new Date(
              reportData.injury_data.incidentDateAndTime
            ).toLocaleDateString() || "N/A"
          }</p>
          <p><strong>Location:</strong> ${
            reportData.injury_data.location || "N/A"
          }</p>
        </div>

        <div class="section">
          <div class="section-title">Incident Description</div>
          <p>${reportData.injury_data.events[0].content || "N/A"}</p>
        </div>

        ${
          canvasImage
            ? `
          <div class="section">
            <div class="section-title">Body Map</div>
            <img src="${canvasImage}" alt="Body Map" class="body-map" />
          </div>
        `
            : ""
        }

        <div class="section">
          <p>Please contact your supervisor or HR department if you have any questions or need further information.</p>
          <p>Best regards,<br>Safety Department</p>
        </div>
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
      from: `Safety Department <${process.env.NEXT_PUBLIC_GMAIL_USER}>`,
      to: toEmail,
      subject: `Incident Report Notification - ${new Date(
        reportData.date
      ).toLocaleDateString()}`,
      html: emailHtml,
      attachments: attachments,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending employee email:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
