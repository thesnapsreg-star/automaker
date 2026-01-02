import * as React from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import type { ModelAlias, CursorModelId, GroupedModel } from '@automaker/types';
import {
  stripProviderPrefix,
  CURSOR_MODEL_GROUPS,
  STANDALONE_CURSOR_MODELS,
  getModelGroup,
  isGroupSelected,
  getSelectedVariant,
} from '@automaker/types';
import { CLAUDE_MODELS, CURSOR_MODELS } from '@/components/views/board-view/shared/model-constants';
import { Check, ChevronsUpDown, Star, Brain, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface PhaseModelSelectorProps {
  label: string;
  description: string;
  value: ModelAlias | CursorModelId;
  onChange: (model: ModelAlias | CursorModelId) => void;
}

export function PhaseModelSelector({
  label,
  description,
  value,
  onChange,
}: PhaseModelSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [expandedGroup, setExpandedGroup] = React.useState<string | null>(null);
  const commandListRef = React.useRef<HTMLDivElement>(null);
  const expandedTriggerRef = React.useRef<HTMLDivElement>(null);
  const { enabledCursorModels, favoriteModels, toggleFavoriteModel } = useAppStore();

  // Close expanded group when trigger scrolls out of view
  React.useEffect(() => {
    const triggerElement = expandedTriggerRef.current;
    const listElement = commandListRef.current;
    if (!triggerElement || !listElement || !expandedGroup) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) {
          setExpandedGroup(null);
        }
      },
      {
        root: listElement,
        threshold: 0.1, // Close when less than 10% visible
      }
    );

    observer.observe(triggerElement);
    return () => observer.disconnect();
  }, [expandedGroup]);

  // Filter Cursor models to only show enabled ones
  const availableCursorModels = CURSOR_MODELS.filter((model) => {
    const cursorId = stripProviderPrefix(model.id) as CursorModelId;
    return enabledCursorModels.includes(cursorId);
  });

  // Helper to find current selected model details
  const currentModel = React.useMemo(() => {
    const claudeModel = CLAUDE_MODELS.find((m) => m.id === value);
    if (claudeModel) return { ...claudeModel, icon: Brain };

    const cursorModel = availableCursorModels.find((m) => stripProviderPrefix(m.id) === value);
    if (cursorModel) return { ...cursorModel, icon: Sparkles };

    // Check if value is part of a grouped model
    const group = getModelGroup(value as CursorModelId);
    if (group) {
      const variant = getSelectedVariant(group, value as CursorModelId);
      return {
        id: value,
        label: `${group.label} (${variant?.label || 'Unknown'})`,
        description: group.description,
        provider: 'cursor' as const,
        icon: Sparkles,
      };
    }

    return null;
  }, [value, availableCursorModels]);

  // Compute grouped vs standalone Cursor models
  const { groupedModels, standaloneCursorModels } = React.useMemo(() => {
    const grouped: GroupedModel[] = [];
    const standalone: typeof CURSOR_MODELS = [];
    const seenGroups = new Set<string>();

    availableCursorModels.forEach((model) => {
      const cursorId = stripProviderPrefix(model.id) as CursorModelId;

      // Check if this model is standalone
      if (STANDALONE_CURSOR_MODELS.includes(cursorId)) {
        standalone.push(model);
        return;
      }

      // Check if this model belongs to a group
      const group = getModelGroup(cursorId);
      if (group && !seenGroups.has(group.baseId)) {
        // Filter variants to only include enabled models
        const enabledVariants = group.variants.filter((v) => enabledCursorModels.includes(v.id));
        if (enabledVariants.length > 0) {
          grouped.push({
            ...group,
            variants: enabledVariants,
          });
          seenGroups.add(group.baseId);
        }
      }
    });

    return { groupedModels: grouped, standaloneCursorModels: standalone };
  }, [availableCursorModels, enabledCursorModels]);

  // Group models
  const { favorites, claude, cursor } = React.useMemo(() => {
    const favs: typeof CLAUDE_MODELS = [];
    const cModels: typeof CLAUDE_MODELS = [];
    const curModels: typeof CURSOR_MODELS = [];

    // Process Claude Models
    CLAUDE_MODELS.forEach((model) => {
      if (favoriteModels.includes(model.id)) {
        favs.push(model);
      } else {
        cModels.push(model);
      }
    });

    // Process Cursor Models
    availableCursorModels.forEach((model) => {
      if (favoriteModels.includes(model.id)) {
        favs.push(model);
      } else {
        curModels.push(model);
      }
    });

    return { favorites: favs, claude: cModels, cursor: curModels };
  }, [favoriteModels, availableCursorModels]);

  const renderModelItem = (model: (typeof CLAUDE_MODELS)[0], type: 'claude' | 'cursor') => {
    const isClaude = type === 'claude';
    // For Claude, value is model.id. For Cursor, it's stripped ID.
    const modelValue = isClaude ? model.id : stripProviderPrefix(model.id);
    const isSelected = value === modelValue;
    const isFavorite = favoriteModels.includes(model.id);
    const Icon = isClaude ? Brain : Sparkles;

    return (
      <CommandItem
        key={model.id}
        value={model.label}
        onSelect={() => {
          onChange(modelValue as ModelAlias | CursorModelId);
          setOpen(false);
        }}
        className="group flex items-center justify-between py-2"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <Icon
            className={cn(
              'h-4 w-4 shrink-0',
              isSelected ? 'text-primary' : 'text-muted-foreground'
            )}
          />
          <div className="flex flex-col truncate">
            <span className={cn('truncate font-medium', isSelected && 'text-primary')}>
              {model.label}
            </span>
            <span className="truncate text-xs text-muted-foreground">{model.description}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-6 w-6 hover:bg-transparent hover:text-yellow-500 focus:ring-0',
              isFavorite
                ? 'text-yellow-500 opacity-100'
                : 'opacity-0 group-hover:opacity-100 text-muted-foreground'
            )}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavoriteModel(model.id);
            }}
          >
            <Star className={cn('h-3.5 w-3.5', isFavorite && 'fill-current')} />
          </Button>
          {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
        </div>
      </CommandItem>
    );
  };

  // Render a grouped model with secondary popover for variant selection
  const renderGroupedModelItem = (group: GroupedModel) => {
    const groupIsSelected = isGroupSelected(group, value as CursorModelId);
    const selectedVariant = getSelectedVariant(group, value as CursorModelId);
    const isExpanded = expandedGroup === group.baseId;

    const variantTypeLabel =
      group.variantType === 'compute'
        ? 'Compute Level'
        : group.variantType === 'thinking'
          ? 'Reasoning Mode'
          : 'Capacity Options';

    return (
      <CommandItem
        key={group.baseId}
        value={group.label}
        onSelect={() => setExpandedGroup(isExpanded ? null : group.baseId)}
        className="p-0 data-[selected=true]:bg-transparent"
      >
        <Popover
          open={isExpanded}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setExpandedGroup(null);
            }
          }}
        >
          <PopoverTrigger asChild>
            <div
              ref={isExpanded ? expandedTriggerRef : undefined}
              className={cn(
                'w-full group flex items-center justify-between py-2 px-2 rounded-sm cursor-pointer',
                'hover:bg-accent',
                isExpanded && 'bg-accent'
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <Sparkles
                  className={cn(
                    'h-4 w-4 shrink-0',
                    groupIsSelected ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <div className="flex flex-col truncate">
                  <span className={cn('truncate font-medium', groupIsSelected && 'text-primary')}>
                    {group.label}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {selectedVariant ? `Selected: ${selectedVariant.label}` : group.description}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 ml-2">
                {groupIsSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                <ChevronRight
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform',
                    isExpanded && 'rotate-90'
                  )}
                />
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="center"
            avoidCollisions={false}
            className="w-[220px] p-1"
            sideOffset={8}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <div className="space-y-1">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b border-border/50 mb-1">
                {variantTypeLabel}
              </div>
              {group.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => {
                    onChange(variant.id);
                    setExpandedGroup(null);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-2 rounded-sm text-sm',
                    'hover:bg-accent cursor-pointer transition-colors',
                    value === variant.id && 'bg-accent text-accent-foreground'
                  )}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{variant.label}</span>
                    {variant.description && (
                      <span className="text-xs text-muted-foreground">{variant.description}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {variant.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {variant.badge}
                      </span>
                    )}
                    {value === variant.id && <Check className="h-3.5 w-3.5 text-primary" />}
                  </div>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </CommandItem>
    );
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-xl',
        'bg-accent/20 border border-border/30',
        'hover:bg-accent/30 transition-colors'
      )}
    >
      {/* Label and Description */}
      <div className="flex-1 pr-4">
        <h4 className="text-sm font-medium text-foreground">{label}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {/* Model Selection Popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[260px] justify-between h-9 px-3 bg-background/50 border-border/50 hover:bg-background/80 hover:text-foreground"
          >
            <div className="flex items-center gap-2 truncate">
              {currentModel?.icon && (
                <currentModel.icon className="h-4 w-4 text-muted-foreground/70" />
              )}
              <span className="truncate text-sm">{currentModel?.label || 'Select model...'}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="end">
          <Command>
            <CommandInput placeholder="Search models..." />
            <CommandList ref={commandListRef} className="max-h-[300px]">
              <CommandEmpty>No model found.</CommandEmpty>

              {favorites.length > 0 && (
                <>
                  <CommandGroup heading="Favorites">
                    {(() => {
                      const renderedGroups = new Set<string>();
                      return favorites.map((model) => {
                        // Check if this favorite is part of a grouped model
                        if (model.provider === 'cursor') {
                          const cursorId = stripProviderPrefix(model.id) as CursorModelId;
                          const group = getModelGroup(cursorId);
                          if (group) {
                            // Skip if we already rendered this group
                            if (renderedGroups.has(group.baseId)) {
                              return null;
                            }
                            renderedGroups.add(group.baseId);
                            // Find the group in groupedModels (which has filtered variants)
                            const filteredGroup = groupedModels.find(
                              (g) => g.baseId === group.baseId
                            );
                            if (filteredGroup) {
                              return renderGroupedModelItem(filteredGroup);
                            }
                          }
                        }
                        return renderModelItem(
                          model,
                          model.provider === 'claude' ? 'claude' : 'cursor'
                        );
                      });
                    })()}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {claude.length > 0 && (
                <CommandGroup heading="Claude Models">
                  {claude.map((model) => renderModelItem(model, 'claude'))}
                </CommandGroup>
              )}

              {(groupedModels.length > 0 || standaloneCursorModels.length > 0) && (
                <CommandGroup heading="Cursor Models">
                  {/* Grouped models with secondary popover */}
                  {groupedModels.map((group) => renderGroupedModelItem(group))}
                  {/* Standalone models */}
                  {standaloneCursorModels.map((model) => renderModelItem(model, 'cursor'))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
