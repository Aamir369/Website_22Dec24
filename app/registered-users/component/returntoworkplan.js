import { useState } from "react";
import { db } from "@/lib/firebase/firebaseInit";
import { collection, addDoc } from "firebase/firestore";

export default function ReturnToWorkPlan({ ReturnToIncidentReport }) {
  const initialWorkerFields = {
    returnToEmail: "",
    injuredWorkerName: "",
    titleRole: "",
    supervisorName: "",
    departmentArea: "",
    scheduledReturnToWorkOn: "",
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

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...workers];
    updated[index][name] = value;
    setWorkers(updated);
  };

  const handleCheckboxChange = (index, field, option) => {
    const updated = [...workers];
    const array = updated[index][field] || [];
    if (array.includes(option)) {
      updated[index][field] = array.filter((item) => item !== option);
    } else {
      updated[index][field] = [...array, option];
    }
    setWorkers(updated);
  };

  const addWorker = () => {
    setWorkers([...workers, { ...initialWorkerFields }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "returnToWorkPlans"), { workers });
      setSuccess(true);
      setWorkers([{ ...initialWorkerFields }]);
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving. Check console.");
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white border-4 border-black border-double rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-4">
        RETURN TO WORK PLAN
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {workers.map((worker, index) => (
          <div key={index} className="p-4 border rounded bg-gray-50 space-y-4">
            <h3 className="font-semibold text-lg">Worker {index + 1}</h3>

            {/* Return Completed Form To */}
            <div>
              <label className="block font-semibold mb-1">
                Return completed form to:
              </label>
              <input
                type="text"
                name="returnToEmail"
                value={worker.returnToEmail}
                onChange={(e) => handleChange(index, e)}
                className="border p-2 w-full bg-[#edf2f9]"
                placeholder="Enter email or name..."
              />
            </div>

            {/* First Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">
                  Name of Injured Worker
                </label>
                <input
                  type="text"
                  name="injuredWorkerName"
                  value={worker.injuredWorkerName}
                  onChange={(e) => handleChange(index, e)}
                  className="border p-2 w-full bg-[#edf2f9]"
                  placeholder="Injured worker name"
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
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-2 gap-4">
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
            <div className="flex items-center justify-between mb-4">
              <label className="block font-semibold mb-1">
                YOU HAVE BEEN SCHEDULED TO RETURN TO WORK ON:
              </label>
              <div className="grid grid-cols-2 gap-6">
                <input
                  type="date"
                  name="dateOfReturn"
                  value={worker.dateOfReturn}
                  onChange={(e) => handleChange(index, e)}
                  className="border px-4 mr-4  w-[180px] bg-[#edf2f9]"
                />
                <input
                  type="time"
                  name="timeOfReturn"
                  value={worker.timeOfReturn}
                  onChange={(e) => handleChange(index, e)}
                  className="border px-4 py-3 w-full h-12 bg-[#edf2f9] rounded pr-10 text-black"
                />
              </div>
            </div>

            {/* Employee Status */}
            <div>
              <label className="block font-semibold mb-1">
                THE EMPLOYEE IS:{" "}
                <span className="italic">(check all that apply)</span>
              </label>
              <div className="space-y-2">
                {[
                  "Performing their full duties with no restrictions.",
                  "Performing their duties with restrictions.",
                  "Has returned in a Transitional Work effort; and / or alternative duty has been assigned with restrictions.",
                  "Working their full schedule.",
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

            {/* Partial Day */}
            <div className="grid grid-cols-4 gap-4 items-center bg-[#edf2f9] border p-2 rounded">
              <label className="flex items-center col-span-1">
                <input
                  type="checkbox"
                  checked={worker.employeeStatus.includes(
                    "Working a partial day"
                  )}
                  onChange={() =>
                    handleCheckboxChange(
                      index,
                      "employeeStatus",
                      "Working a partial day"
                    )
                  }
                  className="mr-2"
                />
                Working a partial day:
              </label>
              <input
                type="number"
                name="partialDayHours"
                value={worker.partialDayHours}
                onChange={(e) => handleChange(index, e)}
                placeholder="No. of hours per day"
                className="border p-2 w-full bg-white"
              />
              <input
                type="time"
                name="partialDayStartTime"
                value={worker.partialDayStartTime}
                onChange={(e) => handleChange(index, e)}
                placeholder="Start time"
                className="border p-2 w-full bg-white"
              />
              <input
                type="time"
                name="partialDayEndTime"
                value={worker.partialDayEndTime}
                onChange={(e) => handleChange(index, e)}
                placeholder="End time"
                className="border p-2 w-full bg-white"
              />
            </div>

            {/* Review Checklist */}
            <div>
              <label className="block font-semibold mb-1">
                THE FOLLOWING REVIEW AND BRIEFING HAS OCCURRED
              </label>
              <div className="space-y-2">
                {[
                  "The physician’s restrictions have been identified and clarified.",
                  "The supervisor is able to understand the restrictions and provide accommodated work.",
                  "A communication pathway to get support has been provided to the injured worker.",
                  "A review of pertinent safety policies / practices has occurred.",
                  "A review of pertinent human resources policies, including reporting off work, clocking in / out, and similar, have been reviewed.",
                  "The Job Demand Analysis has been reviewed in conjunction with the restrictions indicated by the physician. Duties have been assigned as noted above.",
                  "Requirements of the injured worker to work within restrictions have been clarified.",
                  "Requirements of the supervisor to only assign work within restrictions have been clarified.",
                  "Requirement of the injured worker to immediately go to their physician’s office (or emergency room) if they are leaving work because they feel that they cannot perform the work or because they feel they may have been re-injured.",
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
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Agreement */}
            <p className="text-sm leading-relaxed">
              <strong>AGREEMENT</strong>
              <br />
              I, the undersigned injured worker, agree to participate in the
              transitional work plan described herein. I agree to consider work
              to be performed carefully and to work within my restrictions, ask
              for help when work exceeds my abilities, to notify my supervisor
              if there are duties assigned that exceed my abilities, or if I
              need assistance.
            </p>

            {/* Employee/Supervisor Signature */}
            <div className="border border-gray-400">
              <div className="grid grid-cols-3 bg-gray-200 text-center font-semibold text-sm">
                <div className="p-2 border-r">NAME</div>
                <div className="p-2 border-r">SIGNATURE</div>
                <div className="p-2">DATE</div>
              </div>
              <div className="grid grid-cols-3">
                <input
                  type="text"
                  name="employeeNameAgreement"
                  value={worker.employeeNameAgreement}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="Employee Name"
                  className="border-t border-r p-2 bg-[#edf2f9]"
                />
                <input
                  type="text"
                  name="employeeSignature"
                  value={worker.employeeSignature}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="Employee Signature"
                  className="border-t border-r p-2 bg-[#edf2f9]"
                />
                <input
                  type="date"
                  name="employeeDate"
                  value={worker.employeeDate}
                  onChange={(e) => handleChange(index, e)}
                  className="border-t p-2 bg-[#edf2f9]"
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
                />
                <input
                  type="text"
                  name="supervisorSignature"
                  value={worker.supervisorSignature}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="Supervisor Signature"
                  className="border-t border-r p-2 bg-[#edf2f9]"
                />
                <input
                  type="date"
                  name="supervisorDate"
                  value={worker.supervisorDate}
                  onChange={(e) => handleChange(index, e)}
                  className="border-t p-2 bg-[#edf2f9]"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between pt-4">
          <button
            type="submit"
            className="bg-blue-700 text-white px-8 py-2 rounded hover:bg-blue-800"
          >
            SUBMIT
          </button>
          <button
            type="button"
            onClick={addWorker}
            className="bg-blue-700 text-white px-8 py-2 rounded hover:bg-blue-800"
          >
            ADD WORKER
          </button>
          <button
            onClick={ReturnToIncidentReport}
            className="bg-green-700 text-white px-4 py-4 rounded"
          >
            Return to Incident Report
          </button>
        </div>

        {success && (
          <p className="text-green-600 mt-4">Plan submitted successfully!</p>
        )}
      </form>
    </div>
  );
}
