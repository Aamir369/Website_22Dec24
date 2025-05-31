import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/firebaseInit";
import { collection, getDocs } from "firebase/firestore";
import { DateTimeUtility } from "@/lib/utils/DateTimeUtility";
import IncidentReportForm from "./IncidentReportForm";
import ReturnToWorkPlan from "./returntoworkplan";

const InjuryReportsTable = ({ reports }) => {
  const [selectedData, setSelectedData] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  // Sort data based on the provided criteria
  const sortData = (data) => {
    const sortedData = [...data];
    sortedData.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
    return sortedData;
  };

  useEffect(() => {
    // Sort the reports data when the component mounts or updates
    const sortedReports = sortData(reports);
    setSelectedData(sortedReports);
  }, [reports]);
  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  reports.map((report) => {
    console.log(report);
  });

  const handleBackToTable = () => {
    setSelectedReport(null);
  };

  const [showReturnToWorkPlan, setShowReturnToWorkPlan] = useState(false);

  // Show IncidentReportForm when a report is selected
  if (selectedReport) {
    return showReturnToWorkPlan ? (
      <ReturnToWorkPlan
        ReturnToIncidentReport={() => setShowReturnToWorkPlan(false)}
      />
    ) : (
      <IncidentReportForm
        report={selectedReport}
        onBack={handleBackToTable}
        onReturnToWorkPlan={() => setShowReturnToWorkPlan(true)}
      />
    );
  }

  const isReportSubmitted = (report) => {
    return report.submitted;
  };

  return (
    <div className="overflow-x-auto max-h-[600px]">
      <div className="flex justify-between items-center py-4">
        <h2 className="text-lg font-semibold">Injury Reports</h2>
      </div>
      <table
        className="table-auto w-full border border-gray-300 border-collapse"
        id="injury-reports-table"
      >
        <thead className="bg-yellow-100 sticky top-0 z-10 width-full">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 w-32 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300"
            >
              Company Name
            </th>
            <th
              scope="col"
              className="px-6 py-3   text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300"
            >
              Date Submitted
            </th>
            <th
              scope="col"
              className="px-6 py-3  text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300"
            >
              Reported By
            </th>
            <th
              scope="col"
              className="px-6 py-3   text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300"
            >
              Category
            </th>
            <th
              scope="col"
              className="px-2 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300"
            >
              Location
            </th>
            <th
              scope="col"
              className="px-6 py-3   text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300"
            >
              Incident Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300"
            >
              Reported To OHS Date
            </th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Report Link
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300"
            >
              Images
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300"
            >
              Organizational Factors
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300"
            >
              Other Circumstances
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300"
            >
              Tools/Materials/Equipment
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300"
            >
              Work Site Conditions
            </th>
          </tr>
        </thead>
        <tbody>
          {selectedData.map((report, index) => (
            <tr
              key={index}
              className={` ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-gray-100`}
            >
              <td className="px-6 py-4 whitespace-normal break-words border border-gray-300">
                <div className="text-sm font-medium text-black">
                  {report.company_name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-normal break-words border border-gray-300">
                <div className="text-sm font-medium text-black">
                  {report.date}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-normal break-words border border-gray-300">
                <div className="text-sm font-medium text-black">
                  {report.reported_by}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-normal break-words border border-gray-300">
                <div className="text-sm font-medium text-black">
                  {report.injury_data.category}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-normal break-words border border-gray-300">
                <div className="text-sm font-medium text-black">
                  {report.injury_data.location}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-normal break-words border border-gray-300">
                <div className="text-sm font-medium text-black">
                  {report.injury_data.incidentDateAndTime}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-normal break-words border border-gray-300">
                <div className="text-sm font-medium text-black">
                  {report.injury_data.incidentReportedToOHSDateAndTime}
                </div>
              </td>
              <td className="px-6 py-4 border border-gray-300">
                <button
                  onClick={() => handleViewReport(report)}
                  className={`flex items-center gap-1 ${
                    isReportSubmitted(report)
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  <p className="underline">View Report</p>
                  <p className="text-lg">
                    {isReportSubmitted(report) ? "✓" : "X"}
                  </p>
                  {console.log(report)}
                </button>
              </td>
              <td className="px-6 py-4  whitespace-normal break-words border border-gray-300">
                <div className="flex flex-wrap gap-2">
                  {report.injury_data.events.map((event, eventIndex) =>
                    event.images.map((image, imgIndex) => (
                      <div key={`${image}-${imgIndex}`} className="w-20 h-20">
                        <img
                          src={image}
                          alt={`Injury Report Image ${eventIndex}-${imgIndex}`}
                          className="w-20 h-20 object-cover rounded"
                          loading="lazy"
                        />
                      </div>
                    ))
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-normal break-words border border-gray-300">
                <div className="text-sm font-medium text-black">
                  {report.injury_data.organizationalFactors}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-normal break-words border border-gray-300">
                <div className="text-sm font-medium text-black">
                  {report.injury_data.otherCircumstances}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-normal break-words border border-gray-300">
                <div className="text-sm font-medium text-black">
                  {report.injury_data.toolsMaterialsEquipment}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-normal break-words border border-gray-300">
                <div className="text-sm font-medium text-black">
                  {report.injury_data.workSiteConditions}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InjuryReportsTable;
