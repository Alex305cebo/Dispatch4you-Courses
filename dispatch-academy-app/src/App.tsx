import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSkeleton from './components/common/LoadingSkeleton';
// AuthGuard disabled until Firebase .env is configured
// import AuthGuard from './components/AuthGuard';

// Lazy-loaded pages for route-based code splitting
const AppLayout = React.lazy(() => import('./components/layout/AppLayout'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const ProgressMapPage = React.lazy(() => import('./pages/ProgressMapPage'));
const DayPage = React.lazy(() => import('./pages/DayPage'));
const TaskPage = React.lazy(() => import('./pages/TaskPage'));
const ExamPage = React.lazy(() => import('./pages/ExamPage'));
const FlashcardPage = React.lazy(() => import('./pages/FlashcardPage'));
const GlossaryPage = React.lazy(() => import('./pages/GlossaryPage'));
const CertificatePage = React.lazy(() => import('./pages/CertificatePage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const LeaderboardPage = React.lazy(() => import('./pages/LeaderboardPage'));

/**
 * Wraps a lazy-loaded component with Suspense fallback and per-route ErrorBoundary.
 */
function SuspenseRoute({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSkeleton />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <SuspenseRoute>
        <LoginPage />
      </SuspenseRoute>
    ),
  },
  {
    path: '/',
    element: (
      <SuspenseRoute>
        <AppLayout />
      </SuspenseRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/map" replace />,
      },
      {
        path: 'map',
        element: (
          <SuspenseRoute>
            <ProgressMapPage />
          </SuspenseRoute>
        ),
      },
      {
        path: 'day/:dayId',
        element: (
          <SuspenseRoute>
            <DayPage />
          </SuspenseRoute>
        ),
      },
      {
        path: 'day/:dayId/task/:n',
        element: (
          <SuspenseRoute>
            <TaskPage />
          </SuspenseRoute>
        ),
      },
      {
        path: 'exam/mini/:weekId',
        element: (
          <SuspenseRoute>
            <ExamPage />
          </SuspenseRoute>
        ),
      },
      {
        path: 'exam/final',
        element: (
          <SuspenseRoute>
            <ExamPage />
          </SuspenseRoute>
        ),
      },
      {
        path: 'flashcards',
        element: (
          <SuspenseRoute>
            <FlashcardPage />
          </SuspenseRoute>
        ),
      },
      {
        path: 'glossary',
        element: (
          <SuspenseRoute>
            <GlossaryPage />
          </SuspenseRoute>
        ),
      },
      {
        path: 'certificate',
        element: (
          <SuspenseRoute>
            <CertificatePage />
          </SuspenseRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <SuspenseRoute>
            <SettingsPage />
          </SuspenseRoute>
        ),
      },
      {
        path: 'leaderboard',
        element: (
          <SuspenseRoute>
            <LeaderboardPage />
          </SuspenseRoute>
        ),
      },
    ],
  },
], { basename: '/dispatch-academy-app' });

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
