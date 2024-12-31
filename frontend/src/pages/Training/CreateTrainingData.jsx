import { Link } from "react-router-dom"
import RoundProgressBar from "../../components/RoundBar/RoundBar"
import Header from "../../components/Header/Header"
import { FaPlus } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";
import { useEffect, useState } from "react";
import baseUrl from "../../api/api";
const CreateTrainingData = () => {
  const [isOpen, setIsOpen] = useState(false);
  //  /
  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };
  const [data, setData] = useState([]);

  useEffect(() => {

    const Fetchdata = async () => {
      try {
        const response = await fetch(`${baseUrl.baseUrl}api/get/mandatory/allusertraining`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result.data);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    Fetchdata();


  }, []);
  return (
    <div className="w-full h-full bg-white">
      <div><Header name='Mandatory Training' /></div>
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
          <h4 className="border-b-[3px] border-green-600 text-green-600 ">Mandatory Trainings</h4>
          <Link to={'/AssigData'}>
            <h4 className="cursor-pointer">Assigned Trainings</h4>
          </Link>
        </div>
        <hr className="mx-10 mt-[-1px] border-green-600 " />



        <div className="flex mx-10 justify-between mt-10 ">
          <div className="flex w-56 border-2 justify-evenly items-center py-2 ml-10 cursor-pointer
                                    ">
            <div className="text-green-500">
              <FaPlus />
            </div>
            <Link to={'/create/Mandatorytraining'}>
              <h4 className="text-black">Create Mandatory Training</h4>

            </Link>
          </div>
          <div className="relative inline-block text-left w-36 mr-10">
            <button
              type="button"
              className="flex justify-between items-center w-full border-2 py-2 px-4 bg-white text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={toggleDropdown}
            >
              <h4>Filter</h4>
              <CiFilter className="text-green-500" />
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
        {
          data.map((item) => {
            return (
              <Link key={item._id} to={`/AssigTraing/${item?.trainingId}`}>
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
  )
}

export default CreateTrainingData