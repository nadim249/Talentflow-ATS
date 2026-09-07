import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";

// Core structural components
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import ProtectedRoute from "./components/ProtectedRoute";

import GuestRoute from "./components/GuestRoute";
import ScrollToTop from "./components/ScrollToTop";
import RootRedirect from "./components/RootRedirect";

const AppLayout = lazy(() => import("./components/AppLayout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

const PublicLayout = lazy(() => import("./public/PublicLayout"));
const JobBoard = lazy(() => import("./public/JobBoard"));
const JobApply = lazy(() => import("./public/JobApply"));

const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />

      <Suspense fallback={<LoadingSpinner text="Loading page..." />}>
        <Routes>
          {/* 1. ROOT TRAFFIC SPLITTER: Recruiter -> /dashboard, Visitor -> /jobs-board */}
          <Route path="/" element={<RootRedirect />} />

          {/* 2. PUBLIC CAREERS BOARD (No authentication required) */}
          <Route path="/jobs-board" element={<PublicLayout />}>
            <Route index element={<JobBoard />} />
            <Route path=":jobId/apply" element={<JobApply />} />
          </Route>

          {/* 3. AUTHENTICATION PAGES */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />

          {/* 4. PROTECTED RECRUITER ATS (Requires valid JWT session) */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
