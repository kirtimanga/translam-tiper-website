"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { BASE_URL } from '@/utils/baseUrl';
import apiFetch from '@/utils/apiFetch';

export interface Testimonial {
  id: string;
  name: string;
  image: string;
  text: string;
  stars: number;
  order: number;
  isActive: boolean;
}

interface TestimonialData {
  label: string;
  title: string;
  descriptions: string[];
  testimonials: Testimonial[];
}

interface TestimonialContextType {
  data: TestimonialData;
  updateData: (newData: TestimonialData) => void;
  addTestimonial: (testimonial: Omit<Testimonial, 'id'>) => void;
  updateTestimonial: (id: string, testimonial: Omit<Testimonial, 'id'>) => void;
  deleteTestimonial: (id: string) => void;
  getActiveTestimonials: () => Testimonial[];
}

const defaultData: TestimonialData = {
  label: "TESTIMONIAL",
  title: "What Student Say?",
  descriptions: [
    "TOTC has got more than 100k positive ratings from our users around the world.",
    "Some of the students and teachers were greatly helped by the Skilline.",
    "Are you too? Please give your assessment"
  ],
  testimonials: [
    {
      id: '1',
      name: 'Gloria Rose',
      image: '/images/testimonial-slide1.png',
      text: "Thank you so much for your help. It's exactly what I've been looking for. You won't regret it. It really saves me time and effort. TOTC is exactly what our business has been lacking.",
      stars: 5,
      order: 0,
      isActive: true
    },
    {
      id: '2',
      name: 'Alex Smith',
      image: '/images/testimonial-slide1.png',
      text: "TOTC helped me organize my study schedule and improved my grades. Highly recommended!",
      stars: 5,
      order: 1,
      isActive: true
    },
    {
      id: '3',
      name: 'Priya Patel',
      image: '/images/testimonial-slide1.png',
      text: "The tools for teachers and students are fantastic. My classroom is more productive than ever.",
      stars: 5,
      order: 2,
      isActive: true
    }
  ]
};

const TestimonialContext = createContext<TestimonialContextType | undefined>(undefined);

export const useTestimonial = () => {
  const context = useContext(TestimonialContext);
  if (!context) {
    throw new Error('useTestimonial must be used within a TestimonialProvider');
  }
  return context;
};

export const TestimonialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<TestimonialData>(defaultData);
  const [loading, setLoading] = useState(true);

  // Load from database on component mount using centralized apiFetch (external then same-origin)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch('/api/testimonials');
        if (!res.ok) {
          console.warn('Testimonials endpoint returned non-OK status', res.status);
          return;
        }

        const testimonialsRaw = await res.json();
        if (!Array.isArray(testimonialsRaw)) {
          return;
        }

        const transformedTestimonials: Testimonial[] = testimonialsRaw.map((t: unknown) => {
          if (!t || typeof t !== 'object') return null as any;
          const item = t as any;
          const id = item.id !== undefined ? String(item.id) : '';
          const imageRaw = item.image;
          const image = typeof imageRaw === 'string' && imageRaw.startsWith('/uploads/')
            ? `${BASE_URL}${imageRaw}`
            : imageRaw || '';
          return {
            id,
            name: String(item.name ?? ''),
            image,
            text: String(item.content ?? ''),
            stars: Number(item.rating ?? 5),
            order: 0,
            isActive: Boolean(item.isActive)
          } as Testimonial;
        }).filter(Boolean);

        setData(prev => ({ ...prev, testimonials: transformedTestimonials }));
      } catch (err: unknown) {
        console.warn('Failed to fetch testimonials:', err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateData = (newData: TestimonialData) => {
    setData(newData);
  };

  const addTestimonial = async (testimonial: Omit<Testimonial, 'id'>) => {
    try {
      // Transform to backend format
      const backendData = {
        name: testimonial.name,
        role: 'Student', // Default role
        company: '',
        // Convert absolute URLs back to relative paths for storage
        image: testimonial.image?.startsWith(BASE_URL) 
          ? testimonial.image.replace(BASE_URL, '')
          : testimonial.image,
        content: testimonial.text,
        rating: testimonial.stars,
        isActive: testimonial.isActive
      };
      
      // Use apiFetch which handles external->same-origin fallback
      const res = await apiFetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData),
      });

      if (res.ok) {
        const newTestimonial = await res.json();
        const transformedTestimonial: Testimonial = {
          id: newTestimonial.id.toString(),
          name: newTestimonial.name,
          // Ensure image URLs are absolute paths for frontend display
          image: newTestimonial.image?.startsWith('/uploads/') 
            ? `${BASE_URL}${newTestimonial.image}`
            : newTestimonial.image,
          text: newTestimonial.content,
          stars: newTestimonial.rating,
          order: testimonial.order,
          isActive: newTestimonial.isActive
        };
        
        setData(prev => ({
          ...prev,
          testimonials: [...prev.testimonials, transformedTestimonial]
        }));
      } else {
        // Try to parse server error message and throw a descriptive error
        let errBody: any = null;
        try { errBody = await res.json(); } catch (_) { errBody = null; }
        const msg = errBody?.error || errBody?.message || `Failed to add testimonial: ${res.status}`;
        throw new Error(msg);
      }
    } catch (error) {
      console.error('Failed to add testimonial:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  };

  const updateTestimonial = async (id: string, updatedTestimonial: Omit<Testimonial, 'id'>) => {
    try {
      const backendData = {
        name: updatedTestimonial.name,
        role: 'Student',
        company: '',
        // Convert absolute URLs back to relative paths for storage
        image: updatedTestimonial.image?.startsWith(BASE_URL) 
          ? updatedTestimonial.image.replace(BASE_URL, '')
          : updatedTestimonial.image,
        content: updatedTestimonial.text,
        rating: updatedTestimonial.stars,
        isActive: updatedTestimonial.isActive
      };
      
      const res = await apiFetch(`/api/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData),
      });

      if (res.ok) {
        setData(prev => ({
          ...prev,
          testimonials: prev.testimonials.map(testimonial => 
            testimonial.id === id 
              ? { ...testimonial, ...updatedTestimonial }
              : testimonial
          )
        }));
      } else {
        let errBody: any = null;
        try { errBody = await res.json(); } catch (_) { errBody = null; }
        const msg = errBody?.error || errBody?.message || `Failed to update testimonial: ${res.status}`;
        throw new Error(msg);
      }
    } catch (error) {
      console.error('Failed to update testimonial:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      const externalUrl = (typeof BASE_URL === 'string' && BASE_URL.length > 0)
        ? `${BASE_URL.replace(/\/$/, '')}/api/testimonials/${id}`
        : null;
      const sameOriginUrl = `/api/testimonials/${id}`;

      const res = await apiFetch(`/api/testimonials/${id}`, { method: 'DELETE' });

      if (res.ok) {
        setData(prev => ({
          ...prev,
          testimonials: prev.testimonials.filter(testimonial => testimonial.id !== id)
        }));
      } else {
        let errBody: any = null;
        try { errBody = await res.json(); } catch (_) { errBody = null; }
        const msg = errBody?.error || errBody?.message || `Failed to delete testimonial: ${res.status}`;
        throw new Error(msg);
      }
    } catch (error) {
      console.error('Failed to delete testimonial:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  };

  const getActiveTestimonials = () => {
    return data.testimonials
      .filter(testimonial => testimonial.isActive)
      .sort((a, b) => a.order - b.order);
  };

  return (
    <TestimonialContext.Provider value={{ 
      data, 
      updateData, 
      addTestimonial, 
      updateTestimonial, 
      deleteTestimonial, 
      getActiveTestimonials
    }}>
      {children}
    </TestimonialContext.Provider>
  );
};