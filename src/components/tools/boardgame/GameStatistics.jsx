
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Trophy, Clock, Hash, ArrowLeft } from "lucide-react";

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'];

const GameStatistics = ({ players, onBack, currentRound }) => {
  const totalTime = players.reduce((sum, player) => sum + player.totalTime, 0);
  
  const chartData = players.map((player, index) => ({
    name: player.name,
    value: player.totalTime,
    percentage: totalTime > 0 ? ((player.totalTime / totalTime) * 100).toFixed(1) : 0,
    fill: COLORS[index % COLORS.length]
  }));

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Game Statistics
        </h2>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Timer
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                time: {
                  label: "Time"
                }
              }}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <PieChart>
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [formatTime(value), name]}
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Game Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Game Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <Badge variant="outline" className="text-lg px-4 py-2">
                Round {currentRound}
              </Badge>
              <div className="text-2xl font-bold">
                Total Game Time: {formatTime(totalTime)}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Player Rankings
              </h4>
              {players
                .sort((a, b) => b.totalTime - a.totalTime)
                .map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{player.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold">{formatTime(player.totalTime)}</div>
                      <div className="text-sm text-muted-foreground">
                        {player.turns} turn{player.turns !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Player Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player, index) => (
              <Card key={player.id} className="border-2" style={{ borderColor: COLORS[index % COLORS.length] + '40' }}>
                <CardContent className="pt-4">
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold" style={{ color: COLORS[index % COLORS.length] }}>
                      {player.name}
                    </h3>
                    <div className="text-2xl font-mono font-bold">
                      {formatTime(player.totalTime)}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>{player.turns} total turns</div>
                      <div>{totalTime > 0 ? ((player.totalTime / totalTime) * 100).toFixed(1) : 0}% of total time</div>
                      <div>
                        Avg per turn: {formatTime(player.turns > 0 ? Math.round(player.totalTime / player.turns) : 0)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameStatistics;
