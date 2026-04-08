import React, { useState, useEffect, useRef, useCallback } from "react";

// --- CUSTOM HOOK FOR REACT INTERVALS (Used for Simulation) ---
function useInterval(callback, delay) {
  const savedCallback = useRef();
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

// --- GEMINI API INTEGRATION ---
// --- GEMINI API INTEGRATION ---
const callGemini = async (prompt, systemInstruction = "") => {
  const apiKey = "AIzaSyBjRAiC6xmLdDBkjtrD7i4zbFai94CwIfg"; 
  
  // Using direct concatenation to prevent hidden mobile line-break errors
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey;


  const localFallbacks = {
    'Resource Hierarchy': "THE DIJKSTRA FIX: Think of the numbered forks like a staircase...",
    'Arbitrator': "THE WAITER RULE: A central 'Waiter'...",
    'Chandy-Misra': "THE CLEAN FORK LOGIC...",
    'Semaphore Mutex': "THE STOPLIGHT..."
  };

  // Safely combining the system prompt to guarantee 100% payload compatibility
  const safePrompt = systemInstruction ? `SYSTEM RULE: ${systemInstruction}\n\nUSER PROMPT: ${prompt}` : prompt;

  const payload = {
    contents: [{ parts: [{ text: safePrompt }] }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    // If Google rejects it, extract their EXACT error message
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || localFallbacks[systemInstruction] || "Response unavailable.";
  } catch (error) {
    // If a fallback exists for the table, show it. Otherwise, print the REAL error.
    if (localFallbacks[systemInstruction]) return localFallbacks[systemInstruction];
    return `API CONNECTION FAILED: ${error.message}`;
  }
};


  const localFallbacks = {
    "Resource Hierarchy":
      "THE DIJKSTRA FIX: Think of the numbered forks like a staircase. The rule is you can only step UP to a higher number. A deadlock is a closed circle of waiting. But you can't walk in a circle if you're forced to keep going UP—eventually, you'd have to step down to close the loop, which breaks the rule. Because a circle can never form, the system can never deadlock.",
    Arbitrator:
      "THE WAITER RULE: A central 'Waiter' (the Arbitrator) watches the table. You can't just grab a fork; you have to ask. The Waiter only lets you pick up your forks if BOTH are sitting on the table. This stops the 'Hold and Wait' problem by making fork-grabbing an 'all-or-nothing' deal.",
    "Chandy-Misra":
      "THE CLEAN FORK LOGIC: Forks are either 'clean' or 'dirty.' When a philosopher wants to eat, they send a request to their neighbor. If the neighbor's fork is dirty, they clean it and give it up. This ensures that no one is left waiting forever (Starvation) and resources naturally flow to whoever is hungriest.",
    "Semaphore Mutex":
      "THE STOPLIGHT: Using a 'Mutex' (Mutual Exclusion) lock. It's like a stoplight for your code. It ensures that only one philosopher can interact with a fork at a time, preventing data corruption, but it requires careful logic to make sure the lights don't all stay red at once.",
  };

  

// --- ASK DIJKSTRA CHAT COMPONENT ---
function DijkstraChat({ handleMouseEnter, handleMouseLeave }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "I am the simulated ghost of Dijkstra. Ask me about deadlocks, or don't. I have limited patience.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    const systemPrompt =
      "You are a grumpy, brilliant, 1960s computer scientist like Edsger W. Dijkstra. You are an expert on concurrency, deadlocks, and the Dining Philosophers problem. Keep your answers brief, highly technical, slightly cynical, and use brutalist plain-text formatting.";

    const conversationHistory = messages
      .map((m) => `${m.role === "ai" ? "Dijkstra" : "User"}: ${m.text}`)
      .join("\n");
    const fullPrompt = `History:\n${conversationHistory}\nUser: ${userMsg}\nDijkstra:`;

    const response = await callGemini(fullPrompt, systemPrompt);

    setMessages((prev) => [...prev, { role: "ai", text: response }]);
    setIsLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed bottom-6 right-6 z-[100] bg-[#e84a27] text-white border-2 border-black px-4 py-2 font-black uppercase tracking-widest shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all pointer-events-auto"
      >
        {isOpen ? "CLOSE TERMINAL" : "✨ ASK DIJKSTRA"}
      </button>

      {isOpen && (
        <div
          className="fixed bottom-20 right-6 z-[99] w-[90vw] md:w-[400px] h-[500px] bg-[#f4f4f0] border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col cursor-auto pointer-events-auto"
          onMouseEnter={handleMouseLeave}
        >
          <div className="bg-black text-white px-4 py-3 font-black uppercase tracking-widest flex justify-between items-center border-b-4 border-black">
            <span>TERMINAL: Dijkstra</span>
            <div className="w-3 h-3 rounded-full bg-[#11b55d] animate-pulse"></div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#f4f4f0]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <span className="text-[10px] font-bold uppercase mb-1 text-gray-500">
                  {msg.role === "user" ? "YOU" : "DIJKSTRA"}
                </span>
                <div
                  className={`px-4 py-2 text-sm font-medium border-2 border-black max-w-[85%] ${msg.role === "user" ? "bg-[#6aa1e0] text-black" : "bg-white text-black"}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold uppercase mb-1 text-gray-500">
                  DIJKSTRA
                </span>
                <div className="px-4 py-2 text-sm font-medium border-2 border-black bg-white text-black italic">
                  Computing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="p-3 border-t-4 border-black bg-white flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your query..."
              className="flex-1 bg-transparent border-2 border-black px-3 py-2 text-sm font-bold focus:outline-none focus:bg-[#e84a27]/10 placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-black text-white px-4 py-2 font-bold uppercase text-sm hover:bg-[#e84a27] hover:text-black transition-colors disabled:opacity-50 border-2 border-black"
            >
              SEND
            </button>
          </form>
        </div>
      )}
    </>
  );
}

// --- INLINE STYLES FOR ANIMATIONS & EXACT VIDEO MATCHING ---
const styles = `
  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 35s linear infinite;
  }
  body {
    cursor: none;
    background-color: #f4f4f0; 
    color: #111;
  }
  a, button {
    cursor: none;
  }
  
  /* Lighter, clearer red filter for the hero image */
  .red-monochrome {
    filter: grayscale(100%) contrast(130%) brightness(90%);
    mix-blend-mode: multiply;
  }
  
  /* 35mm Gritty Film Filter for the grid images */
  .gritty-film {
    filter: grayscale(40%) contrast(140%) sepia(30%) brightness(90%);
    transition: filter 0.5s ease, transform 0.7s ease;
  }
  .group:hover .gritty-film {
    filter: grayscale(0%) contrast(120%) sepia(10%) brightness(100%);
    transform: scale(1.03);
  }

  /* Hide scrollbar for brutalist look */
  ::-webkit-scrollbar {
    display: none;
  }
`;

export default function App() {
  const [currentView, setCurrentView] = useState("landing");
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  // Custom Cursor Tracker
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  return (
    <div className="min-h-screen overflow-x-hidden font-sans selection:bg-[#d84018] selection:text-white pb-0">
      <style>{styles}</style>

      {/* --- CUSTOM CURSOR (Yellow Kodak Film Canister Style) --- */}
      <div
        className="fixed pointer-events-none z-[9999] flex items-center justify-center transition-transform duration-100 ease-out"
        style={{
          left: cursorPos.x,
          top: cursorPos.y,
          transform: `translate(-50%, -50%) ${isHovering ? "scale(1.2) rotate(5deg)" : "scale(1) rotate(-15deg)"}`,
        }}
      >
        <div className="w-8 h-12 bg-[#FFD700] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          {/* Film holes left */}
          <div className="absolute left-0 top-0 h-full w-[6px] border-r-2 border-black bg-black flex flex-col justify-evenly items-center">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-[3px] h-[4px] bg-[#FFD700] rounded-[1px]"
              />
            ))}
          </div>
          {/* Film holes right */}
          <div className="absolute right-0 top-0 h-full w-[6px] border-l-2 border-black bg-black flex flex-col justify-evenly items-center">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-[3px] h-[4px] bg-[#FFD700] rounded-[1px]"
              />
            ))}
          </div>
          <span className="font-black text-[10px] transform -rotate-90 tracking-widest text-black ml-1">
            {isHovering ? "CLICK" : "FORK"}
          </span>
        </div>
      </div>

      {/* --- TOP MARQUEE (Black bg, white text) --- */}
      <div className="fixed top-0 left-0 w-full bg-[#111] text-[#Eae8e3] py-[6px] border-b-2 border-black overflow-hidden flex whitespace-nowrap z-[100]">
        <div className="animate-marquee text-xs font-semibold tracking-widest uppercase">
          an educational computer science archive — exploring concurrency,
          deadlocks, starvation, and the dining philosophers problem — designed
          for students — an educational computer science archive — exploring
          concurrency, deadlocks, starvation, and the dining philosophers
          problem — designed for students —
        </div>
      </div>

      {currentView === "landing" && (
        <LandingView
          setCurrentView={setCurrentView}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
        />
      )}
      {currentView === "simulation" && (
        <SimulationView
          setCurrentView={setCurrentView}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
        />
      )}
      {currentView === "about" && (
        <AboutView
          setCurrentView={setCurrentView}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
        />
      )}

      <DijkstraChat
        handleMouseEnter={handleMouseEnter}
        handleMouseLeave={handleMouseLeave}
      />
    </div>
  );
}

// --- EXACT VIDEO MATCH LANDING VIEW ---
function LandingView({ setCurrentView, handleMouseEnter, handleMouseLeave }) {
  // --- SCROLL NAV STATE ---
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Trigger the dock effect after scrolling past 60px
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- AI DEEP DIVE STATE ---
  const [expandedAlgo, setExpandedAlgo] = useState(null);
  const [algoDetails, setAlgoDetails] = useState({});
  const [isLoadingAlgo, setIsLoadingAlgo] = useState(false);

  const handleDeepDive = async (algoName, e) => {
    e.stopPropagation();
    if (expandedAlgo === algoName) {
      setExpandedAlgo(null);
      return;
    }
    setExpandedAlgo(algoName);
    if (algoDetails[algoName]) return;

    setIsLoadingAlgo(true);
    const prompt = `Provide a deep architectural dive into the ${algoName} algorithm for solving the Dining Philosophers problem. Explain the precise mechanism it uses to avoid deadlocks. Format it as a gritty, highly technical, and concise system report (max 2 paragraphs).`;
    const response = await callGemini(prompt, algoName);
    setAlgoDetails((prev) => ({ ...prev, [algoName]: response }));
    setIsLoadingAlgo(false);
  };

  return (
    <main className="w-full relative">
      {/* 1. HERO SECTION (Lighter red, clear image) */}
      <section className="relative w-full h-[85vh] bg-[#7a0000] mb-24 md:mb-40 flex justify-center mt-[36px]">
        <img
          src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=2000&q=80"
          alt="Philosophers Table"
          className="absolute inset-0 w-full h-full object-cover red-monochrome opacity-90"
        />
        <div className="absolute inset-0 bg-[#d84018] mix-blend-multiply opacity-40"></div>
        <div className="absolute inset-0 bg-black opacity-10"></div>

        {/* Dynamic Scrolling Navigation */}
        <nav
          className={`fixed left-0 w-full transition-all duration-300 z-[90] ${
            isScrolled
              ? "top-[28px] py-3 bg-[#f4f4f0] border-b-[3px] border-black shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
              : "top-[40px] md:top-[50px] py-6 bg-transparent pointer-events-none"
          }`}
        >
          <div className="w-full max-w-[1800px] mx-auto flex justify-between items-center px-4 md:px-8">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-black transition-transform pointer-events-auto ${
                isScrolled
                  ? "bg-black text-white hover:scale-105"
                  : "bg-white text-black shadow-lg hover:scale-110"
              }`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              P
            </div>

            <div className="flex gap-2 md:gap-3 font-black text-[12px] md:text-[13px] tracking-wide pointer-events-auto">
              <button
                onClick={() => setCurrentView("landing")}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`bg-[#d84018] text-white px-5 py-2 rounded-full hover:brightness-110 transition-all ${
                  isScrolled
                    ? "border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                    : "shadow-md"
                }`}
              >
                Info
              </button>
              <button
                onClick={() => setCurrentView("simulation")}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`bg-[#12b855] text-white px-5 py-2 rounded-full hover:brightness-110 transition-all ${
                  isScrolled
                    ? "border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                    : "shadow-md"
                }`}
              >
                Simulation
              </button>
              <button
                onClick={() => setCurrentView("about")}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`bg-[#88aadd] text-black px-5 py-2 rounded-full hover:brightness-110 transition-all ${
                  isScrolled
                    ? "border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                    : "shadow-md"
                }`}
              >
                About
              </button>
            </div>

            <div className="w-10 hidden md:block"></div>
          </div>
        </nav>

        <h1 className="absolute bottom-0 w-full text-center text-[18vw] leading-[0.8] font-black text-white z-10 tracking-tighter select-none pb-4 md:pb-8">
          Dining <br className="hidden md:block" />
          Philosophers
        </h1>
      </section>

      {/* 2. ARTICLES GRID */}
      <section className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 lg:gap-24">
          <article
            className="group cursor-none flex flex-col"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="w-full aspect-[4/3] bg-white overflow-hidden mb-5">
              <img
                src="/circularwait.png"
                alt="Circular Wait Deadlock Illustration"
                className="w-full h-full object-cover gritty-film"
              />
            </div>
            <h2 className="text-3xl md:text-[2.5rem] font-bold leading-[1.1] mb-2 tracking-tight text-black">
              Circular Wait: When Systems Freeze
            </h2>
            <p className="text-[13px] font-bold uppercase text-gray-500 tracking-widest mt-1">
              Deadlock - Core Concept
            </p>
          </article>

          <article
            className="group cursor-none flex flex-col pt-0 md:pt-32"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="w-full aspect-[4/3] bg-black overflow-hidden mb-5">
              <img
                src="/starvation1.png"
                alt="Starvation Plate"
                className="w-full h-full object-cover gritty-film"
              />
            </div>
            <h2 className="text-3xl md:text-[2.5rem] font-bold leading-[1.1] mb-2 tracking-tight text-black">
              The Infinite Delay: Resource Starvation
            </h2>
            <p className="text-[13px] font-bold uppercase text-gray-500 tracking-widest mt-1">
              Starvation - Core Concept
            </p>
          </article>
        </div>
      </section>

      {/* 3. EXPLORE THEORY BANNER */}
      <div className="w-full border-y border-black py-8 bg-white flex justify-center items-center mt-12 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <h2 className="text-5xl md:text-7xl font-serif italic tracking-tighter pr-4 text-black">
          Explore Theory
        </h2>
      </div>

      {/* 4. FEATURED ALGORITHM */}
      <section className="relative w-full bg-[#111] text-white py-32 px-4 md:px-8 mt-12 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80)",
            backgroundSize: "cover",
          }}
        ></div>

        <div className="max-w-[1600px] mx-auto relative z-10">
          <h3 className="text-[11vw] md:text-[7vw] leading-[0.8] font-black tracking-tighter mb-16 opacity-90 text-white">
            Dijkstra's
            <br />
            Resource Hierarchy
          </h3>

          <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b-2 border-white/20 pb-8 gap-8 group">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 max-w-4xl">
              <div className="bg-[#88aadd] text-black px-4 py-2 text-[15px] font-black tracking-widest uppercase shrink-0 mt-2 md:mt-0">
                THE ORIGINAL
              </div>
              <div>
                <h4 className="text-2xl md:text-3xl font-medium leading-relaxed mb-4 text-white/90">
                  Proposed in 1965, Dijkstra's solution breaks the symmetry of
                  the problem. It requires that all resources (forks) be
                  numbered, and each philosopher must always pick up the
                  lower-numbered fork first. This completely eliminates the
                  possibility of a circular wait.
                </h4>
                <button
                  onClick={() => setCurrentView("simulation")}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="text-lg md:text-xl flex items-center gap-2 text-[#12b855] hover:text-white transition-colors font-bold uppercase tracking-wide pointer-events-auto"
                >
                  <span className="text-xs">▶</span> See it in action
                </button>
              </div>
            </div>

            <div className="text-5xl md:text-7xl font-black text-white/20 tracking-tighter shrink-0">
              1965
            </div>
          </div>
        </div>
      </section>

      {/* 5. SELECTS TABLE */}
      <section className="max-w-[1600px] mx-auto px-4 md:px-8 py-32">
        <h3 className="text-7xl md:text-[7rem] font-black tracking-tighter mb-16 text-black">
          Selects
        </h3>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b-[3px] border-black text-lg">
                <th className="py-6 font-black w-1/4">Algorithm</th>
                <th className="py-6 font-black w-1/6">Year</th>
                <th className="py-6 font-black w-1/4">Approach</th>
                <th className="py-6 font-black w-1/4">Why use it</th>
                <th className="py-6 font-black text-right">Deep Dive</th>
              </tr>
            </thead>
            <tbody className="text-lg">
              {[
                {
                  name: "Resource Hierarchy",
                  year: "1965",
                  approach: "Numbered forks",
                  why: "Simple, prevents cyclical deadlocks",
                },
                {
                  name: "Arbitrator",
                  year: "1970",
                  approach: "Central waiter",
                  why: "Guaranteed no deadlock, lower concurrency",
                },
                {
                  name: "Chandy-Misra",
                  year: "1984",
                  approach: "Message passing",
                  why: "Highly distributed, perfectly fair",
                },
                {
                  name: "Semaphore Mutex",
                  year: "1965",
                  approach: "State locking",
                  why: "Classic OS-level synchronization",
                },
              ].map((item, idx) => (
                <React.Fragment key={idx}>
                  <tr
                    onClick={(e) => handleDeepDive(item.name, e)}
                    className={`border-b border-black/20 hover:bg-black hover:text-white transition-colors group cursor-none pointer-events-auto ${expandedAlgo === item.name ? "bg-black text-white" : ""}`}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <td className="py-8 font-bold group-hover:pl-4 transition-all text-xl">
                      {item.name}
                    </td>
                    <td className="py-8 font-mono text-base">{item.year}</td>
                    <td className="py-8">{item.approach}</td>
                    <td className="py-8 italic opacity-70">{item.why}</td>
                    <td className="py-8 text-right">
                      <button
                        className={`text-[11px] font-black uppercase px-4 py-2 border-[2px] border-current transition-colors tracking-widest ${expandedAlgo === item.name ? "bg-[#d84018] text-white border-[#d84018]" : "hover:bg-[#12b855] hover:text-black hover:border-[#12b855]"}`}
                      >
                        {expandedAlgo === item.name ? "CLOSE" : "READ"}
                      </button>
                    </td>
                  </tr>
                  {/* EXPANDED AI ROW */}
                  {expandedAlgo === item.name && (
                    <tr
                      className="bg-[#f4f4f0] border-b-[3px] border-black text-black"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <td colSpan={5} className="p-8 md:p-12">
                        <div className="flex gap-6 max-w-4xl mx-auto">
                          <div className="w-[6px] bg-[#d84018]"></div>
                          <div className="flex-1 font-mono text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                            {isLoadingAlgo && !algoDetails[item.name] ? (
                              <span className="animate-pulse text-[#d84018]">
                                Initiating uplink to Oracle... Analyzing{" "}
                                {item.name} architecture...
                              </span>
                            ) : (
                              algoDetails[item.name]
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. ORANGE CTA BANNER */}
      <section className="w-full bg-[#d84018] text-black py-32 px-4 flex flex-col items-center justify-center text-center border-y-2 border-black relative overflow-hidden">
        {/* Exact circle cutouts from the video */}
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#f4f4f0] rounded-full border-2 border-black"></div>
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#f4f4f0] rounded-full border-2 border-black"></div>
        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-[#f4f4f0] rounded-full border-2 border-black"></div>
        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-[#f4f4f0] rounded-full border-2 border-black"></div>

        <h2 className="text-[10vw] md:text-[6vw] leading-none font-black tracking-tighter mb-4 italic">
          Understand the Simulation
        </h2>
        <p className="text-lg md:text-2xl font-medium mb-12 max-w-2xl opacity-90">
          Stop reading theory. Watch five concurrent threads compete for shared
          resources in real-time.
        </p>
        <button
          onClick={() => setCurrentView("simulation")}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="bg-black text-[#d84018] px-12 py-5 text-lg font-bold hover:bg-white hover:text-black transition-colors rounded-sm shadow-[6px_6px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.3)] uppercase tracking-widest pointer-events-auto"
        >
          Launch Simulation
        </button>
      </section>

      {/* 7. FOOTER */}
      <footer className="w-full bg-[#111] text-white pt-24 pb-12 px-4 md:px-8 flex flex-col md:flex-row justify-between items-end gap-12">
        <h1 className="text-[14vw] md:text-[9vw] leading-[0.75] font-black tracking-tighter uppercase text-white">
          Dining
          <br />
          Philosophers
        </h1>

        <div className="flex gap-16 text-[11px] font-black tracking-widest uppercase pb-4">
          <div className="flex flex-col gap-4">
            <span className="text-gray-500 mb-2 border-b border-gray-800 pb-2">
              CS Resources
            </span>
            <a
              href="https://en.wikipedia.org/wiki/Dining_philosophers_problem"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#12b855] transition-colors cursor-pointer pointer-events-auto"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              Dining Problem Wiki
            </a>
            <a
              href="https://en.wikipedia.org/wiki/Deadlock"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#12b855] transition-colors cursor-pointer pointer-events-auto"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              Deadlock Concepts
            </a>
            <a
              href="https://en.wikipedia.org/wiki/Concurrency_(computer_science)"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#12b855] transition-colors cursor-pointer pointer-events-auto"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              Concurrency Theory
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

// --- NEW FUNCTIONAL ABOUT VIEW ---
function AboutView({ setCurrentView, handleMouseEnter, handleMouseLeave }) {
  return (
    <main className="w-full min-h-screen bg-[#f4f4f0] text-black pt-32 pb-20 px-4 md:px-8 flex flex-col items-center pointer-events-auto">
      <div className="max-w-4xl w-full flex flex-col">
        <div className="mb-12 self-start">
          <button
            onClick={() => setCurrentView("landing")}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="border-[3px] border-black px-6 py-3 font-black uppercase text-sm tracking-widest hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
          >
            ← Back to Archive
          </button>
        </div>

        <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter leading-[0.85] mb-12 uppercase">
          About <br /> The Archive
        </h1>

        <div className="bg-white border-[4px] border-black p-8 md:p-12 shadow-[12px_12px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-4 h-4 bg-[#d84018]"></div>
            <h2 className="text-xl font-black uppercase tracking-widest text-gray-500">
              Project Overview
            </h2>
          </div>

          <p className="text-xl md:text-2xl font-medium mb-8 leading-relaxed border-l-4 border-black pl-6">
            This project is an interactive, brutalist educational archive
            designed to explore the <strong>Dining Philosophers Problem</strong>
            , a classic computer science concurrency challenge formulated by
            Edsger W. Dijkstra in 1965.
          </p>
          <p className="text-xl md:text-2xl font-medium mb-12 leading-relaxed pl-7">
            By visualizing concepts like <em>Circular Wait</em>,{" "}
            <em>Deadlocks</em>, and <em>Resource Starvation</em> in real-time,
            this archive bridges the gap between theoretical operating system
            design and practical system failures. The integrated terminal
            simulation physically maps out how naive locking strategies lead to
            catastrophic system halts under load.
          </p>

          <div className="pt-8 border-t-[3px] border-black flex flex-col md:flex-row gap-12">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-2">
                Developed For
              </h3>
              <p className="font-bold text-lg">
                Computer Science Education & System Architecture Students
              </p>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-2">
                Core Concepts
              </h3>
              <p className="font-bold text-lg">
                Concurrency, Mutex Locks, Total Ordering
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// --- INTERACTIVE SIMULATION VIEW ---
function SimulationView({
  setCurrentView,
  handleMouseEnter,
  handleMouseLeave,
}) {
  const [running, setRunning] = useState(false);
  const [strategy, setStrategy] = useState("naive");
  const [isDeadlocked, setIsDeadlocked] = useState(false);
  const [logs, setLogs] = useState([
    "SYSTEM BOOT...",
    "INITIALIZING 5 THREADS",
    "AWAITING EXECUTION.",
  ]);

  const tickCount = useRef(0);

  const [philosophers, setPhilosophers] = useState(
    Array(5)
      .fill()
      .map((_, i) => ({
        id: i,
        state: "THINKING",
        timer: Math.floor(Math.random() * 4) + 2,
      })),
  );
  const [forks, setForks] = useState(Array(5).fill(null));

  const logEndRef = useRef(null);

  const addLog = (msg) => {
    setLogs((prev) => {
      const newLogs = [...prev, `> ${msg}`];
      if (newLogs.length > 50) return newLogs.slice(newLogs.length - 50);
      return newLogs;
    });
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const resetSim = () => {
    setRunning(false);
    setIsDeadlocked(false);
    tickCount.current = 0;
    setPhilosophers(
      Array(5)
        .fill()
        .map((_, i) => ({
          id: i,
          state: "THINKING",
          timer: Math.floor(Math.random() * 4) + 2,
        })),
    );
    setForks(Array(5).fill(null));
    setLogs([
      "SYSTEM RESET",
      `STRATEGY: ${strategy.toUpperCase()}`,
      "AWAITING EXECUTION.",
    ]);
  };

  useInterval(
    () => {
      if (!running || isDeadlocked) return;

      tickCount.current += 1;

      if (strategy === "naive" && tickCount.current === 15) {
        addLog("WARNING: SYSTEM LOAD SPIKE DETECTED.");
        addLog("THREAD REQUEST RATE ACCELERATING...");
      }

      setPhilosophers((prevPhils) => {
        let nextPhils = prevPhils.map((p) => ({ ...p }));
        let nextForks = [...forks];
        let newDeadlock = false;

        nextPhils.forEach((p, i) => {
          if (p.state === "EATING") {
            p.timer--;
            if (p.timer <= 0) {
              p.state = "THINKING";
              p.timer =
                strategy === "naive" && tickCount.current >= 15
                  ? 1
                  : Math.floor(Math.random() * 4) + 3;

              nextForks[i] = null;
              nextForks[(i + 1) % 5] = null;
              addLog(`P${i} finished eating. Released forks.`);
            }
          }
        });

        nextPhils.forEach((p, i) => {
          if (p.state === "THINKING") {
            p.timer--;
            if (p.timer <= 0) {
              p.state = "HUNGRY";
              addLog(`P${i} is HUNGRY.`);
            }
          }
        });

        nextPhils.forEach((p, i) => {
          if (p.state === "HUNGRY") {
            let leftFork = i;
            let rightFork = (i + 1) % 5;

            let firstFork =
              strategy === "hierarchy"
                ? Math.min(leftFork, rightFork)
                : leftFork;
            let secondFork =
              strategy === "hierarchy"
                ? Math.max(leftFork, rightFork)
                : rightFork;

            if (nextForks[firstFork] !== i) {
              if (nextForks[firstFork] === null) {
                nextForks[firstFork] = i;
                addLog(`P${i} locked Fork ${firstFork}`);
              }
            } else {
              if (nextForks[secondFork] === null) {
                nextForks[secondFork] = i;
                p.state = "EATING";
                p.timer = Math.floor(Math.random() * 3) + 2;
                addLog(`P${i} locked Fork ${secondFork} -> EATING`);
              }
            }
          }
        });

        if (strategy === "naive") {
          const allHungry = nextPhils.every((p) => p.state === "HUNGRY");
          const noFreeForks = nextForks.every((f) => f !== null);
          if (allHungry && noFreeForks && !isDeadlocked) {
            newDeadlock = true;
            addLog("All 5 processes have taken 1 fork.");
            addLog("!!! CRITICAL: CIRCULAR WAIT DETECTED !!!");
            addLog("!!! SYSTEM DEADLOCK !!!");
          }
        }

        setForks(nextForks);
        if (newDeadlock) setIsDeadlocked(true);
        return nextPhils;
      });
    },
    running ? 800 : null,
  );

  const radius = 120;
  const getCoords = (index, total, offset = 0) => {
    const angle = (index / total) * (2 * Math.PI) - Math.PI / 2 + offset;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  return (
    <main className="w-full min-h-screen lg:h-screen bg-[#f4f4f0] text-black pt-[36px] flex flex-col pointer-events-auto relative">
      {/* SIM NAV */}
      <nav className="w-full border-b-[3px] border-black bg-white flex justify-between items-center px-4 md:px-8 py-4 sticky top-[36px] z-50 shrink-0">
        <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">
          Simulation / DP-03
        </h1>
        <button
          onClick={() => setCurrentView("landing")}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="border-[3px] border-black px-4 py-1 text-sm font-bold uppercase hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]"
        >
          ← Back to Archive
        </button>
      </nav>

      {/* SIM CONTENT GRID */}
      <div className="flex-1 w-full flex flex-col lg:flex-row lg:overflow-hidden">
        {/* LEFT: VISUALIZER */}
        <div className="flex-1 relative flex items-center justify-center p-8 min-h-[400px] lg:min-h-0 border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-black bg-[#Eae8e3] lg:overflow-hidden">
          {isDeadlocked && (
            <div className="absolute inset-0 bg-[#d84018]/20 z-10 flex items-center justify-center backdrop-blur-[2px]">
              <h2 className="text-[6vw] font-black text-[#d84018] mix-blend-multiply tracking-tighter animate-pulse rotate-[-5deg]">
                DEADLOCK
              </h2>
            </div>
          )}

          {/* The Table */}
          <div className="relative w-[300px] h-[300px] rounded-full border-[6px] border-black bg-white shadow-[16px_16px_0px_rgba(0,0,0,0.1)]">
            {/* Philosophers */}
            {philosophers.map((p, i) => {
              const pos = getCoords(i, 5);
              const isEating = p.state === "EATING";
              const isHungry = p.state === "HUNGRY";
              return (
                <div
                  key={i}
                  className={`absolute w-16 h-16 -ml-8 -mt-8 rounded-full border-4 border-black flex items-center justify-center font-black text-xl z-20 transition-colors duration-300 ${
                    isEating
                      ? "bg-[#12b855] text-white scale-110 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                      : isHungry
                        ? "bg-[#d84018] text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                        : "bg-[#e0e0e0] text-gray-500 shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"
                  }`}
                  style={{
                    left: `calc(50% + ${pos.x}px)`,
                    top: `calc(50% + ${pos.y}px)`,
                  }}
                >
                  P{i}
                </div>
              );
            })}

            {/* Forks */}
            {forks.map((owner, i) => {
              const pos = getCoords(i + 0.5, 5, 0);
              const isHeld = owner !== null;
              return (
                <div
                  key={`fork-${i}`}
                  className={`absolute w-8 h-8 -ml-4 -mt-4 border-[3px] border-black flex items-center justify-center font-bold text-xs z-10 transition-colors ${
                    isHeld
                      ? "bg-black text-white shadow-none"
                      : "bg-[#FFD700] text-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                  }`}
                  style={{
                    left: `calc(50% + ${pos.x * 0.7}px)`,
                    top: `calc(50% + ${pos.y * 0.7}px)`,
                  }}
                >
                  F{i}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: CONTROLS & TERMINAL */}
        <div className="w-full lg:w-[400px] xl:w-[500px] flex flex-col bg-white lg:overflow-hidden shrink-0">
          {/* Controls */}
          <div className="p-6 border-b-[3px] border-black flex flex-col gap-6 shrink-0">
            <div>
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-3">
                Algorithm Strategy
              </h3>
              <div className="flex bg-gray-200 p-1 border-[3px] border-black">
                <button
                  onClick={() => {
                    setStrategy("naive");
                    resetSim();
                  }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className={`flex-1 py-2 text-sm font-bold uppercase transition-all ${strategy === "naive" ? "bg-[#d84018] text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] border-2 border-black scale-[1.02]" : "text-gray-500 hover:text-black border-2 border-transparent"}`}
                >
                  Naive (Deadlock)
                </button>
                <button
                  onClick={() => {
                    setStrategy("hierarchy");
                    resetSim();
                  }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className={`flex-1 py-2 text-sm font-bold uppercase transition-all ${strategy === "hierarchy" ? "bg-[#12b855] text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] border-2 border-black scale-[1.02]" : "text-gray-500 hover:text-black border-2 border-transparent"}`}
                >
                  Hierarchy (Safe)
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setRunning(!running)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                disabled={isDeadlocked}
                className={`flex-1 py-4 font-black uppercase text-lg border-[3px] border-black transition-all ${
                  isDeadlocked
                    ? "opacity-50 cursor-not-allowed bg-gray-200"
                    : running
                      ? "bg-black text-white"
                      : "bg-white text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                }`}
              >
                {running ? "|| Pause" : "▶ Execute"}
              </button>
              <button
                onClick={resetSim}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="px-6 border-[3px] border-black bg-white text-black font-black uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Terminal */}
          <div className="flex-1 bg-black p-6 flex flex-col h-[350px] lg:h-auto lg:overflow-hidden shrink-0 shadow-inner">
            <h3 className="text-[#12b855] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 shrink-0 border-b border-gray-800 pb-2">
              <div
                className={`w-2 h-2 rounded-full ${running ? "bg-[#12b855] animate-pulse" : "bg-gray-600"}`}
              ></div>
              Execution Log
            </h3>
            <div className="flex-1 overflow-y-auto font-mono text-[13px] text-[#88aadd] flex flex-col gap-1.5 pr-2 pb-2">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`${log.includes("CRITICAL") || log.includes("DEADLOCK") ? "text-[#d84018] font-bold bg-[#d84018]/10 px-2 py-1" : ""} ${log.includes("SYSTEM LOAD SPIKE") ? "text-[#FFD700] font-bold" : ""}`}
                >
                  {log}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
