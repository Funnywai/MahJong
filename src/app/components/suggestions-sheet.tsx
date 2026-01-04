'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Loader2, Lightbulb } from 'lucide-react';

interface SuggestionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: string[];
  isLoading: boolean;
}

export function SuggestionsSheet({
  open,
  onOpenChange,
  suggestions,
  isLoading,
}: SuggestionsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-background/95 backdrop-blur-sm">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl text-primary">
            <Lightbulb className="h-6 w-6" />
            AI Formula Suggestions
          </SheetTitle>
          <SheetDescription>
            Here are some calculation ideas based on the entered numbers.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Generating ideas...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
                >
                  <div className="mt-1 h-2 w-2 rounded-full bg-accent flex-shrink-0" />
                  <p className="text-sm text-foreground/90">{suggestion}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <p>No suggestions available at the moment.</p>
              <p className="text-xs mt-2">Try entering some numbers and clicking the suggestion button again.</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
