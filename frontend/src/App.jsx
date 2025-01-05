
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import Assessments from './pages/Assessments/Assessments'
import Branch from './pages/Branch/Branch'
import Employee from './pages/Employee/Employee'
import Module from './pages/Modules/Module'
import Training from './pages/Training/Training'
import Setting from './pages/Setting/Setting'
import CreateTraining from './pages/Training/CreateTraining'
import "@fontsource/poppins"; // Defaults to weight 400
import "@fontsource/poppins/500.css"; // Weight 500
import "@fontsource/poppins/700.css"; // Weight 700
import AssignedTrainings from './pages/Training/AssignedTrainings'
import AssingOrdelete from './pages/Training/AssingOrdelete'
import CreateModule from './pages/Modules/createmodule/CreateModule'
import CreateTrainings from './pages/Training/createTraining/CreateTrainings'
import Reassign from './pages/Training/Reassign/Reassign'
import Mandatorytraining from './pages/Training/Mandatorytraining/Mandatorytraining'
import CreateAssessment from './pages/Assessments/CreateAssessment/CreateAssessment'
import AssessmentsAssign from './pages/Assessments/AssessmentsAssign/AssessmentsAssign'
import UserTrainingProgress from './pages/Training/UserTrainingProgress/UserTrainingProgress'
import { ToastContainer } from 'react-toastify';
function App() {

  return (
    <>

      <Routes>
        <Route path={'/'} element={<Home />} />
        <Route path={'/login'} element={<Login />} />
        <Route path={'/assessments'} element={<Assessments />} />
        <Route path={'/branch'} element={<Branch />} />
        <Route path={'/employee'} element={<Employee />} />
        <Route path={'/module'} element={<Module />} />
        <Route path={'/settings'} element={<Setting />} />

        <Route path={'/Alltraining'} element={<Training />} />
        <Route path={'/training'} element={<CreateTraining />} />
        <Route path={'/AssigData'} element={< AssignedTrainings />} />
        <Route path={'/AssigTraining/:id'} element={< AssingOrdelete />} />
        <Route path={'/createModule'} element={< CreateModule />} />
        <Route path={'/createnewtraining'} element={< CreateTrainings />} />
        <Route path={'/Reassign/:id'} element={< Reassign />} />
        <Route path={'/create/Mandatorytraining'} element={< Mandatorytraining />} />
        <Route path={'/Trainingdetails/:id'} element={< UserTrainingProgress />} />

        <Route path={'/create/Assessment'} element={< CreateAssessment />} />
        <Route path={'/Assessment/Assign/:id'} element={< AssessmentsAssign />} />

        {/*  */}
      </Routes>
      <ToastContainer />

    </>
  )
}

export default App
