import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  PenLine, ArrowLeft, Save, Eye, Image, Bold, Italic,
  Heading1, Heading2, List, ListOrdered, Quote, Code, Link as LinkIcon,
  Check, AlertCircle,
} from "lucide-react";
import { useBlog } from "@/contexts/BlogContext";
import { toast } from "sonner";
import { BlogPostSchema, validateForm, type BlogPostInput } from "@/lib/validation";

const toolbarItems = [
  { icon: Bold, label: "Bold", md: "**text**" },
  { icon: Italic, label: "Italic", md: "*text*" },
  { icon: Heading1, label: "Heading 1", md: "# " },
  { icon: Heading2, label: "Heading 2", md: "## " },
  { icon: List, label: "Bullet List", md: "- " },
  { icon: ListOrdered, label: "Numbered List", md: "1. " },
  { icon: Quote, label: "Blockquote", md: "> " },
  { icon: Code, label: "Code", md: "`code`" },
  { icon: LinkIcon, label: "Link", md: "[text](url)" },
  { icon: Image, label: "Image", md: "![alt](url)" },
];

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPost, createPost, updatePost } = useBlog();
  const existingPost = id ? getPost(id) : undefined;

  const [title, setTitle] = useState(existingPost?.title || "");
  const [content, setContent] = useState(existingPost?.content || "");
  const [excerpt, setExcerpt] = useState(existingPost?.excerpt || "");
  const [coverUrl, setCoverUrl] = useState(existingPost?.coverImage || "");
  const [status, setStatus] = useState<"draft" | "published" | "scheduled">(
    (existingPost?.status as any) || "draft"
  );
  const [tags, setTags] = useState(existingPost?.tags.join(", ") || "");
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    
    const validation = BlogPostSchema.safeParse({
      title,
      excerpt,
      content,
      coverImage: coverUrl,
      tags: tagList,
      status,
    });

    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path.join(".");
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    if (!validateForm()) {
      toast.error("Please fix the errors below");
      setIsSubmitting(false);
      return;
    }

    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);

    try {
      if (id && existingPost) {
        await updatePost(id, {
          title,
          content,
          excerpt,
          coverImage: coverUrl,
          status,
          tags: tagList,
        });
        toast.success("Post updated!");
      } else {
        const newPost = await createPost({
          title,
          content,
          excerpt,
          coverImage: coverUrl || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop",
          status,
          tags: tagList,
        });
        toast.success(status === "published" ? "Post published!" : "Draft saved!");
        navigate(`/editor/${newPost.id}`, { replace: true });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast.error("Failed to save post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToolbarClick = (md: string) => {
    setContent((prev) => prev + md + "\n");
  };

  const renderPreview = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mb-2">{line.replace('# ', '')}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mb-2">{line.replace('## ', '')}</h2>;
      if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-1">{line.replace('- ', '')}</li>;
      if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 pl-4 italic mb-2">{line.replace('> ', '')}</blockquote>;
      if (line.startsWith('`')) return <code key={i} className="bg-muted px-2 py-1 rounded font-mono text-sm">{line.replace(/`/g, '')}</code>;
      return <p key={i} className="mb-2">{line || "\n"}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <PenLine className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground font-heading">
                {id ? "Edit Post" : "New Post"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="w-32 h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            {id && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/blog/${id}`)}>
                <Eye className="w-4 h-4 mr-1" /> Preview
              </Button>
            )}
            <Button 
              variant="hero" 
              size="sm" 
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {saved ? <Check className="w-4 h-4 mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              {isSubmitting ? "Saving..." : saved ? "Saved!" : "Save"}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Display validation errors */}
        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside mt-2">
                {Object.values(errors).map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Cover image */}
        <div className="mb-8">
          {coverUrl ? (
            <div className="relative group">
              <img src={coverUrl} alt="Cover" className="w-full h-64 object-cover rounded-xl" />
              <div className="absolute inset-0 bg-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <Button variant="secondary" size="sm" onClick={() => setCoverUrl("")}>
                  Remove Cover
                </Button>
              </div>
            </div>
          ) : (
            <Input
              placeholder="Paste a cover image URL..."
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className={`text-sm ${errors.coverImage ? 'border-destructive' : ''}`}
            />
          )}
          {errors.coverImage && <p className="text-xs text-destructive mt-1">{errors.coverImage}</p>}
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="Post title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full text-4xl md:text-5xl font-bold text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/40 font-heading mb-2 ${errors.title ? 'text-destructive' : ''}`}
        />
        {errors.title && <p className="text-xs text-destructive mb-4">{errors.title}</p>}

        {/* Excerpt */}
        <input
          type="text"
          placeholder="Write a brief excerpt..."
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className={`w-full text-lg text-muted-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/30 mb-2 ${errors.excerpt ? 'text-destructive' : ''}`}
        />
        {errors.excerpt && <p className="text-xs text-destructive mb-4">{errors.excerpt}</p>}

        {/* Tags */}
        <Input
          placeholder="Tags (comma-separated)..."
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className={`mb-2 text-sm ${errors.tags ? 'border-destructive' : ''}`}
        />
        {errors.tags && <p className="text-xs text-destructive mb-4">{errors.tags}</p>}

        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 bg-card border border-border rounded-xl mb-4 overflow-x-auto">
          {toolbarItems.map((item) => (
            <button
              key={item.label}
              title={item.label}
              onClick={() => handleToolbarClick(item.md)}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <item.icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Editor with Preview */}
        <Tabs defaultValue="write" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="write">
            <Textarea
              placeholder="Start writing your story..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`min-h-[500px] text-base leading-7 border-none shadow-none resize-none focus-visible:ring-0 p-0 text-foreground placeholder:text-muted-foreground/30 ${errors.content ? 'border-destructive' : ''}`}
            />
            {errors.content && <p className="text-xs text-destructive mt-2">{errors.content}</p>}
            <p className="text-xs text-muted-foreground mt-2">Word count: {content.split(/\s+/).filter(Boolean).length}</p>
          </TabsContent>

          <TabsContent value="preview" className="prose prose-invert max-w-none p-6 border border-border rounded-lg bg-card min-h-[500px]">
            {content ? (
              <div className="text-foreground">{renderPreview(content)}</div>
            ) : (
              <p className="text-muted-foreground">Start writing to see preview...</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Editor;
