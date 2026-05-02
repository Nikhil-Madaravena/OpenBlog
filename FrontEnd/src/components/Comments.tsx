import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Trash2, Loader2 } from "lucide-react";
import { useBlog, type Comment } from "@/contexts/BlogContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const { getComments, loadComments, addComment, deleteComment, likeComment } = useBlog();
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load comments from API on mount
  useEffect(() => {
    setIsLoading(true);
    loadComments(postId).finally(() => setIsLoading(false));
  }, [postId, loadComments]);

  const comments = getComments(postId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please login to comment");
      return;
    }

    setIsSubmitting(true);
    try {
      await addComment(postId, content);
      setContent("");
      toast.success("Comment posted!");
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (confirm("Delete this comment?")) {
      try {
        await deleteComment(postId, commentId);
        toast.success("Comment deleted");
      } catch {
        toast.error("Failed to delete comment");
      }
    }
  };

  const handleLike = async (commentId: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to like comments");
      return;
    }
    try {
      await likeComment(postId, commentId);
    } catch {
      toast.error("Failed to like comment");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Comments {isLoading ? "" : `(${comments.length})`}
        </h3>

        {user && (
          <form onSubmit={handleSubmit} className="mb-6 space-y-4">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-24"
                  disabled={isSubmitting}
                />
                <div className="flex justify-end mt-2">
                  <Button type="submit" disabled={isSubmitting || !content.trim()}>
                    {isSubmitting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Posting...</>
                    ) : "Post Comment"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}

        {!user && (
          <div className="mb-6 p-4 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-2">Sign in to leave a comment</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No comments yet. Be the first!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-4 p-4 rounded-lg border border-border">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={comment.authorAvatar} />
                    <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{comment.authorName}</p>
                      {user?.id === comment.authorId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(comment.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm break-words">{comment.content}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(comment.id)}
                        className="text-xs"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        {comment.likes}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
