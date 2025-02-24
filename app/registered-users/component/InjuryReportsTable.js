import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/firebaseInit";
import { collection, getDocs } from "firebase/firestore";
import { DateTimeUtility } from "@/lib/utils/DateTimeUtility";

const InjuryReportsTable = ({ reports }) => {
  const [selectedData, setSelectedData] = useState([]);

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

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center py-4">
        <h2 className="text-lg font-semibold">Injury Reports</h2>
      </div>
      <table
        className="min-w-full divide-y divide-gray-200 border border-gray-100"
        id="injury-reports-table"
      >
        <thead className="bg-yellow-100 w-full">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Company Name
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Reported By
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Category
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Location
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Incident Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Reported To OHS Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Images
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Organizational Factors
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Other Circumstances
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Tools/Materials/Equipment
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Work Site Conditions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {selectedData.map((report, index) => (
            <tr
              key={index}
              className={
                index % 2 === 0 ? "bg-white border-b" : "bg-gray-50 border-b"
              }
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {report.company_name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {report.date}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {report.reported_by}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {report.injury_data.category}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {report.injury_data.location}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {report.injury_data.incidentDateAndTime}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {report.injury_data.incidentReportedToOHSDateAndTime}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
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
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {report.injury_data.organizationalFactors}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {report.injury_data.otherCircumstances}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {report.injury_data.toolsMaterialsEquipment}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
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