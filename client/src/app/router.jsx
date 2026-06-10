import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { HomePage } from '../pages/HomePage';
import { CapturePage } from '../pages/CapturePage';
import { HistoryPage } from '../pages/HistoryPage';
import { LearnPage } from '../pages/LearnPage';
import { ProfilePage } from '../pages/ProfilePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'capture', element: <CapturePage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'learn', element: <LearnPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
]);
