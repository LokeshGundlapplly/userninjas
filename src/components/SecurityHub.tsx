import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileLock2, Lock, Terminal, RefreshCw } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface AuditLog {
  timestamp: string;
  event: string;
  actor: string;
  ip: string;
}

const INITIAL_LOGS: AuditLog[] = [
  { timestamp: "15:42:01", event: "Member seat provisioned (SCIM sync)", actor: "azure-ad-sync", ip: "54.210.12.98" },
  { timestamp: "15:40:15", event: "Study 'Mobile Checkout v2' archived", actor: "lead-researcher@company.com", ip: "192.168.1.45" },
  { timestamp: "15:38:50", event: "SAML SSO connection established successfully", actor: "okta-idp-integration", ip: "3.23.112.5" },
  { timestamp: "15:34:12", event: "SSO Certificate rotation complete", actor: "security-admin@company.com", ip: "18.204.42.19" }
];

const NEW_LOG_POOL = [
  { event: "MFA challenge successfully verified", actor: "lisa-researcher@company.com", ip: "172.56.21.9" },
  { event: "GDPR deletion queue cleared (API request)", actor: "compliance-bot", ip: "localhost" },
  { event: "Audit log archive exported to secure S3 bucket", actor: "system-cron", ip: "10.0.4.15" },
  { event: "New tester session screen-feed encrypted (AES-256)", actor: "analysis-engine", ip: "52.4.99.112" }
];

export default function SecurityHub() {
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_LOGS);

  // Periodic log feed simulator
  useEffect(() => {
    const interval = setInterval(() => {
      const randomLog = NEW_LOG_POOL[Math.floor(Math.random() * NEW_LOG_POOL.length)];
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0];
      
      const newLogObj = {
        timestamp: timeString,
        event: randomLog.event,
        actor: randomLog.actor,
        ip: randomLog.ip
      };

      setLogs(prev => [newLogObj, ...prev.slice(0, 3)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 relative overflow-hidden bg-[#0F172A] border-t border-slate-800">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">Trust & Compliance</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white">
              Enterprise security. <br />
              <span className="text-gradient bg-gradient-to-r from-emerald-400 to-indigo-500 text-glow">Zero compromises.</span>
            </h2>
            <p className="text-slate-300 text-sm mt-4">
              We design security into the core of User Ninjas. Rest easy with end-to-end audit logs, GDPR isolation, and complete SOC 2 compliance.
            </p>
          </div>
        </ScrollReveal>

        {/* Security & Audit log dashboard split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-center">
          
          {/* Left panel: Security trust cards */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm flex gap-4 spotlight-card">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-white">SOC 2 Type II Compliant</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  Evaluated and verified. Our server infrastructure, code deployment pipelines, and data storage systems adhere to strict SOC 2 principles.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm flex gap-4 spotlight-card">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                <FileLock2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-white">GDPR & CCPA Compliant</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  Complete user data privacy. Tester sessions and personal identifiers are isolated and purged automatically in compliance with global laws.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm flex gap-4 spotlight-card">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-white">End-to-End Encryption</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  AES-256 encryption at rest, TLS 1.3 in transit. Video session recordings and transcripts are fully protected with strict client keys.
                </p>
              </div>
            </div>
          </div>

          {/* Right panel: Live Audit Logs feed terminal */}
          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl blur-2xl opacity-75 pointer-events-none" />
            
            <div className="relative rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl p-5 overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Terminal className="w-4 h-4 text-primary animate-pulse" />
                  <span>Real-time Security Audit Log</span>
                </div>
                <span className="text-[9px] text-slate-400 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 text-emerald-500 animate-spin" style={{ animationDuration: '3s' }} /> Live monitoring active
                </span>
              </div>

              {/* Log Terminal Window */}
              <div className="space-y-3 font-mono text-[10px] min-h-[190px]">
                {logs.map((log, idx) => (
                  <div 
                    key={idx} 
                    className={`pb-3 border-b border-slate-900 last:border-b-0 space-y-1 transition-all duration-500 ${
                      idx === 0 ? 'text-primary border-primary/20 animate-fade-in' : 'text-slate-400'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[9px] opacity-75">
                      <span>[{log.timestamp}] Actor: {log.actor}</span>
                      <span>IP: {log.ip}</span>
                    </div>
                    <p className={`font-semibold ${idx === 0 ? 'text-slate-100' : 'text-slate-400'}`}>
                      → {log.event}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
