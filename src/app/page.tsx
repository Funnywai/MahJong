'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { suggestCalculations } from '@/ai/flows/suggest-calculations';
import type { SuggestCalculationsOutput } from '@/ai/flows/suggest-calculations';
import { useToast } from '@/hooks/use-toast';
import { SuggestionsSheet } from '@/app/components/suggestions-sheet';

interface UserData {
  id: number;
  name: string;
  inputs: (number | string)[];
  userSum: number | null;
  sharedAvg: number | null;
}

const initialUsers: UserData[] = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  inputs: Array(6).fill(''),
  userSum: 0,
  sharedAvg: 0,
}));

export default function Home() {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSuggesting, startSuggestionTransition] = useTransition();
  const { toast } = useToast();

  const handleInputChange = (
    userId: number,
    inputIndex: number,
    value: string
  ) => {
    const newUsers = users.map((user) => {
      if (user.id === userId) {
        const newInputs = [...user.inputs];
        newInputs[inputIndex] = value;
        return { ...user, inputs: newInputs };
      }
      return user;
    });
    setUsers(newUsers);
  };

  const handleReset = () => {
    setUsers(
      users.map((user) => ({
        ...user,
        inputs: Array(6).fill(''),
      }))
    );
    setSuggestions([]);
  };

  const handleSuggest = () => {
    setIsSheetOpen(true);
    startSuggestionTransition(async () => {
      try {
        const inputForAI = users.map((user) =>
          user.inputs.map((val) => Number(val) || 0)
        );

        // Ensure the input matches the expected schema of 4 users with 6 inputs each
        if (inputForAI.length !== 4 || inputForAI.some(arr => arr.length !== 6)) {
          throw new Error("Input data is not in the correct format for AI suggestions.");
        }
        
        const result: SuggestCalculationsOutput = await suggestCalculations({ userInputs: inputForAI as [number[], number[], number[], number[]] });
        setSuggestions(result.suggestions);
      } catch (error) {
        console.error('AI suggestion error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch AI suggestions. Please try again.',
        });
        setSuggestions([]);
      }
    });
  };

  useEffect(() => {
    const newUsers = users.map((currentUser) => {
      const userSum = currentUser.inputs.reduce(
        (acc, val) => acc + (Number(val) || 0),
        0
      );
      return { ...currentUser, userSum };
    });

    const totalFirstInput = users.reduce(
      (acc, user) => acc + (Number(user.inputs[0]) || 0),
      0
    );
    const sharedAvg = users.length > 0 ? totalFirstInput / users.length : 0;

    setUsers(
      newUsers.map((user) => ({ ...user, sharedAvg: parseFloat(sharedAvg.toFixed(2)) }))
    );
  }, [JSON.stringify(users.map(u => u.inputs))]);
  
  const memoizedTableBody = useMemo(() => (
    <TableBody>
      {users.map((user) => (
        <TableRow key={user.id}>
          <TableCell className="font-medium text-foreground/80">{user.name}</TableCell>
          {user.inputs.map((input, index) => (
            <TableCell key={index}>
              <Input
                type="number"
                value={input}
                onChange={(e) => handleInputChange(user.id, index, e.target.value)}
                className="w-24 text-center bg-background/60"
                aria-label={`${user.name} input ${index + 1}`}
              />
            </TableCell>
          ))}
          <TableCell className="font-semibold text-center text-primary transition-all duration-300">
            {user.userSum?.toLocaleString() ?? '0'}
          </TableCell>
          <TableCell className="font-semibold text-center text-primary/80 transition-all duration-300">
            {user.sharedAvg?.toLocaleString() ?? '0'}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  ), [users]);


  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-7xl">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-4xl font-bold text-primary tracking-tight">
            FormulaShare
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" /> Reset
            </Button>
            <Button
              onClick={handleSuggest}
              disabled={isSuggesting}
              style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
              className="hover:bg-accent/90"
            >
              {isSuggesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Suggest Formulas
            </Button>
          </div>
        </header>

        <Card className="shadow-lg border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg text-foreground/90">User Data & Calculations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">User</TableHead>
                    {Array.from({ length: 6 }, (_, i) => (
                      <TableHead key={i} className="text-center w-28">Input {i + 1}</TableHead>
                    ))}
                    <TableHead className="text-center">User's Sum</TableHead>
                    <TableHead className="text-center">Shared Avg</TableHead>
                  </TableRow>
                </TableHeader>
                {memoizedTableBody}
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <SuggestionsSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        suggestions={suggestions}
        isLoading={isSuggesting}
      />
    </main>
  );
}
