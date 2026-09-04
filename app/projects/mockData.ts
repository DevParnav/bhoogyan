export type Role = 'Researcher' | 'Academic' | 'Policymaker' | 'Government Official' | 'GIS / Domain Expert' | 'Student' | 'Other';

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  location: string;
  bio: string;
  avatarInitials: string;
  coverImage?: string;
  website?: string;
  researchInterests?: string[];
  stats: {
    posts: number;
    replies: number;
    saved: number;
  };
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  avatarInitials: string;
  content: string;
  timestamp: string;
  replies?: Comment[];
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  avatarInitials: string;
  location?: string;
  title: string;
  description: string;
  tags: string[];
  commentsCount: number;
  supportsCount: number;
  timestamp: string;
  comments: Comment[];
  imageUrl?: string;
  linkUrl?: string;
  linkTitle?: string;
  linkDesc?: string;
}

export const mockUsers: Record<string, User> = {
  "u1": {
    id: "u1",
    name: "Parnav Sharma",
    username: "parnav",
    role: "Researcher",
    location: "Pune, Maharashtra",
    bio: "Interested in land governance, GIS and evidence-based policy research.",
    avatarInitials: "PS",
    coverImage: "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=2000&auto=format&fit=crop",
    website: "bhoogyan.org/parnav",
    researchInterests: ["Land Governance", "GIS", "Agriculture", "Remote Sensing"],
    stats: {
      posts: 24,
      replies: 86,
      saved: 12
    }
  },
  "u2": {
    id: "u2",
    name: "Priya Sharma",
    username: "priyasharma",
    role: "Researcher",
    location: "Pune, Maharashtra",
    bio: "Focused on agricultural conversion patterns.",
    avatarInitials: "PS",
    stats: { posts: 14, replies: 32, saved: 5 }
  },
  "u3": {
    id: "u3",
    name: "Rahul Mehta",
    username: "rahulgis",
    role: "GIS / Domain Expert",
    location: "Maharashtra",
    bio: "Spatial data analysis and remote sensing.",
    avatarInitials: "RM",
    stats: { posts: 8, replies: 45, saved: 18 }
  },
  "u4": {
    id: "u4",
    name: "Ananya Singh",
    username: "ananyapolicy",
    role: "Policymaker",
    location: "Mumbai",
    bio: "Policy innovation for eco-sensitive zones.",
    avatarInitials: "AS",
    stats: { posts: 11, replies: 19, saved: 33 }
  }
};

export const currentUser = mockUsers["u1"];

export const initialPosts: Post[] = [
  {
    id: "p1",
    authorId: "u2",
    authorName: "Priya Sharma",
    authorRole: "Researcher",
    avatarInitials: "PS",
    location: "Mulshi, Pune",
    title: "How can we reduce agricultural land conversion around Mulshi?",
    description: "Looking for research-backed approaches to understand the drivers of agricultural land conversion and possible policy interventions.",
    tags: ["Research", "Land Governance"],
    commentsCount: 3,
    supportsCount: 14,
    timestamp: "2h",
    comments: [
      {
        id: "c1",
        authorId: "u3",
        authorName: "Rahul Mehta",
        authorRole: "GIS / Domain Expert",
        avatarInitials: "RM",
        content: "I would compare historical land-use layers with road expansion to identify possible drivers.",
        timestamp: "1h",
      },
      {
        id: "c2",
        authorId: "u4",
        authorName: "Ananya Singh",
        authorRole: "Policymaker",
        avatarInitials: "AS",
        content: "There may also be a zoning-policy angle worth testing.",
        timestamp: "45m",
      }
    ]
  },
  {
    id: "p2",
    authorId: "u3",
    authorName: "Rahul Mehta",
    authorRole: "GIS / Domain Expert",
    avatarInitials: "RM",
    location: "Maharashtra",
    title: "Need help interpreting this land-use change map",
    description: "Comparing agricultural and built-up expansion between two time periods. Looking for feedback on the analysis. Specifically seeing weird artifacts near the riparian zone.",
    tags: ["GIS", "Land"],
    commentsCount: 1,
    supportsCount: 8,
    timestamp: "5h",
    imageUrl: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1600&auto=format&fit=crop",
    comments: []
  },
  {
    id: "p3",
    authorId: "u4",
    authorName: "Ananya Singh",
    authorRole: "Policymaker",
    avatarInitials: "AS",
    title: "Policy approaches for protecting high-value agricultural land",
    description: "What TDR (Transfer of Development Rights) frameworks have worked in other eco-sensitive zones in Maharashtra? Looking to build a comparative baseline.",
    tags: ["Policy", "Agriculture"],
    commentsCount: 0,
    supportsCount: 22,
    timestamp: "1d",
    linkUrl: "https://example.com/tdr-policy",
    linkTitle: "Agricultural Land Use Change in Maharashtra",
    linkDesc: "Official documentation on Transfer of Development Rights and eco-sensitive zones.",
    comments: []
  }
];
