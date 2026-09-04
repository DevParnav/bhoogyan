"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { currentUser, initialPosts, Post } from '../projects/mockData';
import { MessageSquare, Heart, Bookmark, MapPin, Image as ImageIcon, Link as LinkIcon, ExternalLink } from 'lucide-react';

export default function Profile() {
  const router = useRouter();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState('Posts');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // New Post Form State
  const [newPostType, setNewPostType] = useState('Research Question');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostDesc, setNewPostDesc] = useState('');
  const [newPostLoc, setNewPostLoc] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [newPostLink, setNewPostLink] = useState('');

  useEffect(() => {
    const savedPosts = localStorage.getItem('bhoogyan_posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      setPosts(initialPosts);
    }
  }, []);

  const userPosts = posts.filter(p => p.authorId === currentUser.id || p.authorName === "Current User");

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostDesc.trim()) return;

    const newPost: Post = {
      id: `p${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      avatarInitials: currentUser.avatarInitials,
      location: newPostLoc || undefined,
      title: newPostTitle,
      description: newPostDesc,
      tags: [newPostType.split(' ')[0]],
      commentsCount: 0,
      supportsCount: 0,
      timestamp: "Just now",
      comments: [],
      imageUrl: newPostImage || undefined,
      linkUrl: newPostLink || undefined,
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('bhoogyan_posts', JSON.stringify(updatedPosts));
    
    // Reset & Close
    setNewPostTitle('');
    setNewPostDesc('');
    setNewPostLoc('');
    setNewPostImage('');
    setNewPostLink('');
    setShowCreateModal(false);
  };

  return (
    <div className="bg-[#F6F2EB] min-h-screen text-[#5B4A3E] font-sans selection:bg-[#F8DED4] pb-24">
      
      {/* Profile Header / Cover */}
      <div className="w-full bg-[#FFFFFF] border-b border-[#CBBFAF]/60 shadow-[0_2px_12px_rgba(91,74,62,0.03)] relative mb-8">
        
        {/* Cover Image Area */}
        <div className="h-[240px] w-full bg-[#CBBFAF]/30 relative overflow-hidden">
          {currentUser.coverImage ? (
            <img src={currentUser.coverImage} alt="Cover" className="w-full h-full object-cover opacity-80" />
          ) : (
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#CBBFAF 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
          )}
        </div>

        <div className="max-w-[850px] mx-auto px-6 pb-8 relative">
          
          {/* Avatar & Edit Profile Button */}
          <div className="flex justify-between items-end mt-[-50px] mb-4">
            <div className="w-[110px] h-[110px] rounded-full bg-[#FFFFFF] p-1.5 shadow-sm relative z-10">
              <div className="w-full h-full rounded-full bg-[#F6F2EB] flex items-center justify-center font-bold text-[32px] text-[#5B4A3E] border border-[#CBBFAF]/50">
                {currentUser.avatarInitials}
              </div>
            </div>
            <button className="px-5 py-2 border border-[#CBBFAF] text-[#5B4A3E] font-medium text-[14px] rounded-full hover:bg-[#F6F2EB] transition-colors mb-2">
              Edit Profile
            </button>
          </div>

          {/* Profile Info */}
          <div>
            <h1 className="text-[26px] font-bold text-[#5B4A3E] leading-tight">{currentUser.name}</h1>
            <p className="text-[15px] text-[#8A8077] mb-3">@{currentUser.username}</p>
            
            <div className="flex flex-wrap items-center gap-3 text-[14px] text-[#5B4A3E] font-medium mb-4">
              <span>{currentUser.role}</span>
              <span className="text-[#8A8077]">·</span>
              <span className="flex items-center gap-1 text-[#8A8077]"><MapPin size={14} /> {currentUser.location}</span>
              {currentUser.website && (
                <>
                  <span className="text-[#8A8077]">·</span>
                  <a href={`https://${currentUser.website}`} target="_blank" className="flex items-center gap-1 text-[#5B4A3E] hover:underline"><LinkIcon size={14} /> {currentUser.website}</a>
                </>
              )}
            </div>

            <p className="text-[15px] text-[#5B4A3E]/90 leading-relaxed max-w-[600px] mb-5">
              {currentUser.bio}
            </p>

            {currentUser.researchInterests && (
              <div className="mb-6">
                <p className="text-[12px] font-bold text-[#8A8077] uppercase tracking-widest mb-2">Research Interests</p>
                <div className="flex flex-wrap gap-2">
                  {currentUser.researchInterests.map(interest => (
                    <span key={interest} className="text-[13px] font-medium text-[#5B4A3E] bg-[#F6F2EB] border border-[#CBBFAF]/40 px-3 py-1.5 rounded-md">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-6 text-[14px]">
              <div><span className="font-bold text-[#5B4A3E]">{currentUser.stats.posts}</span> <span className="text-[#8A8077]">Posts</span></div>
              <div><span className="font-bold text-[#5B4A3E]">{currentUser.stats.replies}</span> <span className="text-[#8A8077]">Replies</span></div>
              <div><span className="font-bold text-[#5B4A3E]">{currentUser.stats.saved}</span> <span className="text-[#8A8077]">Saved Evidence</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[850px] mx-auto px-6">
        
        {/* Profile Tabs */}
        <div className="flex items-center gap-8 border-b border-[#CBBFAF]/60 mb-8">
          {['Posts', 'Replies', 'Media', 'Saved'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-[15px] font-medium transition-colors relative ${
                activeTab === tab ? 'text-[#5B4A3E]' : 'text-[#8A8077] hover:text-[#5B4A3E]'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#5B4A3E] rounded-t-sm"></span>
              )}
            </button>
          ))}
        </div>

        {/* Posts Content */}
        {activeTab === 'Posts' && (
          <div className="space-y-6">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-semibold text-[#5B4A3E]">My Posts</h2>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-[#5B4A3E] text-white px-5 py-2.5 rounded-lg text-[14px] font-medium hover:bg-[#4A3A30] transition-colors shadow-sm"
              >
                + Create Post
              </button>
            </div>

            {userPosts.length === 0 ? (
              <div className="bg-[#FFFFFF] p-12 rounded-[12px] border border-[#CBBFAF]/40 shadow-[0_2px_8px_rgba(91,74,62,0.02)] text-center">
                <p className="text-[#8A8077] text-[15px] mb-6">You haven't published any discussions yet.</p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-[#5B4A3E] text-white px-6 py-2.5 rounded-lg text-[14px] font-medium hover:bg-[#4A3A30] transition-colors"
                >
                  Create your first post
                </button>
              </div>
            ) : (
              userPosts.map(post => (
                <div 
                  key={post.id} 
                  onClick={() => router.push(`/projects/${post.id}`)}
                  className="bg-[#FFFFFF] p-6 rounded-[12px] border border-[#CBBFAF]/60 shadow-[0_2px_10px_rgba(91,74,62,0.03)] hover:shadow-[0_4px_16px_rgba(91,74,62,0.06)] hover:border-[#CBBFAF] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-[42px] h-[42px] rounded-full bg-[#F6F2EB] text-[#5B4A3E] flex items-center justify-center font-semibold text-[14px] border border-[#CBBFAF]/50">
                      {post.avatarInitials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#5B4A3E] text-[15px]">{post.authorName}</span>
                      </div>
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
                  
                  <h3 className="text-[20px] font-semibold text-[#5B4A3E] mb-3 group-hover:text-[#4A3A30] transition-colors leading-snug">{post.title}</h3>
                  <p className="text-[15px] text-[#5B4A3E]/90 mb-5 leading-relaxed line-clamp-3">{post.description}</p>
                  
                  {post.imageUrl && (
                    <div className="mb-5 rounded-[10px] overflow-hidden border border-[#CBBFAF]/40">
                      <img src={post.imageUrl} alt="Post Media" className="w-full aspect-[16/9] object-cover" />
                    </div>
                  )}

                  {post.linkUrl && (
                    <div className="mb-5 bg-[#F6F2EB]/50 p-4 rounded-lg border border-[#CBBFAF]/40 flex items-start gap-4 hover:bg-[#F6F2EB] transition-colors">
                      <div className="bg-[#FFFFFF] p-2.5 rounded-lg border border-[#CBBFAF]/40 shadow-sm shrink-0">
                        <ExternalLink size={20} className="text-[#5B4A3E]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#5B4A3E] text-[14px] leading-tight mb-1 truncate">{post.linkTitle || "Research Source"}</h4>
                        <p className="text-[13px] text-[#8A8077] line-clamp-1">{post.linkDesc || post.linkUrl}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-5">
                    {post.tags.map(t => (
                      <span key={t} className="text-[11px] font-semibold bg-[#F6F2EB] text-[#8A8077] px-2.5 py-1 rounded uppercase tracking-wider">
                        {t}
                      </span>
                    ))}
                    {post.location && (
                      <span className="text-[11px] font-semibold bg-[#F6F2EB] text-[#8A8077] px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                        <MapPin size={12} /> {post.location}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6 pt-4 border-t border-[#CBBFAF]/30 text-[#8A8077]">
                    <button className="flex items-center gap-1.5 text-[13px] font-medium hover:text-[#5B4A3E] transition-colors">
                      <Heart size={16} strokeWidth={2} /> {post.supportsCount} Support
                    </button>
                    <button className="flex items-center gap-1.5 text-[13px] font-medium hover:text-[#5B4A3E] transition-colors">
                      <MessageSquare size={16} strokeWidth={2} /> {post.commentsCount} Comments
                    </button>
                    <div className="flex-1"></div>
                    <button className="flex items-center gap-1.5 text-[13px] font-medium hover:text-[#5B4A3E] transition-colors">
                      <Bookmark size={16} strokeWidth={2} /> Save
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Post Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-[#5B4A3E]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#F6F2EB] rounded-[16px] shadow-[0_12px_40px_rgba(91,74,62,0.15)] border border-[#CBBFAF]/60 w-full max-w-[640px] max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
              
              <div className="p-7 border-b border-[#CBBFAF]/40 flex justify-between items-center bg-[#FFFFFF] rounded-t-[16px]">
                <div>
                  <h2 className="text-[22px] font-semibold text-[#5B4A3E]">Create a discussion</h2>
                  <p className="text-[14px] text-[#8A8077] mt-1">What would you like to discuss?</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="text-[#8A8077] hover:text-[#5B4A3E] text-2xl leading-none">&times;</button>
              </div>
              
              <div className="p-7 overflow-y-auto flex-1 space-y-6 bg-[#FFFFFF]">
                <div>
                  <label className="block text-[13px] font-semibold text-[#8A8077] uppercase tracking-wider mb-2">Post Type</label>
                  <select 
                    value={newPostType}
                    onChange={(e) => setNewPostType(e.target.value)}
                    className="w-full p-3.5 border border-[#CBBFAF]/60 rounded-[10px] text-[15px] bg-[#FFFFFF] focus:outline-none focus:border-[#5B4A3E] text-[#5B4A3E] shadow-sm transition-colors"
                  >
                    <option>Research Question</option>
                    <option>Policy Discussion</option>
                    <option>GIS Question</option>
                    <option>Land Governance</option>
                    <option>Insight</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[13px] font-semibold text-[#8A8077] uppercase tracking-wider mb-2">Title</label>
                  <input 
                    type="text" 
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="Summarize your question or idea..."
                    className="w-full p-3.5 border border-[#CBBFAF]/60 rounded-[10px] text-[15px] bg-[#FFFFFF] focus:outline-none focus:border-[#5B4A3E] text-[#5B4A3E] font-medium shadow-sm placeholder-[#8A8077]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#8A8077] uppercase tracking-wider mb-2">Description</label>
                  <textarea 
                    value={newPostDesc}
                    onChange={(e) => setNewPostDesc(e.target.value)}
                    placeholder="Provide more context, findings, or specific questions..."
                    className="w-full p-4 border border-[#CBBFAF]/60 rounded-[10px] text-[15px] bg-[#FFFFFF] focus:outline-none focus:border-[#5B4A3E] text-[#5B4A3E] min-h-[160px] resize-y shadow-sm placeholder-[#8A8077]/50 leading-relaxed transition-colors"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#8A8077] uppercase tracking-wider mb-2 flex items-center gap-1.5"><MapPin size={14}/> Location</label>
                    <input 
                      type="text" 
                      value={newPostLoc}
                      onChange={(e) => setNewPostLoc(e.target.value)}
                      placeholder="e.g. Pune, Maharashtra..."
                      className="w-full p-3.5 border border-[#CBBFAF]/60 rounded-[10px] text-[14px] bg-[#FFFFFF] focus:outline-none focus:border-[#5B4A3E] text-[#5B4A3E] shadow-sm placeholder-[#8A8077]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#8A8077] uppercase tracking-wider mb-2 flex items-center gap-1.5"><ImageIcon size={14}/> Image URL</label>
                    <input 
                      type="url" 
                      value={newPostImage}
                      onChange={(e) => setNewPostImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full p-3.5 border border-[#CBBFAF]/60 rounded-[10px] text-[14px] bg-[#FFFFFF] focus:outline-none focus:border-[#5B4A3E] text-[#5B4A3E] shadow-sm placeholder-[#8A8077]/50 transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-semibold text-[#8A8077] uppercase tracking-wider mb-2 flex items-center gap-1.5"><LinkIcon size={14}/> External Link</label>
                    <input 
                      type="url" 
                      value={newPostLink}
                      onChange={(e) => setNewPostLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full p-3.5 border border-[#CBBFAF]/60 rounded-[10px] text-[14px] bg-[#FFFFFF] focus:outline-none focus:border-[#5B4A3E] text-[#5B4A3E] shadow-sm placeholder-[#8A8077]/50 transition-colors"
                    />
                  </div>
                </div>

                {newPostImage && (
                  <div className="mt-6 rounded-[10px] overflow-hidden border border-[#CBBFAF]/40">
                    <img src={newPostImage} alt="Preview" className="w-full aspect-[16/9] object-cover" />
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-[#CBBFAF]/40 flex justify-end gap-4 bg-[#F6F2EB] rounded-b-[16px]">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 rounded-lg text-[15px] font-medium text-[#8A8077] hover:bg-[#CBBFAF]/20 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreatePost}
                  disabled={!newPostTitle.trim() || !newPostDesc.trim()}
                  className="px-8 py-2.5 bg-[#5B4A3E] text-white rounded-lg text-[15px] font-medium hover:bg-[#4A3A30] transition-colors disabled:opacity-50 shadow-sm"
                >
                  Publish
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
