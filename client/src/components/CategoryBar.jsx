import React from 'react';

// This is the list of your categories with icons
const categories = [
  { name: 'All', icon: '🌐' },
  { name: 'Sale Hub', icon: '🏡' },
  { name: 'Hotels', icon: '🏨' },
  { name: 'Rents', icon: '🔑' },
  { name: 'Education', icon: '📚' },
  { name: 'Resorts', icon: '🌴' },
  { name: 'Cook', icon: '👨‍🍳' },
  { name: 'Sports', icon: '⚽' },
  { name: 'Gym', icon: '💪' },
  { name: 'Agri', icon: '🚜' },
  { name: 'Cinema', icon: '🎬' }
];

const CategoryBar = ({ onSelect, activeCategory }) => {
  return (
    <div className="w-full bg-black py-4 border-b border-zinc-900 overflow-hidden">
      {/* This div allows horizontal scrolling like Instagram Stories */}
      <div className="flex overflow-x-auto gap-5 px-4 no-scrollbar">
        {categories.map((cat) => (
          <div 
            key={cat.name}
            onClick={() => onSelect(cat.name)}
            className="flex flex-col items-center min-w-[70px] cursor-pointer"
          >
            {/* The Glowing Circle */}
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl border-2 transition-all ${
              activeCategory === cat.name 
              ? 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] bg-zinc-800' 
              : 'border-zinc-700 bg-zinc-900'
            }`}>
              {cat.name === 'Sale Hub' ? '🏡' : cat.icon}
            </div>
            {/* The Text Label */}
            <span className={`text-[10px] mt-2 font-bold uppercase ${
              activeCategory === cat.name ? 'text-orange-500' : 'text-zinc-500'
            }`}>
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;