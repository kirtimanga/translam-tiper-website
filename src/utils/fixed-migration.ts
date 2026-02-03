/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Fixed migration utility that handles all known issues
 * - Data size limits and truncation
 * - Field mapping corrections
 * - Better error handling with detailed logging
 */

import { BASE_URL } from './baseUrl';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || `${BASE_URL}/api`;

interface MigrationResult {
  success: boolean;
  message: string;
  details?: unknown;
  warnings?: string[];
}

function sanitizeForDatabase(data: any): { sanitized: any; warnings: string[] } {
  const warnings: string[] = [];
  const sanitized = JSON.parse(JSON.stringify(data)); // Deep clone
  
  // Check overall data size first
  const initialSize = new Blob([JSON.stringify(sanitized)]).size;
  console.log(`📊 Initial data size: ${(initialSize / 1024).toFixed(2)} KB`);
  
  Object.entries(sanitized).forEach(([key, value]) => {
    // Special handling for image fields - these are now TEXT columns so can handle large data
    const isImageField = key.toLowerCase().includes('image') || key.toLowerCase().includes('banner');
    
    if (typeof value === 'string') {
      if (isImageField) {
        // For image fields, check if it's base64 data
        if (value.startsWith('data:image/')) {
          const sizeKB = (value.length * 0.75) / 1024; // Approximate size after base64 decode
          if (sizeKB > 2048) { // If larger than 2MB
            warnings.push(`Large image detected in ${key}: ${sizeKB.toFixed(0)}KB - consider optimizing`);
          }
          console.log(`🖼️  ${key}: Base64 image (~${sizeKB.toFixed(0)}KB)`);
        } else if (value.length > 500) {
          console.log(`🖼️  ${key}: Long URL/path (${value.length} chars)`);
        }
        // Don't truncate image fields since DB columns are now TEXT
      } else {
        // Handle other large text fields (non-images)
        if (value.length > 20000) {
          const originalLength = value.length;
          sanitized[key] = value.substring(0, 20000) + '... (truncated due to size limits)';
          warnings.push(`Truncated ${key} from ${originalLength} to 20000 characters`);
        }
      }
    }
    
    // Handle large arrays
    if (Array.isArray(value)) {
      if (value.length > 200) {
        sanitized[key] = value.slice(0, 200);
        warnings.push(`Limited ${key} array from ${value.length} to 200 items`);
      }
      
      // Sanitize objects within arrays
      sanitized[key] = value.map((item, index) => {
        if (typeof item === 'object' && item !== null) {
          const cleanItem = { ...item };
          
          // Limit string fields in array objects
          Object.entries(cleanItem).forEach(([itemKey, itemValue]) => {
            if (typeof itemValue === 'string' && itemValue.length > 5000) {
              cleanItem[itemKey] = itemValue.substring(0, 5000) + '...';
            }
          });
          
          return cleanItem;
        }
        return item;
      });
    }
  });
  
  const finalSize = new Blob([JSON.stringify(sanitized)]).size;
  console.log(`📊 Final data size: ${(finalSize / 1024).toFixed(2)} KB`);
  
  return { sanitized, warnings };
}

async function safeMigrate(endpoint: string, data: any): Promise<MigrationResult> {
  try {
    console.log(`\n🔄 Migrating ${endpoint}...`);
    console.log('Original data keys:', Object.keys(data));
    
    // Sanitize data first
    const { sanitized, warnings } = sanitizeForDatabase(data);
    
    // Make the API call
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(sanitized),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ ${endpoint} migrated successfully`);
      
      return {
        success: true,
        message: `Successfully migrated ${endpoint}${warnings.length > 0 ? ' with optimizations' : ''}`,
        details: result,
        warnings
      };
    } else {
      // Get detailed error information
      const errorText = await response.text();
      let errorDetails;
      
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = errorText;
      }
      
      console.error(`❌ ${endpoint} failed:`, response.status, errorDetails);
      
      return {
        success: false,
        message: `Failed to migrate ${endpoint}: ${response.status} - ${typeof errorDetails === 'object' ? errorDetails.error || errorDetails.message : errorDetails}`,
        details: { status: response.status, error: errorDetails },
        warnings
      };
    }
  } catch (error) {
    console.error(`💥 Exception during ${endpoint} migration:`, error);
    return {
      success: false,
      message: `Network/Exception error for ${endpoint}: ${error}`,
    };
  }
}

export async function fixedFullMigration(): Promise<{ [key: string]: MigrationResult }> {
  const results: { [key: string]: MigrationResult } = {};
  
  console.group('🛠️ Fixed Migration Process');

  // Migration definitions with improved field mappings
  const migrations = [
    {
      key: 'outstandingPlacementsData',
      endpoint: '/outstanding-placements',
      resultKey: 'outstandingPlacements',
      transform: (data: any) => {
        // Check multiple possible field names for placements data
        const placementsArray = data.placements || data.students || data.placementData || data.placementList || [];
        
        return {
          heroTitle: data.title || data.heroTitle || 'Outstanding Placements',
          heroBannerImage: data.bannerImage || data.heroBannerImage || '',
          content: data.description || data.content || '',
          placements: Array.isArray(placementsArray) ? placementsArray : []
        };
      }
    },
    {
      key: 'aboutGroupData',
      endpoint: '/about-group',
      resultKey: 'aboutGroup',
      transform: (data: any) => ({
        heroTitle: data.title || data.heroTitle || 'About Us',
        heroBannerImage: data.bannerImage || data.heroBannerImage || '',
        buildingImage: data.buildingImage || '',
        aboutUsTitle: data.aboutTitle || data.aboutUsTitle || 'About Us',
        aboutUsContent: data.aboutContent || data.aboutUsContent || data.description || '',
        visionImage: data.visionImage || '',
        visionTitle: data.visionTitle || 'Vision & Mission',
        visionContent: data.visionContent || data.vision || '',
        missionContent: data.missionContent || data.mission || '',
        aimsImage: data.aimsImage || '',
        aimsTitle: data.aimsTitle || 'Aims & Objectives',
        aimsObjectives: data.aimsObjectives || data.objectives || data.aims || []
      })
    },
    {
      key: 'philosophyData',
      endpoint: '/philosophy',
      resultKey: 'philosophy',
      transform: (data: any) => ({
        heroTitle: data.title || data.heroTitle || 'Philosophy',
        heroBannerImage: data.bannerImage || data.heroBannerImage || '',
        mainQuote: data.quote || data.mainQuote || data.philosophyQuote || '',
        content: data.content || data.description || data.philosophyContent || ''
      })
    },
    {
      key: 'directorDeskData',
      endpoint: '/director-desk',
      resultKey: 'directorDesk',
      transform: (data: any) => ({
        heroTitle: data.title || data.heroTitle || 'Director Desk',
        heroBannerImage: data.bannerImage || data.heroBannerImage || '',
        mainHeading: data.heading || data.mainHeading || data.directorHeading || '',
        content: data.content || data.description || data.directorMessage || '',
        staffMembers: data.staffMembers || data.staff || data.teamMembers || []
      })
    }
  ];

  // Process each migration
  for (const migration of migrations) {
    const rawData = localStorage.getItem(migration.key);
    
    if (!rawData) {
      results[migration.resultKey] = {
        success: true,
        message: `No ${migration.key} found in localStorage`
      };
      continue;
    }

    try {
      console.log(`\n📦 Processing ${migration.key}...`);
      const originalData = JSON.parse(rawData);
      
      // Log original data structure for debugging
      console.log(`Original data structure:`, {
        keys: Object.keys(originalData),
        hasArrays: Object.values(originalData).some(v => Array.isArray(v)),
        arrayFields: Object.entries(originalData)
          .filter(([_, v]) => Array.isArray(v))
          .map(([k, v]) => ({ field: k, length: (v as any[]).length }))
      });
      
      const transformedData = migration.transform(originalData);
      
      // Perform migration
      const result = await safeMigrate(migration.endpoint, transformedData);
      results[migration.resultKey] = result;
      
      // Remove from localStorage if successful
      if (result.success) {
        localStorage.removeItem(migration.key);
        console.log(`🗑️ Removed ${migration.key} from localStorage`);
      }
      
    } catch (parseError) {
      console.error(`❌ Parse error for ${migration.key}:`, parseError);
      results[migration.resultKey] = {
        success: false,
        message: `Failed to parse ${migration.key}: ${parseError}`
      };
    }
  }

  console.groupEnd();
  
  // Log summary
  const successCount = Object.values(results).filter(r => r.success).length;
  const totalCount = Object.keys(results).length;
  console.log(`\n📊 Migration Summary: ${successCount}/${totalCount} successful`);
  
  return results;
}

// Test individual endpoint
export async function testEndpoint(endpoint: string, testData: unknown): Promise<MigrationResult> {
  console.log(`🧪 Testing endpoint: ${endpoint}`);
  return await safeMigrate(endpoint, testData as any);
}

// Get localStorage data for inspection
export function inspectLocalStorageData(): { [key: string]: any } {
  const keys = ['outstandingPlacementsData', 'aboutGroupData', 'philosophyData', 'directorDeskData'];
  const data: { [key: string]: any } = {};
  
  keys.forEach(key => {
    const rawData = localStorage.getItem(key);
    if (rawData) {
      try {
        data[key] = {
          size: (new Blob([rawData]).size / 1024).toFixed(2) + ' KB',
          parsed: JSON.parse(rawData)
        };
      } catch (error) {
        data[key] = { error: `Parse error: ${error}`, raw: rawData.substring(0, 200) + '...' };
      }
    }
  });
  
  return data;
}