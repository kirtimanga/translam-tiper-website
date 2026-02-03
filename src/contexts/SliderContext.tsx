"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiFetch from '@/utils/apiFetch';
import { BASE_URL } from '@/utils/baseUrl';

interface Slider {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  order: number;
  isActive: boolean;
}

interface SliderContextType {
  sliders: Slider[];
  addSlider: (slider: Omit<Slider, 'id'>) => Promise<void>;
  updateSlider: (id: string, slider: Omit<Slider, 'id'>) => Promise<void>;
  deleteSlider: (id: string) => Promise<void>;
  getActiveSliders: () => Slider[];
}

const SliderContext = createContext<SliderContextType | undefined>(undefined);

export const useSlider = () => {
  const context = useContext(SliderContext);
  if (!context) {
    throw new Error('useSlider must be used within a SliderProvider');
  }
  return context;
};

const defaultSliders: Slider[] = [
  {
    id: '1',
    title: 'TRANSLAM Group of Institutions',
    subtitle: 'Shaping Futures with Excellence in Education Since 1987',
    image: '/images/teenage-girl.png',
    order: 0,
    isActive: true
  },
  {
    id: '2',
    title: 'TRANSLAM Group of Institutions',
    subtitle: 'Empowering Students Since 1987',
    image: '/images/boy-image.webp',
    order: 1,
    isActive: true
  }
];

export const SliderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sliders, setSliders] = useState<Slider[]>(defaultSliders);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from API after hydration
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await apiFetch('/api/home-sliders');
        if (!res.ok) {
          console.warn('Home-sliders endpoint returned non-OK status', res.status);
          return;
        }

        const data = await res.json();
        // Transform backend data to match frontend structure
        const transformedSliders = data.map((slider: any) => ({
          ...slider,
          id: slider.id.toString(), // Convert number id to string
          // Ensure images stored as `/uploads/...` are absolute so the browser requests them from the backend
          image: typeof slider.image === 'string' && slider.image.startsWith('/uploads/')
            ? `${BASE_URL.replace(/\/$/, '')}${slider.image}`
            : slider.image
        }));
        setSliders(transformedSliders);
      } catch (err: unknown) {
        console.warn('Failed to fetch sliders:', err instanceof Error ? err.message : String(err));
      } finally {
        setIsHydrated(true);
      }
    };

    fetchSliders();
  }, []);

  const addSlider = async (slider: Omit<Slider, 'id'>) => {
    try {
      const res = await apiFetch('/api/home-sliders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slider),
      });

      if (res.ok) {
        const newSlider = await res.json();
        // Transform the new slider to match frontend structure
        const transformedSlider = {
          ...newSlider,
          id: newSlider.id.toString(),
          image: newSlider.image
        };
        setSliders([...sliders, transformedSlider]);
      } else {
        const errorText = await res.text();
        throw new Error(`Failed to add slider: ${res.status} ${errorText}`);
      }
    } catch (error: unknown) {
      console.error('Failed to add slider:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  };

  const updateSlider = async (id: string, updatedSlider: Omit<Slider, 'id'>) => {
    try {
      const res = await apiFetch(`/api/home-sliders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSlider),
      });

      if (res.ok) {
        const updated = await res.json();
        // Transform the updated slider to match frontend structure
        const transformedSlider = {
          ...updated,
          id: updated.id.toString(),
          image: updated.image
        };
        setSliders(sliders.map(slider => 
          slider.id === id ? transformedSlider : slider
        ));
      } else {
        const errorText = await res.text();
        throw new Error(`Failed to update slider: ${res.status} ${errorText}`);
      }
    } catch (error: unknown) {
      console.error('Failed to update slider:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  };

  const deleteSlider = async (id: string) => {
    try {
      const res = await apiFetch(`/api/home-sliders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSliders(sliders.filter(slider => slider.id !== id));
      } else {
        const errorText = await res.text();
        throw new Error(`Failed to delete slider: ${res.status} ${errorText}`);
      }
    } catch (error: unknown) {
      console.error('Failed to delete slider:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  };

  const getActiveSliders = () => {
    return sliders
      .filter(slider => slider.isActive)
      .sort((a, b) => a.order - b.order);
  };

  return (
    <SliderContext.Provider value={{ sliders, addSlider, updateSlider, deleteSlider, getActiveSliders }}>
      {children}
    </SliderContext.Provider>
  );
};