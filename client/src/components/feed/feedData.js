export const SAMPLE_FEED_DATA = [
  // 1. SOCIAL (Social Layout)
  {
    id: '1', type: 'SOCIAL', size: 'large',
    user: { name: 'Gahana', handle: 'gahana', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' },
    post: { title: 'Purple Vibes 💜', description: 'Simple days, beautiful vibes and a happy soul ✨', time: '2h ago', location: 'Bangalore', tags: ['fashion', 'purple', 'ootd'], media: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop', stats: { likes: 128, comments: 23, shares: 5 } }
  },
  // 2. MOTORS (Marketplace Layout)
  {
    id: '2', type: 'MOTORS', size: 'large',
    user: { name: 'Auto Elite', handle: 'autoelite', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop' },
    product: { title: 'BMW 3 Series M-Sport', description: 'Mint condition. First owner, fully serviced.', price: '₹45,00,000', time: '1h ago', location: 'Delhi', isLive: true, media: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=600&auto=format&fit=crop', metadata: { price: '₹45 Lakh', condition: 'Used', location: 'Delhi', security: 'Verified' } }
  },
  // 3. FASHION (Social Layout)
  {
    id: '3', type: 'FASHION', size: 'large',
    user: { name: 'Urban Threads', handle: 'urban.fashion', avatar: 'https://i.pravatar.cc/150?img=1' },
    post: { title: 'Summer Collection Drop', description: 'Lightweight linens and neon accents. Available now in the Market tab.', time: '3h ago', tags: ['summer', 'drip', 'style'], media: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop', stats: { likes: 342, comments: 45, shares: 12 } }
  },
  // 4. JOBS (Services Layout)
  {
    id: '4', type: 'JOBS', size: 'large',
    user: { name: 'Tech Innovations', handle: 'tech.jobs', avatar: 'https://i.pravatar.cc/150?img=11' },
    service: { title: 'Senior React Developer Needed', description: 'Looking for a full-stack MERN dev to help build Super-Apps. Remote OK.', rate: '₹12L - ₹18L / yr', isLive: true }
  },
  // 5. TRAVEL (Social Layout)
  {
    id: '5', type: 'TRAVEL', size: 'large',
    user: { name: 'Travel Bug', handle: 'travel.with.k', avatar: 'https://i.pravatar.cc/150?img=7' },
    post: { title: 'Hidden gems in Bali 🌴', description: 'Found this unbelievable spot away from the tourist traps.', time: '5h ago', location: 'Bali, Indonesia', media: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=600&auto=format&fit=crop', stats: { likes: 530, comments: 89, shares: 22 } }
  },
  // 6. RENTS (Property Layout)
  {
    id: '6', type: 'RENTS', size: 'large',
    user: { name: 'House Hub', handle: 'househub', avatar: 'https://i.pravatar.cc/150?img=9' },
    property: { title: '2BHK Fully Furnished Studio', location: 'Koramangala, Bangalore', price: '₹35,000/mo', isLive: true, media: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=400&auto=format&fit=crop', specs: { type: '2 BHK', area: '950 sq.ft', status: 'Available', security: 'A+' } }
  },
  // 7. FOOD (Services Layout)
  {
    id: '7', type: 'FOOD', size: 'large',
    user: { name: 'Taco Cartel', handle: 'tacos.blr', avatar: 'https://i.pravatar.cc/150?img=15' },
    service: { title: 'Midnight Taco Delivery', description: 'Craving late night food? We deliver fresh, hot Mexican street food until 3 AM.', rate: 'Starting ₹199', isLive: true }
  },
  
  // 🎟️ --- HORIZONTAL SCROLL EVENTS ZONE --- 🎟️
  {
    id: '8', type: 'EVENTS', size: 'small', // Keeps it in the horizontal swipe!
    user: { name: 'Web3 Core', handle: 'web3bangalore', avatar: 'https://i.pravatar.cc/150?img=6' },
    event: { title: 'Web3 Meetup Bangalore', schedule: '25 May 2026 • 6:00 PM', media: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=400&auto=format&fit=crop', isLive: false }
  },
  {
    id: '9', type: 'EVENTS', size: 'small',
    user: { name: 'Tech Startup', handle: 'startup.blr', avatar: 'https://i.pravatar.cc/150?img=12' },
    event: { title: 'Founders Mixer', schedule: '28 May 2026 • 7:00 PM', media: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=400&auto=format&fit=crop', isLive: true }
  },
  {
    id: '10', type: 'EVENTS', size: 'small',
    user: { name: 'Live Music', handle: 'indie.live', avatar: 'https://i.pravatar.cc/150?img=14' },
    event: { title: 'Indie Rock Night', schedule: '30 May 2026 • 8:30 PM', media: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop', isLive: false }
  },
  // 🎟️ ------------------------------------ 🎟️

  // 11. SPORTS (Social Layout)
  {
    id: '11', type: 'SPORTS', size: 'large',
    user: { name: 'Goal Post', handle: 'football.news', avatar: 'https://i.pravatar.cc/150?img=33' },
    post: { title: 'Weekend League Highlights', description: 'What an incredible comeback in the final 10 minutes!', time: '1h ago', tags: ['football', 'sports', 'goals'], media: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop', stats: { likes: 890, comments: 120, shares: 50 } }
  },
  // 12. TECH (Marketplace Layout)
  {
    id: '12', type: 'TECH', size: 'large',
    user: { name: 'Gadget Freak', handle: 'gadget.freak', avatar: 'https://i.pravatar.cc/150?img=55' },
    product: { title: 'Custom Built Gaming PC', description: 'RTX 4080, i9 Processor, 64GB RAM. Built last month.', price: '₹2,10,000', time: '10h ago', location: 'Bangalore', isLive: false, media: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=600&auto=format&fit=crop', metadata: { price: '₹2.1 Lakh', condition: 'Like New', location: 'Indiranagar', security: 'Verified' } }
  },
  // 13. SALE_HUB (Marketplace Layout)
  {
    id: '13', type: 'SALE_HUB', size: 'large',
    user: { name: 'Node Traders', handle: 'nodetraders', avatar: 'https://i.pravatar.cc/150?img=44' },
    product: { title: 'Herman Miller Aeron Chair', description: 'Ergonomic office chair. Barely used, moving out sale.', price: '₹42,000', time: '2h ago', location: 'Mumbai', isLive: false, media: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=600&auto=format&fit=crop', metadata: { price: '₹42K', condition: 'Excellent', location: 'Bandra', security: 'Shielded' } }
  },
  // 14. PGS (Property Layout)
  {
    id: '14', type: 'PGS', size: 'large',
    user: { name: 'CoLive Spaces', handle: 'colive.blr', avatar: 'https://i.pravatar.cc/150?img=47' },
    property: { title: 'Premium Tech-Park Co-Living', location: 'HSR Layout, Bangalore', price: '₹14,500/mo', isLive: true, media: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&auto=format&fit=crop', specs: { type: 'Single', area: 'Food Incl.', status: '2 Beds Left', security: 'Verified' } }
  },
  // 15. SERVICES (Services Layout)
  {
    id: '15', type: 'SERVICES', size: 'large',
    user: { name: 'Neha Design', handle: 'design.by.neha', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop' },
    service: { title: 'Freelance UI/UX Designer', description: 'I specialize in high-end spatial UI and glassmorphism web apps.', rate: '₹2,500 / hr', isLive: false }
  },
  // 16. EDUCATION (Services Layout)
  {
    id: '16', type: 'EDUCATION', size: 'large',
    user: { name: 'Dev Mastery', handle: 'dev.mastery', avatar: 'https://i.pravatar.cc/150?img=68' },
    service: { title: 'System Design Interview Cohort', description: '4-week intensive bootcamp covering scalable architecture for FAANG interviews.', rate: '₹12,000 Total', isLive: true }
  },
  // 17. MARKETPLACE (Marketplace Layout)
  {
    id: '17', type: 'MARKETPLACE', size: 'large',
    user: { name: 'SneakerHead', handle: 'kicks', avatar: 'https://i.pravatar.cc/150?img=4' },
    product: { title: 'Nike Air Force 1 \'07 White', description: 'Brand new in box. Size UK 9.', price: '₹8,499', time: '5h ago', location: 'Delhi', isLive: true, media: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop', metadata: { price: '₹8,499', condition: 'New', location: 'Delhi', security: 'Shielded' } }
  },
  // 18. CINEMA (Social Layout)
  {
    id: '18', type: 'CINEMA', size: 'large',
    user: { name: 'Cinephile', handle: 'movies.daily', avatar: 'https://i.pravatar.cc/150?img=32' },
    post: { title: 'Dune: Part Two IMAX Review', description: 'Absolutely breathtaking visuals. A monumental sci-fi achievement.', time: '12h ago', tags: ['movies', 'dune', 'cinema'], media: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop', stats: { likes: 1204, comments: 340, shares: 89 } }
  },
  // 19. FITNESS (Social Layout)
  {
    id: '19', type: 'FITNESS', size: 'large',
    user: { name: 'Iron Temple', handle: 'iron.temple', avatar: 'https://i.pravatar.cc/150?img=59' },
    post: { title: 'New 200kg Deadlift PR! 🏋️‍♂️', description: 'Months of hard work finally paying off. Consistency is everything.', time: '1d ago', tags: ['fitness', 'gym', 'gains'], media: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop', stats: { likes: 892, comments: 45, shares: 12 } }
  },
  // 20. BEAUTY (Social Layout)
  {
    id: '20', type: 'BEAUTY', size: 'large',
    user: { name: 'Glow Up', handle: 'glow.daily', avatar: 'https://i.pravatar.cc/150?img=41' },
    post: { title: '5-Step Glass Skin Routine', description: 'My holy grail products for that flawless glowing aesthetic. ✨', time: '2d ago', tags: ['skincare', 'beauty', 'glow'], media: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop', stats: { likes: 2100, comments: 180, shares: 450 } }
  },
  // 21. PETS (Social Layout)
  {
    id: '21', type: 'PETS', size: 'large',
    user: { name: 'Paws & Play', handle: 'paws.blr', avatar: 'https://i.pravatar.cc/150?img=65' },
    post: { title: 'Golden Retriever Puppies! 🐶', description: 'Had the absolute best day at the dog park today.', time: '3d ago', tags: ['dogs', 'pets', 'cute'], media: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop', stats: { likes: 4500, comments: 890, shares: 1200 } }
  },
  // 22. KIDS (Social Layout)
  {
    id: '22', type: 'KIDS', size: 'large',
    user: { name: 'Little Nodes', handle: 'little.nodes', avatar: 'https://i.pravatar.cc/150?img=19' },
    post: { title: 'Montessori Wooden Toys', description: 'Sustainable, non-toxic educational toys for toddlers. Now in stock!', time: '4d ago', tags: ['kids', 'toys', 'parenting'], media: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=600&auto=format&fit=crop', stats: { likes: 340, comments: 21, shares: 8 } }
  }
];