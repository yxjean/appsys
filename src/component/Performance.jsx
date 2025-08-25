import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const PerformanceManager = () => {
  const [categories, setCategories] = useState([]);
  const [ selectedDesignation, setSelectedDesignation ] = useState("lecture");
  const [ selectedDesignationScopeDistribution, setSelectedDesignationScopeDistribution ] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(()=>{
    if(categories.length) {
      setSelectedDesignationScopeDistribution(categories.filter((designation) =>{ 
        return designation.designation === selectedDesignation 
      })[0].performance_area_score_distribution);
    }
  },[categories,selectedDesignation]);


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

  const handleDesignationOnChg = (ev)=> {
    setSelectedDesignation(ev.target.value);
  }

  const updateCategoryQuantity = async (designation, performanceArea, quantity) => {
    try {
      const { data } = await axios.put(
        `http://localhost:4000/api/performance-categories/${designation}`,
        { 
          performanceArea,
          quantity 
        },
        { withCredentials: true }
      );
      if (data.success) {

        fetchCategories();
        toast.success("Category total quantity updated");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleQuantityChange = (designation, performanceArea, quantity) => {
    quantity = parseInt(quantity, 10);
    if (!isNaN(quantity)) {
      updateCategoryQuantity(designation, performanceArea, quantity);
    }
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold mb-4">Performance Area Management</h2>
      <div class="mb-3">
        <strong>Designation: </strong>
        <select value={selectedDesignation} onChange={handleDesignationOnChg} class="ml-2 border border-gray-300 rounded-md px-3 py-2 cursor-pointer">
          {categories.map((designation)=>{
            return (<option value={designation.designation}>{designation.designation}</option>)
          })}
        </select>
      </div>
      <div className="space-y-4">
        {selectedDesignationScopeDistribution.map((category) => (
          <div
            key={category._id}
            className="border border-gray-300 rounded p-4 flex justify-between items-center"
          >
            <span className="font-bold">{category.name}</span>
            <div className="flex items-center border border-gray-300 rounded px-2">
              <input
                type="number"
                value={category.quantity}
                onChange={(e) =>
                  handleQuantityChange(selectedDesignation,category.name, e.target.value)
                }
                className="p-2 w-16 border-none focus:outline-none"
              />
              <span className="text-gray-600">%</span>
            </div>
              
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceManager;
