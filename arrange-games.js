const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zzxqmyhrumuzysirvmdt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eHFteWhydW11enlzaXJ2bWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5Mzg4MjgsImV4cCI6MjA4MTUxNDgyOH0.p-5LYV70NYcY3JNEA7NvRpfxMW9DdEPWs-nXU3RVkss';

const supabase = createClient(supabaseUrl, supabaseKey);

async function arrangeAllGames() {
  try {
    console.log('Fetching all games...');
    
    const { data: games, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`Found ${games.length} games`);
    
    // Assign priorities based on current order (newest first gets highest priority)
    for (let i = 0; i < games.length; i++) {
      const priority = games.length - i; // First game gets highest priority
      
      const { error: updateError } = await supabase
        .from('games')
        .update({ priority })
        .eq('id', games[i].id);
      
      if (updateError) {
        console.error(`Error updating ${games[i].title}:`, updateError);
      } else {
        console.log(`✅ ${games[i].title} - Priority: ${priority}`);
      }
    }
    
    console.log('🎉 All games arranged successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

arrangeAllGames();