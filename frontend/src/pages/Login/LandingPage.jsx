import { Link } from 'react-router-dom';

const LandingPage = () => {
  console.log('LandingPage component rendering');
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#016E5B] to-[#014f42] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-4xl mx-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#016E5B] mb-4">
            Learning Management System
          </h1>
          <p className="text-xl text-gray-600">
            Empowering Employee Training and Growth
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Admin Login Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200 hover:border-[#016E5B] transition-all duration-300 hover:shadow-lg">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#016E5B] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#016E5B] mb-3">Administrator</h3>
              <p className="text-gray-600 mb-6">
                Access admin dashboard to manage trainings, users, and system settings
              </p>
              <Link
                to="/login"
                className="inline-block bg-[#016E5B] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#014f42] transition-colors duration-300 w-full"
              >
                Admin Login
              </Link>
            </div>
          </div>

          {/* iOS User Login Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 hover:border-[#016E5B] transition-all duration-300 hover:shadow-lg">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#016E5B] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 19 16.5 19c-1.746 0-3.332-.523-4.5-1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#016E5B] mb-3">Employee</h3>
              <p className="text-gray-600 mb-6">
                Access your assigned trainings and track your learning progress
              </p>
              <Link
                to="/ios-login"
                className="inline-block bg-[#016E5B] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#014f42] transition-colors duration-300 w-full"
              >
                Employee Login
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Secure Authentication
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Mobile Optimized
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Real-time Progress
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
