import { Route, Routes } from "react-router";
import Login from "../pages/Login";

function LoginRoute() {
  return (
    <Routes>
      <Route path="*" element={<Login />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default LoginRoute;
