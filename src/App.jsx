import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import { StoreProvider } from './store';
import PublicLayout from './components/PublicLayout';
import DemoBar from './components/DemoBar';
import { Toasts } from './components/ui';
import Home from './pages/public/Home';
import About from './pages/public/About';
import PracticeArea from './pages/public/PracticeArea';
import LawyerProfile from './pages/public/LawyerProfile';
import { Article, InsightsIndex } from './pages/public/Insights';
import Booking from './pages/public/Booking';
import Login from './pages/public/Login';
import CallRoom from './pages/CallRoom';
import { AppointmentsPage, DocumentsPage, InvoicesPage, MessagesPage, Overview, PortalLayout } from './pages/portal/Portal';
import { Billing, ClientPage, Clients, Dashboard, Diary, Inbox, StaffLayout } from './pages/staff/Staff';

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="practice/:id" element={<PracticeArea />} />
            <Route path="lawyers/:id" element={<LawyerProfile />} />
            <Route path="insights" element={<InsightsIndex />} />
            <Route path="insights/:id" element={<Article />} />
          </Route>
          <Route path="book" element={<Booking />} />
          <Route path="login" element={<Login />} />
          <Route path="call/:id" element={<CallRoom />} />

          <Route path="portal" element={<PortalLayout />}>
            <Route index element={<Overview />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="messages" element={<MessagesPage />} />
          </Route>

          <Route path="staff" element={<StaffLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="diary" element={<Diary />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientPage />} />
            <Route path="invoices" element={<Billing />} />
            <Route path="messages" element={<Inbox />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <DemoBar />
        <Toasts />
      </HashRouter>
    </StoreProvider>
  );
}
