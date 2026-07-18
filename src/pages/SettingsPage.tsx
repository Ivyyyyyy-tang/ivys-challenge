import { type ChangeEvent, type ReactNode, useMemo, useRef, useState } from 'react';
import { loadAIConfig } from '../config/aiConfig';
import { loadDictionaryConfig, type DictionaryProviderName } from '../config/dictionaryConfig';
import {
  loadUserSettings,
  saveUserSettings,
  type LearningLevel,
  type UserAIProviderSetting,
  type UserSettings,
} from '../config/userSettings';
import {
  clearManagedLocalData,
  downloadDataBackup,
  importDataBackupFromJson,
} from '../services/storage/dataExportService';

type SettingCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  statusLabel: string;
  children: ReactNode;
};

export function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(() => loadUserSettings());
  const [showAIApiKey, setShowAIApiKey] = useState(false);
  const [showDictionaryApiKey, setShowDictionaryApiKey] = useState(false);
  const [dataMessage, setDataMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const aiConfig = useMemo(() => loadAIConfig(), [settings]);
  const dictionaryConfig = useMemo(() => loadDictionaryConfig(), [settings]);

  const handleAIProviderChange = (value: UserAIProviderSetting) => {
    const defaultModel = getDefaultAIModel(value);
    const next = saveUserSettings({
      aiProvider: value,
      ...(value === 'none'
        ? {
            aiApiKey: '',
            aiModel: '',
            aiEndpoint: '',
          }
        : settings.aiProvider !== value
          ? {
              aiModel: settings.aiModel || defaultModel,
            }
          : {}),
    });
    setSettings(next);
  };

  const handleDictionaryProviderChange = (value: DictionaryProviderName) => {
    const next = saveUserSettings({
      dictionaryProvider: value,
      ...(value === 'free'
        ? {
            dictionaryApiKey: '',
            dictionaryEndpoint: '',
          }
        : {}),
    });
    setSettings(next);
  };

  const handleLearningLevelChange = (value: LearningLevel) => {
    const next = saveUserSettings({ learningLevel: value });
    setSettings(next);
  };

  const handleDailyGoalChange = (value: number) => {
    const next = saveUserSettings({ dailyGoal: value });
    setSettings(next);
  };

  const handleSettingsFieldChange = (partial: Partial<UserSettings>) => {
    const next = saveUserSettings(partial);
    setSettings(next);
  };

  const handleExportData = () => {
    downloadDataBackup();
    setDataMessage('Backup file created. API keys are excluded from export.');
  };

  const handleImportButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportData = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      importDataBackupFromJson(raw);
      setDataMessage('Backup restored. Reloading your local study data now.');
      window.location.reload();
    } catch (error) {
      setDataMessage(error instanceof Error ? error.message : 'Import failed. Please check the backup file.');
    } finally {
      event.target.value = '';
    }
  };

  const handleClearLocalData = () => {
    const confirmed = window.confirm('Clear your local learning settings, personal vocabulary, and progress from this browser?');
    if (!confirmed) {
      return;
    }

    clearManagedLocalData();
    setDataMessage('Local learning data cleared. Reloading now.');
    window.location.reload();
  };

  const handleOpenFeedback = () => {
    window.open('https://github.com/Ivyyyyyy-tang/ivys-challenge/issues', '_blank', 'noopener,noreferrer');
  };

  const aiStatus = aiConfig
    ? `${formatAIProviderLabel(aiConfig.provider)} Connected`
    : settings.aiProvider === 'none'
      ? 'AI Not Connected'
      : `${formatAIProviderLabel(settings.aiProvider)} Selected · API key required`;

  const dictionaryStatus =
    dictionaryConfig.provider === 'free'
      ? 'Free Dictionary enabled'
      : settings.dictionaryProvider === 'custom' && settings.dictionaryApiKey
        ? `Custom Connected · ${maskApiKey(settings.dictionaryApiKey, 'key-')}`
        : settings.dictionaryProvider === 'custom'
          ? 'Custom Dictionary selected'
        : 'Free Dictionary enabled';

  return (
    <section className="flex h-full flex-col gap-10">
      <header className="flex items-start justify-between gap-8 border-b border-line/70 pb-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-[11px] uppercase tracking-[0.38em] text-taupe/90">Settings</p>
          <h2 className="font-display text-5xl leading-none tracking-tight text-ink">Learning Configuration</h2>
          <p className="max-w-2xl text-sm leading-7 text-taupe">
            A simple configuration space for choosing your AI and dictionary setup before deeper study begins.
          </p>
        </div>

        <div className="space-y-4 pt-1 text-right">
          <ConfigStat label="AI" value={aiStatus} />
          <ConfigStat label="Dictionary" value={dictionaryStatus} />
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <SettingCard
          eyebrow="AI Provider"
          title="AI Reading Connection"
          description="Choose how AI Reading should behave for this browser profile. No provider means the app stays in fallback mode."
          statusLabel={aiStatus}
        >
          <div className="space-y-6">
            <SegmentedControl<UserAIProviderSetting>
              options={[
                { value: 'none', label: 'None' },
                { value: 'openai', label: 'OpenAI' },
                { value: 'gemini', label: 'Gemini' },
                { value: 'deepseek', label: 'DeepSeek' },
                { value: 'custom', label: 'Custom' },
              ]}
              value={settings.aiProvider}
              onChange={handleAIProviderChange}
            />
            {settings.aiProvider !== 'none' ? (
              <div className="grid gap-4">
                <SecureSettingsField
                  label="API Key"
                  placeholder="Paste your API key"
                  value={settings.aiApiKey}
                  visible={showAIApiKey}
                  onToggleVisibility={() => setShowAIApiKey((value) => !value)}
                  onChange={(value) => handleSettingsFieldChange({ aiApiKey: value })}
                  onClear={() => handleSettingsFieldChange({ aiApiKey: '' })}
                />
                <SettingsField
                  label="Model"
                  placeholder={getAIModelPlaceholder(settings.aiProvider)}
                  value={settings.aiModel}
                  onChange={(value) => handleSettingsFieldChange({ aiModel: value })}
                />
                <SettingsField
                  label={settings.aiProvider === 'custom' ? 'Endpoint (required)' : 'Endpoint (optional)'}
                  placeholder={getAIEndpointPlaceholder(settings.aiProvider)}
                  value={settings.aiEndpoint}
                  onChange={(value) => handleSettingsFieldChange({ aiEndpoint: value })}
                />
                <SecurityNotice />
              </div>
            ) : null}
          </div>
        </SettingCard>

        <SettingCard
          eyebrow="Dictionary"
          title="Vocabulary Enrichment Source"
          description="Free Dictionary works without setup. Custom Dictionary can use your own endpoint and API key in this browser profile."
          statusLabel={dictionaryStatus}
        >
          <div className="space-y-6">
            <SegmentedControl<DictionaryProviderName>
              options={[
                { value: 'free', label: 'Free Dictionary' },
                { value: 'custom', label: 'Custom' },
              ]}
              value={settings.dictionaryProvider}
              onChange={handleDictionaryProviderChange}
            />
            {settings.dictionaryProvider === 'custom' ? (
              <div className="grid gap-4">
                <SettingsField
                  label="Endpoint"
                  placeholder="https://api.example.com/dictionary"
                  value={settings.dictionaryEndpoint}
                  onChange={(value) => handleSettingsFieldChange({ dictionaryEndpoint: value })}
                />
                <SecureSettingsField
                  label="API Key"
                  placeholder="Paste your API key"
                  value={settings.dictionaryApiKey}
                  visible={showDictionaryApiKey}
                  onToggleVisibility={() => setShowDictionaryApiKey((value) => !value)}
                  onChange={(value) => handleSettingsFieldChange({ dictionaryApiKey: value })}
                  onClear={() => handleSettingsFieldChange({ dictionaryApiKey: '' })}
                />
                <SecurityNotice />
              </div>
            ) : null}
          </div>
        </SettingCard>

        <SettingCard
          eyebrow="Learning Level"
          title="Default Study Tone"
          description="This setting does not replace existing review logic. It simply stores a preferred learning profile for future expansion."
          statusLabel={formatLearningLevelLabel(settings.learningLevel)}
        >
          <SegmentedControl<LearningLevel>
            options={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
            value={settings.learningLevel}
            onChange={handleLearningLevelChange}
          />
        </SettingCard>

        <SettingCard
          eyebrow="Daily Goal"
          title="Daily Vocabulary Goal"
          description="A lightweight personal target stored in local settings. This keeps the configuration visible without adding account complexity."
          statusLabel={`${settings.dailyGoal} words`}
        >
          <div className="space-y-4">
            <input
              type="range"
              min="1"
              max="300"
              step="1"
              value={settings.dailyGoal}
              onChange={(event) => handleDailyGoalChange(Number(event.target.value))}
              className="w-full accent-ink"
            />
            <div className="flex items-center justify-between text-sm text-taupe">
              <span>1</span>
              <span className="font-display text-2xl text-ink">{settings.dailyGoal}</span>
              <span>300</span>
            </div>
          </div>
        </SettingCard>

        <SettingCard
          eyebrow="Data Management"
          title="Local Backup and Restore"
          description="Create a local backup, restore a previous JSON file, or clear managed study data from this browser."
          statusLabel="Privacy-first local backup"
        >
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleExportData}
                className="border border-ink bg-ink px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-sand transition-colors hover:bg-sand hover:text-ink"
              >
                Export My Data
              </button>
              <button
                type="button"
                onClick={handleImportButtonClick}
                className="border border-line bg-white/78 px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-taupe transition-colors hover:border-taupe hover:text-ink"
              >
                Import Data
              </button>
              <button
                type="button"
                onClick={handleClearLocalData}
                className="border border-line bg-white/78 px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-taupe transition-colors hover:border-taupe hover:text-ink"
              >
                Clear Local Data
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportData}
              className="hidden"
            />
            <div className="border border-line/70 bg-sand/32 px-4 py-4 text-sm leading-7 text-taupe">
              <p>Your data stays in your browser. Export files do not include API keys.</p>
            </div>
            {dataMessage ? <p className="text-sm leading-7 text-taupe">{dataMessage}</p> : null}
          </div>
        </SettingCard>

        <SettingCard
          eyebrow="Feedback"
          title="Report Issues or Share Ideas"
          description="Open the GitHub Issues page to report bugs, suggest improvements, or share product feedback."
          statusLabel="GitHub Issues"
        >
          <div className="space-y-6">
            <button
              type="button"
              onClick={handleOpenFeedback}
              className="border border-ink bg-ink px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-sand transition-colors hover:bg-sand hover:text-ink"
            >
              Open Feedback Page
            </button>
            <div className="border border-line/70 bg-sand/32 px-4 py-4 text-sm leading-7 text-taupe">
              <p>Use GitHub Issues for bug reports, feature requests, and product feedback.</p>
            </div>
          </div>
        </SettingCard>
      </div>
    </section>
  );
}

function SettingCard({ eyebrow, title, description, statusLabel, children }: SettingCardProps) {
  return (
    <section className="border border-line/80 bg-white/68 p-6 shadow-card">
      <div className="flex items-start justify-between gap-6">
        <div className="max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.32em] text-taupe/90">{eyebrow}</p>
          <h3 className="mt-3 font-display text-[1.85rem] leading-tight text-ink">{title}</h3>
          <p className="mt-4 text-sm leading-7 text-taupe">{description}</p>
        </div>
        <div className="border border-line/70 bg-sand/28 px-4 py-3 text-right">
          <p className="text-[11px] uppercase tracking-[0.24em] text-taupe/80">Status</p>
          <p className="mt-2 text-sm leading-6 text-ink">{statusLabel}</p>
        </div>
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function ConfigStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-end gap-3">
      <p className="text-[11px] uppercase tracking-[0.3em] text-taupe/90">{label}</p>
      <p className="max-w-[18rem] text-right text-[11px] uppercase leading-[1.5] tracking-[0.2em] text-taupe/90">
        {value}
      </p>
    </div>
  );
}

function SettingsField({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'password';
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] uppercase tracking-[0.24em] text-taupe/90">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="border border-line bg-white/82 px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-taupe/55 focus:border-ink"
      />
    </label>
  );
}

function SecureSettingsField({
  label,
  placeholder,
  value,
  visible,
  onToggleVisibility,
  onChange,
  onClear,
}: {
  label: string;
  placeholder: string;
  value: string;
  visible: boolean;
  onToggleVisibility: () => void;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] uppercase tracking-[0.24em] text-taupe/90">{label}</span>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="border border-line bg-white/82 px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-taupe/55 focus:border-ink"
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="border border-line bg-white/78 px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-taupe transition-colors hover:border-taupe hover:text-ink"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={!value}
          className="border border-line bg-white/78 px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-taupe transition-colors hover:border-taupe hover:text-ink disabled:cursor-default disabled:opacity-45"
        >
          Clear
        </button>
      </div>
    </label>
  );
}

function SecurityNotice() {
  return (
    <div className="border border-line/70 bg-sand/32 px-4 py-4 text-sm leading-7 text-taupe">
      <p>Your API key is stored locally in this browser. Ivy&apos;s Challenge does not collect or upload your key. API usage costs are charged by your provider.</p>
      <p>你的 API Key 仅保存在当前浏览器。Ivy&apos;s Challenge 不会收集或上传你的 Key。API 使用费用由你的服务商收取。</p>
    </div>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={[
            'border px-4 py-3 text-[11px] uppercase tracking-[0.22em] transition-colors',
            option.value === value
              ? 'border-ink bg-ink text-sand'
              : 'border-line bg-white/78 text-taupe hover:border-taupe hover:text-ink',
          ].join(' ')}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function formatAIProviderLabel(value: UserAIProviderSetting) {
  if (value === 'openai') return 'OpenAI';
  if (value === 'gemini') return 'Gemini';
  if (value === 'deepseek') return 'DeepSeek';
  if (value === 'custom') return 'Custom';
  return 'None';
}

function formatLearningLevelLabel(value: LearningLevel) {
  if (value === 'beginner') return 'Beginner';
  if (value === 'advanced') return 'Advanced';
  return 'Intermediate';
}

function maskApiKey(value: string, prefix = 'sk-') {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const suffix = trimmed.slice(-4);
  return `${prefix}****${suffix}`;
}

function getDefaultAIModel(provider: UserAIProviderSetting) {
  if (provider === 'deepseek') return 'deepseek-chat';
  return '';
}

function getAIModelPlaceholder(provider: UserAIProviderSetting) {
  if (provider === 'openai') return 'gpt-4.1-mini';
  if (provider === 'gemini') return 'gemini-1.5-flash';
  if (provider === 'deepseek') return 'deepseek-chat';
  if (provider === 'custom') return 'provider-specific-model';
  return 'model';
}

function getAIEndpointPlaceholder(provider: UserAIProviderSetting) {
  if (provider === 'openai') return 'https://api.openai.com/v1/chat/completions';
  if (provider === 'gemini') return 'https://generativelanguage.googleapis.com/v1beta/models/...';
  if (provider === 'deepseek') return 'https://api.deepseek.com/v1/chat/completions';
  if (provider === 'custom') return 'https://your-provider.example.com/v1/chat/completions';
  return 'https://api.example.com/v1';
}
