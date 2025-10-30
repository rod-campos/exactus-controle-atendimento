import { Route, Routes } from "react-router";
import Home from "../pages/Home";

function UserRoute() {
  return (
    <Routes>
      <Route path="*" element={<Home />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default UserRoute;
