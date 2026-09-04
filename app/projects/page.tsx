"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { initialPosts, Post, currentUser } from './mockData';
import { MessageSquare, Heart, Bookmark, MapPin, Search, ExternalLink } from 'lucide-react';

export default function Projects() {
  const router = useRouter();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const savedPosts = localStorage.getItem('bhoogyan_posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      setPosts(initialPosts);
      localStorage.setItem('bhoogyan_posts', JSON.stringify(initialPosts));
    }
  }, []);

  const filteredPosts = posts.filter(p => {
    const matchesFilter = filter === 'All' || p.tags.includes(filter) || p.title.includes(filter);
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-[#F6F2EB] min-h-screen text-[#5B4A3E] font-sans selection:bg-[#F8DED4] pb-20">
      
      {/* Top Header */}
      <div className="max-w-[1000px] mx-auto px-6 pt-12">
        <div className="flex justify-between items-start mb-6">
          <div>
            <nav className="flex items-center space-x-2 text-[12px] text-[#8A8077] mb-3 uppercase tracking-widest font-semibold">
              <Link href="/" className="hover:text-[#5B4A3E] transition-colors">BhooGyan</Link>
              <span>/</span>
              <span className="text-[#5B4A3E]">Projects</span>
              <span>/</span>
              <span className="text-[#5B4A3E]">Discussion</span>
            </nav>
            <h1 className="text-[28px] font-semibold text-[#5B4A3E] mb-2 leading-tight">Projects / Discussion</h1>
            <p className="text-[16px] text-[#8A8077] font-light">Collaborate, discuss and solve land-governance problems together.</p>
          </div>
          <div>
            <Link 
              href="/profile" 
              className="w-[44px] h-[44px] rounded-full bg-[#FFFFFF] text-[#5B4A3E] flex items-center justify-center font-bold text-[15px] border border-[#CBBFAF]/80 hover:border-[#5B4A3E] shadow-sm transition-all"
            >
              {currentUser.avatarInitials}
            </Link>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-12">
          <div className="relative w-full max-w-[800px] mb-4">
            <input 
              type="text" 
              placeholder="Search discussions, research questions and projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 border border-[#CBBFAF]/80 rounded-[10px] text-[15px] bg-[#FFFFFF] focus:outline-none focus:border-[#5B4A3E] text-[#5B4A3E] placeholder-[#8A8077] shadow-[0_2px_8px_rgba(91,74,62,0.03)] transition-colors"
            />
            <Search className="absolute left-4 top-4 text-[#8A8077]" size={18} />
          </div>
          <div className="flex gap-2 overflow-x-auto w-full pb-2 no-scrollbar">
            {['All', 'Research', 'Policy', 'GIS', 'Land', 'Climate'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors border ${
                  filter === f 
                    ? 'bg-[#5B4A3E] text-[#FFFFFF] border-[#5B4A3E]' 
                    : 'bg-[#FFFFFF] text-[#8A8077] border-[#CBBFAF]/60 hover:text-[#5B4A3E] hover:border-[#CBBFAF]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-[1000px] mx-auto px-6 flex flex-col lg:flex-row gap-10 items-start">
        
        {/* Main Feed */}
        <div className="w-full lg:max-w-[700px] space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[#8A8077] text-[15px]">No discussions found matching your criteria.</p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <div 
                key={post.id} 
                onClick={() => router.push(`/projects/${post.id}`)}
                className="bg-[#FFFFFF] p-6 rounded-[12px] border border-[#CBBFAF]/60 shadow-[0_2px_10px_rgba(91,74,62,0.03)] hover:shadow-[0_4px_16px_rgba(91,74,62,0.06)] hover:border-[#CBBFAF] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 mb-5">
                  <div 
                    onClick={(e) => { e.stopPropagation(); router.push('/profile'); }}
                    className="w-[42px] h-[42px] rounded-full bg-[#F6F2EB] text-[#5B4A3E] flex items-center justify-center font-semibold text-[14px] border border-[#CBBFAF]/50 hover:bg-[#F8DED4] transition-colors"
                  >
                    {post.avatarInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span 
                        onClick={(e) => { e.stopPropagation(); router.push('/profile'); }}
                        className="font-semibold text-[#5B4A3E] text-[15px] hover:underline"
                      >
                        {post.authorName}
                      </span>
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
                <p className="text-[15px] text-[#5B4A3E]/90 mb-5 leading-relaxed line-clamp-4">{post.description}</p>
                
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

        {/* Right Sidebar (Hidden on mobile) */}
        <div className="hidden lg:block w-[260px] sticky top-8 space-y-8">
          
          <div>
            <h3 className="text-[11px] font-bold text-[#8A8077] uppercase tracking-widest mb-4">Research Community</h3>
            <ul className="text-[13px] space-y-3 text-[#5B4A3E]">
              <li className="flex justify-between items-center bg-[#FFFFFF] p-3 rounded-lg border border-[#CBBFAF]/40 shadow-sm">
                <span className="text-[#8A8077]">Discussions</span><span className="font-semibold text-[#5B4A3E]">1,248</span>
              </li>
              <li className="flex justify-between items-center bg-[#FFFFFF] p-3 rounded-lg border border-[#CBBFAF]/40 shadow-sm">
                <span className="text-[#8A8077]">Researchers</span><span className="font-semibold text-[#5B4A3E]">326</span>
              </li>
              <li className="flex justify-between items-center bg-[#FFFFFF] p-3 rounded-lg border border-[#CBBFAF]/40 shadow-sm">
                <span className="text-[#8A8077]">Policy Experts</span><span className="font-semibold text-[#5B4A3E]">87</span>
              </li>
              <li className="flex justify-between items-center bg-[#FFFFFF] p-3 rounded-lg border border-[#CBBFAF]/40 shadow-sm">
                <span className="text-[#8A8077]">GIS Specialists</span><span className="font-semibold text-[#5B4A3E]">64</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-[#8A8077] uppercase tracking-widest mb-3">Trending Topics</h3>
            <div className="flex flex-wrap gap-2">
              {['Land Governance', 'Agriculture', 'GIS', 'Remote Sensing', 'Policy'].map(t => (
                <span key={t} className="text-[12px] font-medium text-[#5B4A3E] bg-[#FFFFFF] px-3 py-1.5 rounded-full hover:bg-[#F8DED4]/50 transition-colors cursor-pointer border border-[#CBBFAF]/40">
                  {t}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
