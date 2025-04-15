import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const AdminPerformanceReporting = ({ staffId }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (staffId) {
      fetchReportData(staffId);
      fetchCategories();
    }
  }, [staffId]);

  const fetchReportData = async (staffId) => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/performance-report/${staffId}`,
        { withCredentials: true }
      );
      if (data.success) {
        setReportData(data.reportData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error fetching report: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/performance-categories",
        { withCredentials: true }
      );
      if (data.success) {
        setCategories(data.categories);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const calculateCategoryProgress = (category) => {
    if (!reportData || !category) return 0;

    const totalQuantity = category.quantity || 0;
    const matchedQuantity = reportData.publications.filter(
      (entry) => entry.area === category.name
    ).length;

    return totalQuantity > 0 ? (matchedQuantity / totalQuantity) * 100 : 0;
  };

  const calculateCategoryCounts = () => {
    if (!categories || !reportData) return [];

    return categories.map((category) => {
      const count = reportData.publications.filter(
        (entry) => entry.area === category.name
      ).length;
      return { category: category.name, count };
    });
  };

  const getChartData = () => {
    const categoryCounts = calculateCategoryCounts();

    return {
      labels: categoryCounts.map((item) => item.category),
      datasets: [
        {
          label: "Number of Entries",
          data: categoryCounts.map((item) => item.count),
          backgroundColor: "#4caf50",
        },
      ],
    };
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Academic Staff Performance Report
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading report...</p>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Publications Summary */}
          <section className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-4 text-gray-700">
              Publications Summary
            </h3>
            <p className="text-gray-600">
              <strong>Total Publications:</strong>{" "}
              {reportData.publications.length}
            </p>
            <table className="w-full mt-4 border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Title</th>
                  <th className="border p-2 text-left">Category</th>
                  <th className="border p-2 text-left">Date</th>
                  <th className="border p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.publications.map((pub, index) => (
                  <tr key={index} className="border">
                    <td className="border p-2">{pub.title}</td>
                    <td className="border p-2">{pub.area}</td>
                    <td className="border p-2">
                      {new Date(pub.date).toLocaleDateString()}
                    </td>
                    <td className="border p-2">
                      {pub.grade ? "Completed" : "Under Supervised"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Area Progress */}
          <section className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-4 text-gray-700">
              Area Progress
            </h3>
            {categories.map((category) => (
              <div key={category._id} className="mb-4">
                <h4 className="text-xl font-semibold mb-2 text-gray-700">
                  {category.name}
                </h4>
                <div className="w-full bg-gray-200 rounded-full h-4 relative">
                  <div
                    className={`${
                      calculateCategoryProgress(category) === 100
                        ? "bg-green-500"
                        : "bg-teal-500"
                    } h-4 rounded-full`}
                    style={{
                      width: `${calculateCategoryProgress(category)}%`,
                    }}
                  ></div>
                  <span className="absolute inset-0 flex items-center justify-center text-black font-bold">
                    {calculateCategoryProgress(category).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </section>

          {/* Overall Performance Summary */}
          <section className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-4 text-gray-700">
              Overall Performance Summary
            </h3>
            <Bar data={getChartData()} />
          </section>
        </div>
      ) : (
        <p className="text-center text-gray-500">No report data available.</p>
      )}
    </div>
  );
};

export default AdminPerformanceReporting;
