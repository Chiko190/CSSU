export interface LessonCard {
  id: string;
  title: string;
  body: string;
}

export interface HotspotTarget {
  id: string;
  label: string;
  /** [xPct, yPct, widthPct, heightPct], 0-100, relative to the base illustration's bounding box. */
  coords: [number, number, number, number];
  explanation: string;
}

export interface HotspotActivityContent {
  kind: "hotspot-2d";
  moduleId: string;
  baseImageUrl: string;
  instructions: string;
  targets: HotspotTarget[];
}

export type PrimitiveShape =
  | { kind: "box"; size: [number, number, number] }
  | { kind: "cylinder"; radiusTop: number; radiusBottom: number; height: number }
  /** GLB model, auto-centered and uniformly scaled to fill the single-part viewer. */
  | { kind: "model"; url: string };

export interface IdentifiablePart3D {
  id: string;
  label: string;
  explanation: string;
  shape: PrimitiveShape;
  /** Radians; omit for [0, 0, 0]. Gives the model a sensible starting orientation before the player rotates it further. */
  rotation?: [number, number, number];
  /** CSS/hex color; only used for primitive (non-model) shapes. */
  color?: string;
}

export interface IdentifyPartActivityContent {
  kind: "identify-3d";
  moduleId: string;
  instructions: string;
  parts: IdentifiablePart3D[];
}

export interface ProcedureChecklistItem {
  id: string;
  label: string;
  explanation: string;
  /** The 3D part this step is actually about, shown in a viewer while it's the active step. Omit for steps with no physical subject (e.g. a software step). */
  model?: { url: string; rotation?: [number, number, number] };
}

/** A step-by-step procedure the learner checks off in order -- modeled directly on
 * a real task/job sheet's "Steps/Procedure" + "Did you...?" criteria checklist. */
export interface ProcedureChecklistActivityContent {
  kind: "procedure-checklist";
  moduleId: string;
  instructions: string;
  items: ProcedureChecklistItem[];
}

export type ActivityContent =
  | HotspotActivityContent
  | IdentifyPartActivityContent
  | ProcedureChecklistActivityContent;

export type QuestionType = "multiple_choice" | "true_false" | "image_identification";

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  imageUrl?: string;
  options: QuizOption[];
  correctOptionIds: string[];
  explanation: string;
}

/** An optional rotating 3D preview shown alongside the Learn step -- for modules
 * whose graded activity (e.g. procedure-checklist) has no visual of its own. */
export interface ModuleHeroModel {
  url: string;
  /** Rendered under the viewer, e.g. "Modern Router by J-Toastie, CC BY 3.0". Omit for CC0/no-attribution assets. */
  credit?: string;
  /** Radians; omit for [0, 0, 0]. Elongated models (e.g. a cable) often need this to avoid rendering as a thin vertical line. */
  rotation?: [number, number, number];
}

export interface ModuleContent {
  moduleId: string;
  lessons: LessonCard[];
  activity: ActivityContent;
  quiz: QuizQuestion[];
  heroModel?: ModuleHeroModel;
}

/** What's safe to send to the client before grading -- no answer key. */
export type PublicQuizQuestion = Omit<QuizQuestion, "correctOptionIds" | "explanation">;
