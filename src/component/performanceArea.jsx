import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Publication from "./categories/Publication";
import PostgraduateSupervision from "./categories/PostgraduateSupervision";
import TeachingUndergraduateSupervision from "./categories/TeachingUndergraduateSupervision";
import VASI from "./categories/VASI";
import AdministrativeService from "./categories/AdministrativeService";
import Consultancy from "./categories/Consultancy";
import Research from "./categories/Research";

const PerformanceArea = ({ userIdToView }) => {
  const [currSelectedPage, setCurrSelectedPage] = useState(1);
  const [pagination, setPagination] = useState([(
    <li>
      <a aria-current="page" class="flex items-center justify-center px-4 h-10 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700">1</a>
    </li>
  )])
  const [entries, setEntries] = useState([]);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [categoryProgress, setCategoryProgress] = useState({
    count: 0,
    total: 0,
    percentage: 0,
  });
  const [ userData, setUserData ] = useState({});


  useEffect(() => {
    fetchCategories();
    fetchEntries();
  }, []);

  useEffect(() => {
    filterEntries();
    calculateCategoryProgress();
  }, [entries, selectedCategory, categories,currSelectedPage]);



  const fetchCategories = async () => {
    try {
      const userData = await axios.get(
        "http://localhost:4000/api/user/profile",
        { withCredentials: true }
      );



      const { data } = await axios.get(
        "http://localhost:4000/api/performance-categories/user/"+((userIdToView && userIdToView !== "")?userIdToView:userData.data.user._id),
        { withCredentials: true }
      );
      if (data.success) {
        setCategories(data.categories.performance_area_score_distribution);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchEntries = async () => {
    try {
      const userData = await axios.get(
        "http://localhost:4000/api/user/profile",
        { withCredentials: true }
      );


      const { data } = await axios.get(
        "http://localhost:4000/api/performance-entries/user/"+((userIdToView && userIdToView !== "")?userIdToView:userData.data.user._id),
        { withCredentials: true }
      );
      if (data.success) {
        setEntries(data.entries);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filterEntries = () => {
    const pagination = [];
    const entriesElementStartInd = (currSelectedPage - 1) * 10;
    let displayedEntries = selectedCategory === ""?entries:entries.filter(entry=> entry.area === selectedCategory);



    for(let x = 1;x <= Math.ceil(displayedEntries.length / 10);x++) {
      pagination.push(
        x === currSelectedPage?(
          <li>
            <a onClick={()=>{setCurrSelectedPage(x)}} class="flex items-center justify-center px-4 h-10 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700">{x}</a>
          </li>
        ):(
          <li>
            <a onClick={()=>{setCurrSelectedPage(x)}} class="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700">{x}</a>
          </li>
      ));
    }
    setPagination(pagination);

    displayedEntries = displayedEntries.slice(entriesElementStartInd,entriesElementStartInd + 10);
    setFilteredEntries(displayedEntries);
  };

  const calculateCategoryProgress = () => {
    if (!selectedCategory) {
      setCategoryProgress({ count: 0, total: 50 });
      return;
    }

    const matchedEntries = entries.filter(
      (entry) => entry.area === selectedCategory
    ).length;

    const totalLimit = 50;

    setCategoryProgress({
      count: matchedEntries,
      total: totalLimit,
      percentage: Math.min((matchedEntries / totalLimit) * 100, 100),
    });
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleEntryAdded = () => {
    fetchEntries();
    setShowEntryModal(false);
  };

  const renderForm = () => {
    switch (selectedCategory) {
      case "Publication":
        return <Publication onEntryAdded={handleEntryAdded} />;
      case "Postgraduate Supervision":
        return <PostgraduateSupervision onEntryAdded={handleEntryAdded} />;
      case "Teaching & Undergraduate Supervision":
        return (
          <TeachingUndergraduateSupervision onEntryAdded={handleEntryAdded} />
        );
      case "VASI":
        return <VASI onEntryAdded={handleEntryAdded} />;
      case "Administrative Service":
        return <AdministrativeService onEntryAdded={handleEntryAdded} />;
      case "Consultancy":
        return <Consultancy onEntryAdded={handleEntryAdded} />;
      case "Research":
        return <Research onEntryAdded={handleEntryAdded} />;
      default:
        return null;
    }
  };

  const formatDetails = (details, area, title, entry) => {
    try {
      const parsedDetails = JSON.parse(details);

      // Special formatting for Publications - include file link
      if (area === "Publication") {
        return (
          <div className="pl-2">
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              {Object.entries(parsedDetails).map(([key, value]) => (
                <div
                  key={key}
                  className="mb-2 pb-2 border-b border-gray-100 last:border-0"
                >
                  <span className="font-semibold text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}:
                  </span>{" "}
                  <span className="text-gray-800">{value}</span>
                </div>
              ))}

              {/* Add file link if document exists */}
              {entry.document && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-700">Document:</span>{" "}
                  <a
                    href={`http://localhost:4000/uploads/${entry.document}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Document
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      }

      // Special formatting for Administrative Service - group by category
      if (area === "Administrative Service") {
        return (
          <div className="pl-2">
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <div className="mb-2 pb-2 border-b border-gray-100">
                <span className="font-semibold text-gray-700">Category:</span>{" "}
                <span className="text-gray-800">{parsedDetails.category}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Group:</span>{" "}
                <span className="text-gray-800">{parsedDetails.group}</span>
              </div>
            </div>
          </div>
        );
      }

      // Special formatting for Teaching & Undergraduate Supervision
      if (area === "Teaching & Undergraduate Supervision") {
        // Determine if it's teaching or undergraduate supervision
        const isTeaching = parsedDetails.teaching !== null;
        const isUndergrad = parsedDetails.undergraduateSupervision !== null;
        const data = isTeaching
          ? parsedDetails.teaching
          : parsedDetails.undergraduateSupervision;
        const subType = isTeaching ? "Teaching" : "Undergraduate Supervision";

        return (
          <div className="pl-2">
            <p className="font-medium text-blue-600 mb-2">{subType}</p>
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              {data &&
                Object.entries(data).map(([key, value]) => (
                  <div
                    key={key}
                    className="mb-2 pb-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="font-semibold text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </span>{" "}
                    <span className="text-gray-800">{value}</span>
                  </div>
                ))}
            </div>
          </div>
        );
      }

      // Special formatting for Postgraduate Supervision - matching Teaching & Undergraduate style
      if (area === "Postgraduate Supervision") {
        return (
          <div className="pl-2">
            <p className="font-medium text-blue-600 mb-2">
              Postgraduate Supervision
            </p>
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              {parsedDetails &&
                Object.entries(parsedDetails).map(([key, value]) => (
                  <div
                    key={key}
                    className="mb-2 pb-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="font-semibold text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </span>{" "}
                    <span className="text-gray-800">{value}</span>
                  </div>
                ))}
            </div>
          </div>
        );
      }

      // Special formatting for VASI
      if (area === "VASI") {
        return (
          <div className="pl-2">
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <div className="mb-2 pb-2 border-b border-gray-100">
                <span className="font-semibold text-gray-700">Description:</span>{" "}
                <span className="text-gray-800">{parsedDetails.description}</span>
              </div>
            </div>
          </div>
        );
      }

      // Special formatting for Research
      if (area === "Research") {
        return (
          <div className="pl-2">
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              {Object.entries(parsedDetails).map(([key, value]) => (
                <div 
                  key={key}
                  className="mb-2 pb-2 border-b border-gray-100 last:border-0"
                >
                  <span className="font-semibold text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}:
                  </span>{" "}
                  <span className="text-gray-800">{value}</span>
                </div>
              ))}

              {/* Add file link if document exists */}
              {entry.document && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-700">Document:</span>{" "}
                  <a
                    href={`http://localhost:4000/uploads/${entry.document}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Document
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      }


      //// Special formatting for Consultancy
      if (area === "Consultancy") {
        return (
          <div className="pl-2">
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              {Object.entries(parsedDetails).map(([key, value]) => (
                <div 
                  key={key}
                  className="mb-2 pb-2 border-b border-gray-100 last:border-0"
                >
                  <span className="font-semibold text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}:
                  </span>{" "}
                  <span className="text-gray-800">{value}</span>
                </div>
              ))}

              {/* Add file link if document exists */}
              {entry.document && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-700">Document:</span>{" "}
                  <a
                    href={`http://localhost:4000/uploads/${entry.document}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Document
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      }

      // Default formatting for other entry types
      return (
        <ul className="list-disc pl-5 space-y-1">
          {Object.entries(parsedDetails).map(([key, value]) => {
            // Skip null values
            if (value === null) return null;

            return (
              <li key={key}>
                <strong className="capitalize">
                  {key.replace(/([A-Z])/g, " $1")}:
                </strong>{" "}
                {typeof value === "object" ? (
                  <ul className="list-disc pl-5">
                    {Object.entries(value).map(([subKey, subValue]) => (
                      <li key={subKey}>
                        <strong className="capitalize">
                          {subKey.replace(/([A-Z])/g, " $1")}:
                        </strong>{" "}
                        {subValue}
                      </li>
                    ))}
                  </ul>
                ) : (
                  value
                )}
              </li>
            );
          })}
        </ul>
      );
    } catch (error) {
      return <p>{details}</p>;
    }
  };

  const renderAdministrativeServiceEntries = (entries) => {
    if (!entries || entries.length === 0) return null;

    const adminEntries = entries.filter(
      (entry) => entry.area === "Administrative Service"
    );

    if (adminEntries.length === 0) return null;

    const groupedEntries = {};

    adminEntries.forEach((entry) => {
      try {
        const details = JSON.parse(entry.details);
        const category = details.category;

        if (!groupedEntries[category]) {
          groupedEntries[category] = [];
        }

        groupedEntries[category].push({
          id: entry._id,
          title: entry.title,
          group: details.group,
        });
      } catch (error) {
        console.error("Error parsing entry details:", error);
      }
    });

    // Get University and Faculty entries separately
    const universityEntries = groupedEntries["University"] || [];
    const facultyEntries = groupedEntries["Faculty"] || [];

    return (
      <div className="mt-6 mb-6">
        <h3 className="text-lg font-bold mb-4">
          Administrative Services by Category
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow-sm">
            <h4 className="font-semibold text-teal-700 mb-3 text-lg border-b pb-2">
              University
            </h4>
            {universityEntries.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2">
                {universityEntries.map((item) => (
                  <li key={item.id} className="text-gray-700">
                    {item.group}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No university services</p>
            )}
          </div>

          {/* Faculty Column */}
          <div className="bg-white p-4 rounded shadow-sm">
            <h4 className="font-semibold text-teal-700 mb-3 text-lg border-b pb-2">
              Faculty
            </h4>
            {facultyEntries.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2">
                {facultyEntries.map((item) => (
                  <li key={item.id} className="text-gray-700">
                    {item.group}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No faculty services</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full p-6 flex flex-col min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Performance Area Management</h2>
        <div className="flex items-center">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="py-2 px-4 bg-gray-200 text-gray-700 rounded mr-2"
          >
            <option value="">Select Area</option>
            {categories.map((category) => (
              <option  value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          {
            (!userIdToView || userIdToView === "") && <button
            onClick={() => setShowEntryModal(true)}
            className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
            disabled={!selectedCategory}
          >
            Add Entry
          </button>}
        </div>
      </div>

      {selectedCategory && (
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Progress</h3>
            <span className="font-bold text-gray-700">
              {categoryProgress.count} / 50 entries
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 relative">
            <div
              className={`${
                categoryProgress.count >= 50 ? "bg-green-500" : "bg-teal-500"
              } h-6 rounded-full transition-all duration-500`}
              style={{ width: `${categoryProgress.percentage}%` }}
            ></div>
          </div>
        </div>
      )}
      {selectedCategory === "Administrative Service" &&
        renderAdministrativeServiceEntries(entries)}

      <div className="space-y-4 flex-grow">
        {filteredEntries.map((entry) => (
          <div
            key={entry._id}
            className="border border-gray-300 rounded p-4 flex flex-col space-y-2 hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-bold">{entry.title}</h3>
            <p>
              <strong>Area:</strong> {entry.area}
            </p>
            {/* Date */}
            {entry.date && (
              <p>
                <strong>Uploaded Date:</strong>{" "}
                {new Date(entry.date).toLocaleDateString("en-GB")}
              </p>
            )}

            <div>
              <strong>Details:</strong>
              <div className="bg-gray-100 p-3 rounded mt-2">
                {formatDetails(entry.details, entry.area, entry.title, entry)}
              </div>
            </div>
          </div>
        ))}

        {/* Empty state message when no entries are found */}
        {filteredEntries.length === 0 && selectedCategory && (
          <div className="text-center py-10 text-gray-500">
            No entries found for {selectedCategory}. Click "Add Entry" to create
            one.
          </div>
        )}
        <div class="flex justify-center cursor-pointer">
          <nav aria-label="Page navigation example">
            <ul class="inline-flex -space-x-px text-base h-10">
              <li>
                <a onClick={()=>{currSelectedPage > 1 && setCurrSelectedPage(currSelectedPage - 1)}} class="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700">Previous</a>
              </li>
              {pagination}
              <li>
                <a onClick={()=>{ currSelectedPage < pagination.length && setCurrSelectedPage(currSelectedPage + 1)}} class="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700">Next</a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Empty state when no category is selected */}
        {!selectedCategory && (
          <div className="text-center py-10 text-gray-500">
            Please select a category to view or add entries.
          </div>
        )}
      </div>

      {showEntryModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/2 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-4">Add New Entry</h2>
            {renderForm()}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowEntryModal(false)}
                className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceArea;
