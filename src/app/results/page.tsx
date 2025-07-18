
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
import { Loader2, Star, Hand, User as UserIcon, Bot, FileText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type Result = DocumentData & {
    id: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
};

export default function ResultsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [results, setResults] = useState<Result[]>([]);
    const [isLoadingResults, setIsLoadingResults] = useState(true);
    const [resultToDelete, setResultToDelete] = useState<Result | null>(null);
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

                // Sort results by date on the client side
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


    const renderResultContent = (result: Result) => {
        switch (result.type) {
            case 'astrology':
                return (
                    <div className="space-y-2">
                        <p><strong>Personality Traits:</strong> {result.data.personalityTraits}</p>
                        <p><strong>Life Tendencies:</strong> {result.data.lifeTendencies}</p>
                        <p><strong>Key Insights:</strong> {result.data.keyInsights}</p>
                        {result.data.nextMonthForecast && <p><strong>Next Month Forecast:</strong> {result.data.nextMonthForecast}</p>}
                        {result.data.nextThreeYearsForecast && <p><strong>Next 3 Years Forecast:</strong> {result.data.nextThreeYearsForecast}</p>}
                        {result.data.significantEvents && <p><strong>Significant Events:</strong> {result.data.significantEvents}</p>}
                    </div>
                );
            case 'palmistry':
                return <p>{result.data.analysis}</p>;
            case 'face-reading':
                return (
                    <div className="space-y-2">
                        <p><strong>Summary:</strong> {result.data.summary}</p>
                        <p><strong>Personality Insights:</strong> {result.data.personalityInsights}</p>
                        <p><strong>Fortune Prediction:</strong> {result.data.fortunePrediction}</p>
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
                            <div className="flex items-center w-full">
                                <AccordionTrigger className="p-4 text-lg font-medium hover:no-underline flex-1">
                                <div className="flex items-center gap-4">
                                    {getIcon(result.type)}
                                    <span className="capitalize">{result.type.replace('-', ' ')} Reading</span>
                                    <span className="text-sm text-muted-foreground ml-auto">
                                        {format(new Date(result.createdAt.seconds * 1000), 'PPP p')}
                                    </span>
                                </div>
                                </AccordionTrigger>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 mr-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setResultToDelete(result);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete result</span>
                                </Button>
                            </div>
                            <AccordionContent className="p-4 pt-0 text-muted-foreground space-y-2">
                                {renderResultContent(result)}
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
