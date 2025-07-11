"use client";

import { useState, useEffect } from "react";
import { storage, ref, listAll, getDownloadURL } from "@/firebase"; // Import getDownloadURL

export default function Home() {
  const [agreed, setAgreed] = useState(false);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [songs, setSongs] = useState([]);
  const [currentSongUrl, setCurrentSongUrl] = useState(null); // To store the URL of the currently playing song
  const [playing, setPlaying] = useState(false); // To track playback state

  useEffect(() => {
    const cross = document.querySelector(".cross");
    cross?.addEventListener("click", async () => {
      const response = await fetch("/api/adminAuth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "jon.moore@mooreinnovations.org",
          password: "$#ellb@ck2020!F@ithfl0w",
        }),
      });
      if (response.ok) {
        setAgreed(true);
        fetchSections(); // Fetch sections after agreement
      }
    });
  }, []);

  const fetchSections = async () => {
    try {
      const listRef = ref(storage, "faithflow-music"); // Replace "faithflow-music" with your main music folder path
      const res = await listAll(listRef);
      const sectionNames = res.prefixes.map((folderRef) => folderRef.name);
      setSections(sectionNames);
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  const fetchSongs = async (sectionName: string) => {
    try {
      const listRef = ref(storage, `faithflow-music/${sectionName}`); // Reference to the selected section folder
      const res = await listAll(listRef);
      const songList = await Promise.all(
        res.items.map(async (itemRef) => {
          const title = itemRef.name; // Use filename as title
          const url = await getDownloadURL(itemRef); // Get download URL
          return { title, url };
        })
      );
      setSongs(songList);
      setSelectedSection(sectionName); // Set selected section state
    } catch (error) {
      console.error(`Error fetching songs for ${sectionName}:`, error);
    }
  };

  // Function to handle playing a song
  const handlePlaySong = (songUrl: string) => {
    setCurrentSongUrl(songUrl);
    setPlaying(true);
  };

  // Function to handle pausing a song
  const handlePauseSong = () => {
    setPlaying(false);
  };

  // Function to handle adding a song to the playlist (placeholder)
  const handleAddToPlaylist = (song) => {
    console.log("Add to playlist:", song);
    // Implement playlist logic here
  };

  return (
    <div className="min-h-screen bg-faith-blue flex flex-col items-center p-4">
      {!agreed ? (
        // ... (your existing agreement UI)
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Welcome to FaithFlow!</h1>
          <p className="mb-4">
          {/* ... agreement text ... */}
          </p>
        </div>
      ) : (
        // Music Player UI
        <div className="text-white">
          <h2 className="text-xl font-bold mb-4">Faithful Frequencies Music</h2>

          {/* Donation Button (placeholder) */}
          <div className="absolute top-4 right-4">
            <button className="bg-yellow-500 text-white px-4 py-2 rounded">Donate</button>
          </div>

          {/* Section Menu */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Sections:</h3>
            <ul>
              {sections.map((section) => (
                <li key={section} onClick={() => fetchSongs(section)} className="cursor-pointer hover:underline">
                  {section}
                </li>
              ))}
            </ul>
          </div>

          {/* Song List */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{selectedSection ? `Songs in ${selectedSection}:` : "Select a section"}</h3>
            <ul>
              {songs.map((song) => (
                <li key={song.title} className="flex justify-between items-center">
                  <span>{song.title}</span>
                  <div>
                    <button onClick={() => handlePlaySong(song.url)} className="bg-green-500 text-white px-2 py-1 rounded mr-2">Play</button>
                    <button onClick={handlePauseSong} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">Pause</button>
                    <button onClick={() => handleAddToPlaylist(song)} className="bg-blue-500 text-white px-2 py-1 rounded">Add to Playlist</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Music Player Controls (placeholder) */}
          <div className="mt-8">
            {/* Audio player component will go here */}
            {currentSongUrl && (
              <audio controls autoPlay={playing} src={currentSongUrl} onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)}>
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
