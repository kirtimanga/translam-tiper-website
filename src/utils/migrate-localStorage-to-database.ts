/**
 * Utility to migrate localStorage data to database
 * This should be run once to transfer existing localStorage data to the backend
 */

interface MigrationResult {
  success: boolean;
  message: string;
  data?: any;
}

import { BASE_URL } from './baseUrl';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || `${BASE_URL}/api`;

export async function migrateLocalStorageToDatabase(): Promise<{ [key: string]: MigrationResult }> {
  const results: { [key: string]: MigrationResult } = {};

  try {
    // Migrate Our Success Data
    const ourSuccessData = localStorage.getItem('ourSuccessData');
    if (ourSuccessData) {
      try {
        const data = JSON.parse(ourSuccessData);
        const backendData = {
          heroTitle: data.title,
          content: data.description,
          successStories: [data.stats]
        };
        
        const response = await fetch(`${API_BASE_URL}/our-success`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendData),
        });

        if (response.ok) {
          results.ourSuccess = { success: true, message: 'Our Success data migrated successfully', data: backendData };
          localStorage.removeItem('ourSuccessData');
        } else {
          results.ourSuccess = { success: false, message: 'Failed to migrate Our Success data' };
        }
      } catch (error) {
        results.ourSuccess = { success: false, message: `Error migrating Our Success data: ${error}` };
      }
    }

    // Migrate Our Institutions Data
    const ourInstitutionsData = localStorage.getItem('ourInstitutionsData');
    if (ourInstitutionsData) {
      try {
        const data = JSON.parse(ourInstitutionsData);
        const backendData = {
          heroTitle: data.title,
          content: data.description,
          institutions: data.institutions
        };
        
        const response = await fetch(`${API_BASE_URL}/our-institutions`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendData),
        });

        if (response.ok) {
          results.ourInstitutions = { success: true, message: 'Our Institutions data migrated successfully', data: backendData };
          localStorage.removeItem('ourInstitutionsData');
        } else {
          results.ourInstitutions = { success: false, message: 'Failed to migrate Our Institutions data' };
        }
      } catch (error) {
        results.ourInstitutions = { success: false, message: `Error migrating Our Institutions data: ${error}` };
      }
    }

    // Migrate Our Recruiters Data
    const ourRecruitersData = localStorage.getItem('ourRecruitersData');
    if (ourRecruitersData) {
      try {
        const data = JSON.parse(ourRecruitersData);
        const backendData = {
          heroTitle: data.title,
          content: data.description,
          recruiters: data.recruiters
        };
        
        const response = await fetch(`${API_BASE_URL}/our-recruiters`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendData),
        });

        if (response.ok) {
          results.ourRecruiters = { success: true, message: 'Our Recruiters data migrated successfully', data: backendData };
          localStorage.removeItem('ourRecruitersData');
        } else {
          results.ourRecruiters = { success: false, message: 'Failed to migrate Our Recruiters data' };
        }
      } catch (error) {
        results.ourRecruiters = { success: false, message: `Error migrating Our Recruiters data: ${error}` };
      }
    }

    // Migrate Testimonial Data
    const testimonialData = localStorage.getItem('testimonialData');
    if (testimonialData) {
      try {
        const data = JSON.parse(testimonialData);
        
        // Migrate individual testimonials
        for (const testimonial of data.testimonials) {
          const backendTestimonial = {
            name: testimonial.name,
            role: 'Student',
            company: '',
            image: testimonial.image,
            content: testimonial.text,
            rating: testimonial.stars,
            isActive: testimonial.isActive
          };
          
          const response = await fetch(`${API_BASE_URL}/testimonials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(backendTestimonial),
          });

          if (!response.ok) {
            console.error(`Failed to migrate testimonial: ${testimonial.name}`);
          }
        }
        
        results.testimonials = { success: true, message: 'Testimonials migrated successfully', data: data.testimonials };
        localStorage.removeItem('testimonialData');
      } catch (error) {
        results.testimonials = { success: false, message: `Error migrating Testimonials: ${error}` };
      }
    }

    // Migrate Why Choose Us Data
    const whyChooseUsData = localStorage.getItem('whyChooseUsData');
    if (whyChooseUsData) {
      try {
        const data = JSON.parse(whyChooseUsData);
        const backendData = {
          heroTitle: data.title,
          content: data.description,
          points: data.reasons
        };
        
        const response = await fetch(`${API_BASE_URL}/why-choose-us`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendData),
        });

        if (response.ok) {
          results.whyChooseUs = { success: true, message: 'Why Choose Us data migrated successfully', data: backendData };
          localStorage.removeItem('whyChooseUsData');
        } else {
          results.whyChooseUs = { success: false, message: 'Failed to migrate Why Choose Us data' };
        }
      } catch (error) {
        results.whyChooseUs = { success: false, message: `Error migrating Why Choose Us data: ${error}` };
      }
    }

    // Migrate Outstanding Placements Data
    const outstandingPlacementsData = localStorage.getItem('outstandingPlacementsData');
    if (outstandingPlacementsData) {
      try {
        const data = JSON.parse(outstandingPlacementsData);
        const backendData = {
          heroTitle: data.title,
          content: data.description,
          placements: data.placements
        };
        
        const response = await fetch(`${API_BASE_URL}/outstanding-placements`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendData),
        });

        if (response.ok) {
          results.outstandingPlacements = { success: true, message: 'Outstanding Placements data migrated successfully', data: backendData };
          localStorage.removeItem('outstandingPlacementsData');
        } else {
          const errorText = await response.text();
          console.error('Outstanding Placements API Error:', response.status, errorText);
          results.outstandingPlacements = { success: false, message: `Failed to migrate Outstanding Placements data: ${response.status} - ${errorText}` };
        }
      } catch (error) {
        results.outstandingPlacements = { success: false, message: `Error migrating Outstanding Placements data: ${error}` };
      }
    }

    // Migrate Home Slider Data
    const homeSliderData = localStorage.getItem('homeSliderData');
    if (homeSliderData) {
      try {
        const data = JSON.parse(homeSliderData);
        
        // Home slider might be stored as an array of slides
        if (Array.isArray(data)) {
          // Create each slide individually
          let successCount = 0;
          for (const slide of data) {
            const backendSlide = {
              title: slide.title || slide.heading || '',
              subtitle: slide.subtitle || slide.description || '',
              image: slide.image || slide.imageUrl || '',
              order: slide.order || successCount,
              isActive: slide.isActive !== undefined ? slide.isActive : true
            };
            
            const response = await fetch(`${API_BASE_URL}/home-sliders`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(backendSlide),
            });

            if (response.ok) {
              successCount++;
            }
          }
          
          results.homeSlider = { 
            success: true, 
            message: `${successCount} home slider(s) migrated successfully`, 
            data: data 
          };
        } else {
          // Handle object format
          const backendSlide = {
            title: data.title || data.heading || 'Home Slide',
            subtitle: data.subtitle || data.description || '',
            image: data.image || data.imageUrl || '',
            order: 0,
            isActive: true
          };
          
          const response = await fetch(`${API_BASE_URL}/home-sliders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(backendSlide),
          });

          if (response.ok) {
            results.homeSlider = { success: true, message: 'Home slider migrated successfully', data: backendSlide };
          } else {
            const errorText = await response.text();
            results.homeSlider = { success: false, message: `Failed to migrate Home slider: ${response.status} - ${errorText}` };
          }
        }
        
        if (results.homeSlider.success) {
          localStorage.removeItem('homeSliderData');
        }
      } catch (error) {
        results.homeSlider = { success: false, message: `Error migrating Home slider: ${error}` };
      }
    }

    // Migrate About Group Data
    const aboutGroupData = localStorage.getItem('aboutGroupData');
    if (aboutGroupData) {
      try {
        const data = JSON.parse(aboutGroupData);
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
        
        const response = await fetch(`${API_BASE_URL}/about-group`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendData),
        });

        if (response.ok) {
          results.aboutGroup = { success: true, message: 'About Group data migrated successfully', data: backendData };
          localStorage.removeItem('aboutGroupData');
        } else {
          const errorText = await response.text();
          results.aboutGroup = { success: false, message: `Failed to migrate About Group data: ${response.status} - ${errorText}` };
        }
      } catch (error) {
        results.aboutGroup = { success: false, message: `Error migrating About Group data: ${error}` };
      }
    }

    // Migrate Philosophy Data
    const philosophyData = localStorage.getItem('philosophyData');
    if (philosophyData) {
      try {
        const data = JSON.parse(philosophyData);
        const backendData = {
          heroTitle: data.title || data.heroTitle || 'Philosophy',
          heroBannerImage: data.bannerImage || data.heroBannerImage || '',
          mainQuote: data.quote || data.mainQuote || '',
          content: data.content || data.description || ''
        };
        
        const response = await fetch(`${API_BASE_URL}/philosophy`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendData),
        });

        if (response.ok) {
          results.philosophy = { success: true, message: 'Philosophy data migrated successfully', data: backendData };
          localStorage.removeItem('philosophyData');
        } else {
          const errorText = await response.text();
          results.philosophy = { success: false, message: `Failed to migrate Philosophy data: ${response.status} - ${errorText}` };
        }
      } catch (error) {
        results.philosophy = { success: false, message: `Error migrating Philosophy data: ${error}` };
      }
    }

    // Migrate Director's Desk Data
    const directorDeskData = localStorage.getItem('directorDeskData');
    if (directorDeskData) {
      try {
        const data = JSON.parse(directorDeskData);
        const backendData = {
          heroTitle: data.title || data.heroTitle || 'Director Desk',
          heroBannerImage: data.bannerImage || data.heroBannerImage || '',
          mainHeading: data.heading || data.mainHeading || '',
          content: data.content || data.description || '',
          staffMembers: data.staffMembers || data.staff || []
        };
        
        const response = await fetch(`${API_BASE_URL}/director-desk`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendData),
        });

        if (response.ok) {
          results.directorDesk = { success: true, message: 'Director Desk data migrated successfully', data: backendData };
          localStorage.removeItem('directorDeskData');
        } else {
          const errorText = await response.text();
          results.directorDesk = { success: false, message: `Failed to migrate Director Desk data: ${response.status} - ${errorText}` };
        }
      } catch (error) {
        results.directorDesk = { success: false, message: `Error migrating Director Desk data: ${error}` };
      }
    }

  } catch (error) {
    console.error('Migration error:', error);
  }

  return results;
}

export function showMigrationResults(results: { [key: string]: MigrationResult }) {
  console.group('📦 LocalStorage to Database Migration Results');
  
  Object.entries(results).forEach(([key, result]) => {
    if (result.success) {
      console.log(`✅ ${key}: ${result.message}`);
    } else {
      console.error(`❌ ${key}: ${result.message}`);
    }
  });
  
  console.groupEnd();
}

// Helper function to check if there's any localStorage data to migrate
export function hasLocalStorageData(): boolean {
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
  
  return keys.some(key => localStorage.getItem(key) !== null);
}