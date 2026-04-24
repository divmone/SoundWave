import { useState, useEffect, useRef } from 'react';
import { getComments, postComment, deleteComment } from '../../api/services/commentsService';

const MAX_DEPTH = 4;

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function buildTree(flat) {
  const map = {};
  flat.forEach(c => { map[c.id] = { ...c, replies: [] }; });
  const roots = [];
  flat.forEach(c => {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].replies.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });
  return roots;
}

function flattenWithDeleted(flat, deletedId) {
  return flat.filter(c => c.id !== deletedId);
}

function ReplyInput({ onPost, onCancel, posting }) {
  const [text, setText] = useState('');
  const ref = useRef(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onPost(text);
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div style={{ marginTop: 8 }}>
      <textarea
        ref={ref}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Write a reply… (Ctrl+Enter to send, Esc to cancel)"
        maxLength={500}
        rows={2}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'var(--bg4)',
          border: '1.5px solid var(--line-hot)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text)', fontFamily: 'var(--font-body)',
          fontSize: '0.85rem', padding: '0.6rem 0.8rem',
          outline: 'none', resize: 'none', lineHeight: 1.6,
        }}
      />
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 5 }}>
        <button
          onClick={onCancel}
          className="btn-ghost"
          style={{ padding: '0.3rem 0.9rem', fontSize: '0.72rem' }}
        >Cancel</button>
        <button
          onClick={() => onPost(text)}
          disabled={posting || !text.trim()}
          className="btn-primary"
          style={{ padding: '0.3rem 0.9rem', fontSize: '0.72rem', opacity: (!text.trim() || posting) ? 0.5 : 1 }}
        >{posting ? '…' : 'Reply'}</button>
      </div>
    </div>
  );
}

function CommentNode({ comment, user, soundId, depth, onDelete, onReply }) {
  const [replying, setReplying]   = useState(false);
  const [posting, setPosting]     = useState(false);
  const [confirm, setConfirm]     = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const canDelete = user && (user.id === comment.userId || user.is_admin);
  const canReply  = !!user && depth < MAX_DEPTH;
  const initials  = comment.username?.[0]?.toUpperCase() ?? '?';

  const handleDelete = async () => {
    if (!confirm) { setConfirm(true); return; }
    setDeleting(true);
    try {
      await deleteComment(soundId, comment.id);
      onDelete(comment.id);
    } catch {
      setDeleting(false);
      setConfirm(false);
    }
  };

  const handleReply = async (text) => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      const newComment = await onReply(text, comment.id);
      if (newComment) setReplying(false);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.65rem' }}>
      {/* Avatar */}
      <div style={{
        width: depth === 0 ? 32 : 26, height: depth === 0 ? 32 : 26,
        borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, var(--cyan-dark), var(--violet))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: depth === 0 ? '0.75rem' : '0.65rem',
        fontWeight: 900, color: '#fff',
        fontFamily: 'var(--font-display)', overflow: 'hidden',
        marginTop: 2,
      }}>
        {comment.avatarUrl
          ? <img src={comment.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : initials}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: depth === 0 ? '0.8rem' : '0.75rem',
            color: depth === 0 ? 'var(--cyan)' : 'var(--violet)',
          }}>{comment.username}</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            {timeAgo(comment.createdAt)}
          </span>
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                marginLeft: 'auto',
                width: 24, height: 24, borderRadius: '50%',
                background: confirm ? 'var(--red-dim)' : 'transparent',
                border: `1px solid ${confirm ? 'rgba(255,68,102,0.4)' : 'transparent'}`,
                color: confirm ? 'var(--red)' : 'var(--text3)',
                cursor: deleting ? 'wait' : 'pointer', fontSize: '0.68rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.18s',
              }}
              onMouseEnter={e => { if (!confirm) { e.currentTarget.style.borderColor = 'rgba(255,68,102,0.3)'; e.currentTarget.style.color = 'var(--red)'; }}}
              onMouseLeave={e => { if (!confirm) { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--text3)'; }}}
            >{deleting ? '…' : confirm ? '!' : '✕'}</button>
          )}
        </div>

        {/* Text */}
        <div style={{
          fontSize: '0.85rem', color: 'var(--text2)',
          fontFamily: 'var(--font-body)', lineHeight: 1.6,
          wordBreak: 'break-word', marginBottom: 4,
        }}>{comment.text}</div>

        {/* Reply button */}
        {canReply && !replying && (
          <button
            onClick={() => setReplying(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text3)', fontFamily: 'var(--font-display)',
              fontWeight: 700, fontSize: '0.68rem', padding: '2px 0',
              transition: 'color 0.18s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--violet)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
          >↩ Reply</button>
        )}

        {/* Reply input */}
        {replying && (
          <ReplyInput
            onPost={handleReply}
            onCancel={() => setReplying(false)}
            posting={posting}
          />
        )}

        {/* Nested replies */}
        {comment.replies?.length > 0 && (
          <div style={{
            marginTop: 10,
            paddingLeft: 12,
            borderLeft: `2px solid ${depth % 2 === 0 ? 'rgba(99,215,255,0.15)' : 'rgba(155,109,255,0.15)'}`,
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {comment.replies.map(reply => (
              <CommentNode
                key={reply.id}
                comment={reply}
                user={user}
                soundId={soundId}
                depth={depth + 1}
                onDelete={onDelete}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentsModal({ product, user, onClose }) {
  const [flat, setFlat]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [text, setText]           = useState('');
  const [posting, setPosting]     = useState(false);
  const [postError, setPostError] = useState('');
  const overlayRef = useRef(null);

  useEffect(() => {
    getComments(product.id)
      .then(data => setFlat(Array.isArray(data) ? data : []))
      .catch(() => setError('Could not load comments'))
      .finally(() => setLoading(false));
  }, [product.id]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    setPostError('');
    try {
      const comment = await postComment(product.id, text.trim(), null, user);
      setFlat(prev => [...prev, comment]);
      setText('');
    } catch (e) {
      setPostError(e.message || 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (replyText, parentId) => {
    try {
      const comment = await postComment(product.id, replyText, parentId, user);
      setFlat(prev => [...prev, comment]);
      return comment;
    } catch {
      return null;
    }
  };

  const handleDelete = (id) => {
    setFlat(prev => flattenWithDeleted(prev, id));
  };

  const tree = buildTree(flat);
  const totalCount = flat.length;

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(5,5,8,0.88)', backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', animation: 'overlayIn 0.2s ease both',
      }}
    >
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--line2)',
        borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 520,
        maxHeight: '85dvh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 32px 80px rgba(0,0,0,0.85)',
        animation: 'modalIn 0.35s cubic-bezier(.34,1.2,.64,1) both',
        overflow: 'hidden',
      }}>
        {/* Shimmer */}
        <div style={{
          height: 3, flexShrink: 0,
          background: 'linear-gradient(90deg, var(--cyan-dark), var(--violet), var(--cyan))',
          backgroundSize: '300%', animation: 'shimmer 3s linear infinite',
        }} />

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--line)', flexShrink: 0,
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: '1rem', color: 'var(--text)',
            }}>{product.title}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              {loading ? '…' : `${totalCount} comment${totalCount !== 1 ? 's' : ''}`}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--bg3)', border: '1.5px solid var(--line2)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text3)', fontSize: '1rem', transition: 'all 0.18s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.color = 'var(--text3)'; }}
          >✕</button>
        </div>

        {/* Comments list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 1.5rem' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem 0' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  height: 60, background: 'var(--bg3)', borderRadius: 'var(--radius-sm)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              ))}
            </div>
          ) : error ? (
            <div style={{ padding: '1.5rem 0', color: 'var(--red)', fontSize: '0.85rem' }}>⚠️ {error}</div>
          ) : tree.length === 0 ? (
            <div style={{
              padding: '2.5rem 0', textAlign: 'center',
              color: 'var(--text3)', fontFamily: 'var(--font-body)', fontSize: '0.85rem',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>💬</div>
              No comments yet. Be the first!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0.75rem 0' }}>
              {tree.map(comment => (
                <div key={comment.id} style={{ borderBottom: '1px solid var(--line)', paddingBottom: 16 }}>
                  <CommentNode
                    comment={comment}
                    user={user}
                    soundId={product.id}
                    depth={0}
                    onDelete={handleDelete}
                    onReply={handleReply}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New root comment input */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--line)', flexShrink: 0 }}>
          {user ? (
            <>
              <textarea
                value={text}
                onChange={e => { setText(e.target.value); setPostError(''); }}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handlePost(); }}
                placeholder="Write a comment… (Ctrl+Enter to send)"
                maxLength={500}
                rows={3}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'var(--bg3)',
                  border: `1.5px solid ${postError ? 'var(--red)' : 'var(--line2)'}`,
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text)', fontFamily: 'var(--font-body)',
                  fontSize: '0.88rem', padding: '0.7rem 0.9rem',
                  outline: 'none', resize: 'none', lineHeight: 1.6,
                  transition: 'border-color 0.18s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--cyan)'}
                onBlur={e => e.target.style.borderColor = postError ? 'var(--red)' : 'var(--line2)'}
              />
              {postError && <div style={{ color: 'var(--red)', fontSize: '0.72rem', marginTop: 4 }}>{postError}</div>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                  {text.length}/500
                </span>
                <button
                  className="btn-primary"
                  onClick={handlePost}
                  disabled={posting || !text.trim()}
                  style={{ padding: '0.45rem 1.2rem', fontSize: '0.78rem', opacity: (!text.trim() || posting) ? 0.5 : 1 }}
                >{posting ? 'Posting…' : 'Post'}</button>
              </div>
            </>
          ) : (
            <div style={{
              padding: '0.9rem 1rem', textAlign: 'center',
              background: 'var(--bg3)', borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem', color: 'var(--text3)', fontFamily: 'var(--font-body)',
            }}>Sign in to leave a comment</div>
          )}
        </div>
      </div>
    </div>
  );
}
