import { BASE_URL } from './baseUrl';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || `${BASE_URL}/api`;

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }
    return response.json();
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create ${endpoint}: ${response.statusText}`);
    }
    return response.json();
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update ${endpoint}: ${response.statusText}`);
    }
    return response.json();
  }

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete ${endpoint}: ${response.statusText}`);
    }
  }
}

export const apiClient = new ApiClient();

// API endpoints
export const API_ENDPOINTS = {
  DIRECTOR_DESK: '/director-desk',
  PHILOSOPHY: '/philosophy',
  HOME_SLIDERS: '/home-sliders',
  ABOUT_GROUP: '/about-group',
  OUTSTANDING_PLACEMENTS: '/outstanding-placements',
  TESTIMONIALS: '/testimonials',
  WHY_CHOOSE_US: '/why-choose-us',
  OUR_RECRUITERS: '/our-recruiters',
  OUR_INSTITUTIONS: '/our-institutions',
  OUR_SUCCESS: '/our-success',
} as const;