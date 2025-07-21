
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc, DocumentData } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Star, Hand, User as UserIcon, FileText, Trash2, Languages, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { translateObject } from '@/ai/flows/translate-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/context/language-context';
import { languages as allLanguages } from '@/data/languages';

type Result = DocumentData & {
    id: string;
    name: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
    translations?: Record<string, any>;
};

export default function ResultsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [results, setResults] = useState<Result[]>([]);
    const [isLoadingResults, setIsLoadingResults] = useState(true);
    const [resultToDelete, setResultToDelete] = useState<Result | null>(null);
    const [resultToRename, setResultToRename] = useState<Result | null>(null);
    const [newName, setNewName] = useState('');
    const [isRenaming, setIsRenaming] = useState(false);
    const [translationState, setTranslationState] = useState<Record<string, {
        isTranslating: boolean;
        selectedLanguage: string;
    }>>({});
    const { toast } = useToast();
    const { t } = useTranslation();

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
                    title: t('common.error'),
                    description: "Could not fetch your saved results.",
                    variant: "destructive"
                });
            } finally {
                setIsLoadingResults(false);
            }
        };

        fetchResults();
    }, [user, loading, router, toast, t]);

    const handleDelete = async () => {
        if (!resultToDelete) return;

        try {
            await deleteDoc(doc(db, 'results', resultToDelete.id));
            setResults(results.filter(r => r.id !== resultToDelete.id));
            toast({
                title: t('common.success'),
                description: t('results.deleted_toast'),
            });
        } catch (error) {
            console.error("Error deleting result:", error);
            toast({
                title: t('common.error'),
                description: "Could not delete the result. Please try again.",
                variant: "destructive"
            });
        } finally {
            setResultToDelete(null);
        }
    };
    
    const openRenameDialog = (result: Result) => {
        setResultToRename(result);
        const defaultName = result.type === 'astrology' ? t('results.type_astrology') :
                            result.type === 'palmistry' ? t('results.type_palmistry') :
                            t('results.type_face_reading');
        setNewName(result.name || `${defaultName}`);
    };

    const handleRename = async () => {
        if (!resultToRename || !newName.trim()) return;

        setIsRenaming(true);
        try {
            const resultDocRef = doc(db, 'results', resultToRename.id);
            await updateDoc(resultDocRef, {
                name: newName.trim(),
            });

            setResults(results.map(r => r.id === resultToRename.id ? { ...r, name: newName.trim() } : r));
            toast({
                title: t('common.success'),
                description: t('results.renamed_toast'),
            });
            setResultToRename(null);
            setNewName('');
        } catch (error) {
            console.error("Error renaming result:", error);
            toast({
                title: t('common.error'),
                description: "Could not rename the result. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsRenaming(false);
        }
    };

    const handleTranslate = async (resultId: string) => {
        const { selectedLanguage } = translationState[resultId] || {};
        const currentResult = results.find(r => r.id === resultId);
        if (!selectedLanguage || selectedLanguage === 'English' || !currentResult) return;

        if (currentResult.translations?.[selectedLanguage]) {
            return; // Already cached, do nothing.
        }

        setTranslationState(prev => ({
            ...prev,
            [resultId]: { ...prev[resultId], isTranslating: true }
        }));

        try {
            const { translatedObject } = await translateObject({ objectToTranslate: currentResult.data, targetLanguage: selectedLanguage });
            
            const resultDocRef = doc(db, 'results', resultId);
            await updateDoc(resultDocRef, {
                [`translations.${selectedLanguage}`]: translatedObject,
            });

            setResults(prevResults =>
                prevResults.map(r =>
                    r.id === resultId
                        ? { ...r, translations: { ...(r.translations || {}), [selectedLanguage]: translatedObject } }
                        : r
                )
            );
            
        } catch (error) {
            console.error("Translation error:", error);
            toast({
                title: t('common.error'),
                description: "Failed to translate the result.",
                variant: "destructive"
            });
        } finally {
             setTranslationState(prev => ({
                ...prev,
                [resultId]: { ...prev[resultId], isTranslating: false }
            }));
        }
    };
    
    const handleLanguageChange = (resultId: string, language: string) => {
        setTranslationState(prev => ({
            ...prev,
            [resultId]: { ...prev[resultId], selectedLanguage: language }
        }));
    };
    
    const getResultContent = (result: Result) => {
        const selectedLanguage = translationState[result.id]?.selectedLanguage || 'English';
        const data = result.translations?.[selectedLanguage] || result.data;
        
        switch (result.type) {
            case 'astrology':
                return (
                    <div className="space-y-2">
                        <p><strong>{t('astrology.personality_traits')}:</strong> {data.personalityTraits}</p>
                        <p><strong>{t('astrology.life_tendencies')}:</strong> {data.lifeTendencies}</p>
                        <p><strong>{t('astrology.key_insights')}:</strong> {data.keyInsights}</p>
                        {data.nextMonthForecast && <p><strong>{t('astrology.next_month_forecast')}:</strong> {data.nextMonthForecast}</p>}
                        {data.nextThreeYearsForecast && <p><strong>{t('astrology.next_3_years_forecast')}:</strong> {data.nextThreeYearsForecast}</p>}
                        {data.significantEvents && <p><strong>{t('astrology.significant_events')}:</strong> {data.significantEvents}</p>}
                    </div>
                );
            case 'palmistry':
                return (
                    <div className="space-y-2">
                        <p><strong>{t('palmistry.summary')}:</strong> {data.summary}</p>
                        <p><strong>{t('palmistry.life_line')}:</strong> {data.lifeLine}</p>
                        <p><strong>{t('palmistry.head_line')}:</strong> {data.headLine}</p>
                        <p><strong>{t('palmistry.heart_line')}:</strong> {data.heartLine}</p>
                        <p><strong>{t('palmistry.fate_line')}:</strong> {data.fateLine}</p>
                        {data.probableEvents && <p><strong>{t('palmistry.probable_events')}:</strong> {data.probableEvents}</p>}
                        {data.futureOutlook && <p><strong>{t('palmistry.future_outlook')}:</strong> {data.futureOutlook}</p>}
                        {data.limitations && <p><strong>{t('palmistry.limitations')}:</strong> {data.limitations}</p>}
                    </div>
                );
            case 'face-reading':
                return (
                    <div className="space-y-2">
                        <p><strong>{t('face_reading.summary')}:</strong> {data.summary}</p>
                        <p><strong>{t('face_reading.personality_insights')}:</strong> {data.personalityInsights}</p>
                        <p><strong>{t('face_reading.fortune_prediction')}:</strong> {data.fortunePrediction}</p>
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

    const getResultTypeName = (type: string) => {
        switch (type) {
            case 'astrology': return t('results.type_astrology');
            case 'palmistry': return t('results.type_palmistry');
            case 'face-reading': return t('results.type_face_reading');
            default: return 'Reading';
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
                <h1 className="font-headline text-5xl font-bold">{t('results.title')}</h1>
                <p className="text-muted-foreground mt-2">{t('results.subtitle')}</p>
            </div>

            {results.length > 0 ? (
                 <Accordion type="single" collapsible className="w-full space-y-4">
                    {results.map(result => (
                        <AccordionItem value={result.id} key={result.id} className="bg-card/50 backdrop-blur-sm border rounded-lg">
                           <AccordionTrigger className="text-lg w-full font-medium hover:no-underline p-4">
                                <div className="flex items-center gap-4 flex-1">
                                    {getIcon(result.type)}
                                    <span className="capitalize text-left truncate">{result.name || `${getResultTypeName(result.type)}`}</span>
                                    <span className="text-sm text-muted-foreground ml-auto flex-shrink-0">
                                        {format(new Date(result.createdAt.seconds * 1000), 'PPP')}
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <div className="px-4 pb-4 border-b flex items-center justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openRenameDialog(result);
                                    }}
                                >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    {t('common.rename')}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setResultToDelete(result);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {t('common.delete')}
                                </Button>
                            </div>
                            <AccordionContent className="p-4 pt-4 text-muted-foreground space-y-4">
                                <div>{getResultContent(result)}</div>
                                <div className="flex items-center gap-2 pt-4 border-t">
                                     <Select 
                                         onValueChange={(lang) => handleLanguageChange(result.id, lang)}
                                         defaultValue={translationState[result.id]?.selectedLanguage || 'English'}
                                     >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder={t('zodiac.select_language')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allLanguages.map(lang => (
                                                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button 
                                        onClick={() => handleTranslate(result.id)}
                                        disabled={translationState[result.id]?.isTranslating || !translationState[result.id]?.selectedLanguage || translationState[result.id]?.selectedLanguage === 'English'}
                                    >
                                        {translationState[result.id]?.isTranslating ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Languages className="mr-2 h-4 w-4" />
                                        )}
                                        {t('common.translate')}
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>{t('results.no_results_title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{t('results.no_results_subtitle')}</p>
                    </CardContent>
                </Card>
            )}

            <Dialog open={!!resultToRename} onOpenChange={(open) => !open && setResultToRename(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('results.rename_dialog_title')}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">{t('results.rename_label')}</Label>
                            <Input
                                id="name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">{t('common.cancel')}</Button>
                        </DialogClose>
                        <Button onClick={handleRename} disabled={isRenaming}>
                            {isRenaming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('common.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!resultToDelete} onOpenChange={(open) => !open && setResultToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>{t('results.delete_confirm_title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('results.delete_confirm_desc')}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setResultToDelete(null)}>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('common.delete')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
