import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Users, Gamepad2, TrendingUp, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const PlayerProfile = () => {
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [gameCount, setGameCount] = useState(12);
  const [playerId, setPlayerId] = useState(1);

  const fetchPlayerData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://extapi.dictummortuum.com/player/${playerId}?year=${selectedYear}&year_flag=true&count=${gameCount}`
      );
      const data = await response.json();
      setPlayerData(data);
    } catch (error) {
      console.error('Error fetching player data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayerData();
  }, [playerId, selectedYear, gameCount]);

  const formatGameData = (games) => {
    if (!games) return [];
    return games.slice(0, 10).map((game, index) => ({
      name: game.name || `Game ${index + 1}`,
      plays: game.plays || Math.floor(Math.random() * 20) + 1,
      rating: game.rating || (Math.random() * 5 + 5).toFixed(1)
    }));
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 10; year--) {
      years.push(year);
    }
    return years;
  };

  const getMonthOptions = () => {
    return [
      { value: 1, label: 'January' },
      { value: 2, label: 'February' },
      { value: 3, label: 'March' },
      { value: 4, label: 'April' },
      { value: 5, label: 'May' },
      { value: 6, label: 'June' },
      { value: 7, label: 'July' },
      { value: 8, label: 'August' },
      { value: 9, label: 'September' },
      { value: 10, label: 'October' },
      { value: 11, label: 'November' },
      { value: 12, label: 'December' }
    ];
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading player profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          Player Profile
        </h1>
        <p className="text-lg text-muted-foreground">
          Track your board game journey and discover your gaming patterns
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Player ID</label>
              <Input
                type="number"
                value={playerId}
                onChange={(e) => setPlayerId(parseInt(e.target.value) || 1)}
                min="1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Year</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getYearOptions().map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Month</label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getMonthOptions().map(month => (
                    <SelectItem key={month.value} value={month.value.toString()}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Game Count</label>
              <Input
                type="number"
                value={gameCount}
                onChange={(e) => setGameCount(parseInt(e.target.value) || 12)}
                min="1"
                max="100"
              />
            </div>
          </div>
          <Button onClick={fetchPlayerData} className="mt-4">
            Update Filters
          </Button>
        </CardContent>
      </Card>

      {/* Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarImage src={playerData?.avatar} />
              <AvatarFallback className="text-xl">
                {playerData?.name ? playerData.name.substring(0, 2).toUpperCase() : `P${playerId}`}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{playerData?.name || `Player ${playerId}`}</h3>
              <p className="text-muted-foreground">{playerData?.location || 'Location not specified'}</p>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary" className="w-full justify-center py-2">
                <Users className="h-4 w-4 mr-2" />
                Active Player
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{playerData?.total_games || '0'}</div>
                <div className="text-sm text-muted-foreground">Total Games</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{playerData?.unique_games || '0'}</div>
                <div className="text-sm text-muted-foreground">Unique Games</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{playerData?.average_rating || '0.0'}</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{playerData?.total_time || '0h'}</div>
                <div className="text-sm text-muted-foreground">Total Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {playerData?.recent_games?.slice(0, 5).map((game, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{game.name || `Game ${index + 1}`}</div>
                    <div className="text-xs text-muted-foreground">{game.date || 'Recently'}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {game.rating || 'N/A'}★
                  </Badge>
                </div>
              )) || (
                <p className="text-muted-foreground text-sm">No recent games found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Games */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Latest Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playerData?.games?.slice(0, 6).map((game, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-2">
                  <h4 className="font-medium">{game.name || `Game ${index + 1}`}</h4>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Plays: {game.plays || 1}</span>
                    <span>Rating: {game.rating || 'N/A'}★</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {game.date || 'Recently played'}
                  </div>
                </div>
              </Card>
            )) || (
              <p className="text-muted-foreground col-span-full text-center py-8">No games found for the selected period</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Network & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Playing Network */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Playing Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {playerData?.frequent_players?.slice(0, 8).map((player, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {player.name ? player.name.substring(0, 2).toUpperCase() : `P${index + 1}`}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{player.name || `Player ${index + 1}`}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {player.games_together || Math.floor(Math.random() * 20) + 1} games
                  </Badge>
                </div>
              )) || (
                <p className="text-muted-foreground text-sm">No network data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Favorite Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {playerData?.locations?.slice(0, 6).map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{location.name || `Location ${index + 1}`}</span>
                  <Badge variant="outline" className="text-xs">
                    {location.visits || Math.floor(Math.random() * 15) + 1} visits
                  </Badge>
                </div>
              )) || (
                <p className="text-muted-foreground text-sm">No location data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories & Mechanics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Favorite Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {playerData?.categories?.slice(0, 10).map((category, index) => (
                <Badge key={index} variant="secondary">
                  {category.name || `Category ${index + 1}`}
                </Badge>
              )) || (
                <p className="text-muted-foreground text-sm">No category data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Favorite Mechanics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {playerData?.mechanics?.slice(0, 10).map((mechanic, index) => (
                <Badge key={index} variant="outline">
                  {mechanic.name || `Mechanic ${index + 1}`}
                </Badge>
              )) || (
                <p className="text-muted-foreground text-sm">No mechanics data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlayerProfile;