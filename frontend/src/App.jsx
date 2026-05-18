import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import DiveForm from "./pages/DiveFormPage"
import DiveInfo from "./pages/DiveInfo"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new" element={<DiveForm />} />
        <Route path="/edit/:id" element={<DiveForm />} />
        <Route path="/dives/:id" element={<DiveInfo />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App