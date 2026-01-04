'use client';

import { useState, useMemo, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Sparkles, Loader2, Edit, Users, Pencil } from 'lucide-react';
import { suggestCalculations } from '@/ai/flows/suggest-calculations';
import type { SuggestCalculationsOutput } from '@/ai/flows/suggest-calculations';
import { useToast } from '@/hooks/use-toast';
import { SuggestionsSheet } from '@/app/components/suggestions-sheet';
import { UserInputDialog } from '@/app/components/user-input-dialog';
import { RenameDialog } from '@/app/components/rename-dialog';

interface OutputData {
  id: number;
  name: string;
  inputs: (number | string)[];
  outputSum: number | null;
  displayUserId: number;
}

interface UserData {
  id: number;
  name: string;
  outputs: OutputData[];
}

const generateInitialUsers = (): UserData[] => {
  const userCount = 4;
  const outputCount = 3;
  const users = Array.from({ length: userCount }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    outputs: [] as OutputData[],
  }));

  users.forEach((user, userIndex) => {
    const otherUsers = users.filter(u => u.id !== user.id);
    user.outputs = Array.from({ length: outputCount }, (_, j) => {
      const displayUser = otherUsers[j % otherUsers.length];
      return {
        id: j + 1,
        name: user.name,
        inputs: Array(6).fill(''),
        outputSum: 0,
        displayUserId: displayUser.id,
      };
    });
  });

  return users;
};


const initialUsers = generateInitialUsers();


export default function Home() {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSuggesting, startSuggestionTransition] = useTransition();
  const { toast } = useToast();

  const [isInputDialogOpen, setIsInputDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [currentOutput, setCurrentOutput] = useState<{
    mainUserId: number;
    output: OutputData;
  } | null>(null);

  const handleOpenDialog = (mainUserId: number, output: OutputData) => {
    setCurrentOutput({ mainUserId, output });
    setIsInputDialogOpen(true);
  };

  const handleSaveInputs = (
    mainUserId: number,
    outputId: number,
    inputs: (number | string)[]
  ) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === mainUserId
          ? {
              ...user,
              outputs: user.outputs.map((output) =>
                output.id === outputId
                  ? {
                      ...output,
                      inputs: inputs,
                      outputSum: inputs.reduce((acc, val) => acc + (Number(val) || 0), 0),
                    }
                  : output
              ),
            }
          : user
      )
    );
    setIsInputDialogOpen(false);
  };

  const handleSaveUserNames = (updatedUsers: { id: number; name: string }[]) => {
    setUsers((prevUsers) => {
      const newUsers = prevUsers.map((user) => {
        const updatedUser = updatedUsers.find((u) => u.id === user.id);
        if (updatedUser) {
          return {
            ...user,
            name: updatedUser.name,
            outputs: user.outputs.map((output) => ({
              ...output,
              name: updatedUser.name, // Only update the row's owner name
            })),
          };
        }
        return user;
      });
      return newUsers;
    });
    setIsRenameDialogOpen(false);
  };

  const handleReset = () => {
    setUsers(generateInitialUsers());
    setSuggestions([]);
  };

  const handleSuggest = () => {
    setIsSheetOpen(true);
    startSuggestionTransition(async () => {
      try {
        const allRowsHaveData = users.every(user => 
            user.outputs.every(output => {
                return output.inputs.length === 6 && output.inputs.every(val => val !== '');
            })
        );

        if (!allRowsHaveData) {
            toast({
                variant: 'destructive',
                title: 'Incomplete Data',
                description: 'Please ensure all 6 inputs are filled for every output row before requesting suggestions.',
            });
            return;
        }

        const inputForAI = users.flatMap(user => 
            user.outputs.map(output => 
                output.inputs.map(val => Number(val) || 0)
            )
        );

        const result: SuggestCalculationsOutput = await suggestCalculations({ userInputs: inputForAI });
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

  const memoizedTableBody = useMemo(() => (
    <TableBody>
      {users.map((user) =>
        user.outputs.map((output, outputIndex) => {
          const displayUser = users.find(u => u.id === output.displayUserId);

          return (
            <TableRow key={`${user.id}-${output.id}`}>
              {outputIndex === 0 && (
                <TableCell className="font-semibold text-foreground/90 align-top" rowSpan={user.outputs.length}>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary"/>
                    {user.name}
                  </div>
                </TableCell>
              )}
              <TableCell className="font-medium text-foreground/80">
                {displayUser ? displayUser.name : ''}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(user.id, output)}
                  className="w-full justify-start"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Enter Data
                </Button>
              </TableCell>
              <TableCell className="font-semibold text-center text-primary text-lg transition-all duration-300">
                {output.outputSum?.toLocaleString() ?? '0'}
              </TableCell>
            </TableRow>
          );
        })
      )}
    </TableBody>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [users]);


  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-5xl">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-4xl font-bold text-primary tracking-tight">
            FormulaShare
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Rename
            </Button>
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
                    <TableHead className="w-[120px]">User</TableHead>
                    <TableHead className="w-[200px]">食</TableHead>
                    <TableHead className="w-[400px]">Inputs (6 per Output)</TableHead>
                    <TableHead className="text-center w-[150px]">Output Sum</TableHead>
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
      {currentOutput && (
        <UserInputDialog
          isOpen={isInputDialogOpen}
          onClose={() => setIsInputDialogOpen(false)}
          mainUserId={currentOutput.mainUserId}
          output={currentOutput.output}
          onSave={handleSaveInputs}
        />
      )}
      <RenameDialog
        isOpen={isRenameDialogOpen}
        onClose={() => setIsRenameDialogOpen(false)}
        users={users}
        onSave={handleSaveUserNames}
       />

    </main>
  );
}
