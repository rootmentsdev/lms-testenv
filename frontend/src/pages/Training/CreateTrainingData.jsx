import { Link } from "react-router-dom"
import RoundProgressBar from "../../components/RoundBar/RoundBar"
import Header from "../../components/Header/Header"
import { FaPlus } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";
import { useEffect, useState } from "react";
import baseUrl from "../../api/api";
import Card from "../../components/Skeleton/Card";
import SideNav from "../../components/SideNav/SideNav";

const CreateTrainingData = () => {
  const [isOpen, setIsOpen] = useState(false);
  //  /
  const [loading, setloading] = useState(false)
  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };
  const [data, setData] = useState([]);

  useEffect(() => {
    const Fetchdata = async () => {
      setloading(true); // Set loading to true initially
      try {
        const response = await fetch(`${baseUrl.baseUrl}api/get/mandatory/allusertraining`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result.data); // Update data
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setloading(false); // Ensure loading is false after request completes
      }
    };

    Fetchdata(); // Fetch data when component mounts
  }, []); // Dependency array ensures this runs only once

  return (
    <div className="w-full  mb-[70px] h-full bg-white">
      <div><Header name='Mandatory Training' /></div>
      <SideNav />
      <div className="md:ml-[100px] mt-[100px]">
        <div>
          <Link to={'/Alltraining'}>
            <div className="flex justify-end mr-20">
              <div className="flex w-56 mt-5 border-2 justify-center items-center py-2 ml-10 cursor-pointer
                                        ">

                <h4 className="text-black">Show All Training</h4>
              </div>
            </div>
          </Link>
          <div className="flex text-black ml-10 gap-5 text-xl w-auto">
            <h4 className="border-b-[3px] border-[#016E5B] text-[#016E5B] ">Mandatory Trainings</h4>
            <Link to={'/AssigData'}>
              <h4 className="cursor-pointer">Assigned Trainings</h4>
            </Link>
          </div>
          <hr className="mx-10 mt-[-1px] border-[#016E5B] " />



          <div className="flex md:mx-10 md:justify-between mt-10 sm:justify-start">
            <div className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 cursor-pointer
                                    ">
              <div className="text-[#016E5B]">
                <FaPlus />
              </div>
              <Link to={'/create/Mandatorytraining'}>
                <h4 className="text-black sm:text-sm">Create Mandatory Training</h4>

              </Link>
            </div>
            <div className="relative hidden md:inline-block text-left w-36 mr-10">
              <button
                type="button"
                className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={toggleDropdown}
              >
                <h4>Filter</h4>
                <CiFilter className="text-[#016E5B]" />
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="py-1">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Option 1</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Option 2</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Option 3</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 ml-10 flex flex-wrap gap-3">

          {loading && <>
            <Card />
            <Card />
            <Card />
            <Card />
          </>}
          {
            data.map((item) => {
              return (
                <Link key={item._id} to={`/AssigTraining/${item?.trainingId}`}>
                  <RoundProgressBar
                    initialProgress={item?.averageCompletionPercentage}
                    title={item?.trainingName}
                    Module={`No. of Modules : ${item?.numberOfModules}`}
                    duration={`No. of users: ${item?.totalUsers}`}
                    complete={`Completion Rate : ${item?.averageCompletionPercentage}%`}
                  />
                </Link>
              )
            })
          }

        </div>
      </div>
    </div>
  )
}

export default CreateTrainingData