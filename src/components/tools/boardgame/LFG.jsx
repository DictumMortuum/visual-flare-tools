
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Users, Clock, Plus, Search, Filter } from "lucide-react";

const LFG = () => {
  const [activeTab, setActiveTab] = useState("browse");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    game: "",
    playerCount: "",
    timeSlot: ""
  });

  // Mock data for groups
  const mockGroups = [
    {
      id: 1,
      title: "Weekly Catan Night",
      game: "Catan",
      host: "Alex",
      location: "Downtown Community Center",
      date: "Every Thursday",
      time: "7:00 PM - 10:00 PM",
      currentPlayers: 2,
      maxPlayers: 4,
      description: "Looking for 2 more players for our weekly Catan sessions. Beginners welcome!",
      tags: ["Strategy", "Beginner Friendly", "Regular"]
    },
    {
      id: 2,
      title: "D&D One-Shot Adventure",
      game: "Dungeons & Dragons",
      host: "Sarah",
      location: "Central Library - Meeting Room B",
      date: "Saturday, Dec 14",
      time: "2:00 PM - 6:00 PM",
      currentPlayers: 3,
      maxPlayers: 5,
      description: "Join us for a fun one-shot adventure! All experience levels welcome. Characters will be pre-made.",
      tags: ["RPG", "One-shot", "Beginner Friendly"]
    },
    {
      id: 3,
      title: "Competitive Wingspan Tournament",
      game: "Wingspan",
      host: "Mike",
      location: "Board Game Cafe",
      date: "Sunday, Dec 15",
      time: "1:00 PM - 5:00 PM",
      currentPlayers: 6,
      maxPlayers: 8,
      description: "Tournament style play with prizes! Advanced players preferred.",
      tags: ["Tournament", "Competitive", "Advanced"]
    }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const CreateGroupForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create a New Group
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="groupTitle">Group Title</Label>
            <Input id="groupTitle" placeholder="e.g., Weekly Game Night" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="game">Game</Label>
            <Input id="game" placeholder="e.g., Catan, Wingspan, etc." />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="e.g., Community Center, Home, etc." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxPlayers">Max Players</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select max players" />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5, 6, 7, 8].map(num => (
                  <SelectItem key={num} value={num.toString()}>{num} players</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input id="time" placeholder="e.g., 7:00 PM - 10:00 PM" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            placeholder="Describe your group, experience level, any special rules, etc."
            rows={3}
          />
        </div>

        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </CardContent>
    </Card>
  );

  const GroupCard = ({ group }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{group.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Hosted by {group.host}</p>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            {group.game}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{group.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{group.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{group.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{group.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{group.currentPlayers}/{group.maxPlayers} players</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {group.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <Button className="w-full">
          Join Group
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Looking for Group
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find and join board game groups in your area, or create your own group to gather fellow players.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === "browse" ? "default" : "ghost"}
          onClick={() => setActiveTab("browse")}
          className="rounded-b-none"
        >
          <Search className="h-4 w-4 mr-2" />
          Browse Groups
        </Button>
        <Button
          variant={activeTab === "create" ? "default" : "ghost"}
          onClick={() => setActiveTab("create")}
          className="rounded-b-none"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Browse Groups Tab */}
      {activeTab === "browse" && (
        <div className="space-y-6">
          {/* Filters */}
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search & Filter
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search groups by game, location, or description..." className="pl-9" />
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="Enter location"
                      value={filters.location}
                      onChange={(e) => handleFilterChange("location", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Game</Label>
                    <Input
                      placeholder="Enter game name"
                      value={filters.game}
                      onChange={(e) => handleFilterChange("game", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Player Count</Label>
                    <Select value={filters.playerCount} onValueChange={(value) => handleFilterChange("playerCount", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any size</SelectItem>
                        <SelectItem value="2-4">2-4 players</SelectItem>
                        <SelectItem value="5-6">5-6 players</SelectItem>
                        <SelectItem value="7+">7+ players</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Select value={filters.timeSlot} onValueChange={(value) => handleFilterChange("timeSlot", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any time</SelectItem>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                        <SelectItem value="weekend">Weekend</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Groups List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        </div>
      )}

      {/* Create Group Tab */}
      {activeTab === "create" && <CreateGroupForm />}
    </div>
  );
};

export default LFG;
