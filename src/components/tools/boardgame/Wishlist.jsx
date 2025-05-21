
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Bookmark, BookmarkPlus, Link } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const form = useForm({
    defaultValues: {
      name: "",
      url: "",
    },
  });

  // Load wishlist from localStorage on component mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("boardgameWishlist");
    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error("Error loading wishlist from localStorage:", error);
        localStorage.removeItem("boardgameWishlist");
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (wishlistItems.length) {
      localStorage.setItem("boardgameWishlist", JSON.stringify(wishlistItems));
    }
  }, [wishlistItems]);

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      // Generate a thumbnail using a screenshot service (placeholder implementation)
      const thumbnailUrl = `https://api.microlink.io/?url=${encodeURIComponent(data.url)}&screenshot=true&meta=false&embed=screenshot.url`;
      
      // Create a new wishlist item
      const newItem = {
        id: Date.now().toString(),
        name: data.name,
        url: data.url,
        thumbnailUrl,
        reservedBy: []
      };
      
      setWishlistItems([...wishlistItems, newItem]);
      form.reset();
      toast.success("Game added to wishlist");
    } catch (error) {
      console.error("Error adding game to wishlist:", error);
      toast.error("Failed to add game to wishlist");
    } finally {
      setLoading(false);
    }
  };

  const toggleReserve = (id) => {
    setWishlistItems(items => 
      items.map(item => {
        if (item.id === id) {
          // Get user name (could be anonymous or from user input)
          const userName = prompt("Enter your name to reserve this item:", "Anonymous");
          if (!userName) return item; // User canceled the prompt
          
          // Check if user already reserved this item
          const alreadyReserved = item.reservedBy.some(
            reservation => reservation.name === userName
          );
          
          if (alreadyReserved) {
            // Remove reservation
            return {
              ...item,
              reservedBy: item.reservedBy.filter(r => r.name !== userName)
            };
          } else {
            // Add reservation
            return {
              ...item,
              reservedBy: [...item.reservedBy, { name: userName, date: new Date().toISOString() }]
            };
          }
        }
        return item;
      })
    );
  };

  const removeItem = (id) => {
    if (confirm("Are you sure you want to remove this item from your wishlist?")) {
      setWishlistItems(wishlistItems.filter(item => item.id !== id));
      toast.success("Item removed from wishlist");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h2 className="text-xl font-medium mb-4">Add Game to Wishlist</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter board game name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://boardgamegeek.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={loading}>
              <BookmarkPlus className="mr-2 h-4 w-4" />
              {loading ? "Adding..." : "Add to Wishlist"}
            </Button>
          </form>
        </Form>
      </div>

      <div>
        <h2 className="text-xl font-medium mb-4">My Wishlist</h2>
        {wishlistItems.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Your wishlist is empty. Add some games to get started!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video w-full bg-muted relative">
                  {item.thumbnailUrl ? (
                    <img 
                      src={item.thumbnailUrl} 
                      alt={item.name} 
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/600x400?text=No+Preview";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground">No image available</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold truncate">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Link className="h-4 w-4" />
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="truncate hover:underline"
                    >
                      {item.url}
                    </a>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      {item.reservedBy.length > 0 ? (
                        <div className="text-xs text-muted-foreground">
                          Reserved by: {item.reservedBy.map(r => r.name).join(", ")}
                        </div>
                      ) : null}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant={item.reservedBy.length ? "secondary" : "default"}
                        onClick={() => toggleReserve(item.id)}
                      >
                        <Bookmark className="mr-1 h-4 w-4" />
                        {item.reservedBy.length ? "Reserved" : "Reserve"}
                      </Button>
                      
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
