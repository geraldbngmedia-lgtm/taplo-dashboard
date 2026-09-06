'use client'

import Image from 'next/image'
import { useState } from 'react'
import {
  Check,
  ChevronDown,
  ExternalLink,
  FileText,
  ListChecks,
  Lightbulb,
  Languages,
  LockKeyhole,
  Mic,
  Plus,
  Square,
  SquareCheck,
  X,
} from 'lucide-react'

const questions = {
  Background: [
    'Tell us about your most recent roles and what you have worked on.',
    'What attracts you to this senior full-stack role at Fortnox?',
    'How do you work best, and what do you need to perform at your best?',
  ],
  Qualifications: [
    'Tell us about a project where you wrote a lot of Java or Kotlin.',
    'Tell us about an application you built with Spring Boot.',
    'Tell us about a project where you developed frontend with React.',
  ],
}

export default function Page() {
  const [isRecording, setIsRecording] = useState(false)
  const [hasConsent, setHasConsent] = useState(false)
  const [language, setLanguage] = useState('')
  const [jobAdded, setJobAdded] = useState(false)

  return (
    <main className="widget-stage">
      <section className="widget-window" aria-label="Taplo Widget">
        <header className="window-bar">
          <div className="brand-mark" aria-hidden="true">
            <Image src="/taplo-icon-512.png" alt="" width={18} height={18} priority />
          </div>
          <span>Taplo Widget</span>
          <div className="window-controls" aria-hidden="true"><span>−</span><span>□</span><X size={15} /></div>
        </header>

        {!isRecording ? (
          <SetupPanel language={language} setLanguage={setLanguage} hasConsent={hasConsent} setHasConsent={setHasConsent} jobAdded={jobAdded} setJobAdded={setJobAdded} onStart={() => setIsRecording(true)} />
        ) : (
          <RecordingPanel onStop={() => setIsRecording(false)} />
        )}
      </section>
    </main>
  )
}

function SetupPanel({ language, setLanguage, hasConsent, setHasConsent, jobAdded, setJobAdded, onStart }: any) {
  return (
    <div className="panel-content">
      <div className="eyebrow">MEETING DETECTED</div>
      <h1>Untitled session</h1>

      <div className="action-card">
        <span>Join meeting</span>
        <button className="button button-coral" type="button"><ExternalLink size={15} />Open</button>
      </div>
      <div className="action-card">
        <span>Job description <small>{jobAdded ? 'Improves analysis' : ''}</small></span>
        <button className="button button-soft" type="button" onClick={() => setJobAdded(true)}>{jobAdded ? <Check size={16} /> : <Plus size={16} />}{jobAdded ? 'Added' : 'Add'}</button>
      </div>

      <div className="setup-card">
        <div className="eyebrow">RECORDING · READY</div>
        <div className="field-row"><Languages size={17} /><label htmlFor="language">Language</label><div className="select-wrap"><select id="language" value={language} onChange={(event) => setLanguage(event.target.value)}><option value="">Select...</option><option value="en">English</option><option value="sv">Swedish</option></select><ChevronDown size={15} /></div></div>
        <p className="helper">Pick the interview language to enable Start.</p>
        <label className="consent-row"><input type="checkbox" checked={hasConsent} onChange={(event) => setHasConsent(event.target.checked)} /><span className="checkbox"><SquareCheck size={16} /></span><LockKeyhole size={16} /><span>I have candidate consent</span></label>
        <button className="start-button" type="button" disabled={!language || !hasConsent} onClick={onStart}><Mic size={17} />Start</button>
      </div>
    </div>
  )
}

function RecordingPanel({ onStop }: { onStop: () => void }) {
  const [highlighted, setHighlighted] = useState<string | null>(null)
  const [followUps, setFollowUps] = useState<string[]>([])

  const toggleHighlight = (question: string) => {
    setHighlighted((current) => current === question ? null : question)
  }

  const addFollowUp = (question: string) => {
    setFollowUps((current) => current.includes(question) ? current : [...current, question])
  }

  return (
    <div className="panel-content recording-panel">
      <div className="recording-head"><div className="eyebrow recording-label"><span className="live-dot" />RECORDING · 00:42</div><button className="button button-stop" type="button" onClick={onStop}><Square size={13} fill="currentColor" />Stop</button></div>
      <h1>Untitled session</h1>
      <div className="interview-card">
        <div className="interview-title"><span className="icon-tile"><ListChecks size={18} /></span><strong>Interview</strong></div>
        {Object.entries(questions).map(([section, items]) => <div className="question-section" key={section}><h2>{section}</h2>{items.map((question, index) => <div key={question} className="question-wrap">
              <div className={`question ${highlighted === question ? 'question-highlighted' : ''}`} role="button" tabIndex={0} onDoubleClick={() => setHighlighted(question)} onClick={() => highlighted === question && toggleHighlight(question)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleHighlight(question) } }}>
                <span>{index + 1}.</span><p>{question}</p>
                {highlighted === question && !followUps.includes(question) && <button className="follow-up-button" type="button" aria-label={`Show follow-up for question ${index + 1}`} onClick={(event) => { event.stopPropagation(); addFollowUp(question) }}><Lightbulb size={16} /></button>}
              </div>
              {followUps.includes(question) && <div className="follow-up-question"><span className="follow-up-icon">↳</span><div><small>FOLLOW-UP</small><p>Can you tell me more about that?</p></div></div>}
            </div>)}</div>)}
      </div>
    </div>
  )
}
