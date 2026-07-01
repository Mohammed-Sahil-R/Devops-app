import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, RefreshCw, Layers, CheckCircle, Flame, Shield, HelpCircle } from 'lucide-react';

type StepId = 'idle' | 'init' | 'plan' | 'apply' | 'active' | 'destroying';

interface CloudResource {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'creating' | 'active';
  icon: string;
}

export default function DiagramTerraform() {
  const [currentStep, setCurrentStep] = useState<StepId>('idle');
  const [provider, setProvider] = useState<'gcp' | 'aws'>('gcp');
  const [consoleLogs, setConsoleLogs] = useState<string[]>(['State: Uninitialized. Select cloud and run terraform init.']);
  const [resources, setResources] = useState<CloudResource[]>([]);

  const runInit = () => {
    if (currentStep !== 'idle' && currentStep !== 'active') return;
    setCurrentStep('init');
    setConsoleLogs([
      'Initializing the backend...',
      `Downloading hashicorp/${provider} provider plugin...`,
      `Verified hashicorp/${provider} checksum successful.`,
      'Terraform has been successfully initialized!'
    ]);

    setTimeout(() => {
      setCurrentStep('plan');
    }, 1500);
  };

  const runPlan = () => {
    if (currentStep !== 'plan') return;
    setConsoleLogs(prev => [
      ...prev,
      '-------------------------------------------------------',
      'Terraform will perform the following actions:',
      `  + resource "${provider === 'gcp' ? 'google_compute_network' : 'aws_vpc'}" "network" {`,
      '      cidr_block = "10.0.0.0/16"',
      '      name       = "devops-vpc"',
      '    }',
      `  + resource "${provider === 'gcp' ? 'google_compute_instance' : 'aws_instance'}" "web_server" {`,
      '      machine_type = "t3.micro"',
      '      tags         = ["web", "frontend"]',
      '    }',
      `  + resource "${provider === 'gcp' ? 'google_sql_database_instance' : 'aws_db_instance'}" "db" {`,
      '      engine = "postgres-15"',
      '    }',
      'Plan: 3 to add, 0 to change, 0 to destroy.'
    ]);

    setTimeout(() => {
      // populate planning resources
      setResources([
        { id: 'vpc', name: provider === 'gcp' ? 'google_compute_network.vpc' : 'aws_vpc.vpc', type: 'VPC Network', status: 'pending', icon: '🌐' },
        { id: 'vm', name: provider === 'gcp' ? 'google_compute_instance.vm' : 'aws_instance.vm', type: 'Virtual Machine', status: 'pending', icon: '💻' },
        { id: 'db', name: provider === 'gcp' ? 'google_sql_database.db' : 'aws_db_instance.db', type: 'Relational DB', status: 'pending', icon: '🗄️' }
      ]);
    }, 500);
  };

  const runApply = async () => {
    if (currentStep !== 'plan') return;
    setCurrentStep('apply');
    setConsoleLogs(prev => [...prev, '-------------------------------------------------------', 'Applying changes...']);

    // Step 1: Create VPC
    setResources(curr => curr.map(r => r.id === 'vpc' ? { ...r, status: 'creating' } : r));
    setConsoleLogs(prev => [...prev, 'vpc: Creating network boundary...']);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setResources(curr => curr.map(r => r.id === 'vpc' ? { ...r, status: 'active' } : r));
    setConsoleLogs(prev => [...prev, 'vpc: Creation complete after 1s. ID: vpc-78a0d']);

    // Step 2: Create VM and DB parallel
    setResources(curr => curr.map(r => r.id === 'vm' || r.id === 'db' ? { ...r, status: 'creating' } : r));
    setConsoleLogs(prev => [...prev, 'vm: Provisioning core instance layers...', 'db: Spinning up PostgreSQL server...']);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setResources(curr => curr.map(r => r.id === 'vm' || r.id === 'db' ? { ...r, status: 'active' } : r));
    setConsoleLogs(prev => [...prev, 'vm: Creation complete. Web server live.', 'db: DB operational. Migrations complete.']);

    setConsoleLogs(prev => [...prev, 'Apply complete! Resources: 3 added, 0 changed, 0 destroyed.', 'Infrastructure active.']);
    setCurrentStep('active');
  };

  const runDestroy = async () => {
    if (currentStep !== 'active') return;
    setCurrentStep('destroying');
    setConsoleLogs(prev => [...prev, '-------------------------------------------------------', 'Destroying resources...']);

    // Delete VM and DB
    setResources(curr => curr.map(r => r.id === 'vm' || r.id === 'db' ? { ...r, status: 'creating' } : r));
    await new Promise(resolve => setTimeout(resolve, 1000));
    setResources(curr => curr.filter(r => r.id !== 'vm' && r.id !== 'db'));
    setConsoleLogs(prev => [...prev, 'vm: terminated.', 'db: instance deleted. DB state storage snapshot saved.']);

    // Delete VPC
    setResources(curr => curr.map(r => r.id === 'vpc' ? { ...r, status: 'creating' } : r));
    await new Promise(resolve => setTimeout(resolve, 800));
    setResources([]);
    setConsoleLogs(prev => [...prev, 'vpc: deleted.', 'Destroy complete! 3 resources removed.', 'State clean.']);
    setCurrentStep('idle');
  };

  return (
    <div id="diagram-terraform" className="space-y-6">
      
      {/* Workflow Path controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        
        {/* Step 1: INIT */}
        <button
          id="btn-tf-init"
          onClick={runInit}
          disabled={currentStep !== 'idle' && currentStep !== 'active'}
          className={`p-3.5 border rounded-xl flex flex-col items-center gap-1.5 transition text-center cursor-pointer ${
            currentStep === 'idle' ? 'border-sky-300 bg-sky-50/40 text-sky-700 hover:bg-sky-100/60 font-semibold' :
            currentStep === 'init' ? 'border-amber-300 bg-amber-50/50 text-amber-700 animate-pulse font-semibold' :
            'border-slate-100 text-slate-400 bg-slate-50'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Step 1</span>
          <span className="text-xs font-bold flex items-center gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${currentStep === 'init' ? 'animate-spin' : ''}`} />
            terraform init
          </span>
          <span className="text-[10px]">Prepare directory & load plugins</span>
        </button>

        {/* Step 2: PLAN */}
        <button
          id="btn-tf-plan"
          onClick={runPlan}
          disabled={currentStep !== 'plan'}
          className={`p-3.5 border rounded-xl flex flex-col items-center gap-1.5 transition text-center cursor-pointer ${
            currentStep === 'plan' ? 'border-sky-300 bg-sky-50/40 text-sky-700 hover:bg-sky-100/60 font-semibold' :
            'border-slate-100 text-slate-400 bg-slate-50'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Step 2</span>
          <span className="text-xs font-bold flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5" />
            terraform plan
          </span>
          <span className="text-[10px]">Dry-run to verify config drift</span>
        </button>

        {/* Step 3: APPLY */}
        <button
          id="btn-tf-apply"
          onClick={runApply}
          disabled={currentStep !== 'plan' || resources.length === 0}
          className={`p-3.5 border rounded-xl flex flex-col items-center gap-1.5 transition text-center cursor-pointer ${
            currentStep === 'plan' && resources.length > 0 ? 'border-emerald-300 bg-emerald-50/40 text-emerald-700 hover:bg-emerald-100/60 font-semibold' :
            currentStep === 'apply' ? 'border-amber-300 bg-amber-50/50 text-amber-700 animate-pulse font-semibold' :
            'border-slate-100 text-slate-400 bg-slate-50'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Step 3</span>
          <span className="text-xs font-bold flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            terraform apply
          </span>
          <span className="text-[10px]">Execute provision plan</span>
        </button>

        {/* Step 4: DESTROY */}
        <button
          id="btn-tf-destroy"
          onClick={runDestroy}
          disabled={currentStep !== 'active'}
          className={`p-3.5 border rounded-xl flex flex-col items-center gap-1.5 transition text-center cursor-pointer ${
            currentStep === 'active' ? 'border-rose-300 bg-rose-50/40 text-rose-700 hover:bg-rose-100/60 font-semibold' :
            currentStep === 'destroying' ? 'border-amber-300 bg-amber-50/50 text-amber-700 animate-pulse font-semibold' :
            'border-slate-100 text-slate-400 bg-slate-50'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Step 4</span>
          <span className="text-xs font-bold flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5" />
            terraform destroy
          </span>
          <span className="text-[10px]">Tear down and clean state</span>
        </button>

      </div>

      {/* Cloud Canvas / Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Cloud Topology Visualization Panel */}
        <div className="lg:col-span-7 border border-slate-100 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-sky-600" />
                Live Cloud Resources Provision Sandbox
              </h4>
              <div className="flex gap-1.5">
                <button
                  onClick={() => { if (currentStep === 'idle') setProvider('gcp'); }}
                  disabled={currentStep !== 'idle'}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${provider === 'gcp' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                >
                  GCP
                </button>
                <button
                  onClick={() => { if (currentStep === 'idle') setProvider('aws'); }}
                  disabled={currentStep !== 'idle'}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${provider === 'aws' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                >
                  AWS
                </button>
              </div>
            </div>

            {resources.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-white dark:bg-slate-900 text-slate-400 text-center p-4">
                <Layers className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs font-semibold">Infrastructure Canvas Empty</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Initialize and dry-run code specs to inspect targets.</p>
              </div>
            ) : (
              <div className="border border-sky-200 bg-sky-50/20 dark:bg-sky-950/10 p-5 rounded-2xl relative min-h-[190px]">
                <div className="absolute top-2.5 left-3 text-[9px] font-bold text-sky-600 tracking-wider uppercase font-mono">
                  🌐 VPC Network ({provider === 'gcp' ? 'devops-vpc' : 'aws-vpc'})
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  {resources.filter(r => r.id !== 'vpc').map((resource) => (
                    <motion.div
                      key={resource.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`p-4 rounded-xl border flex items-center gap-3 bg-white dark:bg-slate-900 shadow-sm ${
                        resource.status === 'creating' ? 'border-amber-300 bg-amber-50/20 animate-pulse' : 'border-slate-100'
                      }`}
                    >
                      <span className="text-2xl">{resource.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-800 line-clamp-1">{resource.type}</p>
                        <p className="text-[9px] font-mono text-slate-400 line-clamp-1">{resource.name}</p>
                        <span className={`text-[8px] font-bold mt-1 inline-block uppercase px-1.5 py-0.5 rounded ${
                          resource.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {resource.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100/50 pt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-emerald-600" />
              State: {currentStep === 'active' ? 'Synchronized (terraform.tfstate)' : 'Drift Checked'}
            </span>
            <span className="font-mono">Cloud: {provider.toUpperCase()}</span>
          </div>
        </div>

        {/* Terminal logs panel */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>●</span> Console Logs
            </h4>
            <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">terraform.log</span>
          </div>
          <div className="bg-slate-950 text-slate-100 font-mono text-xs p-4 rounded-xl h-[260px] overflow-y-auto space-y-1 shadow-inner border border-slate-800 custom-scrollbar">
            {consoleLogs.map((log, index) => (
              <div key={index} className="text-slate-300">
                {log}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
