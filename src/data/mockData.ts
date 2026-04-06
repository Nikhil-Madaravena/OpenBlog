export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  tags: string[];
  status: "published" | "draft" | "archived" | "scheduled";
  views: number;
  readTime: number;
  createdAt: string;
  updatedAt: string;
}

export const mockPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Future of Web Development in 2026",
    excerpt: "Exploring the latest trends and technologies shaping the web development landscape this year.",
    content: `The web development landscape continues to evolve at a breathtaking pace. In 2026, we're seeing several key trends that are reshaping how we build for the web.\n\n## AI-Assisted Development\n\nAI tools have become indispensable companions for developers. From code completion to entire component generation, AI is augmenting—not replacing—human creativity.\n\n## Edge Computing\n\nWith edge computing becoming mainstream, applications are faster than ever. Content is served from locations closest to users, dramatically reducing latency.\n\n## Web Components Maturity\n\nWeb components have finally reached mainstream adoption, enabling truly framework-agnostic component libraries that work everywhere.`,
    coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop",
    author: { id: "u1", name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face" },
    tags: ["Web Dev", "Technology", "Trends"],
    status: "published",
    views: 4560,
    readTime: 8,
    createdAt: "2026-03-15",
    updatedAt: "2026-03-15",
  },
  {
    id: "2",
    title: "Mastering TypeScript: Advanced Patterns",
    excerpt: "Deep dive into advanced TypeScript patterns that will level up your code quality and developer experience.",
    content: `TypeScript has become the de facto standard for large-scale JavaScript applications. Let's explore some advanced patterns that can make your code more robust and maintainable.\n\n## Branded Types\n\nBranded types allow you to create distinct types from primitives, preventing accidental mixing of values.\n\n## Template Literal Types\n\nTemplate literal types enable string manipulation at the type level, opening doors to powerful type-safe APIs.`,
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
    author: { id: "u2", name: "Marcus Williams", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
    tags: ["TypeScript", "Programming"],
    status: "published",
    views: 3200,
    readTime: 12,
    createdAt: "2026-03-10",
    updatedAt: "2026-03-12",
  },
  {
    id: "3",
    title: "Design Systems That Scale",
    excerpt: "How to build and maintain design systems that grow with your organization.",
    content: `Building a design system is one thing. Making it scale across teams and products is another challenge entirely.\n\n## Start with Tokens\n\nDesign tokens are the foundation. Colors, spacing, typography—define them once, use them everywhere.\n\n## Component Architecture\n\nA well-architected component library uses composition patterns that make components flexible without being complex.`,
    coverImage: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=400&fit=crop",
    author: { id: "u3", name: "Elena Rodriguez", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" },
    tags: ["Design", "UI/UX"],
    status: "draft",
    views: 0,
    readTime: 6,
    createdAt: "2026-03-20",
    updatedAt: "2026-03-22",
  },
  {
    id: "4",
    title: "Remote Work Best Practices for Developers",
    excerpt: "Proven strategies for staying productive and connected while working remotely.",
    content: `Remote work is here to stay. After years of refinement, here are the practices that truly work for development teams.`,
    coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop",
    author: { id: "u1", name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face" },
    tags: ["Remote Work", "Productivity"],
    status: "published",
    views: 2100,
    readTime: 5,
    createdAt: "2026-02-28",
    updatedAt: "2026-02-28",
  },
  {
    id: "5",
    title: "Building Accessible Web Applications",
    excerpt: "A comprehensive guide to making your web applications accessible to everyone.",
    content: `Web accessibility isn't just a nice-to-have—it's essential. Let's explore how to build truly inclusive experiences.`,
    coverImage: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=400&fit=crop",
    author: { id: "u2", name: "Marcus Williams", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
    tags: ["Accessibility", "Web Dev"],
    status: "scheduled",
    views: 0,
    readTime: 10,
    createdAt: "2026-04-01",
    updatedAt: "2026-04-01",
  },
  {
    id: "6",
    title: "The Art of Clean Code",
    excerpt: "Writing code that other developers actually enjoy reading and maintaining.",
    content: `Clean code is an investment that pays dividends over the lifetime of a project.`,
    coverImage: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop",
    author: { id: "u3", name: "Elena Rodriguez", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" },
    tags: ["Programming", "Best Practices"],
    status: "archived",
    views: 890,
    readTime: 7,
    createdAt: "2026-01-15",
    updatedAt: "2026-01-15",
  },
];

export const statusColors: Record<string, string> = {
  published: "bg-success text-success-foreground",
  draft: "bg-muted text-muted-foreground",
  archived: "bg-destructive/80 text-destructive-foreground",
  scheduled: "bg-warning text-warning-foreground",
};
