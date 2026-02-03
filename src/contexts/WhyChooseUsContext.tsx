"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { BASE_URL } from '@/utils/baseUrl';

export interface WhyChooseUsReason {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  order: number;
  isActive: boolean;
}

interface WhyChooseUsData {
  title: string;
  description: string;
  reasons: WhyChooseUsReason[];
}

interface WhyChooseUsContextType {
  data: WhyChooseUsData;
  updateData: (newData: WhyChooseUsData) => void;
  addReason: (reason: Omit<WhyChooseUsReason, 'id'>) => void;
  updateReason: (id: string, reason: Omit<WhyChooseUsReason, 'id'>) => void;
  deleteReason: (id: string) => void;
  getActiveReasons: () => WhyChooseUsReason[];
}

const defaultData: WhyChooseUsData = {
  title: "Why Choose US ?",
  description: "Everything you can do in a physical classroom, you can now do — and more — with Translam.",
  reasons: [
    {
      id: '1',
      title: 'Academic Excellence',
      subtitle: 'ENGINEERING & MANAGEMENT',
      description: 'Empowering future leaders through cutting-edge curriculum, industry-oriented programs, and experienced faculty.',
      tags: ['Industry Partnerships', 'Research Centers', 'Global Exposure'],
      order: 0,
      isActive: true
    },
    {
      id: '2',
      title: 'Experienced Faculty',
      subtitle: 'EXPERT GUIDANCE',
      description: 'Learn from professionals who bring real-world experience and deep academic knowledge to the classroom.',
      tags: ['Mentorship', 'Domain Experts', 'PhD Holders'],
      order: 1,
      isActive: true
    },
    {
      id: '3',
      title: 'Career Opportunities',
      subtitle: 'PLACEMENTS & INTERNSHIPS',
      description: 'We connect students to top recruiters and provide pathways to rewarding careers.',
      tags: ['Top Recruiters', 'Internships', 'Placement Training'],
      order: 2,
      isActive: true
    }
  ]
};

const WhyChooseUsContext = createContext<WhyChooseUsContextType | undefined>(undefined);

export const useWhyChooseUs = () => {
  const context = useContext(WhyChooseUsContext);
  if (!context) {
    throw new Error('useWhyChooseUs must be used within a WhyChooseUsProvider');
  }
  return context;
};

export const WhyChooseUsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<WhyChooseUsData>(defaultData);
  const [loading, setLoading] = useState(true);

  // Load from database on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const externalUrl = `${BASE_URL}/api/why-choose-us`;
        const sameOriginUrl = `/api/why-choose-us`;

        // Try external backend first, fall back to same-origin API route
        let response: Response | null = null;
        try {
          response = await fetch(externalUrl);
        } catch (err) {
          // External backend unreachable — fall back
          console.warn('External API unreachable, falling back to same-origin API for Why Choose Us:',
            err instanceof Error ? err.message : String(err)
          );
        }

        if (!response) {
          response = await fetch(sameOriginUrl);
        }

        if (response.ok) {
          const apiData = await response.json();
          // Transform backend data to match frontend structure
          const transformedData: WhyChooseUsData = {
            title: apiData.heroTitle || defaultData.title,
            description: apiData.content || defaultData.description,
            reasons: apiData.points || defaultData.reasons
          };
          setData(transformedData);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Failed to fetch Why Choose Us data:', error.message);
        } else {
          console.error('Failed to fetch Why Choose Us data:', String(error));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateData = async (newData: WhyChooseUsData) => {
    const backendData = {
      heroTitle: newData.title,
      content: newData.description,
      points: newData.reasons
    };

    const externalUrl = `${BASE_URL}/api/why-choose-us`;
    const sameOriginUrl = `/api/why-choose-us`;

    // Try external backend first, then fall back to same-origin
    let lastError: unknown = null;
    try {
      const res = await fetch(externalUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData),
      });
      if (res.ok) {
        setData(newData);
        return;
      }
      lastError = new Error('External API update failed');
    } catch (err) {
      lastError = err;
      console.warn('External API update failed, will try same-origin API for Why Choose Us:',
        err instanceof Error ? err.message : String(err)
      );
    }

    try {
      const res2 = await fetch(sameOriginUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData),
      });
      if (res2.ok) {
        setData(newData);
        return;
      }
      throw new Error('Same-origin API update failed');
    } catch (err) {
      if (err instanceof Error) {
        console.error('Failed to update Why Choose Us data:', err.message);
        throw err;
      } else {
        console.error('Failed to update Why Choose Us data:', String(err));
        throw err;
      }
    }
  };

  const addReason = async (reason: Omit<WhyChooseUsReason, 'id'>) => {
    const newReason: WhyChooseUsReason = {
      ...reason,
      id: Date.now().toString()
    };
    
    const updatedData = {
      ...data,
      reasons: [...data.reasons, newReason]
    };
    
    await updateData(updatedData);
  };

  const updateReason = async (id: string, updatedReason: Omit<WhyChooseUsReason, 'id'>) => {
    const updatedData = {
      ...data,
      reasons: data.reasons.map(reason => 
        reason.id === id 
          ? { ...reason, ...updatedReason }
          : reason
      )
    };
    
    await updateData(updatedData);
  };

  const deleteReason = async (id: string) => {
    const updatedData = {
      ...data,
      reasons: data.reasons.filter(reason => reason.id !== id)
    };
    
    await updateData(updatedData);
  };

  const getActiveReasons = () => {
    return data.reasons
      .filter(reason => reason.isActive)
      .sort((a, b) => a.order - b.order);
  };

  return (
    <WhyChooseUsContext.Provider value={{ 
      data, 
      updateData, 
      addReason, 
      updateReason, 
      deleteReason, 
      getActiveReasons
    }}>
      {children}
    </WhyChooseUsContext.Provider>
  );
};