import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Link } from "wouter";
import { 
  Plus, 
  FolderOpen, 
  Trash2, 
  Edit, 
  BookOpen,
  Clock,
  Brain,
  Zap,
  Target
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { CollectionWithStats } from "@shared/schema";

export default function Collections() {
  const { toast } = useToast();

  const { data: collections, isLoading } = useQuery<CollectionWithStats[]>({
    queryKey: ["/api/collections"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/collections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Collection deleted",
        description: "The collection has been removed successfully.",
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
        description: "Failed to delete collection. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Collections</h1>
          <p className="text-muted-foreground mt-1">Organize your vocabulary into groups</p>
        </div>
        <Link href="/collections/new">
          <Button className="gap-2" data-testid="button-new-collection">
            <Plus className="h-4 w-4" />
            New Collection
          </Button>
        </Link>
      </div>

      {/* Collections Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : collections && collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Card key={collection.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div 
                      className="h-4 w-4 rounded-full flex-shrink-0 mt-1"
                      style={{ backgroundColor: collection.color || "#3B82F6" }}
                    />
                    <div className="min-w-0">
                      <CardTitle className="text-lg truncate" data-testid={`text-collection-title-${collection.id}`}>
                        {collection.name}
                      </CardTitle>
                      {collection.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {collection.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Link href={`/collections/${collection.id}/edit`}>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        data-testid={`button-edit-collection-${collection.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          data-testid={`button-delete-collection-${collection.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Collection?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{collection.name}" and remove all words from this collection. 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(collection.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            data-testid={`button-confirm-delete-${collection.id}`}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{collection.wordCount} {collection.wordCount === 1 ? "word" : "words"}</span>
                    </div>
                    <span className="font-medium">
                      {collection.wordCount > 0 
                        ? Math.round((collection.masteredCount / collection.wordCount) * 100) 
                        : 0}% mastered
                    </span>
                  </div>
                  
                  <Progress 
                    value={collection.wordCount > 0 
                      ? (collection.masteredCount / collection.wordCount) * 100 
                      : 0} 
                    className="h-2"
                  />

                  {collection.progress?.lastStudied && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last studied {new Date(collection.progress.lastStudied).toLocaleDateString()}
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-2">
                    <Link href={`/collections/${collection.id}`} className="w-full">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        data-testid={`button-view-collection-${collection.id}`}
                      >
                        View Words
                      </Button>
                    </Link>
                    <div className="grid grid-cols-3 gap-2">
                      <Link href={`/learn/quiz?collection=${collection.id}`} className="w-full">
                        <Button 
                          className="w-full"
                          disabled={collection.wordCount < 2}
                          size="sm"
                          data-testid={`button-quiz-collection-${collection.id}`}
                          title="Multiple Choice Quiz"
                        >
                          <Brain className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/learn/flashcards?collection=${collection.id}`} className="w-full">
                        <Button 
                          className="w-full"
                          disabled={collection.wordCount < 1}
                          size="sm"
                          data-testid={`button-flashcard-collection-${collection.id}`}
                          title="Flashcards"
                        >
                          <Zap className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/learn/spelling?collection=${collection.id}`} className="w-full">
                        <Button 
                          className="w-full"
                          disabled={collection.wordCount < 1}
                          size="sm"
                          data-testid={`button-spelling-collection-${collection.id}`}
                          title="Spelling Test"
                        >
                          <Target className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center max-w-md mx-auto">
            <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Collections Yet</h3>
            <p className="text-muted-foreground mb-6">
              Collections help you organize vocabulary by topic, difficulty, or any way you prefer.
              Create your first collection to get started.
            </p>
            <Link href="/collections/new">
              <Button className="gap-2" data-testid="button-create-first-collection">
                <Plus className="h-4 w-4" />
                Create Your First Collection
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
