import { useState, useCallback } from 'react';

interface AlertState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export const useAlert = () => {
  const [alert, setAlert] = useState<AlertState | null>(null);

  const showAlert = useCallback((type: AlertState['type'], message: string) => {
    setAlert({ type, message });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(null);
  }, []);

  const handleApiResponse = useCallback((response: unknown) => {
    // Narrow the unknown response to the expected shape if possible
    if (response && typeof response === 'object' && 'alert' in response) {
      const resp = response as { alert?: { type?: string; message?: string } };
      if (resp.alert) {
        const candidate = resp.alert.type;
        const allowed = ['success', 'error', 'warning', 'info'] as const;
        const type = typeof candidate === 'string' && (allowed as readonly string[]).includes(candidate)
          ? (candidate as AlertState['type'])
          : 'success';

        showAlert(type, resp.alert.message || '');
      }
    }
  }, [showAlert]);

  return {
    alert,
    showAlert,
    hideAlert,
    handleApiResponse
  };
};