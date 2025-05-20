
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Search, Plus, Calendar, Users, ExternalLink, Copy } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for BoardGameGeek API results
const mockBoardGames = [
  { id: 1, name: "Catan", year: 1995, rating: 7.2 },
  { id: 2, name: "Ticket to Ride", year: 2004, rating: 7.4 },
  { id: 3, name: "Pandemic", year: 2008, rating: 7.6 },
  { id: 4, name: "7 Wonders", year: 2010, rating: 7.7 },
  { id: 5, name: "Azul", year: 2017, rating: 7.8 },
  { id: 6, name: "Wingspan", year: 2019, rating: 8.1 },
  { id: 7, name: "Gloomhaven", year: 2017, rating: 8.7 },
  { id: 8, name: "Terraforming Mars", year: 2016, rating: 8.4 },
  { id: 9, name: "Scythe", year: 2016, rating: 8.2 },
  { id: 10, name: "Brass: Birmingham", year: 2018, rating: 8.6 },
];

// Mock data for tables (would come from backend in real app)
const initialTables = [
  {
    id: "t1",
    game: "Catan",
    date: new Date(2025, 5, 24, 18, 0),
    host: "Alice",
    maxPlayers: 4,
    players: ["Alice", "Bob"],
    link: window.location.href + "?table=t1",
  },
  {
    id: "t2",
    game: "Gloomhaven",
    date: new Date(2025, 5, 25, 14, 0),
    host: "Charlie",
    maxPlayers: 4,
    players: ["Charlie", "Diana", "Ethan"],
    link: window.location.href + "?table=t2",
  },
];

const GameTables = () => {
  const [tables, setTables] = useState(initialTables);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gameResults, setGameResults] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [playerName, setPlayerName] = useState(localStorage.getItem("playerName") || "");

  const form = useForm({
    defaultValues: {
      game: "",
      maxPlayers: 4,
      date: new Date(),
    },
  });

  useEffect(() => {
    // Check if there's a table ID in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const tableId = urlParams.get("table");
    
    if (tableId) {
      const table = tables.find(t => t.id === tableId);
      if (table) {
        document.getElementById(tableId)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [tables]);

  const searchGames = (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      // In a real app, this would be an API call to BoardGameGeek
      const filteredGames = mockBoardGames.filter(game =>
        game.name.toLowerCase().includes(query.toLowerCase())
      );
      setGameResults(filteredGames);
      setShowResults(true);
    } else {
      setGameResults([]);
      setShowResults(false);
    }
  };

  const selectGame = (game) => {
    setSelectedGame(game);
    form.setValue("game", game.name);
    setShowResults(false);
  };

  const createTable = (data) => {
    const newTable = {
      id: `t${tables.length + 1}`,
      game: data.game,
      date: data.date,
      host: playerName || "Anonymous host",
      maxPlayers: data.maxPlayers,
      players: [playerName || "Anonymous host"],
      link: window.location.href + `?table=t${tables.length + 1}`,
    };

    setTables([...tables, newTable]);
    setShowCreateForm(false);
    toast.success("Table created successfully!");
  };

  const joinTable = (tableId) => {
    if (!playerName) {
      toast.error("Please enter your name before joining a table");
      return;
    }

    setTables(
      tables.map(table => {
        if (table.id === tableId) {
          if (table.players.includes(playerName)) {
            toast.error("You're already at this table!");
            return table;
          }
          
          if (table.players.length >= table.maxPlayers) {
            toast.error("This table is full!");
            return table;
          }
          
          toast.success(`You've joined ${table.game}!`);
          return {
            ...table,
            players: [...table.players, playerName],
          };
        }
        return table;
      })
    );
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link)
      .then(() => toast.success("Link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy link"));
  };

  const savePlayerName = (name) => {
    setPlayerName(name);
    localStorage.setItem("playerName", name);
    toast.success("Your name has been saved!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Game Tables</h2>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Table
        </Button>
      </div>

      {/* Player name input */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex-1">
          <Label htmlFor="player-name">Your Name</Label>
          <div className="flex mt-1.5">
            <Input
              id="player-name"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              className="ml-2"
              onClick={() => savePlayerName(playerName)}
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Create table form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create a New Game Table</CardTitle>
            <CardDescription>
              Fill out the details to create a new table for players to join.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(createTable)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="game"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Game Name</FormLabel>
                      <div className="relative">
                        <Input
                          placeholder="Search for a game..."
                          value={searchQuery}
                          onChange={(e) => searchGames(e.target.value)}
                          className="pl-9"
                          {...field}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        
                        {showResults && gameResults.length > 0 && (
                          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-md max-h-60 overflow-y-auto">
                            {gameResults.map(game => (
                              <div
                                key={game.id}
                                className="p-2 hover:bg-muted cursor-pointer border-b last:border-0"
                                onClick={() => selectGame(game)}
                              >
                                <div className="font-medium">{game.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {game.year} • Rating: {game.rating}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                          max="12"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                        />
                      </FormControl>
                      <FormDescription>
                        How many players can join this table?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Game Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal h-10"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarUI
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Table</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Tables list */}
      {tables.length > 0 ? (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Available Tables</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Game</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Players</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((table) => (
                  <TableRow key={table.id} id={table.id}>
                    <TableCell className="font-medium">{table.game}</TableCell>
                    <TableCell>{format(table.date, "PPP p")}</TableCell>
                    <TableCell>{table.host}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{table.players.length}/{table.maxPlayers}</span>
                      </div>
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyLink(table.link)}
                        title="Copy invite link"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(table.link, "_blank")}
                        title="Open table link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => joinTable(table.id)}
                        disabled={
                          table.players.includes(playerName) ||
                          table.players.length >= table.maxPlayers
                        }
                      >
                        {table.players.includes(playerName)
                          ? "Joined"
                          : table.players.length >= table.maxPlayers
                          ? "Full"
                          : "Join"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-lg bg-muted/20">
          <Table className="h-16 w-16 text-muted-foreground mx-auto" />
          <h3 className="mt-4 text-lg font-medium">No tables available</h3>
          <p className="text-muted-foreground mt-2 mb-4">
            Create your first game table to get started!
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Table
          </Button>
        </div>
      )}
      
      {/* Player list for selected table */}
      {tables.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Player Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tables.map((table) => (
              <Card key={table.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{table.game}</CardTitle>
                  <CardDescription>
                    {format(table.date, "EEEE, MMMM d, yyyy 'at' h:mm a")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="text-sm font-medium mb-2">Players:</h4>
                  <ul className="space-y-1">
                    {table.players.map((player, index) => (
                      <li key={index} className="flex items-center text-sm">
                        {index === 0 && (
                          <span className="text-xs bg-primary/20 text-primary rounded-full px-2 py-0.5 mr-2">
                            Host
                          </span>
                        )}
                        {player}
                      </li>
                    ))}
                    {Array.from(
                      { length: Math.max(0, table.maxPlayers - table.players.length) },
                      (_, i) => (
                        <li key={`empty-${i}`} className="text-sm text-muted-foreground italic">
                          Open seat
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyLink(table.link)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Invite Link
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => joinTable(table.id)}
                    disabled={
                      table.players.includes(playerName) ||
                      table.players.length >= table.maxPlayers
                    }
                  >
                    {table.players.includes(playerName)
                      ? "Joined"
                      : table.players.length >= table.maxPlayers
                      ? "Full"
                      : "Join"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameTables;
