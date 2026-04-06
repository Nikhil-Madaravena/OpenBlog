import { z } from "zod";

// Auth Validation
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const SignupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Blog Post Validation
export const BlogPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title must be less than 200 characters"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters").max(500, "Excerpt must be less than 500 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  coverImage: z.string().url("Cover image must be a valid URL").optional().or(z.literal("")),
  tags: z.array(z.string()).min(1, "At least one tag is required").max(10, "Maximum 10 tags allowed"),
  status: z.enum(["published", "draft", "archived", "scheduled"] as const),
});

// Profile Validation
export const ProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional().or(z.literal("")),
  avatar: z.string().url("Avatar must be a valid URL").optional().or(z.literal("")),
});

// Comment Validation
export const CommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment must be less than 1000 characters"),
});

// Search Validation
export const SearchSchema = z.object({
  query: z.string().min(1, "Search query cannot be empty").max(100),
});

// Utilities for form validation
export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type BlogPostInput = z.infer<typeof BlogPostSchema>;
export type ProfileInput = z.infer<typeof ProfileSchema>;
export type CommentInput = z.infer<typeof CommentSchema>;
export type SearchInput = z.infer<typeof SearchSchema>;

export function validateForm<T>(schema: z.ZodSchema, data: unknown): { data?: T; errors?: Record<string, string> } {
  try {
    const validated = schema.parse(data);
    return { data: validated as T };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return { errors };
    }
    return { errors: { general: "Validation failed" } };
  }
}
