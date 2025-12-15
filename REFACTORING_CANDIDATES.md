# Large Files - Refactoring Candidates

This document tracks files in the AutoMaker codebase that exceed 3000 lines or are significantly large (1000+ lines) and should be considered for refactoring into smaller, more maintainable components.

**Last Updated:** 2025-12-15
**Total Large Files:** 8
**Combined Size:** 15,027 lines

---

## 🔴 CRITICAL - Over 3000 Lines

### 1. board-view.tsx - 3,325 lines
**Path:** `apps/app/src/components/views/board-view.tsx`
**Type:** React Component (TSX)
**Priority:** VERY HIGH

**Description:**
Main Kanban board view component that serves as the centerpiece of the application.

**Current Responsibilities:**
- Feature/task card management and drag-and-drop operations using @dnd-kit
- Adding, editing, and deleting features
- Running autonomous agents to implement features
- Displaying feature status across multiple columns (Backlog, In Progress, Waiting Approval, Verified)
- Model/AI profile selection for feature implementation
- Advanced options configuration (thinking level, model selection, skip tests)
- Search/filtering functionality for cards
- Output modal for viewing agent results
- Feature suggestions dialog
- Board background customization
- Integration with Electron APIs for IPC communication
- Keyboard shortcuts support
- 40+ state variables for managing UI state

**Refactoring Recommendations:**
Extract into smaller components:
- `AddFeatureDialog.tsx` - Feature creation dialog with image upload
- `EditFeatureDialog.tsx` - Feature editing dialog
- `AgentOutputModal.tsx` - Already exists, verify separation
- `FeatureSuggestionsDialog.tsx` - Already exists, verify separation
- `BoardHeader.tsx` - Header with controls and search
- `BoardSearchBar.tsx` - Search and filter functionality
- `ConcurrencyControl.tsx` - Concurrency slider component
- `BoardActions.tsx` - Action buttons (add feature, auto mode, etc.)
- `DragDropContext.tsx` - Wrap drag-and-drop logic
- Custom hooks:
  - `useBoardFeatures.ts` - Feature loading and management
  - `useBoardDragDrop.ts` - Drag and drop handlers
  - `useBoardActions.ts` - Feature action handlers (run, verify, delete, etc.)
  - `useBoardKeyboardShortcuts.ts` - Keyboard shortcut logic

---

## 🟡 HIGH PRIORITY - 2000+ Lines

### 2. sidebar.tsx - 2,396 lines
**Path:** `apps/app/src/components/layout/sidebar.tsx`
**Type:** React Component (TSX)
**Priority:** HIGH

**Description:**
Main navigation sidebar with comprehensive project management.

**Current Responsibilities:**
- Project folder navigation and selection
- View mode switching (Board, Agent, Settings, etc.)
- Project operations (create, delete, rename)
- Theme and appearance controls
- Terminal, Wiki, and other view launchers
- Drag-and-drop project reordering
- Settings and configuration access

**Refactoring Recommendations:**
Split into focused components:
- `ProjectSelector.tsx` - Project list and selection
- `NavigationTabs.tsx` - View mode tabs
- `ProjectActions.tsx` - Create, delete, rename operations
- `SettingsMenu.tsx` - Settings dropdown
- `ThemeSelector.tsx` - Theme controls
- `ViewLaunchers.tsx` - Terminal, Wiki launchers
- Custom hooks:
  - `useProjectManagement.ts` - Project CRUD operations
  - `useSidebarState.ts` - Sidebar state management

---

### 3. electron.ts - 2,356 lines
**Path:** `apps/app/src/lib/electron.ts`
**Type:** TypeScript Utility/API Bridge
**Priority:** HIGH

**Description:**
Electron IPC bridge and type definitions for frontend-backend communication.

**Current Responsibilities:**
- File system operations (read, write, directory listing)
- Project management APIs
- Feature management APIs
- Terminal/shell execution
- Auto mode and agent execution APIs
- Worktree management
- Provider status APIs
- Event handling and subscriptions

**Refactoring Recommendations:**
Modularize into domain-specific API modules:
- `api/file-system-api.ts` - File operations
- `api/project-api.ts` - Project CRUD
- `api/feature-api.ts` - Feature management
- `api/execution-api.ts` - Auto mode and agent execution
- `api/provider-api.ts` - Provider status and management
- `api/worktree-api.ts` - Git worktree operations
- `api/terminal-api.ts` - Terminal/shell APIs
- `types/electron-types.ts` - Shared type definitions
- `electron.ts` - Main export aggregator

---

### 4. app-store.ts - 2,174 lines
**Path:** `apps/app/src/store/app-store.ts`
**Type:** TypeScript State Management (Zustand Store)
**Priority:** HIGH

**Description:**
Centralized application state store using Zustand.

**Current Responsibilities:**
- Global app state types and interfaces
- Project and feature management state
- Theme and appearance settings
- API keys configuration
- Keyboard shortcuts configuration
- Terminal themes configuration
- Auto mode settings
- All store mutations and selectors

**Refactoring Recommendations:**
Split into domain-specific stores:
- `stores/projects-store.ts` - Project state and actions
- `stores/features-store.ts` - Feature state and actions
- `stores/ui-store.ts` - UI state (theme, sidebar, modals)
- `stores/settings-store.ts` - User settings and preferences
- `stores/execution-store.ts` - Auto mode and running tasks
- `stores/provider-store.ts` - Provider configuration
- `types/store-types.ts` - Shared type definitions
- `app-store.ts` - Main store aggregator with combined selectors

---

## 🟢 MEDIUM PRIORITY - 1000-2000 Lines

### 5. auto-mode-service.ts - 1,232 lines
**Path:** `apps/server/src/services/auto-mode-service.ts`
**Type:** TypeScript Service (Backend)
**Priority:** MEDIUM-HIGH

**Description:**
Core autonomous feature implementation service.

**Current Responsibilities:**
- Worktree creation and management
- Feature execution with Claude Agent SDK
- Concurrent execution with concurrency limits
- Progress streaming via events
- Verification and merge workflows
- Provider management
- Error handling and classification

**Refactoring Recommendations:**
Extract into service modules:
- `services/worktree-manager.ts` - Worktree operations
- `services/feature-executor.ts` - Feature execution logic
- `services/concurrency-manager.ts` - Concurrency control
- `services/verification-service.ts` - Verification workflows
- `utils/error-classifier.ts` - Error handling utilities

---

### 6. spec-view.tsx - 1,230 lines
**Path:** `apps/app/src/components/views/spec-view.tsx`
**Type:** React Component (TSX)
**Priority:** MEDIUM

**Description:**
Specification editor view component for feature specification management.

**Refactoring Recommendations:**
Extract editor components and hooks:
- `SpecEditor.tsx` - Main editor component
- `SpecToolbar.tsx` - Editor toolbar
- `SpecSidebar.tsx` - Spec navigation sidebar
- `useSpecEditor.ts` - Editor state management

---

### 7. kanban-card.tsx - 1,180 lines
**Path:** `apps/app/src/components/views/kanban-card.tsx`
**Type:** React Component (TSX)
**Priority:** MEDIUM

**Description:**
Individual Kanban card component with rich feature display and interaction.

**Refactoring Recommendations:**
Split into smaller card components:
- `KanbanCardHeader.tsx` - Card title and metadata
- `KanbanCardBody.tsx` - Card content
- `KanbanCardActions.tsx` - Action buttons
- `KanbanCardStatus.tsx` - Status indicators
- `useKanbanCard.ts` - Card interaction logic

---

### 8. analysis-view.tsx - 1,134 lines
**Path:** `apps/app/src/components/views/analysis-view.tsx`
**Type:** React Component (TSX)
**Priority:** MEDIUM

**Description:**
Analysis view component for displaying and managing feature analysis data.

**Refactoring Recommendations:**
Extract visualization and data components:
- `AnalysisChart.tsx` - Chart/graph components
- `AnalysisTable.tsx` - Data table
- `AnalysisFilters.tsx` - Filter controls
- `useAnalysisData.ts` - Data fetching and processing

---

## Refactoring Strategy

### Phase 1: Critical (Immediate)
1. **board-view.tsx** - Break into dialogs, header, and custom hooks
   - Extract all dialogs first (AddFeature, EditFeature)
   - Move to custom hooks for business logic
   - Split remaining UI into smaller components

### Phase 2: High Priority (Next Sprint)
2. **sidebar.tsx** - Componentize navigation and project management
3. **electron.ts** - Modularize into API domains
4. **app-store.ts** - Split into domain stores

### Phase 3: Medium Priority (Future)
5. **auto-mode-service.ts** - Extract service modules
6. **spec-view.tsx** - Break into editor components
7. **kanban-card.tsx** - Split card into sub-components
8. **analysis-view.tsx** - Extract visualization components

---

## General Refactoring Guidelines

### When Refactoring Large Components:

1. **Extract Dialogs/Modals First**
   - Move dialog components to separate files
   - Keep dialog state management in parent initially
   - Later extract to custom hooks if complex

2. **Create Custom Hooks for Business Logic**
   - Move data fetching to `useFetch*` hooks
   - Move complex state logic to `use*State` hooks
   - Move side effects to `use*Effect` hooks

3. **Split UI into Presentational Components**
   - Header/toolbar components
   - Content area components
   - Footer/action components

4. **Move Utils and Helpers**
   - Extract pure functions to utility files
   - Move constants to separate constant files
   - Create type files for shared interfaces

### When Refactoring Large Files:

1. **Identify Domains/Concerns**
   - Group related functionality
   - Find natural boundaries

2. **Extract Gradually**
   - Start with least coupled code
   - Work towards core functionality
   - Test after each extraction

3. **Maintain Type Safety**
   - Export types from extracted modules
   - Use shared type files for common interfaces
   - Ensure no type errors after refactoring

---

## Progress Tracking

- [ ] board-view.tsx (3,325 lines)
- [ ] sidebar.tsx (2,396 lines)
- [ ] electron.ts (2,356 lines)
- [ ] app-store.ts (2,174 lines)
- [ ] auto-mode-service.ts (1,232 lines)
- [ ] spec-view.tsx (1,230 lines)
- [ ] kanban-card.tsx (1,180 lines)
- [ ] analysis-view.tsx (1,134 lines)

**Target:** All files under 500 lines, most under 300 lines

---

*Generated: 2025-12-15*
