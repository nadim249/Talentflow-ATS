import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";

// Core structural components
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from './components/LoadingSpinner';
import GuestRoute from './components/GuestRoute';



const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
//const Dashboard = lazy(() => import('./pages/Dashboard'));

const NotFound = lazy(() => import('./pages/NotFound'));


function App() {
  return (
    <ErrorBoundary>

      <Suspense fallback={<LoadingSpinner text="Loading page..." />}>

      <Routes>
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


          <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
