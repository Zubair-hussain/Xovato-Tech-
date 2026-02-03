import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/cn";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP Plugin safely
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* -------------------------------------------------------------------------- */
/* DATA CONFIG                                                                */
/* -------------------------------------------------------------------------- */

const SERVICES = [
  {
    id: "01",
    title: "Website Development",
    desc: "We architect high-performance platforms. Watch as we construct responsive layouts that adapt perfectly from desktop to mobile.",
    tags: ["Next.js", "React", "WebGL"],
  },
  {
    id: "02",
    title: "Mobile Application",
    desc: "Interactive iOS experience. Unlock the potential of native Swift & React Native apps with our custom-built prototypes.",
    tags: ["iOS", "Android", "SwiftUI"],
  },
  {
    id: "03",
    title: "Video Editing",
    desc: "Cinematic post-production. We handle complex timelines, color grading, and motion graphics to tell your story.",
    tags: ["Premiere", "After Effects", "VFX"],
  },
  {
    id: "04",
    title: "SEO & Insights",
    desc: "Viral analytics. We track keywords and optimize content architecture to ensure your brand hits the top charts.",
    tags: ["Analytics", "Viral", "Growth"],
  },
  {
    id: "05",
    title: "AI / ML Models",
    desc: "Training the future. We process 5000k+ datasets to build intelligent models that power wonderful applications.",
    tags: ["Python", "TensorFlow", "Big Data"],
  },
];

/* -------------------------------------------------------------------------- */
/* 1. WEB VISUAL (Static)                                                     */
/* -------------------------------------------------------------------------- */
const WebVisual = () => (
  <div className="flex h-full w-full items-center justify-center p-4">
    <div className="flex aspect-[4/3] w-full max-w-md flex-col overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-2xl">
      <div className="flex h-8 items-center gap-2 border-b border-white/10 bg-white/5 px-3">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
        </div>
        <div className="ml-4 h-4 w-32 rounded-full bg-white/10" />
      </div>
      <div className="relative flex flex-1 flex-col gap-3 p-4">
        <div className="h-24 w-full origin-left rounded-lg bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20" />
        <div className="flex h-full gap-3">
          <div className="w-1/3 rounded-lg bg-white/5" />
          <div className="flex flex-1 flex-col gap-3">
            <div className="h-4 w-[85%] rounded bg-white/10" />
            <div className="h-4 w-[70%] rounded bg-white/10" />
            <div className="h-4 w-[55%] rounded bg-white/10" />
          </div>
        </div>
        <div className="absolute bottom-6 right-6 drop-shadow-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-emerald-400 fill-current">
            <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19177L20.5001 17.4171L12.9691 17.4171L11.8871 19.9897L7.76516 19.9897L8.84718 17.4171L5.65376 17.4171L5.65376 12.3673Z" stroke="white" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* 2. MOBILE VISUAL (Fixed: Font, Wallpaper, Responsive Size)                 */
/* -------------------------------------------------------------------------- */
const MobileVisual = () => {
  const [locked, setLocked] = useState(true);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  
  // Time & Region
  const [currentTime, setCurrentTime] = useState("");
  const [locationName, setLocationName] = useState("Locating...");
  const [weatherTemp, setWeatherTemp] = useState(72);
  const [note, setNote] = useState("");
  
  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState(false);

  // Games State
  const [score, setScore] = useState(0);
  const [tttBoard, setTttBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [memoryCards, setMemoryCards] = useState<any[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  // 1. Initialize System
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Format: "5:32"
      const timeString = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false });
      setCurrentTime(timeString);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);

    // Region Check
    if (typeof Intl !== 'undefined') {
      try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const city = timeZone.split('/')[1]?.replace(/_/g, " ") || "Local";
        setLocationName(city);
        setWeatherTemp(Math.floor(Math.random() * (85 - 60 + 1) + 60));
      } catch (e) {
        setLocationName("Unknown");
      }
    }

    if (typeof window !== 'undefined') {
      const savedNote = localStorage.getItem("ios-note-premium");
      if (savedNote) setNote(savedNote);
    }
    return () => clearInterval(timer);
  }, []);

  // 2. Camera Logic
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera API not supported");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (err) {
      console.log("Camera access denied", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      setStreamActive(false);
    }
  };

  // 3. Game Logic
  const handleTttClick = (i: number) => {
    if (tttBoard[i] || calculateWinner(tttBoard)) return;
    const nextBoard = tttBoard.slice();
    nextBoard[i] = xIsNext ? 'X' : 'O';
    setTttBoard(nextBoard);
    setXIsNext(!xIsNext);
  };
  
  const initMemoryGame = () => {
    const colors = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];
    const deck = [...colors, ...colors]
      .sort(() => Math.random() - 0.5)
      .map((emoji, id) => ({ id, emoji }));
    setMemoryCards(deck);
    setFlippedIndices([]);
    setMatchedPairs([]);
  };

  const handleMemoryClick = (index: number) => {
    if (flippedIndices.length === 2 || flippedIndices.includes(index) || matchedPairs.includes(memoryCards[index].emoji)) return;
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (memoryCards[first].emoji === memoryCards[second].emoji) {
        setMatchedPairs(prev => [...prev, memoryCards[first].emoji]);
        setFlippedIndices([]);
      } else {
        setTimeout(() => setFlippedIndices([]), 1000);
      }
    }
  };

  // 4. App Nav
  const openApp = (appName: string) => {
    setActiveApp(appName);
    if (appName === "Memory") initMemoryGame();
  };
  const goHome = () => {
    if (activeApp === "Camera") stopCamera();
    setActiveApp(null);
  };

  function calculateWinner(squares: any[]) {
    const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    return null;
  }

  return (
    <div className="flex h-full w-full items-center justify-center font-sans select-none overflow-hidden py-4">
      {/* Import the correct Tall Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Antonio:wght@100..700&display=swap');
      `}</style>

      {/* Responsive Wrapper: Scale down on small screens, full size on large */}
      <div className="origin-center transform scale-[0.75] sm:scale-[0.9] lg:scale-100 transition-transform duration-300">
        <motion.div
          className="relative h-[600px] w-[300px] overflow-hidden rounded-[50px] border-[8px] border-[#1f1f1f] bg-black shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/20"
        >
          {/* --- DYNAMIC ISLAND --- */}
          <div className="absolute left-1/2 top-4 z-[100] h-[28px] w-[90px] -translate-x-1/2 rounded-full bg-black flex items-center justify-center ring-1 ring-white/10 transition-all duration-300 hover:w-[120px] cursor-pointer group">
             <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"/>
               <span className="text-[9px] text-white/90 font-medium tracking-tight">Recording</span>
             </div>
          </div>

          {/* --- LOCK SCREEN (Fixed Wallpaper & Font) --- */}
          <AnimatePresence>
            {locked && (
              <motion.div
                key="lock"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -60, filter: "blur(12px)" }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0 z-50 cursor-pointer text-white"
                onClick={() => setLocked(false)}
              >
                {/* 1. WALLPAPER LAYER */}
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                  style={{ 
                    // High-res Penguin/Mountain wallpaper that matches your image
                    backgroundImage: "url('https://images.unsplash.com/photo-1541855959-16b67f4c9c61?auto=format&fit=crop&w=800&q=80')" 
                  }}
                >
                  <div className="absolute inset-0 bg-black/10" /> {/* Subtle tint for text legibility */}
                </div>

                {/* 2. CLOCK LAYER (Depth Effect) */}
                <div className="absolute top-[12%] left-0 right-0 z-10 flex flex-col items-center">
                   <div className="text-base font-semibold tracking-wide text-white/90 drop-shadow-md mb-[-5px]">
                      {/* Matching the reference date text */}
                      Penguinday, July 33
                   </div>
                   
                   {/* THE TALL FONT (Antonio) */}
                   <h1 
                     className="text-[9.5rem] leading-[0.85] font-thin tracking-tighter text-white/90 drop-shadow-lg relative z-0"
                     style={{ fontFamily: "'Antonio', sans-serif", fontWeight: 200 }}
                   >
                     {currentTime}
                   </h1>
                   
                   {/* Gradient Mask to simulate mountain covering bottom of numbers */}
                   <div className="absolute top-[75%] w-full h-20 bg-gradient-to-t from-[#202530] via-[#202530]/40 to-transparent z-10 opacity-70 mix-blend-multiply pointer-events-none" />
                </div>

                {/* 3. FOREGROUND PENGUIN (Visual depth) */}
                <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 z-20 opacity-80 pointer-events-none">
                     {/* Simulating the penguin if the wallpaper cuts it off, essentially ensuring one is visible */}
                     <img src="https://cdn-icons-png.flaticon.com/512/616/616554.png" alt="penguin" className="h-12 w-12 drop-shadow-2xl opacity-60 grayscale brightness-50" />
                </div>

                {/* 4. ACTIONS */}
                <div className="absolute bottom-12 left-10 right-10 flex justify-between z-30">
                  <div className="h-11 w-11 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-sm shadow-lg hover:bg-white/30 transition-colors">🔦</div>
                  <div className="h-11 w-11 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-sm shadow-lg hover:bg-white/30 transition-colors">📷</div>
                </div>
                
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-1 w-32 rounded-full bg-white/70 z-30" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- HOME SCREEN --- */}
          <div className="absolute inset-0 z-10 flex flex-col bg-black">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621574539437-4b7577388d60?auto=format&fit=crop&w=600&q=80')] bg-cover bg-center opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
            
            {/* Status Bar */}
            <div className="relative z-20 mt-5 flex justify-between px-7 text-[10px] font-bold text-white tracking-wide">
              <span>{currentTime}</span>
              <div className="flex gap-1.5 opacity-90">
                 <span>5G</span>
                 <span>100%</span>
              </div>
            </div>

            {/* Widgets */}
            <div className="relative z-20 mt-6 px-5 flex gap-3 h-28">
               <div className="flex-1 rounded-[22px] bg-white/10 backdrop-blur-md p-3 text-white flex flex-col justify-between border border-white/10 shadow-lg">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-blue-200">{locationName}</div>
                  <div>
                     <div className="text-3xl font-light">{weatherTemp}°</div>
                     <div className="text-[9px] opacity-80">Sunny</div>
                  </div>
               </div>
               <div className="flex-1 rounded-[22px] bg-white/10 backdrop-blur-md p-3 text-white flex flex-col justify-between border border-white/10 shadow-lg">
                  <div className="text-[9px] font-bold uppercase text-red-300">Tuesday</div>
                  <div>
                     <div className="text-2xl font-bold">20</div>
                     <div className="text-[9px] opacity-60">Meeting: Dev</div>
                  </div>
               </div>
            </div>

            {/* App Grid */}
            <div className="relative z-20 mt-6 grid grid-cols-4 gap-y-6 gap-x-2 px-4">
               <AppIcon color="bg-yellow-400" icon="📝" name="Notes" onClick={() => openApp("Notes")} />
               <AppIcon color="bg-[#333]" icon="📷" name="Camera" onClick={() => openApp("Camera")} />
               <AppIcon color="bg-blue-500" icon="🗺️" name="Maps" onClick={() => openApp("Maps")} />
               <AppIcon color="bg-indigo-500" icon="👾" name="Game" onClick={() => openApp("Game")} />
               
               <AppIcon color="bg-emerald-500" icon="❌" name="TicTac" onClick={() => openApp("TicTac")} />
               <AppIcon color="bg-purple-500" icon="🧠" name="Memory" onClick={() => openApp("Memory")} />
               <AppIcon color="bg-[#8e8e93]" icon="⚙️" name="Settings" onClick={() => {}} />
               <AppIcon color="bg-orange-500" icon="🦊" name="Store" onClick={() => {}} />
            </div>

            {/* Dock */}
            <div className="absolute bottom-5 left-4 right-4 h-[80px] rounded-[32px] bg-white/10 backdrop-blur-2xl border border-white/5 flex items-center justify-around px-2 z-20">
               <DockIcon color="bg-green-500" icon="📞" notify={1} onClick={() => openApp("Phone")} />
               <DockIcon color="bg-blue-400" icon="🌐" onClick={() => {}} />
               <DockIcon color="bg-white" icon="💬" onClick={() => {}} />
               <DockIcon color="bg-pink-500" icon="🎵" onClick={() => {}} />
            </div>
            
             <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-32 rounded-full bg-white/60 z-50" />
          </div>

          {/* --- APPS --- */}
          <AnimatePresence>
            {activeApp && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0, borderRadius: "50px" }}
                animate={{ scale: 1, opacity: 1, borderRadius: "50px" }}
                exit={{ scale: 0.9, opacity: 0, borderRadius: "60px" }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                className="absolute inset-0 z-[60] bg-black overflow-hidden flex flex-col"
              >
                <div onClick={goHome} className="absolute bottom-2 left-1/2 -translate-x-1/2 h-1 w-32 rounded-full bg-white/40 z-[100] cursor-pointer hover:bg-white transition-colors" />
                <div className="absolute top-0 w-full h-8 z-50" onClick={goHome} />

                {/* NOTES */}
                {activeApp === "Notes" && (
                  <div className="flex-1 bg-[#1c1c1e] text-white p-6 pt-12">
                     <h2 className="text-3xl font-bold mb-4">Notes</h2>
                     <textarea 
                       value={note}
                       onChange={(e) => { setNote(e.target.value); localStorage.setItem("ios-note-premium", e.target.value); }}
                       placeholder="Write here..."
                       className="w-full h-full bg-transparent resize-none outline-none text-lg leading-relaxed text-white/90 placeholder:text-white/20 font-sans"
                     />
                  </div>
                )}

                {/* CAMERA */}
                {activeApp === "Camera" && (
                  <div className="flex-1 bg-black relative flex flex-col items-center justify-center">
                     <div className="absolute top-6 right-6 text-yellow-500 text-[10px] font-bold">● HD</div>
                     {streamActive ? (
                        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                     ) : (
                        <button 
                          onClick={startCamera}
                          className="px-6 py-3 rounded-full bg-white/20 text-white text-sm font-bold backdrop-blur-md hover:bg-white/30 transition-colors"
                        >
                          Enable Camera
                        </button>
                     )}
                     <div onClick={goHome} className="absolute bottom-12 left-1/2 -translate-x-1/2 h-16 w-16 rounded-full border-[4px] border-white bg-white/10 hover:bg-white cursor-pointer transition-colors" />
                  </div>
                )}

                {/* GAMES */}
                {activeApp === "Game" && (
                  <div className="flex-1 bg-[#1a1a1a] flex flex-col items-center justify-center" onClick={() => setScore(s => s + 1)}>
                     <div className="text-8xl text-white font-black mb-10">{score}</div>
                     <div className="h-24 w-24 rounded-full bg-indigo-500 shadow-[0_0_40px_#6366f1] animate-pulse cursor-pointer border-4 border-white/20" />
                     <p className="mt-8 text-white/30 text-xs tracking-widest uppercase">Tap to Score</p>
                  </div>
                )}
                
                {activeApp === "TicTac" && (
                  <div className="flex-1 bg-[#111] flex flex-col items-center justify-center p-4">
                     <div className="grid grid-cols-3 gap-3">
                        {tttBoard.map((val, i) => (
                          <div key={i} onClick={() => handleTttClick(i)} className="h-16 w-16 bg-[#222] rounded-xl flex items-center justify-center text-4xl font-bold text-white cursor-pointer hover:bg-[#333]">
                             <span className={val === 'X' ? 'text-blue-400' : 'text-red-400'}>{val}</span>
                          </div>
                        ))}
                     </div>
                     <button onClick={() => setTttBoard(Array(9).fill(null))} className="mt-10 px-6 py-2 bg-white/10 rounded-full text-white text-xs font-bold uppercase tracking-widest">Reset Board</button>
                  </div>
                )}

                {activeApp === "Memory" && (
                  <div className="flex-1 bg-[#1a1a1a] flex flex-col items-center justify-center p-4">
                     <div className="grid grid-cols-4 gap-2">
                        {memoryCards.map((card, i) => {
                          const isFlipped = flippedIndices.includes(i) || matchedPairs.includes(card.emoji);
                          return (
                            <div key={i} onClick={() => handleMemoryClick(i)} className={`h-14 w-14 rounded-xl flex items-center justify-center text-2xl cursor-pointer transition-all duration-300 ${isFlipped ? 'bg-white rotate-0' : 'bg-purple-900 rotate-180'}`}>
                               {isFlipped ? card.emoji : ''}
                            </div>
                          )
                        })}
                     </div>
                  </div>
                )}

                {/* PHONE */}
                {activeApp === "Phone" && (
                   <div className="flex-1 bg-gray-900 flex flex-col items-center pt-24 text-center">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-t from-gray-700 to-gray-600 mb-6 flex items-center justify-center text-4xl shadow-xl">👨‍💻</div>
                      <div className="text-white text-2xl font-bold">Xovato Team</div>
                      <div className="text-white/50 text-sm mb-12">mobile...</div>
                      <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-white/90 text-sm max-w-[80%] leading-relaxed border border-white/5">
                        "Would you need to create something just like that?"
                      </div>
                      <div className="mt-auto mb-20 flex gap-8">
                         <div onClick={goHome} className="h-16 w-16 rounded-full bg-red-500 flex items-center justify-center text-white text-2xl cursor-pointer hover:scale-110 transition-transform">❌</div>
                      </div>
                   </div>
                )}

                {/* MAPS */}
                {activeApp === "Maps" && (
                   <div className="flex-1 bg-[#242f3e] relative">
                      <div className="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover invert" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_30px_#3b82f6] animate-bounce" />
                      <div className="absolute bottom-10 left-4 right-4 bg-gray-800 p-5 rounded-2xl text-white shadow-2xl">
                         <div className="font-bold text-sm">Location Found</div>
                         <div className="text-xs text-gray-400 mt-1">{locationName}</div>
                         <button className="mt-3 w-full py-2 bg-blue-600 rounded-lg text-xs font-bold">Start Navigation</button>
                      </div>
                   </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

// --- Sub Components ---
const AppIcon = ({ color, icon, name, onClick }: { color: string, icon: string, name: string, onClick: () => void }) => (
  <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={onClick}>
    <div className={`h-[56px] w-[56px] rounded-[14px] ${color} flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform border border-white/5 text-white`}>
      {icon}
    </div>
    <span className="text-[10px] text-white/90 font-medium drop-shadow-md tracking-tight">{name}</span>
  </div>
);

const DockIcon = ({ color, icon, notify, onClick }: { color: string, icon: string, notify?: number, onClick: () => void }) => (
  <div className={`h-[56px] w-[56px] rounded-[14px] ${color} flex items-center justify-center text-2xl shadow-lg cursor-pointer hover:-translate-y-2 transition-transform relative text-white border border-white/10`} onClick={onClick}>
    {icon}
    {notify && <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 border-2 border-[#121212] text-[10px] text-white flex items-center justify-center font-bold">{notify}</div>}
  </div>
);

/* -------------------------------------------------------------------------- */
/* 3. VIDEO VISUAL (Static)                                                   */
/* -------------------------------------------------------------------------- */
const VideoVisual = () => (
  <div className="flex h-full w-full items-center justify-center p-4">
    <div className="flex w-full max-w-lg flex-col gap-2 rounded-xl bg-[#1a1a1a] p-3 shadow-2xl border border-white/10">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 to-black">
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-black/50 backdrop-blur-sm" />
          <div className="absolute top-1/4 right-1/4 w-12 h-12 rounded-full bg-orange-500/80 blur-xl" />
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[8px] sm:text-[10px] text-white/70 font-mono z-10">
          <span>00:00:12:04</span>
          <span className="text-emerald-400">REC ●</span>
        </div>
      </div>
      <div className="flex justify-between items-center px-1 text-white/50 text-xs">
        <div className="flex gap-2 sm:gap-4">
          <span>✂️ Split</span>
          <span>FX Effects</span>
        </div>
        <div className="text-emerald-400 text-[9px] uppercase tracking-wider">Ready</div>
      </div>
      <div className="relative flex flex-col gap-1 overflow-hidden rounded border border-white/5 bg-black p-1">
        <div className="absolute bottom-0 top-0 z-20 w-0.5 bg-red-500 left-1/2" />
        <div className="h-6 sm:h-8 w-full bg-white/5 rounded flex gap-0.5 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-1 bg-blue-600/30 border-r border-black/50" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* 4. SEO VISUAL (Static)                                                     */
/* -------------------------------------------------------------------------- */
const SeoVisual = () => {
  const rows = [
    { kw: "Viral Strategy", vol: "450K", trend: 95 },
    { kw: "App Growth", vol: "120K", trend: 88 },
    { kw: "Xovato Tech", vol: "850K", trend: 99 },
  ];

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-neutral-900/90 backdrop-blur-md shadow-2xl overflow-hidden">
        <div className="bg-white/5 px-4 py-3 flex justify-between items-center border-b border-white/10">
          <h4 className="text-sm font-bold text-white">Viral Insights</h4>
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
        <div className="p-2">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-white/40 uppercase tracking-wider">
                <th className="pb-2 pl-2">Keyword</th>
                <th className="pb-2">Vol</th>
                <th className="pb-2">Trend</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.kw} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-default">
                  <td className="py-3 pl-2 font-medium text-white">{row.kw}</td>
                  <td className="py-3 text-white/60">{row.vol}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-12 sm:w-16 rounded-full bg-white/10 overflow-hidden">
                        <div style={{ width: `${row.trend}%` }} className="h-full bg-emerald-500" />
                      </div>
                      <span className="text-[10px] sm:text-xs text-emerald-400">+{row.trend}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 5. AI VISUAL (Static)                                                      */
/* -------------------------------------------------------------------------- */
const AiVisual = () => {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden relative p-8">
      <div className="relative z-10 h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-emerald-600 to-black border border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.4)] flex items-center justify-center group">
        <span className="text-3xl">🧠</span>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 w-full justify-center px-4">
        <div className="rounded border border-emerald-500/30 bg-black/80 px-3 py-2 text-center backdrop-blur w-24 sm:w-28">
          <div className="text-[9px] sm:text-[10px] text-emerald-500/70 uppercase">Dataset</div>
          <div className="font-mono text-sm sm:text-lg font-bold text-white">5,000k+</div>
        </div>
        <div className="rounded border border-emerald-500/30 bg-black/80 px-3 py-2 text-center backdrop-blur w-24 sm:w-28">
          <div className="text-[9px] sm:text-[10px] text-emerald-500/70 uppercase">Accuracy</div>
          <div className="font-mono text-sm sm:text-lg font-bold text-white">99.9%</div>
        </div>
      </div>
    </div>
  );
};


/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

interface ServicesInteractiveProps {
  scrollTo?: (target: string) => void;
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function ServicesInteractive({ scrollTo }: ServicesInteractiveProps) {
  const router = useRouter();
  const [activeService, setActiveService] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const renderVisual = (index: number) => {
    switch (index) {
      case 0: return <WebVisual />;
      case 1: return <MobileVisual />;
      case 2: return <VideoVisual />;
      case 3: return <SeoVisual />;
      case 4: return <AiVisual />;
      default: return null;
    }
  };

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    let ctx: gsap.Context;
    const items = gsap.utils.toArray(".service-scroll-item");
    if (items.length === 0) return;

    // Use Context safely without timeouts
    ctx = gsap.context(() => {
      items.forEach((item: any, i) => {
        ScrollTrigger.create({
          trigger: item,
          start: "top center+=10%",
          end: "bottom center+=10%",
          onEnter: () => setActiveService(i),
          onEnterBack: () => setActiveService(i),
        });
      });
    }, containerRef);

    return () => ctx.revert(); 
  }, []);

  const handleScrollToLocal = (e: React.MouseEvent, id: string, serviceTitle: string) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.location.pathname === '/contact') {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("interest", serviceTitle);
      window.history.pushState({}, "", newUrl);

      const el = document.getElementById("contact");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push(`/contact?interest=${encodeURIComponent(serviceTitle)}`);
    }
  };

  return (
    <section ref={containerRef} className="relative w-full bg-black text-white font-['Inter',_system-ui,_-apple-system,_sans-serif] antialiased">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row">

          {/* --- LEFT: SCROLLABLE LIST --- */}
          <div className="w-full py-12 lg:w-1/2 lg:py-32 lg:pb-[80vh]">

            <div className="mb-12 lg:mb-20">
              <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                  // Services
              </span>
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:leading-[1.1]">
                Our <span className="text-emerald-500">Capabilities</span>
              </h2>
              <p className="mt-4 max-w-md text-white/60 text-lg">
                From interactive prototypes to viral algorithms.
              </p>
            </div>

            <div className="flex flex-col gap-16 lg:gap-0">
              {SERVICES.map((service, index) => (
                <div
                  key={service.id}
                  className={cn(
                    "service-scroll-item flex flex-col justify-center",
                    "min-h-[auto] lg:min-h-[80vh]"
                  )}
                >
                  <div className={cn(
                    "transition-opacity duration-700",
                    "opacity-100 lg:opacity-30",
                    activeService === index && "lg:opacity-100"
                  )}>
                    <span className="mb-4 font-sans text-5xl lg:text-7xl font-black text-white/[0.05] leading-none">
                      {service.id}
                    </span>
                    <h3 className="mb-3 text-2xl lg:text-3xl font-bold tracking-tight">{service.title}</h3>
                    <p className="mb-6 max-w-md text-base lg:text-lg leading-relaxed text-white/70">
                      {service.desc}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6 lg:mb-8">
                      {service.tags.map(tag => (
                        <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/5">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="block lg:hidden w-full mb-8">
                      <div className="relative w-full aspect-square max-h-[400px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                        <div className="h-full w-full">
                          {renderVisual(index)}
                        </div>
                      </div>
                    </div>

                    <div className={cn(
                      "transition-all duration-500 ease-out",
                      "max-h-24 opacity-100 translate-y-0 lg:max-h-0 lg:opacity-0 lg:translate-y-4",
                      activeService === index && "lg:max-h-24 lg:opacity-100 lg:translate-y-0"
                    )}>
                      <button
                        type="button"
                        onClick={(e) => handleScrollToLocal(e, '#contact', service.title)}
                        className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full p-[2px] transition-transform duration-300 hover:scale-105"
                      >
                        <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#10b981_50%,#000000_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-black px-8 py-1 text-sm font-bold tracking-wide text-white backdrop-blur-3xl transition-colors duration-300 group-hover:bg-zinc-900">
                          Schedule Call
                          <span className="text-emerald-400 font-extrabold ml-1 transition-transform duration-300 group-hover:rotate-90">+</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- RIGHT: STICKY VISUALS --- */}
          <div className="hidden lg:block lg:w-1/2">
            <div className="sticky top-0 flex h-screen items-center justify-center p-8">
              <div className="relative aspect-square w-full max-w-[550px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm shadow-2xl">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeService}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {renderVisual(activeService)}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}