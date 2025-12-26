import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MoodInputProps {
  onSubmit: (mood: string) => void;
  isLoading: boolean;
}

export function MoodInput({ onSubmit, isLoading }: MoodInputProps) {
  const [mood, setMood] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mood.trim() && !isLoading) {
      onSubmit(mood);
    }
  };

  const suggestions = [
    "I'm feeling nostalgic and want something from the 90s...",
    "Had a rough day, need something uplifting and funny...",
    "Want to be scared but not too scared...",
    "Looking for a mind-bending sci-fi mystery...",
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <motion.form 
        onSubmit={handleSubmit}
        className={cn(
          "relative rounded-2xl p-1 transition-all duration-300 bg-gradient-to-br from-white/10 to-white/5",
          isFocused ? "ring-2 ring-primary/50 shadow-lg shadow-primary/20" : "ring-1 ring-white/10"
        )}
      >
        <div className="relative bg-background rounded-xl overflow-hidden">
          <Textarea
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="How are you feeling right now? Or what kind of vibe are you looking for?"
            className="min-h-[160px] w-full resize-none border-0 bg-transparent p-6 text-lg focus-visible:ring-0 placeholder:text-muted-foreground/50 font-light"
            disabled={isLoading}
          />
          
          <div className="flex justify-between items-center p-4 bg-muted/20 border-t border-white/5">
            <div className="flex gap-2">
              <AnimatePresence>
                {!mood && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-wrap gap-2"
                  >
                    {suggestions.slice(0, 2).map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setMood(s)}
                        className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors border border-white/5"
                      >
                        {s.slice(0, 25)}...
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              type="submit"
              disabled={!mood.trim() || isLoading}
              className={cn(
                "rounded-full px-6 transition-all duration-300",
                mood.trim() 
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25" 
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Curating...
                </>
              ) : (
                <>
                  Curate
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.form>

      {/* Helper text */}
      <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
        <Sparkles className="w-3 h-3 text-accent" />
        <span>AI-powered curation based on your emotional context</span>
        <Sparkles className="w-3 h-3 text-accent" />
      </div>
    </div>
  );
}
