import { StoryboardProject, StoryboardScene } from "@/types";

export const exportProjectJSON = (project: StoryboardProject) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `${project.title || 'storyboard'}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

const formatSceneText = (scene: StoryboardScene) => {
  return `SCENE ${String(scene.sceneNumber).padStart(2, '0')} — ${scene.title?.toUpperCase()}

Scene Summary:
${scene.summary}

Characters:
${scene.characters.map(c => `- ${c.name} (${c.role}): ${c.action}`).join('\n')}

Image Prompt:
${scene.imagePrompt}

Video Prompt:
${scene.videoPrompt}

Camera and Movement:
Shot: ${scene.camera.shotType} | Angle: ${scene.camera.angle} | Movement: ${scene.camera.movement}
Lens: ${scene.camera.lens} | Transition: ${scene.camera.transition}

Timing:
${scene.timing.map(t => `- ${t.timeRange}: ${t.description}`).join('\n')}

Audio:
Dialogue: ${scene.audio.dialogue}
SFX: ${scene.audio.soundEffects}
Music: ${scene.audio.music}

Negative Prompt:
${scene.negativePrompt}

Continuity:
${scene.continuityNotes.join('\n')}
`;
};

export const exportProjectTXT = (project: StoryboardProject) => {
  const content = `${project.title?.toUpperCase() || 'STORYBOARD'}
Concept: ${project.settings.storyConcept}
Scenes: ${project.scenes.length}
Duration: ${project.settings.totalDuration}s

==================================================

${project.scenes.map(formatSceneText).join('\n==================================================\n\n')}`;

  const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(content);
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `${project.title || 'storyboard'}.txt`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const exportProjectMarkdown = (project: StoryboardProject) => {
  const content = `# ${project.title || 'Storyboard'}

**Concept:** ${project.settings.storyConcept}  
**Scenes:** ${project.scenes.length}  
**Total Duration:** ${project.settings.totalDuration}s  

---

${project.scenes.map(scene => `## Scene ${String(scene.sceneNumber).padStart(2, '0')}: ${scene.title}

**Summary:** ${scene.summary}

### Prompts

**Image Prompt:**
> ${scene.imagePrompt}

**Video Prompt:**
> ${scene.videoPrompt}

**Negative Prompt:**
> ${scene.negativePrompt}

### Details

**Camera:** ${scene.camera.shotType}, ${scene.camera.angle}, ${scene.camera.movement}  
**Location:** ${scene.environment.location} (${scene.environment.time})

### Characters
${scene.characters.map(c => `- **${c.name}**: ${c.action}`).join('\n')}

### Timing
${scene.timing.map(t => `- **${t.timeRange}**: ${t.description}`).join('\n')}
`).join('\n---\n\n')}`;

  const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(content);
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `${project.title || 'storyboard'}.md`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};