import React from 'react';
import { motion } from 'framer-motion';
import { IoMdMore } from 'react-icons/io';
import FeedCardWrapper from './FeedCardWrapper';
import CategoryBadge from './CategoryBadge';
import ActionButtons from './ActionButtons';

export default function SocialCard({ data, onAction }) {
  const { user, post, size } = data;
  const isGridItem = size === 'small';

  return (
    <FeedCardWrapper variant="SOCIAL" size={size}>
      <div className="flex flex-col gap-4 w-full h-full justify-between">
        <div className="flex items-center justify-between w-full">
          <CategoryBadge type="SOCIAL" isLive={post.isLive} />
          <button className="text-gray-400 hover:text-white"><IoMdMore size={20} /></button>
        </div>
        
        {/* 🚨 DYNAMIC LAYOUT: Side-by-side if large, stacked if small */}
        <div className={`flex ${isGridItem ? 'flex-col' : 'flex-col md:flex-row'} gap-8 items-start justify-between w-full h-full mt-2`}>
          
          <div className="flex flex-col flex-1 justify-between h-full min-w-0 w-full">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center gap-3">
                <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border border-purple-500/30" alt="" />
                <div className="flex flex-col min-w-0">
                  <span className="text-white font-black text-base">{user.name}</span>
                  <span className="text-gray-500 text-xs">@{user.handle} • {post.time} {post.location && `• 📍 ${post.location}`}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-2">
                <h3 className="text-white font-black text-2xl tracking-tight">“{post.title}”</h3>
                {post.description && <p className="text-gray-300 text-sm leading-relaxed">{post.description}</p>}
              </div>

              {!isGridItem && (
                <div className="flex flex-col gap-3 mt-2">
                  
                  {/* 🎵 EXTRA SOCIAL CONTEXT: Music & Tagged Users 👤 */}
                  {(post.music || (post.taggedUsers && post.taggedUsers.length > 0)) && (
                    <div className="flex flex-wrap gap-2">
                      {post.music && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151A25]/80 border border-white/5 backdrop-blur-md">
                          <span className="text-purple-400 animate-pulse">🎵</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{post.music}</span>
                        </div>
                      )}
                      {post.taggedUsers && post.taggedUsers.length > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151A25]/80 border border-white/5 backdrop-blur-md">
                          <span className="text-indigo-400">👤</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                            {post.taggedUsers.length} Tagged
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* HASHTAGS */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] uppercase font-black tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isGridItem && (
              <div className="flex flex-col gap-4 mt-8 w-full">
                <div className="flex items-center gap-5 text-sm font-bold text-gray-400">
                  <span className="flex items-center gap-2 hover:text-purple-400 cursor-pointer transition-colors"><span className="text-red-500">❤️</span> {post.stats?.likes}</span>
                  <span className="flex items-center gap-2 hover:text-purple-400 cursor-pointer transition-colors">💬 {post.stats?.comments}</span>
                  <span className="flex items-center gap-2 hover:text-purple-400 cursor-pointer transition-colors">🚀 {post.stats?.shares}</span>
                </div>
                <ActionButtons variant="SOCIAL" onAction={onAction} />
              </div>
            )}
          </div>

          {post.media && (
            <div className={`${isGridItem ? 'w-full aspect-video' : 'w-full md:w-[50%] lg:w-[45%] aspect-square md:aspect-auto md:h-full'} rounded-[2rem] overflow-hidden relative shadow-[0_0_60px_rgba(168,85,247,0.25)] border-[3px] border-purple-500/40 shrink-0`}>
              <div className="absolute inset-0 bg-purple-500/20 mix-blend-overlay z-10 pointer-events-none" />
              <motion.img whileHover={{ scale: 1.05 }} transition={{ duration: 0.7 }} src={post.media} className="w-full h-full object-cover" />
            </div>
          )}

          {isGridItem && (
            <div className="flex items-center gap-4 text-xs font-bold text-gray-500 mt-auto pt-4 border-t border-white/5 w-full">
              <span className="flex items-center gap-1.5"><span className="text-red-500">❤️</span> {post.stats?.likes}</span>
              <span className="flex items-center gap-1.5">💬 {post.stats?.comments}</span>
            </div>
          )}
        </div>
      </div>
    </FeedCardWrapper>
  );
}