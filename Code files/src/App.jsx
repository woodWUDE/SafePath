import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import WalkingSession from './pages/WalkingSession';
import Companions from './pages/Companions';
import Match from './pages/Match';
import SOSEmergency from './pages/SOSEmergency';
import EmergencyContacts from './pages/EmergencyContacts';
import TripHistory from './pages/TripHistory';
import TripDetail from './pages/TripDetail';
import ArrivalConfirmation from './pages/ArrivalConfirmation';
import Chat from './pages/Chat';
import Privacy from './pages/Privacy';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading SafePath...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/match" element={<Match />} />
        <Route path="/history" element={<TripHistory />} />
        <Route path="/trip/:id" element={<TripDetail />} />
        <Route path="/contacts" element={<EmergencyContacts />} />
        <Route path="/chat" element={<Chat />} />
      </Route>
      <Route path="/sos" element={<SOSEmergency />} />
      <Route path="/arrival" element={<ArrivalConfirmation />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App