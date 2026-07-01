import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Code, Cpu, ShieldAlert, CheckCircle, RefreshCw, Layers, Monitor, ChevronRight } from 'lucide-react';

interface Stage {
  id: string;
  name: string;
  icon: any;
  desc: string;
  status: 'idle' | 'running' | 'success' | 'error';
  log: string[];
}

const INITIAL_STAGES: Stage[] = [
  {
    id: 'code',
    name: '1. Code VCS',
    icon: Code,
    desc: 'Commit changes to main branch',
    status: 'idle',
    log: [
      'Git hook triggered.',
      'Detected commit from "mohammedsahilr39@gmail.com".',
      'Commit message: "feat: add user login API"'
    ]
  },
  {
    id: 'build',
    name: '2. Build',
    icon: Cpu,
    desc: 'Compile code and bundle assets',
    status: 'idle',
    log: [
      'Pulling node:20-alpine base image...',
      'Running npm clean install (npm ci)...',
      'Vite bundle created in 2.34 seconds.'
    ]
  },
  {
    id: 'test',
    name: '3. Test / QA',
    icon: ShieldAlert,
    desc: 'Lint, unit & integration tests',
    status: 'idle',
    log: [
      'Running eslint rules... No warnings.',
      'Running Jest test suites... 14 passed.',
      'Checking code coverage... 88.5% (PASSED)'
    ]
  },
  {
    id: 'release',
    name: '4. Release',
    icon: Layers,
    desc: 'Package and push Docker image',
    status: 'idle',
    log: [
      'Building Docker production image tag v1.2.0...',
      'Pushing layers to Container Registry...',
      'Image digests verified successfully.'
    ]
  },
  {
    id: 'deploy',
    name: '5. Deploy',
    icon: RefreshCw,
    desc: 'Zero-downtime rolling update',
    status: 'idle',
    log: [
      'Connecting to Kubernetes Cluster...',
      'Applying rolling update (v1.1.0 -> v1.2.0)...',
      'Target healthy. Terminating stale replica pods.'
    ]
  },
  {
    id: 'monitor',
    name: '6. Monitor',
    icon: Monitor,
    desc: 'Telemetry, logging & alerting',
    status: 'idle',
    log: [
      'Prometheus status: UP.',
      'Active connections count: 4,500/sec.',
      'Error rate: 0.00% (Normal)'
    ]
  }
];

export default function DiagramCICD() {
  const [stages, setStages] = useState<Stage[]>(INITIAL_STAGES);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState<number | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [pipelineLog, setPipelineLog] = useState<string[]>(['Pipeline idle. Click "Trigger Pipeline" to begin.']);

  // Update selected stage if stages update
  useEffect(() => {
    if (selectedStage) {
      const updated = stages.find(s => s.id === selectedStage.id);
      if (updated) setSelectedStage(updated);
    }
  }, [stages]);

  const triggerPipeline = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setPipelineLog(['Initiating new automation run...']);

    // Reset stages to idle
    setStages(prev => prev.map(s => ({ ...s, status: 'idle' })));

    for (let i = 0; i < INITIAL_STAGES.length; i++) {
      setActiveStageIndex(i);
      
      // Mark current running
      setStages(prev => prev.map((s, idx) => {
        if (idx === i) return { ...s, status: 'running' };
        if (idx < i) return { ...s, status: 'success' };
        return s;
      }));

      // Add log
      const currentStage = INITIAL_STAGES[i];
      setPipelineLog(prev => [...prev, `>>> Entering [${currentStage.name}] Stage...`]);
      
      // Simulate logs printing out
      for (const line of currentStage.log) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setPipelineLog(prev => [...prev, `[${currentStage.id.toUpperCase()}] ${line}`]);
      }

      await new Promise(resolve => setTimeout(resolve, 800));

      // Mark success
      setStages(prev => prev.map((s, idx) => {
        if (idx === i) return { ...s, status: 'success' };
        return s;
      }));
    }

    setPipelineLog(prev => [...prev, '✓ Pipeline execution completed successfully! All environments are healthy.']);
    setIsRunning(false);
    setActiveStageIndex(null);
  };

  const getStatusColor = (status: Stage['status']) => {
    switch (status) {
      case 'running': return 'border-amber-500 bg-amber-50/75 dark:bg-amber-950/20 text-amber-600';
      case 'success': return 'border-emerald-500 bg-emerald-50/75 dark:bg-emerald-950/20 text-emerald-600';
      case 'error': return 'border-rose-500 bg-rose-50/75 dark:bg-rose-950/20 text-rose-600';
      default: return 'border-slate-200 bg-white dark:bg-slate-900 text-slate-500';
    }
  };

  return (
    <div id="diagram-cicd" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Controls</p>
          <p className="text-sm text-slate-600">Simulate a full integration & deployment lifecycle.</p>
        </div>
        <button
          onClick={triggerPipeline}
          disabled={isRunning}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm cursor-pointer ${
            isRunning
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow'
          }`}
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Pipeline Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              Trigger Pipeline
            </>
          )}
        </button>
      </div>

      {/* Pipeline Diagram Track */}
      <div className="relative overflow-x-auto py-6 px-4 border border-slate-100 rounded-xl bg-white dark:bg-slate-950/40">
        <div className="flex items-center justify-between min-w-[700px] relative">
          
          {/* Connector Line Background */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0" />

          {/* Animated Glowing Package (Pipeline Dot) */}
          {isRunning && activeStageIndex !== null && (
            <motion.div
              className="absolute h-4 w-4 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] z-10"
              style={{ top: '50%', y: '-50%' }}
              animate={{
                left: `${(activeStageIndex / (stages.length - 1)) * 92 + 4}%`
              }}
              transition={{ type: 'spring', stiffness: 45, damping: 15 }}
            />
          )}

          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = stage.status === 'running';
            const isCompleted = stage.status === 'success';

            return (
              <div key={stage.id} className="relative z-20 flex flex-col items-center flex-1">
                <button
                  id={`btn-stage-${stage.id}`}
                  onClick={() => setSelectedStage(stage)}
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative group cursor-pointer ${getStatusColor(stage.status)} ${
                    isActive ? 'scale-110 ring-4 ring-amber-100 shadow-md' : 'hover:scale-105'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isActive ? 'animate-pulse' : ''}`} />
                  
                  {isCompleted && (
                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5">
                      <CheckCircle className="h-4 w-4 fill-emerald-500 text-white" />
                    </span>
                  )}
                </button>
                <span className="text-xs font-semibold mt-3 text-slate-700 text-center select-none">
                  {stage.name.split(' ')[1] || stage.name}
                </span>
                <span className="text-[10px] text-slate-400 text-center max-w-[100px] mt-0.5 line-clamp-1">
                  {stage.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal Output Logs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-8 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Pipeline Logs
            </h4>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">tail -f actions.log</span>
          </div>
          <div className="bg-slate-950 text-slate-100 font-mono text-xs p-5 rounded-xl min-h-[180px] max-h-[250px] overflow-y-auto shadow-inner border border-slate-800 space-y-1.5 custom-scrollbar">
            <AnimatePresence>
              {pipelineLog.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`${log.startsWith('>>>') ? 'text-amber-400 font-semibold mt-2' : log.startsWith('✓') ? 'text-emerald-400 font-semibold' : 'text-slate-300'}`}
                >
                  {log}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Selected Stage Detail/Doc */}
        <div className="md:col-span-4">
          <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50 min-h-[210px] flex flex-col justify-between">
            {selectedStage ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <selectedStage.icon className="h-4 w-4 text-emerald-600" />
                    {selectedStage.name}
                  </h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                    selectedStage.status === 'success' ? 'bg-emerald-100 text-emerald-800' :
                    selectedStage.status === 'running' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedStage.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedStage.desc}</p>
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Example commands</span>
                  <div className="bg-slate-900 text-slate-300 font-mono text-[10px] p-2.5 rounded-lg mt-1 overflow-x-auto">
                    {selectedStage.id === 'code' && 'git commit -am "chore: code commit"'}
                    {selectedStage.id === 'build' && 'npm run build'}
                    {selectedStage.id === 'test' && 'npm run test'}
                    {selectedStage.id === 'release' && 'docker build -t app:v1 .'}
                    {selectedStage.id === 'deploy' && 'kubectl apply -f deployment.yaml'}
                    {selectedStage.id === 'monitor' && 'curl -I http://localhost/health'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-6 text-slate-400">
                <ChevronRight className="h-8 w-8 text-slate-300 mb-2 rotate-90" />
                <p className="text-xs font-semibold">Click any pipeline node</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Learn commands and view configurations in detail</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
