// API service layer — all backend calls go through here
import type { BrowserSession } from '../types';

/*
 * Local:
 *   VITE_API_URL=http://localhost:8000
 *
 * Production:
 *   VITE_API_URL=https://your-backend-domain.com
 *
 * If VITE_API_URL is not configured, the frontend can still load,
 * but backend-dependent features will not work.
 */

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE = configuredApiUrl
  ? configuredApiUrl.replace(/\/+$/, '')
  : '';

export const WS_URL = API_BASE
  ? API_BASE.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:') + '/ws'
  : '';

export const api = {
  health: async () => {
    if (!API_BASE) {
      throw new Error('Backend URL is not configured.');
    }

    const response = await fetch(`${API_BASE}/health`);

    if (!response.ok) {
      throw new Error(`Health check failed (${response.status})`);
    }

    return response.json();
  },

  browsers: {
    list: async (): Promise<BrowserSession[]> => {
      if (!API_BASE) {
        throw new Error('Backend URL is not configured.');
      }

      const response = await fetch(`${API_BASE}/api/browsers`);

      if (!response.ok) {
        throw new Error(`Failed to load browsers (${response.status})`);
      }

      return response.json();
    },

    create: async (): Promise<BrowserSession> => {
      if (!API_BASE) {
        throw new Error('Backend URL is not configured.');
      }

      const response = await fetch(`${API_BASE}/api/browsers`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to create browser (${response.status})`);
      }

      return response.json();
    },

    close: async (id: string) => {
      if (!API_BASE) {
        throw new Error('Backend URL is not configured.');
      }

      const response = await fetch(`${API_BASE}/api/browsers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to close browser (${response.status})`);
      }

      return response.json();
    },

    navigate: async (
      id: string,
      url: string,
    ): Promise<BrowserSession> => {
      if (!API_BASE) {
        throw new Error('Backend URL is not configured.');
      }

      const response = await fetch(
        `${API_BASE}/api/browsers/${id}/navigate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: url.startsWith('http') ? url : `https://${url}`,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to navigate browser (${response.status})`);
      }

      return response.json();
    },

    reload: async (id: string) => {
      if (!API_BASE) {
        throw new Error('Backend URL is not configured.');
      }

      const response = await fetch(
        `${API_BASE}/api/browsers/${id}/reload`,
        {
          method: 'POST',
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to reload browser (${response.status})`);
      }

      return response.json();
    },

    back: async (id: string) => {
      if (!API_BASE) {
        throw new Error('Backend URL is not configured.');
      }

      const response = await fetch(
        `${API_BASE}/api/browsers/${id}/back`,
        {
          method: 'POST',
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to go back (${response.status})`);
      }

      return response.json();
    },

    forward: async (id: string) => {
      if (!API_BASE) {
        throw new Error('Backend URL is not configured.');
      }

      const response = await fetch(
        `${API_BASE}/api/browsers/${id}/forward`,
        {
          method: 'POST',
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to go forward (${response.status})`);
      }

      return response.json();
    },

    stop: async (id: string) => {
      if (!API_BASE) {
        throw new Error('Backend URL is not configured.');
      }

      const response = await fetch(
        `${API_BASE}/api/browsers/${id}/stop`,
        {
          method: 'POST',
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to stop browser (${response.status})`);
      }

      return response.json();
    },

    navigateAll: async (url: string) => {
      if (!API_BASE) {
        throw new Error('Backend URL is not configured.');
      }

      const response = await fetch(
        `${API_BASE}/api/browsers/batch/navigate-all`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: url.startsWith('http') ? url : `https://${url}`,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to navigate all browsers (${response.status})`,
        );
      }

      return response.json();
    },

    reloadAll: async () => {
      if (!API_BASE) {
        throw new Error('Backend URL is not configured.');
      }

      const response = await fetch(
        `${API_BASE}/api/browsers/batch/reload-all`,
        {
          method: 'POST',
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to reload all browsers (${response.status})`,
        );
      }

      return response.json();
    },

    stopAll: async () => {
      if (!API_BASE) {
        throw new Error('Backend URL is not configured.');
      }

      const response = await fetch(
        `${API_BASE}/api/browsers/batch/stop-all`,
        {
          method: 'POST',
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to stop all browsers (${response.status})`,
        );
      }

      return response.json();
    },
  },
};