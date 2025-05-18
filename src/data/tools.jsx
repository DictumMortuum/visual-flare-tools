
import { 
  Dices, 
  Chess, // Replacing ChessKnight with Chess
  Calculator, 
  Timer, 
  Users, 
  Trophy,
  Clock,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Circle,
  SquareStack,
  Star
} from "lucide-react";

export const toolsList = [
  {
    id: "dice-roller",
    title: "Dice Roller",
    description: "Roll any combination of dice with customizable modifiers",
    category: "Game Tools",
    icon: <Dices className="h-5 w-5" />,
  },
  {
    id: "turn-tracker",
    title: "Turn Tracker",
    description: "Keep track of player turns and round markers",
    category: "Game Tools",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    id: "score-calculator",
    title: "Score Calculator",
    description: "Calculate and track scores for multiple players",
    category: "Utilities",
    icon: <Calculator className="h-5 w-5" />,
  },
  {
    id: "game-timer",
    title: "Game Timer",
    description: "Set timers for turns, rounds or total game time",
    category: "Utilities",
    icon: <Timer className="h-5 w-5" />,
  },
  {
    id: "team-generator",
    title: "Team Generator",
    description: "Create random teams from a list of players",
    category: "Players",
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: "first-player-picker",
    title: "First Player Picker",
    description: "Randomly determine who goes first",
    category: "Players",
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    id: "chess-timer",
    title: "Chess Timer",
    description: "Two-player chess clock with multiple time control options",
    category: "Specific Games",
    icon: <Chess className="h-5 w-5" />, // Changed from ChessKnight to Chess
  },
  {
    id: "token-tracker",
    title: "Token Tracker",
    description: "Track different types of tokens or resources during gameplay",
    category: "Game Tools",
    icon: <Circle className="h-5 w-5" />,
  },
  {
    id: "card-shuffler",
    title: "Card Shuffler",
    description: "Virtual card shuffler and drawer",
    category: "Game Tools",
    icon: <SquareStack className="h-5 w-5" />,
  },
  {
    id: "rating-calculator",
    title: "Rating Calculator",
    description: "Calculate and track ELO ratings for competitive games",
    category: "Utilities",
    icon: <Star className="h-5 w-5" />,
  },
];
