import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import baseUrl from '../../api/api';
import { useDispatch } from 'react-redux';
import { setUser } from '../../features/auth/authSlice';
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState('');
  const [EmpId, setEmpId] = useState('');
  const [Open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  // const [user, setUsers] = useState([])
  const dispatch = useDispatch(); // Initialize useDispatch
  const navigate = useNavigate(); // Initialize useNavigate


  const handleSubmit = async (e) => {
    setLoading(false)
    e.preventDefault();
    console.log({ email, EmpId });

    try {
     const response = await fetch('https://lms-testenv.onrender.com/api/admin/admin/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
        body: JSON.stringify({ email, EmpId }),
      });

      const data = await response.json();

      console.log("API Response:", data.user); // Debugging: Log the full response

      if (response.ok) {
        // Assuming the response has `userId` and `role` at the root level
        console.log("User Info from API:", data.user?.userId, data.user?.role);

        // Dispatch the user info to Redux store
        dispatch(setUser({
          userId: data.user?.userId, // Adjust based on the API response structure
          role: data.user?.role,     // Adjust based on the API response structure
        }));
        setLoading(true)
        // Store JWT in localStorage
        localStorage.setItem('token', data.token);

        // Display success message and redirect
        toast.success('Login successful');
        navigate('/'); // Redirect to the desired route
      } else {
        setLoading(true)
        // Handle non-200 responses
        console.error("Login failed:", data.message);
        toast.error('Login failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      setLoading(true)
      // Handle fetch or network errors
      console.error('Error during login:', error);
      toast.error('An error occurred during login');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - Form */}
      <div className="md:w-1/2 w-full flex justify-center items-center bg-gray-100 flex-col ">
        <p className='text-2xl mb-10 md:w-[400px] text-black font-semibold'>Empowering Employee <span className='text-[#016E5B]'>Training</span> and Growth</p>
        <form
          onSubmit={handleSubmit}
          className="p-8 bg-white shadow-lg border-gray-500  rounded-lg w-full md:mx-0 mx-2 md:w-[400px] md:h-[400px]"
        >
          <h2 className="text-2xl font-semibold text-center mb-6 text-[#016E5B]">Login</h2>



          {/* Email Field */}
          <label className="input  input-bordered flex items-center border-gray-300 gap-2 mb-4 bg-white">
            <input
              type="email"
              className="grow text-[#016E5B] font-semibold"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="input  input-bordered flex items-center gap-2 mb-4 border-gray-300 bg-white relative">
            <div className="absolute text-[#016E5B] text-2xl right-5 cursor-pointer">
              {!Open ? <FaEye onClick={() => setOpen((prev) => !prev)} /> : <FaEyeSlash onClick={() => setOpen((prev) => !prev)} />}
            </div>
            <input
              type={!Open ? "password" : "text"}
              className="grow text-[#016E5B] font-semibold"
              placeholder="Admin Password "
              value={EmpId}
              onChange={(e) => setEmpId(e.target.value)}
              required
            />
          </label>

          {/* Username Field */}


          {/* Submit Button */}
          <div className='flex justify-center items-center'>
            {loading ? <button
              type="submit"
              className="w-[50%] bg-[#016E5B] text-white py-2 rounded-lg hover:bg-[#014f42] mt-[50px]"
            >
              Login
            </button> : <p
              type="submit"
              className="w-[50%] bg-[#016E5B] text-white text-center py-2 rounded-lg  mt-[50px]"
            >
              Loading
            </p>}

          </div>
        </form>
      </div>

      {/* Right Side - Background */}
      <div className="w-1/2 bg-[#016E5B] md:flex justify-center items-center  hidden">
        <img src="./image.png" width={'500px'} alt="" /></div>
    </div>
  );
};

export default Login;



