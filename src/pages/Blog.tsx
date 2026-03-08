import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import useSEO from "@/hooks/useSEO";

const Blog = () => {
  useSEO({
    title: "Energy Tips & Solar Guides — PawaMore Systems Blog",
    description: "Honest guides on solar installation costs, battery systems, and how to cut your energy bills in Nigeria. Expert advice from PawaMore Systems.",
  });

  return (
    <Layout>
      <section className="relative py-12 sm:py-16 md:py-28" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 kente-pattern opacity-20" />
        <div className="container relative z-10 text-center">
          <ScrollReveal>
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-3 sm:mb-4 leading-tight">
              Energy Tips & <span className="text-accent">Solar Guides</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Honest guides on solar installation, battery systems, and how to cut your energy bills in Nigeria.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-10 sm:py-16 md:py-28">
        <div className="container max-w-4xl space-y-4 sm:space-y-8 px-4">
          {blogPosts.map((post, i) => (
            <ScrollReveal key={post.slug} delay={i * 100}>
              <Link to={`/blog/${post.slug}`} className="block">
                <article className="bg-card rounded-xl sm:rounded-2xl border border-border p-5 sm:p-8 hover:shadow-[var(--shadow-elevated)] hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <span className="bg-primary/10 text-primary font-display font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-full px-2.5 sm:px-3 py-1">
                      {post.tag}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground text-[10px] sm:text-xs">
                      <Calendar className="w-3 h-3" /> {post.date}
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-base sm:text-xl md:text-2xl mb-2 sm:mb-3 group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm mb-3 sm:mb-4">{post.intro}</p>
                  <div className="flex items-center gap-2 text-primary font-display font-bold text-xs sm:text-sm group-hover:gap-3 transition-all">
                    Read Full Article <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </article>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="py-10 sm:py-16 bg-secondary">
        <div className="container text-center">
          <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">Have a question about solar power in Nigeria?</p>
          <Link to="/contact"><Button variant="default" size="lg">Ask Us Anything →</Button></Link>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
