
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
        <Route path={'/training'} element={<Training />} />
        <Route path={'/settings'} element={<Setting />} />
      </Routes>

    </>
  )
}

export default App
