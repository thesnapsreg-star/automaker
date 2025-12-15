"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { HotkeyButton } from "@/components/ui/hotkey-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategoryAutocomplete } from "@/components/ui/category-autocomplete";
import {
  DescriptionImageDropZone,
  FeatureImagePath as DescriptionImagePath,
  ImagePreviewMap,
} from "@/components/ui/description-image-dropzone";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MessageSquare,
  Settings2,
  FlaskConical,
  Plus,
  Brain,
  UserCircle,
  Zap,
  Scale,
  Cpu,
  Rocket,
  Sparkles,
} from "lucide-react";
import { cn, modelSupportsThinking } from "@/lib/utils";
import {
  useAppStore,
  AgentModel,
  ThinkingLevel,
  FeatureImage,
  AIProfile,
} from "@/store/app-store";

type ModelOption = {
  id: AgentModel;
  label: string;
  description: string;
  badge?: string;
  provider: "claude";
};

const CLAUDE_MODELS: ModelOption[] = [
  {
    id: "haiku",
    label: "Claude Haiku",
    description: "Fast and efficient for simple tasks.",
    badge: "Speed",
    provider: "claude",
  },
  {
    id: "sonnet",
    label: "Claude Sonnet",
    description: "Balanced performance with strong reasoning.",
    badge: "Balanced",
    provider: "claude",
  },
  {
    id: "opus",
    label: "Claude Opus",
    description: "Most capable model for complex work.",
    badge: "Premium",
    provider: "claude",
  },
];

// Profile icon mapping
const PROFILE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Brain,
  Zap,
  Scale,
  Cpu,
  Rocket,
  Sparkles,
};

interface AddFeatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (feature: {
    category: string;
    description: string;
    steps: string[];
    images: FeatureImage[];
    imagePaths: DescriptionImagePath[];
    skipTests: boolean;
    model: AgentModel;
    thinkingLevel: ThinkingLevel;
  }) => void;
  categorySuggestions: string[];
  defaultSkipTests: boolean;
  isMaximized: boolean;
  showProfilesOnly: boolean;
  aiProfiles: AIProfile[];
}

export function AddFeatureDialog({
  open,
  onOpenChange,
  onAdd,
  categorySuggestions,
  defaultSkipTests,
  isMaximized,
  showProfilesOnly,
  aiProfiles,
}: AddFeatureDialogProps) {
  const [newFeature, setNewFeature] = useState({
    category: "",
    description: "",
    steps: [""],
    images: [] as FeatureImage[],
    imagePaths: [] as DescriptionImagePath[],
    skipTests: false,
    model: "opus" as AgentModel,
    thinkingLevel: "none" as ThinkingLevel,
  });
  const [newFeaturePreviewMap, setNewFeaturePreviewMap] =
    useState<ImagePreviewMap>(() => new Map());
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);

  // Sync skipTests default when dialog opens
  useEffect(() => {
    if (open) {
      setNewFeature((prev) => ({
        ...prev,
        skipTests: defaultSkipTests,
      }));
    }
  }, [open, defaultSkipTests]);

  const handleAdd = () => {
    // Validate description is required
    if (!newFeature.description.trim()) {
      setDescriptionError(true);
      return;
    }

    const category = newFeature.category || "Uncategorized";
    const selectedModel = newFeature.model;
    const normalizedThinking = modelSupportsThinking(selectedModel)
      ? newFeature.thinkingLevel
      : "none";

    onAdd({
      category,
      description: newFeature.description,
      steps: newFeature.steps.filter((s) => s.trim()),
      images: newFeature.images,
      imagePaths: newFeature.imagePaths,
      skipTests: newFeature.skipTests,
      model: selectedModel,
      thinkingLevel: normalizedThinking,
    });

    // Reset form
    setNewFeature({
      category: "",
      description: "",
      steps: [""],
      images: [],
      imagePaths: [],
      skipTests: defaultSkipTests,
      model: "opus",
      thinkingLevel: "none",
    });
    setNewFeaturePreviewMap(new Map());
    setShowAdvancedOptions(false);
    setDescriptionError(false);
    onOpenChange(false);
  };

  const handleDialogClose = (open: boolean) => {
    onOpenChange(open);
    // Clear preview map, validation error, and reset advanced options when dialog closes
    if (!open) {
      setNewFeaturePreviewMap(new Map());
      setShowAdvancedOptions(false);
      setDescriptionError(false);
    }
  };

  const renderModelOptions = (
    options: ModelOption[],
    selectedModel: AgentModel,
    onSelect: (model: AgentModel) => void,
    testIdPrefix = "model-select"
  ) => (
    <div className="flex gap-2 flex-wrap">
      {options.map((option) => {
        const isSelected = selectedModel === option.id;
        // Shorter display names for compact view
        const shortName = option.label.replace("Claude ", "");
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            title={option.description}
            className={cn(
              "flex-1 min-w-[80px] px-3 py-2 rounded-md border text-sm font-medium transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-accent border-input"
            )}
            data-testid={`${testIdPrefix}-${option.id}`}
          >
            {shortName}
          </button>
        );
      })}
    </div>
  );

  const newModelAllowsThinking = modelSupportsThinking(newFeature.model);

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent
        compact={!isMaximized}
        data-testid="add-feature-dialog"
        onPointerDownOutside={(e) => {
          // Prevent dialog from closing when clicking on category autocomplete dropdown
          const target = e.target as HTMLElement;
          if (target.closest('[data-testid="category-autocomplete-list"]')) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // Prevent dialog from closing when clicking on category autocomplete dropdown
          const target = e.target as HTMLElement;
          if (target.closest('[data-testid="category-autocomplete-list"]')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Add New Feature</DialogTitle>
          <DialogDescription>
            Create a new feature card for the Kanban board.
          </DialogDescription>
        </DialogHeader>
        <Tabs
          defaultValue="prompt"
          className="py-4 flex-1 min-h-0 flex flex-col"
        >
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="prompt" data-testid="tab-prompt">
              <MessageSquare className="w-4 h-4 mr-2" />
              Prompt
            </TabsTrigger>
            <TabsTrigger value="model" data-testid="tab-model">
              <Settings2 className="w-4 h-4 mr-2" />
              Model
            </TabsTrigger>
            <TabsTrigger value="testing" data-testid="tab-testing">
              <FlaskConical className="w-4 h-4 mr-2" />
              Testing
            </TabsTrigger>
          </TabsList>

          {/* Prompt Tab */}
          <TabsContent value="prompt" className="space-y-4 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <DescriptionImageDropZone
                value={newFeature.description}
                onChange={(value) => {
                  setNewFeature({ ...newFeature, description: value });
                  if (value.trim()) {
                    setDescriptionError(false);
                  }
                }}
                images={newFeature.imagePaths}
                onImagesChange={(images) =>
                  setNewFeature({ ...newFeature, imagePaths: images })
                }
                placeholder="Describe the feature..."
                previewMap={newFeaturePreviewMap}
                onPreviewMapChange={setNewFeaturePreviewMap}
                autoFocus
                error={descriptionError}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category (optional)</Label>
              <CategoryAutocomplete
                value={newFeature.category}
                onChange={(value) =>
                  setNewFeature({ ...newFeature, category: value })
                }
                suggestions={categorySuggestions}
                placeholder="e.g., Core, UI, API"
                data-testid="feature-category-input"
              />
            </div>
          </TabsContent>

          {/* Model Tab */}
          <TabsContent value="model" className="space-y-4 overflow-y-auto">
            {/* Show Advanced Options Toggle - only when profiles-only mode is enabled */}
            {showProfilesOnly && (
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Simple Mode Active
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Only showing AI profiles. Advanced model tweaking is hidden.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  data-testid="show-advanced-options-toggle"
                >
                  <Settings2 className="w-4 h-4 mr-2" />
                  {showAdvancedOptions ? "Hide" : "Show"} Advanced
                </Button>
              </div>
            )}

            {/* Quick Select Profile Section */}
            {aiProfiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-brand-500" />
                    Quick Select Profile
                  </Label>
                  <span className="text-[11px] px-2 py-0.5 rounded-full border border-brand-500/40 text-brand-500">
                    Presets
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {aiProfiles.slice(0, 6).map((profile) => {
                    const IconComponent = profile.icon
                      ? PROFILE_ICONS[profile.icon]
                      : Brain;
                    const isSelected =
                      newFeature.model === profile.model &&
                      newFeature.thinkingLevel === profile.thinkingLevel;
                    return (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => {
                          setNewFeature({
                            ...newFeature,
                            model: profile.model,
                            thinkingLevel: profile.thinkingLevel,
                          });
                        }}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg border text-left transition-all",
                          isSelected
                            ? "bg-brand-500/10 border-brand-500 text-foreground"
                            : "bg-background hover:bg-accent border-input"
                        )}
                        data-testid={`profile-quick-select-${profile.id}`}
                      >
                        <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 bg-primary/10">
                          {IconComponent && (
                            <IconComponent className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {profile.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {profile.model}
                            {profile.thinkingLevel !== "none" &&
                              ` + ${profile.thinkingLevel}`}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Or customize below. Manage profiles in{" "}
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      useAppStore.getState().setCurrentView("profiles");
                    }}
                    className="text-brand-500 hover:underline"
                  >
                    AI Profiles
                  </button>
                </p>
              </div>
            )}

            {/* Separator */}
            {aiProfiles.length > 0 &&
              (!showProfilesOnly || showAdvancedOptions) && (
                <div className="border-t border-border" />
              )}

            {/* Claude Models Section - Hidden when showProfilesOnly is true and showAdvancedOptions is false */}
            {(!showProfilesOnly || showAdvancedOptions) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    Claude (SDK)
                  </Label>
                  <span className="text-[11px] px-2 py-0.5 rounded-full border border-primary/40 text-primary">
                    Native
                  </span>
                </div>
                {renderModelOptions(
                  CLAUDE_MODELS,
                  newFeature.model,
                  (model) =>
                    setNewFeature({
                      ...newFeature,
                      model,
                      thinkingLevel: modelSupportsThinking(model)
                        ? newFeature.thinkingLevel
                        : "none",
                    })
                )}

                {/* Thinking Level - Only shown when Claude model is selected */}
                {newModelAllowsThinking && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <Label className="flex items-center gap-2 text-sm">
                      <Brain className="w-3.5 h-3.5 text-muted-foreground" />
                      Thinking Level
                    </Label>
                    <div className="flex gap-2 flex-wrap">
                      {(
                        [
                          "none",
                          "low",
                          "medium",
                          "high",
                          "ultrathink",
                        ] as ThinkingLevel[]
                      ).map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => {
                            setNewFeature({
                              ...newFeature,
                              thinkingLevel: level,
                            });
                          }}
                          className={cn(
                            "flex-1 px-3 py-2 rounded-md border text-sm font-medium transition-colors min-w-[60px]",
                            newFeature.thinkingLevel === level
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-accent border-input"
                          )}
                          data-testid={`thinking-level-${level}`}
                        >
                          {level === "none" && "None"}
                          {level === "low" && "Low"}
                          {level === "medium" && "Med"}
                          {level === "high" && "High"}
                          {level === "ultrathink" && "Ultra"}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Higher levels give more time to reason through complex
                      problems.
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-4 overflow-y-auto">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="skip-tests"
                checked={!newFeature.skipTests}
                onCheckedChange={(checked) =>
                  setNewFeature({
                    ...newFeature,
                    skipTests: checked !== true,
                  })
                }
                data-testid="skip-tests-checkbox"
              />
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="skip-tests"
                  className="text-sm cursor-pointer"
                >
                  Enable automated testing
                </Label>
                <FlaskConical className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              When enabled, this feature will use automated TDD. When disabled,
              it will require manual verification.
            </p>

            {/* Verification Steps - Only shown when skipTests is enabled */}
            {newFeature.skipTests && (
              <div className="space-y-2 pt-2 border-t border-border">
                <Label>Verification Steps</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Add manual steps to verify this feature works correctly.
                </p>
                {newFeature.steps.map((step, index) => (
                  <Input
                    key={index}
                    placeholder={`Verification step ${index + 1}`}
                    value={step}
                    onChange={(e) => {
                      const steps = [...newFeature.steps];
                      steps[index] = e.target.value;
                      setNewFeature({ ...newFeature, steps });
                    }}
                    data-testid={`feature-step-${index}-input`}
                  />
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setNewFeature({
                      ...newFeature,
                      steps: [...newFeature.steps, ""],
                    })
                  }
                  data-testid="add-step-button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Verification Step
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <HotkeyButton
            onClick={handleAdd}
            hotkey={{ key: "Enter", cmdCtrl: true }}
            hotkeyActive={open}
            data-testid="confirm-add-feature"
          >
            Add Feature
          </HotkeyButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
