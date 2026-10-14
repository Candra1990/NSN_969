import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import firebaseConfig from '../firebase-applet-config.json' assert { type: "json" };

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl) {
  console.error('ERROR: VITE_SUPABASE_URL or SUPABASE_URL is missing in environment variables.');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error(`
================================================================================
MIGRATION BLOCKED: MISSING SUPABASE_SERVICE_ROLE_KEY
================================================================================
The migration script requires SUPABASE_SERVICE_ROLE_KEY to perform upsert
operations on Supabase tables protected by Row Level Security (RLS).

Using VITE_SUPABASE_ANON_KEY for migration writes is strictly prohibited as it
triggers RLS policy violations.

Please configure SUPABASE_SERVICE_ROLE_KEY in your environment (.env file or system environment)
and re-run:
  npx tsx scripts/migrate-firestore-to-supabase.ts
================================================================================
`);
  process.exit(1);
}

const fbApp = initializeApp(firebaseConfig);
const dbId = (firebaseConfig as any).firestoreDatabaseId;
const db = dbId 
  ? initializeFirestore(fbApp, { experimentalForceLongPolling: true }, dbId)
  : initializeFirestore(fbApp, { experimentalForceLongPolling: true });

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function migrate() {
  console.log('--- Starting Firestore to Supabase Migration ---');

  // 1. Streamers
  console.log('\n[1/8] Migrating Streamers...');
  try {
    const streamersSnap = await getDocs(collection(db, 'streamers'));
    let streamerCount = 0;
    for (const docSnap of streamersSnap.docs) {
      const data = docSnap.data();
      const { error } = await supabase.from('streamers').upsert({
        id: docSnap.id,
        name: data.name || 'Unnamed Streamer',
        platform: (data.platform || 'youtube').toLowerCase(),
        channel_id: data.channelId || data.channel_id || '',
        youtube_id: data.youtubeId || data.youtube_id || '',
        tiktok_id: data.tiktokId || data.tiktok_id || '',
        photo_url: data.photoUrl || data.photo_url || '',
        avatar: data.photoUrl || data.photo_url || data.avatar || '',
        is_featured: !!(data.isFeatured ?? data.is_featured ?? true),
        category: data.category || 'Streamer',
        status: data.status || 'active',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) console.error(`Error migrating streamer ${docSnap.id}:`, error.message);
      else streamerCount++;
    }
    console.log(`Migrated ${streamerCount}/${streamersSnap.size} streamers.`);
  } catch (err: any) {
    console.error('Failed to read or migrate streamers:', err.message);
  }

  // 2. Tracks
  console.log('\n[2/8] Migrating Tracks...');
  try {
    const tracksSnap = await getDocs(collection(db, 'tracks'));
    let trackCount = 0;
    for (const docSnap of tracksSnap.docs) {
      const data = docSnap.data();
      const { error } = await supabase.from('tracks').upsert({
        id: docSnap.id,
        title: data.title || 'Untitled Track',
        artist: data.artist || 'Unknown Artist',
        url: data.url || '',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) console.error(`Error migrating track ${docSnap.id}:`, error.message);
      else trackCount++;
    }
    console.log(`Migrated ${trackCount}/${tracksSnap.size} tracks.`);
  } catch (err: any) {
    console.error('Failed to read or migrate tracks:', err.message);
  }

  // 3. Gallery
  console.log('\n[3/8] Migrating Gallery...');
  try {
    const gallerySnap = await getDocs(collection(db, 'gallery'));
    let galleryCount = 0;
    for (const docSnap of gallerySnap.docs) {
      const data = docSnap.data();
      const { error } = await supabase.from('gallery').upsert({
        id: docSnap.id,
        title: data.title || 'Untitled Image',
        tag: data.tag || '',
        src: data.src || data.url || '',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) console.error(`Error migrating gallery ${docSnap.id}:`, error.message);
      else galleryCount++;
    }
    console.log(`Migrated ${galleryCount}/${gallerySnap.size} gallery items.`);
  } catch (err: any) {
    console.error('Failed to read or migrate gallery:', err.message);
  }

  // 4. System Settings (community_config/system -> public.system_settings id='global')
  console.log('\n[4/8] Migrating System Settings (community_config/system)...');
  try {
    const sysDocRef = doc(db, 'community_config', 'system');
    const sysSnap = await getDoc(sysDocRef);
    if (sysSnap.exists()) {
      const data = sysSnap.data();
      const { error } = await supabase.from('system_settings').upsert({
        id: 'global',
        announcement_id: data.announcementId || data.announcement_id || '',
        announcement_en: data.announcementEn || data.announcement_en || '',
        announcement_active: !!(data.announcementActive ?? data.announcement_active),
        maintenance_mode: !!(data.maintenanceMode ?? data.maintenance_mode),
        data: data,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) console.error('Error migrating system_settings:', error.message);
      else console.log('Migrated 1/1 system_settings (global).');
    } else {
      console.log('No community_config/system document found in Firestore.');
    }
  } catch (err: any) {
    console.error('Failed to read or migrate system_settings:', err.message);
  }

  // 5. IC Characters
  console.log('\n[5/8] Migrating IC Characters...');
  try {
    const charsSnap = await getDocs(collection(db, 'ic_characters'));
    let charCount = 0;
    for (const docSnap of charsSnap.docs) {
      const data = docSnap.data();
      const { error } = await supabase.from('ic_characters').upsert({
        id: docSnap.id,
        name: data.characterName || data.name || 'Unnamed Character',
        player_name: data.characterAlias || data.memberName || '',
        avatar: data.characterImage || data.avatar || '',
        role: data.role || 'Civilian',
        occupation: data.occupation || 'Unemployed',
        age: data.age || 21,
        bio: data.background || data.bio || '',
        status: data.status || 'Active',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) console.error(`Error migrating IC character ${docSnap.id}:`, error.message);
      else charCount++;
    }
    console.log(`Migrated ${charCount}/${charsSnap.size} IC characters.`);
  } catch (err: any) {
    console.warn('[BLOCKED] Cannot read ic_characters from Firestore:', err.message);
  }

  // 6. Community Categories
  console.log('\n[6/8] Migrating Community Categories...');
  try {
    const catSnap = await getDocs(collection(db, 'community_categories'));
    let catCount = 0;
    for (const docSnap of catSnap.docs) {
      const data = docSnap.data();
      const { error } = await supabase.from('community_categories').upsert({
        id: docSnap.id,
        name: data.name || 'Category',
        position: data.position || 0,
        is_collapsed: !(data.isVisible ?? true),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) console.error(`Error migrating category ${docSnap.id}:`, error.message);
      else catCount++;
    }
    console.log(`Migrated ${catCount}/${catSnap.size} categories.`);
  } catch (err: any) {
    console.warn('[BLOCKED] Cannot read community_categories from Firestore:', err.message);
  }

  // 7. Community Channels
  console.log('\n[7/8] Migrating Community Channels...');
  try {
    const chanSnap = await getDocs(collection(db, 'community_channels'));
    let chanCount = 0;
    for (const docSnap of chanSnap.docs) {
      const data = docSnap.data();
      const catId = data.categoryId || 'cat_community';

      const { error } = await supabase.from('community_channels').upsert({
        id: docSnap.id,
        category_id: catId,
        name: data.name || docSnap.id,
        description: data.description || '',
        type: data.type || 'text',
        position: data.position || 0,
        admin_only: !!data.adminOnly,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) console.error(`Error migrating channel ${docSnap.id}:`, error.message);
      else chanCount++;
    }
    console.log(`Migrated ${chanCount}/${chanSnap.size} channels.`);
  } catch (err: any) {
    console.error('Failed to read or migrate channels:', err.message);
  }

  // 8. Community Messages
  console.log('\n[8/8] Migrating Community Messages...');
  try {
    const msgSnap = await getDocs(collection(db, 'community_messages'));
    let msgCount = 0;
    for (const docSnap of msgSnap.docs) {
      const data = docSnap.data();
      const { error } = await supabase.from('community_messages').upsert({
        id: docSnap.id,
        channel_id: data.channelId || 'general',
        user_id: data.userId || 'guest',
        user_name: data.userName || 'Member',
        user_avatar: data.userAvatar || '',
        content: data.content || '',
        is_pinned: !!data.isPinned,
        created_at: data.createdAt || new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) console.error(`Error migrating message ${docSnap.id}:`, error.message);
      else msgCount++;
    }
    console.log(`Migrated ${msgCount}/${msgSnap.size} messages.`);
  } catch (err: any) {
    console.warn('[BLOCKED] Cannot read community_messages from Firestore:', err.message);
  }

  console.log('\n--- Migration Run Completed ---');
}

migrate().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});


