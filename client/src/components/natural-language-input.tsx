import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { type Location } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";

interface NaturalLanguageInputProps {
  onLocationsFound: (locations: Location[]) => void;
}

export default function NaturalLanguageInput({ onLocationsFound }: NaturalLanguageInputProps) {
  const [input, setInput] = useState("");
  const { toast } = useToast();

  const parseLocationsMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiRequest("POST", "/api/parse-locations", { input: text });
      return res.json();
    },
    onSuccess: (data) => {
      onLocationsFound(data);
      setInput("");
      toast({
        title: "Hotels parsed successfully",
        description: `Found ${data.length} hotels`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error parsing hotels",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    parseLocationsMutation.mutate(input);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Add Hotels to Map</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Paste your list of hotels below. Each hotel should be on a new line.
          You can include notes in parentheses (e.g., "high floor available").
        </p>
      </div>

      <div className="space-y-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter hotels (one per line)..."
          className="min-h-[200px] font-mono"
          disabled={parseLocationsMutation.isPending}
        />
        <Button 
          type="submit"
          className="w-full"
          disabled={parseLocationsMutation.isPending || !input.trim()}
        >
          {parseLocationsMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing Hotels...
            </>
          ) : (
            'Add Hotels to Map'
          )}
        </Button>
      </div>
    </form>
  );
}