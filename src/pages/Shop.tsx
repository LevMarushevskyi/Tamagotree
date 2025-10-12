import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ShoppingCart, Coins, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

interface Decoration {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  image_url: string;
  price_acorns: number;
  category: string | null;
  is_available: boolean;
}

interface UserDecoration {
  decoration_id: string;
}

const Shop = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [ownedDecorations, setOwnedDecorations] = useState<Set<string>>(new Set());
  const [acorns, setAcorns] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    const initShop = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/');
        return;
      }

      setCurrentUser(session.user);
      await fetchShopData(session.user.id);
    };

    initShop();
  }, [navigate]);

  const fetchShopData = async (userId: string) => {
    try {
      // Fetch user's acorns
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("acorns")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      setAcorns(profileData?.acorns || 0);

      // Fetch all decorations
      const { data: decorationsData, error: decorationsError } = await supabase
        .from("decorations")
        .select("*")
        .eq("is_available", true)
        .order("category", { ascending: true })
        .order("price_acorns", { ascending: true });

      if (decorationsError) throw decorationsError;
      setDecorations(decorationsData || []);

      // Fetch user's owned decorations
      const { data: ownedData, error: ownedError } = await supabase
        .from("user_decorations")
        .select("decoration_id")
        .eq("user_id", userId);

      if (ownedError) throw ownedError;
      setOwnedDecorations(new Set(ownedData?.map((d: UserDecoration) => d.decoration_id) || []));
    } catch (error) {
      console.error("Error fetching shop data:", error);
      toast({
        title: "Error",
        description: "Failed to load shop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (decoration: Decoration) => {
    if (!currentUser) return;

    if (acorns < decoration.price_acorns) {
      toast({
        title: "Not Enough Acorns",
        description: `You need ${decoration.price_acorns} acorns but only have ${acorns}.`,
        variant: "destructive",
      });
      return;
    }

    if (ownedDecorations.has(decoration.id)) {
      toast({
        title: "Already Owned",
        description: "You already own this decoration!",
        variant: "destructive",
      });
      return;
    }

    setPurchasing(decoration.id);

    try {
      // Start a transaction-like operation
      // 1. Deduct acorns
      const { data: profileData, error: updateError } = await supabase
        .from("profiles")
        .update({ acorns: acorns - decoration.price_acorns })
        .eq("id", currentUser.id)
        .select("acorns")
        .single();

      if (updateError) throw updateError;

      // 2. Add decoration to user's inventory
      const { error: insertError } = await supabase
        .from("user_decorations")
        .insert({
          user_id: currentUser.id,
          decoration_id: decoration.id,
        });

      if (insertError) {
        // Rollback: restore acorns
        await supabase
          .from("profiles")
          .update({ acorns: acorns })
          .eq("id", currentUser.id);
        throw insertError;
      }

      // Update local state
      setAcorns(profileData.acorns);
      setOwnedDecorations(new Set([...ownedDecorations, decoration.id]));

      toast({
        title: "Purchase Successful!",
        description: `You bought ${decoration.display_name} for ${decoration.price_acorns} acorns!`,
      });
    } catch (error) {
      console.error("Error purchasing decoration:", error);
      toast({
        title: "Purchase Failed",
        description: "Failed to complete purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  const groupByCategory = (decorations: Decoration[]) => {
    const grouped: Record<string, Decoration[]> = {};
    decorations.forEach((decoration) => {
      const category = decoration.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(decoration);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-primary/5">
        <ShoppingCart className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  const groupedDecorations = groupByCategory(decorations);
  const categories = Object.keys(groupedDecorations);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Coins className="w-5 h-5 mr-2" />
                {acorns} Acorns
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <ShoppingCart className="w-12 h-12 text-primary" />
              <h1 className="text-4xl font-bold">Decoration Shop</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Purchase decorations to make your trees unique!
            </p>
          </div>

          <Tabs defaultValue={categories[0] || "all"} className="space-y-6">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedDecorations[category].map((decoration) => {
                    const owned = ownedDecorations.has(decoration.id);
                    const canAfford = acorns >= decoration.price_acorns;
                    const isPurchasing = purchasing === decoration.id;

                    return (
                      <Card key={decoration.id} className={owned ? "border-green-500 bg-green-50/50 dark:bg-green-950/20" : ""}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="flex items-center gap-2">
                              {decoration.display_name}
                              {owned && <Badge variant="secondary">Owned</Badge>}
                            </CardTitle>
                          </div>
                          {decoration.description && (
                            <CardDescription>{decoration.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                            <img
                              src={decoration.image_url}
                              alt={decoration.display_name}
                              className="w-24 h-24 image-rendering-pixelated"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-lg">
                              <Coins className="w-4 h-4 mr-1" />
                              {decoration.price_acorns}
                            </Badge>
                            <Button
                              onClick={() => handlePurchase(decoration)}
                              disabled={owned || !canAfford || isPurchasing}
                              size="sm"
                            >
                              {isPurchasing ? (
                                "Purchasing..."
                              ) : owned ? (
                                <>
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  Owned
                                </>
                              ) : !canAfford ? (
                                "Can't Afford"
                              ) : (
                                <>
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  Buy
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Shop;
