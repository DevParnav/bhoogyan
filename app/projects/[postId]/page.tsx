"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { initialPosts, Post, Comment, currentUser } from '../mockData';
import { Heart, Bookmark, MapPin, Share2, CornerDownRight, ArrowLeft, ExternalLink } from 'lucide-react';

export default function PostDiscussion() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const savedPostsStr = localStorage.getItem('bhoogyan_posts');
    let allPosts = initialPosts;
    if (savedPostsStr) {
      allPosts = JSON.parse(savedPostsStr);
    }
    
    const foundPost = allPosts.find(p => p.id === postId);
    if (foundPost) {
      setPost(foundPost);
    }
  }, [postId]);

  const handlePostComment = () => {
    if (!newComment.trim() || !post) return;

    const comment: Comment = {
      id: `c${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      avatarInitials: currentUser.avatarInitials,
      content: newComment,
      timestamp: "Just now"
    };

    const updatedPost = {
      ...post,
      commentsCount: post.commentsCount + 1,
      comments: [...post.comments, comment]
    };

    setPost(updatedPost);
    
    // Update local storage
    const savedPostsStr = localStorage.getItem('bhoogyan_posts');
    let allPosts = savedPostsStr ? JSON.parse(savedPostsStr) as Post[] : initialPosts;
    const postIndex = allPosts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
      allPosts[postIndex] = updatedPost;
      localStorage.setItem('bhoogyan_posts', JSON.stringify(allPosts));
    }

    setNewComment("");
  };

  if (!post) {
    return (
      <div className="bg-[#F6F2EB] min-h-screen flex flex-col items-center justify-center">
        <p className="text-[#8A8077]">Loading post discussion...</p>
        <button onClick={() => router.push('/projects')} className="mt-4 text-[#5B4A3E] font-medium hover:underline">Return to Projects</button>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F2EB] min-h-screen text-[#5B4A3E] font-sans selection:bg-[#F8DED4] pb-24">
      
      {/* Top Header */}
      <div className="max-w-[760px] mx-auto px-6 pt-12 mb-8">
        <button onClick={() => router.push('/projects')} className="flex items-center gap-2 text-[12px] font-semibold text-[#8A8077] hover:text-[#5B4A3E] transition-colors mb-4 uppercase tracking-widest">
          <ArrowLeft size={16} /> Projects
        </button>
        <h1 className="text-[20px] font-semibold text-[#5B4A3E]">Research Discussion</h1>
      </div>

      <div className="max-w-[760px] mx-auto px-6 flex flex-col h-full">

        {/* Main Post */}
        <div className="bg-[#FFFFFF] p-8 rounded-[12px] border border-[#CBBFAF]/60 shadow-[0_2px_12px_rgba(91,74,62,0.04)] mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div 
              onClick={() => router.push('/profile')}
              className="cursor-pointer w-[46px] h-[46px] rounded-full bg-[#F6F2EB] text-[#5B4A3E] flex items-center justify-center font-semibold text-[15px] border border-[#CBBFAF]/50 hover:bg-[#F8DED4] transition-colors"
            >
              {post.avatarInitials}
            </div>
            <div>
              <span 
                onClick={() => router.push('/profile')}
                className="cursor-pointer font-semibold text-[#5B4A3E] text-[16px] hover:underline block mb-0.5"
              >
                {post.authorName}
              </span>
              <div className="flex items-center gap-1.5 text-[13px] text-[#8A8077]">
                <span>{post.authorRole}</span>
                {post.location && (
                  <>
                    <span>·</span>
                    <span>{post.location}</span>
                  </>
                )}
                <span>·</span>
                <span>{post.timestamp}</span>
              </div>
            </div>
          </div>

          <h2 className="text-[24px] font-semibold text-[#5B4A3E] mb-4 leading-tight">{post.title}</h2>
          <p className="text-[16px] text-[#5B4A3E]/90 mb-6 leading-relaxed whitespace-pre-wrap">{post.description}</p>

          {post.imageUrl && (
            <div className="mb-6 rounded-[12px] overflow-hidden border border-[#CBBFAF]/40">
              <img src={post.imageUrl} alt="Post Attachment" className="w-full aspect-[16/9] object-cover" />
            </div>
          )}

          {post.linkUrl && (
            <div className="mb-6 bg-[#F6F2EB]/40 p-4 rounded-xl border border-[#CBBFAF]/40 flex items-start gap-4 hover:bg-[#F6F2EB] transition-colors">
              <div className="bg-[#FFFFFF] p-2.5 rounded-lg border border-[#CBBFAF]/40 shadow-sm shrink-0">
                <ExternalLink size={20} className="text-[#5B4A3E]" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <a href={post.linkUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#5B4A3E] text-[15px] hover:underline leading-tight mb-1 block truncate">
                  {post.linkTitle || "Research Source"}
                </a>
                <p className="text-[13px] text-[#8A8077] line-clamp-1">{post.linkDesc || post.linkUrl}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            {post.tags.map(t => (
              <span key={t} className="text-[12px] font-semibold bg-[#F6F2EB] text-[#8A8077] px-3 py-1.5 rounded-md uppercase tracking-wider border border-[#CBBFAF]/30">
                {t}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-6 pt-5 border-t border-[#CBBFAF]/40 text-[#8A8077]">
            <button className="flex items-center gap-2 text-[14px] font-medium hover:text-[#5B4A3E] transition-colors">
              <Heart size={18} strokeWidth={2} /> Support ({post.supportsCount})
            </button>
            <button className="flex items-center gap-2 text-[14px] font-medium hover:text-[#5B4A3E] transition-colors">
              <Bookmark size={18} strokeWidth={2} /> Save
            </button>
            <button className="flex items-center gap-2 text-[14px] font-medium hover:text-[#5B4A3E] transition-colors">
              <Share2 size={18} strokeWidth={2} /> Share
            </button>
          </div>
        </div>

        {/* Discussion Section */}
        <div className="bg-[#FFFFFF] p-8 rounded-[12px] border border-[#CBBFAF]/60 shadow-[0_2px_12px_rgba(91,74,62,0.04)]">
          <h3 className="text-[18px] font-semibold text-[#5B4A3E] mb-6">Discussion</h3>
          
          <div className="space-y-0 mb-8">
            {post.comments.map((comment, i) => (
              <div key={comment.id} className={`py-6 flex gap-4 ${i !== post.comments.length - 1 ? 'border-b border-[#CBBFAF]/40' : ''}`}>
                <div className="w-[36px] h-[36px] rounded-full bg-[#F6F2EB] text-[#5B4A3E] flex items-center justify-center font-semibold text-[13px] border border-[#CBBFAF]/40 shrink-0">
                  {comment.avatarInitials}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-[14px] mb-2">
                    <span className="font-semibold text-[#5B4A3E]">{comment.authorName}</span>
                    <span className="text-[#8A8077] hidden md:inline">·</span>
                    <span className="text-[#8A8077] text-[13px]">{comment.authorRole}</span>
                    <span className="text-[#8A8077] hidden md:inline">·</span>
                    <span className="text-[#8A8077] text-[13px]">{comment.timestamp}</span>
                  </div>
                  <p className="text-[15px] text-[#5B4A3E] leading-relaxed mb-3 whitespace-pre-wrap">
                    "{comment.content}"
                  </p>
                  <div className="flex items-center gap-5 text-[12px] font-medium text-[#8A8077]">
                    <button className="hover:text-[#5B4A3E] transition-colors flex items-center gap-1.5 uppercase tracking-wide">
                      Reply
                    </button>
                    <button className="hover:text-[#5B4A3E] transition-colors flex items-center gap-1.5 uppercase tracking-wide">
                      Support
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {post.comments.length === 0 && (
              <div className="text-center py-10 text-[#8A8077] text-[15px]">
                No comments yet. Be the first to share your thoughts.
              </div>
            )}
          </div>

          {/* Comment Box */}
          <div className="pt-6 border-t border-[#CBBFAF]/40">
            <label className="block text-[15px] font-semibold text-[#5B4A3E] mb-4">Write a response...</label>
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts, evidence or suggestions..."
              className="w-full p-4 border border-[#CBBFAF]/60 rounded-[8px] text-[15px] bg-[#F6F2EB]/40 focus:bg-[#FFFFFF] focus:outline-none focus:border-[#5B4A3E] text-[#5B4A3E] min-h-[100px] resize-y mb-4 placeholder-[#8A8077]/60 transition-colors shadow-sm"
            ></textarea>
            <div className="flex justify-end">
              <button 
                onClick={handlePostComment}
                disabled={!newComment.trim()}
                className="px-6 py-2.5 bg-[#5B4A3E] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#4A3A30] transition-colors disabled:opacity-50 shadow-sm"
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
