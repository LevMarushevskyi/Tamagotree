import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sprout, Droplet, Trophy, Map } from "lucide-react";
import heroImage from "@/assets/hero-banner.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Retro Header */}
      <header className="border-b-4 border-foreground bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Tamagotree Logo" className="w-12 h-12 pixelated" />
            <h1 className="font-pixel text-primary text-sm md:text-base">TAMAGOTREE</h1>
          </div>
          <Link to="/auth">
            <Button variant="retro" size="sm">
              START
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative border-b-4 border-foreground">
        <div 
          className="h-[400px] bg-cover bg-center relative"
          style={{ backgroundImage: `url(${heroImage})`, imageRendering: 'pixelated' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-6 px-4 max-w-2xl retro-border bg-card/95 p-8">
              <h2 className="font-pixel text-primary text-xl md:text-2xl leading-relaxed">
                GROW TREES<br/>EARN XP<br/>SAVE DURHAM
              </h2>
              <p className="font-mono-retro text-lg md:text-xl text-foreground">
                Fight urban heat islands.<br/>
                Care for saplings.<br/>
                Level up your city.
              </p>
              <Link to="/auth">
                <Button variant="retro" size="lg" className="animate-pulse-glow">
                  PLAY NOW
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="font-pixel text-2xl text-center mb-12 text-primary">HOW IT WORKS</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Map,
              title: "REPORT",
              description: "Find and report young saplings in Durham's heat islands",
              color: "bg-primary"
            },
            {
              icon: Droplet,
              title: "WATER",
              description: "Complete scheduled watering tasks based on real weather data",
              color: "bg-accent"
            },
            {
              icon: Sprout,
              title: "GROW",
              description: "Watch your trees mature and gain emotional connection",
              color: "bg-primary"
            },
            {
              icon: Trophy,
              title: "COMPETE",
              description: "Earn XP, level up, and compete with your neighborhood",
              color: "bg-secondary"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="retro-border bg-card p-6 hover:translate-y-[-4px] transition-transform"
            >
              <div className={`${feature.color} w-16 h-16 flex items-center justify-center retro-border mb-4`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-pixel text-sm mb-3 text-foreground">{feature.title}</h4>
              <p className="font-mono-retro text-base text-muted-foreground leading-tight">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto retro-border bg-gradient-to-br from-primary/20 to-accent/20 p-8 md:p-12">
          <h3 className="font-pixel text-xl md:text-2xl mb-6 text-foreground leading-relaxed">
            READY TO BECOME A TREE GUARDIAN?
          </h3>
          <p className="font-mono-retro text-lg md:text-xl mb-8 text-muted-foreground">
            Join Durham's community fighting climate change, one tree at a time.
          </p>
          <Link to="/auth">
            <Button variant="retro" size="lg" className="animate-wiggle">
              CREATE ACCOUNT
            </Button>
          </Link>
        </div>
      </section>

      {/* Retro Footer */}
      <footer className="border-t-4 border-foreground bg-card py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="font-mono-retro text-base text-muted-foreground">
            © 2025 TAMAGOTREE • DURHAM TREE GUARDIANS
          </p>
          <p className="font-mono-retro text-sm text-muted-foreground mt-2">
            MADE WITH ♥ FOR THE PLANET
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
