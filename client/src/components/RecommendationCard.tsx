import { motion } from "framer-motion";
import { Film, Tv, Youtube, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Recommendation {
  title: string;
  type: "Movie" | "TV Show" | "YouTube Video";
  description: string;
  reason: string;
}

interface RecommendationCardProps {
  item: Recommendation;
  index: number;
}

const typeIcons = {
  "Movie": <Film className="w-4 h-4" />,
  "TV Show": <Tv className="w-4 h-4" />,
  "YouTube Video": <Youtube className="w-4 h-4" />,
};

const typeColors = {
  "Movie": "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20",
  "TV Show": "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
  "YouTube Video": "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20",
};

export function RecommendationCard({ item, index }: RecommendationCardProps) {
  const searchQuery = encodeURIComponent(`${item.title} ${item.type} trailer`);
  const searchUrl = `https://www.google.com/search?q=${searchQuery}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="h-full glass-card overflow-hidden group hover:shadow-primary/10 hover:shadow-2xl border-white/5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Badge 
                variant="outline" 
                className={`flex w-fit items-center gap-1.5 mb-2 transition-colors ${typeColors[item.type]}`}
              >
                {typeIcons[item.type]}
                {item.type}
              </Badge>
              <CardTitle className="text-xl font-display leading-tight group-hover:text-primary transition-colors">
                {item.title}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {item.description}
          </p>
          
          <div className="bg-secondary/30 p-3 rounded-lg border border-white/5">
            <p className="text-xs font-medium text-accent uppercase tracking-wider mb-1">
              Why it fits
            </p>
            <p className="text-sm text-foreground/90 italic">
              "{item.reason}"
            </p>
          </div>

          <Button 
            variant="ghost" 
            className="w-full justify-between hover:bg-white/5 text-muted-foreground hover:text-foreground group-hover:translate-x-1 transition-all duration-300"
            onClick={() => window.open(searchUrl, '_blank')}
          >
            Find to watch
            <ExternalLink className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
