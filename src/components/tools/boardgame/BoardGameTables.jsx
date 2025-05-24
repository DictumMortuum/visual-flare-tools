
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Search, Plus, Calendar, Users, MapPin, Clock, Play, UserMinus, Copy, ExternalLink } from "lucide-react";
import { format, isAfter, isBefore, addHours } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock data for BoardGameGeek API results
const mockBoardGames = [
  { id: 13, name: "Catan", year: 1995, rating: 7.2, minPlayers: 3, maxPlayers: 4, playTime: 90 },
  { id: 9209, name: "Ticket to Ride", year: 2004, rating: 7.4, minPlayers: 2, maxPlayers: 5, playTime: 60 },
  { id: 30549, name: "Pandemic", year: 2008, rating: 7.6, minPlayers: 2, maxPlayers: 4, playTime: 45 },
  { id: 68448, name: "7 Wonders", year: 2010, rating: 7.7, minPlayers: 2, maxPlayers: 7, playTime: 30 },
  { id: 230802, name: "Azul", year: 2017, rating: 7.8, minPlayers: 2, maxPlayers: 4, playTime: 45 },
  { id: 266192, name: "Wingspan", year: 2019, rating: 8.1, minPlayers: 1, maxPlayers: 5, playTime: 90 },
  { id: 174430, name: "Gloomhaven", year: 2017, rating: 8.7, minPlayers: 1, maxPlayers: 4, playTime: 120 },
  { id: 167791, name: "Terraforming Mars", year: 2016, rating: 8.4, minPlayers: 1, maxPlayers: 5, playTime: 120 },
  { id: 169786, name: "Scythe", year: 2016, rating: 8.2, minPlayers: 1, maxPlayers: 5, playTime: 115 },
  { id: 224517, name: "Brass: Birmingham", year: 2018, rating: 8.6, minPlayers: 2, maxPlayers: 4, playTime: 120 },
];

// Mock data for tables
const initialTables = [
  {
    id: "t1",
    gameId: 13,
    gameName: "Catan",
    gameYear: 1995,
    dateTime: new Date(2025, 5, 26, 18, 0),
    creator: "Alice Johnson",
    maxPlayers: 4,
    players: ["Alice Johnson", "Bob Smith"],
    location: "Downtown Board Game Café",
    estimatedDuration: 90,
    status: "waiting", // waiting, started, completed
    createdAt: new Date(2025, 5, 24, 10, 0),
  },
  {
    id: "t2",
    gameId: 174430,
    gameName: "Gloomhaven",
    gameYear: 2017,
    dateTime: new Date(2025, 5, 27, 14, 0),
    creator: "Charlie Brown",
    maxPlayers: 4,
    players: ["Charlie Brown", "Diana Prince", "Ethan Hunt"],
    location: "Charlie's House, 123 Main St",
    estimatedDuration: 180,
    status: "waiting",
    createdAt: new Date(2025, 5, 24, 15, 30),
  },
];

const BoardGameTables = () => {
  const [tables, setTables] = useState(initialTables);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gameResults, setGameResults] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [playerName, setPlayerName] = useState(localStorage.getItem("boardgame_player_name") || "");

  const form = useForm({
    defaultValues: {
      gameId: "",
      gameName: "",
      maxPlayers: 4,
      dateTime: new Date(),
      location: "",
      estimatedDuration: 60,
    },
  });

  const searchGames = (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
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
    form.setValue("gameId", game.id.toString());
    form.setValue("gameName", game.name);
    form.setValue("maxPlayers", game.maxPlayers);
    form.setValue("estimatedDuration", game.playTime);
    setShowResults(false);
    setSearchQuery(game.name);
  };

  const createTable = (data) => {
    const newTable = {
      id: `t${Date.now()}`,
      gameId: parseInt(data.gameId),
      gameName: data.gameName,
      gameYear: selectedGame?.year || 2024,
      dateTime: data.dateTime,
      creator: playerName || "Anonymous",
      maxPlayers: data.maxPlayers,
      players: [playerName || "Anonymous"],
      location: data.location,
      estimatedDuration: data.estimatedDuration,
      status: "waiting",
      createdAt: new Date(),
    };

    setTables([...tables, newTable]);
    setShowCreateForm(false);
    form.reset();
    setSelectedGame(null);
    setSearchQuery("");
    toast.success("Game table created successfully!");
  };

  const joinTable = (tableId) => {
    if (!playerName.trim()) {
      toast.error("Please enter your name before joining a table");
      return;
    }

    setTables(tables.map(table => {
      if (table.id === tableId) {
        if (table.players.includes(playerName)) {
          toast.error("You're already at this table!");
          return table;
        }
        
        if (table.players.length >= table.maxPlayers) {
          toast.error("This table is full!");
          return table;
        }
        
        toast.success(`You've joined ${table.gameName}!`);
        return {
          ...table,
          players: [...table.players, playerName],
        };
      }
      return table;
    }));
  };

  const leaveTable = (tableId) => {
    setTables(tables.map(table => {
      if (table.id === tableId) {
        if (!table.players.includes(playerName)) {
          toast.error("You're not at this table!");
          return table;
        }
        
        if (table.creator === playerName) {
          toast.error("Table creator cannot leave. Delete the table instead.");
          return table;
        }
        
        toast.success(`You've left ${table.gameName}`);
        return {
          ...table,
          players: table.players.filter(player => player !== playerName),
        };
      }
      return table;
    }));
  };

  const startGame = (tableId) => {
    setTables(tables.map(table => {
      if (table.id === tableId && table.creator === playerName) {
        toast.success(`${table.gameName} has started! Table removed from listings.`);
        return {
          ...table,
          status: "started",
        };
      }
      return table;
    }));
  };

  const deleteTable = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    if (table && table.creator === playerName) {
      setTables(tables.filter(t => t.id !== tableId));
      toast.success("Table deleted successfully");
    } else {
      toast.error("Only the table creator can delete the table");
    }
  };

  const copyTableLink = (tableId) => {
    const link = `${window.location.origin}${window.location.pathname}#/tools/game-tables?table=${tableId}`;
    navigator.clipboard.writeText(link)
      .then(() => toast.success("Table link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy link"));
  };

  const savePlayerName = () => {
    if (playerName.trim()) {
      localStorage.setItem("boardgame_player_name", playerName.trim());
      toast.success("Your name has been saved!");
    }
  };

  // Filter tables to show only current ones (not started)
  const currentTables = tables.filter(table => 
    table.status === "waiting" && isAfter(table.dateTime, new Date())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Board Game Tables
        </h1>
        <p className="text-muted-foreground">
          Create and join board game sessions in your area
        </p>
      </div>

      {/* Player name input */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex-1">
              <Label htmlFor="player-name" className="text-sm font-medium">Your Name</Label>
              <Input
                id="player-name"
                placeholder="Enter your display name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <Button onClick={savePlayerName} className="bg-blue-600 hover:bg-blue-700">
              Save Name
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create table button */}
      <div className="flex justify-center">
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
              <form onSubmit={form.handleSubmit(createTable)} className="space-y-6">
                {/* Game Search */}
                <FormField
                  control={form.control}
                  name="gameName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Board Game</FormLabel>
                      <div className="relative">
                        <Input
                          placeholder="Search for a board game..."
                          value={searchQuery}
                          onChange={(e) => searchGames(e.target.value)}
                          className="pl-9"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        
                        {showResults && gameResults.length > 0 && (
                          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {gameResults.map(game => (
                              <div
                                key={game.id}
                                className="p-3 hover:bg-muted cursor-pointer border-b last:border-0"
                                onClick={() => selectGame(game)}
                              >
                                <div className="font-medium">{game.name}</div>
                                <div className="text-xs text-muted-foreground flex gap-4 mt-1">
                                  <span>BGG ID: {game.id}</span>
                                  <span>{game.year}</span>
                                  <span>{game.minPlayers}-{game.maxPlayers} players</span>
                                  <span>{game.playTime} min</span>
                                  <span>★ {game.rating}</span>
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
                            max="12"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Estimated Duration */}
                  <FormField
                    control={form.control}
                    name="estimatedDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="15"
                            max="480"
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
      </div>

      {/* Tables Grid */}
      {currentTables.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentTables.map((table) => (
            <Card key={table.id} className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      {table.gameName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span>BGG ID: {table.gameId}</span>
                      <span>•</span>
                      <span>{table.gameYear}</span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyTableLink(table.id)}
                      title="Copy table link"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://boardgamegeek.com/boardgame/${table.gameId}`, '_blank')}
                      title="View on BoardGameGeek"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>{format(table.dateTime, "EEEE, MMMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span>~{table.estimatedDuration} minutes</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span>{table.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>{table.players.length}/{table.maxPlayers} players</span>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Players:</h4>
                    <div className="flex flex-wrap gap-2">
                      {table.players.map((player, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs ${
                            index === 0 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {player} {index === 0 && '(Host)'}
                        </span>
                      ))}
                      {Array.from({ length: table.maxPlayers - table.players.length }, (_, i) => (
                        <span key={`empty-${i}`} className="px-2 py-1 rounded-full text-xs bg-gray-50 text-gray-400 border-2 border-dashed border-gray-300 dark:bg-gray-800 dark:border-gray-600">
                          Open seat
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                <div className="flex gap-2">
                  {table.creator === playerName ? (
                    <>
                      <Button
                        onClick={() => startGame(table.id)}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Game
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteTable(table.id)}
                      >
                        Delete
                      </Button>
                    </>
                  ) : table.players.includes(playerName) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => leaveTable(table.id)}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Leave Table
                    </Button>
                  ) : (
                    <Button
                      onClick={() => joinTable(table.id)}
                      disabled={table.players.length >= table.maxPlayers}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {table.players.length >= table.maxPlayers ? 'Table Full' : 'Join Table'}
                    </Button>
                  )}
                </div>
                
                <span className="text-xs text-muted-foreground">
                  Created {format(table.createdAt, "MMM d 'at' h:mm a")}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6">
              <Table className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Game Tables Available</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Be the first to create a board game table! Gather your friends and start playing.
            </p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Table
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BoardGameTables;
