import { useState } from "react";
import { db } from "@/lib/firebase/firebaseInit";
import { collection, addDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/firebaseInit";

export default function ReturnToWorkPlan({ ReturnToIncidentReport }) {
  const initialWorkerFields = {
    returnToEmail: "",
    injuredWorkerName: "",
    titleRole: "",
    supervisorName: "",
    departmentArea: "",
    dateOfReturn: "",
    timeOfReturn: "",
    employeeStatus: [],
    partialDayHours: "",
    partialDayStartTime: "",
    partialDayEndTime: "",
    reviewChecklist: [],
    employeeNameAgreement: "",
    employeeSignature: "",
    employeeDate: "",
    supervisorNameAgreement: "",
    supervisorSignature: "",
    supervisorDate: "",
  };

  const [workers, setWorkers] = useState([{ ...initialWorkerFields }]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const sendIncidentEmail = httpsCallable(functions, "sendIncidentReportEmail");

  const validateForm = () => {
    for (const worker of workers) {
      if (!worker.injuredWorkerName || !worker.injuredWorkerName.trim()) {
        setError("Name of Injured Worker is required for all workers");
        return false;
      }

      if (!worker.dateOfReturn) {
        setError("Date of Return is required for all workers");
        return false;
      }

      if (worker.employeeStatus.length === 0) {
        setError("Employee Status must be selected for all workers");
        return false;
      }

      if (
        !worker.employeeNameAgreement ||
        !worker.employeeSignature ||
        !worker.employeeDate
      ) {
        setError("Employee agreement section must be completed");
        return false;
      }

      if (
        !worker.supervisorNameAgreement ||
        !worker.supervisorSignature ||
        !worker.supervisorDate
      ) {
        setError("Supervisor agreement section must be completed");
        return false;
      }
    }
    return true;
  };

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...workers];
    updated[index][name] = value;
    setWorkers(updated);
    setError(null); // Clear error when user makes changes
  };

  const handleCheckboxChange = (index, field, option) => {
    const updated = [...workers];
    const array = updated[index][field] || [];

    if (array.includes(option)) {
      updated[index][field] = array.filter((item) => item !== option);
    } else {
      updated[index][field] = [...array, option];
    }

    // Special handling for partial day
    if (field === "employeeStatus" && option === "Working a partial day") {
      if (!updated[index][field].includes("Working a partial day")) {
        updated[index].partialDayHours = "";
        updated[index].partialDayStartTime = "";
        updated[index].partialDayEndTime = "";
      }
    }

    setWorkers(updated);
    setError(null);
  };

  const addWorker = () => {
    setWorkers([...workers, { ...initialWorkerFields }]);
  };

  const removeWorker = (index) => {
    if (workers.length > 1) {
      const updated = [...workers];
      updated.splice(index, 1);
      setWorkers(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert(
        "❌ Please complete all required fields correctly before submitting."
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Save to Firestore
      const docRef = await addDoc(collection(db, "returnToWorkPlans"), {
        workers,
        createdAt: new Date().toISOString(),
        status: "pending",
      });

      // TEMPORARILY DISABLED EMAIL FUNCTIONALITY
      // if (formData.returnToEmails) {
      //   try {
      //     await sendIncidentEmail({...});
      //   } catch (emailError) {
      //     console.error("Email failed but submission succeeded");
      //   }
      // }

      setSuccess(true);
      setWorkers([{ ...initialWorkerFields }]);
      alert("✅ Plan submitted successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Submission failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateEmailContent = (workers) => {
    return `
            <h1>Return to Work Plan Submission</h1>
            <p>${workers.length} worker(s) have been included in this plan:</p>
            <ul>
                ${workers
                  .map(
                    (worker) => `
                    <li>
                        <strong>${worker.injuredWorkerName}</strong> - 
                        Returning on ${worker.dateOfReturn} at ${
                      worker.timeOfReturn || "unspecified time"
                    }
                    </li>
                `
                  )
                  .join("")}
            </ul>
            <p>Please review the details in the system.</p>
        `;
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto bg-white border-4 border-black border-double rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6">
        RETURN TO WORK PLAN
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700">
          <p>Plan submitted successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {workers.map((worker, index) => (
          <div
            key={index}
            className="p-4 border rounded bg-gray-50 space-y-4 relative"
          >
            {workers.length > 1 && (
              <button
                type="button"
                onClick={() => removeWorker(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                aria-label="Remove worker"
              >
                ×
              </button>
            )}

            <h3 className="font-semibold text-lg">Worker {index + 1}</h3>

            {/* Return Completed Form To */}
            <div>
              <label className="block font-semibold mb-1">
                Return completed form to (email):
              </label>
              <input
                type="email"
                name="returnToEmail"
                value={worker.returnToEmail}
                onChange={(e) => handleChange(index, e)}
                className="border p-2 w-full bg-[#edf2f9]"
                placeholder="Enter email address"
              />
            </div>

            {/* Worker Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">
                  Name of Injured Worker <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="injuredWorkerName"
                  value={worker.injuredWorkerName}
                  onChange={(e) => handleChange(index, e)}
                  className="border p-2 w-full bg-[#edf2f9]"
                  placeholder="Injured worker name"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Title / Role</label>
                <input
                  type="text"
                  name="titleRole"
                  value={worker.titleRole}
                  onChange={(e) => handleChange(index, e)}
                  className="border p-2 w-full bg-[#edf2f9]"
                  placeholder="Title / Role"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Supervisor Name
                </label>
                <input
                  type="text"
                  name="supervisorName"
                  value={worker.supervisorName}
                  onChange={(e) => handleChange(index, e)}
                  className="border p-2 w-full bg-[#edf2f9]"
                  placeholder="Supervisor name"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Department / Area
                </label>
                <input
                  type="text"
                  name="departmentArea"
                  value={worker.departmentArea}
                  onChange={(e) => handleChange(index, e)}
                  className="border p-2 w-full bg-[#edf2f9]"
                  placeholder="Department / Area"
                />
              </div>
            </div>

            {/* Scheduled Return */}
            <div className="space-y-2">
              <label className="block font-semibold">
                YOU HAVE BEEN SCHEDULED TO RETURN TO WORK ON:{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm mb-1">Date</label>
                  <input
                    type="date"
                    name="dateOfReturn"
                    value={worker.dateOfReturn}
                    onChange={(e) => handleChange(index, e)}
                    className="border p-2 w-full bg-[#edf2f9]"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm mb-1">Time</label>
                  <input
                    type="time"
                    name="timeOfReturn"
                    value={worker.timeOfReturn}
                    onChange={(e) => handleChange(index, e)}
                    className="border p-2 w-full bg-[#edf2f9]"
                  />
                </div>
              </div>
            </div>

            {/* Employee Status */}
            <div>
              <label className="block font-semibold mb-1">
                THE EMPLOYEE IS: <span className="text-red-500">*</span>
                <span className="italic text-sm font-normal">
                  {" "}
                  (check all that apply)
                </span>
              </label>
              <div className="space-y-2">
                {[
                  "Performing their full duties with no restrictions.",
                  "Performing their duties with restrictions.",
                  "Has returned in a Transitional Work effort; and / or alternative duty has been assigned with restrictions.",
                  "Working their full schedule.",
                  "Working a partial day",
                ].map((option, i) => (
                  <label
                    key={i}
                    className="flex items-center bg-[#edf2f9] border p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={worker.employeeStatus.includes(option)}
                      onChange={() =>
                        handleCheckboxChange(index, "employeeStatus", option)
                      }
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            {/* Partial Day - Only show if selected */}
            {worker.employeeStatus.includes("Working a partial day") && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-[#edf2f9] border p-4 rounded">
                <div className="md:col-span-1">
                  <label className="block text-sm mb-1">Hours per day</label>
                  <input
                    type="number"
                    name="partialDayHours"
                    value={worker.partialDayHours}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="No. of hours"
                    className="border p-2 w-full bg-white"
                    min="1"
                    max="24"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Start time</label>
                  <input
                    type="time"
                    name="partialDayStartTime"
                    value={worker.partialDayStartTime}
                    onChange={(e) => handleChange(index, e)}
                    className="border p-2 w-full bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">End time</label>
                  <input
                    type="time"
                    name="partialDayEndTime"
                    value={worker.partialDayEndTime}
                    onChange={(e) => handleChange(index, e)}
                    className="border p-2 w-full bg-white"
                  />
                </div>
              </div>
            )}

            {/* Review Checklist */}
            <div>
              <label className="block font-semibold mb-1">
                THE FOLLOWING REVIEW AND BRIEFING HAS OCCURRED
              </label>
              <div className="space-y-2">
                {[
                  "The physician's restrictions have been identified and clarified.",
                  "The supervisor is able to understand the restrictions and provide accommodated work.",
                  "A communication pathway to get support has been provided to the injured worker.",
                  "A review of pertinent safety policies / practices has occurred.",
                  "A review of pertinent human resources policies, including reporting off work, clocking in / out, and similar, have been reviewed.",
                  "The Job Demand Analysis has been reviewed in conjunction with the restrictions indicated by the physician. Duties have been assigned as noted above.",
                  "Requirements of the injured worker to work within restrictions have been clarified.",
                  "Requirements of the supervisor to only assign work within restrictions have been clarified.",
                  "Requirement of the injured worker to immediately go to their physician's office (or emergency room) if they are leaving work because they feel that they cannot perform the work or because they feel they may have been re-injured.",
                ].map((item, i) => (
                  <label
                    key={i}
                    className="flex items-start bg-[#edf2f9] border rounded p-2"
                  >
                    <input
                      type="checkbox"
                      checked={worker.reviewChecklist.includes(item)}
                      onChange={() =>
                        handleCheckboxChange(index, "reviewChecklist", item)
                      }
                      className="mr-2 mt-1"
                    />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Agreement */}
            <div className="space-y-2">
              <p className="text-sm leading-relaxed">
                <strong>AGREEMENT</strong>
                <br />
                I, the undersigned injured worker, agree to participate in the
                transitional work plan described herein. I agree to consider
                work to be performed carefully and to work within my
                restrictions, ask for help when work exceeds my abilities, to
                notify my supervisor if there are duties assigned that exceed my
                abilities, or if I need assistance.
              </p>

              {/* Employee/Supervisor Signature */}
              <div className="border border-gray-400">
                <div className="grid grid-cols-3 bg-gray-200 text-center font-semibold text-sm">
                  <div className="p-2 border-r">
                    NAME <span className="text-red-500">*</span>
                  </div>
                  <div className="p-2 border-r">
                    SIGNATURE <span className="text-red-500">*</span>
                  </div>
                  <div className="p-2">
                    DATE <span className="text-red-500">*</span>
                  </div>
                </div>
                <div className="grid grid-cols-3">
                  <input
                    type="text"
                    name="employeeNameAgreement"
                    value={worker.employeeNameAgreement}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="Employee Name"
                    className="border-t border-r p-2 bg-[#edf2f9]"
                    required
                  />
                  <input
                    type="text"
                    name="employeeSignature"
                    value={worker.employeeSignature}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="Employee Signature"
                    className="border-t border-r p-2 bg-[#edf2f9]"
                    required
                  />
                  <input
                    type="date"
                    name="employeeDate"
                    value={worker.employeeDate}
                    onChange={(e) => handleChange(index, e)}
                    className="border-t p-2 bg-[#edf2f9]"
                    required
                  />
                </div>
                <div className="grid grid-cols-3">
                  <input
                    type="text"
                    name="supervisorNameAgreement"
                    value={worker.supervisorNameAgreement}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="Supervisor Name"
                    className="border-t border-r p-2 bg-[#edf2f9]"
                    required
                  />
                  <input
                    type="text"
                    name="supervisorSignature"
                    value={worker.supervisorSignature}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="Supervisor Signature"
                    className="border-t border-r p-2 bg-[#edf2f9]"
                    required
                  />
                  <input
                    type="date"
                    name="supervisorDate"
                    value={worker.supervisorDate}
                    onChange={(e) => handleChange(index, e)}
                    className="border-t p-2 bg-[#edf2f9]"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
          <button
            type="button"
            onClick={addWorker}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            ADD WORKER
          </button>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={ReturnToIncidentReport}
              className="bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700"
            >
              RETURN TO INCIDENT REPORT
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "SUBMITTING..." : "SUBMIT PLAN"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
