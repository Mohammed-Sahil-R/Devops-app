import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Plus, Minus, Server, Activity, AlertTriangle, RefreshCw, Zap } from 'lucide-react';

interface Pod {
  id: string;
  nodeId: number;
  status: 'running' | 'terminating' | 'starting';
  ip: string;
  trafficCount: number;
}

export default function DiagramKubernetes() {
  const [replicaCount, setReplicaCount] = useState<number>(3);
  const [pods, setPods] = useState<Pod[]>([]);
  const [clusterLog, setClusterLog] = useState<string[]>([
    'K8s API Server listening...',
    'Desired Replicas: 3. Cluster state healthy.'
  ]);
  const [isSendingTraffic, setIsSendingTraffic] = useState(false);
  const [driftDetected, setDriftDetected] = useState(false);

  // Initialize pods on start
  useEffect(() => {
    const initialPods: Pod[] = [];
    for (let i = 0; i < replicaCount; i++) {
      const nodeId = (i % 2) + 1; // distribute across 2 worker nodes
      initialPods.push({
        id: `pod-${Math.random().toString(36).substring(2, 7)}`,
        nodeId,
        status: 'running',
        ip: `10.244.${nodeId}.${Math.floor(Math.random() * 250) + 2}`,
        trafficCount: 0
      });
    }
    setPods(initialPods);
  }, []);

  // Watch for replication controller adjustments
  const adjustReplicas = (amount: number) => {
    const target = Math.max(1, Math.min(6, replicaCount + amount));
    if (target === replicaCount) return;

    setReplicaCount(target);
    setClusterLog(prev => [
      `[EVENT] Deployment scale modified. New desired replica count: ${target}`,
      ...prev
    ]);

    if (amount > 0) {
      // Scale up: add a pod
      const diff = target - pods.length;
      if (diff > 0) {
        const newPods: Pod[] = [];
        for (let i = 0; i < diff; i++) {
          const nodeId = Math.floor(Math.random() * 2) + 1; // random worker node
          const newId = `pod-${Math.random().toString(36).substring(2, 7)}`;
          
          newPods.push({
            id: newId,
            nodeId,
            status: 'starting',
            ip: `10.244.${nodeId}.${Math.floor(Math.random() * 250) + 2}`,
            trafficCount: 0
          });

          // Transition starting -> running
          setTimeout(() => {
            setPods(curr => curr.map(p => p.id === newId ? { ...p, status: 'running' } : p));
            setClusterLog(curr => [
              `[KUBELET] Container runtime started for ${newId}. Pod marked healthy.`,
              ...curr
            ]);
          }, 1500);
        }
        setPods(curr => [...curr, ...newPods]);
      }
    } else {
      // Scale down: terminate last active pod
      if (pods.length > target) {
        const podToTerminate = pods[pods.length - 1];
        setPods(curr => curr.map(p => p.id === podToTerminate.id ? { ...p, status: 'terminating' } : p));
        
        setTimeout(() => {
          setPods(curr => curr.filter(p => p.id !== podToTerminate.id));
          setClusterLog(curr => [
            `[CONTROLLER] Pod ${podToTerminate.id} deleted. Reclaimed cluster resources.`,
            ...curr
          ]);
        }, 1200);
      }
    }
  };

  // Self-Healing Trigger
  const killPod = (podId: string) => {
    setPods(curr => curr.map(p => p.id === podId ? { ...p, status: 'terminating' } : p));
    setClusterLog(prev => [
      `[ALERT] Pod ${podId} crashed / health check failed!`,
      `[CONTROLLER] ReplicaSet detected drift. Desired: ${replicaCount}, Actual: ${pods.length - 1}`,
      ...prev
    ]);
    setDriftDetected(true);

    // Remove the dead pod, immediately spin up a healthy replacement pod to auto-heal
    setTimeout(() => {
      setPods(curr => {
        const filtered = curr.filter(p => p.id !== podId);
        
        // Spin up a replacement
        const nodeId = Math.floor(Math.random() * 2) + 1;
        const replacementId = `pod-${Math.random().toString(36).substring(2, 7)}`;
        
        setClusterLog(prevLogs => [
          `[SCHEDULER] Scheduled replacement Pod ${replacementId} on Worker Node ${nodeId}`,
          `[REPLICAS] Drift corrected. Current Pod count: ${replicaCount}`,
          ...prevLogs
        ]);
        setDriftDetected(false);

        const replacement: Pod = {
          id: replacementId,
          nodeId,
          status: 'starting',
          ip: `10.244.${nodeId}.${Math.floor(Math.random() * 250) + 2}`,
          trafficCount: 0
        };

        // Transition starting -> running
        setTimeout(() => {
          setPods(latest => latest.map(p => p.id === replacementId ? { ...p, status: 'running' } : p));
        }, 1000);

        return [...filtered, replacement];
      });
    }, 1500);
  };

  // Send load balancer traffic simulation
  const triggerTraffic = () => {
    if (isSendingTraffic || pods.length === 0) return;
    setIsSendingTraffic(true);
    setClusterLog(prev => ['[INGRESS] High load HTTP simulation started. Load balancer routing active.', ...prev]);

    let count = 0;
    const interval = setInterval(() => {
      if (count < 8) {
        setPods(curr => {
          if (curr.length === 0) return curr;
          const randomIndex = Math.floor(Math.random() * curr.length);
          return curr.map((p, idx) => {
            if (idx === randomIndex && p.status === 'running') {
              return { ...p, trafficCount: p.trafficCount + 1 };
            }
            return p;
          });
        });
        count++;
      } else {
        clearInterval(interval);
        setIsSendingTraffic(false);
        setClusterLog(prev => ['[INGRESS] HTTP simulation burst completed. Balance stable.', ...prev]);
        // Decay traffic counts gradually
        setTimeout(() => {
          setPods(curr => curr.map(p => ({ ...p, trafficCount: 0 })));
        }, 2000);
      }
    }, 250);
  };

  return (
    <div id="diagram-kubernetes" className="space-y-6">
      
      {/* Cluster Controller Unit */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Deployment Scale</p>
            <div className="flex items-center gap-3">
              <button
                id="btn-k8s-scale-down"
                onClick={() => adjustReplicas(-1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white dark:bg-slate-950 hover:bg-slate-100 transition cursor-pointer"
                title="Scale Down"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="font-mono font-bold text-lg text-slate-800">{replicaCount} Replicas</span>
              <button
                id="btn-k8s-scale-up"
                onClick={() => adjustReplicas(1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white dark:bg-slate-950 hover:bg-slate-100 transition cursor-pointer"
                title="Scale Up"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-k8s-send-traffic"
            onClick={triggerTraffic}
            disabled={isSendingTraffic}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg transition-all shadow-sm cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5" />
            Simulate Traffic Load
          </button>
          
          {driftDetected && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg text-xs animate-pulse">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>Self-healing Active...</span>
            </div>
          )}
        </div>
      </div>

      {/* Cluster Topology Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Control Plane (Brain) */}
        <div className="md:col-span-4 border border-slate-100 rounded-xl p-5 bg-white dark:bg-slate-950/40 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Network className="h-4 w-4 text-sky-600" />
            1. Control Plane (Master)
          </h4>

          <div className="space-y-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-800">kube-apiserver</p>
                <p className="text-[10px] text-slate-500">Gateway entry point for REST calls</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-800">etcd Database</p>
                <p className="text-[10px] text-slate-500">Distributed storage for cluster spec</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-800">kube-scheduler</p>
                <p className="text-[10px] text-slate-500">Allocates pods to Worker Nodes</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-800">controller-manager</p>
                <p className="text-[10px] text-slate-500">Corrects state drift continuously</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            </div>
          </div>
        </div>

        {/* Worker Nodes & Pod Grid */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Worker Node 1 */}
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3 flex flex-col justify-between min-h-[260px]">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <Server className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">Worker Node 1</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">IP: 192.168.1.10</span>
              </div>

              {/* Node 1 Pods container */}
              <div className="grid grid-cols-2 gap-2">
                <AnimatePresence>
                  {pods.filter(p => p.nodeId === 1).map((pod) => (
                    <motion.div
                      key={pod.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className={`relative p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                        pod.status === 'starting' ? 'border-amber-300 bg-amber-50/50' :
                        pod.status === 'terminating' ? 'border-rose-300 bg-rose-50/40 opacity-50' :
                        'border-emerald-200 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold text-slate-800 line-clamp-1">{pod.id}</span>
                          {pod.status === 'running' && (
                            <button
                              onClick={() => killPod(pod.id)}
                              className="text-slate-300 hover:text-rose-600 transition p-0.5"
                              title="Simulate Crash (Kill Pod)"
                            >
                              <AlertTriangle className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-[8px] font-mono text-slate-400 mt-0.5">{pod.ip}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                          pod.status === 'running' ? 'bg-emerald-100 text-emerald-800' :
                          pod.status === 'starting' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {pod.status}
                        </span>

                        {pod.trafficCount > 0 && (
                          <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            className="text-[9px] bg-sky-100 text-sky-800 px-1 rounded font-bold"
                          >
                            ⚡ {pod.trafficCount}
                          </motion.span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {pods.filter(p => p.nodeId === 1).length === 0 && (
                  <div className="col-span-2 text-center py-6 text-[10px] text-slate-400 italic">No pods active on this node</div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mt-2 border-t border-slate-100/50 pt-2">
              <span>kubelet: ACTIVE</span>
              <span>kube-proxy: RUNNING</span>
            </div>
          </div>

          {/* Worker Node 2 */}
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3 flex flex-col justify-between min-h-[260px]">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <Server className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">Worker Node 2</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">IP: 192.168.1.11</span>
              </div>

              {/* Node 2 Pods container */}
              <div className="grid grid-cols-2 gap-2">
                <AnimatePresence>
                  {pods.filter(p => p.nodeId === 2).map((pod) => (
                    <motion.div
                      key={pod.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className={`relative p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                        pod.status === 'starting' ? 'border-amber-300 bg-amber-50/50' :
                        pod.status === 'terminating' ? 'border-rose-300 bg-rose-50/40 opacity-50' :
                        'border-emerald-200 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold text-slate-800 line-clamp-1">{pod.id}</span>
                          {pod.status === 'running' && (
                            <button
                              onClick={() => killPod(pod.id)}
                              className="text-slate-300 hover:text-rose-600 transition p-0.5"
                              title="Simulate Crash (Kill Pod)"
                            >
                              <AlertTriangle className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-[8px] font-mono text-slate-400 mt-0.5">{pod.ip}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                          pod.status === 'running' ? 'bg-emerald-100 text-emerald-800' :
                          pod.status === 'starting' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {pod.status}
                        </span>

                        {pod.trafficCount > 0 && (
                          <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            className="text-[9px] bg-sky-100 text-sky-800 px-1 rounded font-bold"
                          >
                            ⚡ {pod.trafficCount}
                          </motion.span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {pods.filter(p => p.nodeId === 2).length === 0 && (
                  <div className="col-span-2 text-center py-6 text-[10px] text-slate-400 italic">No pods active on this node</div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mt-2 border-t border-slate-100/50 pt-2">
              <span>kubelet: ACTIVE</span>
              <span>kube-proxy: RUNNING</span>
            </div>
          </div>

        </div>
      </div>

      {/* Cluster Console/State stream */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
          Kube-Scheduler Scheduler Stream
        </h4>
        <div className="bg-slate-950 text-slate-100 font-mono text-xs p-4 rounded-xl max-h-[140px] overflow-y-auto space-y-1 shadow-inner border border-slate-800 custom-scrollbar">
          {clusterLog.map((log, index) => (
            <div key={index} className="text-slate-300">
              <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
