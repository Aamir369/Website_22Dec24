import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase/firebaseInit";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/components/providers/AuthProvider";

export default function IncidentReportForm({
  report,
  onBack,
  onReturnToWorkPlan,
}) {
  const isPrefilled = report != null;

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const imageRef = useRef(null);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    console.log("Mouse down at", e.clientX, e.clientY);
    setIsDrawing(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const [formData, setFormData] = useState({
    returnToEmails: "",
    documentTypes: [],
    workdayIncident: [], // ✅ add this line
    otherWorkdayIncidentDescription: "", // for the text input
    reportCompletedByname: "",
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
    investigationTeamMembers: [{ name: "", title: "" }],
    reportSubmittedByName: "",
    reportSubmittedBySignature: "",
    reportSubmittedByDate: "",
    reportReceivedByName: "",
    reportReceivedBySignature: "",
    reportReceivedByDate: "",
    reported_by: "",

    InjuredEmployeesNames: [],
    InjuredemployeeId: [],
    injuredEmployees: [
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

    location: "",
    time: "",
    injuryType: [],

    witnesses: [],
    protectiveEquipment: "",
    incidentDescription: "",
    whyUnsafeConditionsExist: "",
    whyUnsafeActsOccur: "",
    correctiveActions: "",
    reportCompletedBy: "",
    reviewedBy: "",
    investigationTeam: "",
    submittedBy: "",
    attachments: [],
    unsafeWorkplaceConditions: [],
    unsafeActsByPeople: [],
    workplaceCultureEncouraged: "",
    workplaceCultureDescription: "",
    unsafeActsReported: "",
    similarIncidentsPrior: "",
    receivedBy: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const docData = {
        company_id: formData.employeeId || "",
        company_name: formData.employeeName || "",
        date: new Date().toISOString(),
        injury_data: {
          activities: [], // Can be mapped from formData if needed
          category: formData.natureOfInjury || "",
          events: [
            {
              content: formData.incidentDescription || "",
              heading: formData.incidentDescription || "",
              images: [], // Will add canvas image if available
            },
          ],
          location: formData.location || "",
          incidentDateAndTime: formData.dateOfIncident || "",
          incidentReportedToOHSDateAndTime: formData.dateOfReport || "",
          organizationalFactors: formData.incidentDescription || "",
          otherCircumstances: formData.incidentDescription || "",
          toolsMaterialsEquipment: formData.protectiveEquipment || "",
          workSiteConditions: formData.unsafeConditions || "",

          // Additional fields from the form
          injuredEmployees: formData.injuredEmployees,
          injuryType: formData.injuryType,
          witnesses: formData.witnesses,
          unsafeWorkplaceConditions: formData.unsafeWorkplaceConditions,
          unsafeActsByPeople: formData.unsafeActsByPeople,
          whyUnsafeConditionsExist: formData.whyUnsafeConditionsExist,
          whyUnsafeActsOccur: formData.whyUnsafeActsOccur,
          preventionSuggestions: formData.preventionSuggestions,
          preventionActionsTaken: formData.preventionActionsTaken,
          attachments: formData.attachments.map((file) => file.name),
        },
        metadata: {
          reportCompletedBy: {
            name: formData.reportCompletedByname,
            title: formData.reportCompletedByTitle,
          },
          signatures: {
            writtenBy: {
              name: formData.reportWrittenByName,
              title: formData.reportWrittenByTitle,
              department: formData.reportWrittenByDepartment,
              date: formData.reportWrittenByDate,
            },
            reviewedBy: {
              name: formData.reportReviewedByName,
              title: formData.reportReviewedByTitle,
              department: formData.reportReviewedByDepartment,
              date: formData.reportReviewedByDate,
            },
            investigationTeam: formData.investigationTeamMembers,
          },
        },
      };

      // Get canvas image if available
      let canvasImage = null;
      if (canvasRef.current) {
        canvasImage = canvasRef.current.toDataURL("image/png");
        docData.injury_data.events[0].images.push(canvasImage);
      }

      // Save to Firestore
      await addDoc(collection(db, "incidentReports"), docData);

      // Send email if recipient is specified
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
              reportData: docData, // Send the structured data
              canvasImage: canvasImage,
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || "Failed to send email");
          }

          alert("Report submitted and email sent successfully!");
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
          alert("Report submitted successfully but email failed to send.");
        }
      } else {
        alert("Report submitted successfully!");
      }

      if (onBack) onBack();
    } catch (error) {
      console.error("Error saving report:", error);
      alert("Failed to submit report. Please try again.");
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
  const removeInjuredEmployee = (index) => {
    const updatedEmployees = formData.injuredEmployees.filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, injuredEmployees: updatedEmployees });
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

  const { currentUser } = useAuth();

  const [imageHeight, setImageHeight] = useState(500);

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

  useEffect(() => {
    if (imageRef.current) {
      setImageHeight(imageRef.current.clientHeight);
    }
  }, []);

  // ✅ Pre-fill form when report prop changes
  useEffect(() => {
    // 1️⃣ Canvas sizing
    const image = imageRef.current;
    const canvas = canvasRef.current;

    if (image && canvas) {
      const setCanvasSize = () => {
        canvas.width = image.clientWidth;
        canvas.height = image.clientHeight;
        console.log("Canvas sized:", canvas.width, canvas.height);
      };

      if (image.complete) {
        setCanvasSize();
      } else {
        image.onload = setCanvasSize;
      }
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const q = query(
        collection(db, "users"),
        where("email", "==", currentUser.email)
      );
      const snapshot = await getDocs(q);
      const userData = snapshot.docs[0]?.data();
      if (userData) {
        setFormData((prev) => ({
          ...prev,

          reportCompletedByname: userData.fullName || "",
          reportCompletedByTitle: userData.title || "",
        }));
      }
    };

    if (currentUser?.email) fetchUserData();
  }, []);

  useEffect(() => {
    const fetchIncidentReport = async () => {
      try {
        const q = query(
          collection(db, "incidentReports"),
          where("company_id", "==", formData.employeeId)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const doc = snapshot.docs[0].data();
          setFormData((prev) => ({
            ...prev,
            incidentDescription: doc.injury_data?.events?.[0]?.content || "",
            protectiveEquipment: doc.injury_data?.toolsMaterialsEquipment || "",
            location: doc.injury_data?.location || "",
            dateOfIncident: doc.injury_data?.incidentDateAndTime || "",
            dateOfReport:
              doc.injury_data?.incidentReportedToOHSDateAndTime || "",
            unsafeConditions: doc.injury_data?.workSiteConditions || "",
            natureOfInjury: doc.injury_data?.category || "",
          }));
        } else {
          console.log("No incident report found for this company_id");
        }
      } catch (error) {
        console.error("Error fetching incident report:", error);
      }
    };

    if (formData.employeeId) {
      fetchIncidentReport();
    }
  }, [formData.employeeId]);

  useEffect(() => {
    if (report) {
      setFormData((prev) => ({
        ...prev,
        employeeName: report.reported_by || "",
        location: report.injury_data?.location || "",
        dateOfIncident: report.injury_data?.incidentDateAndTime
          ? report.injury_data.incidentDateAndTime.slice(0, 16)
          : "",
        dateOfReport: report.injury_data?.incidentReportedToOHSDateAndTime
          ? report.injury_data.incidentReportedToOHSDateAndTime.slice(0, 16)
          : "",
        injuryType: report.injuryOptions?.InjuryType || [],
        natureOfInjury: report.injury_data?.category || "",

        protectiveEquipment: report.injury_data?.toolsMaterialsEquipment || "",
        incidentDescription: report?.events?.[0]?.content || "",
      }));
    }
  }, [report]);
  const [isErasing, setIsErasing] = useState(false);

  const toggleEraser = () => {
    setIsErasing(!isErasing);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isErasing) {
      ctx.clearRect(x - 15, y - 15, 30, 30); // erase a small square
    } else {
      ctx.lineTo(x, y);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  return (
    <div className="min-h-screen p-4 bg-gray-400">
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
                  name={item}
                  checked={formData.documentTypes.includes(item)}
                  onChange={(e) => {
                    const { name, checked } = e.target;
                    if (checked) {
                      setFormData({
                        ...formData,
                        documentTypes: [...formData.documentTypes, name],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        documentTypes: formData.documentTypes.filter(
                          (type) => type !== name
                        ),
                      });
                    }
                  }}
                  className="mr-2"
                />
                {item}
              </label>
            ))}
          </div>
          <div className="mb-4">
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
                value={formData.reportCompletedByname}
                readOnly
                //className={"border w-1/4 p-2 bg-gray-100 bg-[#edf2f9]"}
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
          <div className="mb-4">
            <div className="flex space-x-2 mb-1">
              <label className="w-1/3 text-sm font-medium">
                Reporting Employee
              </label>
            </div>
            <div className="flex space-x-2">
              <input
                name="employeeName"
                placeholder="Employee Name"
                value={report.reported_by}
                onChange={handleChange}
                className={`border bg-[#edf2f9] p-2 ${
                  isPrefilled ? "text-red-600 font-semibold" : ""
                }`}
              />
            </div>
          </div>
          <div className="mb-4">
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
                  {/* Remove Button */}
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

          {(formData.injuryType || []).includes("Other (describe)") && (
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
                style={{ height: imageHeight }}
                className="bg-[#edf2f9] w-full border rounded h-40 p-2"
                placeholder="Describe the injury..."
              />
            </div>

            {/* Right: Image + Canvas */}
            <div className="flex-1 h-full">
              <h2 className="font-semibold mb-2">
                Part of Body Affected (draw to mark)
              </h2>
              <div className="relative inline-block  w-full h-full">
                <img
                  ref={imageRef}
                  src="/video/frontandbackbody.png"
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

          <input
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className={`border w-full p-2 ${
              isPrefilled ? "text-red-600 font-semibold" : ""
            }`}
          />
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

          <div className="flex gap-4">
            {/* Witnesses dynamic inputs */}
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
                      className="bg-red-500 text-white px-2 rounded "
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
                className="bg-green-500 text-white px-2 rounded "
              >
                Add Witness
              </button>
            </div>

            {/* Protective Equipment textarea */}
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
          {/*this  has to  go with the second options at top of page<input name="natureOfInjury" placeholder="Nature of Injury" value={formData.natureOfInjury} onChange={handleChange} className={`border w-full p-2 ${isPrefilled ? 'text-red-600 font-semibold' : ''}`} />*/}
          {/*this is part of nature of injury fifth section <textarea name="descriptionOfInjury" placeholder="Description of Injury" value={formData.descriptionOfInjury} onChange={handleChange} className={`border w-full p-2 ${isPrefilled ? 'text-red-600 font-semibold' : ''}`} />*/}

          {/*<input name="protectiveEquipment" placeholder="Protective Equipment" value={formData.protectiveEquipment} onChange={handleChange} className={`border w-full p-2 ${isPrefilled ? 'text-red-600 font-semibold' : ''}`} />*/}
          <textarea
            name="incidentDescription"
            value={formData.incidentDescription}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                incidentDescription: e.target.value,
              }))
            }
          />

          <div className="mb-4">
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
              className="border p-2 w-full"
            />
            {formData.attachments.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm text-green-700">
                {formData.attachments.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Unsafe Workplace Conditions */}
            <div>
              <h3 className="font-semibold mb-1 ">
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

            {/* Unsafe Acts by People */}
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

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Why unsafe conditions exist */}
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

            {/* Why unsafe acts occurred */}
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
                className="border p-2 bg-[#edf2f9] w-full h-32 "
              />
            </div>
          </div>
          <div className="space-y-4 mb-4">
            {/* Question 1 */}
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
                    className="border p-2bg-[#edf2f9] w-full"
                    placeholder="Describe..."
                  />
                </div>
              )}
            </div>

            {/* Question 2 */}
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

            {/* Question 3 */}
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
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Suggestions checkboxes + other description */}
            <div>
              <h3 className="font-semibold mb-2">
                What changes do you suggest to prevent this incident / near miss
                from happening again?
                <span className="italic text-sm  ">
                  {" "}
                  (select all that apply)
                </span>
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
                    className="mr-2 "
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

            {/* Action textarea */}
            <div>
              <h3 className="font-semibold mb-2 ">
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
          <div className="space-y-6">
            {/* REPORT WRITTEN BY */}
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

            {/* REPORT REVIEWED BY */}
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

            {/* INVESTIGATION TEAM MEMBERS */}
            <div className="mb-4">
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
                    className="border p-2 w-full bg-[#edf2f9] "
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

            {/* REPORT SUBMITTED BY */}
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

            {/* REPORT RECEIVED BY */}
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
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-4 rounded"
            >
              Submit
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
            <>
              <button
                onClick={onReturnToWorkPlan}
                className="bg-green-700 text-white px-4 py-4 rounded"
              >
                Return to Work Plan
              </button>
            </>
          </div>
        </form>
      </div>
    </div>
  );
}
