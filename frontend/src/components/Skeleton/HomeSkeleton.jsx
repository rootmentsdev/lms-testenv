const HomeSkeleton = () => {
    return (
        <div role="status" className="flex items-center justify-center lg:justify-evenly w-full sm:w-48 md:w-52 lg:w-56 h-28 lg:gap-6 shadow-xl bg-gray-300 rounded-lg animate-pulse">
            <span className="sr-only">Loading...</span>
        </div>
    );
}

export default HomeSkeleton;
