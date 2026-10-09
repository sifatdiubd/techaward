import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import MetaPixel from "@/components/MetaPixel";
import About from "@/pages/About";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import Categories from "@/pages/Categories";
import Contact from "@/pages/Contact";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Nomination from "@/pages/Nomination";
import NomineeDashboard from "@/pages/NomineeDashboard";
import Voting from "@/pages/Voting";
import Winners from "@/pages/Winners";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <MetaPixel />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/winners" element={<Winners />} />
          <Route path="/voting" element={<Voting />} />
          <Route path="/nomination" element={<Nomination />} />
          <Route path="/login" element={<Login />} />
          <Route path="/nominee" element={<NomineeDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
