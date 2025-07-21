
'use client';

import { useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/context/language-context';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof formSchema>;

interface AuthFormProps {
  type: 'signIn' | 'signUp';
  form: UseFormReturn<FormValues>;
  onSubmit: (values: FormValues) => void;
  isLoading: boolean;
}

const AuthForm = ({ type, form, onSubmit, isLoading }: AuthFormProps) => {
    const { t } = useTranslation();
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('login.email_label')}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t('login.email_placeholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('login.password_label')}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={t('login.password_placeholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-4 w-4" />
            )}
            {type === 'signIn' ? t('sidebar.sign_in') : t('sidebar.sign_out')}
          </Button>
        </form>
      </Form>
    );
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'signIn' | 'signUp'>('signIn');
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleAuthAction = async (values: FormValues) => {
    setIsLoading(true);
    try {
      if (activeTab === 'signIn') {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        toast({ title: t('common.success'), description: 'Signed in successfully.' });
      } else {
        await createUserWithEmailAndPassword(auth, values.email, values.password);
        toast({ title: t('common.success'), description: 'Account created successfully.' });
      }
      router.push('/');
    } catch (error: any) {
      console.error(`${activeTab} error:`, error);
      toast({
        title: t('common.error'),
        description: error.message || `Failed to ${activeTab}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Tabs 
        defaultValue="signIn" 
        className="w-full"
        onValueChange={(value) => {
          setActiveTab(value as 'signIn' | 'signUp');
          form.reset();
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signIn">{t('sidebar.sign_in')}</TabsTrigger>
          <TabsTrigger value="signUp">{t('sidebar.sign_out')}</TabsTrigger>
        </TabsList>
        <TabsContent value="signIn">
          <Card>
            <CardHeader>
              <CardTitle>{t('login.welcome_back')}</CardTitle>
              <CardDescription>{t('login.welcome_back_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <AuthForm type="signIn" form={form} onSubmit={handleAuthAction} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signUp">
          <Card>
            <CardHeader>
              <CardTitle>{t('login.create_account')}</CardTitle>
              <CardDescription>{t('login.create_account_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <AuthForm type="signUp" form={form} onSubmit={handleAuthAction} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
