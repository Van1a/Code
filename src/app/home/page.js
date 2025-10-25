"use client";

import { useEffect, useState } from "react";

function Supported() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("https://nerium.vercel.app/api/supported")
      .then(res => res.json())
      .then(res => setData(res.Supported))
      .catch(() => setData([]));
  }, []);

  const filtered = data.filter(item => item.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-black via-gray-900 to-gray-950 text-white p-4">
      
      <img
        src="https://chatgpt.com/backend-api/estuary/public_content/enc/eyJpZCI6Im1fNjhmNGU0MDU1MTcwODE5MTg5YzJkMDgyYjkyZDNhZGI6ZmlsZV8wMDAwMDAwMDE0NTg2MjJmYWI1ZmMyZGJkYzgwMTM1NCIsInRzIjoiMjAzODAiLCJwIjoicHlpIiwiY2lkIjoiMSIsInNpZyI6ImFjOGYyNTZkOGFkMDkxZWMyZDEwMGFhYjYzZDRkYzQxOWNkNWZkOTBiNTliNmM2ODgxMjgxMTViODZmNDkxYzIiLCJ2IjoiMCIsImdpem1vX2lkIjpudWxsLCJjcCI6bnVsbCwibWEiOm51bGx9"
        className="h-24 w-24 rounded-2xl mb-5 shadow-[0_0_25px_rgba(34,197,94,0.6)]"
      />

      <h1 className="text-4xl font-extrabold text-green-400 mb-1">Code Scout Nerium</h1>
      <p className="text-gray-300 mb-4 text-center">Supported Games & Codes</p>

      <input
        type="text"
        placeholder="Search supported games..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-6 px-4 py-2 w-full max-w-md rounded-xl text-black focus:outline-none"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
        {filtered.length ? filtered.map((item, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-[0_0_20px_rgba(255,255,255,0.1)] text-center hover:bg-white/10 transition"
          >
            {item}
          </div>
        )) : (
          <p className="text-gray-400 col-span-full text-center">No results found</p>
        )}
      </div>

    </div>
  );
}

export default Supported;
