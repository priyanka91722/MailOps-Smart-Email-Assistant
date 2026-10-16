import { useState } from 'react';
import {
  useGenerateEmailReply,
  useMailopsHealth,
  type EmailReplyInputLength,
  type EmailReplyInputTone,
} from '@workspace/api-client-react';
import {
  AlertCircle,
  Check,
  Clipboard,
  Feather,
  FileText,
  Lightbulb,
  LoaderCircle,
  RefreshCw,
  Send,
  Sparkles,
} from 'lucide-react';

const tones: EmailReplyInputTone[] = ['Professional', 'Friendly', 'Formal', 'Concise'];
const lengths: EmailReplyInputLength[] = ['Short', 'Medium', 'Detailed'];

function readableError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  const normalized = message.toLowerCase();
  if (!message || normalized.includes('failed to fetch') || normalized.includes('network')) {
    return 'Could not reach the MailOps service. Check that the API server is running and try again.';
  }
  if (normalized.includes('configuration') || normalized.includes('api key') || normalized.includes('not configured')) {
    return 'The reply service is not configured yet. Check the API server configuration and try again.';
  }
  if (normalized.includes('401') || normalized.includes('403')) {
    return 'The reply service could not authorize this request. Check its configuration and try again.';
  }
  if (normalized.includes('429')) return 'The service is receiving too many requests. Wait a moment, then try again.';
  if (normalized.includes('500') || normalized.includes('502') || normalized.includes('503')) {
    return 'The reply service had a problem completing this request. Try again in a moment.';
  }
  return message.length > 180 ? `${message.slice(0, 177)}…` : message;
}

export default function Home() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState<EmailReplyInputTone>('Professional');
  const [length, setLength] = useState<EmailReplyInputLength>('Medium');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [reply, setReply] = useState('');
  const [validationError, setValidationError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const health = useMailopsHealth();
  const generate = useGenerateEmailReply();
  const isBusy = generate.isPending;

  async function requestReply() {
    const trimmedEmail = emailContent.trim();
    if (!trimmedEmail) {
      setValidationError('Paste the email you want to reply to first.');
      return;
    }
    if (trimmedEmail.length > 20000) {
      setValidationError('Email text must be 20,000 characters or fewer.');
      return;
    }
    setValidationError('');
    setRequestError('');
    setCopyState('idle');
    try {
      const result = await generate.mutateAsync({
        data: {
          emailContent: trimmedEmail,
          tone,
          length,
          additionalInstructions: additionalInstructions.trim() || null,
        },
      });
      setReply(result.reply);
    } catch (error) {
      setRequestError(readableError(error));
    }
  }

  async function copyReply() {
    if (!reply.trim()) return;
    try {
      await navigator.clipboard.writeText(reply);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  }

  const healthStatus = health.data?.status?.toLowerCase();
  const serviceOnline = healthStatus === 'up' || healthStatus === 'ok' || healthStatus === 'healthy';
  const healthText = health.isLoading ? 'Checking service' : health.isError ? 'Service unavailable' : serviceOnline ? 'Service ready' : 'Service connected';

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand" data-testid="text-brand">
          <span className="brand-mark"><Feather size={18} strokeWidth={2.2} /></span>
          <span>MailOps</span>
        </div>
        <div className="top-meta" data-testid="status-api-health" aria-live="polite">
          <span className={`health-dot ${serviceOnline ? 'online' : ''}`} />
          <span>{healthText}</span>
        </div>
      </header>

      <main className="workspace">
        <section className="intro" aria-labelledby="page-title">
          <div className="eyebrow"><span className="eyebrow-line" /> Your reply, in a few steps</div>
          <h1 id="page-title">Good email starts<br className="desktop-break" /> with a better reply.</h1>
          <p>Paste the message. Set the tone. Get a thoughtful draft you can make your own.</p>
          <div className="flowline" aria-label="Reply workflow" data-testid="text-reply-workflow">
            <span className="flow-step"><span className="flow-num">01</span> Paste email</span>
            <span className="flow-connector" />
            <span className="flow-step"><span className="flow-num">02</span> Set your style</span>
            <span className="flow-connector" />
            <span className="flow-step"><span className="flow-num">03</span> Edit &amp; copy</span>
          </div>
        </section>

        <div className="panel-grid">
          <section className="panel" aria-labelledby="source-title">
            <div className="panel-head">
              <div className="panel-title-wrap">
                <span className="panel-icon"><FileText size={16} /></span>
                <div className="panel-title" id="source-title">Original email</div>
              </div>
              <span className="panel-kicker">Step 01</span>
            </div>
            <div className="panel-body">
              <label className="option-label" htmlFor="email-content">Email content</label>
              <textarea
                id="email-content"
                className="email-input"
                data-testid="input-email-content"
                placeholder={'Paste the email you received here…\n\nInclude the full message for the most useful reply.'}
                value={emailContent}
                onChange={(event) => {
                  setEmailContent(event.target.value);
                  if (validationError) setValidationError('');
                }}
                maxLength={20000}
                aria-invalid={Boolean(validationError)}
                aria-describedby={validationError ? 'email-validation' : undefined}
              />
              <div className="input-foot">
                <span>Private to this request</span>
                <span data-testid="text-email-character-count">{emailContent.length.toLocaleString()} / 20,000</span>
              </div>
              {validationError && <div className="field-error" id="email-validation" role="alert" data-testid="status-input-validation"><AlertCircle size={14} />{validationError}</div>}

              <div className="options">
                <fieldset className="option-field" style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
                  <legend className="option-label">Tone</legend>
                  <div className="segmented" role="group" aria-label="Reply tone">
                    {tones.map((item) => (
                      <button
                        type="button"
                        className={`segment ${tone === item ? 'selected' : ''}`}
                        aria-pressed={tone === item}
                        data-testid={`button-tone-${item.toLowerCase()}`}
                        key={item}
                        onClick={() => setTone(item)}
                      >{item}</button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="option-field" style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
                  <legend className="option-label">Length</legend>
                  <div className="segmented" role="group" aria-label="Reply length">
                    {lengths.map((item) => (
                      <button
                        type="button"
                        className={`segment ${length === item ? 'selected' : ''}`}
                        aria-pressed={length === item}
                        data-testid={`button-length-${item.toLowerCase()}`}
                        key={item}
                        onClick={() => setLength(item)}
                      >{item}</button>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="instruction-wrap">
                <label className="option-label" htmlFor="additional-instructions">Extra direction <span style={{ color: '#9aa4a4', fontWeight: 400, textTransform: 'none' }}>· optional</span></label>
                <textarea
                  id="additional-instructions"
                  className="instruction-input"
                  data-testid="input-additional-instructions"
                  placeholder="For example: mention that I’m available Thursday afternoon."
                  value={additionalInstructions}
                  onChange={(event) => setAdditionalInstructions(event.target.value)}
                  maxLength={2000}
                />
              </div>
              <button className="primary-action" type="button" onClick={requestReply} disabled={isBusy} data-testid="button-generate-reply">
                {isBusy ? <><LoaderCircle size={16} className="spin" /> Writing your reply…</> : <><Sparkles size={16} /> Generate reply <Send size={14} /></>}
              </button>
            </div>
          </section>

          <section className="panel" aria-labelledby="reply-title">
            <div className="panel-head">
              <div className="panel-title-wrap">
                <span className="panel-icon"><Sparkles size={16} /></span>
                <div className="panel-title" id="reply-title">Your reply</div>
              </div>
              <span className="panel-kicker">Step 02</span>
            </div>
            <div className="panel-body reply-body">
              <div className="reply-content">
                {isBusy ? (
                  <div className="reply-placeholder" role="status" aria-live="polite" data-testid="status-generating-reply">
                    <span className="placeholder-icon"><LoaderCircle className="spin" size={21} /></span>
                    <strong>Finding the right words</strong>
                    <span>Shaping your reply to match the message and your preferences.</span>
                  </div>
                ) : reply ? (
                  <textarea
                    className="reply-input"
                    data-testid="input-generated-reply"
                    aria-label="Editable generated reply"
                    value={reply}
                    onChange={(event) => {
                      setReply(event.target.value);
                      setCopyState('idle');
                    }}
                  />
                ) : (
                  <div className="reply-placeholder" data-testid="empty-reply">
                    <span className="placeholder-icon"><Clipboard size={20} /></span>
                    <strong>Your draft will appear here</strong>
                    <span>It’s yours to edit. Nothing is sent until you choose to use it.</span>
                  </div>
                )}
              </div>
              {requestError && <div className="api-error" role="alert" data-testid="status-generation-error"><AlertCircle size={17} /><div><strong>We couldn’t create that reply</strong>{requestError}</div></div>}
              <div className="reply-toolbar">
                <div className={`reply-status ${reply && !isBusy ? 'success' : ''}`} aria-live="polite" data-testid="status-reply-state">
                  {reply && !isBusy ? <><Check size={13} /> Draft ready · editable</> : isBusy ? <><LoaderCircle size={13} className="spin" /> Generating</> : <>Awaiting email</>}
                </div>
                <div className="action-group">
                  <button className="secondary-action" type="button" onClick={requestReply} disabled={isBusy || !emailContent.trim()} data-testid="button-regenerate-reply" aria-label="Regenerate reply">
                    <RefreshCw size={13} /> Regenerate
                  </button>
                  <button className="secondary-action" type="button" onClick={copyReply} disabled={!reply.trim() || isBusy} data-testid="button-copy-reply">
                    {copyState === 'copied' ? <Check size={13} /> : <Clipboard size={13} />}
                    {copyState === 'copied' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              {copyState === 'failed' && <div className="field-error" role="status" data-testid="status-copy-error"><AlertCircle size={13} />Clipboard access was blocked. Select and copy the reply manually.</div>}
              {copyState === 'copied' && <span className="sr-only" role="status" data-testid="status-copy-success">Reply copied to clipboard.</span>}
            </div>
          </section>
        </div>

        <div className="tips-row" data-testid="text-privacy-note">
          <Lightbulb size={16} />
          <span><strong>A draft, not an autopilot.</strong> Review and personalize every reply before sending. MailOps never sends email on your behalf.</span>
        </div>
        <footer className="footer-note">
          <span>MADE FOR CLEARER COMMUNICATION</span>
          <span><span className="footer-mark">●</span> Powered by MailOps reply engine</span>
        </footer>
      </main>
    </div>
  );
}
