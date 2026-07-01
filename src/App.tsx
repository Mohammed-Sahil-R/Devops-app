import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CONCEPTS_DATA } from './data/concepts';
import { TopicId } from './types';
import { 
  GitPullRequest, 
  Layers, 
  Boxes, 
  Cpu, 
  Network, 
  BookOpen, 
  Terminal, 
  Settings, 
  Layers3, 
  Play, 
  HelpCircle 
} from 'lucide-react';

// Diagrams
import DiagramCICD from './components/DiagramCICD';
import DiagramDocker from './components/DiagramDocker';
import DiagramKubernetes from './components/DiagramKubernetes';
import DiagramTerraform from './components/DiagramTerraform';
import DiagramGitOps from './components/DiagramGitOps';

// Doc Viewer
import DocViewer from './components/DocViewer';

// Icon Map helper
const ICON_MAP: Record<string, any> = {
  GitPullRequest: GitPullRequest,
  Layers: Layers,
  Boxes: Boxes,
  Cpu: Cpu,
  Network: Network,
};

export default function App() {
  const [activeTopicId, setActiveTopicId] = useState<TopicId>('cicd');

  // Find selected topic
  const activeTopic = CONCEPTS_DATA.find(t => t.id === activeTopicId) || CONCEPTS_DATA[0];

  // Dynamically render active interactive diagram
  const renderDiagram = () => {
    switch (activeTopicId) {
      case 'cicd':
        return <DiagramCICD />;
      case 'docker':
        return <DiagramDocker />;
      case 'kubernetes':
        return <DiagramKubernetes />;
      case 'terraform':
        return <DiagramTerraform />;
      case 'gitops':
        return <DiagramGitOps />;
      default:
        return <DiagramCICD />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans flex flex-col justify-between">
      
      {/* Top Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-sky-500 flex items-center justify-center text-white shadow-md">
              <Settings className="h-5 w-5 animate-[spin_10s_linear_infinite]" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg tracking-tight text-slate-900">
                DevOps Interactive Guide
              </h1>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Visualizing systems automation
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5 bg-slate-100/60 px-3 py-1.5 rounded-full text-slate-600 border border-slate-200/50">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sandbox Platform
            </span>
            <span className="font-mono text-slate-400">v1.4.0</span>
          </div>
        </div>
      </header>

      {/* Main Core Container */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Topic Picker Left Sidebar */}
        <section id="sidebar-picker" className="lg:col-span-3 space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Core Disciplines</h2>
            <p className="text-xs text-slate-500 leading-relaxed">Select a topic block to render active diagrams & manifestations.</p>
          </div>

          <div className="space-y-2">
            {CONCEPTS_DATA.map((topic) => {
              const IconComponent = ICON_MAP[topic.icon] || Layers;
              const isActive = topic.id === activeTopicId;

              return (
                <button
                  key={topic.id}
                  id={`btn-topic-${topic.id}`}
                  onClick={() => setActiveTopicId(topic.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-start gap-3.5 cursor-pointer ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 shadow-sm ring-1 ring-emerald-500/20'
                      : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${
                    isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-xs text-slate-900">{topic.title}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 leading-normal">{topic.shortDesc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-4 bg-slate-900/90 text-white rounded-xl shadow-md border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-emerald-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Learner Hint</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Click the green visualizer action buttons inside diagrams to interact with virtual pipeline runners, Docker engines, Kubernetes clusters, and Terraform scripts!
            </p>
          </div>
        </section>

        {/* Dynamic Canvas Block */}
        <section id="diagram-view" className="lg:col-span-9 grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Interactive Visualizer Canvas */}
          <div className="xl:col-span-7 space-y-6 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono">
                {activeTopic.title} visualizer
              </span>
              <h2 className="text-xl font-display font-bold text-slate-900">
                {activeTopic.interactiveTitle}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {activeTopic.interactiveDesc}
              </p>
            </div>

            {/* Render selected diagram with a smooth enter transition */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTopicId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex-grow flex flex-col justify-center"
              >
                {renderDiagram()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Clean Documentation Viewer */}
          <div className="xl:col-span-5 h-full">
            <DocViewer topic={activeTopic} />
          </div>

        </section>

      </main>

      {/* Footer copyright */}
      <footer className="border-t border-slate-100 bg-white py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 DevOps Interactive Guide. Built for engineers and learners globally.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-600 transition">Docs</a>
            <a href="#" className="hover:text-slate-600 transition">Interactive Code</a>
            <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
            <span>Local Time: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
