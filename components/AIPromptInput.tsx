'use client'
import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import SafeIcon from '@/components/SafeIcon'
import { Sparkles, Send, Loader2, Film, Tv, Gamepad2, Layers } from 'lucide-react'

interface AIPromptInputProps {
  onSubmit: (prompt: string, mediaType: 'movie' | 'tv' | 'game' | 'all') => void;
  isLoading: boolean;
  disabled?: boolean;
}

type MediaTypeOption = {
  value: 'movie' | 'tv' | 'game' | 'all';
  label: string;
  icon: any;
};

const mediaTypes: MediaTypeOption[] = [
  { value: 'all', label: 'All', icon: Layers },
  { value: 'movie', label: 'Movies', icon: Film },
  { value: 'tv', label: 'TV Shows', icon: Tv },
  { value: 'game', label: 'Games', icon: Gamepad2 },
];

const examplePrompts = [
  "Something like Blade Runner but more action-packed",
  "A cozy show to watch on a rainy day",
  "Mind-bending sci-fi I haven't seen",
  "Something funny for date night",
  "An underrated thriller from the 90s",
  "A documentary about nature",
];

const AIPromptInput = ({ onSubmit, isLoading, disabled = false }: AIPromptInputProps) => {
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState<'movie' | 'tv' | 'game' | 'all'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading && !disabled) {
      onSubmit(prompt.trim(), selectedType);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10">
            <SafeIcon icon={Sparkles} className="h-5 w-5 text-primary" size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-lg">AI Recommendations</h2>
            <p className="text-sm text-muted-foreground">
              Tell me what you are in the mood for
            </p>
          </div>
        </div>

        {/* Media Type Selector */}
        <div className="flex flex-wrap gap-2">
          {mediaTypes.map((type) => (
            <Button
              key={type.value}
              variant={selectedType === type.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type.value)}
              disabled={disabled || isLoading}
              className="transition-all duration-200"
            >
              <SafeIcon icon={type.icon} className="h-4 w-4 mr-1.5" size={16} />
              {type.label}
            </Button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Something like Inception but more mysterious..."
            disabled={disabled || isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!prompt.trim() || isLoading || disabled}
            className="px-4"
          >
            {isLoading ? (
              <SafeIcon icon={Loader2} className="h-4 w-4 animate-spin" size={16} />
            ) : (
              <SafeIcon icon={Send} className="h-4 w-4" size={16} />
            )}
          </Button>
        </form>

        {/* Example Prompts */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.slice(0, 4).map((example, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 transition-colors text-xs"
                onClick={() => handleExampleClick(example)}
              >
                {example}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIPromptInput;
