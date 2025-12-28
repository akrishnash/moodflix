import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clapperboard } from "lucide-react";
import { MoodInput } from "@/components/MoodInput";
import { RecommendationCard } from "@/components/RecommendationCard";
import { HistorySidebar } from "@/components/HistorySidebar";
import { CinemaPosterCarousel } from "@/components/CinemaPosterCarousel";
import { useCreateRecommendation } from "@/hooks/use-recommendations";
import { type Recommendation, type MoodRequest } from "@shared/schema";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [currentResults, setCurrentResults] = useState<Recommendation[] | null>(null);
  const { mutate: getRecommendations, isPending } = useCreateRecommendation();

  const handleMoodSubmit = (mood: string) => {
    getRecommendations({ mood }, {
      onSuccess: (data) => {
        setCurrentResults(data.recommendations);
        // Smooth scroll to results
        setTimeout(() => {
          document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    });
  };

  const handleHistorySelect = (item: MoodRequest) => {
    setCurrentResults(item.recommendations as unknown as Recommendation[]);
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClear = () => {
    setCurrentResults(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background cinema poster carousel */}
      <CinemaPosterCarousel />
      
      {/* Decorative ambient gradients */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full translate-y-1/2 pointer-events-none z-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md relative">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={handleClear}>
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Clapperboard className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              Mood<span className="text-primary">Curator</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <HistorySidebar onSelect={handleHistorySelect} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-24 space-y-24 relative z-10">
        {/* Hero & Input Section */}
        <section className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              What are you in the <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent">
                mood to watch?
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Tell us how you're feeling, and our AI will curate the perfect entertainment list to match your vibe.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <MoodInput onSubmit={handleMoodSubmit} isLoading={isPending} />
          </motion.div>
        </section>

        {/* Results Section */}
        <AnimatePresence>
          {currentResults && (
            <motion.section
              id="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="scroll-mt-24 space-y-12"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <h2 className="text-3xl font-display font-semibold">Curated for you</h2>
                <Button variant="ghost" onClick={handleClear} className="text-muted-foreground hover:text-foreground">
                  Clear results
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {currentResults.map((item, index) => (
                  <RecommendationCard key={index} item={item} index={index} />
                ))}
              </div>

              <div className="text-center pt-12">
                <p className="text-muted-foreground text-sm">
                  Not quite what you wanted? Try refining your mood description above.
                </p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-background/50 backdrop-blur-sm py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MoodCurator. Powered by AI.</p>
        </div>
      </footer>
    </div>
  );
}
