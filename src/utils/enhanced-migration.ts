/**
 * Enhanced migration utility with better error handling and data structure flexibility
 */

import { BASE_URL } from './baseUrl';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || `${BASE_URL}/api`;

interface MigrationResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

export async function enhancedMigration(): Promise<{ [key: string]: MigrationResult }> {
  const results: { [key: string]: MigrationResult } = {};

  // Helper function to safely parse JSON
  const safeParseJSON = (data: string | null, key: string): any => {
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (error) {
      const _err = error instanceof Error ? error.message : String(error);
      console.error(`Failed to parse ${key}:`, _err);
      return null;
    }
  };

  // Helper function to make API calls with better error handling
  const apiCall = async (endpoint: string, method: string, data: any): Promise<Response> => {
    try {
      return await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (error) {
      const _err = error instanceof Error ? error.message : String(error);
      throw new Error(`API call failed: ${_err}`);
    }
  };

  // 1. Migrate Our Success Data
  try {
    const rawData = localStorage.getItem('ourSuccessData');
    const data = safeParseJSON(rawData, 'ourSuccessData');
    
    if (data) {
      console.log('Our Success data found:', data);
      
      // Handle different possible data structures
      const backendData = {
        heroTitle: data.title || data.heroTitle || 'Our Success',
        content: data.description || data.content || '',
        successStories: data.stats ? [data.stats] : data.successStories || []
      };
      
      const response = await apiCall('/our-success', 'PUT', backendData);
      
      if (response.ok) {
        results.ourSuccess = { 
          success: true, 
          message: 'Our Success data migrated successfully', 
          data: backendData 
        };
        localStorage.removeItem('ourSuccessData');
      } else {
        const error = await response.text();
        results.ourSuccess = { 
          success: false, 
          message: 'Failed to migrate Our Success data',
          error 
        };
      }
    } else {
      results.ourSuccess = { success: true, message: 'No Our Success data to migrate' };
    }
  } catch (error) {
    const _err = error instanceof Error ? error.toString() : String(error);
    results.ourSuccess = {
      success: false,
      message: `Error migrating Our Success data`,
      error: _err
    };
  }

  // 2. Migrate Our Institutions Data
  try {
    const rawData = localStorage.getItem('ourInstitutionsData');
    const data = safeParseJSON(rawData, 'ourInstitutionsData');
    
    if (data) {
      console.log('Our Institutions data found:', data);
      
      const backendData = {
        heroTitle: data.title || data.heroTitle || 'Our Institutions',
        content: data.description || data.content || '',
        institutions: data.institutions || []
      };
      
      const response = await apiCall('/our-institutions', 'PUT', backendData);
      
      if (response.ok) {
        results.ourInstitutions = { 
          success: true, 
          message: 'Our Institutions data migrated successfully', 
          data: backendData 
        };
        localStorage.removeItem('ourInstitutionsData');
      } else {
        const error = await response.text();
        results.ourInstitutions = { 
          success: false, 
          message: 'Failed to migrate Our Institutions data',
          error 
        };
      }
    } else {
      results.ourInstitutions = { success: true, message: 'No Our Institutions data to migrate' };
    }
  } catch (error) {
    const _err = error instanceof Error ? error.toString() : String(error);
    results.ourInstitutions = {
      success: false,
      message: `Error migrating Our Institutions data`,
      error: _err
    };
  }

  // 3. Migrate Our Recruiters Data
  try {
    const rawData = localStorage.getItem('ourRecruitersData');
    const data = safeParseJSON(rawData, 'ourRecruitersData');
    
    if (data) {
      console.log('Our Recruiters data found:', data);
      
      const backendData = {
        heroTitle: data.title || data.heroTitle || 'Our Recruiters',
        content: data.description || data.content || '',
        recruiters: data.recruiters || []
      };
      
      const response = await apiCall('/our-recruiters', 'PUT', backendData);
      
      if (response.ok) {
        results.ourRecruiters = { 
          success: true, 
          message: 'Our Recruiters data migrated successfully', 
          data: backendData 
        };
        localStorage.removeItem('ourRecruitersData');
      } else {
        const error = await response.text();
        results.ourRecruiters = { 
          success: false, 
          message: 'Failed to migrate Our Recruiters data',
          error 
        };
      }
    } else {
      results.ourRecruiters = { success: true, message: 'No Our Recruiters data to migrate' };
    }
  } catch (error) {
    const _err = error instanceof Error ? error.toString() : String(error);
    results.ourRecruiters = {
      success: false,
      message: `Error migrating Our Recruiters data`,
      error: _err
    };
  }

  // 4. Migrate Testimonial Data
  try {
    const rawData = localStorage.getItem('testimonialData');
    const data = safeParseJSON(rawData, 'testimonialData');
    
    if (data && data.testimonials) {
      console.log('Testimonial data found:', data);
      
      for (const testimonial of data.testimonials) {
        const backendTestimonial = {
          name: testimonial.name || '',
          role: testimonial.role || 'Student',
          company: testimonial.company || '',
          image: testimonial.image || '',
          content: testimonial.text || testimonial.content || '',
          rating: testimonial.stars || testimonial.rating || 5,
          isActive: testimonial.isActive !== undefined ? testimonial.isActive : true
        };
        
        try {
          const response = await apiCall('/testimonials', 'POST', backendTestimonial);
          
          if (!response.ok) {
            console.error(`Failed to migrate testimonial: ${testimonial.name}`);
          }
        } catch (error) {
          const _err = error instanceof Error ? error.message : String(error);
          console.error(`Error migrating testimonial: ${testimonial.name}`, _err);
        }
      }
      
      results.testimonials = { 
        success: true, 
        message: `${data.testimonials.length} testimonials migrated`, 
        data: data.testimonials 
      };
      localStorage.removeItem('testimonialData');
    } else {
      results.testimonials = { success: true, message: 'No Testimonial data to migrate' };
    }
  } catch (error) {
    const _err = error instanceof Error ? error.toString() : String(error);
    results.testimonials = {
      success: false,
      message: `Error migrating Testimonials`,
      error: _err
    };
  }

  // 5. Migrate Why Choose Us Data
  try {
    const rawData = localStorage.getItem('whyChooseUsData');
    const data = safeParseJSON(rawData, 'whyChooseUsData');
    
    if (data) {
      console.log('Why Choose Us data found:', data);
      
      const backendData = {
        heroTitle: data.title || data.heroTitle || 'Why Choose Us',
        content: data.description || data.content || '',
        points: data.reasons || data.points || []
      };
      
      const response = await apiCall('/why-choose-us', 'PUT', backendData);
      
      if (response.ok) {
        results.whyChooseUs = { 
          success: true, 
          message: 'Why Choose Us data migrated successfully', 
          data: backendData 
        };
        localStorage.removeItem('whyChooseUsData');
      } else {
        const error = await response.text();
        results.whyChooseUs = { 
          success: false, 
          message: 'Failed to migrate Why Choose Us data',
          error 
        };
      }
    } else {
      results.whyChooseUs = { success: true, message: 'No Why Choose Us data to migrate' };
    }
  } catch (error) {
    const _err = error instanceof Error ? error.toString() : String(error);
    results.whyChooseUs = {
      success: false,
      message: `Error migrating Why Choose Us data`,
      error: _err
    };
  }

  // 6. Migrate Outstanding Placements Data
  try {
    const rawData = localStorage.getItem('outstandingPlacementsData');
    const data = safeParseJSON(rawData, 'outstandingPlacementsData');
    
    if (data) {
      console.log('Outstanding Placements data found:', data);
      console.log('Raw localStorage data:', rawData);
      
      // Handle various possible data structures
      const backendData = {
        heroTitle: data.title || data.heroTitle || 'Outstanding Placements',
        content: data.description || data.content || '',
        placements: data.placements || data.students || [] // some might use 'students' instead
      };
      
      console.log('Transformed backend data for Outstanding Placements:', backendData);
      
      const response = await apiCall('/outstanding-placements', 'PUT', backendData);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Outstanding Placements API response:', responseData);
        
        results.outstandingPlacements = { 
          success: true, 
          message: 'Outstanding Placements data migrated successfully', 
          data: backendData 
        };
        localStorage.removeItem('outstandingPlacementsData');
      } else {
        const error = await response.text();
        console.error('Outstanding Placements API Error:', response.status, response.statusText, error);
        results.outstandingPlacements = { 
          success: false, 
          message: `Failed to migrate Outstanding Placements data: ${response.status}`,
          error: `${response.statusText} - ${error}`
        };
      }
    } else {
      console.log('No Outstanding Placements data found in localStorage');
      results.outstandingPlacements = { success: true, message: 'No Outstanding Placements data to migrate' };
    }
  } catch (error) {
    const _err = error instanceof Error ? error.toString() : String(error);
    console.error('Outstanding Placements migration error:', _err);
    results.outstandingPlacements = {
      success: false,
      message: `Error migrating Outstanding Placements data`,
      error: _err
    };
  }

  // 7. Migrate Home Slider Data
  try {
    const rawData = localStorage.getItem('homeSliderData');
    const data = safeParseJSON(rawData, 'homeSliderData');
    
    if (data) {
      console.log('Home Slider data found:', data);
      
      if (Array.isArray(data)) {
        let successCount = 0;
        for (const slide of data) {
          const backendSlide = {
            title: slide.title || slide.heading || '',
            subtitle: slide.subtitle || slide.description || '',
            image: slide.image || slide.imageUrl || '',
            order: slide.order || successCount,
            isActive: slide.isActive !== undefined ? slide.isActive : true
          };
          
          try {
            const response = await apiCall('/home-sliders', 'POST', backendSlide);
            if (response.ok) successCount++;
          } catch (error) {
        const _err = error instanceof Error ? error.message : String(error);
        console.error(`Error migrating slide: ${slide.title}`, _err);
          }
        }
        
        results.homeSlider = { 
          success: true, 
          message: `${successCount} home slider(s) migrated successfully`, 
          data: data 
        };
        localStorage.removeItem('homeSliderData');
      } else {
        const backendSlide = {
          title: data.title || data.heading || 'Home Slide',
          subtitle: data.subtitle || data.description || '',
          image: data.image || data.imageUrl || '',
          order: 0,
          isActive: true
        };
        
        const response = await apiCall('/home-sliders', 'POST', backendSlide);
        
        if (response.ok) {
          results.homeSlider = { success: true, message: 'Home slider migrated successfully', data: backendSlide };
          localStorage.removeItem('homeSliderData');
        } else {
          const error = await response.text();
          results.homeSlider = { success: false, message: 'Failed to migrate Home slider', error };
        }
      }
    } else {
      results.homeSlider = { success: true, message: 'No Home Slider data to migrate' };
    }
  } catch (error) {
    const _err = error instanceof Error ? error.toString() : String(error);
    results.homeSlider = {
      success: false,
      message: `Error migrating Home Slider data`,
      error: _err
    };
  }

  // 8. Migrate About Group Data
  try {
    const rawData = localStorage.getItem('aboutGroupData');
    const data = safeParseJSON(rawData, 'aboutGroupData');
    
    if (data) {
      console.log('About Group data found:', data);
      
      const backendData = {
        heroTitle: data.title || data.heroTitle || 'About Us',
        heroBannerImage: data.bannerImage || data.heroBannerImage || '',
        buildingImage: data.buildingImage || '',
        aboutUsTitle: data.aboutTitle || 'About Us',
        aboutUsContent: data.aboutContent || data.description || '',
        visionImage: data.visionImage || '',
        visionTitle: data.visionTitle || 'Vision & Mission',
        visionContent: data.visionContent || data.vision || '',
        missionContent: data.missionContent || data.mission || '',
        aimsImage: data.aimsImage || '',
        aimsTitle: data.aimsTitle || 'Aims & Objectives',
        aimsObjectives: data.aimsObjectives || data.objectives || []
      };
      
      const response = await apiCall('/about-group', 'PUT', backendData);
      
      if (response.ok) {
        results.aboutGroup = { success: true, message: 'About Group data migrated successfully', data: backendData };
        localStorage.removeItem('aboutGroupData');
      } else {
        const error = await response.text();
        results.aboutGroup = { success: false, message: 'Failed to migrate About Group data', error };
      }
    } else {
      results.aboutGroup = { success: true, message: 'No About Group data to migrate' };
    }
  } catch (error) {
    const _err = error instanceof Error ? error.toString() : String(error);
    results.aboutGroup = {
      success: false,
      message: `Error migrating About Group data`,
      error: _err
    };
  }

  // 9. Migrate Philosophy Data
  try {
    const rawData = localStorage.getItem('philosophyData');
    const data = safeParseJSON(rawData, 'philosophyData');
    
    if (data) {
      console.log('Philosophy data found:', data);
      
      const backendData = {
        heroTitle: data.title || data.heroTitle || 'Philosophy',
        heroBannerImage: data.bannerImage || data.heroBannerImage || '',
        mainQuote: data.quote || data.mainQuote || '',
        content: data.content || data.description || ''
      };
      
      const response = await apiCall('/philosophy', 'PUT', backendData);
      
      if (response.ok) {
        results.philosophy = { success: true, message: 'Philosophy data migrated successfully', data: backendData };
        localStorage.removeItem('philosophyData');
      } else {
        const error = await response.text();
        results.philosophy = { success: false, message: 'Failed to migrate Philosophy data', error };
      }
    } else {
      results.philosophy = { success: true, message: 'No Philosophy data to migrate' };
    }
  } catch (error) {
    const _err = error instanceof Error ? error.toString() : String(error);
    results.philosophy = {
      success: false,
      message: `Error migrating Philosophy data`,
      error: _err
    };
  }

  // 10. Migrate Director's Desk Data
  try {
    const rawData = localStorage.getItem('directorDeskData');
    const data = safeParseJSON(rawData, 'directorDeskData');
    
    if (data) {
      console.log('Director Desk data found:', data);
      
      const backendData = {
        heroTitle: data.title || data.heroTitle || 'Director Desk',
        heroBannerImage: data.bannerImage || data.heroBannerImage || '',
        mainHeading: data.heading || data.mainHeading || '',
        content: data.content || data.description || '',
        staffMembers: data.staffMembers || data.staff || []
      };
      
      const response = await apiCall('/director-desk', 'PUT', backendData);
      
      if (response.ok) {
        results.directorDesk = { success: true, message: 'Director Desk data migrated successfully', data: backendData };
        localStorage.removeItem('directorDeskData');
      } else {
        const error = await response.text();
        results.directorDesk = { success: false, message: 'Failed to migrate Director Desk data', error };
      }
    } else {
      results.directorDesk = { success: true, message: 'No Director Desk data to migrate' };
    }
  } catch (error) {
    const _err = error instanceof Error ? error.toString() : String(error);
    results.directorDesk = {
      success: false,
      message: `Error migrating Director Desk data`,
      error: _err
    };
  }

  // Log detailed results
  console.group('📦 Enhanced Migration Results');
  Object.entries(results).forEach(([key, result]) => {
    if (result.success) {
      console.log(`✅ ${key}: ${result.message}`);
      if (result.data) {
        console.log('  Data:', result.data);
      }
    } else {
      console.error(`❌ ${key}: ${result.message}`);
      if (result.error) {
        console.error('  Error:', result.error);
      }
    }
  });
  console.groupEnd();

  return results;
}

// Function to check what's in localStorage
export function debugLocalStorage() {
  const keys = [
    'ourSuccessData',
    'ourInstitutionsData', 
    'ourRecruitersData',
    'testimonialData',
    'whyChooseUsData',
    'outstandingPlacementsData',
    'homeSliderData',
    'aboutGroupData',
    'philosophyData',
    'directorDeskData'
  ];

  console.group('🔍 localStorage Debug');
  keys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      console.log(`${key}: Found`);
      try {
        console.log(JSON.parse(data));
      } catch (e) {
        console.log('Failed to parse:', data);
      }
    } else {
      console.log(`${key}: NOT FOUND`);
    }
  });
  console.groupEnd();
}