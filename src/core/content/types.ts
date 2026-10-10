/** A briefing card's visual: a screenshot/photo, or one of the app's own 3D part models (for the
 * hardware cards, which the UC1 guide has no photos of -- the model is the same part the learner
 * handles in the assembly simulation). */
export type LessonMedia =
  | {
      kind: "image";
      url: string;
      alt: string;
      /** Set only for a licensed third-party photo, as on activity step images. */
      credit?: string;
    }
  | {
      kind: "model";
      url: string;
      alt: string;
      rotation?: [number, number, number];
    };

export interface LessonCard {
  id: string;
  title: string;
  body: string;
  media?: LessonMedia;
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
  /** A real screenshot of this step from the source task/job sheet's guide, shown while it's the active step. Only set when `model` is absent -- the two are mutually exclusive. */
  image?: {
    url: string;
    alt: string;
    /** Set only for a step whose image is a licensed third-party photo rather than the project's own screenshot -- e.g. a Wikimedia Commons photo credited "by <author>, CC BY 4.0". */
    credit?: string;
  };
  /** Marks this step as a drag-and-drop placement in an AssemblyScene rather than a click-to-check
   * step -- installedPosition is where the part sits assembled, trayPosition is where it rests when
   * removed. Steps sharing the same scene must appear contiguously in `items` for the scene to render once. */
  dragTarget?: {
    installedPosition: [number, number, number];
    trayPosition: [number, number, number];
    /** Don't mount this part in the scene at all until this OTHER item id has been checked. For
     * a part mounted on another part (e.g. the CPU on the motherboard) whose `installedPosition`
     * is only valid once that other part has already reached its own resting spot for this
     * scene's step order -- otherwise it would render at that (wrong, premature) spot from the
     * very start. See AssemblyStep's own doc comment in 3d/AssemblyScene.tsx. */
    hiddenUntilItemId?: string;
  };
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

/** One colored wire in a T568B (or T568A) termination puzzle -- placed by tapping it in the tray
 * then dropping it into its correct pin slot, in order, on a dedicated 3D scene (see
 * 3d/WireOrderScene.tsx). Primitive-colored rather than a GLB model, since a wire's whole identity
 * is just its color(s) -- no real geometry to show. */
export interface WireOrderStep {
  id: string;
  /** e.g. "Pin 1: White/Orange". */
  label: string;
  explanation: string;
  /** Solid wire-jacket color (hex). For a striped pair wire this is the color half; `stripeColor`
   * is the white half. For a solid wire (e.g. plain green/blue/brown/orange, none of which this
   * standard actually uses solid, but kept for generality) this is the only color and
   * `stripeColor` is omitted. */
  color: string;
  /** The white stripe's color, for a striped pair wire. Omit for a solid-color wire. */
  stripeColor?: string;
  /** Where this wire rests, unplaced, in the tray. */
  trayPosition: [number, number, number];
  /** The RJ45 pin slot this wire belongs in once correctly placed. */
  installedPosition: [number, number, number];
}

/** A task's quiz-gating hands-on check, shown instead of the multiple-choice questions until
 * complete (see core/content/loader.ts's getPracticalCheck). Two kinds exist because they need
 * genuinely different 3D scenes: "assembly" reuses AssemblyScene (a PC case learners strip down
 * part by part), "wire-order" uses WireOrderScene (an RJ45 connector learners wire pin-by-pin). */
export type PracticalCheck =
  | { kind: "assembly"; items: ProcedureChecklistItem[] }
  | { kind: "wire-order"; items: WireOrderStep[] }
  | MissionGameCheck;

// ---- Mission games (UC3/UC4): a story-driven network sim played on a live 2D network map ----

export type SceneNodeKind = "server" | "pc" | "printer" | "switch" | "disk" | "folder" | "backup";
export type SceneNodeStatus = "off" | "on" | "good" | "alert" | "gone";

/** One device on the mission map. x/y are in the scene's 100x60 viewBox units. */
export interface SceneNode {
  id: string;
  kind: SceneNodeKind;
  label: string;
  x: number;
  y: number;
  /** Small text under the label, e.g. an IP address. Effects can replace it. */
  sublabel?: string;
  status?: SceneNodeStatus;
}

export interface SceneLink {
  id: string;
  from: string;
  to: string;
  /** Not drawn until an effect activates it -- e.g. a remote desktop session arc. */
  hidden?: boolean;
  /** Drawn as an arc instead of a straight cable -- for logical links like an RDP session. */
  curved?: boolean;
}

/** A permanent change a completed step makes to the map, so the world visibly reacts. */
export type SceneEffect =
  | { kind: "badge"; node: string; text: string }
  | { kind: "sublabel"; node: string; text: string }
  | { kind: "status"; node: string; status: SceneNodeStatus }
  | { kind: "link"; link: string };

/** A one-off packet that runs along a link when a step completes (or loops during a wait step). */
export interface ScenePulse {
  link: string;
  reverse?: boolean;
}

export interface MissionOption {
  id: string;
  text: string;
  correct?: boolean;
  /** Why a wrong option is wrong -- shown when the learner picks it. */
  why?: string;
}

interface MissionStepBase {
  id: string;
  /** Scene node that "says" the prompt in a speech bubble. */
  actor: string;
  prompt: string;
  /** Shown after the step is done -- the "why" behind the right answer. */
  explain: string;
  effects?: SceneEffect[];
  pulse?: ScenePulse;
}

export type MissionStep =
  /** Pick the one right option; with timerSec it's a timed "rush" round (running out of time breaks
   * the combo but doesn't cost a heart). */
  | (MissionStepBase & { kind: "choice"; options: MissionOption[]; timerSec?: number })
  /** Slot every correct chip into the actor's bays; decoys cost a heart. Each placed chip becomes
   * a badge on the actor automatically. */
  | (MissionStepBase & { kind: "slots"; bayLabel: string; chips: MissionOption[] })
  /** A progress bar runs for `seconds` while a tempting trap button blinks -- hold your nerve. */
  | (MissionStepBase & { kind: "wait"; seconds: number; progressText: string; trap: { text: string; why: string } });

export interface Mission {
  id: string;
  title: string;
  briefing: string;
  steps: MissionStep[];
}

/** UC3/UC4's quiz-gating practical check: a mission-based network sim. `items` is the mission ids
 * in order (one persisted id per finished mission) so it plugs into the same persistence route and
 * done-checks as every other kind. Build it with core/content/missionGame.ts's missionGame(). */
export interface MissionGameCheck {
  kind: "mission-game";
  title: string;
  story: string;
  scene: { nodes: SceneNode[]; links: SceneLink[] };
  missions: Mission[];
  items: { id: string }[];
}

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
  /** Set only when imageUrl is a licensed third-party photo rather than the project's own screenshot. */
  imageCredit?: string;
  /** Renders the real GLB part model (already used by the hands-on activity) in a rotating
   * viewer above the question instead of/alongside a flat image -- for questions that ask the
   * learner to identify a part or its correct handling in 3D. Mutually exclusive with imageUrl
   * in practice, though nothing enforces that. */
  model3d?: { url: string; rotation?: [number, number, number] };
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

/** A real, named task/job sheet within a module's unit of competency -- what the Tasks
 * list and Task detail pages render. `itemIds` is an ordered slice of that module's
 * ProcedureChecklistActivityContent.items; the step data itself stays single-sourced there. */
export interface TaskContent {
  id: string;
  title: string;
  objective: string;
  materials: string[];
  tools?: string[];
  itemIds: string[];
}

export interface ModuleContent {
  moduleId: string;
  lessons: LessonCard[];
  activity: ActivityContent;
  heroModel?: ModuleHeroModel;
}

/** What's safe to send to the client before grading -- no answer key. */
export type PublicQuizQuestion = Omit<QuizQuestion, "correctOptionIds" | "explanation">;
