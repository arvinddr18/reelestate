export const SAMPLE_FEED_DATA = [
  {
    id: '1', type: 'SOCIAL', size: 'large', // 👈 LARGE
    user: { name: 'Gahana', handle: 'gahana', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' },
    post: { title: 'Purple Vibes 💜', description: 'Simple days, beautiful vibes and a happy soul ✨', time: '2h ago', location: 'Bangalore', tags: ['fashion', 'purple', 'ootd'], media: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop', stats: { likes: 128, comments: 23, shares: 5 } }
  },
  {
    id: '2', type: 'MARKETPLACE', size: 'large', // 👈 LARGE
    user: { name: 'Rohit Verma', handle: 'rohitv', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop' },
    product: { title: 'MacBook Pro M2 (16-inch, 512GB)', description: 'Excellent condition. Used for design work. With original box.', price: '₹1,45,000', time: '4h ago', location: 'Delhi', isLive: true, media: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop', metadata: { price: '₹1.45 Lakh', condition: 'Excellent', location: 'Delhi, India', security: 'Shielded' } }
  },
  {
    id: '3', type: 'SOCIAL', size: 'large', // 👈 CHANGED TO LARGE
    user: { name: 'Mindful Me', handle: 'mindful_me', avatar: 'https://i.pravatar.cc/150?img=1' },
    post: { title: 'Just a reminder:', description: 'You\'re doing better than you think you are. 💜', time: '1h ago', stats: { likes: 68, comments: 12 } }
  },
  {
    id: '4', type: 'REAL_ESTATE', size: 'large', // 👈 CHANGED TO LARGE
    user: { name: 'House Hub', handle: 'househub', avatar: 'https://i.pravatar.cc/150?img=11' },
    property: { title: '3BHK Luxury Apartment', location: 'Whitefield, Bangalore', price: '₹2.35 Cr', isLive: true, media: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=400&auto=format&fit=crop', specs: { type: '3 BHK', area: '1850 sq.ft', status: 'Ready', security: 'A+' } }
  },
  {
    id: '6', type: 'MARKETPLACE', size: 'large', // 👈 CHANGED TO LARGE
    user: { name: 'SneakerHead', handle: 'kicks', avatar: 'https://i.pravatar.cc/150?img=4' },
    product: { title: 'Nike Air Force 1 \'07 White', price: '₹8,499', isLive: true, media: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=400&auto=format&fit=crop', metadata: { price: '₹8,499', condition: 'New', location: 'Mumbai', security: 'Verified' } }
  },
  {
    id: '7', type: 'SERVICES', size: 'large', // 👈 CHANGED TO LARGE
    user: { name: 'Neha Design', handle: 'design.by.neha', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop' },
    service: { title: 'Need a UI/UX Designer?', description: 'I can help design premium glassmorphism interfaces!', rate: '₹2,500 / hr', isLive: false }
  },
  {
    id: '8', type: 'EVENTS', size: 'small', // 🚨 KEPT SMALL FOR THE HORIZONTAL SWIPE
    user: { name: 'Web3 Core', handle: 'web3bangalore', avatar: 'https://i.pravatar.cc/150?img=6' },
    event: { title: 'Web3 Meetup Bangalore', schedule: '25 May 2026 • 6:00 PM Onwards', media: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=400&auto=format&fit=crop', isLive: false }
  },
  {
    id: '10', type: 'EVENTS', size: 'small', // 🚨 KEPT SMALL FOR THE HORIZONTAL SWIPE
    user: { name: 'Tech Startup', handle: 'startup.blr', avatar: 'https://i.pravatar.cc/150?img=12' },
    event: { title: 'Founders Mixer', schedule: '28 May 2026 • 7:00 PM', media: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=400&auto=format&fit=crop', isLive: true }
  },
  {
    id: '11', type: 'EVENTS', size: 'small', // 🚨 KEPT SMALL FOR THE HORIZONTAL SWIPE
    user: { name: 'Live Music', handle: 'indie.live', avatar: 'https://i.pravatar.cc/150?img=15' },
    event: { title: 'Indie Rock Night', schedule: '30 May 2026 • 8:30 PM', media: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop', isLive: false }
  },
  {
    id: '9', type: 'SOCIAL', size: 'large', // 👈 CHANGED TO LARGE
    user: { name: 'Travel Bug', handle: 'travel.with.k', avatar: 'https://i.pravatar.cc/150?img=7' },
    post: { title: 'Sunsets never get old. 🌅', time: '5h ago', location: 'Goa', media: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop', stats: { likes: 53, comments: 9, shares: 2 } }
  }
];