import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {v4 as uuidv4} from 'uuid';
import { Plus, Calendar, Users, MapPin, Play, UserMinus, Copy, ExternalLink } from "lucide-react";
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
    return <>Loading...</>;
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
    return <>Loading...</>;
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
    <div className="space-y-8">
      <div className="flex justify-center">
        <BoardGameTablesDialog email={email} showCreateForm={showCreateForm} setShowCreateForm={setShowCreateForm} />
      </div>

      {/* Tables Grid */}
      {currentTables.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentTables.map((table) => (
            <Table key={table.id} table={table} email={email} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6">
              {/* <Table className="h-12 w-12 text-blue-600 dark:text-blue-400" /> */}
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
      className="bg-green-600 hover:bg-green-700"
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

  return (
    <Card key={table.id} className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <img
              src={table.boardgame.square200}
              alt={table.boardgame.name}
              className="w-16 h-16 rounded-lg object-cover shadow-md"
            />
            <div>
              <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">
                {table.boardgame.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span>BGG ID: {table.boardgame_id}</span>
                <span>•</span>
                <span>{table.gameYear}</span>
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
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

      <CardContent className="pt-4 flex-1">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span>{format(table.date, "EEEE, MMMM d, yyyy 'at' h:mm a")}</span>
          </div>

          {table.location !== undefined && <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-red-600" />
            <span>{table.location}</span>
          </div>}

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-purple-600" />
            <span>{table.participants.length}/{table.seats} players</span>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Players:</h4>
            <div className="flex flex-wrap gap-2">
              {table.participants.map((player, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs ${
                    index === 0
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {player.name} {index === 0 && '(Host)'}
                </span>
              ))}
              {Array.from({ length: table.seats - table.participants.length }, (_, i) => (
                <span key={`empty-${i}`} className="px-2 py-1 rounded-full text-xs bg-gray-50 text-gray-400 border-2 border-dashed border-gray-300 dark:bg-gray-800 dark:border-gray-600">
                  Open seat
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center p-4 mt-auto">
        <div className="flex items-center">
          {table.creator === email && <DeleteButton id={table.id} />}
        </div>
        <div className="flex items-center">
          {participants.includes(email) ? (
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
