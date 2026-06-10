import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { ThemeProvider } from './app/ThemeProvider';
import { AuthProvider } from './app/AuthProvider';
import { useDirection } from './hooks/useDirection';

export function App() {
  // Keep <html dir/lang> in sync with the active language (He → rtl).
  useDirection();

  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}
