"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import { storage, ref, listAll, getDownloadURL, type StorageReference } from "../firebase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;

interface Song {
  title: string;
  url: string;
}

interface ProgressState {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
}

export default function Home() {
  const [agreed, setAgreed] = useState(false);
  const [sections, setSections] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playing, setPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [progress, setProgress] = useState<ProgressState>({
    played: 0,
    playedSeconds: 0,
    loaded: 0,
    loadedSeconds: 0,
  });
  const playerRef = useRef(null);

  useEffect(() => {
    if (currentSong && progress.played === 1) {
      const currentIndex = playlist.findIndex((song) => song.url === currentSong.url);
      if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
        handlePlaySong(playlist[currentIndex + 1]);
      } else {
        setPlaying(false);
      }
    }
  }, [progress, currentSong, playlist]);

  const fetchSections = async () => {
    try {
      const listRef = ref(storage);
      const res = await listAll(listRef);
      const sectionNames = res.prefixes.map((folderRef: StorageReference) => folderRef.name);
      setSections(sectionNames);
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  const fetchSongs = async (sectionName: string) => {
    try {
      const folderPath = `${sectionName}/`;
      const listRef = ref(storage, folderPath);
      const res = await listAll(listRef);
      console.log(`Found ${res.items.length} songs in ${sectionName}`);
      const songList: Song[] = await Promise.all(
        res.items.map(async (itemRef: StorageReference) => {
          const title = itemRef.name;
          const url = await getDownloadURL(itemRef);
          return { title, url };
        })
      );
      setSongs(songList);
      setSelectedSection(sectionName);
    } catch (error) {
      console.error(`Error fetching songs for ${sectionName}:`, error);
    }
  };

  const handlePlaySong = (song: Song) => {
    // FINAL FIX: Only load the song, do not automatically play.
    setCurrentSong(song);
    setPlaying(false); // Ensure player is paused until user explicitly plays
  };

  const handlePlayPause = () => {
    // This is now the only button that starts/stops playback.
    if (!currentSong && playlist.length > 0) {
      setCurrentSong(playlist[0]);
    }
    setPlaying(!playing);
  };

  const handleAddToPlaylist = (song: Song) => {
    if (!playlist.find(p => p.url === song.url)) {
      setPlaylist((prevPlaylist) => [...prevPlaylist, song]);
    }
  };

  const handleRemoveFromPlaylist = (songToRemove: Song) => {
    setPlaylist((prevPlaylist) =>
      prevPlaylist.filter((song) => song.url !== songToRemove.url)
    );
  };

  const handleProgress = (state: ProgressState) => {
    setProgress(state);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 pb-24">
      <div className="w-full max-w-4xl mx-auto">
        {/* Make player visible for debugging */}
        <ReactPlayer
            ref={playerRef}
            url={currentSong?.url}
            playing={playing}
            onProgress={handleProgress}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={(e: Error) => console.error("ReactPlayer Error:", e)}
            controls={true} // Show native controls for debugging
            width="100%"
            height="50px"
            style={{ marginBottom: '20px' }}
        />
      </div>
      
      {!agreed ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to FaithFlow, Faithful Frequencies Music App</h1>
          <p className="mb-6">A free-to-use music platform. No sign-up required.</p>
          <div className="bg-gray-800 p-6 rounded-lg max-w-md mx-auto mb-6">
            <h2 className="text-xl font-semibold mb-2">User Agreement</h2>
            <p className="text-sm text-gray-400 mb-4">
              By proceeding, you agree that you will not copy, download, or distribute any music created by Faithful Frequencies without explicit consent from Moore Innovations.
            </p>
            <button
              onClick={() => {
                setAgreed(true);
                fetchSections();
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              I Agree
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <header className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Faithful Frequencies Music</h2>
          </header>

          <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Sections</h3>
                <ul className="space-y-2">
                  {sections.map((section) => (
                    <li key={section} onClick={() => fetchSongs(section)} className="cursor-pointer hover:text-green-400">
                      {section}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">{selectedSection ? `Songs in ${selectedSection}` : "Select a section"}</h3>
                <ul className="space-y-2">
                  {songs.map((song) => (
                    <li key={song.url} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                      <span>{song.title}</span>
                      <div>
                        <button onClick={() => handlePlaySong(song)} className="bg-green-500 text-white px-3 py-1 rounded mr-2">Load</button>
                        <button onClick={() => handleAddToPlaylist(song)} className="bg-blue-500 text-white px-3 py-1 rounded">Add to Playlist</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Playlist</h3>
              <ul className="space-y-2">
                 {playlist.length === 0 ? (
                    <p className="text-gray-400">Your playlist is empty.</p>
                    ) : (
                    playlist.map((song, index) => (
                    <li key={song.url} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                        <span>{index + 1}. {song.title}</span>
                        <div>
                        <button onClick={() => handlePlaySong(song)} className="bg-green-500 text-white px-3 py-1 rounded mr-2">Load</button>
                        <button onClick={() => handleRemoveFromPlaylist(song)} className="bg-red-500 text-white px-3 py-1 rounded">Remove</button>
                        </div>
                    </li>
                    ))
                )}
              </ul>
            </div>
          </main>
          
          <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 text-center">
            <div className="w-full max-w-4xl mx-auto">
                <p className="mb-2">{currentSong ? `Now Playing: ${currentSong.title}` : "No song selected"}</p>
                <div className="flex items-center justify-center space-x-4">
                    <button onClick={handlePlayPause} className="bg-green-600 text-white px-4 py-2 rounded">
                        {playing ? "Pause" : "Play"}
                    </button>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress.played * 100}%` }}></div>
                    </div>
                </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
