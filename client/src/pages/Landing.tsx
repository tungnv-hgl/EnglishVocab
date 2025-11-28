import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BookOpen, Brain, Check, Zap, Target, Trophy, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">VocabMaster</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild data-testid="button-login">
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Master English Vocabulary
            <span className="text-primary block mt-2">The Smart Way</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Interactive learning modes, progress tracking, and personalized collections. 
            Build your vocabulary faster with proven learning techniques.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2" asChild data-testid="button-get-started">
              <a href="/api/login">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-learn-more">
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Three Powerful Learning Modes
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the learning style that works best for you
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-6 hover-elevate">
            <CardContent className="p-0 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Multiple Choice Quiz</h3>
              <p className="text-muted-foreground">
                Test your knowledge with quick quizzes. Three options per word, 
                instant feedback, and accuracy tracking.
              </p>
            </CardContent>
          </Card>
          
          <Card className="p-6 hover-elevate">
            <CardContent className="p-0 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-chart-2" />
              </div>
              <h3 className="text-xl font-semibold">Flashcards</h3>
              <p className="text-muted-foreground">
                Classic flip-card learning. See the word, recall the meaning, 
                and flip to verify. Simple and effective.
              </p>
            </CardContent>
          </Card>
          
          <Card className="p-6 hover-elevate">
            <CardContent className="p-0 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-chart-3" />
              </div>
              <h3 className="text-xl font-semibold">Spelling Test</h3>
              <p className="text-muted-foreground">
                Type the word based on its meaning. Perfect for mastering 
                spelling while learning definitions.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-card border-y">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Track Your Progress
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Check className="h-6 w-6 text-chart-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Collection-Based Learning</h4>
                    <p className="text-muted-foreground">
                      Organize words into custom collections for focused study sessions
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Check className="h-6 w-6 text-chart-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Progress Dashboard</h4>
                    <p className="text-muted-foreground">
                      Visual stats showing words learned, quiz accuracy, and study streaks
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Check className="h-6 w-6 text-chart-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Bulk Import</h4>
                    <p className="text-muted-foreground">
                      Import vocabulary lists from CSV or JSON to quickly add words
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center">
                <Trophy className="h-8 w-8 text-chart-4 mx-auto mb-2" />
                <div className="text-3xl font-bold">50+</div>
                <div className="text-sm text-muted-foreground">Sample Words</div>
              </Card>
              <Card className="p-6 text-center">
                <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold">3</div>
                <div className="text-sm text-muted-foreground">Learning Modes</div>
              </Card>
              <Card className="p-6 text-center">
                <Target className="h-8 w-8 text-chart-2 mx-auto mb-2" />
                <div className="text-3xl font-bold">100%</div>
                <div className="text-sm text-muted-foreground">Free to Use</div>
              </Card>
              <Card className="p-6 text-center">
                <Zap className="h-8 w-8 text-chart-3 mx-auto mb-2" />
                <div className="text-3xl font-bold">Fast</div>
                <div className="text-sm text-muted-foreground">Results</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Expand Your Vocabulary?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of learners building their English vocabulary effectively.
          </p>
          <Button size="lg" className="gap-2" asChild data-testid="button-cta-signup">
            <a href="/api/login">
              Start Learning Now
              <ArrowRight className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">VocabMaster</span>
          </div>
          <p className="text-sm">Build your vocabulary, one word at a time.</p>
        </div>
      </footer>
    </div>
  );
}
