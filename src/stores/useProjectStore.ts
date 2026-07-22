import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StoryboardProject } from "@/types";

interface ProjectState {
  projects: StoryboardProject[];
  currentProjectId: string | null;
  addProject: (project: StoryboardProject) => void;
  updateProject: (id: string, updates: Partial<StoryboardProject>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;
  getCurrentProject: () => StoryboardProject | undefined;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,
      addProject: (project) =>
        set((state) => ({ projects: [project, ...state.projects] })),
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
        })),
      setCurrentProject: (id) => set({ currentProjectId: id }),
      getCurrentProject: () => {
        const state = get();
        return state.projects.find((p) => p.id === state.currentProjectId);
      },
    }),
    {
      name: "storyboard_projects_v1",
    }
  )
);