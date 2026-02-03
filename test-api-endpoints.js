#!/usr/bin/env node

// Simple script to test all API endpoints and verify data flow

const endpoints = [
  'our-success',
  'our-institutions', 
  'our-recruiters',
  'testimonials',
  'why-choose-us',
  'outstanding-placements',
  'home-sliders',
  'about-group',
  'philosophy',
  'director-desk'
];

async function testEndpoint(endpoint) {
  try {
    const response = await fetch(`http://localhost:4000/api/${endpoint}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${endpoint}: OK`);
      
      if (Array.isArray(data)) {
        console.log(`   📊 Count: ${data.length} items`);
        if (data.length > 0) {
          console.log(`   🔍 Sample:`, Object.keys(data[0]).slice(0, 3).join(', '));
        }
      } else {
        const keys = Object.keys(data);
        console.log(`   🔍 Fields: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
      }
    } else {
      console.log(`❌ ${endpoint}: ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ ${endpoint}: ERROR - ${error.message}`);
  }
}

async function testAllEndpoints() {
  console.log('🧪 Testing API Endpoints...\n');
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    console.log('');
  }
  
  console.log('✅ Test completed');
}

testAllEndpoints();