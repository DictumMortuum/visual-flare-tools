
import {
  Bookmark,
  Table
} from "lucide-react";

export const toolsList = [
  {
    id: "game-tables",
    title: "Board Game Tables",
    description: "Create and join board game sessions with friends",
    category: "Game Tools",
    icon: <Table className="h-5 w-5" />,
  },
  {
    id: "wishlist",
    title: "Wishlist",
    description: "Create a wishlist of items and let others reserve them for you",
    category: "wishlist",
    icon: <Bookmark className="h-5 w-5" />,
  },
];
