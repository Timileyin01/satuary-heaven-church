import { CONTACT_DETAILS } from '../data/sanctuaryData';

export type DispatchChannel = 'both' | 'whatsapp' | 'email';

export interface ChannelDeliveryResult {
  requested: boolean;
  status: 'sent' | 'dispatched_relay' | 'skipped' | 'error';
  recipient: string;
  provider: string;
  detail: string;
}

export interface BookingApiPayload {
  ref: string;
  channel: DispatchChannel;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  buildingName: string;
  roomNumber: string;
  suiteTitle: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestsLabel: string;
  totalAmount: number;
  paymentMethod: string;
  notes: string;
}

export interface EnquiryApiPayload {
  channel: DispatchChannel;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  subject: string;
  buildingName: string;
  roomNumber: string;
  message: string;
}

export interface ApiDispatchResult {
  ok: boolean;
  error?: string;
  fallbackUsed?: boolean;
  dispatchId?: string;
  ticketRef?: string;
  timestamp?: string;
  channel?: DispatchChannel;
  contacts?: {
    phone: string;
    email: string;
  };
  emailResult?: ChannelDeliveryResult;
  whatsappResult?: ChannelDeliveryResult;
  whatsappUrl?: string;
  mailtoUrl?: string;
  gmailUrl?: string;
}

function buildDirectHandoffUrls(subject: string, plainText: string) {
  const intlDigits = CONTACT_DETAILS.phoneIntl.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${intlDigits}?text=${encodeURIComponent(plainText)}`;
  const mailtoUrl = `mailto:${encodeURIComponent(CONTACT_DETAILS.email)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(plainText)}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    CONTACT_DETAILS.email
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`;
  return { whatsappUrl, mailtoUrl, gmailUrl };
}

function buildBookingFallback(payload: BookingApiPayload): ApiDispatchResult {
  const lines = [
    `Sanctuary Haven — New Room Booking (${payload.ref})`,
    `Guest: ${payload.guestName}`,
    `Phone: ${payload.guestPhone}${payload.guestEmail ? ` | Email: ${payload.guestEmail}` : ''}`,
    `Accommodation: ${payload.buildingName} · Room ${payload.roomNumber} (${payload.suiteTitle})`,
    `Stay: ${payload.checkInDate} to ${payload.checkOutDate} (${payload.nights} nights · ${payload.guestsLabel})`,
    `Tariff: ₦${payload.totalAmount.toLocaleString('en-NG')} via ${payload.paymentMethod}`,
    payload.notes ? `Notes: ${payload.notes}` : '',
  ].filter(Boolean);
  const plainText = lines.join('\n');
  const subject = `Sanctuary Haven Booking ${payload.ref} — ${payload.buildingName} Rm ${payload.roomNumber}`;
  const { whatsappUrl, mailtoUrl, gmailUrl } = buildDirectHandoffUrls(subject, plainText);

  return {
    ok: true,
    fallbackUsed: true,
    dispatchId: `DSP-${Date.now().toString(36).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    channel: payload.channel,
    contacts: {
      phone: CONTACT_DETAILS.phone,
      email: CONTACT_DETAILS.email,
    },
    emailResult: {
      requested: payload.channel === 'email' || payload.channel === 'both',
      status: payload.channel === 'whatsapp' ? 'skipped' : 'dispatched_relay',
      recipient: CONTACT_DETAILS.email,
      provider: 'Direct Email Handoff',
      detail: `Direct email handoff prepared for ${CONTACT_DETAILS.email}. Tap Send via Gmail or Mail App below.`,
    },
    whatsappResult: {
      requested: payload.channel === 'whatsapp' || payload.channel === 'both',
      status: payload.channel === 'email' ? 'skipped' : 'dispatched_relay',
      recipient: CONTACT_DETAILS.phone,
      provider: 'Direct WhatsApp Handoff',
      detail: `Direct WhatsApp handoff prepared for ${CONTACT_DETAILS.phone}. Tap Open WhatsApp below.`,
    },
    whatsappUrl,
    mailtoUrl,
    gmailUrl,
  };
}

function buildEnquiryFallback(payload: EnquiryApiPayload): ApiDispatchResult {
  const ticketRef = `ENQ-${Date.now().toString().slice(-5)}`;
  const lines = [
    `Sanctuary Haven — Guest Enquiry (${ticketRef})`,
    `Subject: ${payload.subject}`,
    `From: ${payload.guestName}`,
    `Phone: ${payload.guestPhone}${payload.guestEmail ? ` | Email: ${payload.guestEmail}` : ''}`,
    payload.buildingName
      ? `Residence: ${payload.buildingName}${payload.roomNumber ? ` · Rm ${payload.roomNumber}` : ''}`
      : '',
    `Message: ${payload.message}`,
  ].filter(Boolean);
  const plainText = lines.join('\n');
  const subject = `[Enquiry ${ticketRef}] ${payload.subject}`;
  const { whatsappUrl, mailtoUrl, gmailUrl } = buildDirectHandoffUrls(subject, plainText);

  return {
    ok: true,
    fallbackUsed: true,
    ticketRef,
    timestamp: new Date().toISOString(),
    channel: payload.channel,
    contacts: {
      phone: CONTACT_DETAILS.phone,
      email: CONTACT_DETAILS.email,
    },
    emailResult: {
      requested: payload.channel === 'email' || payload.channel === 'both',
      status: payload.channel === 'whatsapp' ? 'skipped' : 'dispatched_relay',
      recipient: CONTACT_DETAILS.email,
      provider: 'Direct Email Handoff',
      detail: `Direct email handoff prepared for ${CONTACT_DETAILS.email}. Tap Send via Gmail or Mail App below.`,
    },
    whatsappResult: {
      requested: payload.channel === 'whatsapp' || payload.channel === 'both',
      status: payload.channel === 'email' ? 'skipped' : 'dispatched_relay',
      recipient: CONTACT_DETAILS.phone,
      provider: 'Direct WhatsApp Handoff',
      detail: `Direct WhatsApp handoff prepared for ${CONTACT_DETAILS.phone}. Tap Open WhatsApp below.`,
    },
    whatsappUrl,
    mailtoUrl,
    gmailUrl,
  };
}

export async function dispatchBookingRequest(
  payload: BookingApiPayload
): Promise<ApiDispatchResult> {
  try {
    const response = await fetch('/api/bookings/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const rawBody = await response.text();
    let data: ApiDispatchResult | null = null;
    try {
      data = JSON.parse(rawBody) as ApiDispatchResult;
    } catch {
      data = null;
    }

    if (response.ok && data?.ok) {
      return { ...data, fallbackUsed: false };
    }

    // Surface validation errors returned directly from the server (e.g. HTTP 400)
    if (response.status >= 400 && response.status < 500 && response.status !== 404 && data?.error) {
      return { ok: false, error: data.error };
    }

    // Automatic fallback on 404, 5xx, or non-JSON static host responses
    return buildBookingFallback(payload);
  } catch {
    return buildBookingFallback(payload);
  }
}

export async function dispatchEnquiryRequest(
  payload: EnquiryApiPayload
): Promise<ApiDispatchResult> {
  try {
    const response = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const rawBody = await response.text();
    let data: ApiDispatchResult | null = null;
    try {
      data = JSON.parse(rawBody) as ApiDispatchResult;
    } catch {
      data = null;
    }

    if (response.ok && data?.ok) {
      return { ...data, fallbackUsed: false };
    }

    if (response.status >= 400 && response.status < 500 && response.status !== 404 && data?.error) {
      return { ok: false, error: data.error };
    }

    return buildEnquiryFallback(payload);
  } catch {
    return buildEnquiryFallback(payload);
  }
}
