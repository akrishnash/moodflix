import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { History, Clock, ChevronRight } from "lucide-react";
import { useHistory } from "@/hooks/use-recommendations";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { type MoodRequest, type Recommendation } from "@shared/schema";

interface HistorySidebarProps {
  onSelect: (item: MoodRequest) => void;
}

export function HistorySidebar({ onSelect }: HistorySidebarProps) {
  const { data: history, isLoading } = useHistory();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full border-white/10 hover:bg-white/5 hover:text-primary">
          <History className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="border-l-white/10 bg-background/95 backdrop-blur-xl w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">History</SheetTitle>
          <SheetDescription>
            Revisit your past moods and recommendations.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-8 pr-4">
          {isLoading ? (
            <div className="flex justify-center p-8 text-muted-foreground">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
          ) : history?.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground border border-dashed border-white/10 rounded-xl">
              <p>No history yet.</p>
              <p className="text-xs mt-2">Your curation journey starts today!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history?.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="group cursor-pointer p-4 rounded-xl bg-card/30 hover:bg-card/80 border border-white/5 hover:border-primary/20 transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-sm line-clamp-1 text-foreground/90 group-hover:text-primary transition-colors">
                      {item.mood}
                    </p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                      {item.createdAt && formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    {(item.recommendations as unknown as Recommendation[]).slice(0, 3).map((rec, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary/80 transition-colors">
                        {rec.title}
                      </span>
                    ))}
                    {(item.recommendations as unknown as Recommendation[]).length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 text-muted-foreground">
                        +{(item.recommendations as unknown as Recommendation[]).length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
