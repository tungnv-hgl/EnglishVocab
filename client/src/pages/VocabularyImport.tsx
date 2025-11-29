import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Upload, FileText, AlertCircle, Check } from "lucide-react";
import { Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Collection, VocabularyImport as VocabImportType } from "@shared/schema";

export default function VocabularyImport() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const collectionIdParam = searchParams.get("collection");
  const { toast } = useToast();
  
  const [csvText, setCsvText] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [selectedCollection, setSelectedCollection] = useState(collectionIdParam || "");
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<VocabImportType[]>([]);

  const { data: collections } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  const importMutation = useMutation({
    mutationFn: async (data: { vocabulary: VocabImportType[]; collectionId?: string }) => {
      return await apiRequest("POST", "/api/vocabulary/import", data);
    },
    onSuccess: (data: { imported: number }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vocabulary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Import successful",
        description: `${data.imported} words have been imported.`,
      });
      if (selectedCollection) {
        navigate(`/collections/${selectedCollection}`);
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
        title: "Import failed",
        description: "There was an error importing your vocabulary. Please check the format.",
        variant: "destructive",
      });
    },
  });

  const parseCSV = (text: string): VocabImportType[] => {
    const lines = text.trim().split("\n");
    const errors: string[] = [];
    const results: VocabImportType[] = [];

    // Proper CSV parser that handles quoted fields with commas
    const parseCSVLine = (line: string): string[] => {
      const parts: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          parts.push(current.trim().replace(/^"|"$/g, ""));
          current = "";
        } else {
          current += char;
        }
      }

      parts.push(current.trim().replace(/^"|"$/g, ""));
      return parts;
    };

    lines.forEach((line, index) => {
      if (!line.trim()) return;
      
      const parts = parseCSVLine(line);
      
      if (parts.length < 2) {
        errors.push(`Line ${index + 1}: Must have at least word and meaning`);
        return;
      }

      const [word, meaning, example] = parts;
      
      if (!word || !meaning) {
        errors.push(`Line ${index + 1}: Word and meaning cannot be empty`);
        return;
      }

      results.push({ word, meaning, example: example || undefined });
    });

    setParseErrors(errors);
    return results;
  };

  const parseJSON = (text: string): VocabImportType[] => {
    try {
      const data = JSON.parse(text);
      const errors: string[] = [];
      const results: VocabImportType[] = [];

      if (!Array.isArray(data)) {
        setParseErrors(["JSON must be an array of vocabulary objects"]);
        return [];
      }

      data.forEach((item, index) => {
        if (!item.word || !item.meaning) {
          errors.push(`Item ${index + 1}: Must have word and meaning properties`);
          return;
        }
        results.push({
          word: String(item.word),
          meaning: String(item.meaning),
          example: item.example ? String(item.example) : undefined,
        });
      });

      setParseErrors(errors);
      return results;
    } catch {
      setParseErrors(["Invalid JSON format"]);
      return [];
    }
  };

  const handlePreviewCSV = () => {
    const parsed = parseCSV(csvText);
    setPreviewData(parsed);
  };

  const handlePreviewJSON = () => {
    const parsed = parseJSON(jsonText);
    setPreviewData(parsed);
  };

  const handleImport = () => {
    if (previewData.length === 0) {
      toast({
        title: "Nothing to import",
        description: "Please add some vocabulary data first.",
        variant: "destructive",
      });
      return;
    }

    importMutation.mutate({
      vocabulary: previewData,
      collectionId: selectedCollection || undefined,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "csv" | "json") => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (type === "csv") {
        setCsvText(content);
        const parsed = parseCSV(content);
        setPreviewData(parsed);
      } else {
        setJsonText(content);
        const parsed = parseJSON(content);
        setPreviewData(parsed);
      }
    };
    reader.readAsText(file);
  };

  const backPath = collectionIdParam ? `/collections/${collectionIdParam}` : "/vocabulary";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href={backPath}>
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Import Vocabulary</h1>
          <p className="text-muted-foreground mt-1">
            Bulk import words from CSV or JSON
          </p>
        </div>
      </div>

      {/* Collection Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Target Collection</CardTitle>
          <CardDescription>
            Choose which collection to add the imported words to
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedCollection} 
            onValueChange={setSelectedCollection}
          >
            <SelectTrigger data-testid="select-import-collection">
              <SelectValue placeholder="Select a collection (optional)" />
            </SelectTrigger>
            <SelectContent>
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
        </CardContent>
      </Card>

      {/* Import Options */}
      <Card>
        <CardHeader>
          <CardTitle>Import Data</CardTitle>
          <CardDescription>
            Upload a file or paste your vocabulary data below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="csv" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="csv" data-testid="tab-csv">CSV Format</TabsTrigger>
              <TabsTrigger value="json" data-testid="tab-json">JSON Format</TabsTrigger>
            </TabsList>

            <TabsContent value="csv" className="space-y-4">
              <div className="space-y-2">
                <Label>Upload CSV File</Label>
                <Input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => handleFileUpload(e, "csv")}
                  data-testid="input-csv-file"
                />
              </div>
              <div className="space-y-2">
                <Label>Or paste CSV data</Label>
                <Textarea
                  placeholder="word,meaning,example (optional)
serendipity,the occurrence of events by chance in a happy way,Finding that book was pure serendipity
ephemeral,lasting for a very short time,The ephemeral beauty of cherry blossoms"
                  className="font-mono text-sm min-h-[150px]"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  data-testid="input-csv-text"
                />
                <p className="text-xs text-muted-foreground">
                  Format: word,meaning,example (example is optional)
                </p>
              </div>
              <Button onClick={handlePreviewCSV} variant="outline" data-testid="button-preview-csv">
                Preview Import
              </Button>
            </TabsContent>

            <TabsContent value="json" className="space-y-4">
              <div className="space-y-2">
                <Label>Upload JSON File</Label>
                <Input
                  type="file"
                  accept=".json"
                  onChange={(e) => handleFileUpload(e, "json")}
                  data-testid="input-json-file"
                />
              </div>
              <div className="space-y-2">
                <Label>Or paste JSON data</Label>
                <Textarea
                  placeholder={`[
  {"word": "serendipity", "meaning": "the occurrence of events by chance in a happy way", "example": "Finding that book was pure serendipity"},
  {"word": "ephemeral", "meaning": "lasting for a very short time"}
]`}
                  className="font-mono text-sm min-h-[150px]"
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  data-testid="input-json-text"
                />
                <p className="text-xs text-muted-foreground">
                  Format: Array of objects with word, meaning, and optional example
                </p>
              </div>
              <Button onClick={handlePreviewJSON} variant="outline" data-testid="button-preview-json">
                Preview Import
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Parse Errors */}
      {parseErrors.length > 0 && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-start gap-2 text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Parsing errors found:</p>
                <ul className="text-sm mt-1 space-y-1">
                  {parseErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Preview ({previewData.length} words)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {previewData.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Check className="h-4 w-4 text-chart-2 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium">{item.word}</p>
                    <p className="text-sm text-muted-foreground">{item.meaning}</p>
                    {item.example && (
                      <p className="text-xs italic text-muted-foreground mt-1">
                        "{item.example}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {previewData.length > 10 && (
                <p className="text-center text-sm text-muted-foreground py-2">
                  ... and {previewData.length - 10} more words
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link href={backPath} className="flex-1">
          <Button type="button" variant="outline" className="w-full" data-testid="button-cancel">
            Cancel
          </Button>
        </Link>
        <Button 
          onClick={handleImport}
          className="flex-1 gap-2"
          disabled={previewData.length === 0 || importMutation.isPending}
          data-testid="button-import"
        >
          {importMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Import {previewData.length > 0 ? `${previewData.length} Words` : "Words"}
        </Button>
      </div>
    </div>
  );
}
