import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { type Location } from "@shared/schema";

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
        title: "Locations parsed successfully",
        description: `Found ${data.length} locations`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error parsing locations",
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
        <h2 className="text-lg font-semibold mb-2">Add Locations</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Enter locations in natural language, e.g. "Create a list of coffee shops in Brooklyn"
        </p>
      </div>
      
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter locations..."
          disabled={parseLocationsMutation.isPending}
        />
        <Button 
          type="submit"
          disabled={parseLocationsMutation.isPending || !input.trim()}
        >
          {parseLocationsMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Parse"
          )}
        </Button>
      </div>
    </form>
  );
}
