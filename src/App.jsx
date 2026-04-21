import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Toasts from './components/Toasts.jsx';
import HomePage from './pages/HomePage.jsx';
import HotelDetailPage from './pages/HotelDetailPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import PartnerDashboard from './pages/PartnerDashboard.jsx';
import SecretRevealPage from './pages/SecretRevealPage.jsx';
import PartnerLandingPage from './pages/PartnerLandingPage.jsx';
import PartnerApplyPage from './pages/PartnerApplyPage.jsx';
import ProspectDatabasePage from './pages/ProspectDatabasePage.jsx';

export default function App() {
  return (
    <>
      <Nav />
      <main className="container" style={{ paddingBottom: 60 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hotel/:id" element={<HotelDetailPage />} />
          <Route path="/secret/:id" element={<SecretRevealPage />} />
          <Route path="/checkout/:id" element={<CheckoutPage />} />
          <Route path="/confirmation/:id" element={<ConfirmationPage />} />
          <Route path="/for-hotels" element={<PartnerLandingPage />} />
          <Route path="/partner-apply" element={<PartnerApplyPage />} />
          <Route path="/partners" element={<PartnerDashboard />} />
          <Route path="/prospects" element={<ProspectDatabasePage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <Toasts />
    </>
  );
}
