/**
 * Diagnostic tool specifically for Outstanding Placements migration
 */

import { BASE_URL } from './baseUrl';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || `${BASE_URL}/api`;

export async function diagnoseOutstandingPlacements() {
  console.group('🔍 Outstanding Placements Diagnostic');
  
  // 1. Check localStorage data
  const rawData = localStorage.getItem('outstandingPlacementsData');
  console.log('1. localStorage Data:');
  if (rawData) {
    console.log('✅ Found outstandingPlacementsData');
    console.log('Raw data:', rawData);
    try {
      const parsedData = JSON.parse(rawData);
      console.log('✅ Successfully parsed JSON');
      console.log('Parsed data:', parsedData);
      console.log('Data structure:');
      console.log('- title:', parsedData.title);
      console.log('- heroTitle:', parsedData.heroTitle);
      console.log('- description:', parsedData.description);
      console.log('- content:', parsedData.content);
      console.log('- placements:', parsedData.placements);
      console.log('- students:', parsedData.students);
      console.log('- Other keys:', Object.keys(parsedData).filter(k => 
        !['title', 'heroTitle', 'description', 'content', 'placements', 'students'].includes(k)
      ));
    } catch (error) {
      console.error('❌ Failed to parse JSON:', error);
    }
  } else {
    console.log('❌ No outstandingPlacementsData found in localStorage');
  }

  // 2. Test API endpoint
  console.log('\n2. API Endpoint Test:');
  try {
    const testData = {
      heroTitle: 'Test Outstanding Placements',
      content: 'Test content for diagnostics',
      placements: [
        {
          name: 'Test Student',
          company: 'Test Company',
          package: '10 LPA',
          year: '2024'
        }
      ]
    };

    console.log('Testing with data:', testData);
    
    const response = await fetch(`${API_BASE_URL}/outstanding-placements`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('✅ API call successful');
      console.log('Response:', responseData);
    } else {
      const errorText = await response.text();
      console.error('❌ API call failed');
      console.error('Status:', response.status, response.statusText);
      console.error('Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }

  // 3. Check current database state
  console.log('\n3. Current Database State:');
  try {
    const response = await fetch(`${API_BASE_URL}/outstanding-placements`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Current data in database:', data);
    } else {
      console.error('❌ Failed to fetch current data:', response.status);
    }
  } catch (error) {
    console.error('❌ Error fetching data:', error);
  }

  console.groupEnd();
}

export async function testOutstandingPlacementsMigration() {
  console.group('🧪 Outstanding Placements Migration Test');
  
  const rawData = localStorage.getItem('outstandingPlacementsData');
  if (!rawData) {
    console.log('❌ No localStorage data to migrate');
    console.groupEnd();
    return { success: false, message: 'No data found' };
  }

  try {
    const data = JSON.parse(rawData);
    console.log('📦 Original data:', data);

    // Try different mapping strategies
    const mappingStrategies = [
      // Strategy 1: Direct mapping
      {
        name: 'Direct Mapping',
        data: {
          heroTitle: data.title || 'Outstanding Placements',
          content: data.description || '',
          placements: data.placements || []
        }
      },
      // Strategy 2: Alternative field names
      {
        name: 'Alternative Fields',
        data: {
          heroTitle: data.heroTitle || data.title || 'Outstanding Placements',
          content: data.content || data.description || '',
          placements: data.students || data.placements || []
        }
      },
      // Strategy 3: Flexible mapping
      {
        name: 'Flexible Mapping',
        data: {
          heroTitle: data.heroTitle || data.title || data.heading || 'Outstanding Placements',
          content: data.content || data.description || data.desc || '',
          placements: data.placements || data.students || data.achievements || data.records || []
        }
      }
    ];

    for (const strategy of mappingStrategies) {
      console.log(`\n🔄 Trying ${strategy.name}:`);
      console.log('Mapped data:', strategy.data);
      
      try {
        const response = await fetch(`${API_BASE_URL}/outstanding-placements`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(strategy.data),
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ ${strategy.name} successful!`);
          console.log('Result:', result);
          console.groupEnd();
          return { 
            success: true, 
            message: `Migration successful with ${strategy.name}`,
            data: result,
            strategy: strategy.name
          };
        } else {
          const error = await response.text();
          console.log(`❌ ${strategy.name} failed: ${response.status} - ${error}`);
        }
      } catch (error) {
        console.log(`❌ ${strategy.name} error:`, error);
      }
    }

    console.log('❌ All strategies failed');
    console.groupEnd();
    return { success: false, message: 'All mapping strategies failed' };

  } catch (error) {
    console.error('❌ Error during migration test:', error);
    console.groupEnd();
    return { success: false, message: `Error: ${error}` };
  }
}