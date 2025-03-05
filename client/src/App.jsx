import React from 'react'
import { Routes, Route, BrowserRouter} from 'react-router-dom'
import Home from './pages/Home'
import LogIn from './pages/LogIn'
import SignUp from './pages/SignUp'


function App() {
  return <BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />}/>
    <Route path="/login" element={<LogIn />}/>
    <Route path="/signup" element={<SignUp />}/>
  </Routes>
  </BrowserRouter>
}

export default App
