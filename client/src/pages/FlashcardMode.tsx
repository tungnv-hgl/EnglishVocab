import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearch, Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Check,
  Trophy,
  Volume2
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Vocabulary, Collection } from "@shared/schema";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function FlashcardMode() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const collectionId = searchParams.get("collection");
  const { toast } = useToast();

  const [cards, setCards] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedCards, setLearnedCards] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  const { data: vocabulary, isLoading } = useQuery<Vocabulary[]>({
    queryKey: collectionId 
      ? ["/api/collections", collectionId, "vocabulary", "words"]
      : ["/api/vocabulary"],
  });

  const { data: collection } = useQuery<Collection>({
    queryKey: ["/api/collections", collectionId],
    enabled: !!collectionId,
  });

  const saveResultMutation = useMutation({
    mutationFn: async (data: { 
      mode: string; 
      totalQuestions: number; 
      correctAnswers: number; 
      score: number;
      collectionId?: string;
    }) => {
      return await apiRequest("POST", "/api/quiz-results", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  useEffect(() => {
    if (vocabulary && vocabulary.length > 0) {
      setCards(shuffleArray(vocabulary));
    }
  }, [vocabulary]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handleMarkLearned = () => {
    const currentCard = cards[currentIndex];
    const newLearned = new Set(learnedCards);
    
    if (newLearned.has(currentCard.id)) {
      newLearned.delete(currentCard.id);
    } else {
      newLearned.add(currentCard.id);
    }
    
    setLearnedCards(newLearned);
  };

  const handleComplete = () => {
    const score = (learnedCards.size / cards.length) * 100;
    setIsComplete(true);
    saveResultMutation.mutate({
      mode: "flashcard",
      totalQuestions: cards.length,
      correctAnswers: learnedCards.size,
      score,
      collectionId: collectionId || undefined,
    });
  };

  const handleRestart = () => {
    if (vocabulary) {
      setCards(shuffleArray(vocabulary));
      setCurrentIndex(0);
      setIsFlipped(false);
      setLearnedCards(new Set());
      setIsComplete(false);
    }
  };

  const playPronunciation = async (word: string) => {
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: word }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
      }
    } catch (error) {
      console.error("Error playing pronunciation:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Card className="p-8">
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    );
  }

  if (!vocabulary || vocabulary.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">No Words Available</h2>
            <p className="text-muted-foreground mb-4">
              Add some vocabulary words to start practicing with flashcards.
            </p>
            <Link href={collectionId ? `/collections/${collectionId}` : "/vocabulary"}>
              <Button data-testid="button-back-to-words">
                {collectionId ? "Back to Collection" : "Back to Vocabulary"}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    const score = (learnedCards.size / cards.length) * 100;
    const scoreColor = score >= 80 ? "text-chart-2" : score >= 60 ? "text-chart-4" : "text-destructive";

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href={collectionId ? `/collections/${collectionId}` : "/"}>
            <Button size="icon" variant="ghost" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Flashcards Complete</h1>
        </div>

        <Card className="p-8">
          <div className="text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Trophy className={`h-10 w-10 ${scoreColor}`} />
            </div>
            
            <div>
              <p className="text-6xl font-bold mb-2" data-testid="text-final-score">
                <span className={scoreColor}>{Math.round(score)}%</span>
              </p>
              <p className="text-muted-foreground">
                You marked {learnedCards.size} out of {cards.length} words as learned
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button onClick={handleRestart} variant="outline" className="gap-2" data-testid="button-restart">
                <RotateCcw className="h-4 w-4" />
                Practice Again
              </Button>
              <Link href={collectionId ? `/collections/${collectionId}` : "/"}>
                <Button className="gap-2 w-full sm:w-auto" data-testid="button-finish">
                  Finish
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  
  if (!currentCard) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">No Cards Available</h2>
            <p className="text-muted-foreground mb-4">
              Add some vocabulary words to start practicing with flashcards.
            </p>
            <Link href={collectionId ? `/collections/${collectionId}` : "/vocabulary"}>
              <Button data-testid="button-back-to-words">
                {collectionId ? "Back to Collection" : "Back to Vocabulary"}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const isLearned = learnedCards.has(currentCard.id);
  const progressPercent = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={collectionId ? `/collections/${collectionId}` : "/"}>
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Flashcards</h1>
          {collection && (
            <p className="text-sm text-muted-foreground">{collection.name}</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-medium" data-testid="text-card-counter">
            {currentIndex + 1} / {cards.length}
          </p>
          <p className="text-sm text-muted-foreground">{learnedCards.size} learned</p>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progressPercent} className="h-2" />

      {/* Flashcard */}
      <div 
        className="perspective-1000 cursor-pointer"
        onClick={handleFlip}
        data-testid="flashcard"
      >
        <div 
          className="flip-card w-full min-h-[400px]"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front of card */}
          <Card 
            className="flip-card-front absolute w-full h-full min-h-[400px] bg-gradient-blue text-white shadow-2xl rounded-2xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] p-8">
              <p className="text-sm text-white/80 mb-6 font-medium">Click to reveal meaning</p>
              <div className="flex items-center gap-4">
                <h2 className="text-5xl md:text-6xl font-extrabold text-center" data-testid="text-flashcard-word">
                  {currentCard.word}
                </h2>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-white hover:bg-white/20"
                  onClick={(e) => { e.stopPropagation(); playPronunciation(currentCard.word); }}
                  data-testid="button-play-pronunciation"
                >
                  <Volume2 className="h-6 w-6" />
                </Button>
              </div>
              {isLearned && (
                <div className="absolute top-6 right-6 animate-scale-bounce">
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <Check className="h-6 w-6 text-green-500 font-bold" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Back of card */}
          <Card 
            className="flip-card-back absolute w-full h-full min-h-[400px] bg-gradient-purple text-white shadow-2xl rounded-2xl"
            style={{ 
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] p-8">
              <p className="text-sm text-white/70 mb-4 font-medium uppercase tracking-wide">Meaning</p>
              <p className="text-3xl font-bold text-center mb-6" data-testid="text-flashcard-meaning">
                {currentCard.meaning}
              </p>
              {currentCard.example && (
                <p className="text-sm italic text-white/70 text-center">
                  "{currentCard.example}"
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <Button
          size="icon"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          data-testid="button-previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant={isLearned ? "default" : "outline"}
          className="gap-2"
          onClick={handleMarkLearned}
          data-testid="button-mark-learned"
        >
          <Check className="h-4 w-4" />
          {isLearned ? "Learned" : "Mark as Learned"}
        </Button>

        <Button
          size="icon"
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          data-testid="button-next"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Complete Button */}
      {currentIndex === cards.length - 1 && (
        <div className="flex justify-center pt-4">
          <Button onClick={handleComplete} className="gap-2" data-testid="button-complete">
            Complete Session
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
