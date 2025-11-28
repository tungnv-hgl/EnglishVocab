import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearch, Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, X, Trophy, RotateCcw, ArrowRight, Volume2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Vocabulary, Collection } from "@shared/schema";

type QuizQuestion = {
  word: Vocabulary;
  options: string[];
  correctIndex: number;
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function QuizMode() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const collectionId = searchParams.get("collection");
  const { toast } = useToast();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
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

  const generateQuestions = useCallback((words: Vocabulary[]) => {
    if (words.length < 2) return [];
    
    const shuffledWords = shuffleArray(words);
    const allMeanings = words.map(w => w.meaning);
    
    return shuffledWords.map(word => {
      const wrongMeanings = shuffleArray(
        allMeanings.filter(m => m !== word.meaning)
      ).slice(0, 2);
      
      const options = shuffleArray([word.meaning, ...wrongMeanings]);
      const correctIndex = options.indexOf(word.meaning);
      
      return { word, options, correctIndex };
    });
  }, []);

  useEffect(() => {
    if (vocabulary && vocabulary.length >= 2) {
      setQuestions(generateQuestions(vocabulary));
    }
  }, [vocabulary, generateQuestions]);

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(index);
    setIsAnswered(true);
    
    if (index === questions[currentIndex].correctIndex) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      const score = (correctCount / questions.length) * 100;
      setIsComplete(true);
      saveResultMutation.mutate({
        mode: "quiz",
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        score,
        collectionId: collectionId || undefined,
      });
    }
  };

  const handleRestart = () => {
    if (vocabulary) {
      setQuestions(generateQuestions(vocabulary));
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setCorrectCount(0);
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
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    );
  }

  if (!vocabulary || vocabulary.length < 2) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Not Enough Words</h2>
            <p className="text-muted-foreground mb-4">
              You need at least 2 words to start a quiz.
              {collectionId && " Add more words to this collection."}
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
    const score = (correctCount / questions.length) * 100;
    const scoreColor = score >= 80 ? "text-chart-2" : score >= 60 ? "text-chart-4" : "text-destructive";

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href={collectionId ? `/collections/${collectionId}` : "/"}>
            <Button size="icon" variant="ghost" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Quiz Complete</h1>
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
                You got {correctCount} out of {questions.length} questions correct
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button onClick={handleRestart} variant="outline" className="gap-2" data-testid="button-restart-quiz">
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

  const currentQuestion = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

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
          <h1 className="text-xl font-bold">Multiple Choice Quiz</h1>
          {collection && (
            <p className="text-sm text-muted-foreground">{collection.name}</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-medium" data-testid="text-question-counter">
            {currentIndex + 1} / {questions.length}
          </p>
          <p className="text-sm text-muted-foreground">{correctCount} correct</p>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progressPercent} className="h-2" />

      {/* Question Card */}
      <Card className="p-8">
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground mb-2">What does this word mean?</p>
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-4xl font-bold" data-testid="text-quiz-word">
              {currentQuestion.word.word}
            </h2>
            <Button 
              size="icon" 
              variant="outline" 
              onClick={() => playPronunciation(currentQuestion.word.word)}
              data-testid="button-play-pronunciation"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
          {currentQuestion.word.example && (
            <p className="text-sm italic text-muted-foreground mt-4">
              "{currentQuestion.word.example}"
            </p>
          )}
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isCorrect = index === currentQuestion.correctIndex;
            const isSelected = selectedAnswer === index;
            
            let buttonClass = "w-full p-4 text-left justify-start h-auto rounded-xl font-medium transition-all duration-300 animate-slide-up border-2";
            
            if (isAnswered) {
              if (isCorrect) {
                buttonClass += " bg-green-500 border-green-500 text-white";
              } else if (isSelected && !isCorrect) {
                buttonClass += " bg-red-500 border-red-500 text-white";
              } else {
                buttonClass += " border-gray-300";
              }
            } else {
              buttonClass += " border-gray-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer";
            }

            return (
              <Button
                key={index}
                variant="outline"
                className={buttonClass}
                onClick={() => handleAnswerSelect(index)}
                disabled={isAnswered}
                data-testid={`button-answer-${index}`}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isAnswered && isCorrect ? "bg-chart-2 border-chart-2" :
                    isAnswered && isSelected && !isCorrect ? "bg-destructive border-destructive" :
                    "border-muted-foreground/30"
                  }`}>
                    {isAnswered && isCorrect && <Check className="h-4 w-4 text-white" />}
                    {isAnswered && isSelected && !isCorrect && <X className="h-4 w-4 text-white" />}
                  </div>
                  <span className="flex-1">{option}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Next Button */}
      {isAnswered && (
        <div className="flex justify-end">
          <Button onClick={handleNext} className="gap-2" data-testid="button-next">
            {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
