import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import QueryProvider from "./contexts/QueryProvider";
import Layout from "./components/layout/Layout";
import Register from './pages/Register';
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RequestsNew from './pages/RequestsNew';
import RequestsList from './pages/RequestsList';
import DeliveriesList from './pages/DeliveriesList';
import RequestsValidation from './pages/RequestsValidation';
import MaterialsManagement from './pages/MaterialsManagement';
import UsersManagement from './pages/UsersManagement';
import AdminSettings from './pages/AdminSettings';


function App() {
  return (
    <div className="App">
      <QueryProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="requests/new" element={<RequestsNew />} />
                <Route path="requests" element={<RequestsList />} />
                <Route path="validations" element={<RequestsValidation />} />
                <Route path="deliveries" element={<DeliveriesList />} />
                <Route path="materials" element={<MaterialsManagement />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="settings" element={<AdminSettings />} />
                {/* Les autres routes seront ajoutées progressivement */}
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryProvider>
    </div>
  );
}

export default App;