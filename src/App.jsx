    import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import "./styles/global.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import PropertyDetail from "./pages/PropertyDetail";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LandlordDashboard from "./pages/LandlordDashboard";
import TenantDashboard from "./pages/TenantDashboard";
import VerifyEmail from "./pages/VerifyEmail";
import CheckEmail from "./pages/CheckEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import LandlordProfile from "./pages/LandlordProfile";

import Chat from "./pages/Chat";

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Nav />
          <Routes>
            <Route path="/"                       element={<Home />} />
            <Route path="/listings"               element={<Listings />} />
            <Route path="/listings/:id"           element={<PropertyDetail />} />
            <Route path="/contact"                element={<Contact />} />
            <Route path="/login"                  element={<Login />} />
            <Route path="/register"               element={<Register />} />
            <Route path="/landlord/:id" element={<LandlordProfile />} />
            <Route path="/verify-email/:token"    element={<VerifyEmail />} />
            <Route path="/check-email"            element={<CheckEmail />} />
            <Route path="/forgot-password"        element={ <ForgotPassword />} />
            <Route path="/reset-password/:token"  element={<ResetPassword />} />
            
            <Route path="/messages"               element={
              <ProtectedRoute><Chat /></ProtectedRoute>
            } />
            <Route path="/messages/:conversationId" element={
              <ProtectedRoute><Chat /></ProtectedRoute>
            } />
            <Route path="/landlord/dashboard"     element={
              <ProtectedRoute role="landlord"><LandlordDashboard /></ProtectedRoute>
            } />
            <Route path="/tenant/dashboard"       element={
              <ProtectedRoute role="tenant"><TenantDashboard /></ProtectedRoute>
            } />
            <Route path="*"                       element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}