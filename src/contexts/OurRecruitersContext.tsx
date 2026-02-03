"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiFetch from '@/utils/apiFetch';

export interface Recruiter {
  id: string;
  name: string;
  logo: string;
  category: string;
  isFeatured: boolean;
  order: number;
  isActive: boolean;
}

interface OurRecruitersData {
  title: string;
  description: string;
  stats: {
    partnerCompanies: string;
    partnerCompaniesLabel: string;
    placementRate: string;
    placementRateLabel: string;
    averagePackage: string;
    averagePackageLabel: string;
  };
  featuredTitle: string;
  allPartnersTitle: string;
  callToAction: {
    title: string;
    description: string;
    buttonText: string;
  };
  recruiters: Recruiter[];
}

interface OurRecruitersContextType {
  data: OurRecruitersData;
  updateData: (newData: OurRecruitersData) => void;
  addRecruiter: (recruiter: Omit<Recruiter, 'id'>) => void;
  updateRecruiter: (id: string, recruiter: Omit<Recruiter, 'id'>) => void;
  deleteRecruiter: (id: string) => void;
  getActiveRecruiters: () => Recruiter[];
  getFeaturedRecruiters: () => Recruiter[];
}

const defaultData: OurRecruitersData = {
  title: "Our Recruiters",
  description: "Trusted by leading companies across industries. Our graduates are placed in top organizations worldwide.",
  stats: {
    partnerCompanies: "100+",
    partnerCompaniesLabel: "Partner Companies",
    placementRate: "90%",
    placementRateLabel: "Placement Rate",
    averagePackage: "₹12L",
    averagePackageLabel: "Average Package"
  },
  featuredTitle: "Featured Partners",
  allPartnersTitle: "All Partners",
  callToAction: {
    title: "Ready to Join Our Success Stories?",
    description: "Connect with our placement cell to explore career opportunities",
    buttonText: "Contact Placement Cell"
  },
  recruiters: [
    {
      id: '1',
      name: 'Havells',
      logo: '/images/recruiters-logo/Havells-Small.png',
      category: 'Manufacturing',
      isFeatured: true,
      order: 0,
      isActive: true
    },
    {
      id: '2',
      name: 'Dabur',
      logo: '/images/recruiters-logo/Dabur-Small.png',
      category: 'Healthcare',
      isFeatured: true,
      order: 1,
      isActive: true
    },
    {
      id: '3',
      name: 'Cipla',
      logo: '/images/recruiters-logo/Cipla-small.png',
      category: 'Pharmaceuticals',
      isFeatured: true,
      order: 2,
      isActive: true
    },
    {
      id: '4',
      name: 'ING',
      logo: '/images/recruiters-logo/ING-Small.png',
      category: 'Banking',
      isFeatured: true,
      order: 3,
      isActive: true
    },
    {
      id: '5',
      name: 'Ranbaxy',
      logo: '/images/recruiters-logo/ranbaxy.jpg',
      category: 'Pharmaceuticals',
      isFeatured: false,
      order: 4,
      isActive: true
    },
    {
      id: '6',
      name: 'Company 8',
      logo: '/images/recruiters-logo/companylogo8.jpeg',
      category: 'Technology',
      isFeatured: false,
      order: 5,
      isActive: true
    },
    {
      id: '7',
      name: 'Company 7',
      logo: '/images/recruiters-logo/companylogo7.jpeg',
      category: 'Technology',
      isFeatured: false,
      order: 6,
      isActive: true
    },
    {
      id: '8',
      name: 'Company 6',
      logo: '/images/recruiters-logo/companylogo6.jpeg',
      category: 'Technology',
      isFeatured: false,
      order: 7,
      isActive: true
    },
    {
      id: '9',
      name: 'Company 5',
      logo: '/images/recruiters-logo/companylogo5.jpeg',
      category: 'Technology',
      isFeatured: false,
      order: 8,
      isActive: true
    },
    {
      id: '10',
      name: 'Company 4',
      logo: '/images/recruiters-logo/companylogo4.jpeg',
      category: 'Technology',
      isFeatured: false,
      order: 9,
      isActive: true
    },
    {
      id: '11',
      name: 'Company 2',
      logo: '/images/recruiters-logo/companylogo2.jpeg',
      category: 'Technology',
      isFeatured: false,
      order: 10,
      isActive: true
    },
    {
      id: '12',
      name: 'Company 1',
      logo: '/images/recruiters-logo/companylogo1.jpeg',
      category: 'Technology',
      isFeatured: false,
      order: 11,
      isActive: true
    }
  ]
};

const OurRecruitersContext = createContext<OurRecruitersContextType | undefined>(undefined);

export const useOurRecruiters = () => {
  const context = useContext(OurRecruitersContext);
  if (!context) {
    throw new Error('useOurRecruiters must be used within an OurRecruitersProvider');
  }
  return context;
};

export const OurRecruitersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<OurRecruitersData>(defaultData);
  const [loading, setLoading] = useState(true);

  // Load from database on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/api/our-recruiters');
        if (!res.ok) {
          console.warn('Our-recruiters endpoint returned non-OK status', res.status);
          return;
        }

        const apiData = await res.json();
        // Transform backend data to match frontend structure
        const transformedData: OurRecruitersData = {
          title: apiData.heroTitle || defaultData.title,
          description: apiData.content || defaultData.description,
          stats: defaultData.stats, // Keep default stats for now
          featuredTitle: defaultData.featuredTitle,
          allPartnersTitle: defaultData.allPartnersTitle,
          callToAction: defaultData.callToAction,
          recruiters: apiData.recruiters || []
        };
        setData(transformedData);
      } catch (err: unknown) {
        console.warn('Failed to fetch Our Recruiters data:', err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateData = async (newData: OurRecruitersData) => {
    try {
      const backendData = {
        heroTitle: newData.title,
        content: newData.description,
        recruiters: newData.recruiters
      };

      const res = await apiFetch('/api/our-recruiters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData),
      });

      if (res.ok) {
        setData(newData);
      } else {
        let errBody: any = null;
        try { errBody = await res.json(); } catch (_) { errBody = null; }
        const msg = errBody?.error || errBody?.message || `Failed to update Our Recruiters data: ${res.status}`;
        throw new Error(msg);
      }
    } catch (error: unknown) {
      console.error('Failed to update Our Recruiters data:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  };

  const addRecruiter = async (recruiter: Omit<Recruiter, 'id'>) => {
    const newRecruiter: Recruiter = {
      ...recruiter,
      id: Date.now().toString()
    };
    
    const updatedData = {
      ...data,
      recruiters: [...data.recruiters, newRecruiter]
    };
    
    await updateData(updatedData);
  };

  const updateRecruiter = async (id: string, updatedRecruiter: Omit<Recruiter, 'id'>) => {
    const updatedData = {
      ...data,
      recruiters: data.recruiters.map(recruiter => 
        recruiter.id === id 
          ? { ...recruiter, ...updatedRecruiter }
          : recruiter
      )
    };
    
    await updateData(updatedData);
  };

  const deleteRecruiter = async (id: string) => {
    const updatedData = {
      ...data,
      recruiters: data.recruiters.filter(recruiter => recruiter.id !== id)
    };
    
    await updateData(updatedData);
  };

  const getActiveRecruiters = () => {
    return data.recruiters
      .filter(recruiter => recruiter.isActive)
      .sort((a, b) => a.order - b.order);
  };

  const getFeaturedRecruiters = () => {
    return data.recruiters
      .filter(recruiter => recruiter.isActive && recruiter.isFeatured)
      .sort((a, b) => a.order - b.order);
  };

  return (
    <OurRecruitersContext.Provider value={{ 
      data, 
      updateData, 
      addRecruiter, 
      updateRecruiter, 
      deleteRecruiter, 
      getActiveRecruiters,
      getFeaturedRecruiters
    }}>
      {children}
    </OurRecruitersContext.Provider>
  );
};