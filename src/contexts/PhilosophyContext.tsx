"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiFetch from '@/utils/apiFetch';

interface PhilosophyData {
  mainImage: string;
  heroTitle: string;
  heroBannerImage: string;
  mainQuote: string;
  content: string;
}

interface PhilosophyContextType {
  philosophyData: PhilosophyData;
  updatePhilosophyData: (data: PhilosophyData) => Promise<void>;
  uploadMainImage: (file: File) => Promise<string>;
  isLoading: boolean;
}

const defaultData: PhilosophyData = {
  heroTitle: 'PHILOSOPHY',
  heroBannerImage: '',
  mainQuote:
    '"Empowerment begins the moment a learner believes they can shape their own future—and education lights that belief."',
  mainImage: '',
  content: `<p>At Translam Group, we believe that education is the most enduring path to empowerment...</p>`,
};

const PhilosophyContext = createContext<PhilosophyContextType | undefined>(undefined);

export function PhilosophyProvider({ children }: { children: ReactNode }) {
  const [philosophyData, setPhilosophyData] = useState<PhilosophyData>(defaultData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPhilosophyData = async () => {
      setIsLoading(true);
      try {
        const res = await apiFetch('/api/philosophy');
        if (res.ok) {
          const data = await res.json();
          setPhilosophyData(data);
        } else {
          // Non-2xx responses are expected when backend isn't present; warn instead of erroring to reduce console noise
          console.warn('Failed to fetch philosophy data: non-ok response', res.status);
        }
      } catch (err: unknown) {
        // Log as warn to avoid spamming errors when backend is down
        console.warn('Failed to fetch philosophy data:', err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhilosophyData();
  }, []);

  // Update philosophy text & other data
  const updatePhilosophyData = async (data: PhilosophyData) => {
    try {
      const response = await apiFetch('/api/philosophy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setPhilosophyData(updatedData);
        return;
      }

      throw new Error(`Failed to update philosophy data: ${response.status}`);
    } catch (err: unknown) {
      console.error('Error updating Philosophy data:', err instanceof Error ? err.message : String(err));
      throw err;
    }
  };

  // Upload main image
  const uploadMainImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('mainImage', file);

    try {
      const response = await apiFetch('/api/philosophy/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const imageUrl = result.url; // backend should return { url: "uploaded/image/path.jpg" }

        // Update context with new image
        setPhilosophyData((prev) => ({
          ...prev,
          mainImage: imageUrl,
        }));

        return imageUrl;
      }

      throw new Error(`Image upload failed: ${response.status}`);
    } catch (err: unknown) {
      console.error('Error uploading image:', err instanceof Error ? err.message : String(err));
      throw err;
    }
  };

  return (
    <PhilosophyContext.Provider
      value={{ philosophyData, updatePhilosophyData, uploadMainImage, isLoading }}
    >
      {children}
    </PhilosophyContext.Provider>
  );
}

export function usePhilosophy() {
  const context = useContext(PhilosophyContext);
  if (context === undefined) {
    throw new Error('usePhilosophy must be used within a PhilosophyProvider');
  }
  return context;
}
export default PhilosophyProvider;