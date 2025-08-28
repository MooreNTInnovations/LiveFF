"use client";

import { useState } from "react";
import ReactAudioPlayer from 'react-audio-player';
import { storage, ref, listAll, getDownloadURL, type StorageReference } from "../firebase";

interface Song {
  title: string;
  url: string;
}

export default function Home() {
  const [agreed, setAgreed] = useState(false);
  const [sections, setSections] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSongUrl, setCurrentSongUrl] = useState<string>('');
  const [currentSongTitle, setCurrentSongTitle] = useState<string>('No song selected');

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
    console.log(`Playing song: ${song.title}`);
    setCurrentSongUrl(song.url);
    setCurrentSongTitle(song.title);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      
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
          <header className="flex justify-between items-center mb-6 sticky top-0 bg-gray-900 py-4 z-10">
            <div className="w-full">
              <p className="mb-2 text-center">Now Playing: {currentSongTitle}</p>
              {currentSongUrl && (
              <ReactAudioPlayer
                src={currentSongUrl}
                autoPlay
                controls
                className="w-full"
              />
              )}
            </div>
          </header>

          <div className="text-center mb-6">
            <p className="text-xl font-semibold mb-4">Support Our Music!</p>
            <a
              href="https://square.link/u/kvmzA5fu"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block"
            >
              Donate with Square
            </a>
            <p className="mt-2 text-sm text-gray-400">
              Your generous contributions help us create more music and keep this platform free.
            </p>
          </div>



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
                        <button onClick={() => handlePlaySong(song)} className="bg-green-500 text-white px-3 py-1 rounded mr-2">Play</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Simplified layout, removing playlist for now */}
            <div/>
          </main>
        </div>
      )}
    </div>
  );
}
