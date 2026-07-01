import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GitBranch, GitPullRequest, GitMerge, RefreshCw, Layers, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

interface GitCommit {
  id: string;
  message: string;
  branch: 'feature' | 'main';
}

export default function DiagramGitOps() {
  const [commits, setCommits] = useState<GitCommit[]>([
    { id: 'c1', message: 'Initial commit', branch: 'main' },
    { id: 'c2', message: 'Configure nginx-ingress routing', branch: 'main' }
  ]);
  const [gitState, setGitState] = useState<'synced' | 'unmerged' | 'drift-cluster' | 'syncing'>('synced');
  const [logs, setLogs] = useState<string[]>(['ArgoCD is active. State: Synced (Current revision: c2).']);
  const [clusterRevision, setClusterRevision] = useState<string>('c2');

  const createCommit = () => {
    if (commits.some(c => c.branch === 'feature')) return; // only one active feature commit
    
    const nextId = 'c' + (commits.length + 1);
    const newCommit: GitCommit = {
      id: nextId,
      message: 'feat: upgrade backend replica limit to 5',
      branch: 'feature'
    };

    setCommits(prev => [...prev, newCommit]);
    setGitState('unmerged');
    setLogs(prev => [
      `[GIT] Developer pushed commit ${nextId} to branch "feature/scale-replicas"`,
      'Ready to create an automated Pull Request (PR) to main branch...',
      ...prev
    ]);
  };

  const mergePR = async () => {
    if (gitState !== 'unmerged') return;
    setLogs(prev => ['[PR] Pull Request merged into branch "main". Webhooks firing...', ...prev]);
    
    setCommits(prev => prev.map(c => c.branch === 'feature' ? { ...c, branch: 'main' } : c));
    setGitState('syncing');

    await new Promise(resolve => setTimeout(resolve, 1200));

    // ArgoCD detects change in Git vs actual cluster state
    const latestCommit = 'c' + commits.length;
    setLogs(prev => [
      `[ARGOCD] Polling Git Repository... New commit detected on main: ${latestCommit}`,
      `[ARGOCD] Status changed: OUT OF SYNC. Cluster running (${clusterRevision}) vs Git repo (${latestCommit})`,
      'Initiating declarative state synchronization...',
      ...prev
    ]);

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Syning process completes
    setClusterRevision(latestCommit);
    setGitState('synced');
    setLogs(prev => [
      `[ARGOCD] Successfully synchronized cluster to revision ${latestCommit}.`,
      'All live pods upgraded to replica count limit 5.',
      ...prev
    ]);
  };

  // Simulate manual drift (someone manually typing kubectl edit scale replicas = 1)
  const triggerManualDrift = async () => {
    if (gitState === 'syncing' || gitState === 'unmerged') return;
    setGitState('drift-cluster');
    setLogs(prev => [
      '[MANUAL DRIFT] Alert! Sysadmin bypassed Git and manually scaled deployment replicas using kubectl command line.',
      '[ARGOCD] Status changed: OUT OF SYNC. Drift detected between cluster state and Git specs.',
      '[ARGOCD] Self-healing loop triggered. Auto-repair is rolling back manual overrides...',
      ...prev
    ]);

    await new Promise(resolve => setTimeout(resolve, 1800));

    setGitState('synced');
    setLogs(prev => [
      `[ARGOCD] Self-heal complete! Discarded manual changes. Cluster reverted to Git state (${clusterRevision}).`,
      ...prev
    ]);
  };

  return (
    <div id="diagram-gitops" className="space-y-6">
      
      {/* GitOps Action controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">GitOps Sandbox Lifecycle</p>
          <p className="text-sm text-slate-600">Simulate code changes, PR merges, and automated self-healing loops.</p>
        </div>

        <div className="flex gap-2">
          <button
            id="btn-git-commit"
            onClick={createCommit}
            disabled={commits.some(c => c.branch === 'feature')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              commits.some(c => c.branch === 'feature')
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <GitBranch className="h-3.5 w-3.5" />
            Create Feature Branch
          </button>

          <button
            id="btn-git-merge"
            onClick={mergePR}
            disabled={gitState !== 'unmerged'}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              gitState === 'unmerged'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <GitMerge className="h-3.5 w-3.5" />
            Merge Pull Request (PR)
          </button>

          <button
            id="btn-git-drift"
            onClick={triggerManualDrift}
            disabled={gitState !== 'synced'}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              gitState === 'synced'
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            Trigger Manual Drift
          </button>
        </div>
      </div>

      {/* Visual representation of Repository vs Cluster State */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Git Repository Visual Tree */}
        <div className="lg:col-span-6 border border-slate-100 rounded-xl p-5 bg-white dark:bg-slate-950/40 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <GitBranch className="h-4 w-4 text-indigo-600" />
            1. Git Repository (Single Source of Truth)
          </h4>

          <div className="border border-slate-100 bg-slate-50/40 p-4 rounded-xl min-h-[170px] flex flex-col justify-between">
            {/* Main branch timeline */}
            <div className="space-y-4 relative">
              
              {/* Branch rail line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-10" />

              <div className="flex items-center justify-between relative">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">main</span>
                <div className="flex gap-4">
                  {commits.filter(c => c.branch === 'main').map((c) => (
                    <motion.div
                      key={c.id}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-[10px] font-mono text-white font-bold cursor-help"
                      title={c.message}
                    >
                      {c.id}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Feature branch timeline */}
              {commits.some(c => c.branch === 'feature') && (
                <div className="flex items-center justify-between relative pt-4 border-t border-dashed border-slate-200">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">feature</span>
                  <div className="flex gap-4">
                    {commits.filter(c => c.branch === 'feature').map((c) => (
                      <motion.div
                        key={c.id}
                        initial={{ scale: 0.8, x: -20, opacity: 0 }}
                        animate={{ scale: 1, x: 0, opacity: 1 }}
                        className="w-8 h-8 rounded-full bg-violet-500 border-2 border-white flex items-center justify-center text-[10px] font-mono text-white font-bold cursor-help"
                        title={c.message}
                      >
                        {c.id}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-400 italic">
              Commits map application config files. ArgoCD continually watches this main pipeline state.
            </div>
          </div>
        </div>

        {/* Live Kubernetes Cluster state (Sync engine) */}
        <div className="lg:col-span-6 border border-slate-100 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-emerald-600" />
                2. Live Kubernetes Cluster Status
              </h4>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                gitState === 'synced' ? 'bg-emerald-100 text-emerald-800' :
                gitState === 'syncing' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                'bg-rose-100 text-rose-800'
              }`}>
                {gitState === 'synced' && <CheckCircle2 className="h-3 w-3" />}
                {gitState === 'syncing' && <RefreshCw className="h-3 w-3 animate-spin" />}
                {gitState === 'drift-cluster' && <AlertTriangle className="h-3 w-3 animate-bounce" />}
                {gitState}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 rounded-xl p-4 flex items-center justify-between shadow-sm min-h-[90px]">
              <div>
                <p className="text-xs font-bold text-slate-800">Cluster Live State</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Desired: Git Configuration (main branch)</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-600">
                    K8s Replica Count: {clusterRevision === 'c3' ? '5' : '3'}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[9px] font-bold uppercase text-slate-400">Current Revision</p>
                <p className="text-xl font-mono font-bold text-emerald-600 mt-1">{clusterRevision}</p>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 italic pt-3 border-t border-slate-100/50">
            ArgoCD operator syncs cluster to main branch. Manual drift is automatically rolled back.
          </div>
        </div>

      </div>

      {/* ArgoCD Loop logger stream */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 ${gitState === 'syncing' ? 'animate-spin' : ''}`} />
          ArgoCD Reconciliation Sync Loop
        </h4>
        <div className="bg-slate-950 text-slate-100 font-mono text-xs p-4 rounded-xl max-h-[140px] overflow-y-auto space-y-1 shadow-inner border border-slate-800 custom-scrollbar">
          {logs.map((log, index) => (
            <div key={index} className="text-slate-300">
              <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
