import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import baseUrl from '../../api/api';
import { useDispatch } from 'react-redux';
import { setUser } from '../../features/auth/authSlice';
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

const IOSUserLogin = () => {
  const [email, setEmail] = useState('');
  const [empId, setEmpId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log({ email, empId });

    try {
      // Try user login first
      const response = await fetch(baseUrl.baseUrl + 'api/user-login/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, empId }),
      });

      const data = await response.json();

      if (response.ok) {
        // User login successful
        console.log("User Login Response:", data);
        
        dispatch(setUser({
          userId: data.user?.userId || data.user?.empId,
          role: 'user',
          email: data.user?.email,
          empId: data.user?.empId,
          name: data.user?.name || data.user?.empId
        }));

        // Store JWT in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', 'user');

        toast.success('Login successful! Welcome to your training dashboard.');
        navigate('/ios-user-training'); // Redirect to iOS user training page
      } else {
        // Try admin login as fallback
        const adminResponse = await fetch(baseUrl.baseUrl + 'api/admin/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, EmpId: empId }),
        });

        const adminData = await adminResponse.json();

        if (adminResponse.ok) {
          // Admin login successful
          dispatch(setUser({
            userId: adminData.user?.userId,
            role: adminData.user?.role || 'admin',
          }));

          localStorage.setItem('token', adminData.token);
          localStorage.setItem('userRole', 'admin');

          toast.success('Admin login successful!');
          navigate('/'); // Redirect to admin dashboard
        } else {
          // Both logins failed
          toast.error('Login failed: Invalid credentials');
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - Form */}
      <div className="md:w-1/2 w-full flex justify-center items-center bg-gray-100 flex-col">
        <p className='text-2xl mb-10 md:w-[400px] text-black font-semibold'>
          Empowering Employee <span className='text-[#016E5B]'>Training</span> and Growth
        </p>
        <form
          onSubmit={handleSubmit}
          className="p-8 bg-white shadow-lg border-gray-500 rounded-lg w-full md:mx-0 mx-2 md:w-[400px] md:h-[400px]"
        >
          <h2 className="text-2xl font-semibold text-center mb-6 text-[#016E5B]">Employee Login</h2>

          {/* Email Field */}
          <label className="input input-bordered flex items-center border-gray-300 gap-2 mb-4 bg-white">
            <input
              type="email"
              className="grow text-[#016E5B] font-semibold"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          {/* Employee ID Field */}
          <label className="input input-bordered flex items-center gap-2 mb-4 border-gray-300 bg-white relative">
            <div className="absolute text-[#016E5B] text-2xl right-5 cursor-pointer">
              {!showPassword ? (
                <FaEye onClick={() => setShowPassword(true)} />
              ) : (
                <FaEyeSlash onClick={() => setShowPassword(false)} />
              )}
            </div>
            <input
              type={!showPassword ? "password" : "text"}
              className="grow text-[#016E5B] font-semibold"
              placeholder="Employee ID"
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              required
            />
          </label>

          {/* Submit Button */}
          <div className='flex justify-center items-center'>
            {loading ? (
              <div className="w-[50%] bg-[#016E5B] text-white text-center py-2 rounded-lg mt-[50px]">
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Logging in...
                </div>
              </div>
            ) : (
              <button
                type="submit"
                className="w-[50%] bg-[#016E5B] text-white py-2 rounded-lg hover:bg-[#014f42] mt-[50px]"
              >
                Login
              </button>
            )}
          </div>

          {/* Info Text */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Use your employee email and ID to access your assigned trainings
          </p>
        </form>
      </div>

      {/* Right Side - Background */}
      <div className="w-1/2 bg-[#016E5B] md:flex justify-center items-center hidden">
        <img src="./image.png" width={'500px'} alt="Training Platform" />
      </div>
    </div>
  );
};

export default IOSUserLogin;
