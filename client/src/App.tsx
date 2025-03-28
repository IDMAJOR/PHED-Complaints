import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Registration from "./pages/Registration";
import Chat from "./pages/Chat";
import AdminDash from "./pages/AdminDash";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={<Registration />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/admin-dashboard-0" element={<AdminDash />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
