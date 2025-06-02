
import {
  Bookmark,
  Table,
  Search
} from "lucide-react";

export const toolsList = [
  {
    id: "tables",
    title: "Tables",
    description: "Create and join board game sessions with friends",
    category: "Game Tools",
    icon: <Table className="h-5 w-5" />,
  },
  {
    id: "game-finder",
    title: "Game Finder",
    description: "Find the perfect board game for your group based on players, preferences, and more",
    category: "Game Tools",
    icon: <Search className="h-5 w-5" />,
  },
  {
    id: "wishlist",
    title: "Wishlist",
    description: "Create a wishlist of items and let others reserve them for you",
    category: "wishlist",
    icon: <Bookmark className="h-5 w-5" />,
  },
];
