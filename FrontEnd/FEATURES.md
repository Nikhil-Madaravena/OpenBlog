# 📱 Blossom Blog Studio - Multi-User Blog Platform

A fully functional, production-ready multi-user blogging platform built with React, TypeScript, and Tailwind CSS.

## 🚀 Features Implemented

### ✅ User Management & Authentication
- **User Registration & Login** - Create accounts or use demo credentials
- **Follow System** - Follow/unfollow other writers
- **User Discovery** - Browse and discover writers with search
- **User Profiles** - View user stats and bio
- **Demo Users** - Pre-loaded users (sarah@openblog.co, marcus@openblog.co, both with password "password")

### ✅ Blog Management
- **Create Posts** - Write new blog posts with rich editor
- **Edit Posts** - Modify existing posts (draft/published/scheduled/archived)
- **Delete Posts** - Remove your posts
- **Post Status** - Draft, Published, Scheduled, or Archived
- **Markdown Support** - Full markdown formatting in editor
- **Cover Images** - Add custom cover images via URL
- **Auto-Calculated Metrics** - Automatic read time & word count calculation

### ✅ Blog Interaction
- **Like Posts** - Like posts you enjoy (requires login)
- **Bookmark Posts** - Save posts for later reading
- **Comments** - Full commenting system with:
  - Add comments to posts
  - Delete your own comments
  - Like comments
  - Timestamps on all comments
- **Share Posts** - Copy post links to clipboard
- **View Tracking** - Track post view counts

### ✅ Discovery & Search
- **Explore Page** - Browse all published posts
- **Search** - Full-text search across posts
- **Tag Filtering** - Filter posts by tags
- **Related Posts** - Smart algorithm shows related content
- **User Discovery** - Find and follow writers
- **Featured Posts** - Highlighted on explore page

### ✅ Dashboard
- **Post Management** - View, edit, delete your posts
- **Bookmarks** - Access all saved posts
- **Statistics** - View post views, likes, comments
- **Performance Metrics** - Total reach and engagement stats

### ✅ Technical Features
- **Form Validation** - Zod schemas for all inputs
- **Error Boundaries** - Graceful error handling
- **Loading States** - Skeleton screens for better UX
- **Local Storage** - All data persisted locally
- **Type Safety** - Full TypeScript implementation
- **Responsive Design** - Works on all devices
- **Dark Mode Ready** - Built with Tailwind CSS

## 🎯 Main Pages

| Route | Purpose | Authentication |
|-------|---------|-----------------|
| `/` | Landing page with features & pricing | Public |
| `/auth` | Login & signup | Public |
| `/explore` | Browse published posts | Public |
| `/discover` | Find and follow writers | Public |
| `/blog/:id` | Read individual posts with comments | Public |
| `/dashboard` | User's post overview & stats | Protected |
| `/dashboard/posts` | Manage user's posts | Protected |
| `/dashboard/bookmarks` | View bookmarked posts | Protected |
| `/editor` | Create new post | Protected |
| `/editor/:id` | Edit existing post | Protected |
| `/profile` | User profile settings | Protected |
| `/settings` | Account settings | Protected |

## 🔐 Demo Credentials

Use these to test the platform:

```
Email: sarah@openblog.co
Password: password

Email: marcus@openblog.co
Password: password
```

You can also create new accounts by signing up!

## 🎨 Key Components

### Comments System
```tsx
<Comments postId={postId} />
```
- Add comments to any post
- Delete your own comments
- Like comments
- See all comments on a post

### Error Boundary
```tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```
- Catches React errors
- Shows user-friendly error messages
- Provides recovery options

### Form Validation
All forms use Zod schemas:
- User registration & login
- Blog posts (title, excerpt, content, tags)
- Profile updates
- Comments

### Loading Skeletons
- BlogCardSkeleton - for post lists
- BlogPostSkeleton - for full posts
- ProfileSkeleton - for user profiles
- CommentSkeleton - for comments

## 📊 Data Structure

### User
```typescript
{
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  joinedAt: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
}
```

### BlogPost
```typescript
{
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
```

### Comment
```typescript
{
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: Comment[];
}
```

## 💾 Local Storage Keys

- `openblog_user` - Current logged-in user
- `openblog_custom_users` - Registered users
- `openblog_posts` - All blog posts
- `openblog_bookmarks` - Bookmarked post IDs
- `openblog_likes` - Liked post IDs
- `openblog_comments` - Comments by post ID
- `openblog_following` - User IDs being followed

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (40+ components)
- **Forms**: React Hook Form + Zod
- **State**: React Context API
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Testing**: Vitest + Playwright

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
# or
bun install
```

### Start Development Server
```bash
npm run dev
# or
bun run dev
```

The app will be available at `http://localhost:8081/`

### Build for Production
```bash
npm run build
# or
bun run build
```

## 📝 Writing Posts

1. Click "Dashboard" in navbar (or create account first)
2. Click "New Post" or "Editor" button
3. Fill in post details:
   - Title (required, 5-200 characters)
   - Excerpt (required, 10-500 characters)
   - Content (required, 50+ characters)
   - Cover image URL (optional)
   - Tags (required, 1-10 tags)
4. Choose status: Draft, Published, or Scheduled
5. Use toolbar for markdown formatting
6. Preview your post in "Preview" tab
7. Click "Save" when ready

## 💬 Commenting on Posts

1. Read a blog post
2. Scroll to "Comments" section at bottom
3. Log in if needed
4. Type your comment and click "Post Comment"
5. Other users can see your comment immediately
6. Like comments from other readers
7. Delete your own comments anytime

## 🔍 Discovering Writers

1. Click "Discover Writers" in navbar
2. Browse the full list of writers
3. Search by name or bio
4. Click "Follow" to follow a writer
5. See their stats (posts, followers, following)

## 📚 Exploring Posts

1. Click "Explore" in navbar
2. Browse all published posts
3. Use search to find specific topics
4. Filter by tags
5. Click a post to read it in full
6. Like, bookmark, or comment on posts
7. View related posts at the bottom

## ⭐ Features Highlight

### Smart Post Recommendations
Related posts are shown based on shared tags - helps readers discover more content from similar topics

### Automatic Read Time Calculation
Posts show estimated read time based on content length - helps readers decide if they have time

### Form Validation
All inputs are validated with clear error messages - prevents bad data and shows exactly what's wrong

### Responsive Design
Works perfectly on desktop, tablet, and mobile devices - optimized for all screen sizes

### Dark Mode Support
Built with Tailwind CSS for easy light/dark mode switching - comfortable reading anytime

## 🔒 Privacy & Data

- All data is stored locally in browser localStorage
- No data is sent to external servers
- Comments are stored with your user info
- You control what's published on your profile
- Delete your account to clear all your data

## 🐛 Known Limitations

- Data is local to your browser (use same browser for all sessions)
- No backend server integration
- Comments are not threaded (structure ready for future enhancement)
- No real-time notifications (not with localStorage backend)
- No image uploads (use external URLs)

## 🎓 Learning Resources

This codebase demonstrates:
- React Hooks and Context API
- TypeScript for type safety
- Component composition patterns
- Form validation with Zod
- Error boundary implementation
- localStorage data persistence
- Responsive design with Tailwind
- Complete CRUD operations

## 📖 Next Steps for Enhancement

Future improvements could include:
- Backend API integration (Node.js/Express)
- Real database (PostgreSQL/MongoDB)
- User authentication (JWT)
- Email notifications
- Image upload service
- Real-time collaboration
- Advanced analytics
- SEO optimization
- Threaded comments

## 💡 Tips for Best Experience

1. **Create multiple accounts** to test the follow system
2. **Try creating posts** with different statuses
3. **Comment on posts** to test the comment system
4. **Search and filter** to explore the discovery features
5. **Test on mobile** to see responsive design
6. **Use demo credentials** for quick testing

## 📞 Support

For issues or questions about the codebase, check:
- TypeScript types in `/src/types/`
- Validation schemas in `/src/lib/validation.ts`
- Context setup in `/src/contexts/`
- API in `/src/pages/`

Enjoy using Blossom Blog Studio! 🎉
