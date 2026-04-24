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
    if (c.parentId && map[c.parentId]) map[c.parentId].replies.push(map[c.id]);
    else roots.push(map[c.id]);
  });
  return roots;
}

function ReplyInput({ onPost, onCancel, posting }) {
  const [text, setText] = useState('');
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div style={{ marginTop: 8 }}>
      <textarea
        ref={ref}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onPost(text); if (e.key === 'Escape') onCancel(); }}
        placeholder="Reply… (Ctrl+Enter · Esc to cancel)"
        maxLength={500}
        rows={2}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'var(--bg4)', border: '1.5px solid var(--line-hot)',
          borderRadius: 8, color: 'var(--text)',
          fontFamily: 'var(--font-body)', fontSize: '0.82rem',
          padding: '0.5rem 0.75rem', outline: 'none',
          resize: 'none', lineHeight: 1.5,
        }}
      />
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 5 }}>
        <button onClick={onCancel} className="btn-ghost" style={{ padding: '0.25rem 0.8rem', fontSize: '0.7rem' }}>Cancel</button>
        <button onClick={() => onPost(text)} disabled={posting || !text.trim()} className="btn-primary"
          style={{ padding: '0.25rem 0.8rem', fontSize: '0.7rem', opacity: (!text.trim() || posting) ? 0.5 : 1 }}>
          {posting ? '…' : 'Reply'}
        </button>
      </div>
    </div>
  );
}

function CommentNode({ comment, user, soundId, depth, onDelete, onReply }) {
  const [replying, setReplying] = useState(false);
  const [posting, setPosting]   = useState(false);
  const [confirm, setConfirm]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const canDelete = user && (user.id === comment.userId || user.is_admin);
  const initials  = comment.username?.[0]?.toUpperCase() ?? '?';
  const avatarSize = depth === 0 ? 28 : 22;

  const handleDelete = async () => {
    if (!confirm) { setConfirm(true); return; }
    setDeleting(true);
    try { await deleteComment(soundId, comment.id); onDelete(comment.id); }
    catch { setDeleting(false); setConfirm(false); }
  };

  const handleReply = async (text) => {
    if (!text.trim()) return;
    setPosting(true);
    try { const c = await onReply(text, comment.id); if (c) setReplying(false); }
    finally { setPosting(false); }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <div style={{
        width: avatarSize, height: avatarSize, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, var(--cyan-dark), var(--violet))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: depth === 0 ? '0.65rem' : '0.55rem',
        fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)',
        overflow: 'hidden', marginTop: 2,
      }}>
        {comment.avatarUrl
          ? <img src={comment.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : initials}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: depth === 0 ? '0.75rem' : '0.7rem',
            color: depth % 2 === 0 ? 'var(--cyan)' : 'var(--violet)',
          }}>{comment.username}</span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            {timeAgo(comment.createdAt)}
          </span>
          {canDelete && (
            <button onClick={handleDelete} disabled={deleting} style={{
              marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%',
              background: confirm ? 'var(--red-dim)' : 'transparent',
              border: `1px solid ${confirm ? 'rgba(255,68,102,0.4)' : 'transparent'}`,
              color: confirm ? 'var(--red)' : 'var(--text3)',
              cursor: deleting ? 'wait' : 'pointer', fontSize: '0.6rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.18s',
            }}
              onMouseEnter={e => { if (!confirm) { e.currentTarget.style.borderColor = 'rgba(255,68,102,0.3)'; e.currentTarget.style.color = 'var(--red)'; }}}
              onMouseLeave={e => { if (!confirm) { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--text3)'; }}}
            >{deleting ? '…' : confirm ? '!' : '✕'}</button>
          )}
        </div>

        <div style={{
          fontSize: '0.82rem', color: 'var(--text2)',
          fontFamily: 'var(--font-body)', lineHeight: 1.55,
          wordBreak: 'break-word', marginBottom: 3,
        }}>{comment.text}</div>

        {!!user && depth < MAX_DEPTH && !replying && (
          <button onClick={() => setReplying(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text3)', fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: '0.65rem', padding: '1px 0',
            transition: 'color 0.18s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--violet)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
          >↩ Reply</button>
        )}

        {replying && <ReplyInput onPost={handleReply} onCancel={() => setReplying(false)} posting={posting} />}

        {comment.replies?.length > 0 && (
          <div style={{
            marginTop: 8, paddingLeft: 10,
            borderLeft: `2px solid ${depth % 2 === 0 ? 'rgba(99,215,255,0.12)' : 'rgba(155,109,255,0.12)'}`,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {comment.replies.map(r => (
              <CommentNode key={r.id} comment={r} user={user} soundId={soundId}
                depth={depth + 1} onDelete={onDelete} onReply={onReply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentsSection({ product, user }) {
  const [flat, setFlat]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [text, setText]           = useState('');
  const [posting, setPosting]     = useState(false);
  const [postError, setPostError] = useState('');

  useEffect(() => {
    getComments(product.id)
      .then(data => setFlat(Array.isArray(data) ? data : []))
      .catch(() => setError('Could not load comments'))
      .finally(() => setLoading(false));
  }, [product.id]);

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true); setPostError('');
    try {
      const comment = await postComment(product.id, text.trim(), null, user);
      setFlat(prev => [...prev, comment]);
      setText('');
    } catch (e) {
      setPostError(e.message || 'Failed to post');
    } finally { setPosting(false); }
  };

  const handleReply = async (replyText, parentId) => {
    try {
      const comment = await postComment(product.id, replyText, parentId, user);
      setFlat(prev => [...prev, comment]);
      return comment;
    } catch { return null; }
  };

  const handleDelete = (id) => setFlat(prev => prev.filter(c => c.id !== id));

  const tree = buildTree(flat);

  return (
    <div>
      {/* Comments list */}
      <div style={{ maxHeight: 320, overflowY: 'auto', padding: '0.75rem 1rem' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2].map(i => (
              <div key={i} style={{
                height: 48, background: 'var(--bg3)', borderRadius: 8,
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ color: 'var(--red)', fontSize: '0.8rem' }}>⚠️ {error}</div>
        ) : tree.length === 0 ? (
          <div style={{
            padding: '1.2rem 0', textAlign: 'center',
            color: 'var(--text3)', fontSize: '0.8rem', fontFamily: 'var(--font-body)',
          }}>
            💬 No comments yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tree.map((c, i) => (
              <div key={c.id}>
                <CommentNode comment={c} user={user} soundId={product.id}
                  depth={0} onDelete={handleDelete} onReply={handleReply} />
                {i < tree.length - 1 && (
                  <div style={{ height: 1, background: 'var(--line)', marginTop: 12 }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '0.6rem 1rem 0.9rem', borderTop: '1px solid var(--line)' }}>
        {user ? (
          <>
            <textarea
              value={text}
              onChange={e => { setText(e.target.value); setPostError(''); }}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handlePost(); }}
              placeholder="Write a comment… (Ctrl+Enter)"
              maxLength={500}
              rows={2}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--bg3)',
                border: `1.5px solid ${postError ? 'var(--red)' : 'var(--line2)'}`,
                borderRadius: 8, color: 'var(--text)',
                fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                padding: '0.55rem 0.8rem', outline: 'none',
                resize: 'none', lineHeight: 1.5, transition: 'border-color 0.18s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--cyan)'}
              onBlur={e => e.target.style.borderColor = postError ? 'var(--red)' : 'var(--line2)'}
            />
            {postError && <div style={{ color: 'var(--red)', fontSize: '0.68rem', marginTop: 3 }}>{postError}</div>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{text.length}/500</span>
              <button className="btn-primary" onClick={handlePost}
                disabled={posting || !text.trim()}
                style={{ padding: '0.35rem 1rem', fontSize: '0.72rem', opacity: (!text.trim() || posting) ? 0.5 : 1 }}>
                {posting ? '…' : 'Post'}
              </button>
            </div>
          </>
        ) : (
          <div style={{
            padding: '0.6rem', textAlign: 'center',
            background: 'var(--bg3)', borderRadius: 8,
            fontSize: '0.78rem', color: 'var(--text3)',
          }}>Sign in to comment</div>
        )}
      </div>
    </div>
  );
}
