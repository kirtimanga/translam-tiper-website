/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Advanced debugging tool for migration errors
 * Captures exact data being sent and detailed error responses
 */

import { BASE_URL } from './baseUrl';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || `${BASE_URL}/api`;

interface DetailedError {
  endpoint: string;
  data: any;
  error: string;
  statusCode: number;
  timestamp: string;
}

export async function debugMigrationErrors(): Promise<DetailedError[]> {
  const errors: DetailedError[] = [];
  
  console.group('🔍 Migration Error Debug');
  
  // Check each localStorage item and test migration
  const migrations = [
    {
      key: 'outstandingPlacementsData',
      endpoint: '/outstanding-placements',
      transform: (data: any) => ({
        heroTitle: data.title || data.heroTitle || 'Outstanding Placements',
        content: data.description || data.content || '',
        placements: data.placements || data.students || []
      })
    },
    {
      key: 'aboutGroupData',
      endpoint: '/about-group',
      transform: (data: any) => ({
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
      })
    },
    {
      key: 'philosophyData',
      endpoint: '/philosophy',
      transform: (data: any) => ({
        heroTitle: data.title || data.heroTitle || 'Philosophy',
        heroBannerImage: data.bannerImage || data.heroBannerImage || '',
        mainQuote: data.quote || data.mainQuote || '',
        content: data.content || data.description || ''
      })
    },
    {
      key: 'directorDeskData',
      endpoint: '/director-desk',
      transform: (data: any) => ({
        heroTitle: data.title || data.heroTitle || 'Director Desk',
        heroBannerImage: data.bannerImage || data.heroBannerImage || '',
        mainHeading: data.heading || data.mainHeading || '',
        content: data.content || data.description || '',
        staffMembers: data.staffMembers || data.staff || []
      })
    }
  ];

  for (const migration of migrations) {
    console.log(`\n🔧 Testing ${migration.key}...`);
    
    const rawData = localStorage.getItem(migration.key);
    if (!rawData) {
      console.log(`⚪ No ${migration.key} found`);
      continue;
    }

    try {
      const originalData = JSON.parse(rawData);
      console.log(`📦 Original data:`, originalData);
      
      const transformedData = migration.transform(originalData);
      console.log(`🔄 Transformed data:`, transformedData);
      
      // Check data size
      const dataSize = new Blob([JSON.stringify(transformedData)]).size;
      console.log(`📊 Data size: ${(dataSize / 1024).toFixed(2)} KB`);
      
      // Test API call
      const response = await fetch(`${API_BASE_URL}${migration.endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ ${migration.key} failed: ${response.status}`);
        console.error(`Error details:`, errorText);
        
        errors.push({
          endpoint: migration.endpoint,
          data: transformedData,
          error: errorText,
          statusCode: response.status,
          timestamp: new Date().toISOString()
        });
      } else {
        const result = await response.json();
        console.log(`✅ ${migration.key} success:`, result);
      }

    } catch (parseError) {
      console.error(`❌ ${migration.key} parse error:`, parseError);
      errors.push({
        endpoint: migration.endpoint,
        data: null,
        error: `Parse error: ${parseError}`,
        statusCode: 0,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  console.groupEnd();
  return errors;
}

export async function debugDataStructures(): Promise<void> {
  console.group('🔍 Data Structure Analysis');
  
  const keys = [
    'outstandingPlacementsData',
    'aboutGroupData',
    'philosophyData',
    'directorDeskData'
  ];

  keys.forEach(key => {
    const rawData = localStorage.getItem(key);
    if (rawData) {
      console.log(`\n📋 ${key}:`);
      console.log(`Raw size: ${(new Blob([rawData]).size / 1024).toFixed(2)} KB`);
      
      try {
        const data = JSON.parse(rawData);
        console.log(`Structure:`, {
          keys: Object.keys(data),
          title: data.title || data.heroTitle || 'N/A',
          description: data.description || data.content || 'N/A',
          hasArrays: Object.values(data).some(v => Array.isArray(v)),
          arrayFields: Object.entries(data)
            .filter(([_, v]) => Array.isArray(v))
            .map(([k, v]) => `${k}(${(v as any[]).length})`),
          sampleFields: Object.fromEntries(
            Object.entries(data)
              .slice(0, 3)
              .map(([k, v]) => [k, typeof v === 'string' ? v.substring(0, 50) + '...' : v])
          )
        });
        
        // Check for potential problematic fields
        Object.entries(data).forEach(([fieldKey, fieldValue]) => {
          if (typeof fieldValue === 'string' && fieldValue.length > 10000) {
            console.warn(`⚠️ Large string field: ${fieldKey} (${fieldValue.length} chars)`);
          }
          if (Array.isArray(fieldValue) && fieldValue.length > 100) {
            console.warn(`⚠️ Large array field: ${fieldKey} (${fieldValue.length} items)`);
          }
        });
        
      } catch (error) {
        console.error(`❌ Parse error:`, error);
      }
    }
  });
  
  console.groupEnd();
}

export function createSafeData(originalData: any, maxSize: number = 50000): any {
  const dataString = JSON.stringify(originalData);
  
  if (new Blob([dataString]).size <= maxSize) {
    return originalData; // Data is already safe
  }
  
  console.log('🔧 Data too large, creating safe version...');
  
  const safeData = { ...originalData };
  
  // Compress arrays
  Object.entries(safeData).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 20) {
      console.log(`📉 Reducing ${key} from ${value.length} to 20 items`);
      safeData[key] = value.slice(0, 20);
    }
    
    // Truncate long strings
    if (typeof value === 'string' && value.length > 5000) {
      console.log(`✂️ Truncating ${key} from ${value.length} to 5000 chars`);
      safeData[key] = value.substring(0, 5000) + '... (truncated)';
    }
  });
  
  return safeData;
}