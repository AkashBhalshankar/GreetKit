import { Greeting, WishItem, ReplyItem } from '../types/greeting';

export async function saveGreeting(greeting: Greeting): Promise<{ id: string; editToken: string; url: string }> {
  try {
    const res = await fetch('/api/v1/greetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(greeting),
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof window !== 'undefined' && window.localStorage && data.id) {
        window.localStorage.setItem(`greetkit_saved_${data.id}`, JSON.stringify({ ...greeting, id: data.id }));
      }
      return data;
    }
  } catch (e) {
    console.warn('Network save failed, saving to local backup:', e);
  }

  // Fallback to local storage if server is temporarily unreachable
  const localId = greeting.id || Math.random().toString(36).substring(2, 10);
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(`greetkit_saved_${localId}`, JSON.stringify({ ...greeting, id: localId }));
  }
  return { id: localId, editToken: 'local-token', url: `/g/${localId}` };
}

export async function updateGreeting(id: string, greeting: Greeting): Promise<{ id: string; editToken: string; url: string; modified?: boolean }> {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(`greetkit_saved_${id}`, JSON.stringify({ ...greeting, id }));
  }
  try {
    const res = await fetch(`/api/v1/greetings/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(greeting),
    });
    if (res.ok) {
      return res.json();
    }
  } catch (e) {
    console.warn('Network update failed, saved to local storage:', e);
  }
  return { id, editToken: 'local-token', url: `/g/${id}`, modified: true };
}

export async function fetchGreeting(id: string): Promise<Greeting> {
  // First attempt server fetch
  try {
    const res = await fetch(`/api/v1/greetings/${encodeURIComponent(id)}`);
    if (res.ok) {
      const doc = await res.json();
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(`greetkit_saved_${id}`, JSON.stringify(doc));
      }
      return doc;
    }
  } catch (err) {
    console.warn('Server fetch error, attempting local storage fallback for ID:', id);
  }

  // Fallback to local storage
  if (typeof window !== 'undefined' && window.localStorage) {
    const local = window.localStorage.getItem(`greetkit_saved_${id}`);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
  }

  throw new Error('Greeting not found or link has expired');
}

export async function generateAiDrafts(params: {
  occasion: string;
  recipientName: string;
  relationship: string;
  tone: string;
  language: string;
  insideJoke?: string;
  details?: string;
}): Promise<{ drafts: string[]; model: string }> {
  const res = await fetch('/api/v1/ai/draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error('AI drafting failed');
  }
  return res.json();
}

export async function generateAiSlots(params: {
  engine: string;
  recipientName: string;
  relationship: string;
  count?: number;
  occasion?: string;
}): Promise<{ slots: string[] }> {
  const res = await fetch('/api/v1/ai/fill-slots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error('AI slots generation failed');
  }
  return res.json();
}

export async function generateAiStyleSuggestion(params: {
  description: string;
  occasion: string;
}): Promise<{
  engine: string;
  skin: string;
  accent: string;
  font: string;
  tone: string;
  rationale: string;
}> {
  const res = await fetch('/api/v1/ai/suggest-style', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error('Style suggestion failed');
  }
  return res.json();
}

export async function getWishes(id: string): Promise<WishItem[]> {
  try {
    const res = await fetch(`/api/v1/greetings/${encodeURIComponent(id)}/wishes`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.wishes || [];
  } catch {
    return [];
  }
}

export async function postWish(id: string, wish: { name: string; message: string; emoji?: string }): Promise<WishItem> {
  const res = await fetch(`/api/v1/greetings/${encodeURIComponent(id)}/wish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(wish),
  });
  if (!res.ok) {
    throw new Error('Failed to post wish');
  }
  const data = await res.json();
  return data.wish;
}

export async function postReply(id: string, reply: { name: string; reaction: string; message: string }): Promise<ReplyItem> {
  const res = await fetch(`/api/v1/greetings/${encodeURIComponent(id)}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reply),
  });
  if (!res.ok) {
    throw new Error('Failed to send reply');
  }
  const data = await res.json();
  return data.reply;
}
