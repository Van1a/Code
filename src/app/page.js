"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function Home() {
  const router = useRouter();
  const [response, setResponse] = useState("Loading...");

  useEffect(() => {
    fetch("https://corsproxy.io/https://nerium.vercel.app/api/anime-eternal")
      .then(res => res.json())
      .then(data => setResponse(data))
      .catch(() => setResponse({ error: "Failed to fetch API" }));
  }, []);

  const goToHome = () => {
    router.push("/home");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black via-gray-900 to-gray-950 text-white">
      
      <img
        className="h-24 w-24 rounded-2xl mb-5 shadow-[0_0_25px_rgba(34,197,94,0.6)]"
        src="https://chatgpt.com/backend-api/estuary/public_content/enc/eyJpZCI6Im1fNjhmNGU0MDU1MTcwODE5MTg5YzJkMDgyYjkyZDNhZGI6ZmlsZV8wMDAwMDAwMDE0NTg2MjJmYWI1ZmMyZGJkYzgwMTM1NCIsInRzIjoiMjAzODAiLCJwIjoicHlpIiwiY2lkIjoiMSIsInNpZyI6ImFjOGYyNTZkOGFkMDkxZWMyZDEwMGFhYjYzZDRkYzQxOWNkNWZkOTBiNTliNmM2ODgxMjgxMTViODZmNDkxYzIiLCJ2IjoiMCIsImdpem1vX2lkIjpudWxsLCJjcCI6bnVsbCwibWEiOm51bGx9"
      />

      <h1 className="text-5xl font-extrabold text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.7)]">Nerium API</h1>
      <p className="text-gray-300 mt-2 text-lg">Fast • Simple • Reliable</p>
      <p className="text-gray-400 mt-1 text-sm text-center max-w-xs">Very reliable when it comes to Game Code — supported more than 150+ Games!</p>

      <button
        onClick={goToHome}
        className="mt-8 px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]"
      >
        Go to Home
      </button>

      <div className="mt-10 w-80 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-[0_0_20px_rgba(255,255,255,0.1)] max-h-64 overflow-auto">
        <h2 className="text-green-400 text-lg font-semibold mb-2">API Response</h2>
        
        {response?.data?.metadata?.apiServe && (
          <p className="text-yellow-400 mb-2 text-sm">
            API fetched <strong>{response.data.metadata.apiServe}</strong> times
          </p>
        )}
        
        <pre className="text-sm whitespace-pre-wrap break-words font-mono">
          {JSON.stringify(response, null, 2)}
        </pre>
      </div>

    </div>
  );
}

export default Home;
