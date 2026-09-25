import { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Mono, Meta } from '../../components/ui/Typography';
import { useTheme } from '../../components/ThemeProvider';

type ThemeOption = 'light' | 'dark' | 'system';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="SYSTEM"
        title="SETTINGS"
        description="Configure workspace defaults, display density, and notification preferences."
      />

      <div className="flex flex-col gap-12 pb-24 max-w-3xl">
        
        <section className="flex flex-col gap-6">
          <SectionHeader number="01" title="WORKSPACE" />
          <div className="flex flex-col gap-6 p-6 border border-border bg-surface rounded-sm">
            <Select 
              label="PROCUREMENT WORKSPACE" 
              value="GOV_DEMO"
              options={[{value: 'GOV_DEMO', label: 'Government Procurement Demo'}]} 
            />
            <Select 
              label="DEFAULT WORKFLOW" 
              value="STD_REC"
              options={[{value: 'STD_REC', label: 'Standard Recommendation'}]} 
            />
            <Select 
              label="EVIDENCE MODE" 
              value="DETAILED"
              options={[{value: 'DETAILED', label: 'Detailed'}, {value: 'SUMMARY', label: 'Summary'}]} 
            />
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeader number="02" title="LANGUAGE" />
          <div className="flex flex-col gap-6 p-6 border border-border bg-surface rounded-sm">
            <Select 
              label="INTERFACE LANGUAGE" 
              value="EN"
              options={[
                {value: 'EN', label: 'English'},
                {value: 'HI', label: 'Hindi'},
                {value: 'MR', label: 'Marathi'}
              ]} 
            />
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeader number="03" title="APPEARANCE" />
          <div className="flex flex-col gap-4 p-6 border border-border bg-surface rounded-sm">
            <Meta>THEME</Meta>
            <div className="flex gap-2" role="group" aria-label="Select theme">
              {(['light', 'dark', 'system'] as ThemeOption[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setTheme(opt)}
                  aria-pressed={theme === opt}
                  className={`px-4 py-2 text-sm font-mono uppercase border rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    theme === opt
                      ? 'bg-text-primary text-background border-transparent'
                      : 'bg-surface text-text-secondary border-border hover:bg-surface-elevated'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <Mono className="text-xs text-text-muted">
              {theme === 'system' ? 'Follows your OS setting' : `${theme === 'dark' ? 'Dark' : 'Light'} mode is active`}
            </Mono>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeader number="04" title="DISPLAY" />
          <div className="flex flex-col gap-6 p-6 border border-border bg-surface rounded-sm">
            <Select 
              label="COMPACT DENSITY" 
              value="STANDARD"
              options={[{value: 'STANDARD', label: 'Standard'}, {value: 'COMPACT', label: 'Compact'}]} 
            />
            <Select 
              label="EVIDENCE DISPLAY" 
              value="INLINE"
              options={[{value: 'INLINE', label: 'Inline'}, {value: 'SIDE_PANEL', label: 'Side Panel'}]} 
            />
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeader number="05" title="NOTIFICATIONS" />
          <div className="flex flex-col gap-6 p-6 border border-border bg-surface rounded-sm">
            <Select 
              label="STANDARD CHANGES" 
              value="ON"
              options={[{value: 'ON', label: 'ON'}, {value: 'OFF', label: 'OFF'}]} 
            />
            <Select 
              label="TENDER ISSUES" 
              value="ON"
              options={[{value: 'ON', label: 'ON'}, {value: 'OFF', label: 'OFF'}]} 
            />
            <Select 
              label="REVIEW REMINDERS" 
              value="OFF"
              options={[{value: 'ON', label: 'ON'}, {value: 'OFF', label: 'OFF'}]} 
            />
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeader number="06" title="SYSTEM" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border border-border bg-surface rounded-sm">
            <div className="flex flex-col gap-1">
              <Meta>FRONTEND VERSION</Meta>
              <Mono className="text-sm font-bold text-text-primary">Demo 0.1</Mono>
            </div>
            <div className="flex flex-col gap-1">
              <Meta>DATA MODE</Meta>
              <Mono className="text-sm text-warning font-bold">LOCAL FIXTURES</Mono>
            </div>
            <div className="flex flex-col gap-1">
              <Meta>API STATUS</Meta>
              <Mono className="text-sm text-text-muted">NOT CONNECTED</Mono>
            </div>
            <div className="flex flex-col gap-1">
              <Meta>AI ENGINE</Meta>
              <Mono className="text-sm text-text-muted">NOT CONNECTED</Mono>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-4 mt-8">
          {saved && <Mono className="text-success text-sm font-bold">SAVED</Mono>}
          <Button onClick={handleSave} size="lg">SAVE SETTINGS</Button>
        </div>
      </div>
    </PageContainer>
  );
}
