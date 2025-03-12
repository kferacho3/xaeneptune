export interface Track {
    id: number;
    title: string;
    duration: string; // e.g. "3:45"
    mp3: string;
    cover?: string;
    isXaeNeptuneTrack: boolean;
    beatType?: string;
  }
  
  export interface Album {
    id: number;
    title: string;
    cover: string;
    releaseDate: string;
    description: string;
    discography: string;
    tracks: Track[];
  }
  
  export interface Artist {
    id: number;
    name: string;
    bio: string;
    generalDiscography: string;
    albums: Album[];
  }
  
  export const artists: Artist[] = [
    {
      id: 1,
      name: "Artist One",
      bio: "A pioneering artist in futuristic sounds.",
      generalDiscography: "General discography information for Artist One.",
      albums: [
        {
          id: 101,
          title: "The Dawn of Beats",
          cover: "https://source.unsplash.com/random/800x600/?album,beats",
          releaseDate: "2023-06-01",
          description: "A groundbreaking album produced entirely by XaeNeptune.",
          discography: "Detailed discography for The Dawn of Beats.",
          tracks: [
            { id: 1001, title: "Genesis", duration: "3:45", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", cover: "https://source.unsplash.com/random/400x400/?music,track,1", isXaeNeptuneTrack: true },
            { id: 1002, title: "Starlight", duration: "4:05", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: false },
            { id: 1003, title: "Cosmic Drift", duration: "3:30", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true },
            { id: 1004, title: "Nebula Nights", duration: "5:00", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", cover: "https://source.unsplash.com/random/400x400/?music,track,4", isXaeNeptuneTrack: false },
            { id: 1005, title: "Galactic Groove", duration: "4:15", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true }
          ]
        },
        {
          id: 102,
          title: "Interstellar Features",
          cover: "https://source.unsplash.com/random/800x600/?album,space",
          releaseDate: "2022-09-15",
          description: "A collaborative project featuring XaeNeptune.",
          discography: "Detailed discography for Interstellar Features.",
          tracks: [
            { id: 1101, title: "Orbit", duration: "3:50", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: false },
            { id: 1102, title: "Solar Flare", duration: "4:20", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", cover: "https://source.unsplash.com/random/400x400/?music,track,2", isXaeNeptuneTrack: true },
            { id: 1103, title: "Eclipse", duration: "4:00", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: false },
            { id: 1104, title: "Lunar Lullaby", duration: "3:40", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true },
            { id: 1105, title: "Meteor Shower", duration: "5:10", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: false }
          ]
        }
      ]
    },
    {
      id: 2,
      name: "Artist Two",
      bio: "A dynamic force in electronic music.",
      generalDiscography: "General discography information for Artist Two.",
      albums: [
        {
          id: 201,
          title: "Electric Dreams",
          cover: "https://source.unsplash.com/random/800x600/?album,electric",
          releaseDate: "2021-11-20",
          description: "An electrifying album fully produced by XaeNeptune.",
          discography: "Detailed discography for Electric Dreams.",
          tracks: [
            { id: 2001, title: "Pulse", duration: "3:55", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true, beatType: "Trap" },
            { id: 2002, title: "Voltage", duration: "4:10", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true, beatType: "Trap" },
            { id: 2003, title: "Current", duration: "3:35", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: false },
            { id: 2004, title: "Resistance", duration: "4:05", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true },
            { id: 2005, title: "Circuit", duration: "3:50", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: false }
          ]
        },
        {
          id: 202,
          title: "Collaborative Cosmos",
          cover: "https://source.unsplash.com/random/800x600/?album,cosmos",
          releaseDate: "2020-08-10",
          description: "A collaborative album featuring XaeNeptune.",
          discography: "Detailed discography for Collaborative Cosmos.",
          tracks: [
            { id: 2101, title: "Fusion", duration: "4:00", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: false },
            { id: 2102, title: "Spark", duration: "3:45", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true },
            { id: 2103, title: "Ignite", duration: "4:20", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: false },
            { id: 2104, title: "Radiate", duration: "3:30", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true }
          ]
        }
      ]
    },
    {
      id: 3,
      name: "Artist Three",
      bio: "A visionary blending genres with a cosmic touch.",
      generalDiscography: "General discography information for Artist Three.",
      albums: [
        {
          id: 301,
          title: "Celestial Harmony",
          cover: "https://source.unsplash.com/random/800x600/?album,celestial",
          releaseDate: "2022-01-05",
          description: "An album that harmonizes space and sound.",
          discography: "Detailed discography for Celestial Harmony.",
          tracks: [
            { id: 3001, title: "Stellar", duration: "4:15", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true },
            { id: 3002, title: "Orbiting", duration: "3:40", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: false },
            { id: 3003, title: "Satellite", duration: "4:05", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true },
            { id: 3004, title: "Gravity", duration: "3:55", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: false }
          ]
        },
        {
          id: 302,
          title: "Intergalactic Features",
          cover: "https://source.unsplash.com/random/800x600/?album,intergalactic",
          releaseDate: "2021-03-18",
          description: "A collection of tracks featuring XaeNeptune.",
          discography: "Detailed discography for Intergalactic Features.",
          tracks: [
            { id: 3101, title: "Cosmos", duration: "4:00", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: false },
            { id: 3102, title: "Eternity", duration: "4:20", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true },
            { id: 3103, title: "Infinity", duration: "3:50", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: false },
            { id: 3104, title: "Beyond", duration: "4:10", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true }
          ]
        }
      ]
    },
    {
      id: 4,
      name: "Artist Four",
      bio: "Innovative sound designer and producer.",
      generalDiscography: "General discography information for Artist Four.",
      albums: [
        {
          id: 401,
          title: "Sonic Frontier",
          cover: "https://source.unsplash.com/random/800x600/?album,sonic",
          releaseDate: "2023-02-28",
          description: "An exploration into uncharted sonic territories.",
          discography: "Detailed discography for Sonic Frontier.",
          tracks: [
            { id: 4001, title: "Pioneer", duration: "3:30", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true, beatType: "Trap" },
            { id: 4002, title: "Explorer", duration: "4:00", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: false },
            { id: 4003, title: "Voyager", duration: "3:45", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true },
            { id: 4004, title: "Odyssey", duration: "4:20", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true }
          ]
        },
        {
          id: 402,
          title: "Collaborative Echoes",
          cover: "https://source.unsplash.com/random/800x600/?album,echo",
          releaseDate: "2022-07-11",
          description: "A project featuring collaborative works with XaeNeptune.",
          discography: "Detailed discography for Collaborative Echoes.",
          tracks: [
            { id: 4101, title: "Reflection", duration: "3:55", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: false },
            { id: 4102, title: "Reverb", duration: "4:10", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true },
            { id: 4103, title: "Echo", duration: "3:50", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: false }
          ]
        }
      ]
    },
    {
      id: 5,
      name: "Artist Five",
      bio: "A master of genre-blending and innovative rhythms.",
      generalDiscography: "General discography information for Artist Five.",
      albums: [
        {
          id: 501,
          title: "Rhythmic Revolution",
          cover: "https://source.unsplash.com/random/800x600/?album,rhythm",
          releaseDate: "2023-04-15",
          description: "A revolutionary album produced by XaeNeptune.",
          discography: "Detailed discography for Rhythmic Revolution.",
          tracks: [
            { id: 5001, title: "Beat Start", duration: "3:40", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true, beatType: "Trap" },
            { id: 5002, title: "Pulse Drive", duration: "4:05", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true, beatType: "Trap" },
            { id: 5003, title: "Breakthrough", duration: "3:50", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: false },
            { id: 5004, title: "Sonic Boom", duration: "4:15", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true, beatType: "Trap" },
            { id: 5005, title: "Revolution", duration: "4:00", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true, beatType: "Trap" }
          ]
        },
        {
          id: 502,
          title: "Featured Frequencies",
          cover: "https://source.unsplash.com/random/800x600/?album,frequency",
          releaseDate: "2021-12-01",
          description: "A collaborative project featuring XaeNeptune.",
          discography: "Detailed discography for Featured Frequencies.",
          tracks: [
            { id: 5101, title: "Vibe", duration: "3:35", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: false },
            { id: 5102, title: "Flow", duration: "4:00", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true },
            { id: 5103, title: "Frequency", duration: "3:45", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: false },
            { id: 5104, title: "Wave", duration: "4:10", mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", isXaeNeptuneTrack: true }
          ]
        }
      ]
    }
  ];
  