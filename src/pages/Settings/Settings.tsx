import React, { useRef, useState } from 'react';
import {
  Bell,
  Check,
  Download,
  Moon,
  Plus,
  RefreshCw,
  ShieldAlert,
  Sun,
  Trash2,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useStorage } from '../../contexts/StorageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { presetOptions } from '../../styles/themes';

export const Settings: React.FC = () => {
  const { theme, setTheme, preset, setPreset, activePreset } = useTheme();
  const {
    settings,
    updateSettings,
    resetData,
    exportJSON,
    importJSON,
  } = useStorage();

  const [newProdDomain, setNewProdDomain] = useState<string>('');
  const [newDistDomain, setNewDistDomain] = useState<string>('');
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  const handleAddProductive = () => {
    const clean = newProdDomain.trim().toLowerCase();
    if (!clean) return;
    if (settings.customProductiveDomains.includes(clean)) {
      showToast('Domain already in productive list', 'error');
      return;
    }
    const updated = [...settings.customProductiveDomains, clean];
    const filteredDist = settings.customDistractingDomains.filter((d) => d !== clean);
    updateSettings({
      customProductiveDomains: updated,
      customDistractingDomains: filteredDist,
    });
    setNewProdDomain('');
    showToast(`Added ${clean} as productive`, 'success');
  };

  const handleRemoveProductive = (domain: string) => {
    const updated = settings.customProductiveDomains.filter((d) => d !== domain);
    updateSettings({ customProductiveDomains: updated });
  };

  const handleAddDistracting = () => {
    const clean = newDistDomain.trim().toLowerCase();
    if (!clean) return;
    if (settings.customDistractingDomains.includes(clean)) {
      showToast('Domain already in distracting list', 'error');
      return;
    }
    const updated = [...settings.customDistractingDomains, clean];
    const filteredProd = settings.customProductiveDomains.filter((d) => d !== clean);
    updateSettings({
      customDistractingDomains: updated,
      customProductiveDomains: filteredProd,
    });
    setNewDistDomain('');
    showToast(`Added ${clean} as distracting`, 'success');
  };

  const handleRemoveDistracting = (domain: string) => {
    const updated = settings.customDistractingDomains.filter((d) => d !== domain);
    updateSettings({ customDistractingDomains: updated });
  };

  const handleExport = async () => {
    const jsonStr = await exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `website-time-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!', 'success');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const success = await importJSON(text);
      if (success) {
        showToast('Data imported successfully!', 'success');
      } else {
        showToast('Failed to import JSON data. Invalid format.', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetConfirm = async () => {
    await resetData();
    setIsResetModalOpen(false);
    showToast('All statistics and settings have been reset.', 'success');
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Extension Settings</h2>
        <p className="text-xs text-slate-400">Configure appearance, notifications, rules, and data backups</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Theme Settings */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-400" /> Appearance & Theme
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['dark', 'light', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 font-medium text-xs capitalize transition-all ${
                theme === t
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'dark' ? (
                <Moon className="w-5 h-5" />
              ) : t === 'light' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              <span>{t} Mode</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Sun className="w-4 h-4 text-cyan-400" /> Theme Presets
        </h3>
        <p className="text-xs text-slate-400">Choose a polished visual palette that updates the full extension instantly.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {presetOptions.map((option) => {
            const isSelected = preset === option.value;
            const swatches = option.preview;

            return (
              <button
                key={option.value}
                onClick={() => setPreset(option.value)}
                className={`group rounded-2xl border p-3 text-left transition-all duration-300 ${
                  isSelected
                    ? 'border-[color:var(--theme-primary)] shadow-lg shadow-[color:var(--theme-shadow)]'
                    : 'border-[color:var(--theme-border)] hover:border-[color:var(--theme-accent)] hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-100">{option.label}</span>
                  {isSelected ? <Check className="w-4 h-4 text-cyan-400" /> : null}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {swatches.map((swatch, index) => (
                    <span
                      key={`${option.value}-${index}`}
                      className="h-3.5 w-3.5 rounded-full border border-white/10"
                      style={{ backgroundColor: swatch }}
                    />
                  ))}
                </div>
                <div className="mt-3 text-[11px] text-slate-400">
                  {option.value === 'glassmorphic-blue' ? 'Default premium dashboard' : 'Instant visual refresh'}
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-hover)]/50 p-3 text-xs text-slate-400">
          Current preset: <span className="font-semibold text-slate-200">{activePreset.name}</span>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" /> Notifications & Reminders
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Usage Limit Alerts</h4>
            <p className="text-xs text-slate-400">
              Receive a browser notification when daily time on a website exceeds threshold
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.enableNotifications}
            onChange={(e) => updateSettings({ enableNotifications: e.target.checked })}
            className="w-5 h-5 accent-indigo-600 cursor-pointer"
          />
        </div>

        {settings.enableNotifications && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">Notification Threshold:</span>
              <span className="text-indigo-400 font-bold">
                {settings.notificationThresholdMinutes} Minutes ({Math.round(settings.notificationThresholdMinutes / 60)} hrs)
              </span>
            </div>
            <input
              type="range"
              min={30}
              max={300}
              step={15}
              value={settings.notificationThresholdMinutes}
              onChange={(e) => updateSettings({ notificationThresholdMinutes: Number(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Productive & Distracting Website Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Productive Domains */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Productive Websites
          </h3>
          <p className="text-xs text-slate-400">Add domains that boost your productivity score</p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. github.com"
              value={newProdDomain}
              onChange={(e) => setNewProdDomain(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <Button size="sm" onClick={handleAddProductive} icon={<Plus className="w-3.5 h-3.5" />}>
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {settings.customProductiveDomains.map((dom) => (
              <span
                key={dom}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              >
                {dom}
                <button onClick={() => handleRemoveProductive(dom)} className="hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Distracting Domains */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Distracting Websites
          </h3>
          <p className="text-xs text-slate-400">Add domains that deduct from your score</p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. twitter.com"
              value={newDistDomain}
              onChange={(e) => setNewDistDomain(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <Button size="sm" variant="danger" onClick={handleAddDistracting} icon={<Plus className="w-3.5 h-3.5" />}>
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {settings.customDistractingDomains.map((dom) => (
              <span
                key={dom}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20"
              >
                {dom}
                <button onClick={() => handleRemoveDistracting(dom)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Backup & Import/Export */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-400" /> Data Backup & Restore
        </h3>
        <p className="text-xs text-slate-400">Export your local usage statistics or restore from a JSON backup file.</p>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleExport} icon={<Download className="w-4 h-4" />}>
            Export JSON Backup
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />

          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload className="w-4 h-4" />}
          >
            Import JSON Backup
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-panel p-6 border-red-500/30 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Danger Zone
        </h3>
        <p className="text-xs text-slate-400">
          Permanently delete all website time tracking history, session logs, and daily records.
        </p>

        <Button variant="danger" onClick={() => setIsResetModalOpen(true)} icon={<Trash2 className="w-4 h-4" />}>
          Reset All Statistics
        </Button>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset All Extension Data?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Are you sure you want to permanently reset all website statistics, daily records, and session history? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleResetConfirm}>
              Yes, Reset Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
