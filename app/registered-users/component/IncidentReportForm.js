import { useState, useEffect, useRef } from "react";
import { db, storage } from "@/lib/firebase/firebaseInit";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  setDoc,
  getDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/components/providers/AuthProvider";
import { deleteObject } from "firebase/storage";

const deleteOldCanvasImage = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes("firebase")) return;

  try {
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
    console.log("✅ Old canvas image deleted.");
  } catch (error) {
    console.warn("⚠️ Failed to delete old image:", error);
  }
};

const initialFormData = {
  returnToEmails: "",
  documentTypes: [],
  workdayIncident: [],
  workdayIncidentOther: "",
  reportCompletedByName: "",
  reportCompletedByTitle: "",
  dateOfIncident: "",
  dateOfReport: "",
  preventionSuggestions: [],
  preventionSuggestionsOther: "",
  preventionActionsTaken: "",
  reportWrittenByName: "",
  reportWrittenByTitle: "",
  reportWrittenByDepartment: "",
  reportWrittenByDate: "",
  reportReviewedByName: "",
  reportReviewedByTitle: "",
  reportReviewedByDepartment: "",
  reportReviewedByDate: "",
  reportSubmittedByName: "",
  reportSubmittedBySignature: "",
  reportSubmittedByDate: "",
  reportReceivedByName: "",
  reportReceivedBySignature: "",
  reportReceivedByDate: "",
  investigationTeamMembers: [{ name: "", title: "" }],
  reported_by: "",
  injuredEmployees: [
    {
      name: "",
      id: "",
      email: "",
      dateOfBirth: "",
      jobTitle: "",
      department: "",
      employeeType: "",
      lengthOfTime: "",
    },
  ],
  injuryOptions: [],
  location: "",
  incidentDescription: "",
  protectiveEquipment: "",
  witnesses: [""],
  unsafeWorkplaceConditions: [],
  otherUnsafeCondition: "",
  unsafeActsByPeople: [],
  otherUnsafeAct: "",
  whyUnsafeConditionsExist: "",
  whyUnsafeActsOccur: "",
  workplaceCultureEncouraged: "",
  workplaceCultureDescription: "",
  unsafeActsReported: "",
  similarIncidentsPrior: "",
  attachments: [],
};

export default function IncidentReportForm({
  report,
  onBack,
  onReturnToWorkPlan,
}) {
  const isPrefilled = report != null;
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [imageSrc, setImageSrc] = useState("/video/frontandbackbody.png");
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const imageRef = useRef(null);
  const descriptionRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Fetch manager details and incident data
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.email) return;

      try {
        // Fetch manager details
        const userQuery = query(
          collection(db, "users"),
          where("email", "==", currentUser.email)
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setFormData((prev) => ({
            ...prev,
            reportCompletedByName: userData.fullName || "",
            reportCompletedByTitle: userData.title || "",
            reportWrittenByName: userData.fullName || "",
            reportWrittenByTitle: userData.title || "",
            reportWrittenByDepartment: userData.department || "",
          }));
        }

        // If report exists, fetch incident data
        if (report) {
          console.log("Report data:", report);
          setFormData((prev) => ({
            ...prev,
            reported_by: report.reported_by || "",
            location: report.injury_data?.location || "",
            dateOfIncident: report.injury_data?.incidentDateAndTime
              ? report.injury_data.incidentDateAndTime.slice(0, 16)
              : "",
            dateOfReport: report.injury_data?.incidentReportedToOHSDateAndTime
              ? report.injury_data.incidentReportedToOHSDateAndTime.slice(0, 16)
              : "",
            injuryOptions: report.injuryOptions?.InjuryType || [],
            natureOfInjury: report.injury_data?.category || "",
            protectiveEquipment:
              report.injury_data?.toolsMaterialsEquipment || "",
            incidentDescription: report?.events?.[0]?.content || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [currentUser, report]);

  const toggleEraser = () => {
    setIsErasing(!isErasing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const injuryOptions = [
    "Abrasion, scrapes",
    "Amputation",
    "Broken Bone",
    "Bruise",
    "Burn (heat)",
    "Burn (chemical)",
    "Concussion",
    "Crushing Injury",
    "Cut, laceration, puncture",
    "Hernia",
    "Illness",
    "Sprain, strain",
    "Damage to body system",
    "Other (describe)",
  ];

  const workplaceConditions = [
    "Inadequate guard",
    "Unguarded hazard",
    "Safety device is defective",
    "Tool or equipment defective",
    "Workstation layout is hazardous",
    "Unsafe lighting",
    "Unsafe ventilation",
    "Lack of needed personal protective equipment",
    "Lack of appropriate equipment / tools",
    "Unsafe clothing",
    "No training or insufficient training",
  ];

  const actsByPeople = [
    "Operating without permissions",
    "Operating at unsafe speed",
    "Servicing equipment that has power to it",
    "Making a safety device inoperative",
    "Using defective equipment",
    "Using equipment in an unapproved way",
    "Unsafe lifting",
    "Taking an unsafe position or posture",
    "Distraction, teasing, horseplay",
    "Failure to wear personal protective equipment",
    "Failure to use the available equipment / tools",
  ];

  const addInjuredEmployee = () => {
    setFormData({
      ...formData,
      injuredEmployees: [
        ...formData.injuredEmployees,
        {
          name: "",
          id: "",
          dateOfBirth: "",
          jobTitle: "",
          department: "",
          employeeType: "",
          lengthOfTime: "",
        },
      ],
    });
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    console.log("Mouse down at", e.clientX, e.clientY);
    setHasDrawn(true);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isErasing) {
      ctx.clearRect(x - 15, y - 15, 30, 30);
    } else {
      ctx.lineTo(x, y);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const prepareCanvasImageForPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL("image/png");

    const img = document.createElement("img");
    img.src = dataURL;
    img.style.width = "100%";

    canvas.style.display = "none";
    const parent = canvas.parentElement;
    parent.insertBefore(img, canvas);

    return img;
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById("incident-report-form");
    if (!element) return;

    import("html2pdf.js").then((html2pdf) => {
      html2pdf
        .default()
        .set({
          margin: 0.5,
          filename: `Incident_Report_${report?.id || Date.now()}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .from(element)
        .save();
    });
  };

  const getCanvasBlob = () => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      const image = imageRef.current;

      if (!canvas || !image) {
        console.error(
          "❌ Canvas or image not found. canvas:",
          canvas,
          "image:",
          image
        );
        reject("Canvas or image not found");
        return;
      }

      const tempCanvas = document.createElement("canvas");
      const ctx = tempCanvas.getContext("2d");

      tempCanvas.width = image.clientWidth;
      tempCanvas.height = image.clientHeight;

      ctx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);
      ctx.drawImage(canvas, 0, 0);

      tempCanvas.toBlob((blob) => {
        if (!blob) {
          console.error("❌ Blob generation failed");
          reject("Blob generation failed");
        } else {
          resolve(blob);
        }
      }, "image/png");
    });
  };

  const uploadAttachments = async () => {
    if (!formData.attachments || formData.attachments.length === 0) return [];

    const uploadedURLs = [];

    for (const file of formData.attachments) {
      const fileRef = ref(
        storage,
        `incident_attachments/${Date.now()}_${file.name}`
      );
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      uploadedURLs.push({
        name: file.name,
        url: url,
      });
    }

    return uploadedURLs;
  };

  const uploadCanvasImage = async () => {
    try {
      console.log("uploadCanvasImage CALLED");

      const blob = await getCanvasBlob().catch((error) => {
        console.error("Failed to get canvas blob:", error);
        return null;
      });
      if (!blob) return;

      const storageRef = ref(
        storage,
        `injure_data/marked_body_parts/${Date.now()}.png`
      );
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef).catch((error) => {
        console.error("Failed to get download URL:", error);
        return null;
      });
      if (!downloadURL) return;

      console.log("Download URL:", downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("Error in uploadCanvasImage:", error);
    }
  };

  const handleCheckboxChange = (e, fieldName) => {
    if (!e || !e.target) {
      console.error("handleCheckboxChange called without valid event!");
      return;
    }

    const { value, checked } = e.target;

    if (checked) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: [...(prev[fieldName] || []), value],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: prev[fieldName].filter((item) => item !== value),
      }));
    }
  };

  const handleEmployeeChange = (index, field, value) => {
    const updatedEmployees = [...formData.injuredEmployees];
    updatedEmployees[index][field] = value;
    setFormData({ ...formData, injuredEmployees: updatedEmployees });
  };

  const removeInjuredEmployee = (index) => {
    const updatedEmployees = formData.injuredEmployees.filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, injuredEmployees: updatedEmployees });
  };

  const handleClearForm = () => {
    setFormData(initialFormData);
  };

  const validateForm = () => {
    const requiredFields = [
      "returnToEmails",
      "dateOfIncident",
      "dateOfReport",
      "incidentDescription",
      "location",
      "protectiveEquipment",
      "whyUnsafeConditionsExist",
      "whyUnsafeActsOccur",
      "preventionActionsTaken",
      "reportWrittenByName",
      "reportWrittenByTitle",
      "reportWrittenByDepartment",
      "reportWrittenByDate",
      "reportReviewedByName",
      "reportReviewedByTitle",
      "reportReviewedByDepartment",
      "reportReviewedByDate",
      "reportSubmittedByName",
      "reportSubmittedBySignature",
      "reportSubmittedByDate",
      "reportReceivedByName",
      "reportReceivedBySignature",
      "reportReceivedByDate",
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === "") {
        alert(`Please fill out the field: ${field}`);
        return false;
      }
    }

    if (formData.documentTypes.length === 0) {
      alert("Please select at least one Document Type.");
      return false;
    }

    if (
      formData.injuredEmployees.length === 0 ||
      formData.injuredEmployees.some(
        (emp) =>
          !emp.name ||
          !emp.id ||
          !emp.dateOfBirth ||
          !emp.jobTitle ||
          !emp.department ||
          !emp.employeeType ||
          !emp.lengthOfTime
      )
    ) {
      alert("Please complete all Injured Employee fields.");
      return false;
    }

    if (formData.injuryOptions?.length === 0) {
      alert("Please select at least one Nature of Injury.");
      return false;
    }

    if (formData.unsafeWorkplaceConditions?.length === 0) {
      alert("Please select at least one Unsafe Workplace Condition.");
      return false;
    }

    if (formData.unsafeActsByPeople?.length === 0) {
      alert("Please select at least one Unsafe Act by People.");
      return false;
    }

    if (formData.preventionSuggestions?.length === 0) {
      alert("Please select at least one Prevention Suggestion.");
      return false;
    }

    if (!["YES", "NO"].includes(formData.workplaceCultureEncouraged)) {
      alert("Please answer the Workplace Culture Encouragement question.");
      return false;
    }

    if (!["YES", "NO"].includes(formData.unsafeActsReported)) {
      alert("Please answer if unsafe acts were previously reported.");
      return false;
    }

    if (!["YES", "NO"].includes(formData.similarIncidentsPrior)) {
      alert("Please answer if similar incidents occurred before.");
      return false;
    }

    return true;
  };

  const sendEmailToInjuredEmployees = async (
    employees,
    reportData,
    canvasImage
  ) => {
    try {
      for (const employee of employees) {
        if (employee.email) {
          try {
            const response = await fetch("/api/send-employee-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}`,
              },
              body: JSON.stringify({
                toEmail: employee.email,
                employeeName: employee.name,
                reportData: reportData,
                canvasImage: canvasImage,
              }),
            });

            const result = await response.json();

            if (!response.ok) {
              console.error(
                `Failed to send email to ${employee.email}:`,
                result.error
              );
            } else {
              console.log(`Email sent successfully to ${employee.email}`);
            }
          } catch (emailError) {
            console.error(
              `Error sending email to ${employee.email}:`,
              emailError
            );
          }
        }
      }
    } catch (error) {
      console.error("Error in sendEmailToInjuredEmployees:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare canvas image if drawn on
      let canvasImage = null;
      if (hasDrawn && canvasRef.current) {
        canvasImage = canvasRef.current.toDataURL("image/png");
      }

      // Upload attachments
      const uploadedAttachments = await uploadAttachments();

      // Prepare the document data structure
      const docData = {
        company_id: formData.employeeId || "",
        company_name: formData.reported_by || "",
        date: new Date().toISOString(),
        injury_data: {
          activities: [], // Can be mapped from formData if needed
          category: formData.natureOfInjury || "",
          events: [
            {
              content: formData.incidentDescription || "",
              heading: formData.incidentDescription || "",
              images: canvasImage ? [canvasImage] : [],
            },
          ],
          location: formData.location || "",
          incidentDateAndTime: formData.dateOfIncident || "",
          incidentReportedToOHSDateAndTime: formData.dateOfReport || "",
          injuredEmployees: formData.injuredEmployees.map((emp) => ({
            name: emp.name,
            id: emp.id,
            dateOfBirth: emp.dateOfBirth,
            jobTitle: emp.jobTitle,
            department: emp.department,
            employeeType: emp.employeeType,
            lengthOfTime: emp.lengthOfTime,
          })),

          organizationalFactors: formData.incidentDescription || "",
          otherCircumstances: formData.incidentDescription || "",
          toolsMaterialsEquipment: formData.protectiveEquipment || "",
          workSiteConditions:
            formData.unsafeWorkplaceConditions.join(", ") || "",

          injuryType: formData.injuryOptions,
          witnesses: formData.witnesses,
          unsafeWorkplaceConditions: formData.unsafeWorkplaceConditions,
          unsafeActsByPeople: formData.unsafeActsByPeople,
          whyUnsafeConditionsExist: formData.whyUnsafeConditionsExist,
          whyUnsafeActsOccur: formData.whyUnsafeActsOccur,
          preventionSuggestions: formData.preventionSuggestions,
          preventionActionsTaken: formData.preventionActionsTaken,
          attachments: uploadedAttachments.map((att) => att.name),
        },
        metadata: {
          reportCompletedBy: {
            name: formData.reportCompletedByName || "",
            title: formData.reportCompletedByTitle || "",
          },
          signatures: {
            writtenBy: {
              name: formData.reportWrittenByName || "",
              title: formData.reportWrittenByTitle || "",
              department: formData.reportWrittenByDepartment || "",
              date: formData.reportWrittenByDate || "",
            },
            reviewedBy: {
              name: formData.reportReviewedByName || "",
              title: formData.reportReviewedByTitle || "",
              department: formData.reportReviewedByDepartment || "",
              date: formData.reportReviewedByDate || "",
            },
            investigationTeam: formData.investigationTeamMembers,
          },
        },
      };

      // Save to Firestore
      let docRef;
      if (!report?.id) {
        docRef = await addDoc(collection(db, "incidentReports"), docData);
      } else {
        docRef = doc(db, "incidentReports", report.id);
        await setDoc(docRef, docData, { merge: true });
      }

      // Get the saved document data including the ID
      const docSnapshot = await getDoc(docRef);
      const fullDocData = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      };

      // Send email if returnToEmails is provided
      if (formData.returnToEmails) {
        try {
          const response = await fetch("/api/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}`,
            },
            body: JSON.stringify({
              toEmail: formData.returnToEmails,
              reportData: fullDocData,
              canvasImage: canvasImage,
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || "Failed to send email");
          }
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
        }
      }

      await sendEmailToInjuredEmployees(
        formData.injuredEmployees,
        fullDocData,
        canvasImage
      );

      alert("Report submitted and emails sent successfully!");
      setHasDrawn(false);

      setHasDrawn(false);

      // Navigate to Return to Work Plan if provided
      if (onReturnToWorkPlan) {
        onReturnToWorkPlan();
      }
    } catch (error) {
      console.error("❌ Failed to save incident report:", error);
      alert("❌ Submission failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInjuredEmployeesFromReports = async () => {
      try {
        const reportsSnapshot = await getDocs(
          collection(db, "incidentReports")
        );
        const allEmployees = [];

        reportsSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const employees = data?.injury_data?.injuredEmployees || [];

          employees.forEach((emp) => {
            if (emp.name) {
              allEmployees.push({
                name: emp.name || "",
                id: emp.id || "",
                department: emp.department || "",
                jobTitle: emp.jobTitle || "",
                employeeType: emp.employeeType || "",
                lengthOfTime: emp.lengthOfTime || "",
                dateOfBirth: emp.dateOfBirth || "",
              });
            }
          });
        });

        // إزالة التكرارات إذا وجدت
        const uniqueEmployees = Array.from(
          new Map(
            allEmployees.map((emp) => [`${emp.name}-${emp.id}`, emp])
          ).values()
        );

        setFormData((prev) => ({
          ...prev,
          injuredEmployees: uniqueEmployees,
        }));
      } catch (error) {
        console.error("❌ Failed to fetch injured employees:", error);
      }
    };

    fetchInjuredEmployeesFromReports();
  }, []);

  return (
    <div id="incident-report-form" className="min-h-screen p-4 bg-gray-400">
      <div className="max-w-4xl mx-auto p-8 bg-white border-4 border-black border-double rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <h1 className="text-xl font-bold mb-4">
            Supervisor's Incident Investigation Report
          </h1>
          <input
            type="email"
            name="returnToEmails"
            placeholder="Return completed form to (email addresses)"
            value={formData.returnToEmails}
            onChange={handleChange}
            className="border w-full bg-[#edf2f9] mb-2 p-2"
          />
          <label className="block font-medium mb-1">
            THIS FORM SERVES TO DOCUMENT (select all that apply):{" "}
          </label>
          <div className="flex flex-wrap gap-6 mb-4 bg-[#edf2f9]">
            {[
              "Death",
              "Lost Time",
              "ER / Clinic Treatment",
              "First Aid Only",
              "Near Miss",
            ].map((item) => (
              <label
                key={item}
                className="flex items-center border border-gray-400 rounded px-3 py-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="documentTypes"
                  value={item}
                  checked={formData.documentTypes.includes(item)}
                  onChange={(e) => handleCheckboxChange(e, "documentTypes")}
                  className="mr-2"
                />
                {item}
              </label>
            ))}
          </div>

          <div className="mb-6 space-y-2">
            <div className="flex flex-wrap">
              <label className="w-1/4 font-medium mb-1">Name</label>
              <label className="w-1/4 font-medium mb-1">Title</label>
              <label className="w-1/4 font-medium mb-1">
                Date of Incident & Time
              </label>
              <label className="w-1/4 font-medium mb-1">
                Date of Reporting & Time
              </label>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                name="reportCompletedByName"
                placeholder="Name"
                value={formData.reportCompletedByName}
                readOnly
                className={`border bg-[#edf2f9] p-2 ${
                  isPrefilled ? "text-red-600 font-semibold" : ""
                }`}
              />
              <input
                type="text"
                name="reportCompletedByTitle"
                placeholder="Title"
                value={formData.reportCompletedByTitle}
                readOnly
                className="border w-1/4 p-2 bg-gray-100 bg-[#edf2f9]"
              />
              <input
                type="datetime-local"
                name="dateOfIncident"
                value={formData.dateOfIncident}
                onChange={handleChange}
                className={`border bg-[#edf2f9] p-2 ${
                  isPrefilled ? "text-red-600 font-semibold" : ""
                }`}
              />
              <input
                type="datetime-local"
                name="dateOfReport"
                value={formData.dateOfReport}
                onChange={handleChange}
                className={`border bg-[#edf2f9] p-2 ${
                  isPrefilled ? "text-red-600 font-semibold" : ""
                }`}
              />
            </div>
          </div>

          <div className="mb-6 space-y-2">
            <div className="flex space-x-2 mb-1">
              <label className="w-1/3 text-sm font-medium">
                Reporting Employee
              </label>
            </div>
            <div className="flex space-x-2">
              <input
                name="reported_by"
                placeholder="Employee Name"
                value={formData.reported_by}
                onChange={handleChange}
                className={`border bg-[#edf2f9] p-2 ${
                  isPrefilled ? "text-red-600 font-semibold" : ""
                }`}
              />
            </div>
          </div>

          {/* Rest of your form components remain the same... */}
          {/* Injured Employees section */}
          <div className="mb-6 space-y-2">
            <label className="block font-medium mb-1">
              Injured Employee(s):
            </label>
            {formData.injuredEmployees.map((employee, index) => (
              <div key={index} className="border p-3 mb-3 rounded bg-gray-50">
                <div className="flex flex-wrap gap-2 mb-2">
                  <input
                    name={`injuredEmployeeName${index}`}
                    placeholder="Employee Name"
                    value={employee.name}
                    onChange={(e) =>
                      handleEmployeeChange(index, "name", e.target.value)
                    }
                    className="border w-1/4 p-2 bg-[#edf2f9]"
                  />
                  <input
                    name={`injuredEmployeeId${index}`}
                    placeholder="Employee ID"
                    value={employee.id}
                    onChange={(e) =>
                      handleEmployeeChange(index, "id", e.target.value)
                    }
                    className="border w-1/4 p-2 bg-[#edf2f9] "
                  />
                  <input
                    type="date"
                    name={`injuredEmployeeDOB${index}`}
                    value={employee.dateOfBirth}
                    onChange={(e) =>
                      handleEmployeeChange(index, "dateOfBirth", e.target.value)
                    }
                    className="border w-1/4 p-2 bg-[#edf2f9]"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <input
                    name={`jobTitle${index}`}
                    placeholder="Job Title"
                    value={employee.jobTitle}
                    onChange={(e) =>
                      handleEmployeeChange(index, "jobTitle", e.target.value)
                    }
                    className="border w-1/4 p-2 bg-[#edf2f9]"
                  />
                  <input
                    name={`department${index}`}
                    placeholder="Department"
                    value={employee.department}
                    onChange={(e) =>
                      handleEmployeeChange(index, "department", e.target.value)
                    }
                    className="border w-1/4 p-2 bg-[#edf2f9]"
                  />
                  <input
                    name={`employeeType${index}`}
                    placeholder="Employee Type"
                    value={employee.employeeType}
                    onChange={(e) =>
                      handleEmployeeChange(
                        index,
                        "employeeType",
                        e.target.value
                      )
                    }
                    className="border w-1/4 p-2 bg-[#edf2f9]"
                  />
                  <input
                    name={`lengthOfTime${index}`}
                    placeholder="Length of Time in Job"
                    value={employee.lengthOfTime}
                    onChange={(e) =>
                      handleEmployeeChange(
                        index,
                        "lengthOfTime",
                        e.target.value
                      )
                    }
                    className="border w-1/4 p-2 bg-[#edf2f9]"
                  />
                  <button
                    type="button"
                    onClick={addInjuredEmployee}
                    className="bg-green-500 text-white px-2 rounded"
                  >
                    +
                  </button>
                  {formData.injuredEmployees.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInjuredEmployee(index)}
                      className="bg-red-500 text-white px-2 rounded"
                    >
                      -
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Nature of Injury section */}
          <h2 className="font-semibold text-lg">
            Nature Of Injury{" "}
            <span className="italic text-sm">(select all that apply)</span>
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {injuryOptions.map((injury, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={injury}
                  checked={(formData.injuryOptions || []).includes(injury)}
                  onChange={(e) => handleCheckboxChange(e, "injuryOptions")}
                  className="h-4 w-4"
                />
                <span>{injury}</span>
              </label>
            ))}
          </div>

          {(formData.injuryOptions || []).includes("Other (describe)") && (
            <div className="mt-2">
              <label className="block font-medium">
                Please describe other injury:
              </label>
              <input
                type="text"
                name="otherInjuryDescription"
                value={formData.otherInjuryDescription || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    otherInjuryDescription: e.target.value,
                  })
                }
                className="border rounded w-full p-2"
                placeholder="Describe the injury..."
              />
            </div>
          )}

          {/* Description of Injury and Body Map section */}
          <div className="flex gap-4 items-start pt-4 items-stretch">
            <div className="flex-1 h-full">
              <h2 className="font-semibold mb-2">Description of Injury</h2>
              <textarea
                value={formData.incidentDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    incidentDescription: e.target.value,
                  }))
                }
                ref={descriptionRef}
                style={{ height: `${450}px` }}
                className="bg-[#edf2f9] w-full border rounded h-40 p-2"
                placeholder="Describe the injury..."
              />
            </div>

            <div className="flex-1 h-full">
              <h2 className="font-semibold mb-2">
                Part of Body Affected (draw to mark)
              </h2>
              <div className="relative inline-block w-full h-full">
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Body Map"
                  style={{ width: "100%", height: "auto", zIndex: 1 }}
                  className="w-full object-contain select-none"
                />
                <canvas
                  ref={canvasRef}
                  width={imageRef.current?.clientWidth || 500}
                  height={imageRef.current?.clientHeight || 500}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="absolute top-0 left-0"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 10,
                    cursor: isErasing ? "not-allowed" : "crosshair",
                  }}
                />
                <button
                  type="button"
                  onClick={toggleEraser}
                  className={`px-3 py-1 rounded ${
                    isErasing ? "bg-yellow-400" : "bg-gray-300"
                  }`}
                >
                  {isErasing ? "Erasing..." : "Eraser Mode"}
                </button>
              </div>
            </div>
          </div>

          {/* Location and other form sections */}
          <input
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className={`border w-full p-2 ${
              isPrefilled ? "text-red-600 font-semibold" : ""
            }`}
          />

          {/* Workday Incident section */}
          <div className="w-full border rounded p-2 bg-gray-50 mb-4">
            <label className="font-medium block mb-1">
              What part of the employee's workday did the incident occur?
            </label>
            <div className="grid grid-cols-3 gap-px border border-gray-400 text-sm">
              <label className="flex items-center gap-2 p-2 border border-gray-300 bg-gray-100">
                <input
                  type="checkbox"
                  name="workdayIncident"
                  value="Entering or leaving work"
                  onChange={(e) => handleCheckboxChange(e, "workdayIncident")}
                />
                Entering or leaving work
              </label>
              <label className="flex items-center gap-2 p-2 border border-gray-300 bg-gray-100 col-span-2">
                <input
                  type="checkbox"
                  name="workdayIncident"
                  value="Doing normal work activities"
                  onChange={(e) => handleCheckboxChange(e, "workdayIncident")}
                />
                Doing normal work activities
              </label>
              <label className="flex items-center gap-2 p-2 border border-gray-300 bg-gray-100">
                <input
                  type="checkbox"
                  name="workdayIncident"
                  value="During meal period"
                  onChange={(e) => handleCheckboxChange(e, "workdayIncident")}
                />
                During meal period
              </label>
              <label className="flex items-center gap-2 p-2 border border-gray-300 bg-gray-100">
                <input
                  type="checkbox"
                  name="workdayIncident"
                  value="During break"
                  onChange={(e) => handleCheckboxChange(e, "workdayIncident")}
                />
                During break
              </label>
              <label className="flex items-center gap-2 p-2 border border-gray-300 bg-gray-100">
                <input
                  type="checkbox"
                  name="workdayIncident"
                  value="Working overtime"
                  onChange={(e) => handleCheckboxChange(e, "workdayIncident")}
                />
                Working overtime
              </label>
              <label className="flex items-center gap-2 p-2 border border-gray-300 bg-gray-100 col-span-3">
                <input
                  type="checkbox"
                  name="workdayIncident"
                  value="Other"
                  onChange={(e) => handleCheckboxChange(e, "workdayIncident")}
                />
                Other, describe:
                <input
                  type="text"
                  name="workdayIncidentOther"
                  value={formData.workdayIncidentOther || ""}
                  onChange={handleChange}
                  className="border border-gray-300 flex-1 p-1 bg-[#edf2f9] w-full"
                />
              </label>
            </div>
          </div>

          {/* Witnesses and Protective Equipment section */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">
                WITNESSES <span className="italic text-sm">if any</span>
              </label>
              {formData.witnesses.map((witness, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={witness}
                    onChange={(e) => {
                      const updatedWitnesses = [...formData.witnesses];
                      updatedWitnesses[index] = e.target.value;
                      setFormData({ ...formData, witnesses: updatedWitnesses });
                    }}
                    placeholder={`Witness ${index + 1}`}
                    className="border w-full p-2"
                  />
                  {formData.witnesses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updatedWitnesses = formData.witnesses.filter(
                          (_, i) => i !== index
                        );
                        setFormData({
                          ...formData,
                          witnesses: updatedWitnesses,
                        });
                      }}
                      className="bg-red-500 text-white px-2 rounded"
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    witnesses: [...formData.witnesses, ""],
                  })
                }
                className="bg-green-500 text-white px-2 rounded"
              >
                Add Witness
              </button>
            </div>

            <div className="flex-1">
              <label className="block font-medium mb-1">
                PROTECTIVE EQUIPMENT{" "}
                <span className="italic text-sm">
                  List any personal protective equipment used at the time of the
                  incident.
                </span>
              </label>
              <textarea
                name="protectiveEquipment"
                value={formData.protectiveEquipment}
                onChange={handleChange}
                className={`border bg-[#edf2f9] p-2 ${
                  isPrefilled ? "text-red-600 font-semibold" : ""
                }`}
                placeholder="Enter protective equipment..."
              />
            </div>
          </div>

          {/* Attachments section */}
          <div className="mb-6 space-y-2">
            <label className="block font-medium mb-1">
              ATTACHMENTS (Upload files to be submitted with this report):
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  attachments: Array.from(e.target.files),
                })
              }
              className="w-full border border-gray-300 rounded px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.attachments.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm text-green-700">
                {formData.attachments.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Unsafe Conditions and Acts sections */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-1">
                UNSAFE WORKPLACE CONDITIONS (select all that apply)
              </h3>
              {workplaceConditions.map((condition, idx) => (
                <label key={idx} className="block mb-4">
                  <input
                    type="checkbox"
                    checked={formData.unsafeWorkplaceConditions.includes(
                      condition
                    )}
                    onChange={() => {
                      const updated =
                        formData.unsafeWorkplaceConditions.includes(condition)
                          ? formData.unsafeWorkplaceConditions.filter(
                              (c) => c !== condition
                            )
                          : [...formData.unsafeWorkplaceConditions, condition];
                      setFormData({
                        ...formData,
                        unsafeWorkplaceConditions: updated,
                      });
                    }}
                    className="mr-2"
                  />
                  {condition}
                </label>
              ))}
              <div className="mt-2">
                <label>Other; Describe below:</label>
                <textarea
                  value={formData.otherUnsafeCondition || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      otherUnsafeCondition: e.target.value,
                    })
                  }
                  className="border p-2 bg-[#edf2f9] w-full"
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-1">
                UNSAFE ACTS BY PEOPLE (select all that apply)
              </h3>
              {actsByPeople.map((act, idx) => (
                <label key={idx} className="block mb-4">
                  <input
                    type="checkbox"
                    checked={formData.unsafeActsByPeople.includes(act)}
                    onChange={() => {
                      const updated = formData.unsafeActsByPeople.includes(act)
                        ? formData.unsafeActsByPeople.filter((a) => a !== act)
                        : [...formData.unsafeActsByPeople, act];
                      setFormData({ ...formData, unsafeActsByPeople: updated });
                    }}
                    className="mr-2"
                  />
                  {act}
                </label>
              ))}
              <div className="mt-2">
                <label>Other; Describe below:</label>
                <textarea
                  value={formData.otherUnsafeAct || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, otherUnsafeAct: e.target.value })
                  }
                  className="border p-2 bg-[#edf2f9] w-full"
                />
              </div>
            </div>
          </div>

          {/* Why sections */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-medium mb-1">
                Why did the unsafe conditions exist?
              </label>
              <textarea
                name="whyUnsafeConditionsExist"
                value={formData.whyUnsafeConditionsExist || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whyUnsafeConditionsExist: e.target.value,
                  })
                }
                className="border p-2 bg-[#edf2f9] w-full h-32"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Why did the unsafe acts occur?
              </label>
              <textarea
                name="whyUnsafeActsOccur"
                value={formData.whyUnsafeActsOccur || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whyUnsafeActsOccur: e.target.value,
                  })
                }
                className="border p-2 bg-[#edf2f9] w-full h-32"
              />
            </div>
          </div>

          {/* Workplace Culture questions */}
          <div className="space-y-4 mb-4">
            <div className="border rounded p-2">
              <label className="font-medium block mb-1">
                Is there a workplace culture, norm, or expectation that may have
                encouraged the unsafe conditions or acts?
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="workplaceCultureEncouraged"
                    value="YES"
                    checked={formData.workplaceCultureEncouraged === "YES"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workplaceCultureEncouraged: e.target.value,
                      })
                    }
                  />
                  YES
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="workplaceCultureEncouraged"
                    value="NO"
                    checked={formData.workplaceCultureEncouraged === "NO"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workplaceCultureEncouraged: e.target.value,
                      })
                    }
                  />
                  NO
                </label>
              </div>

              {formData.workplaceCultureEncouraged === "YES" && (
                <div className="mt-2">
                  <label className="block font-medium mb-1">
                    If yes, describe:
                  </label>
                  <textarea
                    name="workplaceCultureDescription"
                    value={formData.workplaceCultureDescription || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workplaceCultureDescription: e.target.value,
                      })
                    }
                    className="border p-2 bg-[#edf2f9] w-full"
                    placeholder="Describe..."
                  />
                </div>
              )}
            </div>

            <div className="border rounded p-2">
              <label className="font-medium block mb-1">
                Were the unsafe acts or conditions reported prior to the
                incident?
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="unsafeActsReported"
                    value="YES"
                    checked={formData.unsafeActsReported === "YES"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unsafeActsReported: e.target.value,
                      })
                    }
                  />
                  YES
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="unsafeActsReported"
                    value="NO"
                    checked={formData.unsafeActsReported === "NO"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unsafeActsReported: e.target.value,
                      })
                    }
                  />
                  NO
                </label>
              </div>
            </div>

            <div className="border rounded p-2">
              <label className="font-medium block mb-1">
                Have there been similar incidents or near misses prior to this
                one?
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="similarIncidentsPrior"
                    value="YES"
                    checked={formData.similarIncidentsPrior === "YES"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        similarIncidentsPrior: e.target.value,
                      })
                    }
                  />
                  YES
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="similarIncidentsPrior"
                    value="NO"
                    checked={formData.similarIncidentsPrior === "NO"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        similarIncidentsPrior: e.target.value,
                      })
                    }
                  />
                  NO
                </label>
              </div>
            </div>
          </div>

          {/* Prevention Suggestions and Actions */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-semibold mb-2">
                What changes do you suggest to prevent this incident / near miss
                from happening again?
                <span className="italic text-sm"> (select all that apply)</span>
              </h3>
              {[
                "Stop this activity",
                "Guard the hazard",
                "Train the employee(s)",
                "Train the supervisor(s)",
                "Redesign task steps",
                "Redesign work station",
                "Write a new policy / rule",
                "Enforce existing policy",
                "Routinely inspect for the hazard",
                "Personal protective equipment",
              ].map((suggestion, idx) => (
                <label key={idx} className="block">
                  <input
                    type="checkbox"
                    checked={formData.preventionSuggestions?.includes(
                      suggestion
                    )}
                    onChange={() => {
                      const updated = formData.preventionSuggestions?.includes(
                        suggestion
                      )
                        ? formData.preventionSuggestions.filter(
                            (s) => s !== suggestion
                          )
                        : [
                            ...(formData.preventionSuggestions || []),
                            suggestion,
                          ];
                      setFormData({
                        ...formData,
                        preventionSuggestions: updated,
                      });
                    }}
                    className="mr-2"
                  />
                  {suggestion}
                </label>
              ))}

              <div className="mt-2">
                <label>Other; Describe below:</label>
                <textarea
                  name="preventionSuggestionsOther"
                  value={formData.preventionSuggestionsOther || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preventionSuggestionsOther: e.target.value,
                    })
                  }
                  className="border p-2 bg-[#edf2f9] w-full"
                  placeholder="Describe other suggestions..."
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                What should be (or has been) done to carry out the suggestion(s)
                selected above?
              </h3>
              <textarea
                name="preventionActionsTaken"
                value={formData.preventionActionsTaken || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preventionActionsTaken: e.target.value,
                  })
                }
                className="border p-2 w-full h-full min-h-[300px] bg-[#edf2f9] w-full"
                placeholder="Describe actions taken..."
              />
            </div>
          </div>

          {/* Report Written By section */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-1">REPORT WRITTEN BY</h3>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  name="reportWrittenByName"
                  value={formData.reportWrittenByName || ""}
                  onChange={handleChange}
                  placeholder="Name"
                  className="border p-2 bg-[#edf2f9] w-full"
                />
                <input
                  name="reportWrittenByTitle"
                  value={formData.reportWrittenByTitle || ""}
                  onChange={handleChange}
                  placeholder="Title"
                  className="border p-2 bg-[#edf2f9] w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="reportWrittenByDepartment"
                  value={formData.reportWrittenByDepartment || ""}
                  onChange={handleChange}
                  placeholder="Department"
                  className="border p-2 bg-[#edf2f9] w-full"
                />
                <input
                  type="date"
                  name="reportWrittenByDate"
                  value={formData.reportWrittenByDate || ""}
                  onChange={handleChange}
                  className="border p-2 bg-[#edf2f9] w-full"
                />
              </div>
            </div>

            {/* Report Reviewed By section */}
            <div>
              <h3 className="font-semibold mb-1">REPORT REVIEWED BY</h3>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  name="reportReviewedByName"
                  value={formData.reportReviewedByName || ""}
                  onChange={handleChange}
                  placeholder="Name"
                  className="border p-2 bg-[#edf2f9] w-full"
                />
                <input
                  name="reportReviewedByTitle"
                  value={formData.reportReviewedByTitle || ""}
                  onChange={handleChange}
                  placeholder="Title"
                  className="border p-2 bg-[#edf2f9] w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="reportReviewedByDepartment"
                  value={formData.reportReviewedByDepartment || ""}
                  onChange={handleChange}
                  placeholder="Department"
                  className="border p-2 bg-[#edf2f9] w-full"
                />
                <input
                  type="date"
                  name="reportReviewedByDate"
                  value={formData.reportReviewedByDate || ""}
                  onChange={handleChange}
                  className="border p-2 bg-[#edf2f9] w-full"
                />
              </div>
            </div>

            {/* Investigation Team Members section */}
            <div className="mb-6 space-y-2">
              <h3 className="font-semibold mb-1">INVESTIGATION TEAM MEMBERS</h3>
              {formData.investigationTeamMembers.map((member, index) => (
                <div key={index} className="grid grid-cols-2 gap-2 mb-1">
                  <input
                    value={member.name}
                    onChange={(e) => {
                      const updated = [...formData.investigationTeamMembers];
                      updated[index].name = e.target.value;
                      setFormData({
                        ...formData,
                        investigationTeamMembers: updated,
                      });
                    }}
                    placeholder="Name"
                    className="border p-2 bg-[#edf2f9] w-full"
                  />
                  <input
                    value={member.title}
                    onChange={(e) => {
                      const updated = [...formData.investigationTeamMembers];
                      updated[index].title = e.target.value;
                      setFormData({
                        ...formData,
                        investigationTeamMembers: updated,
                      });
                    }}
                    placeholder="Title"
                    className="border p-2 w-full bg-[#edf2f9]"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    investigationTeamMembers: [
                      ...formData.investigationTeamMembers,
                      { name: "", title: "" },
                    ],
                  })
                }
                className="bg-green-500 text-white px-2 py-1 rounded mt-2"
              >
                Add Member
              </button>
            </div>

            {/* Report Submitted By section */}
            <div>
              <h3 className="font-semibold mb-1">REPORT SUBMITTED BY</h3>
              <div className="grid grid-cols-3 gap-2">
                <input
                  name="reportSubmittedByName"
                  value={formData.reportSubmittedByName || ""}
                  onChange={handleChange}
                  placeholder="Name"
                  className="border p-2 bg-[#edf2f9] w-full"
                />
                <input
                  name="reportSubmittedBySignature"
                  value={formData.reportSubmittedBySignature || ""}
                  onChange={handleChange}
                  placeholder="Signature"
                  className="border p-2 bg-[#edf2f9] w-full"
                />
                <input
                  type="date"
                  name="reportSubmittedByDate"
                  value={formData.reportSubmittedByDate || ""}
                  onChange={handleChange}
                  className="border p-2"
                />
              </div>
            </div>

            {/* Report Received By section */}
            <div>
              <h3 className="font-semibold mb-1">REPORT RECEIVED BY</h3>
              <div className="grid grid-cols-3 gap-2">
                <input
                  name="reportReceivedByName"
                  value={formData.reportReceivedByName || ""}
                  onChange={handleChange}
                  placeholder="Name"
                  className="border p-2 bg-[#edf2f9] w-full"
                />
                <input
                  name="reportReceivedBySignature"
                  value={formData.reportReceivedBySignature || ""}
                  onChange={handleChange}
                  placeholder="Signature"
                  className="border p-2 bg-[#edf2f9] w-full"
                />
                <input
                  type="date"
                  name="reportReceivedByDate"
                  value={formData.reportReceivedByDate || ""}
                  onChange={handleChange}
                  className="border p-2 bg-[#edf2f9] w-full"
                />
              </div>
            </div>
          </div>

          {/* Form buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-4 rounded"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="bg-gray-500 text-white px-4 py-4 rounded"
              >
                Back to Table
              </button>
            )}
            <button
              onClick={onReturnToWorkPlan}
              className="bg-green-700 text-white px-4 py-4 rounded"
            >
              Return to Work Plan
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="bg-red-600 text-white my-4 px-4 py-4 rounded mb-4"
          >
            Download as PDF
          </button>
        </form>
      </div>
    </div>
  );
}
