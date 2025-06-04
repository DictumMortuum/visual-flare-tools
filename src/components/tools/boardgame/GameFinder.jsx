
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, Users, Calendar, Filter, RotateCcw, Gamepad2, Tag, Hash, TreePine, Scale } from "lucide-react";

const ratingFilter = (min, max) => d => {
  const avg = parseFloat(d.average.replace("\"", ""));
  return min <= avg && max >= avg
}

const playersFilter = (count) => d => {
  return d.best_min_players <= count && d.best_max_players >= count
}

const GameFinder = () => {
  const [filters, setFilters] = useState({
    playerCount: 4,
    minYear: 2000,
    maxYear: new Date().getFullYear(),
    minRating: 7,
    maxRating: 10,
    minWeight: 0,
    maxWeight: 5,
    options: [],
    mechanics: [],
    categories: [],
    subdomains: [],
    families: [],
    cooperative: false,
    solitaire: false,
    team: false
  });

  const [showFilters, setShowFilters] = useState(true);

  const fetchGames = async () => {
    const rs = await fetch(`${import.meta.env.VITE_APP_ENDPOINT}/boardgames/top`, {
      method: "POST",
    });
    return rs.json();
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["game-finder"],
    queryFn: fetchGames,
    initialData: {
      options: [],
      mechanics: [],
      categories: [],
      subdomains: [],
      families: []
    },
  });

  const games = data.options
    .filter(ratingFilter(filters.minRating, filters.maxRating))
    .filter(playersFilter(filters.playerCount))

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      playerCount: 4,
      minYear: 2000,
      maxYear: new Date().getFullYear(),
      minRating: 7,
      maxRating: 10,
      minWeight: 0,
      maxWeight: 5,
      mechanics: "",
      categories: "",
      subdomains: "",
      families: "",
      cooperative: false,
      solitaire: false,
      team: false
    });
  };

  const searchGames = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Find Your Perfect Game
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover the ideal board game for your group based on player count, preferences, and game characteristics.
        </p>
      </div>

      {/* Filters */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Game Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t">
              {/* Player Count */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Player Count
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={filters.playerCount}
                  onChange={(e) => handleFilterChange("playerCount", parseInt(e.target.value) || 1)}
                  className="text-center"
                />
              </div>

              {/* Year Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Publication Year
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-8">From:</span>
                    <Slider
                      value={[filters.minYear]}
                      onValueChange={(value) => handleFilterChange("minYear", value[0])}
                      max={new Date().getFullYear()}
                      min={1900}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">{filters.minYear}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-8">To:</span>
                    <Slider
                      value={[filters.maxYear]}
                      onValueChange={(value) => handleFilterChange("maxYear", value[0])}
                      max={new Date().getFullYear()}
                      min={1900}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">{filters.maxYear}</span>
                  </div>
                </div>
              </div>

              {/* Rating Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Rating
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-8">Min:</span>
                    <Slider
                      value={[filters.minRating]}
                      onValueChange={(value) => handleFilterChange("minRating", value[0])}
                      max={10}
                      min={0}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-8">{filters.minRating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-8">Max:</span>
                    <Slider
                      value={[filters.maxRating]}
                      onValueChange={(value) => handleFilterChange("maxRating", value[0])}
                      max={10}
                      min={0}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-8">{filters.maxRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Weight Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Game Weight
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-8">Min:</span>
                    <Slider
                      value={[filters.minWeight]}
                      onValueChange={(value) => handleFilterChange("minWeight", value[0])}
                      max={5}
                      min={0}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-8">{filters.minWeight.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-8">Max:</span>
                    <Slider
                      value={[filters.maxWeight]}
                      onValueChange={(value) => handleFilterChange("maxWeight", value[0])}
                      max={5}
                      min={0}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-8">{filters.maxWeight.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Mechanics */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  Mechanics
                </Label>
                <Select value={filters.mechanics} onValueChange={(value) => handleFilterChange("mechanics", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mechanics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Mechanics</SelectItem>
                    {data.mechanics && data.mechanics.map((mechanic, index) => (
                      <SelectItem key={index} value={mechanic}>
                        {mechanic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Categories
                </Label>
                <Select value={filters.categories} onValueChange={(value) => handleFilterChange("categories", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {data.categories && data.categories.map((category, index) => (
                      <SelectItem key={index} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subdomains */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Subdomains
                </Label>
                <Select value={filters.subdomains} onValueChange={(value) => handleFilterChange("subdomains", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subdomains" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subdomains</SelectItem>
                    {data.subdomains && data.subdomains.map((subdomain, index) => (
                      <SelectItem key={index} value={subdomain}>
                        {subdomain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Families */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <TreePine className="h-4 w-4" />
                  Families
                </Label>
                <Select value={filters.families} onValueChange={(value) => handleFilterChange("families", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select families" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Families</SelectItem>
                    {data.families && data.families.map((family, index) => (
                      <SelectItem key={index} value={family}>
                        {family}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Game Types */}
              <div className="space-y-3 md:col-span-2 lg:col-span-3">
                <Label className="text-sm font-medium">Game Types</Label>
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cooperative"
                      checked={filters.cooperative}
                      onCheckedChange={(checked) => handleFilterChange("cooperative", checked)}
                    />
                    <Label htmlFor="cooperative" className="text-sm">Cooperative Games</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="solitaire"
                      checked={filters.solitaire}
                      onCheckedChange={(checked) => handleFilterChange("solitaire", checked)}
                    />
                    <Label htmlFor="solitaire" className="text-sm">Solo-Friendly Games</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="team"
                      checked={filters.team}
                      onCheckedChange={(checked) => handleFilterChange("team", checked)}
                    />
                    <Label htmlFor="team" className="text-sm">Team Games</Label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-2">
                <Button variant="outline" onClick={resetFilters}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
                <Button onClick={searchGames} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Search className="h-4 w-4 mr-2" />
                  Search Games
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Searching for games...</p>
        </div>
      )}

      {games.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Found {games.length} games</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Card key={game.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    {game.square200 && (
                      <img
                        src={game.square200}
                        alt={game.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-2">{game.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{game.year}</Badge>
                        {game.rank && <Badge variant="outline">#{game.rank}</Badge>}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {game.min_players}-{game.max_players} players
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {game.average}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {game.cooperative && <Badge className="bg-green-100 text-green-800">Cooperative</Badge>}
                    {game.solitaire && <Badge className="bg-blue-100 text-blue-800">Solo-Friendly</Badge>}
                    {game.team && <Badge className="bg-purple-100 text-purple-800">Team</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {games.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-muted/30 rounded-xl">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Ready to find games!</h3>
          <p className="text-muted-foreground">
            Set your criteria and click search to discover the perfect board games for your group.
          </p>
        </div>
      )}
    </div>
  );
};

export default GameFinder;
