
'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { contextualAiAstrologerChat } from '@/ai/flows/contextual-ai-astrologer-chat';
import { interpretAstrologicalChart, type InterpretAstrologicalChartOutput } from '@/ai/flows/interpret-astrological-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Loader2, Send, Sparkles, User, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PlacesAutocomplete } from '@/components/common/places-autocomplete';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTranslation } from '@/context/language-context';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const setupSchema = z.object({
  birthDate: z.string().min(1, 'Birth date is required'),
  birthTime: z.string().min(1, 'Birth time is required'),
  birthLocation: z.string().min(1, 'Birth location is required'),
});
type SetupFormValues = z.infer<typeof setupSchema>;

type ChatContext = {
  astrologyReading: InterpretAstrologicalChartOutput;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isSetupFormOpen, setIsSetupFormOpen] = useState(true);
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);

  const { toast } = useToast();
  const { t } = useTranslation();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      birthDate: '',
      birthTime: '',
      birthLocation: '',
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages]);

  const handleSetupSubmit = async (values: SetupFormValues) => {
    setIsSettingUp(true);
    try {
      const astrologyReading = await interpretAstrologicalChart({
        birthDate: values.birthDate,
        birthTime: values.birthTime,
        birthLocation: values.birthLocation,
        astrologySystem: 'Vedic (Sidereal)', // Defaulting for chat context
      });
      
      setChatContext({ astrologyReading });
      setIsSetupComplete(true);
      setIsSetupFormOpen(false);

      toast({
        title: t('chat.ready_toast'),
        description: t('chat.ready_toast_desc'),
      });

    } catch (error) {
      console.error('Setup error:', error);
      toast({
        title: t('common.error'),
        description: t('chat.setup_error'),
        variant: 'destructive',
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatContext) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = newMessages.slice(0, -1).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));
      const { response } = await contextualAiAstrologerChat({ 
          message: input, 
          chatHistory,
          astrologyReading: chatContext.astrologyReading,
       });
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages([...newMessages, assistantMessage]);
    } catch (error: any) {
        console.error('Chat error:', error);
        const errorMessage = error.message || '';
        if (errorMessage.includes('503')) {
            toast({
                title: 'Service Overloaded',
                description: 'The AI astrologer is very popular right now. Please try again in a moment.',
                variant: 'destructive',
            });
        } else {
            toast({
                title: t('common.error'),
                description: 'Could not get a response. Please try again.',
                variant: 'destructive',
            });
        }
        setMessages(messages); // Revert to previous messages state
    } finally {
      setIsLoading(false);
    }
  };

  const renderSetupForm = () => (
    <Collapsible open={isSetupFormOpen} onOpenChange={setIsSetupFormOpen}>
      <Card className="mb-8 bg-card/50 backdrop-blur-sm">
        <CollapsibleTrigger asChild>
            <div className='flex justify-between items-center p-6 cursor-pointer'>
                <div>
                    <CardTitle>{t('chat.setup_title')}</CardTitle>
                    <CardDescription>{t('chat.setup_subtitle')}</CardDescription>
                </div>
                 <Button variant="ghost" size="sm">
                    {isSetupFormOpen ? <ChevronUp /> : <ChevronDown />}
                    <span className="sr-only">Toggle Setup</span>
                </Button>
            </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
            <CardContent>
              <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(handleSetupSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('chat.birth_date_label')}</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="birthTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('chat.birth_time_label')}</FormLabel>
                          <FormControl><Input type="time" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="birthLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('chat.birth_location_label')}</FormLabel>
                        <FormControl>
                          <PlacesAutocomplete
                            onLocationSelect={(location) => form.setValue('birthLocation', location, { shouldValidate: true })}
                            initialValue={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSettingUp} className="w-full">
                    {isSettingUp ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('chat.analyzing_button')}</>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" />{t('chat.start_chat_button')}</>
                    )}
                  </Button>
                </form>
              </FormProvider>
            </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-headline text-5xl font-bold">{t('chat.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('chat.subtitle')}</p>
      </div>

      {!isSetupComplete ? renderSetupForm() : (
          <Card className="flex-1 flex flex-col bg-card/50 backdrop-blur-sm">
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                <div className="space-y-6">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Sparkles className="mx-auto h-12 w-12 mb-4 text-accent" />
                      <p>{t('chat.initial_message')}</p>
                    </div>
                  )}
                  {messages.map((message, index) => (
                    <div key={index} className={cn('flex items-start gap-4', message.role === 'user' ? 'justify-end' : '')}>
                      {message.role === 'assistant' && (
                        <Avatar><AvatarFallback><Bot /></AvatarFallback></Avatar>
                      )}
                      <div className={cn('max-w-lg p-3 rounded-lg', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === 'user' && (
                        <Avatar><AvatarFallback><User /></AvatarFallback></Avatar>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-start gap-4">
                      <Avatar><AvatarFallback><Bot /></AvatarFallback></Avatar>
                      <div className="max-w-md p-3 rounded-lg bg-secondary">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 border-t">
              <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('chat.input_placeholder')}
                  disabled={isLoading || !isSetupComplete}
                />
                <Button type="submit" disabled={isLoading || !input.trim() || !isSetupComplete}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">{t('chat.send_button_sr')}</span>
                </Button>
              </form>
            </CardFooter>
          </Card>
      )}
    </div>
  );
}
