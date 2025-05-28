import { useState } from "react";
import {v4 as uuidv4} from 'uuid';
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Search, Plus, Calendar } from "lucide-react";
import { format, isBefore } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { useDebounce } from '@uidotdev/usehooks';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SearchGames = ({ form, setSelectedGame }) => {
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const debouncedSearchTerm = useDebounce(searchQuery, 1000);

  const fetchBoardgames = async (name) => {
    const rs = await fetch(`${import.meta.env.VITE_APP_ENDPOINT}/rest/boardgames?filter={"name@simplelike":"${name}"}&range=[0,9]`);
    setShowResults(true);
    return rs.json();
  }

  const { data, isLoading } = useQuery({
    queryKey: ["boardgames_search", debouncedSearchTerm],
    queryFn: () => fetchBoardgames(debouncedSearchTerm),
    initialData: [],
    enabled: !!debouncedSearchTerm,
  });

  if (isLoading) {
    return <>Loading...</>;
  }

  const selectGame = (game) => {
    setSelectedGame(game);
    form.setValue("boardgame_id", game.id);
    form.setValue("boardgame.name", game.name);
    form.setValue("maxPlayers", game.maxplayers);
    setShowResults(false);
    setInput(game.name);
  };

  return (
    <div className="relative">
      <Input
        placeholder="Search for a board game..."
        value={input}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setInput(e.target.value);
        }}
        className="pl-9"
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

      {showResults && data.length > 0 && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {data.map(game => (
            <div
              key={game.id}
              className="p-3 hover:bg-muted cursor-pointer border-b last:border-0 flex items-center gap-3"
              onClick={() => selectGame(game)}
            >
              {game.square200 !== "" && <img
                src={game.square200}
                alt={game.name}
                className="w-12 h-12 rounded-md object-cover"
              />}
              <div className="flex-1">
                <div className="font-medium">{game.name}</div>
                <div className="text-xs text-muted-foreground flex gap-4 mt-1">
                  <span>BGG ID: {game.id}</span>
                  {game.year !== 0 && <span>{game.year}</span>}
                  {game.minplayers !== 0 && game.maxplayers !== 0 && <span>{game.minplayers}-{game.maxplayers} players</span>}
                  {/* <span>{game.playTime} min</span> */}
                  {/* <span>★ {game.rating}</span> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const Component = ({ email, showCreateForm, setShowCreateForm }) => {
  const queryClient = useQueryClient();
  const [selectedGame, setSelectedGame] = useState(null);

  const form = useForm({
    defaultValues: {
      boardgame_id: "",
      boardgame: {
        name: "",
      },
      maxPlayers: 4,
      dateTime: new Date(),
      location: "",
    },
  });

  const createTable = async payload => {
    const rs = await fetch(`${import.meta.env.VITE_APP_ENDPOINT}/rest/tables`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return rs.json();
  }

  const { mutate } = useMutation({
    mutationFn: createTable,
    onSuccess: (data, variables, context) => {
      toast.info('Your table was created successfully.');
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: (error, variables, context) => {
      toast.error('Something went wrong, please try again');
    }
  });

  const handleSubmit = () => {
    const { boardgame_id, maxPlayers, dateTime, location } = form.getValues();

    mutate({
      boardgame_id: parseInt(boardgame_id),
      creator_id: uuidv4(),
      location,
      date: dateTime,
      creator: email,
      seats: maxPlayers,
    });

    setShowCreateForm(false);
  }

  return (
    <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
          <Plus className="mr-2 h-5 w-5" />
          Create New Game Table
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a New Game Table</DialogTitle>
          <DialogDescription>
            Set up a new board game session for others to join
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Game Search */}
            <FormField
              control={form.control}
              name="boardgame.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Board Game</FormLabel>
                    <SearchGames form={form} setSelectedGame={setSelectedGame} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date and Time */}
            <FormField
              control={form.control}
              name="dateTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Game Date & Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className="w-full pl-3 text-left font-normal">
                          {field.value ? (
                            format(field.value, "PPP 'at' p")
                          ) : (
                            <span>Pick a date and time</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarUI
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            const currentTime = field.value || new Date();
                            date.setHours(currentTime.getHours(), currentTime.getMinutes());
                            field.onChange(date);
                          }
                        }}
                        disabled={(date) => isBefore(date, new Date())}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                      <div className="p-3 border-t">
                        <Input
                          type="time"
                          value={field.value ? format(field.value, "HH:mm") : ""}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':');
                            const newDate = new Date(field.value || new Date());
                            newDate.setHours(parseInt(hours), parseInt(minutes));
                            field.onChange(newDate);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Max Players */}
              <FormField
                control={form.control}
                name="maxPlayers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Players</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="2"
                        max="30"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the meeting location (e.g., Downtown Board Game Café, 123 Main St)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a clear location where players can find the game
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Create Table
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default Component;
