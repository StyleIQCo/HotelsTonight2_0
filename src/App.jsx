import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Toasts from './components/Toasts.jsx';
import AuthModal from './components/AuthModal.jsx';
import FlashDropBanner from './components/FlashDropBanner.jsx';
import HomePage from './pages/HomePage.jsx';
import HotelDetailPage from './pages/HotelDetailPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import PartnerDashboard from './pages/PartnerDashboard.jsx';
import SecretRevealPage from './pages/SecretRevealPage.jsx';
import PartnerLandingPage from './pages/PartnerLandingPage.jsx';
import PartnerApplyPage from './pages/PartnerApplyPage.jsx';
import ProspectDatabasePage from './pages/ProspectDatabasePage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import WriteReviewPage from './pages/WriteReviewPage.jsx';
import BookingExchangePage from './pages/BookingExchangePage.jsx';
import TransferCheckoutPage from './pages/TransferCheckoutPage.jsx';
import NightOutPage from './pages/NightOutPage.jsx';
import BundleCheckoutPage from './pages/BundleCheckoutPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import GroupPlannerPage from './pages/GroupPlannerPage.jsx';
import JoinGroupPage from './pages/JoinGroupPage.jsx';

export default function App() {
  return (
    <>
      <Nav />
      <FlashDropBanner />
      <main className="container" style={{ paddingBottom: 80 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hotel/:id" element={<HotelDetailPage />} />
          <Route path="/secret/:id" element={<SecretRevealPage />} />
          <Route path="/checkout/:id" element={<CheckoutPage />} />
          <Route path="/confirmation/:id" element={<ConfirmationPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/review/:id" element={<WriteReviewPage />} />
          <Route path="/exchange" element={<BookingExchangePage />} />
          <Route path="/exchange/:id" element={<TransferCheckoutPage />} />
          <Route path="/night-out" element={<NightOutPage />} />
          <Route path="/night-out/:id" element={<BundleCheckoutPage />} />
          <Route path="/for-hotels" element={<PartnerLandingPage />} />
          <Route path="/partner-apply" element={<PartnerApplyPage />} />
          <Route path="/partners" element={<PartnerDashboard />} />
          <Route path="/prospects" element={<ProspectDatabasePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/groups/new" element={<GroupPlannerPage />} />
          <Route path="/groups/:id" element={<GroupPlannerPage />} />
          <Route path="/join/:id" element={<JoinGroupPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <AuthModal />
      <Toasts />
    </>
  );
}
