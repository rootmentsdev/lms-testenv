/**
 * Card Skeleton Component
 * 
 * Loading placeholder for card components
 * Displays animated skeleton while card data is being fetched
 * 
 * @returns {JSX.Element} - Skeleton loading component
 */
const Card = () => {
    return (
        <div 
            role="status" 
            className="flex items-center justify-center h-40 w-72 shadow-xl bg-slate-100 rounded-lg animate-pulse"
            aria-label="Loading card data"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default Card;
