import { useState } from "react";
import { Users, Plus, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";

import { useCharacterStore } from "@/stores/useCharacterStore";
import { Character } from "@/types";

const emptyCharacter: Partial<Character> = {
  name: "",
  role: "",
  gender: "",
  age: "",
  ethnicityOrAppearance: "",
  faceDescription: "",
  hair: "",
  eyes: "",
  outfit: "",
  characterReferencePrompt: "",
  continuityNotes: "",
};

export default function Characters() {
  const { characters, addCharacter, updateCharacter, deleteCharacter } = useCharacterStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<Partial<Character>>({
    defaultValues: emptyCharacter
  });

  const openNewDialog = () => {
    setEditingId(null);
    reset(emptyCharacter);
    setIsDialogOpen(true);
  };

  const openEditDialog = (char: Character) => {
    setEditingId(char.id);
    reset(char);
    setIsDialogOpen(true);
  };

  const onSubmit = (data: Partial<Character>) => {
    if (editingId) {
      updateCharacter(editingId, data);
      toast.success("Character updated");
    } else {
      addCharacter({ ...data, id: uuidv4() } as Character);
      toast.success("Character created");
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this character?")) {
      deleteCharacter(id);
      toast.success("Character deleted");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Character Library</h1>
          <p className="text-muted-foreground mt-1">
            Create reusable characters for consistent prompting across your storyboards.
          </p>
        </div>
        <Button onClick={openNewDialog} className="gap-2">
          <Plus className="w-5 h-5" />
          Add Character
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Character" : "New Character"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input {...register("name", { required: true })} placeholder="Character name" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input {...register("role")} placeholder="e.g. Protagonist, Villain" />
              </div>
              <div className="space-y-2">
                <Label>Gender & Age</Label>
                <div className="flex gap-2">
                  <Input {...register("gender")} placeholder="Gender" />
                  <Input {...register("age")} placeholder="Age" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ethnicity / General Appearance</Label>
                <Input {...register("ethnicityOrAppearance")} placeholder="e.g. Scandinavian, athletic" />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label>Face Description</Label>
                <Input {...register("faceDescription")} placeholder="Sharp jawline, high cheekbones..." />
              </div>

              <div className="space-y-2">
                <Label>Hair</Label>
                <Input {...register("hair")} placeholder="Short blonde, messy..." />
              </div>
              <div className="space-y-2">
                <Label>Eyes</Label>
                <Input {...register("eyes")} placeholder="Piercing blue..." />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Default Outfit</Label>
                <Input {...register("outfit")} placeholder="Black leather jacket, white t-shirt..." />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Character Reference Prompt (For AI Generation)</Label>
                <Textarea 
                  {...register("characterReferencePrompt")} 
                  placeholder="Detailed prompt describing exactly how this character looks for an image generator..."
                  rows={4}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Continuity Notes</Label>
                <Textarea 
                  {...register("continuityNotes")} 
                  placeholder="Specific details that must remain consistent (e.g. scar on left cheek)..."
                  rows={2}
                />
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose className={buttonVariants({ variant: "outline" })}>
                Cancel
              </DialogClose>
              <Button type="submit">Save Character</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {characters.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No characters saved</h3>
            <p className="text-muted-foreground mb-6">Create a character to easily reuse them in your prompts.</p>
            <Button onClick={openNewDialog} variant="outline">Add Character</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((char) => (
            <Card key={char.id} className="flex flex-col">
              <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{char.name}</CardTitle>
                    {char.role && <CardDescription className="mt-1">{char.role}</CardDescription>}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-secondary-foreground opacity-50" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1 text-sm space-y-3">
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  {char.age && <div>Age: <span className="text-foreground">{char.age}</span></div>}
                  {char.gender && <div>Gender: <span className="text-foreground">{char.gender}</span></div>}
                  {char.hair && <div>Hair: <span className="text-foreground line-clamp-1">{char.hair}</span></div>}
                  {char.eyes && <div>Eyes: <span className="text-foreground line-clamp-1">{char.eyes}</span></div>}
                </div>
                {char.outfit && (
                  <div>
                    <span className="text-muted-foreground">Outfit:</span>
                    <p className="line-clamp-2 mt-0.5">{char.outfit}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="gap-2 pt-4 border-t bg-muted/10">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(char)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(char.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}