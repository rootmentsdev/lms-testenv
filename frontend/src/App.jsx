import { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "@fontsource/poppins"
import "@fontsource/poppins/500.css"
import "@fontsource/poppins/700.css"
import HashLoader from "react-spinners/HashLoader";


import { lazy, Suspense } from 'react';
const Home = lazy(() => import('./pages/Home/Home'));
const Login = lazy(() => import('./pages/Login/Login'));
const Assessments = lazy(() => import('./pages/Assessments/Assessments'));
const Branch = lazy(() => import('./pages/Branch/Branch'));
const Employee = lazy(() => import('./pages/Employee/Employee'));
const Module = lazy(() => import('./pages/Modules/Module'));
const Training = lazy(() => import('./pages/Training/Training'));
const Setting = lazy(() => import('./pages/Setting/Setting'));
const CreateTraining = lazy(() => import('./pages/Training/CreateTraining'));
const AssignedTrainings = lazy(() => import('./pages/Training/AssignedTrainings'));
const AssingOrdelete = lazy(() => import('./pages/Training/AssingOrdelete'));
const CreateModule = lazy(() => import('./pages/Modules/createmodule/CreateModule'));
const CreateTrainings = lazy(() => import('./pages/Training/createTraining/CreateTrainings'));
const Reassign = lazy(() => import('./pages/Training/Reassign/Reassign'));
const MandatoryTraining = lazy(() => import('./pages/Training/Mandatorytraining/Mandatorytraining'));
const UserTrainingProgress = lazy(() => import('./pages/Training/UserTrainingProgress/UserTrainingProgress'));
const CreateAssessment = lazy(() => import('./pages/Assessments/CreateAssessment/CreateAssessment'));
const AssessmentsAssign = lazy(() => import('./pages/Assessments/AssessmentsAssign/AssessmentsAssign'));
const AssignAssessment = lazy(() => import('./pages/Assessments/AssignAssessment/AssignAssessment'));
// Test component removed - no longer needed
const Notifications = lazy(() => import('./pages/Notification/Notifications.jsx'))
const AddBranch = lazy(() => import('./pages/Branch/AddBranch.jsx'))
const AssessmentOverDuedata = lazy(() => import('./pages/OverDue/AssessmentOverDuedata.jsx'))
const TraningOverDuedata = lazy(() => import('./pages/OverDue/TraningOverDuedata.jsx'))
const EmployeeDetaile = lazy(() => import('./pages/Employee/EmployeeDetaile/EmployeeDetaile.jsx'))
const BranchDetails = lazy(() => import('./pages/Branch/BranchDetails/BranchDetails.jsx'))
const Profile = lazy(() => import('./pages/profile/Profile.jsx'))
const LoginAnalytics = lazy(() => import('./pages/Setting/LoginAnalytics.jsx'))
const WalkinList = lazy(() => import('./pages/Walkin/WalkinList.jsx'))
const WalkinReport = lazy(() => import('./pages/Walkin/WalkinReport.jsx'))
const TaskManagement = lazy(() => import('./pages/Task/TaskManagement.jsx'))
const CreateTask = lazy(() => import('./pages/Task/CreateTask.jsx'))

import { setUser } from './features/auth/authSlice.js';

// Custom Components
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Header from './components/Header/Header';

import baseUrl from './api/api';
import { useDispatch } from 'react-redux';

// Layout wrapper that adds the global header to all protected pages
const ProtectedLayout = ({ children }) => (
  <ProtectedRoute>
    <Header />
    <div style={{ paddingTop: '60px' }}>{children}</div>
  </ProtectedRoute>
);




function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      const verifyToken = async () => {
        try {
          const response = await fetch(`${baseUrl.baseUrl}api/admin/admin/verifyToken`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            navigate('/login');
            return;
          }

          const request = await response.json();

          if (request.user) {
            dispatch(setUser({
              userId: request.user.userId,
              role: request.user.role,
            }));
          } else {
            console.error('No user data in token verification response');
            localStorage.removeItem('token');
            navigate('/login');
          }

        } catch (error) {
          console.error('Error verifying token:', error);
          localStorage.removeItem('token');
          window.location.reload();
          navigate('/login');
        }
      };

      verifyToken();
    }
  }, [dispatch, navigate]);

  return (
    <>
      <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <HashLoader color="#016E5B" size={50} />
      </div>}>
        <Routes>
          {/* Public Route */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedLayout><Home /></ProtectedLayout>} />
          <Route path="/assessments" element={<ProtectedLayout><Assessments /></ProtectedLayout>} />

          <Route path="/branch" element={<ProtectedLayout><Branch /></ProtectedLayout>} />
          <Route path="/Addbranch" element={<ProtectedLayout><AddBranch /></ProtectedLayout>} />

          <Route path="/employee" element={<ProtectedLayout><Employee /></ProtectedLayout>} />
          <Route path="/module" element={<ProtectedLayout><Module /></ProtectedLayout>} />
          <Route path="/settings" element={<ProtectedLayout><Setting /></ProtectedLayout>} />
          <Route path="/alltraining" element={<ProtectedLayout><Training /></ProtectedLayout>} />
          <Route path="/training" element={<ProtectedLayout><CreateTraining /></ProtectedLayout>} />
          <Route path="/assigdata" element={<ProtectedLayout><AssignedTrainings /></ProtectedLayout>} />
          <Route path="/assigtraining/:id" element={<ProtectedLayout><AssingOrdelete /></ProtectedLayout>} />
          <Route path="/createmodule" element={<ProtectedLayout><CreateModule /></ProtectedLayout>} />
          <Route path="/createnewtraining" element={<ProtectedLayout><CreateTrainings /></ProtectedLayout>} />
          <Route path="/reassign/:id" element={<ProtectedLayout><Reassign /></ProtectedLayout>} />
          <Route path="/create/mandatorytraining" element={<ProtectedLayout><MandatoryTraining /></ProtectedLayout>} />
          <Route path="/trainingdetails/:id" element={<ProtectedLayout><UserTrainingProgress /></ProtectedLayout>} />
          <Route path="/create/assessment" element={<ProtectedLayout><CreateAssessment /></ProtectedLayout>} />
          <Route path="/assessment/assign/:id" element={<ProtectedLayout><AssessmentsAssign /></ProtectedLayout>} />
          <Route path="/assign/assessment" element={<ProtectedLayout><AssignAssessment /></ProtectedLayout>} />
          {/* Test route removed - no longer needed */}
          <Route path="/admin/Notification" element={<ProtectedLayout><Notifications /></ProtectedLayout>} />

          <Route path="/admin/overdue/assessment" element={<ProtectedLayout><AssessmentOverDuedata /></ProtectedLayout>} />
          <Route path="/admin/overdue/training" element={<ProtectedLayout><TraningOverDuedata /></ProtectedLayout>} />
          <Route path="/detailed/:id" element={<ProtectedLayout><EmployeeDetaile /></ProtectedLayout>} />

          <Route path="/branch/detailed/:id" element={<ProtectedLayout><BranchDetails /></ProtectedLayout>} />
          <Route path="/admin/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
          <Route path="/admin/login-analytics" element={<ProtectedLayout><LoginAnalytics /></ProtectedLayout>} />
          <Route path="/walkin/list" element={<ProtectedLayout><WalkinList /></ProtectedLayout>} />
          <Route path="/walkin/report" element={<ProtectedLayout><WalkinReport /></ProtectedLayout>} />
          <Route path="/task" element={<ProtectedLayout><TaskManagement /></ProtectedLayout>} />
          <Route path="/task/create" element={<ProtectedLayout><CreateTask /></ProtectedLayout>} />

        </Routes>
      </Suspense>
      <ToastContainer />
    </>
  );
}

export default App;
