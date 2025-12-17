const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { createClient } = require('@supabase/supabase-js');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD_63X6oKFv0TrJpKFLVBta9azbKcZs4Q0",
  authDomain: "kushwant-plays.firebaseapp.com",
  projectId: "kushwant-plays",
  storageBucket: "kushwant-plays.firebasestorage.app",
  messagingSenderId: "257275265481",
  appId: "1:257275265481:web:eebe942139dedde428a818"
};

// Supabase config
const supabaseUrl = 'https://zzxqmyhrumuzysirvmdt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eHFteWhydW11enlzaXJ2bWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5Mzg4MjgsImV4cCI6MjA4MTUxNDgyOH0.p-5LYV70NYcY3JNEA7NvRpfxMW9DdEPWs-nXU3RVkss';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateGames() {
  try {
    console.log('Fetching games from Firebase...');
    const snapshot = await getDocs(collection(db, 'games'));
    const games = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      games.push({
        title: data.title,
        description: data.desc || data.description,
        type: data.type,
        download: data.download,
        img: data.img,
        views: data.views || 0,
        downloads: data.downloads || 0,
        priority: data.priority || 0
      });
    });
    
    console.log(`Found ${games.length} games in Firebase`);
    
    if (games.length > 0) {
      console.log('Inserting games into Supabase...');
      const { data, error } = await supabase
        .from('games')
        .insert(games);
      
      if (error) {
        console.error('Error inserting games:', error);
      } else {
        console.log(`Successfully migrated ${games.length} games to Supabase!`);
      }
    }
    
  } catch (error) {
    console.error('Migration error:', error);
  }
}

migrateGames();