import { useState } from 'react';
import { ConceptTopic, DocSection } from '../types';
import { Copy, Check, FileCode, Terminal, BookOpen, AlertCircle } from 'lucide-react';

interface DocViewerProps {
  topic: ConceptTopic;
}

export default function DocViewer({ topic }: DocViewerProps) {
  const [activeTab, setActiveTab] = useState<'learn' | 'files' | 'cli'>('learn');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeSnippetIndex, setActiveSnippetIndex] = useState<number>(0);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const currentSection = topic.sections[0]; // first section usually contains general concepts

  return (
    <div className="border border-slate-100 rounded-2xl bg-white dark:bg-slate-950/40 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Tab bar header */}
      <div className="flex border-b border-slate-100 bg-slate-50/50 dark:bg-slate-900/30 px-4">
        <button
          id="btn-tab-learn"
          onClick={() => setActiveTab('learn')}
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'learn'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          1. Core Concepts
        </button>

        {currentSection.codeSnippets && currentSection.codeSnippets.length > 0 && (
          <button
            id="btn-tab-files"
            onClick={() => {
              setActiveTab('files');
              setActiveSnippetIndex(0);
            }}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'files'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            2. Config Manifests
          </button>
        )}

        {currentSection.commands && currentSection.commands.length > 0 && (
          <button
            id="btn-tab-cli"
            onClick={() => setActiveTab('cli')}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'cli'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            3. CLI Commands
          </button>
        )}
      </div>

      {/* Doc Body content */}
      <div className="p-6 overflow-y-auto flex-1 custom-scrollbar min-h-[300px]">
        {activeTab === 'learn' && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono">Conceptual Overview</span>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{topic.title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{topic.subtitle}</p>
            </div>

            {/* Render formatted markdown/bold list */}
            <div className="space-y-4 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
              {currentSection.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('**') && paragraph.includes('**')) {
                  // highlight paragraphs containing titles
                  return (
                    <p key={index} className="text-slate-600">
                      {paragraph.split('**').map((text, i) => (
                        i % 2 === 1 ? <strong key={i} className="font-bold text-slate-800">{text}</strong> : text
                      ))}
                    </p>
                  );
                }
                return <p key={index}>{paragraph}</p>;
              })}
            </div>

            {topic.sections.length > 1 && (
              <div className="border-t border-slate-100 pt-5 mt-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">{topic.sections[1].title}</h4>
                <div className="grid grid-cols-1 gap-2">
                  {topic.sections[1].content.split('\n').filter(Boolean).map((line, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-xl flex gap-3 text-xs">
                      <span className="text-emerald-600 font-bold font-mono">0{idx + 1}</span>
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800">
                          {line.includes('**') ? line.split('**')[1] : ''}
                        </span>
                        <p className="text-slate-500">
                          {line.includes('**') ? line.split('**')[2]?.replace(': ', '') || line : line}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'files' && currentSection.codeSnippets && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono">Infrastructure as Code Manifests</span>
              <h3 className="text-md font-bold text-slate-800 mt-1">Declarative Configuration Templates</h3>
            </div>

            {/* Sub file tab header */}
            {currentSection.codeSnippets.length > 1 && (
              <div className="flex gap-1 border-b border-slate-100 pb-2">
                {currentSection.codeSnippets.map((snippet, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSnippetIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                      activeSnippetIndex === idx
                        ? 'bg-slate-100 text-slate-800 font-bold'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {snippet.filename}
                  </button>
                ))}
              </div>
            )}

            {/* Selected manifest view */}
            {currentSection.codeSnippets[activeSnippetIndex] && (
              <div className="relative border border-slate-100 rounded-xl overflow-hidden mt-2">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                  <span className="text-xs font-mono font-medium text-slate-500">
                    {currentSection.codeSnippets[activeSnippetIndex].filename}
                  </span>
                  <button
                    onClick={() => copyToClipboard(currentSection.codeSnippets[activeSnippetIndex].code, 'code')}
                    className="p-1 rounded hover:bg-slate-200 transition text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Copy manifest code"
                  >
                    {copiedText === 'code' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-[380px] custom-scrollbar">
                  <code>{currentSection.codeSnippets[activeSnippetIndex].code}</code>
                </pre>
              </div>
            )}

            <div className="flex gap-2 p-3 bg-blue-50/50 border border-blue-100 text-blue-700 rounded-xl text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>These templates represent standard production configurations. Copy them to run locally inside your repository root.</p>
            </div>
          </div>
        )}

        {activeTab === 'cli' && currentSection.commands && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono">DevOps Terminal Reference</span>
              <h3 className="text-md font-bold text-slate-800 mt-1">Common CLI Utilities Cheat Sheet</h3>
            </div>

            <div className="space-y-3">
              {currentSection.commands.map((cmdItem, idx) => (
                <div key={idx} className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/40 hover:bg-slate-50 transition space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded break-all">
                      $ {cmdItem.cmd}
                    </span>
                    <button
                      onClick={() => copyToClipboard(cmdItem.cmd, `cli-${idx}`)}
                      className="p-1 rounded hover:bg-slate-200 transition text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
                      title="Copy command"
                    >
                      {copiedText === `cli-${idx}` ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{cmdItem.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
