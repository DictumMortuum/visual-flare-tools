
import {
  Bookmark,
  Table,
  Search,
  Timer,
  Users,
  User,
  Trophy
} from "lucide-react";

export const toolsList = [
  {
    id: "tables",
    title: "Tables",
    description: "Create and join board game sessions with friends",
    category: "boardgames",
    icon: <Table className="h-5 w-5" />,
  },
  // {
  //   id: "game-finder",
  //   title: "Finder",
  //   description: "Find the perfect board game for your group based on players, preferences, and more",
  //   category: "boardgames",
  //   icon: <Search className="h-5 w-5" />,
  // },
  {
    id: "timer",
    title: "Timer",
    description: "Multi-player chess clock to track thinking time for each player",
    category: "boardgames",
    icon: <Timer className="h-5 w-5" />,
  },
  {
    id: "player-profile",
    title: "Player Profile",
    description: "Track your board game journey, stats, and discover your gaming patterns",
    category: "boardgames",
    icon: <User className="h-5 w-5" />,
  },
  {
    id: "lfg",
    title: "LFG",
    description: "Find groups of players who want to meet and play board games you like",
    category: "boardgames",
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: "eurovision-nomination",
    title: "Eurovision Nomination",
    description: "Nominate your favorite games for the Eurovision Boardgame Competition",
    category: "boardgames",
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    id: "wishlist",
    title: "Wishlist",
    description: "Create a wishlist of items and let others reserve them for you",
    category: "wishlist",
    icon: <Bookmark className="h-5 w-5" />,
  },
];
