package com.openblog;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Initializing/Updating dummy data...");

        // Create Users
        User alice = getOrCreateUser("Alice Johnson", "alice@example.com", "1234", "Senior Software Architect at CloudScalers.");
        User bob = getOrCreateUser("Bob Smith", "bob@example.com", "1234", "Full-stack developer.");
        User charlie = getOrCreateUser("Charlie Davis", "charlie@example.com", "1234", "Data Scientist.");
        User nik = getOrCreateUser("nik", "nik@example.com", "123456", "Open source contributor.");

        // Create Posts
        Post post1 = getOrCreatePost("The Future of Web Development in 2024", 
            "Exploring the rise of server-side components, edge computing, and AI-driven development.", 
            "The landscape of web development is shifting faster than ever...", 
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000", 
            alice, "[\"WebDev\", \"Future\", \"React\"]", 5);

        Post post2 = getOrCreatePost("Mastering Tailwind CSS: 5 Pro Tips", 
            "Level up your styling game with these secret Tailwind techniques.", 
            "Tailwind CSS has revolutionized how we think about styling...", 
            "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=1000", 
            bob, "[\"CSS\", \"Design\", \"Frontend\"]", 3);

        Post post3 = getOrCreatePost("Understanding Neural Networks from Scratch", 
            "A comprehensive guide to the math behind deep learning.", 
            "Many developers treat AI as a black box...", 
            "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000", 
            charlie, "[\"AI\", \"MachineLearning\", \"Math\"]", 12);

        Post post4 = getOrCreatePost("Designing Scalable Microservices", 
            "How to avoid the common pitfalls of distributed systems.", 
            "Microservices promise agility but often deliver complexity...", 
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000", 
            alice, "[\"Architecture\", \"Microservices\", \"Backend\"]", 8);

        Post post5 = getOrCreatePost("Exploring the World as a Digital Nomad Developer", 
            "My journey of traveling through 10 countries while building apps.", 
            "Working remotely is a dream for many. In this post, I share the challenges...", 
            "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&q=80&w=1000", 
            nik, "[\"Travel\", \"RemoteWork\", \"Lifestyle\"]", 6);

        Post post6 = getOrCreatePost("Why I Switched from VS Code to Neovim", 
            "A deep dive into keyboard-driven development.", 
            "Configuring Neovim was a rabbit hole, but the efficiency I've gained is unmatched...", 
            "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=1000", 
            nik, "[\"Tools\", \"Productivity\", \"Neovim\"]", 10);

        getOrCreatePost("The Rise of Rust in System Programming", 
            "Why developers are falling in love with memory safety and zero-cost abstractions.", 
            "Rust has been the most loved language for years. Its ownership model solves memory safety without a garbage collector...", 
            "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?auto=format&fit=crop&q=80&w=1000", 
            alice, "[\"Rust\", \"Systems\", \"Safety\"]", 15);

        getOrCreatePost("Building a Design System with Shadcn/UI", 
            "How to use Radix primitives and Tailwind to create a stunning, accessible component library.", 
            "Shadcn/UI isn't a component library, it's a collection of re-editable components. We'll explore how to customize it...", 
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000", 
            bob, "[\"DesignSystem\", \"Tailwind\", \"React\"]", 7);

        getOrCreatePost("Large Language Models: Beyond the Hype", 
            "A technical look at fine-tuning, RAG, and the practical applications of AI in industry.", 
            "LLMs are transforming search and productivity. But how do you actually deploy them reliably? We look at Retrieval Augmented Generation...", 
            "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000", 
            charlie, "[\"AI\", \"LLM\", \"NLP\"]", 11);

        getOrCreatePost("10 Must-Have CLI Tools for Every Developer", 
            "From eza and bat to fzf and zoxide—level up your terminal experience.", 
            "The terminal is where we spend 90% of our time. Why settle for defaults? Here are my top picks for a faster workflow...", 
            "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&q=80&w=1000", 
            nik, "[\"Tools\", \"CLI\", \"Workflow\"]", 4);

        // Create Comments
        createComment("Great article! I've been struggling with RSC lately and this cleared things up.", bob, post1);
        createComment("The section on Edge Computing is particularly relevant for my current project. Thanks Alice!", charlie, post1);
        createComment("I didn't know about arbitrary variants. Definitely going to use that!", alice, post2);
        createComment("Simplifying the math made it so much easier to follow. Excellent breakdown.", bob, post3);

        System.out.println("Dummy data initialization complete.");
    }

    private User getOrCreateUser(String name, String email, String password, String bio) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = new User();
            user.setId(UUID.randomUUID().toString());
            user.setName(name);
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setAvatar("https://api.dicebear.com/7.x/initials/svg?seed=" + name.replace(" ", ""));
            user.setBio(bio);
            user.setJoinedAt(LocalDateTime.now().toString().split("T")[0]);
            user.setCreatedAt(LocalDateTime.now().toString());
            return userRepository.save(user);
        });
    }

    private Post getOrCreatePost(String title, String excerpt, String content, String coverImage, User author, String tags, int readTime) {
        // Simple check by title to avoid duplicates
        return postRepository.findAll().stream()
            .filter(p -> p.getTitle().equals(title))
            .findFirst()
            .orElseGet(() -> {
                Post post = new Post();
                post.setId(UUID.randomUUID().toString());
                post.setTitle(title);
                post.setExcerpt(excerpt);
                post.setContent(content);
                post.setCoverImage(coverImage);
                post.setAuthor(author);
                post.setTags(tags);
                post.setStatus("published");
                post.setViews(0);
                post.setReadTime(readTime);
                post.setCreatedAt(LocalDateTime.now().toString());
                post.setUpdatedAt(LocalDateTime.now().toString());
                return postRepository.save(post);
            });
    }

    private void createComment(String content, User author, Post post) {
        Comment comment = new Comment();
        comment.setId(UUID.randomUUID().toString());
        comment.setContent(content);
        comment.setAuthor(author);
        comment.setPost(post);
        comment.setLikes(0);
        comment.setCreatedAt(LocalDateTime.now().toString());
        commentRepository.save(comment);
    }
}
