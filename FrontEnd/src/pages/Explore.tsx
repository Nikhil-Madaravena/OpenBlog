import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, Clock, Eye } from "lucide-react";
import { useBlog } from "@/contexts/BlogContext";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Explore = () => {
  const { getPublishedPosts } = useBlog();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const publishedPosts = getPublishedPosts();
  const allTags = Array.from(new Set(publishedPosts.flatMap((p) => p.tags)));

  const filteredPosts = publishedPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground font-heading mb-4">
              Explore Stories
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Discover insightful articles from talented writers across the globe.
            </p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedTag ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {featuredPost && (
            <Link to={`/blog/${featuredPost.id}`} className="block group mb-12">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
                <div className="grid md:grid-cols-2 gap-0">
                  <img
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="p-8 flex flex-col justify-center">
                    <span className="text-xs font-medium text-accent uppercase tracking-wider mb-3">Featured</span>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground font-heading mb-3 group-hover:text-accent transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{featuredPost.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <img src={featuredPost.author.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                        <span>{featuredPost.author.name}</span>
                      </div>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{featuredPost.readTime} min</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{featuredPost.views.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remainingPosts.map((post, i) => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <div className="flex gap-2 mb-3">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-secondary rounded-md text-secondary-foreground">{tag}</span>
                    ))}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground font-heading mb-2 group-hover:text-accent transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <img src={post.author.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                      <span>{post.author.name}</span>
                    </div>
                    <span>{post.readTime} min read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg">No articles found.</p>
              <p className="text-sm mt-2">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Explore;
