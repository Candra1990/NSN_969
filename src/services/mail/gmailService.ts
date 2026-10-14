import { loginWithGmail, getGmailToken } from '@/lib/firebase';

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  body?: string;
  isRead: boolean;
}

export const decodeBase64 = (base64Str: string): string => {
  try {
    const cleanStr = base64Str.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(
      atob(cleanStr)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    try {
      return atob(base64Str.replace(/-/g, '+').replace(/_/g, '/'));
    } catch (err) {
      return '';
    }
  }
};

export const encodeEmail = (to: string, subject: string, body: string): string => {
  const emailParts = [
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    '',
    body.replace(/\n/g, '<br />')
  ];
  const email = emailParts.join('\r\n');
  return btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const fetchGmailMessages = async (
  currentToken: string,
  searchQuery: string = ''
): Promise<{ messages: GmailMessage[]; tokenExpired?: boolean }> => {
  let url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15';
  if (searchQuery.trim()) {
    url += `&q=${encodeURIComponent(searchQuery)}`;
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${currentToken}` },
  });

  if (!res.ok) {
    if (res.status === 401) {
      return { messages: [], tokenExpired: true };
    }
    throw new Error(`Failed to list messages: ${res.statusText}`);
  }

  const data = await res.json();
  const messageList = data.messages || [];

  if (messageList.length === 0) {
    return { messages: [] };
  }

  const detailedEmails = await Promise.all(
    messageList.map(async (msg: { id: string; threadId: string }) => {
      try {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          { headers: { Authorization: `Bearer ${currentToken}` } }
        );
        if (!detailRes.ok) return null;

        const detailData = await detailRes.json();
        const headers = detailData.payload.headers || [];

        const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
        const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
        const dateStr = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';

        let date = dateStr;
        try {
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          }
        } catch (e) {}

        const labelIds = detailData.labelIds || [];
        const isRead = !labelIds.includes('UNREAD');

        let body = '';
        if (detailData.payload.parts) {
          const textPart = detailData.payload.parts.find(
            (p: any) => p.mimeType === 'text/plain' || p.mimeType === 'text/html'
          );
          if (textPart && textPart.body && textPart.body.data) {
            body = decodeBase64(textPart.body.data);
          } else {
            const firstPart = detailData.payload.parts[0];
            if (firstPart && firstPart.parts) {
              const nestedTextPart = firstPart.parts.find(
                (p: any) => p.mimeType === 'text/plain' || p.mimeType === 'text/html'
              );
              if (nestedTextPart && nestedTextPart.body && nestedTextPart.body.data) {
                body = decodeBase64(nestedTextPart.body.data);
              }
            }
          }
        } else if (detailData.payload.body && detailData.payload.body.data) {
          body = decodeBase64(detailData.payload.body.data);
        }

        return {
          id: msg.id,
          threadId: msg.threadId,
          subject,
          from,
          date,
          snippet: detailData.snippet || '',
          body: body || detailData.snippet || '',
          isRead
        };
      } catch (e) {
        console.error(`Error fetching message ${msg.id} details:`, e);
        return null;
      }
    })
  );

  return { messages: detailedEmails.filter(Boolean) as GmailMessage[] };
};

export const sendGmailMessage = async (
  currentToken: string,
  to: string,
  subject: string,
  body: string
): Promise<void> => {
  const rawEmail = encodeEmail(to, subject, body);
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${currentToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: rawEmail }),
  });

  if (!res.ok) {
    throw new Error(`Failed to send email: ${res.statusText}`);
  }
};

export const trashGmailMessage = async (
  currentToken: string,
  messageId: string
): Promise<void> => {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${currentToken}` },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to trash message: ${res.statusText}`);
  }
};

export const markGmailMessageAsRead = async (
  currentToken: string,
  messageId: string
): Promise<boolean> => {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ removeLabelIds: ['UNREAD'] }),
    }
  );

  return res.ok;
};

export { loginWithGmail, getGmailToken };
