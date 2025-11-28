import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  MoreVertical,
  Brain,
  Zap,
  Target,
  Upload,
  Check,
  BookOpen
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Collection, Vocabulary } from "@shared/schema";

type CollectionWithVocabulary = Collection & {
  vocabulary: Vocabulary[];
  wordCount: number;
  masteredCount: number;
};

export default function CollectionDetail() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: collection, isLoading } = useQuery<CollectionWithVocabulary>({
    queryKey: ["/api/collections", params.id, "vocabulary"],
  });

  const deleteWordMutation = useMutation({
    mutationFn: async (wordId: string) => {
      await apiRequest("DELETE", `/api/vocabulary/${wordId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections", params.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Word deleted",
        description: "The vocabulary word has been removed.",
      });
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
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete word. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleMasteredMutation = useMutation({
    mutationFn: async ({ wordId, mastered }: { wordId: string; mastered: boolean }) => {
      await apiRequest("PATCH", `/api/vocabulary/${wordId}`, { mastered });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections", params.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
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
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update word. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredVocabulary = collection?.vocabulary?.filter(
    (word) =>
      word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Collection not found</h2>
          <p className="text-muted-foreground mb-4">
            This collection doesn't exist or has been deleted.
          </p>
          <Link href="/collections">
            <Button>Back to Collections</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const progressPercentage = collection.wordCount > 0 
    ? Math.round((collection.masteredCount / collection.wordCount) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <Link href="/collections">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <div 
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: collection.color || "#3B82F6" }}
            />
            <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-collection-name">
              {collection.name}
            </h1>
          </div>
          {collection.description && (
            <p className="text-muted-foreground">{collection.description}</p>
          )}
        </div>
      </div>

      {/* Stats & Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-medium" data-testid="text-word-count">
                  {collection.wordCount} {collection.wordCount === 1 ? "word" : "words"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-chart-2" />
                <span className="text-lg font-medium">
                  {collection.masteredCount} mastered
                </span>
              </div>
            </div>
            <span className="text-2xl font-bold">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </CardContent>
      </Card>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search words..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-words"
          />
        </div>
        <div className="flex gap-2">
          <Link href={`/vocabulary/new?collection=${params.id}`}>
            <Button className="gap-2" data-testid="button-add-word">
              <Plus className="h-4 w-4" />
              Add Word
            </Button>
          </Link>
          <Link href={`/vocabulary/import?collection=${params.id}`}>
            <Button variant="outline" className="gap-2" data-testid="button-import">
              <Upload className="h-4 w-4" />
              Import
            </Button>
          </Link>
        </div>
      </div>

      {/* Study Modes */}
      {collection.wordCount >= 2 && (
        <div className="grid grid-cols-3 gap-3">
          <Link href={`/learn/quiz?collection=${params.id}`}>
            <Button variant="outline" className="w-full gap-2" data-testid="button-quiz-mode">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Quiz</span>
            </Button>
          </Link>
          <Link href={`/learn/flashcards?collection=${params.id}`}>
            <Button variant="outline" className="w-full gap-2" data-testid="button-flashcard-mode">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Flashcards</span>
            </Button>
          </Link>
          <Link href={`/learn/spelling?collection=${params.id}`}>
            <Button variant="outline" className="w-full gap-2" data-testid="button-spelling-mode">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Spelling</span>
            </Button>
          </Link>
        </div>
      )}

      {/* Vocabulary List */}
      {filteredVocabulary.length > 0 ? (
        <div className="space-y-3">
          {filteredVocabulary.map((word) => (
            <Card key={word.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-start gap-4 p-4">
                  <button
                    onClick={() => toggleMasteredMutation.mutate({ 
                      wordId: word.id, 
                      mastered: !word.mastered 
                    })}
                    className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      word.mastered 
                        ? "bg-chart-2 border-chart-2 text-white" 
                        : "border-muted-foreground/30 hover:border-chart-2"
                    }`}
                    data-testid={`button-toggle-mastered-${word.id}`}
                  >
                    {word.mastered && <Check className="h-4 w-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xl font-bold" data-testid={`text-word-${word.id}`}>
                          {word.word}
                        </h3>
                        <p className="text-muted-foreground mt-1" data-testid={`text-meaning-${word.id}`}>
                          {word.meaning}
                        </p>
                        {word.example && (
                          <p className="text-sm italic text-muted-foreground mt-2">
                            "{word.example}"
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" data-testid={`button-word-menu-${word.id}`}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/vocabulary/${word.id}/edit`}>
                            <DropdownMenuItem data-testid={`button-edit-word-${word.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive"
                                data-testid={`button-delete-word-${word.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Word?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{word.word}" from your vocabulary.
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteWordMutation.mutate(word.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
                {word.mastered && (
                  <div className="px-4 py-2 bg-chart-2/10 border-t">
                    <Badge variant="secondary" className="gap-1 text-chart-2 bg-transparent">
                      <Check className="h-3 w-3" />
                      Mastered
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : collection.wordCount === 0 ? (
        <Card className="p-12">
          <div className="text-center max-w-md mx-auto">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Words Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start building your vocabulary by adding words manually or importing a list.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href={`/vocabulary/new?collection=${params.id}`}>
                <Button className="gap-2" data-testid="button-add-first-word">
                  <Plus className="h-4 w-4" />
                  Add Word
                </Button>
              </Link>
              <Link href={`/vocabulary/import?collection=${params.id}`}>
                <Button variant="outline" className="gap-2" data-testid="button-import-first">
                  <Upload className="h-4 w-4" />
                  Import List
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-8">
          <div className="text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No matching words</h3>
            <p className="text-muted-foreground">
              Try a different search term.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
