"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiFetch from '@/utils/apiFetch';

interface StaffMember {
  name: string;
  title: string;
  image?: string;
}

interface DirectorDeskData {
  // Hero Section
  heroTitle: string;
  heroBannerImage: string;
  
  // Main Content
  mainHeading: string;
  content: string; // HTML content
  
  // Staff Members
  staffMembers: StaffMember[];
}

interface DirectorDeskContextType {
  directorDeskData: DirectorDeskData;
  updateDirectorDeskData: (data: DirectorDeskData) => Promise<void>;
  isLoading: boolean;
}

const defaultData: DirectorDeskData = {
  // Hero Section
  heroTitle: 'DIRECTOR DESK',
  heroBannerImage: '',
  
  // Main Content
  mainHeading: 'Translam Group: Empowering Futures for 37 Glorious Years',
  content: `<p>It gives us immense pride and satisfaction to be part of the Translam Group, a 38-year-old educational legacy in Western Uttar Pradesh. With a commitment to excellence, Translam empowers students to navigate the challenges of an ever-evolving global economy with confidence, skills, and wisdom.</p>
  
  <p>Over the decades, Translam has significantly contributed to society by offering quality education across primary, secondary, and professional/technical domains. Today, it stands as one of the most reputed institutions in the region, attracting students from Nepal, North-East India, West Bengal, Bihar, Jharkhand, and beyond—offering them valuable education and practical training.</p>
  
  <p>We are deeply grateful to the All India Council for Technical Education (AICTE), Pharmacy Council of India (PCI), Bar Council of India (BCI), and National Council for Teacher Education (NCTE) for their recognition and support. Our programs are affiliated with renowned universities and span a wide range of disciplines, including:</p>
  
  <ul>
    <li>Polytechnic Courses: Electronics, Electrical, Mechanical (Production), Mechanical (Automobile), and Civil Engineering</li>
    <li>Professional Programs: MBA, D.Pharm, B.Pharm, B.Ed, BBA, LL.B., B.A. LL.B., B.Com LL.B., BCA, and B.Sc. (Biotech)</li>
  </ul>
  
  <p>These programs are thoughtfully designed to provide industry-relevant knowledge and hands-on training, addressing current market demands and enhancing career opportunities in both national and multinational organizations.</p>
  
  <p>Our focus remains on 100% student placement, and we have successfully organized numerous campus interviews and job fairs, resulting in excellent placement records with attractive salary packages. The success of our students is a reflection of our strategic academic delivery and training systems.</p>
  
  <p>The faculty at Translam is our greatest strength—highly qualified, trained, and experienced professionals who are committed to nurturing young minds. A supportive learning environment, combined with continuous feedback mechanisms, ensures the highest standards of education.</p>
  
  <p>To enrich the learning experience, the institution is equipped with modern teaching tools and infrastructure. We regularly host seminars, workshops, and guest lectures by distinguished speakers from IITs, IIMs, DU, BHU, JNU, and leading corporations such as Infosys, Wipro, HCL, TCS, IBM, ICICI, and HDFC.</p>
  
  <p>At Translam, we don't just educate—we transform lives, shape leaders, and build a future powered by knowledge, innovation, and integrity.</p>`,
  
  // Staff Members
  staffMembers: [
    {
      name: 'Dr. Shamim Ahmed',
      title: 'Director',
      image: ''
    },
    {
      name: 'Dr. Kamini Rajput',
      title: 'Principal',
      image: ''
    },
    {
      name: 'Dr. Krishan Pal Singh',
      title: 'Principal',
      image: ''
    }
  ]
};

const DirectorDeskContext = createContext<DirectorDeskContextType | undefined>(undefined);

export function DirectorDeskProvider({ children }: { children: ReactNode }) {
  const [directorDeskData, setDirectorDeskData] = useState<DirectorDeskData>(defaultData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDirectorDeskData = async () => {
      setIsLoading(true);
      try {
        const res = await apiFetch('/api/director-desk');
        if (!res.ok) {
          console.warn('Director-desk endpoint returned non-OK status', res.status);
          return;
        }

        const data = await res.json();
        setDirectorDeskData(data);
      } catch (err: unknown) {
        console.warn('Failed to fetch director desk data:', err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDirectorDeskData();
  }, []);

  const updateDirectorDeskData = async (data: DirectorDeskData) => {
    try {
      const res = await apiFetch('/api/director-desk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const updatedData = await res.json();
        setDirectorDeskData(updatedData);
      } else {
        let errBody: any = null;
        try { errBody = await res.json(); } catch (_) { errBody = null; }
        const msg = errBody?.error || errBody?.message || `Failed to update director desk data: ${res.status}`;
        throw new Error(msg);
      }
    } catch (error: unknown) {
      console.error('Error updating Director Desk data:', error instanceof Error ? error.message : String(error));
      throw error; // Re-throw to let the page component handle it
    }
  };

  return (
    <DirectorDeskContext.Provider value={{ directorDeskData, updateDirectorDeskData, isLoading }}>
      {children}
    </DirectorDeskContext.Provider>
  );
}

export function useDirectorDesk() {
  const context = useContext(DirectorDeskContext);
  if (context === undefined) {
    throw new Error('useDirectorDesk must be used within a DirectorDeskProvider');
  }
  return context;
}