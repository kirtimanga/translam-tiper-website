"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BASE_URL } from '../utils/baseUrl';
import apiFetch from '@/utils/apiFetch';

interface AboutGroupData {
  // Hero Section
  heroTitle: string;
  heroBannerImage: string;
  
  // About US Section
  buildingImage: string;
  aboutUsTitle: string;
  aboutUsContent: string;
  
  // Vision & Mission Section
  visionImage: string;
  visionTitle: string;
  visionContent: string;
  missionContent: string;
  
  // Aims & Objectives Section
  aimsImage: string;
  aimsTitle: string;
  aimsObjectives: string[];
}

interface AboutGroupContextType {
  aboutGroupData: AboutGroupData;
  updateAboutGroupData: (data: AboutGroupData) => Promise<void>;
  isLoading: boolean;
}

const defaultData: AboutGroupData = {
  // Hero Section
  heroTitle: 'ABOUT US',
  heroBannerImage: '',
  
  // About US Section
  buildingImage: '',
  aboutUsTitle: 'About US',
  aboutUsContent: `"TRANSLAM" is a brand in qualitative education since 1987. Translam imparts education right from pre – nursery to Master's degree in Engineering, Polytechnic, Education, Law, Pharmacy and Management Courses with regulatory approval from AICTE New Delhi, recognition from NCTE Jaipur, PCI, BCI, New Delhi and affiliation with AKTU & BTE Lucknow and CCS University Meerut Accredited by NAAC, Bangalore TRANSLAM trust people and it's philosophy to empower them also trying to bring Social Integration through transitional labour market . World is at the age of transformation from a traditional production system to an automatic system. Market need technically trained manpower at all levels. We believe that every students, faculty and supporting staff must achieve quantitative target to attain a qualitative value based life and help students to achieve same.

Translam is promoted by Industrialists, Philanthropists and Social workers. The promoters have an excellent track record of achieving the best in their fields. Obviously this carries with it a certain amount of reputation in society. students love to be called a Translam Boy or a Translam Girl. Seasoned Academicians are backbone of the Group in both theoratical and Practical. Academic leaders are coming forward to support Translam with their hearts and minds. Students get the benefit of their experience. Translam helps those students who are really seeking world-class education. Its also has collaborations with organizations and practicing people overseas and seeks to imbibe a global mindset in its students. There is also a strong focus on research and we encourages its faculty and students to undertake consultancy projects with corporate.`,
  
  // Vision & Mission Section
  visionImage: '',
  visionTitle: 'Vision & Mission',
  visionContent: 'Our vision : Internationally acknowledged institution that shall be producing leaders having excellent competence in the field of technical Education with high professional ethics,human values & charismatic personality.',
  missionContent: 'Our mission : To develop infrastructure and teaching aids as per international standards,high caliber dedicated faculty,value oriented education system so that institute may produce competent professional for service and betterment of the society and economic development of the country.',
  
  // Aims & Objectives Section
  aimsImage: '',
  aimsTitle: 'Aims & Objectives',
  aimsObjectives: [
    '1. Committed to total student satisfaction and enhancing their overall personality.',
    '2. Innovative, entrepreneurial and empower them constantly creating values and attaining global benchmarks.',
    '3. To develop in students a wisdom that translates academic achievements into responsible citizen'
  ]
};

const AboutGroupContext = createContext<AboutGroupContextType | undefined>(undefined);

export function AboutGroupProvider({ children }: { children: ReactNode }) {
  const [aboutGroupData, setAboutGroupData] = useState<AboutGroupData>(defaultData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAboutGroupData = async () => {
      setIsLoading(true);
      try {
        const res = await apiFetch('/api/about-group');
        if (!res.ok) {
          console.warn('About-group endpoint returned non-OK status', res.status);
          return;
        }

        const data = await res.json();
        setAboutGroupData(data);
      } catch (err: unknown) {
        console.warn('Failed to fetch about group data:', err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAboutGroupData();
  }, []);

  const updateAboutGroupData = async (data: AboutGroupData) => {
    try {
      const res = await apiFetch('/api/about-group', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const updatedData = await res.json();
        setAboutGroupData(updatedData);
      } else {
        let errBody: any = null;
        try { errBody = await res.json(); } catch (_) { errBody = null; }
        const msg = errBody?.error || errBody?.message || `Failed to update about group data: ${res.status}`;
        throw new Error(msg);
      }
    } catch (error: unknown) {
      console.error('Error updating About Group data:', error instanceof Error ? error.message : String(error));
      throw error; // Re-throw to let the page component handle it
    }
  };

  return (
    <AboutGroupContext.Provider value={{ aboutGroupData, updateAboutGroupData, isLoading }}>
      {children}
    </AboutGroupContext.Provider>
  );
}

export function useAboutGroup() {
  const context = useContext(AboutGroupContext);
  if (context === undefined) {
    throw new Error('useAboutGroup must be used within an AboutGroupProvider');
  }
  return context;
}