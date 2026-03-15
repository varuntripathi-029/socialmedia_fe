import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';

// Public pages
import WelcomePage from '@/pages/WelcomePage';
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import ChooseUsernamePage from '@/pages/auth/ChooseUsernamePage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';

// Authenticated pages
import HomeFeed from '@/pages/feed/HomeFeed';
import PostDetails from '@/pages/feed/PostDetails';
import CreatePost from '@/pages/feed/CreatePost';
import SearchPage from '@/pages/search/SearchPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import EditProfilePage from '@/pages/profile/EditProfilePage';
import FollowersPage from '@/pages/profile/FollowersPage';
import FollowingPage from '@/pages/profile/FollowingPage';
import EventsListPage from '@/pages/events/EventsListPage';
import EventDetailsPage from '@/pages/events/EventDetailsPage';
import CreateEventPage from '@/pages/events/CreateEventPage';
import NotificationsPage from '@/pages/notifications/NotificationsPage';

import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const { initialize } = useAuthStore();
  const { initialize: initTheme } = useThemeStore();

  useEffect(() => {
    initialize();
    initTheme();
  }, [initialize, initTheme]);

  return (
    <GoogleOAuthProvider clientId="692402417387-hv28i2rgb5mvl7ro0c1tius5b71qicpo.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/choose-username" element={<ChooseUsernamePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />

          {/* Protected routes with AppLayout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/feed" element={<HomeFeed />} />
            <Route path="/post/:id" element={<PostDetails />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/profile/:username/followers" element={<FollowersPage />} />
            <Route path="/profile/:username/following" element={<FollowingPage />} />
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/events/:id" element={<EventDetailsPage />} />
            <Route path="/create-event" element={<CreateEventPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
