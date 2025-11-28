import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Vocabulary, Collection } from "@shared/schema";

const vocabularyFormSchema = z.object({
  word: z.string().min(1, "Word is required").max(255, "Word is too long"),
  meaning: z.string().min(1, "Meaning is required").max(1000, "Meaning is too long"),
  example: z.string().max(1000, "Example is too long").optional(),
  collectionId: z.string().optional(),
});

type VocabularyFormData = z.infer<typeof vocabularyFormSchema>;

export default function VocabularyForm() {
  const [, navigate] = useLocation();
  const params = useParams<{ id?: string }>();
  const searchParams = new URLSearchParams(useSearch());
  const collectionIdParam = searchParams.get("collection");
  const isEditing = !!params.id;
  const { toast } = useToast();

  const { data: vocabulary, isLoading: vocabLoading } = useQuery<Vocabulary>({
    queryKey: ["/api/vocabulary", params.id],
    enabled: isEditing,
  });

  const { data: collections } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  const form = useForm<VocabularyFormData>({
    resolver: zodResolver(vocabularyFormSchema),
    defaultValues: {
      word: "",
      meaning: "",
      example: "",
      collectionId: collectionIdParam || "",
    },
  });

  useEffect(() => {
    if (vocabulary) {
      form.reset({
        word: vocabulary.word,
        meaning: vocabulary.meaning,
        example: vocabulary.example || "",
        collectionId: vocabulary.collectionId || "",
      });
    }
  }, [vocabulary, form]);

  const mutation = useMutation({
    mutationFn: async (data: VocabularyFormData) => {
      const payload = {
        ...data,
        collectionId: data.collectionId || null,
      };
      if (isEditing) {
        return await apiRequest("PATCH", `/api/vocabulary/${params.id}`, payload);
      }
      return await apiRequest("POST", "/api/vocabulary", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vocabulary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: isEditing ? "Word updated" : "Word added",
        description: isEditing 
          ? "Your changes have been saved." 
          : "The vocabulary word has been added.",
      });
      
      if (collectionIdParam) {
        navigate(`/collections/${collectionIdParam}`);
      } else if (vocabulary?.collectionId) {
        navigate(`/collections/${vocabulary.collectionId}`);
      } else {
        navigate("/vocabulary");
      }
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
        description: "Failed to save word. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VocabularyFormData) => {
    mutation.mutate(data);
  };

  if (isEditing && vocabLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const backPath = collectionIdParam 
    ? `/collections/${collectionIdParam}` 
    : vocabulary?.collectionId 
      ? `/collections/${vocabulary.collectionId}` 
      : "/vocabulary";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href={backPath}>
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Word" : "Add New Word"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing 
              ? "Update vocabulary details" 
              : "Add a new word to your vocabulary"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Word Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="word"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>English Word</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Serendipity" 
                        {...field} 
                        data-testid="input-word"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meaning"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meaning / Definition</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter the definition or translation..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        data-testid="input-meaning"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="example"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Example Sentence (optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter an example sentence using this word..."
                        className="resize-none"
                        rows={2}
                        {...field}
                        data-testid="input-example"
                      />
                    </FormControl>
                    <FormDescription>
                      An example helps reinforce how the word is used in context.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="collectionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collection (optional)</FormLabel>
                    <Select 
                      value={field.value || ""} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-collection">
                          <SelectValue placeholder="Select a collection" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No collection</SelectItem>
                        {collections?.map((collection) => (
                          <SelectItem key={collection.id} value={collection.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: collection.color || "#3B82F6" }}
                              />
                              {collection.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Organize this word into a collection.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Link href={backPath} className="flex-1">
                  <Button type="button" variant="outline" className="w-full" data-testid="button-cancel">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={mutation.isPending}
                  data-testid="button-save-word"
                >
                  {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isEditing ? "Save Changes" : "Add Word"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
