// Debug script to check localStorage data
// Run this in the browser console on the admin page

console.log('=== localStorage Debug ===');

const keys = [
  'ourSuccessData',
  'ourInstitutionsData', 
  'ourRecruitersData',
  'testimonialData',
  'whyChooseUsData',
  'outstandingPlacementsData'
];

keys.forEach(key => {
  const data = localStorage.getItem(key);
  if (data) {
    console.log(`\n${key}:`);
    try {
      const parsed = JSON.parse(data);
      console.log(parsed);
    } catch (e) {
      console.log('Failed to parse:', data);
    }
  } else {
    console.log(`\n${key}: NOT FOUND`);
  }
});

console.log('\n=== End Debug ===');