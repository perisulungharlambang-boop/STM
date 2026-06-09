/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  User, 
  Calendar, 
  Clock, 
  Maximize2, 
  ShieldAlert,
  Volume2
} from 'lucide-react';
import { AuthUser, ForumPost, MemberRole } from '../types';

interface ForumDiscussionProps {
  user: AuthUser | null;
  posts: ForumPost[];
  onCreatePost: (post: { title: string; content: string; authorId: string; authorName: string; role: string }) => Promise<any>;
  onAddComment: (postId: string, comment: { content: string; authorName: string; role: string }) => Promise<any>;
}

export default function ForumDiscussion({
  user,
  posts,
  onCreatePost,
  onAddComment
}: ForumDiscussionProps) {
  const [showCreatePostForm, setShowCreatePostForm] = useState(false);
  const [activePost, setActivePost] = useState<ForumPost | null>(null);

  // Form states: Create post
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);

  // Form states: Create comment
  const [commentContent, setCommentContent] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postContent) {
      alert('Judul dan isi pembahasan diskusi wajib diisi.');
      return;
    }

    setLoadingCreate(true);
    try {
      await onCreatePost({
        title: postTitle,
        content: postContent,
        authorId: user?.id || 'guest-' + Date.now(),
        authorName: user?.name || 'Tamu STM',
        role: user?.role || MemberRole.MEMBER
      });
      alert('Utas diskusi baru berhasil diterbitkan!');
      setShowCreatePostForm(false);
      setPostTitle('');
      setPostContent('');
    } catch (err) {
      console.error(err);
      alert('Gagal membuat diskusi.');
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePost) return;
    if (!commentContent) {
      alert('Isi komentar balasan tidak boleh kosong.');
      return;
    }

    setLoadingComment(true);
    try {
      await onAddComment(activePost.id, {
        content: commentContent,
        authorName: user?.name || 'Tamu STM',
        role: user?.role || MemberRole.MEMBER
      });
      setCommentContent('');
      
      // Update local state viewing post to reflect instant comment addition
      const freshPost = posts.find(p => p.id === activePost.id);
      if (freshPost) {
        setActivePost(freshPost);
      } else {
        setActivePost(null);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengirimkan balasan komentar.');
    } finally {
      setLoadingComment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-slate-800">Forum Rembug &amp; Gagasan Warga</h1>
          <p className="text-sm text-slate-500">
            Kanal aspirasi interaktif bapak-ibu pengurus dan anggota untuk bermusyawarah serta berbagi info penting lingkungan.
          </p>
        </div>

        <button
          onClick={() => { setShowCreatePostForm(!showCreatePostForm); setActivePost(null); }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 self-start md:self-auto hover:shadow-lg"
        >
          <Plus size={15} />
          Mulai Diskusi Baru
        </button>
      </div>

      {/* --- WORKPLACE TO CREATE DISCUSS THREAD (FORM) --- */}
      {showCreatePostForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs max-w-2xl space-y-4">
          <div className="flex items-center gap-2 text-indigo-700">
            <MessageSquare size={18} />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Tulis Topik Pembahasan Baru</h3>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-3 font-display">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Judul Musyawarah</label>
              <input 
                type="text" 
                placeholder="Contoh: Rencana Kerja Bakti Minggu Pagi &amp; Pemangkasan Ranting RW"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Isi Narasi Pokok Pembahasan</label>
              <textarea 
                placeholder="Uraikan opini, saran, atau usulan pengadaan bapak dan ibu secara lengkap dan sopan..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={4}
                className="w-full bg-slate-50 border border-slate-155 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loadingCreate}
              className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl px-4 shadow-md transition disabled:opacity-50 hover:shadow-lg"
            >
              {loadingCreate ? 'Menerbitkan...' : 'Terbitkan Utas Diskusi'}
            </button>
          </form>
        </div>
      )}

      {/* Forums Lists Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Thread Lists - Left (5 Cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider py-1">Topik Bergulir</div>
          
          {posts.map((post) => (
            <div 
              key={post.id}
              onClick={() => {
                setActivePost(post);
                setCommentContent('');
              }}
              className={`p-4 rounded-xl border transition text-left cursor-pointer ${
                activePost?.id === post.id 
                  ? 'bg-indigo-50/45 border-indigo-300' 
                  : 'bg-white border-slate-150 hover:border-slate-250 shadow-xs'
              }`}
            >
              <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md mb-2 ${
                post.role === MemberRole.ADMIN ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {post.role === MemberRole.ADMIN ? 'Pengumuman Pengurus' : 'Gagasan Warga'}
              </span>

              <h3 className="text-sm font-bold text-slate-800 line-clamp-1 leading-snug mb-1">{post.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{post.content}</p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100/50 pt-2.5">
                <span className="font-medium text-slate-600">Oleh: {post.authorName.split(' ')[0]}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-indigo-600">
                  <MessageSquare size={12} />
                  {post.comments.length} Respon
                </span>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <p className="bg-white p-6 rounded-2xl border border-slate-100 text-slate-400 text-center text-xs">Belum ada diskusi terbit.</p>
          )}
        </div>

        {/* Dynamic Detail Thread and reply block - Right (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-5">
          {activePost ? (
            <div className="space-y-5">
              {/* Core Post Display */}
              <div className="border-b border-slate-100 pb-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-800 flex items-center justify-center font-bold text-[10px]">
                      {activePost.authorName.charAt(0).toUpperCase()}
                    </div>
                    {activePost.authorName} ({activePost.role === MemberRole.ADMIN ? 'Pengaruh' : 'Anggota'})
                  </div>
                  <span className="font-mono text-[10px]">Terbit: {new Date(activePost.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
                
                <h2 className="text-base font-display font-semibold text-slate-800 leading-tight">
                  {activePost.title}
                </h2>
                
                <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-150 font-mono">
                  {activePost.content}
                </div>
              </div>

              {/* Comments Reply historical timeline */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                  Tanggapan Musyawarah ({activePost.comments.length})
                </span>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                  {activePost.comments.map((com) => (
                    <div key={com.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-xs">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold shrink-0 text-[10px]">
                        {com.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-800 font-semibold">{com.authorName}</strong>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {com.role === MemberRole.ADMIN && <span className="bg-purple-100 text-[9px] px-1 py-0.25 text-purple-700 rounded mr-1.5 font-bold">Admin</span>}
                            {new Date(com.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{com.content}</p>
                      </div>
                    </div>
                  ))}
                  {activePost.comments.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4 italic">Belum ada respon tanggapan. Jadilah yang pertama bermusyawarah!</p>
                  )}
                </div>
              </div>

              {/* Form to submit comment reply */}
              <form onSubmit={handleAddComment} className="border-t border-slate-100 pt-4 flex gap-2 font-sans">
                <input 
                  type="text"
                  placeholder="Ketik balasan saran rembug Anda di sini..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loadingComment}
                  className="px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50 shrink-0"
                >
                  {loadingComment ? 'Kirim...' : 'Kirim'}
                  <Send size={12} />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 space-y-3">
              <MessageSquare size={42} className="text-slate-300 stroke-1" />
              <div>
                <h3 className="text-sm font-semibold text-slate-700">Pilih Topik Diskusi</h3>
                <p className="text-xs text-slate-400 mt-0.5">Silakan ketuk salah satu judul musyawarah di sebelah kiri untuk melihat rincian masukan.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
