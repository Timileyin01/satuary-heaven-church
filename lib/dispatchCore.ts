export const DEST_PHONE = (process.env.BOOKING_CONTACT_PHONE || '08066947526').trim();
export const DEST_EMAIL = (process.env.BOOKING_CONTACT_EMAIL || 'oluwaseyiisreal4@gmail.com').trim();

export type DispatchChannel = 'email' | 'whatsapp' | 'both';

export interface ChannelDeliveryResult {
  requested: boolean;
  status: 'sent' | 'dispatched_relay' | 'skipped' | 'error';
  recipient: string;
  provider: string;
  detail: string;
}

export interface DispatchOutcome {
  statusCode: number;
  payload: Record<string, unknown>;
}

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

function buildActionUrls(subject: string, plainText: string) {
  const whatsappUrl = `https://wa.me/${toWhatsappIntl(DEST_PHONE)}?text=${encodeURIComponent(plainText)}`;
  const mailtoUrl = `mailto:${encodeURIComponent(DEST_EMAIL)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(plainText)}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    DEST_EMAIL
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`;
  return { whatsappUrl, mailtoUrl, gmailUrl };
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
      detail: `Booking payload registered on server for ${DEST_EMAIL}. Use Gmail or Mail App below to send directly.`,
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
      detail: `WhatsApp booking payload prepared for ${DEST_PHONE}. Tap Open WhatsApp below to send.`,
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

export function getHealthPayload() {
  return {
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
  };
}

export async function processBookingDispatch(rawBody: unknown): Promise<DispatchOutcome> {
  if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
    return { statusCode: 400, payload: { ok: false, error: 'Invalid JSON request body.' } };
  }

  const body = rawBody as Record<string, unknown>;
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
    return { statusCode: 400, payload: { ok: false, error: 'Guest full name is required.' } };
  }
  if (!isValidPhone(guestPhone)) {
    return { statusCode: 400, payload: { ok: false, error: 'A valid guest phone number is required.' } };
  }
  if (guestEmail && !isValidEmail(guestEmail)) {
    return { statusCode: 400, payload: { ok: false, error: 'Please provide a valid email address.' } };
  }
  if (!buildingName || !roomNumber) {
    return { statusCode: 400, payload: { ok: false, error: 'Building and room selection are required.' } };
  }
  if (!Number.isFinite(nights) || nights < 1 || nights > 60) {
    return { statusCode: 400, payload: { ok: false, error: 'Stay nights must be between 1 and 60.' } };
  }
  if (!Number.isFinite(totalAmount) || totalAmount < 0) {
    return { statusCode: 400, payload: { ok: false, error: 'Invalid booking tariff amount.' } };
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
  const bookingSubject = `Sanctuary Haven Booking ${ref} — ${buildingName} Rm ${roomNumber}`;

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
          subject: bookingSubject,
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
  const { whatsappUrl, mailtoUrl, gmailUrl } = buildActionUrls(bookingSubject, plainText);

  return {
    statusCode: 201,
    payload: {
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
    },
  };
}

export async function processEnquiryDispatch(rawBody: unknown): Promise<DispatchOutcome> {
  if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
    return { statusCode: 400, payload: { ok: false, error: 'Invalid JSON request body.' } };
  }

  const body = rawBody as Record<string, unknown>;
  const channel: DispatchChannel = isValidChannel(body.channel) ? body.channel : 'both';
  const guestName = sanitizeText(body.guestName, 100);
  const guestPhone = sanitizeText(body.guestPhone, 32);
  const guestEmail = sanitizeText(body.guestEmail, 160);
  const subject = sanitizeText(body.subject, 120) || 'Room & Programme Lodging Enquiry';
  const buildingName = sanitizeText(body.buildingName, 80);
  const roomNumber = sanitizeText(body.roomNumber, 24);
  const message = sanitizeMultiline(body.message, 1200);

  if (!guestName) {
    return { statusCode: 400, payload: { ok: false, error: 'Your name is required.' } };
  }
  if (!isValidPhone(guestPhone)) {
    return { statusCode: 400, payload: { ok: false, error: 'A valid phone number is required.' } };
  }
  if (guestEmail && !isValidEmail(guestEmail)) {
    return { statusCode: 400, payload: { ok: false, error: 'Please provide a valid email address.' } };
  }
  if (!message || message.length < 4) {
    return { statusCode: 400, payload: { ok: false, error: 'Please enter your booking or lodging enquiry.' } };
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

  const enquirySubject = `[Enquiry ${ticketRef}] ${subject}`;
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
          subject: enquirySubject,
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
  const { whatsappUrl, mailtoUrl, gmailUrl } = buildActionUrls(enquirySubject, plainText);

  return {
    statusCode: 201,
    payload: {
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
    },
  };
}
