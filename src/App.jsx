import React, { useState } from 'react';

export default function App() {
  const [inputUrl, setInputUrl] = useState('');
  const [proxyHtml, setProxyHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLaunchBrowser = async (e) => {
    e.preventDefault();
    if (!inputUrl) return;

    setIsLoading(true);
    setErrorMessage('');
    setProxyHtml('');

    // Format URL input automatically
    let target = inputUrl.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }

    try {
      // EXPLOIT: We pass the target URL as an encoded query parameter.
      // School firewalls monitoring your network traffic only see you visiting your own Vercel app.
      const proxyApiUrl = `/api/proxy?url=${encodeURIComponent(target)}`;
      
      const response = await fetch(proxyApiUrl);
      if (!response.ok) throw new Error('Proxy server rejected or dropped connection');
      
      const htmlOutput = await response.text();
      setProxyHtml(htmlOutput);
    } catch (err) {
      setErrorMessage(err.message || 'Network interception triggered error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#111] text-gray-200 overflow-hidden font-sans">
      
      {/* Google-Style Control Sidebar */}
      <aside className="w-80 bg-[#161616] border-r border-gray-800 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-md font-mono tracking-wider text-white">SYNAPPLI // BYPASS_OS</h1>
          </div>

          <form onSubmit={handleLaunchBrowser} className="space-y-3">
            <label className="text-xs text-gray-400 font-mono">TARGET IN-APP URL</label>
            <input
              type="text"
              placeholder="e.g. facebook.com"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full bg-[#222] border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 transition-colors text-white text-xs font-mono py-2 rounded font-bold"
            >
              {isLoading ? 'TUNNELING TRAFFIC...' : 'LAUNCH IN-APP BROWSER'}
            </button>
          </form>

          {errorMessage && (
            <div className="p-3 bg-red-950/50 border border-red-800 rounded text-xs font-mono text-red-400">
              [CRITICAL ERROR]: {errorMessage}
            </div>
          )}
        </div>

        <div className="text-[10px] font-mono text-gray-500 space-y-1">
          <p>DRIVER: VERCEL_SERVERLESS_TUNNEL</p>
          <p>STATUS: SECURITY BYPASS READY</p>
        </div>
      </aside>

      {/* Embedded In-App Viewport Container */}
      <main className="flex-1 bg-white relative flex flex-col">
        {proxyHtml ? (
          <iframe
            title="Proxy Viewport"
            srcDoc={proxyHtml}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        ) : (
          <div className="absolute inset-0 bg-[#0f0f0f] flex flex-col items-center justify-center font-mono text-sm text-gray-500 p-4 text-center">
            <div className="mb-4 text-xl text-gray-400">▲ INPUT DESTINATION URL TO COMMENCE TESTING</div>
            <p className="max-w-md text-xs text-gray-600">
              The traffic is routed directly from Vercel serverless environments. Local firewalls cannot analyze the destination packets.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
