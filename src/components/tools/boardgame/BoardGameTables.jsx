
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {v4 as uuidv4} from 'uuid';
import { Plus, Calendar, Users, MapPin, Play, UserMinus, Copy, ExternalLink, Clock, Crown, Gamepad2 } from "lucide-react";
import { format, isAfter } from "date-fns";
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { UserContext } from '../../../context';
import BoardGameTablesDialog from './BoardGameTablesDialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TableRouter = () => {
  const { id } = useParams();
  const { state: { user } } = React.useContext(UserContext);

  const fetchTable = async ({ id }) => {
    const rs = await fetch(`${import.meta.env.VITE_APP_ENDPOINT}/rest/tables/${id}`);
    return rs.json();
  }

  const { data, isLoading } = useQuery({
    queryKey: ["table", id],
    queryFn: () => fetchTable({ id }),
    initialData: {
      date: new Date(),
      participants: [],
      boardgame: {
        date: new Date(),
      },
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log(data);

  return <Table table={data} email={user.email} />;
}

const Container = ({ email }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (email === null) {
      navigate("/login");
    }
  }, [email, navigate]);

  const fetchTables = async () => {
    const rs = await fetch(`${import.meta.env.VITE_APP_ENDPOINT}/rest/tables`);
    return rs.json();
  }

  const { data, isLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: () => fetchTables(),
    initialData: [],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <BoardGameTables data={data} email={email} />;
}

const BoardGameTables = ({ data, email }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const d = new Date();
  d.setHours(0);
  d.setMinutes(0);

  const currentTables = data.filter(table =>
    isAfter(table.date, d)
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
          <Gamepad2 className="h-4 w-4" />
          Board Game Tables
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Find Your Next Game Night</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join existing tables or create your own to gather fellow board game enthusiasts
        </p>
      </div>

      {/* Create Table CTA */}
      <div className="flex justify-center">
        <BoardGameTablesDialog email={email} showCreateForm={showCreateForm} setShowCreateForm={setShowCreateForm} />
      </div>

      {/* Tables Grid */}
      {currentTables.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">Available Tables</h2>
            <div className="text-sm text-muted-foreground">
              {currentTables.length} {currentTables.length === 1 ? 'table' : 'tables'} available
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentTables.map((table) => (
              <Table key={table.id} table={table} email={email} />
            ))}
          </div>
        </div>
      ) : (
        <Card className="text-center py-16 border-dashed border-2 bg-gradient-to-br from-muted/20 to-muted/5">
          <CardContent className="space-y-6">
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <Gamepad2 className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">No Game Tables Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto text-lg">
                Be the first to create a table and start building your gaming community!
              </p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Table
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const CopyLinkButton = ({ id }) => {
  const onClick = () => {
    const link = `${window.location.origin}${window.location.pathname}#/table/${id}`;
    navigator.clipboard.writeText(link)
      .then(() => toast.success("Table link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy link"));
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      title="Copy table link"
    >
      <Copy className="h-4 w-4" />
    </Button>
  );
}

const StartButton = ({ id }) => {
  const onClick = () => {
    console.log("Clicked", id)
    // setTables(tables.map(table => {
    //   if (table.id === tableId && table.creator === email) {
    //     toast.success(`${table.boardgame.name} has started! Table removed from listings.`);
    //     return {
    //       ...table,
    //       status: "started",
    //     };
    //   }
    //   return table;
    // }));
  };

  return (
    <Button
      onClick={onClick}
      className="bg-green-600 hover:bg-green-700 shadow-md"
      size="sm"
    >
      <Play className="h-4 w-4 mr-2" />
      Start Game
    </Button>
  );
}

const DeleteButton = ({ id }) => {
  const queryClient = useQueryClient();

  const deleteTable = async ({ id }) => {
    const rs = await fetch(`${import.meta.env.VITE_APP_ENDPOINT}/rest/tables/${id}`, {
      method: "DELETE",
    });
    return rs.json();
  }

  const { mutate } = useMutation({
    mutationFn: deleteTable,
    onSuccess: (data, variables, context) => {
      toast.info('Your table was successfully deleted.');
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: (error, variables, context) => {
      toast.error('Something went wrong, please try again');
    }
  });

  const onClick = () => {
    mutate({ id });
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onClick}
    >
      Delete
    </Button>
  )
}

const LeaveButton = ({ id }) => {
  const queryClient = useQueryClient();

  const deleteTableParticipant = async ({ id }) => {
    const rs = await fetch(`${import.meta.env.VITE_APP_ENDPOINT}/rest/tableparticipants/${id}`, {
      method: "DELETE",
    });
    return rs.json();
  }

  const { mutate } = useMutation({
    mutationFn: deleteTableParticipant,
    onSuccess: (data, variables, context) => {
      toast.info('Left table.');
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: (error, variables, context) => {
      toast.error('Something went wrong, please try again');
    }
  });

  const onClick = () => {
    mutate({ id });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
    >
      <UserMinus className="h-4 w-4 mr-2" />
      Leave Table
    </Button>
  )
}

const JoinButton = ({ table, email }) => {
  const queryClient = useQueryClient();

  const createTableParticipant = async payload => {
    const rs = await fetch(`${import.meta.env.VITE_APP_ENDPOINT}/rest/tableparticipants`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return rs.json();
  }

  const { mutate } = useMutation({
    mutationFn: createTableParticipant,
    onSuccess: (data, variables, context) => {
      toast.info('Joined table.');
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: (error, variables, context) => {
      toast.error('Something went wrong, please try again');
    }
  });

  const onClick = () => {
    mutate({
      table_id: table.id,
      user_id: uuidv4(),
      name: email,
    });
  }

  return (
    <Button
      onClick={onClick}
      disabled={table.participants.length >= table.seats}
      size="sm"
      className="bg-blue-600 hover:bg-blue-700"
    >
      <Users className="h-4 w-4 mr-2" />
      {table.participants.length >= table.seats ? 'Table Full' : 'Join Table'}
    </Button>
  )
}

const Table = ({ table, email }) => {
  const participants = table.participants.map(d => d.name);
  const participant = table.participants.filter(d => d.name === email);
  const isHost = table.creator === email;
  const isParticipant = participants.includes(email);
  const isFull = table.participants.length >= table.seats;

  return (
    <Card className="group overflow-hidden border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
      {/* Game Header */}
      <CardHeader className="relative bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-b">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative">
              <img
                src={table.boardgame.square200}
                alt={table.boardgame.name}
                className="w-16 h-16 rounded-xl object-cover shadow-lg ring-2 ring-white/20"
              />
              {isHost && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1">
                  <Crown className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl font-bold text-foreground truncate">
                {table.boardgame.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1 text-sm">
                <span>BGG #{table.boardgame_id}</span>
                <span>•</span>
                <span>{table.gameYear}</span>
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <CopyLinkButton id={table.id} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`https://boardgamegeek.com/boardgame/${table.boardgame_id}`, '_blank')}
              title="View on BoardGameGeek"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Game Details */}
      <CardContent className="pt-6 space-y-4 flex-1">
        <div className="grid gap-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-medium">{format(table.date, "EEEE, MMMM d")}</div>
              <div className="text-muted-foreground text-xs">{format(table.date, "h:mm a")}</div>
            </div>
          </div>

          {table.location && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/20">
                <MapPin className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <span className="truncate">{table.location}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{table.participants.length}/{table.seats} players</span>
              {isFull && (
                <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 px-2 py-0.5 rounded-full">
                  Full
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Players Section */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Players</h4>
          <div className="space-y-2">
            {table.participants.map((player, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border border-yellow-200/50 dark:border-yellow-800/50'
                    : 'bg-muted/50'
                }`}
              >
                {index === 0 && <Crown className="h-3 w-3 text-yellow-600" />}
                <span className="font-medium">{player.name}</span>
                {index === 0 && <span className="text-xs text-yellow-700 dark:text-yellow-400">(Host)</span>}
              </div>
            ))}
            {Array.from({ length: table.seats - table.participants.length }, (_, i) => (
              <div key={`empty-${i}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border-2 border-dashed border-muted bg-muted/20">
                <div className="w-3 h-3 rounded-full bg-muted-foreground/20"></div>
                <span className="text-muted-foreground italic">Open seat</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Action Footer */}
      <CardFooter className="border-t bg-muted/20 flex justify-between items-center p-4 mt-auto">
        <div className="flex items-center">
          {isHost && <DeleteButton id={table.id} />}
        </div>
        <div className="flex items-center">
          {isParticipant ? (
            <LeaveButton id={participant[0].id} />
          ) : (
            <JoinButton table={table} email={email} />
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

export default Container;
export {
  TableRouter
};
