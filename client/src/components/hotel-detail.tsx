import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Location } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistance } from "date-fns";
import { Loader2 } from "lucide-react";

interface HotelDetailProps {
  hotel: Location | null;
  onClose: () => void;
}

export default function HotelDetail({ hotel, onClose }: HotelDetailProps) {
  const commentsQuery = useQuery({
    queryKey: [`/api/locations/${hotel?.id}/reddit-comments`],
    enabled: !!hotel,
  });

  if (!hotel) return null;

  return (
    <Dialog open={!!hotel} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{hotel.name}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1">
          {commentsQuery.isPending ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : commentsQuery.isError ? (
            <div className="text-center py-8 text-destructive">
              Failed to load Reddit comments
            </div>
          ) : commentsQuery.data?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No Reddit comments found for this hotel
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Comment</TableHead>
                  <TableHead className="w-32">Subreddit</TableHead>
                  <TableHead className="w-32">Posted</TableHead>
                  <TableHead className="w-24 text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commentsQuery.data?.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>
                      <a
                        href={comment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {comment.content.length > 300
                          ? comment.content.slice(0, 300) + "..."
                          : comment.content}
                      </a>
                    </TableCell>
                    <TableCell>{comment.subreddit}</TableCell>
                    <TableCell>
                      {formatDistance(comment.created * 1000, new Date(), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-right">{comment.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
