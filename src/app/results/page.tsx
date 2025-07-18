
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, deleteDoc, DocumentData } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Star, Hand, User as UserIcon, FileText, Trash2, Languages } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { translateText, type TranslateTextOutput } from '@/ai/flows/translate-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Result = DocumentData & {
    id: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
    translatedData?: Record<string, any>;
};

const languages = [
    { value: 'English', label: 'English' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Chinese (Simplified)', label: 'Chinese (Simplified)' },
    { value: 'Russian', label: 'Russian' },
    { value: 'Arabic', label: 'Arabic' },
    { value: 'Hindi', label: 'Hindi' },
];

export default function ResultsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [results, setResults] = useState<Result[]>([]);
    const [isLoadingResults, setIsLoadingResults] = useState(true);
    const [resultToDelete, setResultToDelete] = useState<Result | null>(null);
    const [translationState, setTranslationState] = useState<Record<string, {
        isTranslating: boolean;
        selectedLanguage: string;
        translatedData?: any;
    }>>({});
    const { toast } = useToast();

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchResults = async () => {
            if (!user) return;
            setIsLoadingResults(true);
            try {
                const q = query(
                    collection(db, 'results'),
                    where('userId', '==', user.uid)
                );
                const querySnapshot = await getDocs(q);
                const userResults = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Result[];

                userResults.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
                
                setResults(userResults);
            } catch (error) {
                console.error("Error fetching results:", error);
                toast({
                    title: "Error",
                    description: "Could not fetch your saved results.",
                    variant: "destructive"
                });
            } finally {
                setIsLoadingResults(false);
            }
        };

        fetchResults();
    }, [user, loading, router, toast]);

    const handleDelete = async () => {
        if (!resultToDelete) return;

        try {
            await deleteDoc(doc(db, 'results', resultToDelete.id));
            setResults(results.filter(r => r.id !== resultToDelete.id));
            toast({
                title: "Success",
                description: "Result deleted successfully.",
            });
        } catch (error) {
            console.error("Error deleting result:", error);
            toast({
                title: "Error",
                description: "Could not delete the result. Please try again.",
                variant: "destructive"
            });
        } finally {
            setResultToDelete(null);
        }
    };
    
    const handleTranslate = async (resultId: string, textToTranslate: string) => {
        const { selectedLanguage } = translationState[resultId];
        if (!selectedLanguage || selectedLanguage === 'English') return;

        setTranslationState(prev => ({
            ...prev,
            [resultId]: { ...prev[resultId], isTranslating: true }
        }));

        try {
            const { translatedText } = await translateText({ text: textToTranslate, targetLanguage: selectedLanguage });
            const currentResult = results.find(r => r.id === resultId);
            if(currentResult) {
                const updatedData = await translateResultData(currentResult.data, selectedLanguage);
                setTranslationState(prev => ({
                    ...prev,
                    [resultId]: { ...prev[resultId], isTranslating: false, translatedData: updatedData }
                }));
            }
        } catch (error) {
            console.error("Translation error:", error);
            toast({
                title: "Error",
                description: "Failed to translate the result.",
                variant: "destructive"
            });
             setTranslationState(prev => ({
                ...prev,
                [resultId]: { ...prev[resultId], isTranslating: false }
            }));
        }
    };

    const translateResultData = async (data: any, language: string): Promise<any> => {
        const translatedData: any = {};
        for (const key in data) {
            if(typeof data[key] === 'string') {
                const { translatedText } = await translateText({ text: data[key], targetLanguage: language });
                translatedData[key] = translatedText;
            } else {
                translatedData[key] = data[key];
            }
        }
        return translatedData;
    };
    
    const handleLanguageChange = (resultId: string, language: string) => {
        setTranslationState(prev => ({
            ...prev,
            [resultId]: { ...prev[resultId], selectedLanguage: language }
        }));
         if (language === 'English') {
            setTranslationState(prev => {
                const newState = { ...prev };
                delete newState[resultId]?.translatedData;
                return newState;
            });
        }
    };
    
    const getResultContent = (result: Result) => {
        const data = translationState[result.id]?.translatedData || result.data;
        switch (result.type) {
            case 'astrology':
                return (
                    <div className="space-y-2">
                        <p><strong>Personality Traits:</strong> {data.personalityTraits}</p>
                        <p><strong>Life Tendencies:</strong> {data.lifeTendencies}</p>
                        <p><strong>Key Insights:</strong> {data.keyInsights}</p>
                        {data.nextMonthForecast && <p><strong>Next Month Forecast:</strong> {data.nextMonthForecast}</p>}
                        {data.nextThreeYearsForecast && <p><strong>Next 3 Years Forecast:</strong> {data.nextThreeYearsForecast}</p>}
                        {data.significantEvents && <p><strong>Significant Events:</strong> {data.significantEvents}</p>}
                    </div>
                );
            case 'palmistry':
                return <p>{data.analysis}</p>;
            case 'face-reading':
                return (
                    <div className="space-y-2">
                        <p><strong>Summary:</strong> {data.summary}</p>
                        <p><strong>Personality Insights:</strong> {data.personalityInsights}</p>
                        <p><strong>Fortune Prediction:</strong> {data.fortunePrediction}</p>
                    </div>
                );
            default:
                return <p>Unknown result type.</p>;
        }
    };
    
    const getIcon = (type: string) => {
        switch (type) {
            case 'astrology':
                return <Star className="h-5 w-5 text-accent" />;
            case 'palmistry':
                return <Hand className="h-5 w-5 text-accent" />;
            case 'face-reading':
                return <UserIcon className="h-5 w-5 text-accent" />;
            default:
                return <FileText className="h-5 w-5 text-accent" />;
        }
    };


    if (loading || isLoadingResults) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="font-headline text-5xl font-bold">Your Saved Results</h1>
                <p className="text-muted-foreground mt-2">A history of all your past readings.</p>
            </div>

            {results.length > 0 ? (
                 <Accordion type="single" collapsible className="w-full space-y-4">
                    {results.map(result => (
                        <AccordionItem value={result.id} key={result.id} className="bg-card/50 backdrop-blur-sm border rounded-lg">
                            <div className="flex items-center w-full p-4">
                                <AccordionTrigger className="p-0 text-lg font-medium hover:no-underline flex-1">
                                <div className="flex items-center gap-4">
                                    {getIcon(result.type)}
                                    <span className="capitalize">{result.type.replace('-', ' ')} Reading</span>
                                    <span className="text-sm text-muted-foreground ml-auto pr-4">
                                        {format(new Date(result.createdAt.seconds * 1000), 'PPP p')}
                                    </span>
                                </div>
                                </AccordionTrigger>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setResultToDelete(result);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete result</span>
                                </Button>
                            </div>
                            <AccordionContent className="p-4 pt-0 text-muted-foreground space-y-4">
                                <div>{getResultContent(result)}</div>
                                <div className="flex items-center gap-2 pt-2 border-t">
                                     <Select 
                                         onValueChange={(lang) => handleLanguageChange(result.id, lang)}
                                         defaultValue="English"
                                     >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select Language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {languages.map(lang => (
                                                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button 
                                        onClick={() => handleTranslate(result.id, JSON.stringify(result.data))}
                                        disabled={translationState[result.id]?.isTranslating || !translationState[result.id]?.selectedLanguage || translationState[result.id]?.selectedLanguage === 'English'}
                                    >
                                        {translationState[result.id]?.isTranslating ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Languages className="mr-2 h-4 w-4" />
                                        )}
                                        Translate
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>No Results Yet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">You haven't performed any readings yet. Go explore the app to get started!</p>
                    </CardContent>
                </Card>
            )}

            <AlertDialog open={!!resultToDelete} onOpenChange={(open) => !open && setResultToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this result from our servers.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setResultToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
