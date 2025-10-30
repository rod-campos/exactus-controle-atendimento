import { BrowserRouter, Route, Routes } from "react-router";
import LoginLayout from "./layouts/LoginLayout";
import LoginRoute from "./routes/LoginRoute";
import MainLayout from "./layouts/MainLayout";
import MainRoute from "./routes/MainRoute";
import UserLayout from "./layouts/UserLayout";
import UserRoutes from "./routes/UserRoute";

function App() {
  const token = localStorage.getItem("token");
  const isAdmin = JSON.parse(localStorage.getItem("usuario"))?.isAdmin;
  const isActive = JSON.parse(localStorage.getItem("usuario"))?.isActive;
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="*"
          element={
            <LoginLayout>
              <LoginRoute />
            </LoginLayout>
          }
        />
        {isActive && isAdmin && token && (
          <Route
            path="/dashboard/*"
            element={
              <MainLayout>
                <MainRoute />
              </MainLayout>
            }
          />
        )}
        {isActive && token && (
          <Route
            path="/atendimento/*"
            element={
              <UserLayout>
                <UserRoutes />
              </UserLayout>
            }
          />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
