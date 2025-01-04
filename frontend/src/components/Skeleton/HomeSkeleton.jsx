const HomeSkeleton = () => {
    return (
        <div role="status" className="flex items-center justify-center w-full sm:w-48 md:w-52 lg:w-60 h-28 shadow-xl bg-gray-300 rounded-lg animate-pulse">
            <span className="sr-only">Loading...</span>
        </div>
    );
}

export default HomeSkeleton;
