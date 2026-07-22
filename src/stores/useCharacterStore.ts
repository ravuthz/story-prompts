import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Character } from "@/types";

interface CharacterState {
  characters: Character[];
  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set) => ({
      characters: [],
      addCharacter: (character) =>
        set((state) => ({ characters: [...state.characters, character] })),
      updateCharacter: (id, updates) =>
        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      deleteCharacter: (id) =>
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
        })),
    }),
    {
      name: "storyboard_characters_v1",
    }
  )
);