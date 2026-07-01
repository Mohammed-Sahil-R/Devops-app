import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Terminal, Play, Plus, Server, Send, Sparkles, Trash2, RefreshCw } from 'lucide-react';

interface ImageLayer {
  instruction: string;
  size: string;
  desc: string;
  color: string;
}

const DOCKERFILE_LAYERS: ImageLayer[] = [
  { instruction: 'FROM node:20-alpine', size: '114 MB', desc: 'Lightweight Linux OS with Node.js runtime environment', color: 'bg-blue-600' },
  { instruction: 'WORKDIR /app', size: '0 B', desc: 'Sets the default working directory inside the filesystem', color: 'bg-sky-600' },
  { instruction: 'COPY package*.json ./', size: '4.2 KB', desc: 'Copies dependency manifests first to optimize cache', color: 'bg-indigo-600' },
  { instruction: 'RUN npm ci', size: '185 MB', desc: 'Installs production-only dependencies strictly from lockfile', color: 'bg-violet-600' },
  { instruction: 'COPY . .', size: '12 MB', desc: 'Copies the actual source code and asset files', color: 'bg-purple-600' },
  { instruction: 'CMD ["node", "server.js"]', size: '0 B', desc: 'Defines the startup execution entry point', color: 'bg-fuchsia-600' }
];

interface ContainerInstance {
  id: string;
  name: string;
  port: number;
  status: 'running' | 'stopped';
  logs: string[];
}

export default function DiagramDocker() {
  const [builtLayers, setBuiltLayers] = useState<ImageLayer[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [containers, setContainers] = useState<ContainerInstance[]>([]);
  const [requestLog, setRequestLog] = useState<string>('Docker engine initialized.');
  const [isSendingRequest, setIsSendingRequest] = useState<string | null>(null);

  const buildStep = () => {
    if (isBuilding || builtLayers.length === DOCKERFILE_LAYERS.length) return;
    setIsBuilding(true);
    const nextLayer = DOCKERFILE_LAYERS[builtLayers.length];
    
    setTimeout(() => {
      setBuiltLayers(prev => [...prev, nextLayer]);
      setIsBuilding(false);
    }, 700);
  };

  const buildAll = () => {
    if (isBuilding || builtLayers.length === DOCKERFILE_LAYERS.length) return;
    setIsBuilding(true);
    let index = builtLayers.length;

    const interval = setInterval(() => {
      if (index < DOCKERFILE_LAYERS.length) {
        setBuiltLayers(prev => [...prev, DOCKERFILE_LAYERS[index]]);
        index++;
      } else {
        clearInterval(interval);
        setIsBuilding(false);
      }
    }, 400);
  };

  const clearImage = () => {
    setBuiltLayers([]);
    setContainers([]);
    setRequestLog('Image cache and container instances purged.');
  };

  const runContainer = () => {
    if (builtLayers.length < DOCKERFILE_LAYERS.length) return;
    if (containers.length >= 3) {
      setRequestLog('Maximum of 3 replica containers running for this sandbox.');
      return;
    }

    const nextId = Math.random().toString(36).substring(2, 7);
    const hostPort = 8080 + containers.length;
    const newContainer: ContainerInstance = {
      id: nextId,
      name: `web-app-container-${nextId}`,
      port: hostPort,
      status: 'running',
      logs: [
        `[${nextId}] Server listening on port 80...`,
        `[${nextId}] Express router mapping active...`,
        `[${nextId}] Static folder ready.`
      ]
    };

    setContainers(prev => [...prev, newContainer]);
    setRequestLog(`docker run successful! Container "${newContainer.name}" is listening on host port ${hostPort} -> container port 80.`);
  };

  const stopContainer = (id: string) => {
    setContainers(prev => prev.filter(c => c.id !== id));
    setRequestLog('Container stopped and removed.');
  };

  const sendHttpRequest = (container: ContainerInstance) => {
    if (isSendingRequest) return;
    setIsSendingRequest(container.id);
    setRequestLog(`Sending HTTP GET request to http://localhost:${container.port}/api/health`);

    setTimeout(() => {
      setRequestLog(`[RESPONSE 200 OK] from Container "${container.name}" (IP: 172.17.0.${Math.floor(Math.random() * 10) + 2})`);
      setIsSendingRequest(null);
    }, 1200);
  };

  const isImageComplete = builtLayers.length === DOCKERFILE_LAYERS.length;

  return (
    <div id="diagram-docker" className="space-y-6">
      {/* Controls & Dockerfile Builder Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Dockerfile Instruction builder */}
        <div className="lg:col-span-5 border border-slate-100 rounded-xl p-5 bg-white dark:bg-slate-950/40 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-sky-600" />
                Local Dockerfile
              </h4>
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-400">v1.2.0</span>
            </div>

            <div className="bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-lg space-y-1">
              {DOCKERFILE_LAYERS.map((layer, index) => {
                const isBuilt = index < builtLayers.length;
                return (
                  <div
                    key={index}
                    className={`p-1.5 rounded transition-all duration-300 flex items-center justify-between ${
                      isBuilt ? 'text-emerald-400 bg-emerald-950/20 border-l-2 border-emerald-500' : 'text-slate-400'
                    }`}
                  >
                    <span>{layer.instruction}</span>
                    {isBuilt && <span className="text-[9px] font-sans px-1.5 bg-emerald-900/40 text-emerald-300 rounded">cached</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <div className="flex gap-2">
              <button
                id="btn-docker-step-build"
                onClick={buildStep}
                disabled={isBuilding || isImageComplete}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 font-medium py-2 rounded-lg text-xs transition cursor-pointer"
              >
                {isBuilding ? 'Building...' : isImageComplete ? 'Image Ready' : '+ Layer-by-Layer'}
              </button>
              <button
                id="btn-docker-build-all"
                onClick={buildAll}
                disabled={isBuilding || isImageComplete}
                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white disabled:bg-slate-100 disabled:text-slate-400 font-medium py-2 rounded-lg text-xs transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Sparkles className="h-3 w-3" />
                Build Image
              </button>
            </div>
            {isImageComplete && (
              <button
                id="btn-docker-clear"
                onClick={clearImage}
                className="w-full text-center text-xs text-rose-600 hover:text-rose-700 flex items-center justify-center gap-1 py-1 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Purge Cache
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Virtual Container Host Registry & Stack representation */}
        <div className="lg:col-span-7 border border-slate-100 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between min-h-[300px]">
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-4">
              <Layers className="h-4 w-4 text-sky-600" />
              Docker Image Layers Stack
            </h4>

            {builtLayers.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-white dark:bg-slate-900 text-slate-400 text-center p-4">
                <Layers className="h-10 w-10 text-slate-300 mb-2 animate-pulse" />
                <p className="text-xs font-semibold">Image Stack Empty</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Build layers from the Dockerfile to compile the read-only image.</p>
              </div>
            ) : (
              <div className="flex flex-col-reverse gap-1.5 max-w-md mx-auto">
                <AnimatePresence>
                  {builtLayers.map((layer, index) => (
                    <motion.div
                      key={layer.instruction}
                      initial={{ opacity: 0, y: -20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                      className={`text-white text-xs p-2.5 rounded-lg shadow-sm flex items-center justify-between ${layer.color}`}
                    >
                      <div>
                        <p className="font-mono font-medium">{layer.instruction}</p>
                        <p className="text-[10px] text-white/80">{layer.desc}</p>
                      </div>
                      <span className="text-[9px] font-mono bg-black/20 px-2 py-0.5 rounded font-bold">
                        {layer.size}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {isImageComplete && (
            <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">✨ Image built successfully! Total Size: 311 MB</span>
              <button
                id="btn-docker-run-container"
                onClick={runContainer}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                docker run (Deploy)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Containers Deployment Sandbox & Proxy Testing */}
      {containers.length > 0 && (
        <div className="border border-slate-100 rounded-xl p-5 bg-white dark:bg-slate-950/40 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Server className="h-4 w-4 text-emerald-600" />
              Running Containers Containerizer (Host Bridge Network)
            </h4>
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase animate-pulse">BRIDGE ACTIVE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {containers.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 line-clamp-1">{c.name}</span>
                      <button
                        onClick={() => stopContainer(c.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                        title="docker stop & rm"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] font-mono bg-slate-900 text-slate-300 p-2.5 rounded-lg">
                      <div>
                        <p className="text-slate-400">Host Port</p>
                        <p className="font-bold text-sky-400">{c.port}</p>
                      </div>
                      <span className="text-slate-600">→</span>
                      <div>
                        <p className="text-slate-400">Container Port</p>
                        <p className="font-bold text-emerald-400">80</p>
                      </div>
                      <span className="text-slate-600">|</span>
                      <div>
                        <p className="text-slate-400">IP</p>
                        <p className="font-bold">172.17.0.{c.id.charCodeAt(0) % 10 + 2}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => sendHttpRequest(c)}
                      disabled={isSendingRequest !== null}
                      className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-medium py-1.5 rounded-lg text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {isSendingRequest === c.id ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Send className="h-3 w-3" />
                          Send Request
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Engine Status / Terminal */}
      <div className="bg-slate-950 text-slate-200 font-mono text-xs p-4 rounded-xl flex items-center gap-2 border border-slate-800">
        <span className="text-sky-400 font-bold">INFO:</span>
        <span className="flex-1 text-slate-300 line-clamp-1">{requestLog}</span>
      </div>
    </div>
  );
}
