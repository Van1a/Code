"use client";

import { useEffect, useState } from "react";

function Home() {
  const [response, setResponse] = useState("Loading...");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("https://corsproxy.io/https://nerium.vercel.app/api/plants-vs-brainrots")
      .then(res => res.json())
      .then(data => setResponse(data))
      .catch(() => setResponse({ error: "Failed to fetch API" }));
  }, []);

  const copyApi = () => {
    navigator.clipboard.writeText("https://nerium.vercel.app/api/plants-vs-brainrots");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const syntaxHighlight = json => {
    if (typeof json != "string") json = JSON.stringify(json, undefined, 2);
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|\b\d+\b)/g,
      match => {
        let color = "text-gray-300";
        if (/^"/.test(match)) color = /:$/.test(match) ? "text-green-400" : "text-blue-400";
        else if (/true|false/.test(match)) color = "text-purple-400";
        else if (/null/.test(match)) color = "text-gray-500";
        else if (/\b\d+\b/.test(match)) color = "text-pink-400";
        return `<span class="${color}">${match}</span>`;
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black via-gray-900 to-gray-950 text-white">
      <img
        className="h-24 w-24 rounded-2xl mb-5 shadow-[0_0_25px_rgba(34,197,94,0.6)]"
        src="https://chatgpt.com/backend-api/estuary/public_content/enc/eyJpZCI6Im1fNjhmNGU0MDU1MTcwODE5MTg5YzJkMDgyYjkyZDNhZGI6ZmlsZV8wMDAwMDAwMDE0NTg2MjJmYWI1ZmMyZGJkYzgwMTM1NCIsInRzIjoiMjAzODAiLCJwIjoicHlpIiwiY2lkIjoiMSIsInNpZyI6ImFjOGYyNTZkOGFkMDkxZWMyZDEwMGFhYjYzZDRkYzQxOWNkNWZkOTBiNTliNmM2ODgxMjgxMTViODZmNDkxYzIiLCJ2IjoiMCIsImdpem1vX2lkIjpudWxsLCJjcCI6bnVsbCwibWEiOm51bGx9"
      />
      <h1 className="text-5xl font-extrabold text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.7)]">Nerium API</h1>
      <p className="text-gray-300 mt-2 text-lg">Fast • Simple • Reliable</p>
      <p className="text-gray-400 mt-1 text-sm text-center max-w-xs">Very reliable when it comes to Game Code — supported more than 300+ Games!</p>

      <button
        onClick={copyApi}
        className="mt-8 px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]"
      >
        {copied ? "Copied!" : "Copy API"}
      </button>

      <div className="mt-10 w-80 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
        <h2 className="text-green-400 text-lg font-semibold mb-2">API Response</h2>
        <pre
          className="text-sm whitespace-pre-wrap break-words font-mono"
          dangerouslySetInnerHTML={{ __html: syntaxHighlight(response) }}
        />
      </div>
    </div>
  );
}

export default Home;
