import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DEST_PHONE = (process.env.BOOKING_CONTACT_PHONE || '08066947526').trim();
const DEST_EMAIL = (process.env.BOOKING_CONTACT_EMAIL || 'oluwaseyiisreal4@gmail.com').trim();

type DispatchChannel = 'email' | 'whatsapp' | 'both';

interface ChannelDeliveryResult {
  requested: boolean;
  status: 'sent' | 'dispatched_relay' | 'skipped' | 'error';
  recipient: string;
  provider: string;
  detail: string;
}

interface DispatchLogEntry {
  dispatchId: string;
  kind: 'booking' | 'enquiry';
  createdAt: string;
  channel: DispatchChannel;
  guestName: string;
  summary: string;
}

const dispatchLedger: DispatchLogEntry[] = [];

function sanitizeText(value: unknown, maxLen = 200): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\r\n\t]+/g, ' ').trim().slice(0, maxLen);
}

function sanitizeMultiline(value: unknown, maxLen = 1200): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 160;
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

function toWhatsappIntl(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 11) {
    return `234${digits.slice(1)}`;
  }
  return digits;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidChannel(val: unknown): val is DispatchChannel {
  return val === 'email' || val === 'whatsapp' || val === 'both';
}

async function sendEmailViaApi(params: {
  subject: string;
  textBody: string;
  htmlBody: string;
  replyTo?: string;
}): Promise<ChannelDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() || 'Sanctuary Haven <bookings@sanctuaryhaven.org>';

  if (!apiKey) {
    return {
      requested: true,
      status: 'dispatched_relay',
      recipient: DEST_EMAIL,
      provider: 'Booking API Relay',
      detail: `Booking payload registered on server for ${DEST_EMAIL}.`,
    };
  }

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [DEST_EMAIL],
        reply_to: params.replyTo && isValidEmail(params.replyTo) ? params.replyTo : undefined,
        subject: params.subject,
        text: params.textBody,
        html: params.htmlBody,
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.text().catch(() => '');
      return {
        requested: true,
        status: 'error',
        recipient: DEST_EMAIL,
        provider: 'Resend Email API',
        detail: `Email provider returned ${resp.status}: ${errBody.slice(0, 120)}`,
      };
    }

    return {
      requested: true,
      status: 'sent',
      recipient: DEST_EMAIL,
      provider: 'Resend Email API',
      detail: `Email delivered to ${DEST_EMAIL}.`,
    };
  } catch (err) {
    return {
      requested: true,
      status: 'error',
      recipient: DEST_EMAIL,
      provider: 'Resend Email API',
      detail: err instanceof Error ? err.message : 'Email API request failed.',
    };
  }
}

async function sendWhatsAppViaApi(messageText: string): Promise<ChannelDeliveryResult> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const intlTarget = toWhatsappIntl(DEST_PHONE);

  if (!token || !phoneNumberId) {
    return {
      requested: true,
      status: 'dispatched_relay',
      recipient: DEST_PHONE,
      provider: 'WhatsApp API Relay',
      detail: `WhatsApp booking payload prepared for ${DEST_PHONE}.`,
    };
  }

  try {
    const resp = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(phoneNumberId)}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: intlTarget,
        type: 'text',
        text: { body: messageText },
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.text().catch(() => '');
      return {
        requested: true,
        status: 'error',
        recipient: DEST_PHONE,
        provider: 'WhatsApp Cloud API',
        detail: `WhatsApp API returned ${resp.status}: ${errBody.slice(0, 120)}`,
      };
    }

    return {
      requested: true,
      status: 'sent',
      recipient: DEST_PHONE,
      provider: 'WhatsApp Cloud API',
      detail: `WhatsApp message delivered to ${DEST_PHONE}.`,
    };
  } catch (err) {
    return {
      requested: true,
      status: 'error',
      recipient: DEST_PHONE,
      provider: 'WhatsApp Cloud API',
      detail: err instanceof Error ? err.message : 'WhatsApp API request failed.',
    };
  }
}

function recordDispatch(entry: DispatchLogEntry) {
  dispatchLedger.unshift(entry);
  if (dispatchLedger.length > 200) {
    dispatchLedger.length = 200;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      contacts: {
        phone: DEST_PHONE,
        email: DEST_EMAIL,
      },
      liveProviders: {
        email: Boolean(process.env.RESEND_API_KEY?.trim()),
        whatsapp: Boolean(
          process.env.WHATSAPP_ACCESS_TOKEN?.trim() && process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()
        ),
      },
    });
  });

  app.post('/api/bookings/dispatch', async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown> | undefined;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ ok: false, error: 'Invalid JSON request body.' });
      return;
    }

    const channel: DispatchChannel = isValidChannel(body.channel) ? body.channel : 'both';
    const ref = sanitizeText(body.ref, 40) || `#CH-2025-${Math.floor(9510 + Math.random() * 480)}`;
    const guestName = sanitizeText(body.guestName, 100);
    const guestPhone = sanitizeText(body.guestPhone, 32);
    const guestEmail = sanitizeText(body.guestEmail, 160);
    const buildingName = sanitizeText(body.buildingName, 80);
    const roomNumber = sanitizeText(body.roomNumber, 24);
    const suiteTitle = sanitizeText(body.suiteTitle, 100);
    const checkInDate = sanitizeText(body.checkInDate, 40);
    const checkOutDate = sanitizeText(body.checkOutDate, 40);
    const guestsLabel = sanitizeText(body.guestsLabel, 60) || '1 Guest';
    const paymentMethod = sanitizeText(body.paymentMethod, 50) || 'Email & WhatsApp Booking';
    const specialNotes = sanitizeMultiline(body.notes, 400);
    const nights = Number(body.nights);
    const totalAmount = Number(body.totalAmount);

    if (!guestName) {
      res.status(400).json({ ok: false, error: 'Guest full name is required.' });
      return;
    }
    if (!isValidPhone(guestPhone)) {
      res.status(400).json({ ok: false, error: 'A valid guest phone number is required.' });
      return;
    }
    if (guestEmail && !isValidEmail(guestEmail)) {
      res.status(400).json({ ok: false, error: 'Please provide a valid email address.' });
      return;
    }
    if (!buildingName || !roomNumber) {
      res.status(400).json({ ok: false, error: 'Building and room selection are required.' });
      return;
    }
    if (!Number.isFinite(nights) || nights < 1 || nights > 60) {
      res.status(400).json({ ok: false, error: 'Stay nights must be between 1 and 60.' });
      return;
    }
    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      res.status(400).json({ ok: false, error: 'Invalid booking tariff amount.' });
      return;
    }

    const messageLines = [
      `Sanctuary Haven — New Room Booking (${ref})`,
      `Guest: ${guestName}`,
      `Phone: ${guestPhone}${guestEmail ? ` | Email: ${guestEmail}` : ''}`,
      `Accommodation: ${buildingName} · Room ${roomNumber} (${suiteTitle})`,
      `Stay: ${checkInDate} to ${checkOutDate} (${nights} nights · ${guestsLabel})`,
      `Tariff: ₦${totalAmount.toLocaleString('en-NG')} via ${paymentMethod}`,
      specialNotes ? `Notes: ${specialNotes}` : '',
    ].filter(Boolean);
    const plainText = messageLines.join('\n');

    const htmlBody = `
      <div style="font-family:sans-serif;max-width:560px;color:#002215;">
        <h2 style="margin-bottom:8px;">Sanctuary Haven — Room Booking ${escapeHtml(ref)}</h2>
        <p style="margin:4px 0;"><strong>Guest:</strong> ${escapeHtml(guestName)}</p>
        <p style="margin:4px 0;"><strong>Phone:</strong> ${escapeHtml(guestPhone)}</p>
        ${guestEmail ? `<p style="margin:4px 0;"><strong>Email:</strong> ${escapeHtml(guestEmail)}</p>` : ''}
        <p style="margin:4px 0;"><strong>Room:</strong> ${escapeHtml(buildingName)} · Room ${escapeHtml(roomNumber)} (${escapeHtml(suiteTitle)})</p>
        <p style="margin:4px 0;"><strong>Dates:</strong> ${escapeHtml(checkInDate)} — ${escapeHtml(checkOutDate)} (${nights} nights, ${escapeHtml(guestsLabel)})</p>
        <p style="margin:4px 0;"><strong>Total Tariff:</strong> ₦${totalAmount.toLocaleString('en-NG')} (${escapeHtml(paymentMethod)})</p>
        ${specialNotes ? `<p style="margin:8px 0;"><strong>Notes:</strong> ${escapeHtml(specialNotes)}</p>` : ''}
      </div>
    `;

    const [emailResult, whatsappResult] = await Promise.all([
      channel === 'email' || channel === 'both'
        ? sendEmailViaApi({
            subject: `Sanctuary Haven Booking ${ref} — ${buildingName} Rm ${roomNumber}`,
            textBody: plainText,
            htmlBody,
            replyTo: guestEmail || undefined,
          })
        : Promise.resolve<ChannelDeliveryResult>({
            requested: false,
            status: 'skipped',
            recipient: DEST_EMAIL,
            provider: 'Email',
            detail: 'Not requested for this channel.',
          }),
      channel === 'whatsapp' || channel === 'both'
        ? sendWhatsAppViaApi(plainText)
        : Promise.resolve<ChannelDeliveryResult>({
            requested: false,
            status: 'skipped',
            recipient: DEST_PHONE,
            provider: 'WhatsApp',
            detail: 'Not requested for this channel.',
          }),
    ]);

    const dispatchId = `DSP-${Date.now().toString(36).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    recordDispatch({
      dispatchId,
      kind: 'booking',
      createdAt: timestamp,
      channel,
      guestName,
      summary: `${ref} · ${buildingName} Rm ${roomNumber}`,
    });

    const bookingSubject = `Sanctuary Haven Booking ${ref} — ${buildingName} Rm ${roomNumber}`;
    const whatsappUrl = `https://wa.me/${toWhatsappIntl(DEST_PHONE)}?text=${encodeURIComponent(plainText)}`;
    const mailtoUrl = `mailto:${encodeURIComponent(DEST_EMAIL)}?subject=${encodeURIComponent(
      bookingSubject
    )}&body=${encodeURIComponent(plainText)}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      DEST_EMAIL
    )}&su=${encodeURIComponent(bookingSubject)}&body=${encodeURIComponent(plainText)}`;

    res.status(201).json({
      ok: true,
      dispatchId,
      timestamp,
      channel,
      contacts: {
        phone: DEST_PHONE,
        email: DEST_EMAIL,
      },
      emailResult,
      whatsappResult,
      whatsappUrl,
      mailtoUrl,
      gmailUrl,
    });
  });

  app.post('/api/enquiries', async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown> | undefined;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ ok: false, error: 'Invalid JSON request body.' });
      return;
    }

    const channel: DispatchChannel = isValidChannel(body.channel) ? body.channel : 'both';
    const guestName = sanitizeText(body.guestName, 100);
    const guestPhone = sanitizeText(body.guestPhone, 32);
    const guestEmail = sanitizeText(body.guestEmail, 160);
    const subject = sanitizeText(body.subject, 120) || 'Room & Programme Lodging Enquiry';
    const buildingName = sanitizeText(body.buildingName, 80);
    const roomNumber = sanitizeText(body.roomNumber, 24);
    const message = sanitizeMultiline(body.message, 1200);

    if (!guestName) {
      res.status(400).json({ ok: false, error: 'Your name is required.' });
      return;
    }
    if (!isValidPhone(guestPhone)) {
      res.status(400).json({ ok: false, error: 'A valid phone number is required.' });
      return;
    }
    if (guestEmail && !isValidEmail(guestEmail)) {
      res.status(400).json({ ok: false, error: 'Please provide a valid email address.' });
      return;
    }
    if (!message || message.length < 4) {
      res.status(400).json({ ok: false, error: 'Please enter your booking or lodging enquiry.' });
      return;
    }

    const ticketRef = `ENQ-${Date.now().toString().slice(-5)}`;
    const plainText = [
      `Sanctuary Haven — Guest Enquiry (${ticketRef})`,
      `Subject: ${subject}`,
      `From: ${guestName}`,
      `Phone: ${guestPhone}${guestEmail ? ` | Email: ${guestEmail}` : ''}`,
      buildingName ? `Residence: ${buildingName}${roomNumber ? ` · Rm ${roomNumber}` : ''}` : '',
      `Message: ${message}`,
    ]
      .filter(Boolean)
      .join('\n');

    const htmlBody = `
      <div style="font-family:sans-serif;max-width:560px;color:#002215;">
        <h2 style="margin-bottom:8px;">Sanctuary Haven — Guest Enquiry (${escapeHtml(ticketRef)})</h2>
        <p style="margin:4px 0;"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p style="margin:4px 0;"><strong>From:</strong> ${escapeHtml(guestName)}</p>
        <p style="margin:4px 0;"><strong>Phone:</strong> ${escapeHtml(guestPhone)}</p>
        ${guestEmail ? `<p style="margin:4px 0;"><strong>Email:</strong> ${escapeHtml(guestEmail)}</p>` : ''}
        ${
          buildingName
            ? `<p style="margin:4px 0;"><strong>Residence:</strong> ${escapeHtml(buildingName)}${
                roomNumber ? ` · Rm ${escapeHtml(roomNumber)}` : ''
              }</p>`
            : ''
        }
        <p style="margin:10px 0;"><strong>Enquiry:</strong><br/>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
      </div>
    `;

    const [emailResult, whatsappResult] = await Promise.all([
      channel === 'email' || channel === 'both'
        ? sendEmailViaApi({
            subject: `[Enquiry ${ticketRef}] ${subject}`,
            textBody: plainText,
            htmlBody,
            replyTo: guestEmail || undefined,
          })
        : Promise.resolve<ChannelDeliveryResult>({
            requested: false,
            status: 'skipped',
            recipient: DEST_EMAIL,
            provider: 'Email',
            detail: 'Not requested for this channel.',
          }),
      channel === 'whatsapp' || channel === 'both'
        ? sendWhatsAppViaApi(plainText)
        : Promise.resolve<ChannelDeliveryResult>({
            requested: false,
            status: 'skipped',
            recipient: DEST_PHONE,
            provider: 'WhatsApp',
            detail: 'Not requested for this channel.',
          }),
    ]);

    const timestamp = new Date().toISOString();
    recordDispatch({
      dispatchId: ticketRef,
      kind: 'enquiry',
      createdAt: timestamp,
      channel,
      guestName,
      summary: subject,
    });

    const enquirySubject = `[Enquiry ${ticketRef}] ${subject}`;
    const whatsappUrl = `https://wa.me/${toWhatsappIntl(DEST_PHONE)}?text=${encodeURIComponent(plainText)}`;
    const mailtoUrl = `mailto:${encodeURIComponent(DEST_EMAIL)}?subject=${encodeURIComponent(
      enquirySubject
    )}&body=${encodeURIComponent(plainText)}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      DEST_EMAIL
    )}&su=${encodeURIComponent(enquirySubject)}&body=${encodeURIComponent(plainText)}`;

    res.status(201).json({
      ok: true,
      ticketRef,
      timestamp,
      channel,
      contacts: {
        phone: DEST_PHONE,
        email: DEST_EMAIL,
      },
      emailResult,
      whatsappResult,
      whatsappUrl,
      mailtoUrl,
      gmailUrl,
    });
  });

  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ ok: false, error: 'API endpoint not found.' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sanctuary Haven server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
