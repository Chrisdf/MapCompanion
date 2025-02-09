import { useQuery } from "@tanstack/react-query";
import { type Location } from "@shared/schema";
import { useDates } from "@/hooks/use-dates";
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
import { formatDistance, format } from "date-fns";
import { Loader2, ExternalLink } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { addDays } from "date-fns";

interface HotelDetailProps {
  hotel: Location | null;
  onClose: () => void;
}

type RedditComment = {
  id: string;
  content: string;
  url: string;
  score: number;
  created: number;
  subreddit: string;
};

interface HotelOffer {
  available: boolean;
  offers: Array<{
    id: string;
    checkInDate: string;
    checkOutDate: string;
    roomType: string;
    price: {
      currency: string;
      total: string;
      variations: {
        average: {
          base: string;
        };
      };
    };
  }>;
}

interface HotelOfferResponse {
  data: HotelOffer[];
}

export default function HotelDetail({ hotel, onClose }: HotelDetailProps) {
  const { checkIn, checkOut } = useDates();
  const commentsQuery = useQuery<RedditComment[]>({
    queryKey: [`/api/locations/${hotel?.id}/reddit-comments`],
    enabled: !!hotel,
  });

  const availabilityQuery = useQuery<HotelOfferResponse>({
    queryKey: [
      "availability",
      hotel?.id,
      format(checkIn, "yyyy-MM-dd"),
      format(checkOut, "yyyy-MM-dd"),
    ],
    enabled: false,
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async () => {
      if (!hotel) throw new Error("Hotel not found");
      if (!checkIn || !checkOut) throw new Error("Select dates first");
      const response = await fetch(
        `/api/locations/${hotel.id}/availability?` +
        new URLSearchParams({
          checkIn: format(checkIn, "yyyy-MM-dd"),
          checkOut: format(checkOut, "yyyy-MM-dd"),
        })
      );
      if (!response.ok) throw new Error("Failed to fetch availability");
      return response.json();
    },
  });

  if (!hotel) return null;

  return (
    <Dialog open={!!hotel} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 mb-4">
            {hotel.name}
            {hotel.metadata?.context && (
              <span className="text-sm font-normal text-blue-600">
                ({hotel.metadata.context})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {hotel && (
          <div className="mb-4">
            <Button
              onClick={() => availabilityQuery.refetch()}
              className="w-full"
              disabled={availabilityQuery.isPending}
            >
              {availabilityQuery.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking availability...
                </>
              ) : (
                "Check Availability"
              )}
            </Button>
          </div>
        )}

        {availabilityQuery.isError ? (
          <div className="text-center py-4 text-destructive">
            {availabilityQuery.error instanceof Error
              ? availabilityQuery.error.message
              : "Failed to fetch availability"}
          </div>
        ) : availabilityQuery.isSuccess && availabilityQuery.data && (
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Available Rooms</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Price per Night</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Availability</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availabilityQuery.data.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No rooms available for the selected dates
                    </TableCell>
                  </TableRow>
                ) : (
                  availabilityQuery.data.data.flatMap((offer) =>
                    offer.offers.map((roomOffer) => (
                      <TableRow key={roomOffer.id}>
                        <TableCell>{roomOffer.roomType}</TableCell>
                        <TableCell>
                          {roomOffer.price.variations.average.base}{" "}
                          {roomOffer.price.currency}
                        </TableCell>
                        <TableCell>
                          {roomOffer.price.total} {roomOffer.price.currency}
                        </TableCell>
                        <TableCell>
                          {offer.available ? "Available" : "Not Available"}
                        </TableCell>
                      </TableRow>
                    ))
                  )
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <ScrollArea className="flex-1 px-1">
          <h3 className="text-lg font-medium mb-2">Reddit Comments</h3>
          {commentsQuery.isPending ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : commentsQuery.isError ? (
            <div className="text-center py-8 text-destructive">
              Failed to load Reddit comments
            </div>
          ) : !commentsQuery.data?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No Reddit comments found for this hotel. Try searching for variations
              of the hotel name or check back later.
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
                {commentsQuery.data.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell className="max-w-2xl">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          {comment.content.length > 300
                            ? comment.content.slice(0, 300) + "..."
                            : comment.content}
                        </div>
                        <a
                          href={comment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                          title="View on Reddit"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
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
