import React from 'react';
import { motion } from 'framer-motion';
import { IoMdMore } from 'react-icons/io';
import FeedCardWrapper from './FeedCardWrapper';
import CategoryBadge from './CategoryBadge';
import ActionButtons from './ActionButtons';

export default function SocialCard({ data, onAction }) {
  const { user, post } = data;
  return (
    <FeedCardWrapper variant="SOCIAL">
      <div className="flex flex-col gap-4 w-full h-full justify-between">
        <div className="flex items-center justify-between w-full">
          <CategoryBadge type="SOCIAL" isLive={post.isLive} />
          <button className="text-gray-400 hover:text-white"><IoMdMore size={20} /></button>
        </div>
        <div className="flex flex-col md:flex-row gap-5 items-start justify-between w-full h-full">
          <div className="flex flex-col flex-1 justify-between h-full min-w-0 w-full">
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full p-[1px] bg-gradient-to-tr from-purple-500 to-indigo-500"><img src={user.avatar} className="w-full h-full rounded-full object-cover" /></div>
                <div className="flex flex-col min-w-0"><span className="text-white font-black text-sm">{user.name}</span><span className="text-gray-500 text-xs">@{user.handle} • {post.time}</span></div>
              </div>
              <h3 className="text-white font-black text-lg md:text-xl">“{post.title}”</h3>
              <p className="text-gray-400 text-xs md:text-sm">{post.description}</p>
            </div>
            <div className="flex flex-col gap-3 mt-4 w-full">
              <ActionButtons variant="SOCIAL" onAction={onAction} />
            </div>
          </div>
          {post.media && (
            <div className="w-full md:w-[42%] aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden relative shadow-[0_0_30px_rgba(168,85,247,0.2)] border border-purple-500/20 shrink-0">
              <motion.img whileHover={{ scale: 1.06 }} src={post.media} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </FeedCardWrapper>
  );
}