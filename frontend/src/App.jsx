import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";

// Core structural components
import ErrorBoundary from "./components/ErrorBoundary";
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
//const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* 3. AUTHENTICATION PAGES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
