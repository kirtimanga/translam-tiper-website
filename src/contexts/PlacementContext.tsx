"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { BASE_URL } from '@/utils/baseUrl';
import apiFetch from '@/utils/apiFetch';

export interface PlacementStudent {
  id: string;
  name: string;
  company: string;
  image: string;
  order: number;
  isActive: boolean;
}

interface PlacementData {
  heroTitle: string;
  heroImage: string;
  crcTitle: string;
  crcDescription: string;
  crcContent: string;
  trainingTitle: string;
  trainingDescription: string;
  trainingFeatures: {
    id: string;
    title: string;
    description: string;
    order: number;
  }[];
  students: PlacementStudent[];
}

interface PlacementContextType {
  data: PlacementData;
  updateData: (newData: PlacementData) => void;
  addStudent: (student: Omit<PlacementStudent, 'id'>) => void;
  updateStudent: (id: string, student: Omit<PlacementStudent, 'id'>) => void;
  deleteStudent: (id: string) => void;
  addFeature: (feature: Omit<PlacementData['trainingFeatures'][0], 'id'>) => void;
  updateFeature: (id: string, feature: Omit<PlacementData['trainingFeatures'][0], 'id'>) => void;
  deleteFeature: (id: string) => void;
  getActiveStudents: () => PlacementStudent[];
}

const defaultData: PlacementData = {
  heroTitle: "Placement",
  heroImage: "/images/placement-hero.jpg",
  crcTitle: "Corporate Resource Center (CRC)",
  crcDescription: "Translam features a dynamic Corporate Resource Center (CRC) operating under the direct guidance of the Institute Director. The CRC serves as a vital link between the institution and the industry. With the consistent efforts of our students and the dedication of our faculty, Translam has earned a stellar reputation among recruiters as a leading professional and technical institute in the NCR region.",
  crcContent: `To support the holistic development of students, our Personality Development Cell (PDC) ensures they are equipped with the qualities and skills demanded by modern industries, enabling them to rise to leadership roles in society. Committed to delivering creative minds to the industry, our experienced academicians and professionals guide students in developing functional competencies, leadership qualities, and strategic thinking abilities.

The CRC centrally manages the campus placements for graduating students across all departments. Our Industry-Institute collaboration aims to foster the exchange of resources, feedback, and ideas in alignment with our institutional mission. It enriches student learning by enhancing their knowledge of emerging technologies and practical problem-solving skills.

Summer projects—co-designed and supervised by senior faculty and industry experts—expose students to the latest concepts in their respective fields. In addition, regular sports and strategic personality development programs are emphasized to nurture well-rounded individuals.

Foreign language training, included alongside the regular curriculum, boosts confidence, improves communication skills, and helps students navigate cross-cultural environments—significantly enhancing their global employability.

Our recruiters consistently appreciate the quality of our graduates, reaffirming the institute's vision and efforts.`,
  trainingTitle: "Training and Development",
  trainingDescription: "At Translam Institute, we strongly believe in continuous growth and skill enhancement. Our Training and Development Cell is committed to shaping students into industry-ready professionals by bridging the gap between academic knowledge and practical application.",
  trainingFeatures: [
    {
      id: "1",
      title: "Technical Skill Development",
      description: "Hands-on training in the latest tools, programming languages, and software platforms.",
      order: 0
    },
    {
      id: "2",
      title: "Soft Skills and Personality Enhancement",
      description: "Sessions on communication, presentation, teamwork, and time management.",
      order: 1
    },
    {
      id: "3",
      title: "Aptitude & Interview Preparation",
      description: "Regular mock tests, GD/PI sessions, and mentorship for competitive exams and campus placements.",
      order: 2
    },
    {
      id: "4",
      title: "Industry Connect Programs",
      description: "Guest lectures, corporate talks, internships, and industrial visits in collaboration with top companies.",
      order: 3
    }
  ],
  students: [
    {
      id: "1",
      name: "Anny",
      company: "HCL",
      image: "/images/student1.png",
      order: 0,
      isActive: true
    },
    {
      id: "2",
      name: "John",
      company: "HCL",
      image: "/images/student1.png",
      order: 1,
      isActive: true
    },
    {
      id: "3",
      name: "Anny",
      company: "HCL",
      image: "/images/student1.png",
      order: 2,
      isActive: true
    },
    {
      id: "4",
      name: "Anny",
      company: "HCL",
      image: "/images/student1.png",
      order: 3,
      isActive: true
    },
    {
      id: "5",
      name: "Anny",
      company: "HCL",
      image: "/images/student1.png",
      order: 4,
      isActive: true
    },
    {
      id: "6",
      name: "Anny",
      company: "HCL",
      image: "/images/student1.png",
      order: 5,
      isActive: true
    }
  ]
};

const PlacementContext = createContext<PlacementContextType | undefined>(undefined);

export const usePlacement = () => {
  const context = useContext(PlacementContext);
  if (!context) {
    throw new Error('usePlacement must be used within a PlacementProvider');
  }
  return context;
};

export const PlacementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PlacementData>(defaultData);
  const [loading, setLoading] = useState(true);

  // Load from database on component mount using centralized apiFetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/api/placement');
        if (!res.ok) {
          console.warn('Placement endpoint returned non-OK status', res.status);
          return;
        }

        const apiData = await res.json();
        // Transform backend data to match frontend structure
        const transformedStudents = (apiData.students || defaultData.students).map((student: any) => ({
          ...student,
          // Ensure image URLs are absolute paths pointing to backend
          image: typeof student.image === 'string' && student.image.startsWith('/uploads/') 
            ? `${BASE_URL}${student.image}`
            : student.image
        }));

        const transformedData: PlacementData = {
          heroTitle: apiData.heroTitle || defaultData.heroTitle,
          heroImage: typeof apiData.heroImage === 'string' && apiData.heroImage.startsWith('/uploads/') 
            ? `${BASE_URL}${apiData.heroImage}`
            : apiData.heroImage || defaultData.heroImage,
          crcTitle: apiData.crcTitle || defaultData.crcTitle,
          crcDescription: apiData.crcDescription || defaultData.crcDescription,
          crcContent: apiData.crcContent || defaultData.crcContent,
          trainingTitle: apiData.trainingTitle || defaultData.trainingTitle,
          trainingDescription: apiData.trainingDescription || defaultData.trainingDescription,
          trainingFeatures: apiData.trainingFeatures || defaultData.trainingFeatures,
          students: transformedStudents
        };
        setData(transformedData);
      } catch (err: unknown) {
        console.warn('Failed to fetch Placement data:', err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateData = async (newData: PlacementData) => {
    try {
      // Convert absolute URLs back to relative paths for storage
      const studentsForBackend = (newData.students || []).map(student => ({
        ...student,
        image: typeof student.image === 'string' && student.image.startsWith(BASE_URL) 
          ? student.image.replace(BASE_URL, '')
          : student.image
      }));

      const backendData = {
        ...newData,
        heroImage: typeof newData.heroImage === 'string' && newData.heroImage.startsWith(BASE_URL) 
          ? newData.heroImage.replace(BASE_URL, '')
          : newData.heroImage,
        students: studentsForBackend
      };

      const res = await apiFetch('/api/placement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData),
      });

      if (res.ok) {
        setData(newData);
      } else {
        let errBody: any = null;
        try { errBody = await res.json(); } catch (_) { errBody = null; }
        const msg = errBody?.error || errBody?.message || `Failed to update Placement data: ${res.status}`;
        throw new Error(msg);
      }
    } catch (error: unknown) {
      console.error('Failed to update Placement data:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  };

  const addStudent = async (student: Omit<PlacementStudent, 'id'>) => {
    const newStudent: PlacementStudent = {
      ...student,
      id: Date.now().toString()
    };
    
    const updatedData = {
      ...data,
      students: [...(data.students || []), newStudent]
    };
    
    await updateData(updatedData);
  };

  const updateStudent = async (id: string, updatedStudent: Omit<PlacementStudent, 'id'>) => {
    const updatedData = {
      ...data,
      students: (data.students || []).map(student => 
        student.id === id 
          ? { ...student, ...updatedStudent }
          : student
      )
    };
    
    await updateData(updatedData);
  };

  const deleteStudent = async (id: string) => {
    const updatedData = {
      ...data,
      students: (data.students || []).filter(student => student.id !== id)
    };
    
    await updateData(updatedData);
  };

  const addFeature = async (feature: Omit<PlacementData['trainingFeatures'][0], 'id'>) => {
    const newFeature = {
      ...feature,
      id: Date.now().toString()
    };
    
    const updatedData = {
      ...data,
      trainingFeatures: [...(data.trainingFeatures || []), newFeature]
    };
    
    await updateData(updatedData);
  };

  const updateFeature = async (id: string, updatedFeature: Omit<PlacementData['trainingFeatures'][0], 'id'>) => {
    const updatedData = {
      ...data,
      trainingFeatures: (data.trainingFeatures || []).map(feature => 
        feature.id === id 
          ? { ...feature, ...updatedFeature }
          : feature
      )
    };
    
    await updateData(updatedData);
  };

  const deleteFeature = async (id: string) => {
    const updatedData = {
      ...data,
      trainingFeatures: (data.trainingFeatures || []).filter(feature => feature.id !== id)
    };
    
    await updateData(updatedData);
  };

  const getActiveStudents = () => {
    return (data.students || [])
      .filter(student => student.isActive)
      .sort((a, b) => a.order - b.order);
  };

  return (
    <PlacementContext.Provider value={{ 
      data, 
      updateData, 
      addStudent, 
      updateStudent, 
      deleteStudent,
      addFeature,
      updateFeature,
      deleteFeature,
      getActiveStudents
    }}>
      {children}
    </PlacementContext.Provider>
  );
};