import { auth, storage } from '../httpClient';

const key = (soundId) => `sw_comments_${soundId}`;

function loadLocal(soundId) {
  try { return JSON.parse(localStorage.getItem(key(soundId))) ?? []; } catch { return []; }
}

function saveLocal(soundId, comments) {
  localStorage.setItem(key(soundId), JSON.stringify(comments));
}

async function resolveUsernames(comments) {
  const uniqueIds = [...new Set(comments.map(c => c.userId).filter(Boolean))];
  const users = {};
  await Promise.all(uniqueIds.map(async (id) => {
    try {
      const u = await auth.get(`/users/${id}`);
      users[id] = u;
    } catch {}
  }));
  return comments.map(c => ({
    ...c,
    username: users[c.userId]?.username ?? `User ${c.userId}`,
    avatarUrl: users[c.userId]?.avatar_url ?? null,
  }));
}

export async function getComments(soundId) {
  try {
    const comments = await storage.get(`/api/v1.0/comments/${soundId}`);
    const list = Array.isArray(comments) ? comments : [];
    return await resolveUsernames(list);
  } catch {
    return loadLocal(soundId);
  }
}

export async function postComment(soundId, text, parentId = null, user) {
  try {
    const result = await storage.post(`/api/v1.0/comments/${soundId}`, {
      text,
      parentId: parentId ?? '',
    });
    return {
      ...result,
      username: user?.username ?? `User ${result.userId}`,
      avatarUrl: user?.avatar_url ?? null,
    };
  } catch {
    const comment = {
      id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      productId: soundId,
      userId: user?.id ?? null,
      username: user?.username ?? 'Anonymous',
      avatarUrl: user?.avatar_url ?? null,
      text,
      parentId: parentId ?? '',
      createdAt: new Date().toISOString(),
    };
    const comments = loadLocal(soundId);
    comments.push(comment);
    saveLocal(soundId, comments);
    return comment;
  }
}

export async function deleteComment(soundId, commentId) {
  try {
    await storage.del(`/api/v1.0/comments/${soundId}/${commentId}`);
  } catch {
    // backend delete not yet implemented, always clean up locally
  }
  const comments = loadLocal(soundId).filter(c => c.id !== commentId);
  saveLocal(soundId, comments);
}
