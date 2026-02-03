"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiFetch from '@/utils/apiFetch';

interface OurSuccessData {
  title: string;
  description: string;
  stats: {
    graduates: string;
    graduatesLabel: string;
    alumni: string;
    alumniLabel: string;
    yearsExcellence: string;
    yearsExcellenceLabel: string;
    recruiters: string;
    recruitersLabel: string;
    placementRate: string;
    placementRateLabel: string;
  };
}

interface OurSuccessContextType {
  data: OurSuccessData;
  updateData: (newData: OurSuccessData) => Promise<unknown>;
}

const defaultData: OurSuccessData = {
  title: "Our Success",
  description: "At Translam Group of Institutions, success isn't just a goal — it's our commitment. Through years of dedication, innovation, and expert mentorship, we've helped thousands of students realize their academic and professional dreams.",
  stats: {
    graduates: "5000+",
    graduatesLabel: "Successful Graduates",
    alumni: "15000+",
    alumniLabel: "Alumni",
    yearsExcellence: "38",
    yearsExcellenceLabel: "Of Educational Excellence",
    recruiters: "100+",
    recruitersLabel: "Recruiters",
    placementRate: "90%",
    placementRateLabel: "Placement Success Rate"
  }
};

const OurSuccessContext = createContext<OurSuccessContextType | undefined>(undefined);

export const useOurSuccess = () => {
  const context = useContext(OurSuccessContext);
  if (!context) {
    throw new Error('useOurSuccess must be used within an OurSuccessProvider');
  }
  return context;
};

export const OurSuccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<OurSuccessData>(defaultData);
  const [loading, setLoading] = useState(true);

  // Load from database on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiFetch('/api/our-success');
        if (response.ok) {
          const apiData = await response.json();
          // Transform backend data to match frontend structure
          const transformedData: OurSuccessData = {
            title: apiData.heroTitle || defaultData.title,
            description: apiData.content || defaultData.description,
            stats: {
              graduates: apiData.successStories?.[0]?.graduates || defaultData.stats.graduates,
              graduatesLabel: apiData.successStories?.[0]?.graduatesLabel || defaultData.stats.graduatesLabel,
              alumni: apiData.successStories?.[0]?.alumni || defaultData.stats.alumni,
              alumniLabel: apiData.successStories?.[0]?.alumniLabel || defaultData.stats.alumniLabel,
              yearsExcellence: apiData.successStories?.[0]?.yearsExcellence || defaultData.stats.yearsExcellence,
              yearsExcellenceLabel: apiData.successStories?.[0]?.yearsExcellenceLabel || defaultData.stats.yearsExcellenceLabel,
              recruiters: apiData.successStories?.[0]?.recruiters || defaultData.stats.recruiters,
              recruitersLabel: apiData.successStories?.[0]?.recruitersLabel || defaultData.stats.recruitersLabel,
              placementRate: apiData.successStories?.[0]?.placementRate || defaultData.stats.placementRate,
              placementRateLabel: apiData.successStories?.[0]?.placementRateLabel || defaultData.stats.placementRateLabel
            }
          };
          setData(transformedData);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Failed to fetch Our Success data:', error.message);
        } else {
          console.error('Failed to fetch Our Success data:', String(error));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateData = async (newData: OurSuccessData) => {
    // Transform frontend data to match backend structure
    const backendData = {
      heroTitle: newData.title,
      content: newData.description,
      successStories: [newData.stats] // Store stats as the first success story
    };

    try {
      const response = await apiFetch('/api/our-success', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData),
      });

      // Try to parse JSON body (success or error) and return it so callers can drive alerts/UI
      let responseBody: unknown = null;
      try {
        responseBody = await response.json();
      } catch (e) {
        // ignore JSON parse errors
        responseBody = null;
      }

      if (response.ok) {
        setData(newData);
        return responseBody;
      }

      // Response was not ok — return the parsed body if available so UI can show server message
      return responseBody ?? { alert: { type: 'error', message: 'Failed to update Our Success data' } };
    } catch (err) {
      // Network / fetch error — log for debugging and return a friendly alert shape
      // eslint-disable-next-line no-console
      console.debug('Failed to update Our Success data:', err instanceof Error ? err.message : String(err));
      return { alert: { type: 'error', message: 'Failed to update Our Success data (network error)' } };
    }
  };

  return (
    <OurSuccessContext.Provider value={{ data, updateData }}>
      {children}
    </OurSuccessContext.Provider>
  );
};