import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Eye, Calendar, Share2, Bookmark, Heart, BookmarkCheck, HeartOff } from "lucide-react";
import { useBlog } from "@/contexts/BlogContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Comments from "@/components/Comments";

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPost, getPublishedPosts, getRelatedPosts, likePost, bookmarkPost, isLiked, isBookmarked, incrementView } = useBlog();
  const { isAuthenticated, user } = useAuth();
  const post = id ? getPost(id) : undefined;

  useEffect(() => {
    if (id) {
      incrementView(id);
    }
  }, [id, incrementView]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground font-heading mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist.</p>
          <Button variant="hero" onClick={() => navigate("/explore")}>Browse Articles</Button>
        </div>
      </div>
    );
  }

  const liked = id ? isLiked(id) : false;
  const bookmarked = id ? isBookmarked(id) : false;

  const handleLike = () => {
    if (!isAuthenticated) { toast.error("Please sign in to like posts"); return; }
    if (id) { likePost(id); toast.success(liked ? "Removed like" : "Post liked!"); }
  };

  const handleBookmark = () => {
    if (!isAuthenticated) { toast.error("Please sign in to bookmark posts"); return; }
    if (id) { bookmarkPost(id); toast.success(bookmarked ? "Removed bookmark" : "Post bookmarked!"); }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const relatedPosts = id ? getRelatedPosts(id) : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <article className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6 mb-8">
          <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          <div className="flex gap-2 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1 bg-accent/10 text-accent rounded-full font-medium">{tag}</span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground font-heading leading-tight mb-6">
            {post.title}
          </h1>

          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">{post.excerpt}</p>

          <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-border">
            <div className="flex items-center gap-4">
              <img src={post.author.avatar} alt={post.author.name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-medium text-foreground">{post.author.name}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.createdAt}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime} min read</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={liked ? "default" : "ghost"} size="icon" onClick={handleLike}>
                <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              </Button>
              <Button variant={bookmarked ? "default" : "ghost"} size="icon" onClick={handleBookmark}>
                {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 mb-12">
          <img src={post.coverImage} alt={post.title} className="w-full h-64 md:h-96 object-cover rounded-2xl" />
        </div>

        <div className="max-w-3xl mx-auto px-6">
          <div className="prose-nova">
            {post.content.split('\n\n').map((paragraph, i) => {
              if (paragraph.startsWith('## ')) return <h2 key={i}>{paragraph.replace('## ', '')}</h2>;
              if (paragraph.startsWith('# ')) return <h1 key={i}>{paragraph.replace('# ', '')}</h1>;
              if (paragraph.startsWith('> ')) return <blockquote key={i}>{paragraph.replace('> ', '')}</blockquote>;
              return <p key={i}>{paragraph}</p>;
            })}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 mt-16">
          <div className="bg-card border border-border rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <img src={post.author.avatar} alt={post.author.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
            <div>
              <p className="font-bold text-foreground font-heading text-lg">{post.author.name}</p>
              <p className="text-sm text-muted-foreground mt-1">Writer and creator sharing insights about technology, design, and the modern web.</p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 mt-16">
          {id && <Comments postId={id} />}
        </div>

        {relatedPosts.length > 0 && (
          <div className="max-w-5xl mx-auto px-6 mt-20">
            <h2 className="text-2xl font-bold text-foreground font-heading mb-8">More to Read</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((rp) => (
                <Link key={rp.id} to={`/blog/${rp.id}`} className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all">
                  <img src={rp.coverImage} alt={rp.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground font-heading group-hover:text-accent transition-colors line-clamp-2">{rp.title}</h3>
                    <p className="text-xs text-muted-foreground mt-2">{rp.readTime} min read</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
      <Footer />
    </div>
  );
};

export default BlogPost;
