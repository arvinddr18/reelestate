export const SAMPLE_FEED_DATA = [
  {
    id: '1', type: 'SOCIAL', size: 'large',
    user: { name: 'Gahana', handle: 'gahana', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' },
    post: { title: 'Purple Vibes 💜', description: 'Simple days, beautiful vibes and a happy soul ✨', time: '2h ago', location: 'Bangalore', tags: ['fashion', 'purple', 'ootd'], media: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop', stats: { likes: 128, comments: 23, shares: 5 } }
  },
  {
    id: '2', type: 'MOTORS', size: 'large', // Uses Marketplace Layout + Red Glow
    user: { name: 'Auto Elite', handle: 'autoelite', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop' },
    product: { title: 'BMW 3 Series M-Sport', description: 'Mint condition. First owner, fully serviced.', price: '₹45,00,000', time: '1h ago', location: 'Delhi', isLive: true, media: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=600&auto=format&fit=crop', metadata: { price: '₹45 Lakh', condition: 'Used', location: 'Delhi', security: 'Verified' } }
  },
  {
    id: '3', type: 'FASHION', size: 'large', // Uses Social Layout + Fuchsia Glow
    user: { name: 'Urban Threads', handle: 'urban.fashion', avatar: 'https://i.pravatar.cc/150?img=1' },
    post: { title: 'Summer Collection Drop', description: 'Lightweight linens and neon accents. Available now in the Market tab.', time: '3h ago', tags: ['summer', 'drip', 'style'], media: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop', stats: { likes: 342, comments: 45, shares: 12 } }
  },
  {
    id: '4', type: 'JOBS', size: 'large', // Uses Services Layout + Blue Glow
    user: { name: 'Tech Innovations', handle: 'tech.jobs', avatar: 'https://i.pravatar.cc/150?img=11' },
    service: { title: 'Senior React Developer Needed', description: 'Looking for a full-stack MERN dev to help build Super-Apps. Remote OK.', rate: '₹12L - ₹18L / yr', isLive: true }
  },
  {
    id: '5', type: 'TRAVEL', size: 'large', // Uses Social Layout + Sky Blue Glow
    user: { name: 'Travel Bug', handle: 'travel.with.k', avatar: 'https://i.pravatar.cc/150?img=7' },
    post: { title: 'Hidden gems in Bali 🌴', description: 'Found this unbelievable spot away from the tourist traps.', time: '5h ago', location: 'Bali, Indonesia', media: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=600&auto=format&fit=crop', stats: { likes: 530, comments: 89, shares: 22 } }
  },
  {
    id: '6', type: 'RENTS', size: 'large', // Uses Property Layout + Emerald Glow
    user: { name: 'House Hub', handle: 'househub', avatar: 'https://i.pravatar.cc/150?img=9' },
    property: { title: '2BHK Fully Furnished Studio', location: 'Koramangala, Bangalore', price: '₹35,000/mo', isLive: true, media: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=400&auto=format&fit=crop', specs: { type: '2 BHK', area: '950 sq.ft', status: 'Available', security: 'A+' } }
  },
  {
    id: '7', type: 'FOOD', size: 'large', // Uses Service Layout + Orange Glow
    user: { name: 'Taco Cartel', handle: 'tacos.blr', avatar: 'https://i.pravatar.cc/150?img=15' },
    service: { title: 'Midnight Taco Delivery', description: 'Craving late night food? We deliver fresh, hot Mexican street food until 3 AM.', rate: 'Starting ₹199', isLive: true }
  },
  {
    id: '8', type: 'EVENTS', size: 'small', // 🚨 Horizontal Scroller Event 1
    user: { name: 'Web3 Core', handle: 'web3bangalore', avatar: 'https://i.pravatar.cc/150?img=6' },
    event: { title: 'Web3 Meetup Bangalore', schedule: '25 May 2026 • 6:00 PM', media: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=400&auto=format&fit=crop', isLive: false }
  },
  {
    id: '9', type: 'EVENTS', size: 'small', // 🚨 Horizontal Scroller Event 2
    user: { name: 'Tech Startup', handle: 'startup.blr', avatar: 'https://i.pravatar.cc/150?img=12' },
    event: { title: 'Founders Mixer', schedule: '28 May 2026 • 7:00 PM', media: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=400&auto=format&fit=crop', isLive: true }
  },
  {
    id: '10', type: 'EVENTS', size: 'small', // 🚨 Horizontal Scroller Event 3
    user: { name: 'Live Music', handle: 'indie.live', avatar: 'https://i.pravatar.cc/150?img=14' },
    event: { title: 'Indie Rock Night', schedule: '30 May 2026 • 8:30 PM', media: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop', isLive: false }
  },
  {
    id: '11', type: 'SPORTS', size: 'large', // Uses Social Layout + Blue Glow
    user: { name: 'Goal Post', handle: 'football.news', avatar: 'https://i.pravatar.cc/150?img=33' },
    post: { title: 'Weekend League Highlights', description: 'What an incredible comeback in the final 10 minutes!', time: '1h ago', tags: ['football', 'sports', 'goals'], media: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop', stats: { likes: 890, comments: 120, shares: 50 } }
  },
  {
    id: '12', type: 'TECH', size: 'large', // Uses Marketplace Layout + Slate Glow
    user: { name: 'Gadget Freak', handle: 'gadget.freak', avatar: 'https://i.pravatar.cc/150?img=55' },
    product: { title: 'Custom Built Gaming PC', description: 'RTX 4080, i9 Processor, 64GB RAM. Built last month.', price: '₹2,10,000', time: '10h ago', location: 'Bangalore', isLive: false, media: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=600&auto=format&fit=crop', metadata: { price: '₹2.1 Lakh', condition: 'Like New', location: 'Indiranagar', security: 'Verified' } }
  }
];