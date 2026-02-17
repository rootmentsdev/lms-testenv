import Header from "../Header/Header";
import SideNav from "../SideNav/SideNav";
import HomeSkeleton from "../Skeleton/HomeSkeleton";

/**
 * Static shell shown while the dashboard (Home) chunk loads.
 * Renders Header, SideNav, and placeholder cards to avoid full-page spinner.
 */
const DashboardShell = () => {
  return (
    <div className="mx-0 mb-[90px] bg-white min-h-screen">
      <div>
        <Header name="Dashboard" />
      </div>
      <div className="flex">
        <div>
          <SideNav />
        </div>
        <div className="md:ml-[100px] mt-[100px]">
          <div className="ml-12 text-black">
            <div className="flex items-center gap-3 mt-5 mb-4">
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium text-gray-700">Hello,</p>
                <div className="bg-gradient-to-r from-[#016E5B] to-[#01997A] text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
                  <span className="text-lg font-bold">...</span>
                </div>
              </div>
            </div>
            <p className="text-sm md:text-lg">Your dashboard is ready. Loading...</p>
          </div>
          <div className="flex mb-[70px] gap-3 lg:gap-10 mx-10 lg:mx-15 md:flex-wrap flex-wrap sm:w-full md:gap-9 md:mx-10 md:justify-start mt-10 font-semibold">
            <HomeSkeleton />
            <HomeSkeleton />
            <HomeSkeleton />
            <HomeSkeleton />
            <HomeSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardShell;
