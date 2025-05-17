
/**
 * Backend Service Module
 * Configure this file to connect to your own backend
 */

// Configuration options for backend connection
const CONFIG = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  USE_MOCK_DATA: !import.meta.env.VITE_API_URL,
  TIMEOUT: 8000
};

/**
 * Make an API request to the backend
 * 
 * @param {string} endpoint - The API endpoint to call
 * @param {Object} options - Request options including method, body, etc.
 * @returns {Promise<any>} - The API response
 */
export const apiRequest = async (endpoint, options = {}) => {
  // Allow using mock data for development
  if (CONFIG.USE_MOCK_DATA) {
    return mockResponses[endpoint] || { error: 'No mock data available' };
  }

  const url = `${CONFIG.API_URL}/${endpoint}`;
  
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // Add any authentication headers here
    // headers: { 'Authorization': `Bearer ${getToken()}` },
  };

  const requestOptions = { ...defaultOptions, ...options };
  
  // Convert body to JSON string if it exists and is an object
  if (requestOptions.body && typeof requestOptions.body === 'object') {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  try {
    // Create an AbortController to handle timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
    
    const response = await fetch(url, {
      ...requestOptions,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    // For non-JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error(`API Request Failed: ${endpoint}`, error);
    throw error;
  }
};

// Mock data for development
const mockResponses = {
  'dice/roll': { 
    results: [4, 6, 2], 
    total: 12, 
    modifier: 0 
  },
  'teams': {
    teams: [
      { id: 1, name: 'Team Red', players: ['Alice', 'Bob'] },
      { id: 2, name: 'Team Blue', players: ['Charlie', 'Diana'] }
    ]
  }
};

/**
 * Backend API Functions
 */
export const backendApi = {
  // Dice rolling functions
  diceRoller: {
    rollDice: async (diceNotation) => {
      return apiRequest(`dice/roll`, {
        method: 'POST',
        body: { notation: diceNotation }
      });
    }
  },
  
  // Team management functions
  teams: {
    createTeams: async (players, numTeams) => {
      return apiRequest('teams', {
        method: 'POST',
        body: { players, numTeams }
      });
    }
  },
  
  // Game data functions
  games: {
    getGameData: async (gameId) => {
      return apiRequest(`games/${gameId}`);
    },
    saveGameData: async (gameId, data) => {
      return apiRequest(`games/${gameId}`, {
        method: 'PUT',
        body: data
      });
    }
  }
};

export default backendApi;
