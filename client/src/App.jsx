import React from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Home from './pages/Home'
import LogIn from './pages/LogIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/login" element={<LogIn />}/>
        <Route path="/signup" element={<SignUp />}/>
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
