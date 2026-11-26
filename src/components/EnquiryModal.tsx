import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  X,
} from 'lucide-react';
import { CONTACT_DETAILS } from '../data/sanctuaryData';
import {
  ApiDispatchResult,
  DispatchChannel,
  dispatchEnquiryRequest,
} from '../utils/bookingApi';

export interface EnquiryDraft {
  subject?: string;
  buildingName?: string;
  roomNumber?: string;
  presetMessage?: string;
}

interface EnquiryModalProps {
  draft: EnquiryDraft | null;
  onClose: () => void;
  onSubmitted: (ticketRef: string, summary: string) => void;
}

function isSafeActionUrl(
  url: string | undefined,
  expectedPrefix: 'https://wa.me/' | 'https://mail.google.com/mail/' | 'mailto:'
): url is string {
  return typeof url === 'string' && url.startsWith(expectedPrefix);
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  draft,
  onClose,
  onSubmitted,
}) => {
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [subject, setSubject] = useState('Room & Convention Lodging Enquiry');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<DispatchChannel>('both');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<ApiDispatchResult | null>(null);

  useEffect(() => {
    if (!draft) return;
    setSubject(draft.subject || 'Room & Convention Lodging Enquiry');
    setMessage(draft.presetMessage || '');
    setStatus('idle');
    setErrorMessage(null);
    setResponseData(null);
  }, [draft]);

  if (!draft) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!guestName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (guestPhone.replace(/\D/g, '').length < 7) {
      setErrorMessage('Please enter a valid phone or WhatsApp number.');
      return;
    }
    if (!message.trim() || message.trim().length < 4) {
      setErrorMessage('Please type your booking or lodging enquiry.');
      return;
    }

    setStatus('sending');
    const data = await dispatchEnquiryRequest({
      channel,
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      guestEmail: guestEmail.trim(),
      subject: subject.trim(),
      buildingName: draft.buildingName || '',
      roomNumber: draft.roomNumber || '',
      message: message.trim(),
    });

    if (!data.ok) {
      setStatus('idle');
      setErrorMessage(data.error || 'Unable to dispatch enquiry.');
      return;
    }

    setResponseData(data);
    setStatus('done');
    onSubmitted(
      data.ticketRef || 'ENQ',
      `${guestName.trim()} (${channel.toUpperCase()}) · ${subject.trim()}`
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-primary/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-surface-container-lowest p-5 md:p-6 shadow-2xl border border-outline-variant/30 flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display text-lg font-semibold text-primary">
                {status === 'done' ? 'Enquiry Ready & Logged' : 'Book or Enquire via Email & WhatsApp'}
              </h3>
              <p className="text-xs text-on-surface-variant">
                {draft.buildingName
                  ? `${draft.buildingName}${draft.roomNumber ? ` · Room ${draft.roomNumber}` : ''}`
                  : 'Sanctuary Haven Hospitality Desk'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close enquiry dialog"
            className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {status === 'done' && responseData ? (
          <div className="py-2 flex flex-col items-center text-center gap-3.5">
            <div className="w-14 h-14 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="font-serif-display text-xl font-semibold text-primary">
                Ticket {responseData.ticketRef} {responseData.fallbackUsed ? 'Prepared' : 'Dispatched'}
              </p>
              <p className="text-xs text-on-surface-variant mt-1">
                Ready for Sanctuary Hospitality Desk ({CONTACT_DETAILS.phone} &amp; {CONTACT_DETAILS.email})
              </p>
            </div>

            <div className="w-full space-y-2 text-left">
              {responseData.whatsappResult?.requested && (
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/25 flex items-start justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-primary tabular-nums">
                      WhatsApp · {responseData.whatsappResult.recipient}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      {responseData.whatsappResult.detail}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#ebf7ee] text-[#1c6934] text-[10px] font-bold shrink-0">
                    {responseData.whatsappResult.status === 'sent'
                      ? 'Sent'
                      : responseData.fallbackUsed
                      ? 'Direct Link Ready'
                      : 'Dispatched'}
                  </span>
                </div>
              )}
              {responseData.emailResult?.requested && (
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/25 flex items-start justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-primary break-all">
                      Email · {responseData.emailResult.recipient}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      {responseData.emailResult.detail}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#ebf7ee] text-[#1c6934] text-[10px] font-bold shrink-0">
                    {responseData.emailResult.status === 'sent'
                      ? 'Sent'
                      : responseData.fallbackUsed
                      ? 'Direct Link Ready'
                      : 'Dispatched'}
                  </span>
                </div>
              )}
            </div>

            <div className="w-full flex flex-wrap gap-2">
              {isSafeActionUrl(responseData.whatsappUrl, 'https://wa.me/') && (
                <a
                  href={responseData.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[170px] h-10 px-3 rounded-xl bg-[#1c6934] hover:bg-[#155429] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Continue on WhatsApp</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              )}
              {isSafeActionUrl(responseData.gmailUrl, 'https://mail.google.com/mail/') && (
                <a
                  href={responseData.gmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] h-10 px-3 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send via Gmail</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              )}
              {isSafeActionUrl(responseData.mailtoUrl, 'mailto:') && (
                <a
                  href={responseData.mailtoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-secondary" />
                  <span>Mail App</span>
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/25 text-xs space-y-1">
              <p className="font-semibold text-primary">Official Desk Contacts (API Recipients):</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-on-surface-variant">
                <span className="inline-flex items-center gap-1 font-semibold text-primary tabular-nums">
                  <Phone className="w-3.5 h-3.5 text-secondary" />
                  {CONTACT_DETAILS.phone} (WhatsApp)
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-primary break-all">
                  <Mail className="w-3.5 h-3.5 text-secondary" />
                  {CONTACT_DETAILS.email}
                </span>
              </div>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-error-container text-on-error-container text-xs font-medium flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Deaconess Grace Adeyemi"
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Your Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="e.g. 0803 123 4567"
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Your Email (for reply copy)
              </label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Booking Request or Enquiry Details
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share preferred building, dates, number of delegates, or special hospitality request..."
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                Send Via
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'both', label: 'Email & WhatsApp' },
                    { id: 'whatsapp', label: 'WhatsApp Only' },
                    { id: 'email', label: 'Email Only' },
                  ] as const
                ).map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChannel(ch.id)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition-colors cursor-pointer ${
                      channel === ch.id
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container'
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full h-11 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-70"
            >
              {status === 'sending' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Enquiry via API...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-secondary-fixed" />
                  <span>Send Booking / Enquiry</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
