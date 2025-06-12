"use client";

import { hardcodedAlbums } from "@/data/artistsData";
import {
  Billboard,
  Html,
  OrbitControls,
  PerspectiveCamera,
  useTexture,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import { easing } from "maath";
import Image from "next/image";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface SpotifyTrack {
  id: string;
  name: string;
  preview_url: string | null;
  album?: {
    id: string;
    name: string;
    images: { url: string }[];
    release_date: string;
    external_urls?: { spotify: string };
  };
  artists: { id?: string; name: string }[];
  external_urls?: { spotify: string };
}

interface SpotifyAlbum {
  id: string;
  name: string;
  images: { url: string }[];
  release_date: string;
  external_urls?: { spotify: string };
  tracks?: SpotifyTrack[];
}

interface ArtistAlbumsResponse {
  items: SpotifyAlbum[];
}
interface Particle {
  t: number;
  factor: number;
  speed: number;
  xFactor: number;
  yFactor: number;
  zFactor: number;
  mx: number;
  my: number;
}


/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function getAlbumCoverUrl(album: SpotifyAlbum): string {
  const url = album.images?.[0]?.url || "";
  if (url.includes("open.spotify.com/album")) {
    const fallback: Record<string, string> = {
      "257teVy7xAOfpN9OzY85Lo":
        "https://i.scdn.co/image/ab67616d0000b273prerolls2cover",
      "0djUyeQEWuCWhz1VWRLkFe":
        "https://i.scdn.co/image/ab67616d0000b273wherethesidewalkendscover",
    };
    return fallback[album.id] || "/fallback-album.png";
  }
  return url;
}

/* ------------------------------------------------------------------ */
/*  Album card (inside Canvas)                                        */
/* ------------------------------------------------------------------ */
function AlbumCard3D({
  album,
  index,
  total,
  radius = 8,
  onSelect,
}: {
  album: SpotifyAlbum;
  index: number;
  total: number;
  radius: number;
  onSelect: (alb: SpotifyAlbum) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(getAlbumCoverUrl(album));

  /* position on circle */
  const angle = (index / total) * Math.PI * 2;
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;

  /* hover / float animation */
  useFrame((state, delta) => {
    if (!meshRef.current || !groupRef.current) return;
    const scale = hovered ? 1.2 : 1;
    const yPos = hovered ? 0.5 : 0;
    easing.damp3(
      meshRef.current.scale,
      [scale * 3, scale * 3, 1],
      0.2,
      delta
    );
    easing.damp3(groupRef.current.position, [x, yPos, z], 0.3, delta);

    if (hovered) {
      meshRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 2) * 0.05;
    } else {
      easing.damp(meshRef.current.rotation, "z", 0, 0.2, delta);
    }
  });

  return (
    <group ref={groupRef} position={[x, 0, z]}>
      <Billboard follow>
        <mesh
          ref={meshRef}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onClick={() => onSelect(album)}
        >
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
             map={texture}
             side={THREE.DoubleSide}
             metalness={0.3}
             roughness={0.4}
             transparent={false}      // ensure no blending
             depthWrite={true}        // write into the depth buffer
             depthTest={true}  
          />
        </mesh>

        {/* label */}
        <Html
          center
          distanceFactor={10}
          position={[0, -2.2, 0]}
          style={{
            transition: "all 0.3s",
            opacity: hovered ? 1 : 0,
            transform: `scale(${hovered ? 1 : 0.8})`,
          }}
        >
          <div className="bg-black/90 backdrop-blur px-4 py-2 rounded-lg border border-purple-500/30">
            <p className="text-white text-sm font-bold whitespace-nowrap">
              {album.name}
            </p>
            <p className="text-purple-300 text-xs">
              {new Date(album.release_date).getFullYear()}
            </p>
          </div>
        </Html>

        {hovered && (
          <pointLight
            position={[0, 0, 0.5]}
            intensity={2}
            color="#a855f7"
            distance={5}
          />
        )}
      </Billboard>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Particles (inside Canvas)                                         */
/* ------------------------------------------------------------------ */
function Particles({ count = 100 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo<Particle[]>(() => {
    const arr: Particle[] = [];            // ← no more any[]
    for (let i = 0; i < count; i++) {
      arr.push({
        t: Math.random() * 100,
        factor: 20 + Math.random() * 100,
        speed: 0.01 + Math.random() / 200,
        xFactor: -50 + Math.random() * 100,
        yFactor: -50 + Math.random() * 100,
        zFactor: -50 + Math.random() * 100,
        mx: 0,
        my: 0,
      });
    }
    return arr;
  }, [count]);

  useFrame(() => {
    const inst = mesh.current;
    if (!inst) return;
    particles.forEach((p, i) => {
      p.t += p.speed / 2;
      const a = Math.cos(p.t) + Math.sin(p.t) / 10;
      const b = Math.sin(p.t) + Math.cos(p.t * 2) / 10;
      const s = Math.cos(p.t);

      dummy.position.set(
        (p.mx / 10) * a +
          p.xFactor +
          Math.cos((p.t / 10) * p.factor) +
          (Math.sin(p.t) * p.factor) / 10,
        (p.my / 10) * b +
          p.yFactor +
          Math.sin((p.t / 10) * p.factor) +
          (Math.cos(p.t * 2) * p.factor) / 10,
        (p.my / 10) * b +
          p.zFactor +
          Math.cos((p.t / 10) * p.factor) +
          (Math.sin(p.t * 3) * p.factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <pointLight distance={40} intensity={8} color="lightblue" />
      <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
        <dodecahedronGeometry args={[0.2, 0]} />
        <meshPhongMaterial
          color="#a855f7"
          emissive="#4a00e0"
          emissiveIntensity={0.5}
        />
      </instancedMesh>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene inside Canvas                                               */
/* ------------------------------------------------------------------ */
function AlbumsScene({
  albums,
  onAlbumSelect,
  activeTab,
  personalAlbumIds,
  executiveAlbumIds,
}: {
  albums: SpotifyAlbum[];
  onAlbumSelect: (album: SpotifyAlbum) => void;
  activeTab: string;
  personalAlbumIds: string[];
  executiveAlbumIds: string[];
}) {
  /* target (desired) speed vs. current speed */
  const targetSpeed = useRef<number>(0.1);          // scalar
  const speedRef   = useRef<{ value: number }>({    // object so maath.damp can mutate a prop
    value: 0.1,
  });

  /* filter albums once */
  const filteredAlbums = useMemo(() => {
    if (activeTab === "personal")
      return albums.filter((a) => personalAlbumIds.includes(a.id));
    if (activeTab === "executive")
      return albums.filter((a) => executiveAlbumIds.includes(a.id));
    return albums;
  }, [albums, activeTab, personalAlbumIds, executiveAlbumIds]);

  /* ------------------ Carousel (inside Canvas) ------------------ */
  function Carousel() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
      /* ease speedRef.value → targetSpeed.current */
      easing.damp(speedRef.current, "value", targetSpeed.current, 0.5, delta);

      /* rotate ring */
      if (groupRef.current) {
        groupRef.current.rotation.y += speedRef.current.value * delta;
      }
    });

    return (
      <group
      position={[0, 3.25, 0]}
        ref={groupRef}
        onPointerEnter={() => { targetSpeed.current = 0; }}
        onPointerLeave={() => { targetSpeed.current = 0.1; }}
      >
        {filteredAlbums.map((album, i) => (
          <AlbumCard3D
            key={album.id}
            album={album}
            index={i}
            total={filteredAlbums.length}
            radius={filteredAlbums.length > 8 ? 10 : 8}
            onSelect={onAlbumSelect}
          />
        ))}
      </group>
    );
  }

  /* -------------------------- Canvas --------------------------- */
  return (
    <Canvas
      shadows
      className="absolute inset-0 z-[1100]"
      camera={{ position: [0, 75, 200], fov: 75 }}
      gl={{
        alpha: true,
        powerPreference: "high-performance",
        antialias: false,
        stencil: false,
        depth: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 17]} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.5}
      />

      <ambientLight intensity={5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <spotLight
        position={[0, 10, 0]}
        angle={0.5}
        penumbra={0.5}
        intensity={2}
        castShadow
      />

      <Carousel />

      {/* centre ring */}
      <mesh position={[0, -4.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7, 8, 64]} />
        <meshStandardMaterial
          color="#a855f7"
          metalness={0.8}
          roughness={0.2}
          emissive="#a855f7"
          emissiveIntensity={0.2}
        />
      </mesh>

      <Particles count={100} />
    </Canvas>
  );
}

// Main Albums Component
export default function Albums() {
  type Tabs = "associated" | "personal" | "executive";
  const [activeTab, setActiveTab] = useState<Tabs>("associated");
  const [discographyAlbums, setDiscographyAlbums] = useState<SpotifyAlbum[]>([]);
  const [loadingDiscography, setLoadingDiscography] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState<SpotifyAlbum | null>(null);
  const [albumTracks, setAlbumTracks] = useState<SpotifyTrack[]>([]);
  const [loadingAlbumTracks, setLoadingAlbumTracks] = useState(false);
  const [show3D, setShow3D] = useState(false);

  const personalAlbumIds = ["6PBCQ44h15c7VN35lAzu3M", "55Xr7mE7Zya6ccCViy7yyh"];
  const executiveAlbumIds = ["0djUyeQEWuCWhz1VWRLkFe", "257teVy7xAOfpN9OzY85Lo", "0QBZSqSw8BumuSzFWqjXYR", "343aezvXQOm8UTT9lNB64h", "3yejH64Ofken9zTwLQ9c7X"];

  // Fetch all albums
  const artistId = "7iysPipkcsfGFVEgUMDzHQ";
  useEffect(() => {
    const fetchDiscographyAlbums = async () => {
      setLoadingDiscography(true);
      try {
        const albumsRes = await fetch(
          `/api/spotify/artist-albums?artistId=${artistId}&include_groups=album,single&limit=50`,
        );
        if (!albumsRes.ok) {
          console.error(`Error fetching artist albums: ${await albumsRes.text()}`);
          setDiscographyAlbums([]);
          return;
        }
        const albumsData: ArtistAlbumsResponse = await albumsRes.json();
        const fetchedAlbums = albumsData.items || [];
        const fetchedIds = new Set(fetchedAlbums.map((a) => a.id));

        const merged = fetchedAlbums.map((album) => {
          if (hardcodedAlbums[album.id]) {
            return { ...album, tracks: hardcodedAlbums[album.id].tracks };
          }
          return album;
        });

        const fallbackOnly = Object.values(hardcodedAlbums).filter(
          (a) => !fetchedIds.has(a.id),
        );

        const updatedFallback = await Promise.all(
          fallbackOnly.map(async (alb) => {
            try {
              const fallbackRes = await fetch(`/api/spotify/album?albumId=${alb.id}`);
              if (!fallbackRes.ok) {
                console.error(`Error fetching detail for fallback album ${alb.id}: ${await fallbackRes.text()}`);
                return alb;
              }
              const realData = await fallbackRes.json();
              return { ...realData, tracks: alb.tracks };
            } catch (err) {
              console.error(`Fallback fetch error for ${alb.id}`, err);
              return alb;
            }
          }),
        );

        const finalAlbums = [...merged, ...updatedFallback];
        finalAlbums.sort(
          (a, b) =>
            new Date(b.release_date).getTime() -
            new Date(a.release_date).getTime(),
        );

        setDiscographyAlbums(finalAlbums);
      } catch (err) {
        console.error("Error fetching discography albums:", err);
        setDiscographyAlbums([]);
      } finally {
        setLoadingDiscography(false);
      }
    };

    fetchDiscographyAlbums();
  }, [artistId]);

  // Handle album selection
  const handleAlbumClick = async (album: SpotifyAlbum) => {
    setSelectedAlbum(album);
    setShow3D(false);

    if (album.tracks && album.tracks.length > 0) {
      setAlbumTracks(album.tracks);
      return;
    }

    setLoadingAlbumTracks(true);
    try {
      const res = await fetch(`/api/spotify/albums/${album.id}/tracks?market=ES&limit=50`);
      if (!res.ok) {
        console.error(`Error fetching tracks for album ${album.id}: ${await res.text()}`);
        setAlbumTracks([]);
        return;
      }
      const data = await res.json();
      setAlbumTracks(data.items || []);
    } catch (error) {
      console.error(`Error fetching tracks for album ${album.id}:`, error);
      setAlbumTracks([]);
    } finally {
      setLoadingAlbumTracks(false);
    }
  };

  // Render album detail view
  const renderAlbumDetail = () => {
    if (!selectedAlbum) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="max-w-6xl mx-auto"
      >
        <button
          onClick={() => {
            setSelectedAlbum(null);
            setAlbumTracks([]);
            setShow3D(true);
          }}
          className="mb-6 px-4 py-2 bg-purple-600/80 backdrop-blur-sm text-white rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Albums
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Album cover and info */}
          <motion.div
            className="lg:w-1/3"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="sticky top-24">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl mb-6 group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <Image
                  src={getAlbumCoverUrl(selectedAlbum)}
                  alt={`${selectedAlbum.name} cover`}
                  width={500}
                  height={500}
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  priority
                />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {selectedAlbum.name}
              </h2>
              <p className="text-gray-400 mb-4">
                {new Date(selectedAlbum.release_date).getFullYear()}
              </p>
              <p className="text-sm text-gray-500">
                {albumTracks.length} track{albumTracks.length !== 1 ? "s" : ""}
              </p>
              {selectedAlbum.external_urls?.spotify && (
                <a
                  href={selectedAlbum.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421                    -.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Open in Spotify
                </a>
              )}
            </div>
          </motion.div>

          {/* Track list */}
          <motion.div
            className="lg:w-2/3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {loadingAlbumTracks ? (
              <div className="flex justify-center items-center h-64">
                <motion.div
                  className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            ) : albumTracks.length > 0 ? (
              <ul className="space-y-3">
                {albumTracks.map((track, index) => (
                  <motion.li
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <div
                      className="flex items-center gap-4 p-4 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 hover:border-purple-500/50 hover:bg-gray-900/70 transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        const url = track.external_urls?.spotify || track.album?.external_urls?.spotify;
                        if (url) window.open(url, "_blank");
                      }}
                    >
                      <div className="flex-shrink-0 w-8 text-center">
                        <span className="text-gray-500 group-hover:text-purple-400 transition-colors">
                          {index + 1}
                        </span>
                      </div>

                      <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                        <Image
                          src={getAlbumCoverUrl(selectedAlbum)}
                          alt={`${selectedAlbum.name} cover`}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>

                      <div className="flex-grow min-w-0">
                        <p className="font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-emerald-300 transition-all duration-300 truncate">
                          {track.name}
                        </p>
                        <p className="text-sm text-gray-400 truncate">
                          {track.artists.map((a) => a.name).join(", ")}
                        </p>
                      </div>

                      {track.preview_url && (
                        <audio
                          controls
                          src={track.preview_url}
                          className="w-24 md:w-32 h-8"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = track.external_urls?.spotify || track.album?.external_urls?.spotify;
                          if (url) window.open(url, "_blank");
                        }}
                        className="flex-shrink-0 w-10 h-10 bg-purple-600/20 hover:bg-purple-600/30 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-all duration-300"
                      >
                        <svg className="w-4 h-4 text-purple-400 group-hover:text-white transition-colors ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-400 py-8">
                No tracks found for this album.
              </p>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // Render grid view for non-3D mode
  const renderGridView = () => {
    const filteredAlbums = activeTab === "personal" 
      ? discographyAlbums.filter(album => personalAlbumIds.includes(album.id))
      : activeTab === "executive"
      ? discographyAlbums.filter(album => executiveAlbumIds.includes(album.id))
      : discographyAlbums;

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {filteredAlbums.map((album, index) => (
          <motion.article
            key={album.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative cursor-pointer"
            onClick={() => handleAlbumClick(album)}
          >
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <div className="relative w-full aspect-square overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <Image
                  src={getAlbumCoverUrl(album)}
                  alt={`${album.name} cover`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-white mb-1 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-emerald-300 transition-all duration-300">
                  {album.name}
                </h3>
                <p className="text-xs text-gray-400">
                  {new Date(album.release_date).getFullYear()}
                </p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-emerald-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />
      </motion.div>

      <div className="relative z-10 px-8 py-16">
        {/* Header */}
        <motion.header
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-6xl md:text-8xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-emerald-300"
            initial={{ letterSpacing: "0.5em", opacity: 0 }}
            animate={{ letterSpacing: "0.05em", opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            ALBUMS
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-gray-400 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Personal & Executive Produced Collections
          </motion.p>
        </motion.header>

        {/* Tab Navigation */}
        <nav className="flex justify-center mb-8">
          <motion.div
            className="relative flex bg-gray-900/50 backdrop-blur-sm rounded-full  border border-gray-800"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.div
              className="absolute h-full bg-gradient-to-r from-purple-600 to-emerald-600 rounded-full"
              initial={false}
              animate={{
                x: activeTab === "associated" ? 0 : activeTab === "personal" ? "100%" : "200%",
                width: "33.33%",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            
            <button
              onClick={() => setActiveTab("associated")}
              className={`relative z-10 px-6 py-3 rounded-full font-medium transition-colors duration-200 ${
                activeTab === "associated" ? "text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              All Albums
            </button>
            <button
              onClick={() => setActiveTab("personal")}
                            className={`relative z-10 px-6 py-3 rounded-full font-medium transition-colors duration-200 ${
                activeTab === "personal" ? "text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Personal
            </button>
            <button
              onClick={() => setActiveTab("executive")}
              className={`relative z-10 px-6 py-3 rounded-full font-medium transition-colors duration-200 ${
                activeTab === "executive" ? "text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Executive
            </button>
          </motion.div>
        </nav>

        {/* View Toggle Button */}
        {!selectedAlbum && !loadingDiscography && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShow3D(!show3D)}
              className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {show3D ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              {show3D ? 'Grid View' : '3D View'}
            </button>
          </div>
        )}

        {/* Content Area */}
        {loadingDiscography ? (
          <div className="flex justify-center items-center h-[600px]">
            <motion.div
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : selectedAlbum ? (
          <AnimatePresence mode="wait">
            {renderAlbumDetail()}
          </AnimatePresence>
        ) : show3D ? (
          <Suspense fallback={
            <div className="flex justify-center items-center h-[600px]">
              <motion.div
                className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          }>
            <div className="h-[600px] w-full">
              <AlbumsScene 
                albums={discographyAlbums} 
                onAlbumSelect={handleAlbumClick}
                activeTab={activeTab}
                personalAlbumIds={personalAlbumIds}
                executiveAlbumIds={executiveAlbumIds}
              />
            </div>
          </Suspense>
        ) : (
          renderGridView()
        )}

        {/* Footer */}
        <motion.footer
          className="mt-24 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-8 max-w-4xl mx-auto"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          />
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Xae Neptune. All rights reserved.
          </p>
        </motion.footer>
      </div>

      {/* Custom styles for audio elements */}
      <style jsx global>{`
        audio::-webkit-media-controls-panel {
          background-color: rgba(31, 41, 55, 0.8);
          backdrop-filter: blur(10px);
        }
        
        audio::-webkit-media-controls-play-button,
        audio::-webkit-media-controls-current-time-display,
        audio::-webkit-media-controls-time-remaining-display {
          color: white;
        }
        
        audio::-webkit-media-controls-timeline {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 25px;
          margin: 0 12px;
        }
      `}</style>
    </div>
  );
}  