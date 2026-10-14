import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/types';

export interface Dictionary {
  navbar: {
    home: string;
    multiView: string;
    admin: string;
    login: string;
    logout: string;
  };
  home: {
    heroOrderOf: string;
    heroTitle: string;
    heroSubtitle: string;
    motto: string;
    heroPremiumTag: string;
    featuredStreamers: string;
    historyTitle: string;
    historyText: string;
    announcement: string;
    streamStatus: string;
    aboutUs: string;
    learnMore: string;
    membersCount: string;
    activeTitle: string;
    familyMembersTitle: string;
    familyMembersSubtitle: string;
    watchMultiview: string;
    meetTheFamily: string;
    watchLive: string;
    streamClient: string;
    soundNodeOnline: string;
  };
  multiview: {
    title: string;
    subtitle: string;
    addStream: string;
    placeholderName: string;
    placeholderHandle: string;
    choosePlatform: string;
    buttonAdd: string;
    presetTitle: string;
    gridSettings: string;
    noStreamsSelected: string;
    clearAll: string;
    unmuteAll: string;
    muteAll: string;
    backToPreset: string;
    activeStreams: string;
    hideSettings: string;
    showSettings: string;
    hide: string;
    add: string;
    addLink: string;
    size: string;
    opacity: string;
    bgOpacity: string;
    noChatSupport: string;
    monitorSubtitle: string;
    commandDeckUnoccupied: string;
    commandDeckSubtitle: string;
  };
  admin: {
    panelTitle: string;
    manageStreamers: string;
    managePlaylist: string;
    configSettings: string;
    announcementLabel: string;
    maintenanceModeLabel: string;
    buttonSave: string;
    streamerName: string;
    streamerHandle: string;
    addStreamerButton: string;
    trackTitle: string;
    trackArtist: string;
    trackUrl: string;
    addTrackButton: string;
    activeAlerts: string;
    dangerZone: string;
    saveSuccess: string;
  };
  login: {
    title: string;
    placeholderEmail: string;
    placeholderPassword: string;
    buttonLogin: string;
    errorText: string;
    loggingIn: string;
  };
  streamer: {
    live: string;
    watchLive: string;
    youtube: string;
  };
}

const dictionaries: Record<Language, Dictionary> = {
  en: {
    navbar: {
      home: 'Dashboard',
      multiView: 'Multiview',
      admin: 'HQ Admin',
      login: 'Sign In',
      logout: 'Disconnect',
    },
    home: {
      heroOrderOf: 'By Official Decree of',
      heroTitle: 'NSN969 SYNDICATE',
      heroSubtitle: 'Loyalty is our currency. Brotherhood is our foundation. Broadcasting without compromise.',
      motto: 'Loyalty is our currency. Brotherhood is our foundation. Broadcasting without compromise.',
      heroPremiumTag: 'Elite Roleplay Broadcasting Network',
      featuredStreamers: 'Active Broadcasters',
      historyTitle: 'The Legend of NSN969',
      historyText: 'NSN969 is a gaming guild and entertainment circle driven by camaraderie, deep humor, and absolute loyalty. What started as an exclusive group has evolved into a powerhouse stream collective, housing high-action players, variety creators, and top community icons. Guided by our values, we construct standard-defying digital spaces together.',
      announcement: 'Alert Terminal Dispatch',
      streamStatus: 'Live Dispatch Control',
      aboutUs: 'Our Chronicle',
      learnMore: 'Read Chronicle',
      membersCount: 'Elite Members',
      activeTitle: 'Command Room',
      familyMembersTitle: 'The Family Members',
      familyMembersSubtitle: 'Watch the live perspectives of every NSN969 family member. Choose your POV, view their specialized role, or watch them all at once in Multi-View.',
      watchMultiview: 'Watch Multiview',
      meetTheFamily: 'Meet the Family',
      watchLive: 'Watch Live',
      streamClient: 'STREAM CLIENT',
      soundNodeOnline: 'Sound node online',
    },
    multiview: {
      title: 'Family Multiview',
      subtitle: 'Simultaneously process up to 6 video streams. Balance sound nodes, structure custom aspect grids, and direct the feed.',
      addStream: 'Inject Custom Broadcast Feed',
      placeholderName: 'Stream Name (e.g., NSN969 Gamer)',
      placeholderHandle: 'Username or Video Link',
      choosePlatform: 'Network Service',
      buttonAdd: 'Inject Feed',
      presetTitle: 'Family Hot-Link Presets',
      gridSettings: 'Grid Synchronization Layout',
      noStreamsSelected: 'No active video nodes connected. Initialize family hotlinks or inject custom channels below to light up the grid!',
      clearAll: 'Wipe Interface',
      unmuteAll: 'Unmute All',
      muteAll: 'Silence All Nodes',
      backToPreset: 'Restore Preloads',
      activeStreams: 'Active Streams',
      hideSettings: 'Hide Settings',
      showSettings: 'Show Settings',
      hide: 'Hide',
      add: 'Add',
      addLink: 'Add Link',
      size: 'Size',
      opacity: 'Opacity',
      bgOpacity: 'Chat Text Opacity',
      noChatSupport: 'No Chat Support',
      monitorSubtitle: 'Monitor multiple family perspectives simultaneously.',
      commandDeckUnoccupied: 'Command Deck Unoccupied',
      commandDeckSubtitle: 'No media livestream stations currently occupied in the multiwatch canvas grid. Toggle any streamer capsules above to populate the screen instantly!',
    },
    admin: {
      panelTitle: 'NSN969 HQ Command Deck',
      manageStreamers: 'Fams Custom Broadcast Streams',
      managePlaylist: 'Backsound Soundtrack Database',
      configSettings: 'Global Alert & System Modifiers',
      announcementLabel: 'Global Triage Warning text (Multi-Language)',
      maintenanceModeLabel: 'Lockdown Maintenance Protocol (Shields Up)',
      buttonSave: 'Commit Changes',
      streamerName: 'Broadcaster Handle Label',
      streamerHandle: 'Channel Username / String Indicator',
      addStreamerButton: 'Authorize Broadcaster',
      trackTitle: 'Song/Soundtrack Title',
      trackArtist: 'Artist / Synthesizer Host',
      trackUrl: 'Direct Audio Source URL (MP3/Link)',
      addTrackButton: 'Insert Ambient Node',
      activeAlerts: 'Siren Systems Settings',
      dangerZone: 'Critical Operations Panel',
      saveSuccess: 'Configuration changes committed perfectly!',
    },
    login: {
      title: 'Command Gate Authentication',
      placeholderEmail: 'Operator Email',
      placeholderPassword: 'Security Passcode (Token)',
      buttonLogin: 'Verify Credentials',
      errorText: 'Authentication Token Denied',
      loggingIn: 'Decrypting Security Blocks...',
    },
    streamer: {
      live: 'LIVE',
      watchLive: 'Watch Live',
      youtube: 'YouTube',
    },
  },
  id: {
    navbar: {
      home: 'Beranda',
      multiView: 'Multiview',
      admin: 'Panel Admin',
      login: 'Masuk Admin',
      logout: 'Keluar',
    },
    home: {
      heroOrderOf: 'Wilayah Eksklusif Milik',
      heroTitle: 'SINDIKAT NSN969',
      heroSubtitle: 'Loyalitas adalah mata uang kami. Persaudaraan adalah fondasi kami. Mengudara tanpa kompromi.',
      motto: 'Loyalitas adalah mata uang kami. Persaudaraan adalah fondasi kami. Mengudara tanpa kompromi.',
      heroPremiumTag: 'Jaringan Siaran Roleplay Elit',
      featuredStreamers: 'Penyiar Aktif',
      historyTitle: 'Legenda Sejarah NSN969',
      historyText: 'NSN969 adalah perkumpulan gaming legendaris dan lingkar hiburan yang digerakkan oleh persahabatan sejati, humor mendalam, dan loyalitas tanpa syarat. Bermula dari klan tertutup, kini kami berkembang menjadi kolektif stream terkemuka yang menampung jagoan aksi, kreator variasi, dan ikon komunitas top. Dipandu nilai-nilai kami, kami membangun ruang hiburan digital bersama.',
      announcement: 'Pengumuman Terminal Penting',
      streamStatus: 'Kontrol Siaran Langsung',
      aboutUs: 'Kronik Kami',
      learnMore: 'Baca Sejarah',
      membersCount: 'Anggota Elit',
      activeTitle: 'Ruang Komando',
      familyMembersTitle: 'Anggota Keluarga',
      familyMembersSubtitle: 'Tonton sudut pandang langsung dari setiap anggota keluarga NSN969. Pilih POV Anda, lihat jabatan khusus mereka, atau tonton semuanya sekaligus di Multi-View.',
      watchMultiview: 'Tonton Multiview',
      meetTheFamily: 'Kenali Keluarga',
      watchLive: 'Tonton Langsung',
      streamClient: 'KLIEN STREAM',
      soundNodeOnline: 'Node suara aktif',
    },
    multiview: {
      title: 'Multiview Keluarga',
      subtitle: 'Proses hingga 6 aliran video sekaligus. Seimbangkan node suara, atur grid aspek kustom, dan arahkan siaran langsung.',
      addStream: 'Suntikkan Aliran Siaran Kustom',
      placeholderName: 'Nama Siaran (contoh: NSN969 Gamer)',
      placeholderHandle: 'Username atau Tautan Video',
      choosePlatform: 'Layanan Jaringan',
      buttonAdd: 'Suntikkan Siaran',
      presetTitle: 'Preset Tautan-Cepat Keluarga',
      gridSettings: 'Layout Sinkronisasi Grid',
      noStreamsSelected: 'Tidak ada siaran aktif terhubung. Pilih tombol anggota keluarga di bawah atau tambahkan saluran kustom Anda!',
      clearAll: 'Bersihkan Layar',
      unmuteAll: 'Aktifkan Semua Suara',
      muteAll: 'Senyapkan Semua Node',
      backToPreset: 'Kembalikan Preset Default',
      activeStreams: 'Siaran Aktif',
      hideSettings: 'Sembunyikan Pengaturan',
      showSettings: 'Tampilkan Pengaturan',
      hide: 'Sembunyikan',
      add: 'Tambah',
      addLink: 'Tambah Link',
      size: 'Ukuran',
      opacity: 'Transparansi',
      bgOpacity: 'Transparansi Teks Chat',
      noChatSupport: 'Tidak Ada Chat',
      monitorSubtitle: 'Pantau beberapa sudut pandang keluarga secara bersamaan.',
      commandDeckUnoccupied: 'Dek Komando Kosong',
      commandDeckSubtitle: 'Tidak ada stasiun siaran langsung media yang ditempati di grid kanvas saat ini. Klik tombol anggota keluarga di atas untuk langsung mengisi layar!',
    },
    admin: {
      panelTitle: 'Dek Komando NSN969 HQ',
      manageStreamers: 'Daftar Siaran Kustom Fams',
      managePlaylist: 'Database Musik Latar Belakang',
      configSettings: 'Sistem Global & Peringatan',
      announcementLabel: 'Teks Pengumuman Global (Multi-Bahasa)',
      maintenanceModeLabel: 'Protokol Karantina Situs (Mode Pemeliharaan)',
      buttonSave: 'Terapkan Perubahan',
      streamerName: 'Nama Panggilan Streamer',
      streamerHandle: 'Username Channel / Indikator String',
      addStreamerButton: 'Otorisasi Streamer',
      trackTitle: 'Judul Lagu / Musik',
      trackArtist: 'Artis / Komposer Musik',
      trackUrl: 'Tautan Sumber Audio Langsung (MP3/Link)',
      addTrackButton: 'Masukkan Node Ambient Baru',
      activeAlerts: 'Pengaturan Sistem Sirene',
      dangerZone: 'Panel Operasi Kritis',
      saveSuccess: 'Konfigurasi perubahan berhasil diterapkan!',
    },
    login: {
      title: 'Autentikasi Gerbang Komando',
      placeholderEmail: 'Email Operator',
      placeholderPassword: 'Sandi Keamanan (Token)',
      buttonLogin: 'Verifikasi Kredensial',
      errorText: 'Token Autentikasi Ditolak',
      loggingIn: 'Mendekripsi Blok Keamanan...',
    },
    streamer: {
      live: 'SIARAN LANGSUNG',
      watchLive: 'Tonton Langsung',
      youtube: 'YouTube',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dict: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('cougan_language') as Language;
    return saved === 'id' || saved === 'en' ? saved : 'id'; // default to id since it's history-themed
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('cougan_language', lang);
  };

  const dict = dictionaries[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dict }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
