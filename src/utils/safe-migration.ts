/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Safe migration utility that handles data size limits and structure issues
 */

import { BASE_URL } from './baseUrl';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || `${BASE_URL}/api`;

interface SafeMigrationResult {
  success: boolean;
  message: string;
  data?: unknown;
  warnings?: string[];
}

function sanitizeData(data: any, maxStringLength = 5000, maxArrayLength = 50): any {
  if (!data) return data;
  
  const warnings: string[] = [];
  const sanitized = { ...data };
  
  Object.entries(sanitized).forEach(([key, value]) => {
    // Handle long strings
    if (typeof value === 'string' && value.length > maxStringLength) {
      warnings.push(`Truncated ${key} from ${value.length} to ${maxStringLength} characters`);
      sanitized[key] = value.substring(0, maxStringLength) + '... (truncated for database size limits)';
    }
    
    // Handle large arrays
    if (Array.isArray(value) && value.length > maxArrayLength) {
      warnings.push(`Reduced ${key} from ${value.length} to ${maxArrayLength} items`);
      sanitized[key] = value.slice(0, maxArrayLength);
    }
    
    // Handle nested objects in arrays
    if (Array.isArray(value)) {
      sanitized[key] = value.map((item, index) => {
        if (typeof item === 'object' && item !== null) {
          const sanitizedItem = { ...item };
          Object.entries(sanitizedItem).forEach(([itemKey, itemValue]) => {
            if (typeof itemValue === 'string' && itemValue.length > 1000) {
              sanitizedItem[itemKey] = itemValue.substring(0, 1000) + '...';
            }
          });
          return sanitizedItem;
        }
        return item;
      });
    }
  });
  
  return { sanitized, warnings };
}

async function safeMigrate(endpoint: string, data: any, method = 'PUT'): Promise<SafeMigrationResult> {
  try {
    // First, sanitize the data
    const { sanitized, warnings } = sanitizeData(data);
    
    // Check final size
    const finalSize = new Blob([JSON.stringify(sanitized)]).size;
    console.log(`📊 Final data size for ${endpoint}: ${(finalSize / 1024).toFixed(2)} KB`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitized),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        message: `Successfully migrated ${endpoint}${warnings.length > 0 ? ' (with data optimization)' : ''}`,
        data: result,
        warnings
      };
    } else {
      const errorText = await response.text();
      console.error(`❌ ${endpoint} failed:`, response.status, errorText);
      
      return {
        success: false,
        message: `Failed to migrate ${endpoint}: ${response.status} - ${errorText}`,
        warnings
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error migrating ${endpoint}: ${error}`,
    };
  }
}

export async function safeFullMigration(): Promise<{ [key: string]: SafeMigrationResult }> {
  const results: { [key: string]: SafeMigrationResult } = {};

  console.group('🛡️ Safe Migration Process');

  // 1. Outstanding Placements
  const outstandingData = localStorage.getItem('outstandingPlacementsData');
  if (outstandingData) {
    try {
      const data = JSON.parse(outstandingData);
      const transformedData = {
        heroTitle: data.title || data.heroTitle || 'Outstanding Placements',
        content: data.description || data.content || '',
        placements: data.placements || data.students || []
      };
      
      results.outstandingPlacements = await safeMigrate('/outstanding-placements', transformedData);
      if (results.outstandingPlacements.success) {
        localStorage.removeItem('outstandingPlacementsData');
      }
    } catch (error) {
      results.outstandingPlacements = { success: false, message: `Parse error: ${error}` };
    }
  } else {
    results.outstandingPlacements = { success: true, message: 'No Outstanding Placements data to migrate' };
  }

  // 2. About Group
  const aboutData = localStorage.getItem('aboutGroupData');
  if (aboutData) {
    try {
      const data = JSON.parse(aboutData);
      const transformedData = {
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
      
      results.aboutGroup = await safeMigrate('/about-group', transformedData);
      if (results.aboutGroup.success) {
        localStorage.removeItem('aboutGroupData');
      }
    } catch (error) {
      results.aboutGroup = { success: false, message: `Parse error: ${error}` };
    }
  } else {
    results.aboutGroup = { success: true, message: 'No About Group data to migrate' };
  }

  // 3. Philosophy
  const philosophyData = localStorage.getItem('philosophyData');
  if (philosophyData) {
    try {
      const data = JSON.parse(philosophyData);
      const transformedData = {
        heroTitle: data.title || data.heroTitle || 'Philosophy',
        heroBannerImage: data.bannerImage || data.heroBannerImage || '',
        mainQuote: data.quote || data.mainQuote || '',
        content: data.content || data.description || ''
      };
      
      results.philosophy = await safeMigrate('/philosophy', transformedData);
      if (results.philosophy.success) {
        localStorage.removeItem('philosophyData');
      }
    } catch (error) {
      results.philosophy = { success: false, message: `Parse error: ${error}` };
    }
  } else {
    results.philosophy = { success: true, message: 'No Philosophy data to migrate' };
  }

  // 4. Director's Desk
  const directorData = localStorage.getItem('directorDeskData');
  if (directorData) {
    try {
      const data = JSON.parse(directorData);
      const transformedData = {
        heroTitle: data.title || data.heroTitle || 'Director Desk',
        heroBannerImage: data.bannerImage || data.heroBannerImage || '',
        mainHeading: data.heading || data.mainHeading || '',
        content: data.content || data.description || '',
        staffMembers: data.staffMembers || data.staff || []
      };
      
      results.directorDesk = await safeMigrate('/director-desk', transformedData);
      if (results.directorDesk.success) {
        localStorage.removeItem('directorDeskData');
      }
    } catch (error) {
      results.directorDesk = { success: false, message: `Parse error: ${error}` };
    }
  } else {
    results.directorDesk = { success: true, message: 'No Director Desk data to migrate' };
  }

  // 5. Our Success (for completeness)
  const successData = localStorage.getItem('ourSuccessData');
  if (successData) {
    try {
      const data = JSON.parse(successData);
      const transformedData = {
        heroTitle: data.title || 'Our Success',
        content: data.description || '',
        successStories: data.stats ? [data.stats] : []
      };
      
      results.ourSuccess = await safeMigrate('/our-success', transformedData);
      if (results.ourSuccess.success) {
        localStorage.removeItem('ourSuccessData');
      }
    } catch (error) {
      results.ourSuccess = { success: false, message: `Parse error: ${error}` };
    }
  } else {
    results.ourSuccess = { success: true, message: 'No Our Success data to migrate' };
  }

  // 6. Other sections (Our Institutions, Recruiters, etc.)
  const otherSections = [
    { key: 'ourInstitutionsData', endpoint: '/our-institutions', transform: (data: any) => ({
      heroTitle: data.title || 'Our Institutions',
      content: data.description || '',
      institutions: data.institutions || []
    })},
    { key: 'ourRecruitersData', endpoint: '/our-recruiters', transform: (data: any) => ({
      heroTitle: data.title || 'Our Recruiters',
      content: data.description || '',
      recruiters: data.recruiters || []
    })},
    { key: 'whyChooseUsData', endpoint: '/why-choose-us', transform: (data: any) => ({
      heroTitle: data.title || 'Why Choose Us',
      content: data.description || '',
      points: data.reasons || data.points || []
    })}
  ];

  for (const section of otherSections) {
    const rawData = localStorage.getItem(section.key);
    if (rawData) {
      try {
        const data = JSON.parse(rawData);
        const transformedData = section.transform(data);
        
        const resultKey = section.key.replace('Data', '').replace('our', '').toLowerCase();
        results[resultKey] = await safeMigrate(section.endpoint, transformedData);
        
        if (results[resultKey].success) {
          localStorage.removeItem(section.key);
        }
      } catch (error) {
        const resultKey = section.key.replace('Data', '').replace('our', '').toLowerCase();
        results[resultKey] = { success: false, message: `Parse error: ${error}` };
      }
    }
  }

  // 7. Testimonials (special handling for POST)
  const testimonialData = localStorage.getItem('testimonialData');
  if (testimonialData) {
    try {
      const data = JSON.parse(testimonialData);
      if (data.testimonials && Array.isArray(data.testimonials)) {
        let successCount = 0;
        const warnings: string[] = [];
        
        // Limit testimonials to prevent overwhelming the database
        const testimonialsToMigrate = data.testimonials.slice(0, 20);
        if (data.testimonials.length > 20) {
          warnings.push(`Limited testimonials from ${data.testimonials.length} to 20 for migration`);
        }
        
        for (const testimonial of testimonialsToMigrate) {
          const backendTestimonial = {
            name: testimonial.name || '',
            role: testimonial.role || 'Student',
            company: testimonial.company || '',
            image: testimonial.image || '',
            content: (testimonial.text || testimonial.content || '').substring(0, 1000), // Limit content size
            rating: testimonial.stars || testimonial.rating || 5,
            isActive: testimonial.isActive !== undefined ? testimonial.isActive : true
          };
          
          try {
            const result = await safeMigrate('/testimonials', backendTestimonial, 'POST');
            if (result.success) successCount++;
          } catch (error) {
            console.error(`Failed to migrate testimonial: ${testimonial.name}`, error);
          }
        }
        
        results.testimonials = {
          success: true,
          message: `${successCount} testimonials migrated successfully`,
          warnings
        };
        localStorage.removeItem('testimonialData');
      }
    } catch (error) {
      results.testimonials = { success: false, message: `Parse error: ${error}` };
    }
  } else {
    results.testimonials = { success: true, message: 'No Testimonial data to migrate' };
  }

  console.groupEnd();
  return results;
}