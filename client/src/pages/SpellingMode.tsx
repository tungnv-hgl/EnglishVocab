import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearch, Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X, 
  Trophy, 
  RotateCcw,
  Lightbulb,
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

export default function SpellingMode() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const collectionId = searchParams.get("collection");
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [words, setWords] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const { data: vocabulary, isLoading } = useQuery<Vocabulary[]>({
    queryKey: collectionId 
      ? ["/api/collections", collectionId, "vocabulary", "words"]
      : ["/api/vocabulary"],
    enabled: !!collectionId,
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
      setWords(shuffleArray(vocabulary));
    }
  }, [vocabulary]);

  useEffect(() => {
    if (!isChecked && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, isChecked]);

  const handleCheck = () => {
    if (!userInput.trim()) return;
    
    const currentWord = words[currentIndex];
    const isAnswerCorrect = userInput.trim().toLowerCase() === currentWord.word.toLowerCase();
    
    setIsCorrect(isAnswerCorrect);
    setIsChecked(true);
    
    if (isAnswerCorrect) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!isChecked) {
        handleCheck();
      } else {
        handleNext();
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput("");
      setIsChecked(false);
      setIsCorrect(false);
      setShowHint(false);
    } else {
      const score = (correctCount / words.length) * 100;
      setIsComplete(true);
      saveResultMutation.mutate({
        mode: "spelling",
        totalQuestions: words.length,
        correctAnswers: correctCount,
        score,
        collectionId: collectionId || undefined,
      });
    }
  };

  const handleRestart = () => {
    if (vocabulary) {
      setWords(shuffleArray(vocabulary));
      setCurrentIndex(0);
      setUserInput("");
      setIsChecked(false);
      setIsCorrect(false);
      setCorrectCount(0);
      setIsComplete(false);
      setShowHint(false);
    }
  };

  const generateHint = (word: string): string => {
    const length = word.length;
    if (length <= 2) return word[0] + "_".repeat(length - 1);
    
    const showCount = Math.ceil(length / 3);
    const hint = word.split("").map((char, i) => {
      if (i < showCount) return char;
      return "_";
    }).join("");
    
    return hint;
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
          <Skeleton className="h-32 w-full" />
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
              Add some vocabulary words to start practicing spelling.
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

  if (!words || words.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Loading Spelling Test...</h2>
            <p className="text-muted-foreground">Preparing your words...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    const score = (correctCount / words.length) * 100;
    const scoreColor = score >= 80 ? "text-chart-2" : score >= 60 ? "text-chart-4" : "text-destructive";

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href={collectionId ? `/collections/${collectionId}` : "/"}>
            <Button size="icon" variant="ghost" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Spelling Test Complete</h1>
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
                You spelled {correctCount} out of {words.length} words correctly
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button onClick={handleRestart} variant="outline" className="gap-2" data-testid="button-restart">
                <RotateCcw className="h-4 w-4" />
                Try Again
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

  const currentWord = words[currentIndex];
  
  if (!currentWord) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">No Words Available</h2>
            <p className="text-muted-foreground mb-4">
              Add some vocabulary words to start practicing spelling.
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

  const progressPercent = ((currentIndex + 1) / words.length) * 100;

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
          <h1 className="text-xl font-bold">Spelling Test</h1>
          {collection && (
            <p className="text-sm text-muted-foreground">{collection.name}</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-medium" data-testid="text-question-counter">
            {currentIndex + 1} / {words.length}
          </p>
          <p className="text-sm text-muted-foreground">{correctCount} correct</p>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progressPercent} className="h-2" />

      {/* Question Card */}
      <Card className="p-8">
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-2">Type the word that matches:</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <p className="text-xl" data-testid="text-meaning">
              {currentWord.meaning}
            </p>
            <Button 
              size="icon" 
              variant="outline" 
              onClick={() => playPronunciation(currentWord.word)}
              data-testid="button-play-pronunciation"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
          {currentWord.example && (
            <p className="text-sm italic text-muted-foreground">
              "{currentWord.example.replace(new RegExp(currentWord.word, 'gi'), '___')}"
            </p>
          )}
        </div>

        {/* Hint */}
        {showHint && !isChecked && (
          <div className="text-center mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Hint:</p>
            <p className="font-mono text-lg tracking-widest">{generateHint(currentWord.word)}</p>
          </div>
        )}

        {/* Input */}
        <div className="space-y-4">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Type the word..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isChecked}
              className={`text-xl text-center py-6 ${
                isChecked 
                  ? isCorrect 
                    ? "border-chart-2 bg-chart-2/10" 
                    : "border-destructive bg-destructive/10"
                  : ""
              }`}
              data-testid="input-spelling"
            />
            {isChecked && (
              <div className={`absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center ${
                isCorrect ? "bg-chart-2" : "bg-destructive"
              }`}>
                {isCorrect ? (
                  <Check className="h-5 w-5 text-white" />
                ) : (
                  <X className="h-5 w-5 text-white" />
                )}
              </div>
            )}
          </div>

          {/* Feedback */}
          {isChecked && !isCorrect && (
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Correct answer:</p>
              <p className="text-xl font-bold">{currentWord.word}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Controls */}
      <div className="flex justify-between gap-4">
        {!isChecked ? (
          <>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowHint(true)}
              disabled={showHint}
              data-testid="button-hint"
            >
              <Lightbulb className="h-4 w-4" />
              Show Hint
            </Button>
            <Button 
              onClick={handleCheck} 
              disabled={!userInput.trim()}
              className="gap-2"
              data-testid="button-check"
            >
              Check Answer
              <Check className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button 
            onClick={handleNext} 
            className="gap-2 ml-auto"
            data-testid="button-next"
          >
            {currentIndex < words.length - 1 ? "Next Word" : "See Results"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
