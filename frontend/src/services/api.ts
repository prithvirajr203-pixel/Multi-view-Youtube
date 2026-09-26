// API service layer — all backend calls go through here
import type { BrowserSession } from '../types';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE = configuredApiUrl
  ? configuredApiUrl.replace(/\/+$/, '')
  : '';

export const WS_URL = API_BASE
  ? API_BASE.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:') + '/ws'
  : '';

function requireApiBase() {
  if (!API_BASE) {
    throw new Error('Backend URL is not configured.');
  }
}

export const api = {
  health: async () => {
    requireApiBase();

    const response = await fetch(`${API_BASE}/health`);

    if (!response.ok) {
      throw new Error(`Health check failed (${response.status})`);
    }

    return response.json();
  },

  browsers: {
    list: async (): Promise<BrowserSession[]> => {
      requireApiBase();

      const response = await fetch(`${API_BASE}/api/browsers`);

      if (!response.ok) {
        throw new Error(`Failed to load browsers (${response.status})`);
      }

      return response.json();
    },

    create: async (): Promise<BrowserSession> => {
      requireApiBase();

      const response = await fetch(`${API_BASE}/api/browsers`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to create browser (${response.status})`);
      }

      return response.json();
    },

    close: async (id: string) => {
      requireApiBase();

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
      url: string
    ): Promise<BrowserSession> => {
      requireApiBase();

      const response = await fetch(`${API_BASE}/api/browsers/${id}/navigate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.startsWith('http') ? url : `https://${url}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to navigate browser (${response.status})`);
      }

      return response.json();
    },

    reload: async (id: string) => {
      requireApiBase();

      const response = await fetch(
        `${API_BASE}/api/browsers/${id}/reload`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to reload browser (${response.status})`);
      }

      return response.json();
    },

    back: async (id: string) => {
      requireApiBase();

      const response = await fetch(
        `${API_BASE}/api/browsers/${id}/back`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to go back (${response.status})`);
      }

      return response.json();
    },

    forward: async (id: string) => {
      requireApiBase();

      const response = await fetch(
        `${API_BASE}/api/browsers/${id}/forward`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to go forward (${response.status})`);
      }

      return response.json();
    },

    stop: async (id: string) => {
      requireApiBase();

      const response = await fetch(
        `${API_BASE}/api/browsers/${id}/stop`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to stop browser (${response.status})`);
      }

      return response.json();
    },

    navigateAll: async (url: string) => {
      requireApiBase();

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
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to navigate all browsers (${response.status})`
        );
      }

      return response.json();
    },

    reloadAll: async () => {
      requireApiBase();

      const response = await fetch(
        `${API_BASE}/api/browsers/batch/reload-all`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to reload all browsers (${response.status})`
        );
      }

      return response.json();
    },

    stopAll: async () => {
      requireApiBase();

      const response = await fetch(
        `${API_BASE}/api/browsers/batch/stop-all`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to stop all browsers (${response.status})`
        );
      }

      return response.json();
    },
  },
};