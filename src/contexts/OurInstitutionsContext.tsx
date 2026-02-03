"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiFetch from '@/utils/apiFetch';

export interface Institution {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  color: string;
  order: number;
  isActive: boolean;
}

interface OurInstitutionsData {
  title: string;
  description: string;
  stats: {
    institutions: string;
    institutionsLabel: string;
    yearsExcellence: string;
    yearsExcellenceLabel: string;
  };
  featuredTitle: string;
  featuredDescription: string;
  institutions: Institution[];
}

interface OurInstitutionsContextType {
  data: OurInstitutionsData;
  updateData: (newData: OurInstitutionsData) => void;
  addInstitution: (institution: Omit<Institution, 'id'>) => void;
  updateInstitution: (id: string, institution: Omit<Institution, 'id'>) => void;
  deleteInstitution: (id: string) => void;
  getActiveInstitutions: () => Institution[];
}

const defaultData: OurInstitutionsData = {
  title: "Our Institutions",
  description: "Translam Group of Institutions comprises a diverse range of academic centers, each committed to excellence in education, innovation, and student success.",
  stats: {
    institutions: "4",
    institutionsLabel: "Institutions",
    yearsExcellence: "38+",
    yearsExcellenceLabel: "Years Excellence"
  },
  featuredTitle: "Excellence in Education",
  featuredDescription: "From engineering to law, each institution nurtures tomorrow's professionals",
  institutions: [
    {
      id: '1',
      icon: "📄",
      title: "Institute of Technology & Management",
      subtitle: "Engineering & Management",
      description: "Empowering future leaders through cutting-edge curriculum, industry-oriented programs, and experienced faculty.",
      highlights: ["Industry Partnerships", "Research Centers", "Global Exposure"],
      color: "#FF6B6B",
      order: 0,
      isActive: true
    },
    {
      id: '2',
      icon: "🗓️",
      title: "Institute of Pharmaceutical Education",
      subtitle: "Pharmacy & Research",
      description: "Excellence in pharmaceutical sciences with hands-on training in state-of-the-art labs and research centers.",
      highlights: ["Research Labs", "Drug Innovation", "Clinical Training"],
      color: "#4ECDC4",
      order: 1,
      isActive: true
    },
    {
      id: '3',
      icon: "👥",
      title: "College of Law",
      subtitle: "Legal Education",
      description: "Fostering legal minds with emphasis on ethics, reasoning, and advocacy through practical exposure.",
      highlights: ["Moot Courts", "Legal Aid Clinics", "Internships"],
      color: "#45B7D1",
      order: 2,
      isActive: true
    },
    {
      id: '4',
      icon: "🗒️",
      title: "College of Education",
      subtitle: "Teacher Training",
      description: "Preparing passionate educators with modern teaching methodologies and strong pedagogical foundations.",
      highlights: ["Modern Pedagogy", "Inclusive Education", "Classroom Management"],
      color: "#96CEB4",
      order: 3,
      isActive: true
    }
  ]
};

const OurInstitutionsContext = createContext<OurInstitutionsContextType | undefined>(undefined);

export const useOurInstitutions = () => {
  const context = useContext(OurInstitutionsContext);
  if (!context) {
    throw new Error('useOurInstitutions must be used within an OurInstitutionsProvider');
  }
  return context;
};

export const OurInstitutionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<OurInstitutionsData>(defaultData);
  const [loading, setLoading] = useState(true);

  // Load from database on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch('/api/our-institutions');
        if (!res.ok) {
          console.warn('Our-institutions endpoint returned non-OK status', res.status);
          return;
        }

        const apiData = await res.json();
        // Transform backend data to match frontend structure
        const transformedData: OurInstitutionsData = {
          title: apiData.heroTitle || defaultData.title,
          description: apiData.content || defaultData.description,
          stats: defaultData.stats, // Keep default stats for now
          featuredTitle: defaultData.featuredTitle,
          featuredDescription: defaultData.featuredDescription,
          institutions: apiData.institutions || []
        };
        setData(transformedData);
      } catch (err: unknown) {
        console.warn('Failed to fetch Our Institutions data:', err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateData = async (newData: OurInstitutionsData) => {
    try {
      const backendData = {
        heroTitle: newData.title,
        content: newData.description,
        institutions: newData.institutions
      };

      const res = await apiFetch('/api/our-institutions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData),
      });

      if (res.ok) {
        setData(newData);
      } else {
        const text = await res.text();
        throw new Error(`Failed to update Our Institutions data: ${res.status} ${text}`);
      }
    } catch (error: unknown) {
      console.error('Failed to update Our Institutions data:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  };

  const addInstitution = async (institution: Omit<Institution, 'id'>) => {
    const newInstitution: Institution = {
      ...institution,
      id: Date.now().toString()
    };
    
    const updatedData = {
      ...data,
      institutions: [...data.institutions, newInstitution]
    };
    
    await updateData(updatedData);
  };

  const updateInstitution = async (id: string, updatedInstitution: Omit<Institution, 'id'>) => {
    const updatedData = {
      ...data,
      institutions: data.institutions.map(institution => 
        institution.id === id 
          ? { ...institution, ...updatedInstitution }
          : institution
      )
    };
    
    await updateData(updatedData);
  };

  const deleteInstitution = async (id: string) => {
    const updatedData = {
      ...data,
      institutions: data.institutions.filter(institution => institution.id !== id)
    };
    
    await updateData(updatedData);
  };

  const getActiveInstitutions = () => {
    return data.institutions
      .filter(institution => institution.isActive)
      .sort((a, b) => a.order - b.order);
  };

  return (
    <OurInstitutionsContext.Provider value={{ 
      data, 
      updateData, 
      addInstitution, 
      updateInstitution, 
      deleteInstitution, 
      getActiveInstitutions 
    }}>
      {children}
    </OurInstitutionsContext.Provider>
  );
};