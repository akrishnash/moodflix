import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type MoodInput } from "@shared/routes";
import { type MoodRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useHistory() {
  return useQuery({
    queryKey: [api.recommendations.list.path],
    queryFn: async () => {
      const res = await fetch(api.recommendations.list.path);
      if (!res.ok) throw new Error("Failed to fetch history");
      return api.recommendations.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateRecommendation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: MoodInput) => {
      const res = await fetch(api.recommendations.create.path, {
        method: api.recommendations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate recommendations");
      }

      return api.recommendations.create.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.recommendations.list.path] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
