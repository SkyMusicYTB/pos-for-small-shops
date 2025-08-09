const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n');
  
  const urls = [
    'http://localhost:54321',
    'http://localhost:8000', 
    'http://127.0.0.1:54321',
    'http://127.0.0.1:8000'
  ];
  
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
  
  for (const url of urls) {
    console.log(`Testing: ${url}`);
    
    try {
      const supabase = createClient(url, serviceRoleKey);
      
      // Test 1: Basic connection
      const { data, error } = await supabase
        .from('business')
        .select('count(*)')
        .limit(1);
      
      if (!error) {
        console.log(`✅ SUCCESS: ${url} is working!`);
        console.log(`   Data:`, data);
        
        // Test 2: Try to create a test record
        console.log(`   Testing write permissions...`);
        const { data: testData, error: testError } = await supabase
          .from('business')
          .insert({ name: 'Test Business', currency: 'USD', timezone: 'UTC' })
          .select();
        
        if (!testError) {
          console.log(`   ✅ Write test successful!`);
          
          // Clean up
          if (testData && testData[0]) {
            await supabase.from('business').delete().eq('id', testData[0].id);
            console.log(`   🧹 Cleaned up test record`);
          }
        } else {
          console.log(`   ❌ Write test failed:`, testError.message);
        }
        
        return url; // Return working URL
      } else {
        console.log(`   ❌ Failed:`, error.message);
      }
    } catch (err) {
      console.log(`   ❌ Connection failed:`, err.message);
    }
    
    console.log('');
  }
  
  console.log('❌ No working Supabase URL found!');
  console.log('\n💡 Troubleshooting:');
  console.log('1. Make sure Supabase is running locally');
  console.log('2. Check your Supabase Studio URL');
  console.log('3. Run: supabase start (if using Supabase CLI)');
  console.log('4. Or check your Docker containers if using Docker');
  
  return null;
}

testConnection().then(workingUrl => {
  if (workingUrl) {
    console.log(`\n🎯 Update your .env file:`);
    console.log(`SUPABASE_URL=${workingUrl}`);
  }
  process.exit(0);
}).catch(console.error);