import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Registration from "./pages/Registration";
import Chat from "./pages/Chat";
import AdminDash from "./pages/AdminDash";

function App() {
  return (
    <>
      <Router>
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
