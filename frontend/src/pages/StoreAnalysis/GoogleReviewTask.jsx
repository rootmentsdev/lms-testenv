import React from "react";
import SideNav from "../../components/SideNav/SideNav";
import ModileNav from "../../components/SideNav/ModileNav";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { FiStar, FiCheckSquare, FiMessageSquare, FiArrowUpRight, FiHeart } from "react-icons/fi";

const mockReviewTaskData = {
  summary: {
    avgRating: 4.6,
    totalReviews: 1420,
    taskCompletionRate: 91.4,
    correlationIndex: "Strong Positive (+0.84)"
  },
  correlationData: [
    { name: "Calicut Center", taskCompletion: 78, rating: 4.1, reviews: 95 },
    { name: "Trivandrum Mall", taskCompletion: 88, rating: 4.5, reviews: 112 },
    { name: "Kottayam Arcade", taskCompletion: 92, rating: 4.7, reviews: 75 },
    { name: "Thrissur Hub", taskCompletion: 94, rating: 4.8, reviews: 180 },
    { name: "Kochi Flagship", taskCompletion: 98, rating: 4.9, reviews: 245 }
  ],
  trendData: [
    { day: "Jun 12", "Task Completion (%)": 88, "Rating Index (x10)": 44 },
    { day: "Jun 14", "Task Completion (%)": 90, "Rating Index (x10)": 45 },
    { day: "Jun 16", "Task Completion (%)": 92, "Rating Index (x10)": 46 },
    { day: "Jun 18", "Task Completion (%)": 91, "Rating Index (x10)": 46 },
    { day: "Jun 20", "Task Completion (%)": 93, "Rating Index (x10)": 47 },
    { day: "Jun 22", "Task Completion (%)": 95, "Rating Index (x10)": 48 },
    { day: "Jun 24", "Task Completion (%)": 94, "Rating Index (x10)": 48 },
    { day: "Jun 26", "Task Completion (%)": 96, "Rating Index (x10)": 49 }
  ],
  reviews: [
    {
      id: "REV-101",
      customer: "Rahul Sharma",
      rating: 5,
      comment: "Absolutely outstanding service! The store was spotless and checkout was incredibly fast. Highly recommend the flagship branch.",
      branch: "Kochi Flagship Store",
      taskScore: "98% Tasks Done",
      date: "2 hours ago"
    },
    {
      id: "REV-102",
      customer: "Anjali Menon",
      rating: 5,
      comment: "The staff was very helpful in helping me find the right wedding attire. Store is extremely well maintained.",
      branch: "Thrissur Hub",
      taskScore: "94% Tasks Done",
      date: "5 hours ago"
    },
    {
      id: "REV-103",
      customer: "Vikram R.",
      rating: 4,
      comment: "Good experience overall. Some items were out of stock, but the team checked inventory and assisted properly.",
      branch: "Trivandrum Mall Store",
      taskScore: "88% Tasks Done",
      date: "1 day ago"
    },
    {
      id: "REV-104",
      customer: "Sajid Ibrahim",
      rating: 3,
      comment: "Store felt slightly unorganized during peak hours. Took longer than expected at the counter.",
      branch: "Calicut Center Store",
      taskScore: "78% Tasks Done",
      date: "3 days ago"
    }
  ]
};

const GoogleReviewTask = () => {

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-450">
        {[...Array(5)].map((_, i) => (
          <FiStar 
            key={i} 
            size={14} 
            fill={i < rating ? "currentColor" : "none"} 
            className={i < rating ? "text-amber-455 fill-current" : "text-gray-300"} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex w-full min-h-screen bg-[#f3f4f6] text-gray-800" style={{ fontFamily: "DM Sans, sans-serif" }}>
      <SideNav />
      <div className="md:hidden">
        <ModileNav />
      </div>

      <div className="flex-1 md:ml-[110px] min-h-screen p-4 sm:p-6 lg:p-8 mb-[70px] md:mb-0">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-gray-900 leading-tight flex items-center gap-2">
              Reviews & Task Completion <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 font-bold">Correlation</span>
            </h1>
            <p className="text-gray-500 text-[13px] mt-0.5">Analyzing the impact of store checklist execution on Google ratings.</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-100 shadow-sm rounded-[20px] p-5">
            <div className="flex items-center justify-between mb-3 text-amber-500">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">Google Review Index</span>
              <FiStar size={18} fill="currentColor" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900">{mockReviewTaskData.summary.avgRating} / 5.0</h3>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[11px] text-gray-400">Average across outlets</span>
              {renderStars(5)}
            </div>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-[20px] p-5">
            <div className="flex items-center justify-between mb-3 text-blue-600">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">Total Google Reviews</span>
              <FiMessageSquare size={18} />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900">{mockReviewTaskData.summary.totalReviews.toLocaleString()}</h3>
            <p className="text-xs text-emerald-600 mt-1 font-bold flex items-center gap-1">
              <FiArrowUpRight /> +18.4% monthly volume
            </p>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-[20px] p-5">
            <div className="flex items-center justify-between mb-3 text-emerald-600">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">Task Completion Rate</span>
              <FiCheckSquare size={18} />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900">{mockReviewTaskData.summary.taskCompletionRate}%</h3>
            <p className="text-[11px] text-gray-400 mt-1">Daily SOP tasks executed on time</p>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-[20px] p-5">
            <div className="flex items-center justify-between mb-3 text-purple-600">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">Rating Correlation</span>
              <FiHeart size={18} />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900">{mockReviewTaskData.summary.correlationIndex}</h3>
            <p className="text-[11px] text-gray-400 mt-1">Correlation index factor rating</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Correlation Chart */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-[20px] p-5">
            <h3 className="text-base font-bold text-gray-900 mb-1">Task Execution vs Google Rating</h3>
            <p className="text-xs text-gray-400 mb-6">Analyzing if higher task execution rates directly yield higher ratings.</p>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockReviewTaskData.correlationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                  <XAxis dataKey="name" stroke="#888" fontSize={9} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#00A36C" fontSize={10} domain={[60, 100]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={10} domain={[3.5, 5.0]} />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 10 }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar yAxisId="left" dataKey="taskCompletion" name="Task Completion (%)" fill="#00A36C" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="rating" name="Google Rating (1-5)" fill="#f59e0b" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Combined Trend Progress Chart */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-[20px] p-5">
            <h3 className="text-base font-bold text-gray-900 mb-1">Daily Quality Trend Analysis</h3>
            <p className="text-xs text-gray-400 mb-6">Combined overlay tracking task logs and ratings daily progression.</p>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockReviewTaskData.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                  <XAxis dataKey="day" stroke="#888" fontSize={11} />
                  <YAxis stroke="#888" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 10 }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Line type="monotone" dataKey="Task Completion (%)" stroke="#3b82f6" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="Rating Index (x10)" name="Google Rating (x10)" stroke="#ec4899" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Reviews Feed Section */}
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6">
          <h3 className="text-[17px] font-bold text-gray-900 mb-1">Recent Google Reviews & Task Context</h3>
          <p className="text-xs text-gray-400 mb-6">Directly trace review feedback against store checklist completion on the day.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockReviewTaskData.reviews.map((rev) => (
              <div 
                key={rev.id} 
                className="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-gray-200/80 transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{rev.customer}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{rev.date} • {rev.branch}</p>
                  </div>
                  {renderStars(rev.rating)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{rev.comment}"</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs font-mono text-gray-400">{rev.id}</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {rev.taskScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GoogleReviewTask;
