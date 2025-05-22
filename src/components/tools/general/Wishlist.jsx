
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bookmark, BookmarkPlus, Link, RefreshCw, Copy, CheckSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from 'sonner';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { UserContext } from '../../../context';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const WishlistRouter = () => {
  const { email } = useParams();
  return <Container email={email} />;
}

const Container = ({ email }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (email === null) {
      navigate("/login");
    }
  }, [email, navigate]);

  const fetchWishlist = async ({ email }) => {
    const rs = await fetch(`${import.meta.env.VITE_APP_ENDPOINT}/rest/wishlist?filter={"email":"${email}"}`);
    return rs.json();
  }

  const { data, isLoading } = useQuery({
    queryKey: ["wishlist", email],
    queryFn: () => fetchWishlist({ email }),
    enabled: !!email,
    initialData: [],
  });

  if (isLoading) {
    return <>Loading...</>;
  }

  return <Wishlist data={data} email={email} />
}

const Wishlist = ({ data, email }) => {
  const { state: { user } } = React.useContext(UserContext);
  const isEditor = user.email === email;
  const [copied, setCopied] = React.useState(false);
  
  const copyUrlToClipboard = () => {
    const wishlistUrl = `${window.location.origin}/#/wishlist/${email}`;
    navigator.clipboard.writeText(wishlistUrl).then(() => {
      setCopied(true);
      toast.success('Wishlist URL copied to clipboard!');
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      toast.error('Failed to copy URL');
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="space-y-6">
      {isEditor && <AddForm email={email} user_id={email} />}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-medium">{email}'s wishlist</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={copyUrlToClipboard}
                >
                  {copied ? <CheckSquare className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy wishlist URL</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {data.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Your wishlist is empty. Add some items to get started!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.map((item) => (
              <WishlistItem key={item.id} item={item} isEditor={isEditor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const WishlistItem = ({ item, isEditor }) => {
  return (
    <Card key={item.id} className="overflow-hidden">
      <div className="aspect-video w-full bg-muted relative">
        {item.url ? (
          <img
            src={`${import.meta.env.VITE_APP_ENDPOINT}/rest/wishlist/${item.id}/screenshot`}
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
            {isEditor && <DeleteButton id={item.id} />}
          </div>

          <div className="flex gap-2">
            {isEditor && <RefreshScreenshotButton id={item.id} />}
            <ReserveButton item={item} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const DeleteButton = ({ id }) => {
  const queryClient = useQueryClient();

  const deleteWishlistItem = async () => {
    return fetch(`${import.meta.env.VITE_APP_ENDPOINT}/rest/wishlist/${id}`, {
      method: "DELETE",
    }).then(res => res.json());
  }

  const { isPending, mutate } = useMutation({
    mutationFn: deleteWishlistItem,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error, variables, context) => {
      toast.error('Something went wrong, please try again');
    }
  });

  const onClick = () => {
    mutate();
  }

  return (
    <Button size="sm" variant="outline" disabled={isPending} onClick={onClick}>
      Remove
    </Button>
  );
}

const ReserveButton = ({ item }) => {
  const queryClient = useQueryClient();

  const reserveWishlistItem = async payload => {
    return fetch(`${import.meta.env.VITE_APP_ENDPOINT}/rest/wishlist/${item.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }).then(res => res.json());
  }

  const { isPending, mutate } = useMutation({
    mutationFn: reserveWishlistItem,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error, variables, context) => {
      toast.error('Something went wrong, please try again');
    }
  });

  const toggleReserve = () => {
    mutate({
      ...item,
      reserved: !item.reserved,
    });
  }

  return (
    <Button
      size="sm"
      disabled={isPending}
      variant={item.reserved === true ? "secondary" : "default"}
      onClick={toggleReserve}
    >
      <Bookmark className="mr-1 h-4 w-4" />
      {item.reserved === true ? "Reserved" : "Reserve"}
    </Button>
  )
}

const RefreshScreenshotButton = ({ id }) => {
  const queryClient = useQueryClient();

  const refreshScreenshot = async payload => {
    return fetch(`${import.meta.env.VITE_APP_ENDPOINT}/rest/wishlist/${id}/screenshot`, {
      method: "PUT",
    }).then(res => res.json());
  }

  const { isPending, mutate } = useMutation({
    mutationFn: refreshScreenshot,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error, variables, context) => {
      toast.error('Something went wrong, please try again');
    }
  });

  const handleClick = () => {
    mutate();
  }

  return (
    <Button
      size="sm"
      disabled={isPending}
      variant="default"
      onClick={handleClick}
    >
      <RefreshCw className="mr-1 h-4 w-4" />
      {isPending !== true ? "Refresh Screenshot" : "Working..."}
    </Button>
  )
}

const AddForm = ({ email, user_id }) => {
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: "",
      url: "",
    },
  });

  const { name, url } = form.getValues();

  const createWishlist = async () => {
    return fetch(`${import.meta.env.VITE_APP_ENDPOINT}/rest/wishlist`, {
      method: "POST",
      body: JSON.stringify({
        user_id,
        email,
        name,
        url,
        reserved: false,
        screenshot: "",
      })
    }).then(res => res.json());
  }

  const { isPending, mutate } = useMutation({
    mutationFn: createWishlist,
    onSuccess: (data, variables, context) => {
      toast.info('Your wishlist item was saved successfully');
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error, variables, context) => {
      toast.error('Something went wrong, please try again');
    }
  });

  const handleSubmit = () => {
    if (!user_id || !email) {
      localStorage.setItem("redirectURL", pathname);
      navigate("/auth/login");
      return;
    }

    mutate({
      user_id,
      email,
      url,
      name,
    });
  }

  return (
    <div className="bg-muted/50 p-4 rounded-lg">
      <h2 className="text-xl font-medium mb-4">Add to your wishlist</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
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
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending}>
            <BookmarkPlus className="mr-2 h-4 w-4" />
            {isPending ? "Adding..." : "Add to Wishlist"}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default Container;
export {
  WishlistRouter
};
