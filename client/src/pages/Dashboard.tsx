import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Clock, 
  Plus, 
  ArrowRight,
  FolderOpen,
  Brain,
  Zap
} from "lucide-react";
import type { DashboardStats, CollectionWithStats } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: collections, isLoading: collectionsLoading } = useQuery<CollectionWithStats[]>({
    queryKey: ["/api/collections"],
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your learning progress</p>
        </div>
        <Link href="/collections/new">
          <Button className="gap-2" data-testid="button-new-collection">
            <Plus className="h-4 w-4" />
            New Collection
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-6">
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <div className="text-3xl font-bold" data-testid="text-total-words">
                  {stats?.totalWords ?? 0}
                </div>
                <p className="text-sm text-muted-foreground">Total Words</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <Trophy className="h-8 w-8 text-chart-4 mb-2" />
                <div className="text-3xl font-bold" data-testid="text-words-learned">
                  {stats?.wordsLearned ?? 0}
                </div>
                <p className="text-sm text-muted-foreground">Words Learned</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <Target className="h-8 w-8 text-chart-2 mb-2" />
                <div className="text-3xl font-bold" data-testid="text-accuracy">
                  {stats?.averageAccuracy ? `${Math.round(stats.averageAccuracy)}%` : "0%"}
                </div>
                <p className="text-sm text-muted-foreground">Quiz Accuracy</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <FolderOpen className="h-8 w-8 text-chart-3 mb-2" />
                <div className="text-3xl font-bold" data-testid="text-total-collections">
                  {stats?.totalCollections ?? 0}
                </div>
                <p className="text-sm text-muted-foreground">Collections</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Study</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/learn/quiz">
              <Button 
                variant="outline" 
                className="w-full h-auto py-6 flex flex-col gap-2 hover-elevate"
                data-testid="button-quick-quiz"
              >
                <Brain className="h-8 w-8 text-primary" />
                <span className="font-medium">Multiple Choice</span>
                <span className="text-xs text-muted-foreground">Test your knowledge</span>
              </Button>
            </Link>
            <Link href="/learn/flashcards">
              <Button 
                variant="outline" 
                className="w-full h-auto py-6 flex flex-col gap-2 hover-elevate"
                data-testid="button-quick-flashcards"
              >
                <Zap className="h-8 w-8 text-chart-2" />
                <span className="font-medium">Flashcards</span>
                <span className="text-xs text-muted-foreground">Flip to learn</span>
              </Button>
            </Link>
            <Link href="/learn/spelling">
              <Button 
                variant="outline" 
                className="w-full h-auto py-6 flex flex-col gap-2 hover-elevate"
                data-testid="button-quick-spelling"
              >
                <Target className="h-8 w-8 text-chart-3" />
                <span className="font-medium">Spelling Test</span>
                <span className="text-xs text-muted-foreground">Type the word</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Collections List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Collections</h2>
          <Link href="/collections">
            <Button variant="ghost" size="sm" className="gap-1" data-testid="link-view-all-collections">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        {collectionsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : collections && collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.slice(0, 6).map((collection) => (
              <Link key={collection.id} href={`/collections/${collection.id}`}>
                <Card className="p-6 hover-elevate cursor-pointer h-full">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div 
                      className="h-3 w-3 rounded-full flex-shrink-0 mt-1.5"
                      style={{ backgroundColor: collection.color || "#3B82F6" }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate" data-testid={`text-collection-name-${collection.id}`}>
                        {collection.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {collection.wordCount} {collection.wordCount === 1 ? "word" : "words"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {collection.wordCount > 0 
                          ? Math.round((collection.masteredCount / collection.wordCount) * 100) 
                          : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={collection.wordCount > 0 
                        ? (collection.masteredCount / collection.wordCount) * 100 
                        : 0} 
                      className="h-2"
                    />
                  </div>
                  {collection.progress?.lastStudied && (
                    <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last studied {new Date(collection.progress.lastStudied).toLocaleDateString()}
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No collections yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first collection to start learning vocabulary
              </p>
              <Link href="/collections/new">
                <Button className="gap-2" data-testid="button-create-first-collection">
                  <Plus className="h-4 w-4" />
                  Create Collection
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 5).map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      activity.mode === 'quiz' ? 'bg-primary/10' :
                      activity.mode === 'flashcard' ? 'bg-chart-2/10' : 'bg-chart-3/10'
                    }`}>
                      {activity.mode === 'quiz' ? (
                        <Brain className="h-4 w-4 text-primary" />
                      ) : activity.mode === 'flashcard' ? (
                        <Zap className="h-4 w-4 text-chart-2" />
                      ) : (
                        <Target className="h-4 w-4 text-chart-3" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{activity.mode} Practice</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.correctAnswers}/{activity.totalQuestions} correct
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      activity.score >= 80 ? 'text-chart-2' :
                      activity.score >= 60 ? 'text-chart-4' : 'text-destructive'
                    }`}>
                      {Math.round(activity.score)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {activity.completedAt 
                        ? new Date(activity.completedAt).toLocaleDateString()
                        : "Recently"
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
