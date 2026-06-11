import { useEffect, useRef, useState, type ReactNode } from "react";

import heroImg from "./assets/hero-sky.png";
import house3Img from "./assets/house3.png";
import iconSeo from "./assets/icon-seo.svg";
import iconReceptionist from "./assets/icon-receptionist.svg";
import iconNav from "./assets/icon-nav.svg";
import iconBrand from "./assets/icon-brand.svg";
import iconChevron from "./assets/icon-chevron.svg";
import iconStar from "./assets/icon-star.svg";
import googleLogo from "./assets/google.svg";
import logoMark from "./assets/logo-b.svg";
import logoText from "./assets/logo-a.svg";
import iconPlusGreen from "./assets/icon-plus.svg";
import serviceCard1 from "./assets/service-card-1.png";
import serviceCard2 from "./assets/service-card-2.png";
import serviceCard3 from "./assets/service-card-3.png";
import serviceCard4 from "./assets/service-card-4.png";
import projectHero from "./assets/project-hero.png";
import projectGallery1 from "./assets/project-gallery-1.png";
import projectGallery2 from "./assets/project-gallery-2.png";
import projectGallery3 from "./assets/project-gallery-3.png";
import projectGallery4 from "./assets/project-gallery-4.png";
import projectGallery5 from "./assets/project-gallery-5.png";
import teamPhoto1 from "./assets/team-1.jpg";
import teamPhoto2 from "./assets/team-2.jpg";
import teamPhoto3 from "./assets/team-3.jpg";
import teamPhoto4 from "./assets/team-4.jpg";
import teamPhoto5 from "./assets/team-5.jpg";
import teamPhoto6 from "./assets/team-6.jpg";

import {
  CloseIcon,
  MonitorIcon,
  SmartphoneIcon,
  MoreIcon,
  PencilIcon,
  PhoneIcon,
  MenuIcon,
  PlusIcon,
  ChevronDownIcon,
  MegaphoneIcon,
  TrashIcon,
  CheckIcon,
  ChevronLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MicIcon,
  ImageIcon,
  SparkleIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
} from "./Icons";

const FRAME_W = 1440;
const FRAME_H = 1024;

const SAVE_GREEN = "#388523";

type Overlay = "home" | "addPage" | "addSection" | "servicePagePrompt" | "more" | "quote" | null;
type LeftView =
  | "landing"
  | "seo"
  | "receptionist"
  | "navigation"
  | "brand"
  | "edit"
  | "heroEdit"
  | "projectEdit"
  | "projectOverviewEdit"
  | "lawnMowingEdit"
  | "lawnMowingHeroEdit"
  | "imageGalleryEdit";

type AiDrawerState = "closed" | "expanded" | "collapsed";

type AiView =
  | { type: "section"; sectionId: string }
  | { type: "seoSettings" }
  | { type: "page"; page: PreviewPage }
  | { type: "teamGallery" };
type AiSummary = {
  title: string;
  view: AiView;
  before?: string;
  after?: string;
  detail?: string;
  description?: string;
};
type AiMessage =
  | { id: string; role: "user"; text: string; images?: string[] }
  | { id: string; role: "thinking" }
  | { id: string; role: "assistant"; text: string; summary?: AiSummary };

type AiScenario = "heroSubtitle" | "seo" | "addServicePage" | "teamGallery";

/* Scripted scenario matcher for the mocked AI editor. */
function matchAiScenario(prompt: string): AiScenario | null {
  const p = prompt.toLowerCase();
  if (
    p.includes("image gallery") ||
    p.includes("photo gallery") ||
    ((p.includes("team") || p.includes("gallery") || p.includes("staff")) &&
      (p.includes("photo") || p.includes("image") || p.includes("picture") || p.includes("gallery")))
  ) {
    return "teamGallery";
  }
  if (
    p.includes("maintenance plan") ||
    ((p.includes("service") || p.includes("page")) &&
      (p.includes("add") || p.includes("new") || p.includes("create")))
  ) {
    return "addServicePage";
  }
  if (
    p.includes("seo") ||
    p.includes("search engine") ||
    p.includes("rank") ||
    p.includes("found on google") ||
    p.includes("find my site") ||
    p.includes("easier to find") ||
    p.includes("discoverab")
  ) {
    return "seo";
  }
  if (
    p.includes("subtitle") ||
    p.includes("subheading") ||
    p.includes("line under") ||
    p.includes("text under") ||
    p.includes("under the headline") ||
    p.includes("under your headline") ||
    p.includes("under the title") ||
    p.includes("below the headline") ||
    p.includes("below the title") ||
    p.includes("hero") ||
    p.includes("headline") ||
    p.includes("free quote") ||
    p.includes("no-obligation") ||
    p.includes("no obligation")
  ) {
    return "heroSubtitle";
  }
  return null;
}
type PreviewPage = "home" | "projectShowcase" | "lawnMowing";
type FocusedSection = "hero" | "projectOverview" | "lawnMowingHero" | null;
type HomeSectionKind = "hero" | "featured" | "servicesList" | "serviceCards" | "quote" | "imageGallery";
type HomeSection = {
  id: string;
  kind: HomeSectionKind;
  variant?: "team";
  images?: string[];
};

/* Placeholder "team" photos staged when a user uploads via the AI uploader. */
const TEAM_PHOTO_POOL = [teamPhoto1, teamPhoto2, teamPhoto3, teamPhoto4, teamPhoto5, teamPhoto6];
type HomePageContent = {
  heroHeading: string;
  heroSubheading: string;
  sections: HomeSection[];
};

const DEFAULT_HOME_CONTENT: HomePageContent = {
  heroHeading: "Homepage",
  heroSubheading: "Transform your outdoor space with expert landscape design and installation",
  sections: [
    { id: "hero", kind: "hero" },
    { id: "featured", kind: "featured" },
    { id: "servicesList", kind: "servicesList" },
    { id: "serviceCards", kind: "serviceCards" },
    { id: "quote", kind: "quote" },
  ],
};

type LawnMowingPageContent = {
  heroHeading: string;
  heroDescription: string;
};

const DEFAULT_LAWN_MOWING_CONTENT: LawnMowingPageContent = {
  heroHeading: "Expert Lawn Mowing",
  heroDescription: "Transform your yard with our professional lawn mowing services tailored for local homeowners.",
};

/* Scale the fixed 1440x1024 frame so it always fits the viewport. */
function useFitScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => {
      const margin = 32;
      const s = Math.min(
        (window.innerWidth - margin) / FRAME_W,
        (window.innerHeight - margin) / FRAME_H,
      );
      setScale(Math.min(s, 1));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return scale;
}

export default function App() {
  const scale = useFitScale();
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [leftView, setLeftView] = useState<LeftView>("landing");
  const [previewPage, setPreviewPage] = useState<PreviewPage>("home");
  const [hasLawnMowingPage, setHasLawnMowingPage] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState("");
  const [aiDrawerState, setAiDrawerState] = useState<AiDrawerState>("closed");
  const [aiApplyingSectionId, setAiApplyingSectionId] = useState<string | null>(null);
  const [aiCreatingPage, setAiCreatingPage] = useState(false);
  const [showExitEditConfirm, setShowExitEditConfirm] = useState(false);
  const [savedHomeContent, setSavedHomeContent] = useState<HomePageContent>(DEFAULT_HOME_CONTENT);
  const [draftHomeContent, setDraftHomeContent] = useState<HomePageContent>(DEFAULT_HOME_CONTENT);
  const [savedLawnMowingContent, setSavedLawnMowingContent] =
    useState<LawnMowingPageContent>(DEFAULT_LAWN_MOWING_CONTENT);
  const [draftLawnMowingContent, setDraftLawnMowingContent] =
    useState<LawnMowingPageContent>(DEFAULT_LAWN_MOWING_CONTENT);
  const [addSectionTarget, setAddSectionTarget] = useState<{ mode: "append" } | { mode: "after"; sectionId: string }>({
    mode: "append",
  });
  const [pendingScrollSectionId, setPendingScrollSectionId] = useState<string | null>(null);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const getEditViewForPage = (page: PreviewPage): LeftView => {
    if (page === "projectShowcase") return "projectEdit";
    if (page === "lawnMowing") return "lawnMowingEdit";
    return "edit";
  };
  const isEditMode =
    leftView === "edit" ||
    leftView === "heroEdit" ||
    leftView === "projectEdit" ||
    leftView === "projectOverviewEdit" ||
    leftView === "lawnMowingEdit" ||
    leftView === "lawnMowingHeroEdit" ||
    leftView === "imageGalleryEdit";
  const isAiEdit = aiDrawerState !== "closed";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOverlay(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggle = (o: Overlay) => setOverlay((cur) => (cur === o ? null : o));
  const handlePreviewPageChange = (page: PreviewPage) => {
    setPreviewPage(page);
    if (isEditMode) {
      setLeftView(getEditViewForPage(page));
    }
  };
  const createLawnMowingPage = () => {
    setHasLawnMowingPage(true);
    setPreviewPage("lawnMowing");
    setLeftView("lawnMowingEdit");
    setOverlay(null);
  };
  const startAiEdit = (prompt: string) => {
    setAiInitialPrompt(prompt);
    setOverlay(null);
    setAiDrawerState("expanded");
  };
  const toggleAiDrawer = () =>
    setAiDrawerState((s) => (s === "collapsed" ? "expanded" : "collapsed"));
  const applyAiHeroSubheading = (value: string) => {
    setAiApplyingSectionId("hero");
    setSavedHomeContent((c) => ({ ...c, heroSubheading: value }));
    setDraftHomeContent((c) => ({ ...c, heroSubheading: value }));
    window.setTimeout(() => setAiApplyingSectionId(null), 1800);
  };
  const addAiServicePage = () => {
    setHasLawnMowingPage(true);
    setPreviewPage("lawnMowing");
    setAiCreatingPage(true);
    window.setTimeout(() => setAiCreatingPage(false), 1800);
  };
  const findTeamGalleryId = () => savedHomeContent.sections.find((s) => s.variant === "team")?.id ?? null;
  // Inserts the team gallery (if it does not exist yet) populated with the photos.
  // The section is intentionally not added to the canvas until at least 3 images
  // have been provided.
  const applyAiTeamPhotos = (images: string[]) => {
    const existingId = findTeamGalleryId();
    const newSectionId = `teamGallery-${Date.now()}`;
    const apply = (c: HomePageContent) => {
      if (c.sections.some((s) => s.variant === "team")) {
        return {
          ...c,
          sections: c.sections.map((s) => (s.variant === "team" ? { ...s, images } : s)),
        };
      }
      const newSection: HomeSection = {
        id: newSectionId,
        kind: "imageGallery",
        variant: "team",
        images,
      };
      return { ...c, sections: [...c.sections, newSection] };
    };
    setSavedHomeContent(apply);
    setDraftHomeContent(apply);
    setPreviewPage("home");
    const targetId = existingId ?? newSectionId;
    setAiApplyingSectionId(targetId);
    setPendingScrollSectionId(targetId);
    window.setTimeout(() => setAiApplyingSectionId(null), 1800);
  };
  const viewAiChange = (view: AiView) => {
    if (view.type === "seoSettings") {
      setLeftView("seo");
      setAiDrawerState("closed");
      return;
    }
    if (view.type === "page") {
      setPreviewPage(view.page);
      return;
    }
    if (view.type === "teamGallery") {
      const id = findTeamGalleryId();
      setPreviewPage("home");
      if (id) setPendingScrollSectionId(id);
      return;
    }
    setPreviewPage("home");
    setPendingScrollSectionId(view.sectionId);
  };
  const beginEditMode = () => {
    setDraftHomeContent(savedHomeContent);
    setDraftLawnMowingContent(savedLawnMowingContent);
    setLeftView(getEditViewForPage(previewPage));
  };
  const discardEditMode = () => {
    setDraftHomeContent(savedHomeContent);
    setDraftLawnMowingContent(savedLawnMowingContent);
    setShowExitEditConfirm(false);
    setPendingScrollSectionId(null);
    setLeftView("landing");
  };
  const saveEditMode = () => {
    setSavedHomeContent(draftHomeContent);
    setSavedLawnMowingContent(draftLawnMowingContent);
    setPendingScrollSectionId(null);
    setLeftView("landing");
  };
  const openAddSection = (target: { mode: "append" } | { mode: "after"; sectionId: string }) => {
    setAddSectionTarget(target);
    setOverlay("addSection");
  };
  const addImageGallerySection = () => {
    const newId = `imageGallery-${Date.now()}`;
    const nextSection: HomeSection = {
      id: newId,
      kind: "imageGallery",
      // In edit mode the gallery starts empty and stays hidden on the canvas until
      // the user uploads at least 3 images via the gallery edit panel. In preview
      // mode there is no edit panel, so populate it immediately so it appears.
      images: isEditMode ? [] : TEAM_PHOTO_POOL.slice(0, 3),
    };

    const insertSection = (current: HomePageContent) => {
      if (addSectionTarget.mode === "append") {
        return { ...current, sections: [...current.sections, nextSection] };
      }

      const targetIndex = current.sections.findIndex((section) => section.id === addSectionTarget.sectionId);
      if (targetIndex === -1) {
        return { ...current, sections: [...current.sections, nextSection] };
      }

      const sections = [...current.sections];
      sections.splice(targetIndex + 1, 0, nextSection);
      return { ...current, sections };
    };

    if (isEditMode) {
      setDraftHomeContent(insertSection);
      setEditingGalleryId(newId);
      setLeftView("imageGalleryEdit");
    } else {
      const nextSavedContent = insertSection(savedHomeContent);
      setSavedHomeContent(nextSavedContent);
      setDraftHomeContent(nextSavedContent);
      setPendingScrollSectionId(newId);
    }

    setOverlay(null);
  };
  const selectImageGallery = (sectionId: string) => {
    setEditingGalleryId(sectionId);
    setLeftView("imageGalleryEdit");
  };
  const addGalleryImages = (sectionId: string) => {
    // Deterministic so it stays idempotent under React StrictMode's double-invoked
    // updaters: each click grows the gallery by 3 (capped at the pool size).
    const apply = (current: HomePageContent) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        const nextCount = Math.min((section.images?.length ?? 0) + 3, TEAM_PHOTO_POOL.length);
        return { ...section, images: TEAM_PHOTO_POOL.slice(0, nextCount) };
      }),
    });
    if (isEditMode) {
      setDraftHomeContent(apply);
    } else {
      setSavedHomeContent(apply);
      setDraftHomeContent(apply);
    }
    setPendingScrollSectionId(sectionId);
  };
  const moveHomeSection = (sectionId: string, direction: "up" | "down") => {
    const reorderSection = (current: HomePageContent) => {
      const fromIndex = current.sections.findIndex((section) => section.id === sectionId);
      if (fromIndex === -1) return current;

      const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= current.sections.length) return current;

      const sections = [...current.sections];
      const [movedSection] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, movedSection);
      return { ...current, sections };
    };

    if (isEditMode) {
      setDraftHomeContent(reorderSection);
    } else {
      const nextSavedContent = reorderSection(savedHomeContent);
      setSavedHomeContent(nextSavedContent);
      setDraftHomeContent(nextSavedContent);
    }

    setPendingScrollSectionId(sectionId);
  };

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        style={{
          width: FRAME_W,
          height: FRAME_H,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
        className="relative shrink-0 flex items-center overflow-hidden rounded-2xl bg-surface-bg shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)]"
      >
        <Sidebar
          leftView={leftView}
          setLeftView={setLeftView}
          onRequestExitEdit={() => setShowExitEditConfirm(true)}
          onAddSection={() => openAddSection({ mode: "append" })}
          homeContent={draftHomeContent}
          onHomeContentChange={(patch) => setDraftHomeContent((current) => ({ ...current, ...patch }))}
          lawnMowingContent={draftLawnMowingContent}
          onLawnMowingContentChange={(patch) =>
            setDraftLawnMowingContent((current) => ({ ...current, ...patch }))
          }
          editingGalleryId={editingGalleryId}
          onSelectImageGallery={selectImageGallery}
          onAddGalleryImages={addGalleryImages}
          onStartAiEdit={startAiEdit}
        />
        <Canvas
          overlay={overlay}
          toggle={toggle}
          setOverlay={setOverlay}
          isEditMode={isEditMode}
          focusedSection={
            leftView === "heroEdit"
              ? "hero"
              : leftView === "projectOverviewEdit"
                ? "projectOverview"
                : leftView === "lawnMowingHeroEdit"
                  ? "lawnMowingHero"
                  : null
          }
          isAiEdit={isAiEdit}
          applyingSectionId={aiApplyingSectionId}
          creatingPage={aiCreatingPage}
          onEditWebsite={beginEditMode}
          onCancelEdit={discardEditMode}
          onSaveEdit={saveEditMode}
          onSelectHero={() => setLeftView("heroEdit")}
          onSelectProjectOverview={() => setLeftView("projectOverviewEdit")}
          onSelectLawnMowingHero={() => setLeftView("lawnMowingHeroEdit")}
          onAddSection={(sectionId) => openAddSection({ mode: "after", sectionId })}
          onMoveSection={moveHomeSection}
          onOpenQuoteModal={() => {
            if (!isEditMode) setOverlay("quote");
          }}
          scrollToSectionId={pendingScrollSectionId}
          onScrollToSectionHandled={() => setPendingScrollSectionId(null)}
          previewPage={previewPage}
          onPreviewPageChange={handlePreviewPageChange}
          hasLawnMowingPage={hasLawnMowingPage}
          homeContent={isEditMode ? draftHomeContent : savedHomeContent}
          lawnMowingContent={isEditMode ? draftLawnMowingContent : savedLawnMowingContent}
        />

        {/* Add page modal (triggered by + beside Home dropdown) */}
        {overlay === "addPage" && (
          <AddPageModal onClose={() => setOverlay(null)} onSelectService={() => setOverlay("servicePagePrompt")} />
        )}
        {overlay === "servicePagePrompt" && (
          <ServicePagePromptModal
            onBack={() => setOverlay("addPage")}
            onClose={() => setOverlay(null)}
            onCreatePage={createLawnMowingPage}
          />
        )}
        {overlay === "addSection" && (
          <AddSectionModal onClose={() => setOverlay(null)} onSelectImageGallery={addImageGallerySection} />
        )}
        {showExitEditConfirm && (
          <ExitEditConfirmDialog
            onCancel={() => setShowExitEditConfirm(false)}
            onConfirm={() => {
              discardEditMode();
            }}
          />
        )}

        {/* AI edit drawer (pulls up over the left panel) */}
        {aiDrawerState !== "closed" && (
          <AIEditDrawer
            collapsed={aiDrawerState === "collapsed"}
            onToggleCollapsed={toggleAiDrawer}
            initialPrompt={aiInitialPrompt}
            currentHeroSubheading={savedHomeContent.heroSubheading}
            onApplyHeroSubheading={applyAiHeroSubheading}
            onAddServicePage={addAiServicePage}
            onApplyTeamPhotos={applyAiTeamPhotos}
            onView={viewAiChange}
          />
        )}
      </div>
    </div>
  );
}

/* ----------------------------------- Sidebar ----------------------------------- */

function Sidebar({
  leftView,
  setLeftView,
  onRequestExitEdit,
  onAddSection,
  homeContent,
  onHomeContentChange,
  lawnMowingContent,
  onLawnMowingContentChange,
  editingGalleryId,
  onSelectImageGallery,
  onAddGalleryImages,
  onStartAiEdit,
}: {
  leftView: LeftView;
  setLeftView: (v: LeftView) => void;
  onRequestExitEdit: () => void;
  onAddSection: () => void;
  homeContent: HomePageContent;
  onHomeContentChange: (patch: Partial<HomePageContent>) => void;
  lawnMowingContent: LawnMowingPageContent;
  onLawnMowingContentChange: (patch: Partial<LawnMowingPageContent>) => void;
  editingGalleryId: string | null;
  onSelectImageGallery: (sectionId: string) => void;
  onAddGalleryImages: (sectionId: string) => void;
  onStartAiEdit: (prompt: string) => void;
}) {
  if (leftView === "edit") {
    return (
      <div className="flex h-full w-[415px] shrink-0 flex-col overflow-hidden bg-surface">
        <EditSectionsPanel
          onClose={onRequestExitEdit}
          onAddSection={onAddSection}
          sections={homeContent.sections}
          onSelectHero={() => setLeftView("heroEdit")}
          onSelectImageGallery={onSelectImageGallery}
        />
      </div>
    );
  }

  if (leftView === "imageGalleryEdit") {
    const gallery = homeContent.sections.find((section) => section.id === editingGalleryId);
    return (
      <div className="flex h-full w-[415px] shrink-0 flex-col overflow-hidden bg-surface">
        <ImageGalleryEditPanel
          images={gallery?.images ?? []}
          onBack={() => setLeftView("edit")}
          onAddImages={() => editingGalleryId && onAddGalleryImages(editingGalleryId)}
        />
      </div>
    );
  }

  if (leftView === "heroEdit") {
    return (
      <div className="flex h-full w-[415px] shrink-0 flex-col overflow-hidden bg-surface">
        <HeroEditPanel
          content={homeContent}
          onContentChange={onHomeContentChange}
          onBack={() => setLeftView("edit")}
        />
      </div>
    );
  }

  if (leftView === "projectEdit") {
    return (
      <div className="flex h-full w-[415px] shrink-0 flex-col overflow-hidden bg-surface">
        <ProjectEditSectionsPanel
          onClose={onRequestExitEdit}
          onAddSection={onAddSection}
          onSelectProjectOverview={() => setLeftView("projectOverviewEdit")}
        />
      </div>
    );
  }

  if (leftView === "projectOverviewEdit") {
    return (
      <div className="flex h-full w-[415px] shrink-0 flex-col overflow-hidden bg-surface">
        <ProjectOverviewEditPanel onBack={() => setLeftView("projectEdit")} />
      </div>
    );
  }

  if (leftView === "lawnMowingEdit") {
    return (
      <div className="flex h-full w-[415px] shrink-0 flex-col overflow-hidden bg-surface">
        <LawnMowingEditSectionsPanel
          onClose={onRequestExitEdit}
          onAddSection={onAddSection}
          onSelectHero={() => setLeftView("lawnMowingHeroEdit")}
        />
      </div>
    );
  }

  if (leftView === "lawnMowingHeroEdit") {
    return (
      <div className="flex h-full w-[415px] shrink-0 flex-col overflow-hidden bg-surface">
        <LawnMowingHeroEditPanel
          content={lawnMowingContent}
          onContentChange={onLawnMowingContentChange}
          onBack={() => setLeftView("lawnMowingEdit")}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-[415px] shrink-0 flex-col overflow-hidden bg-surface">
      {leftView === "landing" ? (
        <LandingPanel onOpen={setLeftView} onStartAiEdit={onStartAiEdit} />
      ) : (
        <ToolView view={leftView} onBack={() => setLeftView("landing")} />
      )}
    </div>
  );
}

function LandingPanel({
  onOpen,
  onStartAiEdit,
}: {
  onOpen: (v: LeftView) => void;
  onStartAiEdit: (prompt: string) => void;
}) {
  const [aiPrompt, setAiPrompt] = useState("");
  const submitAiPrompt = () => {
    const trimmed = aiPrompt.trim();
    if (!trimmed) return;
    onStartAiEdit(trimmed);
    setAiPrompt("");
  };
  return (
    <>
      {/* Navigation control */}
      <div className="flex w-[412px] min-h-[96px] shrink-0 flex-col gap-16 border-b-4 border-surface-bg px-6 py-8">
        <div className="flex w-full items-center gap-4">
          <button className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-surface-subtle">
            <CloseIcon size={20} />
          </button>
          <p className="text-[14px] leading-[1.25] text-secondary">
            Website / <span className="text-heading">Setup</span>
          </p>
        </div>
        <div className="flex w-full flex-col gap-4">
          <h3 className="text-[20px] font-bold leading-[1.2] text-heading">Customize Website</h3>
          <p className="text-[14px] leading-[1.25] text-secondary">
            We will help you manage anywhere you brand touch points interact with leads in one place.
          </p>
        </div>
      </div>

      {/* Main scroll area */}
      <div className="flex flex-1 flex-col justify-start pb-6">
        {/* URL card */}
        <div className="flex w-[415px] flex-col gap-4 px-8 pb-2 pt-6">
          <div className="flex w-full items-center justify-between gap-4">
            <h5 className="text-[14px] font-bold leading-[1.25] text-heading">Website address</h5>
            <button className="flex items-center gap-1 text-[14px] font-semibold leading-[1.25] text-interactive hover:underline">
              <PlusIcon size={16} color="#388523" />
              Custom Domain
            </button>
          </div>
          <p className="text-[14px] leading-[1.25] text-secondary">treetrimcompany.jobbersites.com</p>
        </div>

        {/* Global controls label */}
        <div className="flex w-full items-center px-8 pb-2 pt-6">
          <p className="text-[14px] font-bold leading-[1.25] text-secondary opacity-65">Global Controls</p>
        </div>

        {/* Link rows */}
        <SidebarLink
          icon={iconSeo}
          title="SEO and Discovery"
          desc="Improve how your site appears in search results and attract more visitors."
          onClick={() => onOpen("seo")}
        />
        <SidebarLink
          icon={iconReceptionist}
          title="Receptionist Chat"
          status="On"
          desc="Customize how the AI helps visitors by answering questions or capturing leads."
          onClick={() => onOpen("receptionist")}
        />
        <SidebarLink
          icon={iconNav}
          title="Navigation menu"
          desc="Adjust the feature link and text"
          onClick={() => onOpen("navigation")}
        />
        <SidebarLink
          icon={iconBrand}
          title="Update your brand look"
          desc="Adjust your logo, colors, and fonts across your entire site."
          onClick={() => onOpen("brand")}
        />
      </div>

      {/* AI edit launcher */}
      <div className="flex w-[412px] shrink-0 flex-col gap-2 px-6 pb-1 pt-2">
        <div className="flex items-center gap-2">
          <div className="flex h-12 flex-1 items-center gap-2 rounded-full border border-border bg-surface px-4">
            <input
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitAiPrompt();
                }
              }}
              placeholder="tell us what you want to change"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-heading outline-none placeholder:text-secondary"
            />
            <button type="button" className="flex size-6 items-center justify-center" aria-label="Voice input">
              <MicIcon size={18} />
            </button>
          </div>
          <button
            type="button"
            onClick={submitAiPrompt}
            className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-surface-subtle"
            aria-label="Ask AI"
          >
            <ArrowUpIcon size={20} />
          </button>
        </div>
        <p className="text-[12px] leading-[1.25] text-secondary">
          AI can make mistakes. Check important info. <span className="font-semibold text-heading">Learn more.</span>
        </p>
      </div>

      {/* Footer */}
      <div className="flex w-[412px] shrink-0 flex-col px-6 pb-8 pt-4">
        <div className="relative flex h-12 items-center justify-end">
          <button className="flex h-12 items-center rounded-lg bg-interactive px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#2f7d20]">
            Publish Website
          </button>
        </div>
      </div>
    </>
  );
}

function AIEditDrawer({
  collapsed,
  onToggleCollapsed,
  initialPrompt,
  currentHeroSubheading,
  onApplyHeroSubheading,
  onAddServicePage,
  onApplyTeamPhotos,
  onView,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  initialPrompt: string;
  currentHeroSubheading: string;
  onApplyHeroSubheading: (value: string) => void;
  onAddServicePage: () => void;
  onApplyTeamPhotos: (images: string[]) => void;
  onView: (view: AiView) => void;
}) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [stagedImages, setStagedImages] = useState<string[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const aliveRef = useRef(true);
  const didInit = useRef(false);
  const awaitingTeamPhotosRef = useRef(false);
  const heroSubRef = useRef(currentHeroSubheading);
  heroSubRef.current = currentHeroSubheading;

  const runPrompt = (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const thinkingId = `t-${stamp}`;
    setMessages((prev) => [
      ...prev,
      { id: `u-${stamp}`, role: "user", text: trimmed },
      { id: thinkingId, role: "thinking" },
    ]);

    const scenario = matchAiScenario(trimmed);
    window.setTimeout(() => {
      if (!aliveRef.current) return;
      if (scenario === "teamGallery") {
        awaitingTeamPhotosRef.current = true;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingId
              ? {
                  id: thinkingId,
                  role: "assistant",
                  text: "Got it — I\u2019ll add an image gallery section to your homepage to show off your team. To set it up, upload at least 3 images of your team and I\u2019ll add the gallery with your photos.",
                }
              : m,
          ),
        );
      } else if (scenario === "addServicePage") {
        onAddServicePage();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingId
              ? {
                  id: thinkingId,
                  role: "assistant",
                  text: 'Got it — I added a new Lawn mowing service page. It has a hero section, a short description of the service, a FAQ section and a "Get a Quote" button, and I\u2019ve added this page to your navigation.',
                  summary: {
                    title: "Added new page",
                    detail: 'New page: "Lawn mowing" (added to navigation)',
                    view: { type: "page", page: "lawnMowing" },
                  },
                }
              : m,
          ),
        );
      } else if (scenario === "heroSubtitle") {
        const before = heroSubRef.current;
        const after = "Expert landscape design & installation — book your free, no-obligation quote today";
        onApplyHeroSubheading(after);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingId
              ? {
                  id: thinkingId,
                  role: "assistant",
                  text: "Done. I updated the text under your homepage headline to mention your free quotes.",
                  summary: { title: "Updated hero text", before, after, view: { type: "section", sectionId: "hero" } },
                }
              : m,
          ),
        );
      } else if (scenario === "seo") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingId
              ? {
                  id: thinkingId,
                  role: "assistant",
                  text: 'Done. I improved your site\u2019s search basics \u2014 I added a clearer page title and description, and worked your main services and city into your homepage so you\u2019re easier to find for \u201Clandscaping in [City].\u201D You can fine-tune these anytime under SEO and Discovery in your settings.',
                  summary: {
                    title: "Updated search settings",
                    detail: "Page title \u00B7 meta description \u00B7 homepage keywords",
                    view: { type: "seoSettings" },
                  },
                }
              : m,
          ),
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingId
              ? {
                  id: thinkingId,
                  role: "assistant",
                  text: "I can help update your site. Try asking me to change a specific part — like the text under your homepage headline.",
                }
              : m,
          ),
        );
      }
    }, 5000);
  };

  useEffect(() => {
    aliveRef.current = true;
    if (!didInit.current) {
      didInit.current = true;
      if (initialPrompt) runPrompt(initialPrompt);
    }
    return () => {
      aliveRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const submitDraft = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (collapsed) onToggleCollapsed();
    runPrompt(trimmed);
    setDraft("");
  };

  const submitImages = () => {
    const imgs = stagedImages;
    if (imgs.length === 0) return;
    if (collapsed) onToggleCollapsed();
    setStagedImages([]);

    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const thinkingId = `t-${stamp}`;
    setMessages((prev) => [
      ...prev,
      { id: `u-${stamp}`, role: "user", text: `Uploaded ${imgs.length} image${imgs.length > 1 ? "s" : ""}`, images: imgs },
      { id: thinkingId, role: "thinking" },
    ]);

    const enough = imgs.length >= 3;
    window.setTimeout(() => {
      if (!aliveRef.current) return;
      if (enough) {
        onApplyTeamPhotos(imgs);
        awaitingTeamPhotosRef.current = false;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingId
              ? {
                  id: thinkingId,
                  role: "assistant",
                  text: "Perfect — I\u2019ve added your photos to the team gallery on your homepage. Want a heading or short caption above it?",
                  summary: {
                    title: "Added images",
                    detail: `Home \u2192 Team gallery (${imgs.length} photos)`,
                    view: { type: "teamGallery" },
                  },
                }
              : m,
          ),
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingId
              ? {
                  id: thinkingId,
                  role: "assistant",
                  text: "Thanks! I\u2019ll need at least 3 images to add the gallery — could you add a couple more?",
                }
              : m,
          ),
        );
      }
    }, enough ? 5000 : 1200);
  };

  const onSend = () => (stagedImages.length > 0 ? submitImages() : submitDraft());
  const addStagedImages = (count = 3) => {
    const start = stagedImages.length;
    const additions = Array.from(
      { length: count },
      (_, i) => TEAM_PHOTO_POOL[(start + i) % TEAM_PHOTO_POOL.length],
    );
    setStagedImages([...stagedImages, ...additions]);
    setShowUploader(false);
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant") as
    | Extract<AiMessage, { role: "assistant" }>
    | undefined;
  const isThinking = messages.some((m) => m.role === "thinking");
  const headerText = isThinking
    ? "Thinking..."
    : lastAssistant?.text ?? "Tell us what you'd like to change";

  return (
    <div
      className={`absolute bottom-0 left-0 z-30 flex w-[415px] flex-col rounded-t-2xl border border-border bg-surface shadow-[0px_-10px_30px_0px_rgba(0,0,0,0.14)] transition-[height] duration-300 ease-out ${
        collapsed ? "h-[196px]" : "h-[90%]"
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        onClick={onToggleCollapsed}
        className="flex h-6 w-full shrink-0 cursor-grab items-center justify-center pt-2 active:cursor-grabbing"
        aria-label={collapsed ? "Expand AI edit" : "Collapse AI edit"}
      >
        <span className="h-1.5 w-9 rounded-full bg-[#c9d1d6]" />
      </button>

      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-surface-bg px-5 pb-3">
        <SparkleIcon size={20} className="shrink-0" />
        <p className="min-w-0 flex-1 truncate text-[14px] font-medium leading-[1.3] text-heading">
          {headerText}
        </p>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-surface-subtle"
          aria-label={collapsed ? "Expand AI edit" : "Collapse AI edit"}
        >
          <ChevronDownIcon size={20} className={collapsed ? "rotate-180" : ""} />
        </button>
      </div>

      {/* Conversation (expanded only) */}
      {!collapsed && (
        <div ref={scrollRef} className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
          {messages.map((m) => {
            if (m.role === "user") {
              return (
                <div key={m.id} className="flex w-full flex-col gap-2 rounded-lg bg-[#d6ecfb] px-3 py-2 text-[14px] leading-[1.3] text-heading">
                  <span>{m.text}</span>
                  {m.images && m.images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {m.images.map((src, i) => (
                        <img key={i} src={src} alt="" className="size-12 rounded-md object-cover" />
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            if (m.role === "thinking") {
              return (
                <div key={m.id} className="flex items-center gap-2 text-[14px] leading-[1.3] text-secondary">
                  <SparkleIcon size={18} />
                  <span>Thinking...</span>
                </div>
              );
            }
            return (
              <div key={m.id} className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <SparkleIcon size={18} className="mt-0.5 shrink-0" />
                  <p className="text-[14px] leading-[1.4] text-heading">{m.text}</p>
                </div>
                {m.summary && (
                  <>
                    <AiChangeSummaryCard summary={m.summary} onView={() => onView(m.summary!.view)} />
                    <div className="flex items-center gap-3 pl-6">
                      <button className="flex size-7 items-center justify-center rounded-md hover:bg-surface-subtle" aria-label="Helpful">
                        <ThumbsUpIcon size={18} />
                      </button>
                      <button className="flex size-7 items-center justify-center rounded-md hover:bg-surface-subtle" aria-label="Not helpful">
                        <ThumbsDownIcon size={18} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Composer */}
      <div className="relative shrink-0 px-5 pb-5 pt-3">
        {stagedImages.length > 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-3">
            <div className="flex flex-wrap gap-2">
              {stagedImages.map((src, i) => (
                <img key={i} src={src} alt="" className="size-[68px] rounded-lg object-cover" />
              ))}
            </div>
            <p className="pt-3 text-[14px] font-medium text-heading">Add these</p>
            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setShowUploader(true)}
                className="flex size-12 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-surface-subtle"
                aria-label="Add more images"
              >
                <PlusIcon size={20} color="#032B3A" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex size-12 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-surface-subtle"
                  aria-label="Voice input"
                >
                  <MicIcon size={18} />
                </button>
                <button
                  type="button"
                  onClick={onSend}
                  className="flex size-12 items-center justify-center rounded-lg bg-surface-subtle transition-colors hover:bg-[#e4e8ea]"
                  aria-label="Send"
                >
                  <ArrowUpIcon size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowUploader(true)}
              className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-surface-subtle"
              aria-label="Upload images"
            >
              <PlusIcon size={20} color="#032B3A" />
            </button>
            <div className="flex h-12 flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-4">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onSend();
                  }
                }}
                placeholder="Describe what you'd like updated or added"
                className="min-w-0 flex-1 bg-transparent text-[14px] leading-[1.3] text-heading outline-none placeholder:text-secondary"
              />
              <button type="button" className="flex size-7 shrink-0 items-center justify-center" aria-label="Voice input">
                <MicIcon size={18} />
              </button>
            </div>
            <button
              type="button"
              onClick={onSend}
              className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-surface-subtle"
              aria-label="Send"
            >
              <ArrowUpIcon size={20} />
            </button>
          </div>
        )}
        {!collapsed && (
          <p className="px-1 pt-2 text-[12px] leading-[1.25] text-secondary">
            AI can make mistakes. Check important info. <span className="font-semibold text-heading">Learn more.</span>
          </p>
        )}
      </div>

      {/* Upload file dialog */}
      {showUploader && (
        <div
          className="absolute inset-0 z-40 flex items-end justify-center rounded-t-2xl bg-black/20 p-4"
          onClick={() => setShowUploader(false)}
        >
          <div
            className="mb-4 w-full rounded-xl border border-border bg-surface p-5 shadow-[0px_8px_24px_rgba(0,0,0,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-[18px] font-bold leading-[1.2] text-heading">Upload file</h3>
              <button
                type="button"
                onClick={() => setShowUploader(false)}
                className="flex size-7 items-center justify-center rounded-md hover:bg-surface-subtle"
                aria-label="Close"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <p className="pt-1 text-[13px] leading-[1.3] text-secondary">Upload image or file</p>
            <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border border-dashed border-[#9bb3bd] py-6">
              <button
                type="button"
                onClick={() => addStagedImages(3)}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-[14px] font-semibold text-interactive transition-colors hover:bg-surface-subtle"
              >
                Select Files
              </button>
              <p className="text-[12px] leading-[1.25] text-secondary">Select or drag files here to upload</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getAiChangeSummaryText(summary: AiSummary) {
  if (summary.detail) return summary.detail;

  const before = summary.before ?? "";
  const after = summary.after ?? "";
  const fullDiff = `“${before}” → “${after}”`;
  const isLargeTextChange = before.length + after.length > 240;

  if (!isLargeTextChange) return fullDiff;

  return summary.description ?? "Updated the selected website copy with a clearer version.";
}

function AiChangeSummaryCard({ summary, onView }: { summary: AiSummary; onView: () => void }) {
  const summaryText = getAiChangeSummaryText(summary);

  return (
    <div className="ml-6 flex items-start gap-3 rounded-lg border border-border bg-surface p-3 shadow-[0px_1px_4px_rgba(0,0,0,0.06)]">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0f8da5]">
        <CheckIcon size={13} color="#ffffff" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-[14px] font-bold leading-[1.2] text-heading">{summary.title}</p>
        <p
          className="overflow-hidden text-[12px] leading-[1.35] text-secondary"
          style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 3 }}
        >
          {summaryText}
        </p>
      </div>
      <button
        onClick={onView}
        className="shrink-0 self-center text-[14px] font-semibold text-interactive hover:underline"
      >
        View →
      </button>
    </div>
  );
}

function SidebarLink({
  icon,
  title,
  desc,
  status,
  onClick,
}: {
  icon: string;
  title: string;
  desc: string;
  status?: string;
  onClick?: () => void;
}) {
  return (
    <div className="group w-full bg-surface px-4">
      <div
        onClick={onClick}
        className="flex w-full cursor-pointer items-center gap-4 rounded-lg p-4 transition-colors group-hover:bg-[#eef1f2]"
      >
        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-surface-subtle">
          <img src={icon} alt="" className="size-6" />
        </div>
        <div className="flex h-[52px] min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-bold leading-[1.25] text-heading">{title}</p>
            {status && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e3f5df] px-1.5 py-0.5">
                <span className="size-1.5 rounded-full bg-[#2faf4f]" />
                <span className="text-[12px] font-medium leading-[1.25] text-[#2f7d20]">{status}</span>
              </span>
            )}
          </div>
          <p className="line-clamp-2 text-[12px] leading-[1.25] text-secondary">{desc}</p>
        </div>
        <div className="flex size-6 shrink-0 items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <img src={iconChevron} alt="" className="h-3 w-[7px]" />
        </div>
      </div>
    </div>
  );
}

function EditSectionsPanel({
  onClose,
  onAddSection,
  sections,
  onSelectHero,
  onSelectImageGallery,
}: {
  onClose: () => void;
  onAddSection: () => void;
  sections: HomeSection[];
  onSelectHero: () => void;
  onSelectImageGallery: (sectionId: string) => void;
}) {
  return (
    <>
      <div className="flex shrink-0 items-center gap-4 px-8 pb-8 pt-12">
        <button
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-surface-subtle"
        >
          <CloseIcon size={20} />
        </button>
        <h2 className="text-[16px] font-bold leading-[1.11] text-heading">Edit landing page</h2>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4">
        <div className="px-4 pb-4">
          <button
            onClick={onAddSection}
            className="flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-[14px] font-semibold text-interactive-subtle transition-colors hover:bg-surface-subtle"
          >
            <PlusIcon size={16} color="#233D48" />
            Add section
          </button>
        </div>

        {sections.map((section) => {
          if (section.kind === "hero") {
            return (
              <EditSectionRow
                key={section.id}
                icon={iconNav}
                title="Hero"
                desc="Edit your hero image, main heading, and contact details."
                onClick={onSelectHero}
              />
            );
          }

          if (section.kind === "imageGallery") {
            return (
              <EditSectionRow
                key={section.id}
                title="Image Gallery"
                desc="Collection of photos"
                iconNode={<ImageIcon size={20} />}
                onClick={() => onSelectImageGallery(section.id)}
              />
            );
          }

          if (section.kind === "featured") {
            return (
              <EditSectionRow
                key={section.id}
                icon={iconStar}
                title="Featured Content"
                desc="Add or update featured points about your services or values."
              />
            );
          }

          if (section.kind === "servicesList") {
            return (
              <EditSectionRow
                key={section.id}
                icon={iconBrand}
                title="Service listings"
                desc="Showcase or update the services you offer."
              />
            );
          }

          if (section.kind === "serviceCards") {
            return (
              <div key={section.id} className="contents">
                <EditSectionRow
                  icon={iconSeo}
                  title="Reviews"
                  desc="Choose which customer reviews to show on your site."
                  badge="Hidden"
                />
                <EditSectionRow icon={iconNav} title="Cards" desc="Small blocks for highlighting page link" />
              </div>
            );
          }

          return (
            <EditSectionRow
              key={section.id}
              icon={iconReceptionist}
              title="Contact form"
              desc="Let visitors reach out or request a quote or setup an assessment through your fo..."
            />
          );
        })}
      </div>
    </>
  );
}

function ProjectEditSectionsPanel({
  onClose,
  onAddSection,
  onSelectProjectOverview,
}: {
  onClose: () => void;
  onAddSection: () => void;
  onSelectProjectOverview: () => void;
}) {
  return (
    <>
      <div className="flex shrink-0 items-center gap-4 border-t-4 border-[#eeece7] px-8 pb-4 pt-12">
        <button
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-surface-subtle"
        >
          <CloseIcon size={20} />
        </button>
        <h2 className="min-w-0 flex-1 text-[16px] font-bold leading-[1.11] text-heading">
          Edit project showcase page
        </h2>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto pb-8 pt-12">
        <div className="px-6 pb-4">
          <button
            onClick={onAddSection}
            className="flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-[14px] font-semibold text-interactive-subtle transition-colors hover:bg-surface-subtle"
          >
            <PlusIcon size={16} color="#233D48" />
            Add section
          </button>
        </div>
        <div className="h-px w-full bg-border" />
        <div className="flex flex-col">
          <EditSectionRow
            icon={iconNav}
            title="Hero"
            desc="Edit your hero image, main heading, and contact details."
          />
          <EditSectionRow
            icon={iconStar}
            title="Project Overview"
            desc="Add or update featured points about your services or values."
            onClick={onSelectProjectOverview}
          />
          <EditSectionRow
            icon={iconBrand}
            title="Photo gallery"
            desc="Upload and organize images to show off your projects."
          />
        </div>
      </div>
    </>
  );
}

function LawnMowingEditSectionsPanel({
  onClose,
  onAddSection,
  onSelectHero,
}: {
  onClose: () => void;
  onAddSection: () => void;
  onSelectHero: () => void;
}) {
  return (
    <>
      <div className="flex shrink-0 items-center gap-4 border-t-4 border-[#eeece7] px-8 pb-4 pt-12">
        <button
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-surface-subtle"
        >
          <CloseIcon size={20} />
        </button>
        <h2 className="min-w-0 flex-1 text-[16px] font-bold leading-[1.11] text-heading">
          Edit lawn mowing page
        </h2>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto pb-8 pt-12">
        <div className="px-6 pb-4">
          <button
            onClick={onAddSection}
            className="flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-[14px] font-semibold text-interactive-subtle transition-colors hover:bg-surface-subtle"
          >
            <PlusIcon size={16} color="#233D48" />
            Add section
          </button>
        </div>
        <div className="h-px w-full bg-border" />
        <div className="flex flex-col">
          <EditSectionRow
            icon={iconNav}
            title="Hero"
            desc="Edit your service hero heading, description, and call-to-action."
            onClick={onSelectHero}
          />
          <EditSectionRow
            icon={iconStar}
            title="Benefits"
            desc="Highlight the reasons customers should choose this service."
          />
          <EditSectionRow
            icon={iconSeo}
            title="Call to action"
            desc="Invite visitors to request a quote for lawn mowing."
          />
          <EditSectionRow icon={iconBrand} title="FAQ" desc="Answer common questions about this service." />
          <EditSectionRow
            icon={iconReceptionist}
            title="Contact form"
            desc="Let visitors request a quote or book an assessment."
          />
        </div>
      </div>
    </>
  );
}

function EditSectionRow({
  icon,
  iconNode,
  title,
  desc,
  badge,
  onClick,
}: {
  icon?: string;
  iconNode?: ReactNode;
  title: string;
  desc: string;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left transition-colors hover:bg-[#eef1f2]"
    >
      <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-surface-subtle">
        {iconNode ?? <img src={icon ?? ""} alt="" className="size-5" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center gap-2">
          <span className="text-[14px] font-bold leading-[1.25] text-heading">{title}</span>
          {badge && (
            <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[10px] leading-[1.25] text-secondary">
              {badge}
            </span>
          )}
        </span>
        <span className="line-clamp-2 text-[12px] leading-[1.25] text-secondary">{desc}</span>
      </span>
    </button>
  );
}

function HeroEditPanel({
  content,
  onContentChange,
  onBack,
}: {
  content: HomePageContent;
  onContentChange: (patch: Partial<HomePageContent>) => void;
  onBack: () => void;
}) {
  return (
    <>
      <div className="flex shrink-0 items-center gap-4 px-8 pb-8 pt-12">
        <button
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-surface-subtle"
        >
          <ChevronLeftIcon size={20} />
        </button>
        <h2 className="min-w-0 flex-1 text-[16px] font-bold leading-[1.11] text-heading">Edit Hero</h2>
        <button className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-surface-subtle">
          <TrashIcon size={20} />
        </button>
      </div>

      <div className="flex shrink-0 border-b border-border px-8">
        <button className="border-b-4 border-interactive px-2 pb-3 text-[14px] font-bold leading-[1.25] text-heading">
          Content
        </button>
        <button className="ml-6 px-2 pb-3 text-[14px] font-bold leading-[1.25] text-secondary">
          Style
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-8 py-6">
        <div className="flex flex-col gap-2">
          <EditableTextField
            label="Heading"
            value={content.heroHeading}
            onChange={(value) => onContentChange({ heroHeading: value })}
          />
          <EditableTextAreaField
            label="Subheading"
            value={content.heroSubheading}
            onChange={(value) => onContentChange({ heroSubheading: value })}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[14px] font-bold leading-[1.25] text-heading">Google rating</p>
            <Toggle on />
          </div>
          <label className="flex items-center gap-2 text-[14px] leading-[1.25] text-secondary">
            <span className="flex size-5 items-center justify-center rounded bg-[#2f9e44]">
              <CheckIcon size={14} color="#ffffff" />
            </span>
            Show total number of reviews
          </label>
          <div className="rounded-lg bg-[#eeece2] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <p className="text-[14px] font-bold leading-[1.25] text-heading">Tree Trim Company</p>
                <div className="flex items-center gap-1 text-[14px] leading-[1.25] text-heading">
                  <img src={iconStar} alt="" className="size-4" />
                  5.0
                </div>
                <p className="text-[14px] leading-[1.25] text-secondary">
                  2426 123 North Street, Burnaby, BC, V5H2N9, Canada
                </p>
              </div>
              <TrashIcon size={20} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[14px] font-bold leading-[1.25] text-heading">Button</p>
            <Toggle on />
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-white">
            <div className="flex flex-col gap-0.5 px-4 pb-3 pt-2">
              <p className="text-[12px] leading-[1.25] text-secondary">Text</p>
              <p className="text-[14px] leading-[1.25] text-interactive-subtle">Get a quote</p>
            </div>
            <div className="h-px w-full bg-border" />
            <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-2">
              <div className="flex flex-col gap-0.5">
                <p className="text-[12px] leading-[1.25] text-secondary">Link</p>
                <p className="text-[14px] leading-[1.25] text-interactive-subtle">General inquiry</p>
              </div>
              <ChevronDownIcon size={18} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[14px] font-bold leading-[1.25] text-heading">Image</p>
            <p className="text-[12px] leading-[1.25] text-secondary">
              Automatically cropped to fit various screen sizes
            </p>
          </div>
          <img src={heroImg} alt="" className="h-[158px] w-full rounded-lg object-cover object-[68%_35%]" />
          <div className="flex items-center gap-2">
            <button className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] font-semibold text-interactive-subtle">
              Change Image
            </button>
            <button className="h-8 rounded-md px-3 text-[12px] font-semibold text-interactive-subtle">
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ImageGalleryEditPanel({
  images,
  onBack,
  onAddImages,
}: {
  images: string[];
  onBack: () => void;
  onAddImages: () => void;
}) {
  const needsMore = images.length < 3;
  return (
    <>
      <div className="flex shrink-0 items-center gap-4 px-8 pb-8 pt-12">
        <button
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-surface-subtle"
        >
          <ChevronLeftIcon size={20} />
        </button>
        <h2 className="min-w-0 flex-1 text-[16px] font-bold leading-[1.11] text-heading">Image gallery</h2>
        <button className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-surface-subtle">
          <TrashIcon size={20} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-8 py-2">
        {needsMore && (
          <div className="flex items-center gap-3 rounded-lg bg-[#e3f1f4] px-4 py-3">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0f8da5] text-[12px] font-bold leading-none text-white">
              i
            </span>
            <p className="text-[13px] leading-[1.3] text-heading">Hidden until at least 3 images are added</p>
          </div>
        )}

        <ReadonlyField label="Tag" value="Image gallery" />
        <ReadonlyField label="heading" value="Image gallery" />

        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[14px] font-bold leading-[1.25] text-heading">Image</p>
            <p className="text-[12px] leading-[1.25] text-secondary">{images.length} of 10 images added</p>
          </div>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((src, i) => (
                <img key={i} src={src} alt="" className="size-[52px] rounded-md object-cover" />
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={onAddImages}
            className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-[#9bb3bd] py-5 transition-colors hover:bg-surface-subtle"
          >
            <span className="rounded-lg border border-border bg-surface px-4 py-2 text-[14px] font-semibold text-[#388523]">
              Select Files
            </span>
            <span className="text-[12px] leading-[1.25] text-secondary">Select or drag files here to upload</span>
          </button>
        </div>
      </div>
    </>
  );
}

function LawnMowingHeroEditPanel({
  content,
  onContentChange,
  onBack,
}: {
  content: LawnMowingPageContent;
  onContentChange: (patch: Partial<LawnMowingPageContent>) => void;
  onBack: () => void;
}) {
  return (
    <>
      <div className="flex shrink-0 items-center gap-4 px-8 pb-8 pt-12">
        <button
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-surface-subtle"
        >
          <ChevronLeftIcon size={20} />
        </button>
        <h2 className="min-w-0 flex-1 text-[16px] font-bold leading-[1.11] text-heading">Edit Hero</h2>
        <button className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-surface-subtle">
          <TrashIcon size={20} />
        </button>
      </div>

      <div className="flex shrink-0 border-b border-border px-8">
        <button className="border-b-4 border-interactive px-2 pb-3 text-[14px] font-bold leading-[1.25] text-heading">
          Content
        </button>
        <button className="ml-6 px-2 pb-3 text-[14px] font-bold leading-[1.25] text-secondary">
          Style
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-8 py-6">
        <div className="flex flex-col gap-2">
          <ReadonlyField label="Heading" value={content.heroHeading} />
          <EditableTextAreaField
            label="Description"
            value={content.heroDescription}
            onChange={(value) => onContentChange({ heroDescription: value })}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[14px] font-bold leading-[1.25] text-heading">Button</p>
            <Toggle on />
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-white">
            <div className="flex flex-col gap-0.5 px-4 pb-3 pt-2">
              <p className="text-[12px] leading-[1.25] text-secondary">Text</p>
              <p className="text-[14px] leading-[1.25] text-interactive-subtle">Get a Quote</p>
            </div>
            <div className="h-px w-full bg-border" />
            <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-2">
              <div className="flex flex-col gap-0.5">
                <p className="text-[12px] leading-[1.25] text-secondary">Link</p>
                <p className="text-[14px] leading-[1.25] text-interactive-subtle">General inquiry</p>
              </div>
              <ChevronDownIcon size={18} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[14px] font-bold leading-[1.25] text-heading">Image</p>
            <p className="text-[12px] leading-[1.25] text-secondary">
              Automatically cropped to fit various screen sizes
            </p>
          </div>
          <img src={heroImg} alt="" className="h-[158px] w-full rounded-lg object-cover object-[55%_70%]" />
          <div className="flex items-center gap-2">
            <button className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] font-semibold text-interactive-subtle">
              Change Image
            </button>
            <button className="h-8 rounded-md px-3 text-[12px] font-semibold text-interactive-subtle">
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ProjectOverviewEditPanel({ onBack }: { onBack: () => void }) {
  return (
    <>
      <div className="flex shrink-0 items-center gap-4 px-8 pb-8 pt-12">
        <button
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-surface-subtle"
        >
          <ChevronLeftIcon size={20} />
        </button>
        <h2 className="min-w-0 flex-1 text-[16px] font-bold leading-[1.11] text-heading">
          Edit Project Overview
        </h2>
        <button className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-surface-subtle">
          <TrashIcon size={20} />
        </button>
      </div>

      <div className="flex shrink-0 border-b border-border px-8">
        <button className="border-b-4 border-interactive px-2 pb-3 text-[14px] font-bold leading-[1.25] text-heading">
          Content
        </button>
        <button className="ml-6 px-2 pb-3 text-[14px] font-bold leading-[1.25] text-secondary">
          Style
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-8 py-6">
        <div className="flex flex-col gap-4">
          <p className="text-[14px] font-bold leading-[1.25] text-heading">Project Details Card</p>
          <ReadonlyField label="Title" value="Project Date" />
          <ReadonlyField label="Text" value="June 14, 2026" />
          <ReadonlyField label="Title" value="Location" />
          <ReadonlyField label="Text" value="Hamilton, Ontario" />
          <ReadonlyField label="Title" value="Services" />
          <ReadonlyField label="Text" value={"• Landscape design\n• hardscaping\n• planting"} />
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-[14px] font-bold leading-[1.25] text-heading">Content</p>
          <ReadonlyField label="Title" value="Overview" />
          <ReadonlyField
            label="Text"
            value="This project involved a clean up and mulching service for a residential property in Hamilton. The goal was to complete a seasonal refresh that would bring the landscape back to a maintained and orderly condition."
          />
          <ReadonlyField label="Title" value="The Work" />
          <ReadonlyField
            label="Text"
            value={"• Completed a general property clean up to remove debris and tidy landscaped areas\n• Applied fresh mulch to existing garden beds to help define and protect them"}
          />
          <ReadonlyField label="Title" value="The Outcome" />
          <ReadonlyField
            label="Text"
            value="The outdoor space was left cleaner and more organized, with refreshed garden beds that clearly defined the landscaped areas and prepared the property for the season."
          />
        </div>
      </div>
    </>
  );
}

/* ----------------------------------- Canvas ----------------------------------- */

function Canvas({
  overlay,
  toggle,
  setOverlay,
  isEditMode,
  isAiEdit,
  applyingSectionId,
  creatingPage,
  focusedSection,
  onEditWebsite,
  onCancelEdit,
  onSaveEdit,
  onSelectHero,
  onSelectProjectOverview,
  onSelectLawnMowingHero,
  onAddSection,
  onMoveSection,
  onOpenQuoteModal,
  scrollToSectionId,
  onScrollToSectionHandled,
  previewPage,
  onPreviewPageChange,
  hasLawnMowingPage,
  homeContent,
  lawnMowingContent,
}: {
  overlay: Overlay;
  toggle: (o: Overlay) => void;
  setOverlay: (o: Overlay) => void;
  isEditMode: boolean;
  isAiEdit: boolean;
  applyingSectionId: string | null;
  creatingPage: boolean;
  focusedSection: FocusedSection;
  onEditWebsite: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onSelectHero: () => void;
  onSelectProjectOverview: () => void;
  onSelectLawnMowingHero: () => void;
  onAddSection: (sectionId: string) => void;
  onMoveSection: (sectionId: string, direction: "up" | "down") => void;
  onOpenQuoteModal: () => void;
  scrollToSectionId: string | null;
  onScrollToSectionHandled: () => void;
  previewPage: PreviewPage;
  onPreviewPageChange: (page: PreviewPage) => void;
  hasLawnMowingPage: boolean;
  homeContent: HomePageContent;
  lawnMowingContent: LawnMowingPageContent;
}) {
  const previewScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollToSectionId || previewPage !== "home") return;

    const timer = window.setTimeout(() => {
      const container = previewScrollRef.current;
      const section = document.getElementById(`preview-section-${scrollToSectionId}`);

      if (container && section) {
        const containerRect = container.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        // The frame is rendered with a CSS transform: scale(), so bounding-rect
        // values are scaled while scrollTop is not. Normalize by the scale factor.
        const scale = container.offsetWidth ? containerRect.width / container.offsetWidth : 1;
        const delta = (sectionRect.top - containerRect.top) / (scale || 1);
        // Instant (not smooth): the state reset below triggers a re-render that
        // would otherwise abort an in-flight smooth-scroll animation.
        container.scrollTo({ top: container.scrollTop + delta - 8 });
      }

      onScrollToSectionHandled();
    }, 90);

    return () => window.clearTimeout(timer);
  }, [homeContent.sections, onScrollToSectionHandled, previewPage, scrollToSectionId]);

  return (
    <div className="flex h-full flex-1 items-start overflow-hidden px-12">
      <div className="flex h-[1024px] min-w-0 flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="grid h-[96px] shrink-0 grid-cols-3 items-center gap-4 pb-8 pt-6">
          {/* left */}
          <div className="flex items-start self-stretch" />
          {/* center segmented control */}
          <div className="flex flex-col items-center self-start">
            <div className="flex items-center gap-1 rounded-lg bg-[#eceae2] p-1">
              <span className="flex h-8 w-12 items-center justify-center rounded-md bg-surface shadow-sm">
                <MonitorIcon size={20} />
              </span>
              <span className="flex h-8 w-12 items-center justify-center rounded-md">
                <SmartphoneIcon size={20} color="#5d757e" />
              </span>
            </div>
          </div>
          {/* right */}
          <div className="flex flex-col items-end self-start">
            <div className="relative flex items-center justify-end gap-2">
              <button
                onClick={() => toggle("more")}
                className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-surface-subtle"
              >
                <MoreIcon size={20} />
              </button>
              {isEditMode ? (
                <>
                  <button
                    onClick={onCancelEdit}
                    className="flex h-10 items-center rounded-lg border border-border bg-surface px-5 text-[14px] font-semibold text-interactive-subtle transition-colors hover:bg-surface-subtle"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSaveEdit}
                    className="flex h-10 items-center rounded-lg bg-interactive px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#2f7d20]"
                  >
                    Save
                  </button>
                </>
              ) : (
                <button
                  onClick={onEditWebsite}
                  className="flex h-10 items-center gap-1.5 rounded-lg border border-border bg-surface px-4 text-[14px] font-semibold text-interactive-subtle transition-colors hover:bg-surface-subtle"
                >
                  <PencilIcon size={18} />
                  Edit Website
                </button>
              )}

              {overlay === "more" && (
                <div className="absolute right-0 top-full z-30 mt-2 w-[210px] rounded-lg border border-border bg-surface p-2 shadow-[0px_4px_6px_rgba(0,0,0,0.08),0px_1px_2px_rgba(0,0,0,0.1)]">
                  <MenuRow icon={<MegaphoneIcon size={22} />} label="Provide feedback" />
                  <MenuRow icon={<TrashIcon size={22} />} label="Delete website" danger />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content view */}
        <div className="flex flex-1 items-center justify-center overflow-hidden pb-12">
          <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-lg bg-surface shadow-[0px_1px_4px_0px_rgba(0,0,0,0.1),0px_4px_12px_0px_rgba(0,0,0,0.05)]">
            {/* Module header */}
            {(isEditMode || isAiEdit) && (
              <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-border px-6 py-4">
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <p className="truncate text-[14px] leading-[1.25] text-heading">
                    <span className="font-bold">Website:</span> landscapeservices.jobbersite.com
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Home select -> dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => toggle("home")}
                      className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface pl-3 pr-2 text-[14px] text-heading transition-colors hover:bg-surface-subtle"
                    >
                      {getPreviewPageLabel(previewPage)}
                      <ChevronDownIcon size={18} />
                    </button>
                    {overlay === "home" && (
                      <HomeDropdown
                        selectedPage={previewPage}
                        hasLawnMowingPage={hasLawnMowingPage}
                        onSelectPage={(page) => {
                          onPreviewPageChange(page);
                          setOverlay(null);
                        }}
                        onClose={() => setOverlay(null)}
                      />
                    )}
                  </div>
                  {/* + add page */}
                  <button
                    onClick={() => toggle("addPage")}
                    className="flex size-9 items-center justify-center rounded-lg bg-heading transition-colors hover:bg-[#063546]"
                  >
                    <PlusIcon size={18} color="#ffffff" />
                  </button>
                </div>
              </div>
            )}

            {/* Website preview */}
            <div
              ref={previewScrollRef}
              className="flex flex-1 items-start justify-center overflow-x-hidden overflow-y-auto pb-12"
            >
              <WebsitePreview
                previewPage={previewPage}
                isEditMode={isEditMode}
                applyingSectionId={applyingSectionId}
                focusedSection={focusedSection}
                onSelectHero={onSelectHero}
                onSelectProjectOverview={onSelectProjectOverview}
                onSelectLawnMowingHero={onSelectLawnMowingHero}
                onAddSection={onAddSection}
                onMoveSection={onMoveSection}
                onOpenQuoteModal={onOpenQuoteModal}
                hasLawnMowingPage={hasLawnMowingPage}
                homeContent={homeContent}
                lawnMowingContent={lawnMowingContent}
              />
            </div>
            {creatingPage && <PagePreviewSkeleton />}
            {overlay === "quote" && !isEditMode && <QuoteRequestModal onClose={() => setOverlay(null)} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Website preview ----------------------------- */

function getPreviewPageLabel(page: PreviewPage) {
  if (page === "projectShowcase") return "Project showcase";
  if (page === "lawnMowing") return "Lawn mowing";
  return "Home";
}

function WebsitePreview({
  previewPage,
  isEditMode,
  applyingSectionId,
  focusedSection,
  onSelectHero,
  onSelectProjectOverview,
  onSelectLawnMowingHero,
  onAddSection,
  onMoveSection,
  onOpenQuoteModal,
  hasLawnMowingPage,
  homeContent,
  lawnMowingContent,
}: {
  previewPage: PreviewPage;
  isEditMode: boolean;
  applyingSectionId: string | null;
  focusedSection: FocusedSection;
  onSelectHero: () => void;
  onSelectProjectOverview: () => void;
  onSelectLawnMowingHero: () => void;
  onAddSection: (sectionId: string) => void;
  onMoveSection: (sectionId: string, direction: "up" | "down") => void;
  onOpenQuoteModal: () => void;
  hasLawnMowingPage: boolean;
  homeContent: HomePageContent;
  lawnMowingContent: LawnMowingPageContent;
}) {
  if (previewPage === "projectShowcase") {
    return (
      <ProjectShowcasePreview
        isEditMode={isEditMode}
        focusedSection={focusedSection}
        onSelectProjectOverview={onSelectProjectOverview}
        onAddSection={onAddSection}
      />
    );
  }

  if (previewPage === "lawnMowing" && hasLawnMowingPage) {
    return (
      <LawnMowingPreview
        isEditMode={isEditMode}
        focusedSection={focusedSection}
        content={lawnMowingContent}
        onSelectHero={onSelectLawnMowingHero}
        onAddSection={onAddSection}
        onOpenQuoteModal={onOpenQuoteModal}
      />
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      {/* nav */}
      <div className="flex shrink-0 items-center justify-between bg-white p-6 shadow-[0px_1px_4px_0px_rgba(0,0,0,0.16)]">
        <div className="flex items-center">
          <div className="relative h-[46px] w-[200px]">
            <img src={logoMark} alt="" className="absolute left-0 top-0 h-full w-[17.7px]" />
            <img src={logoText} alt="" className="absolute right-0 top-0 h-full w-[170px]" />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[14px] font-semibold text-interactive-subtle hover:bg-surface-subtle">
              <PhoneIcon size={18} />
              604-555-1234
            </button>
            <button className="rounded-lg border border-border bg-white px-4 py-2 text-[14px] font-semibold text-interactive-subtle hover:bg-surface-subtle">
              Client Login
            </button>
            <button className="rounded-lg bg-heading px-4 py-2 text-[14px] font-semibold text-white hover:bg-[#063546]">
              Get a Quote
            </button>
          </div>
          <button className="flex size-11 items-center justify-center rounded-lg hover:bg-surface-subtle">
            <MenuIcon size={24} />
          </button>
        </div>
      </div>

      {homeContent.sections
        .filter((section) => !(section.kind === "imageGallery" && (section.images?.length ?? 0) < 3))
        .map((section, index, visibleSections) => (
        <HomePreviewSection
          key={section.id}
          section={section}
          canMoveUp={index > 0}
          canMoveDown={index < visibleSections.length - 1}
          isEditMode={isEditMode}
          applying={applyingSectionId === section.id}
          focusedSection={focusedSection}
          onSelectHero={onSelectHero}
          onAddSection={() => onAddSection(section.id)}
          onMoveUp={() => onMoveSection(section.id, "up")}
          onMoveDown={() => onMoveSection(section.id, "down")}
          onOpenQuoteModal={onOpenQuoteModal}
          homeContent={homeContent}
        />
      ))}
    </div>
  );
}

function EditableSection({
  children,
  className,
  sectionId,
  editable = true,
  applying = false,
  focused = false,
  label,
  onClick,
  onAddSection,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
  onEdit,
}: {
  children: ReactNode;
  className: string;
  sectionId?: string;
  editable?: boolean;
  applying?: boolean;
  focused?: boolean;
  label?: string;
  onClick?: () => void;
  onAddSection?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onEdit?: () => void;
}) {
  const isFocused = editable && focused;

  return (
    <section
      id={sectionId ? `preview-section-${sectionId}` : undefined}
      onClick={editable ? onClick : undefined}
      className={`${editable ? "group" : ""} relative shrink-0 ${editable && onClick ? "cursor-pointer" : ""} ${
        isFocused || applying ? "overflow-hidden rounded-2xl" : ""
      } ${className}`}
    >
      {editable &&
        !applying &&
        (isFocused ? (
          <FocusedSectionToolbar label={label ?? "Editing Section"} />
        ) : (
          <SectionToolbar
            onAddSection={onAddSection}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onEdit={onEdit}
          />
        ))}
      {children}
      {applying && <SectionSkeleton />}
    </section>
  );
}

function PagePreviewSkeleton() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[72px] z-30 overflow-hidden bg-surface">
      <div className="flex items-center justify-between border-b border-border bg-white px-6 py-5">
        <div className="h-8 w-44 animate-pulse rounded-lg bg-[#e4e8ea]" />
        <div className="flex items-center gap-3">
          <div className="h-8 w-24 animate-pulse rounded-lg bg-[#e4e8ea]" />
          <div className="h-8 w-24 animate-pulse rounded-lg bg-[#e4e8ea]" />
        </div>
      </div>
      <div className="flex items-stretch gap-5 bg-[#eef1f0] px-6 py-14">
        <div className="flex flex-1 flex-col justify-center gap-5">
          <div className="h-12 w-2/3 animate-pulse rounded-lg bg-[#e4e8ea]" />
          <div className="h-5 w-3/4 animate-pulse rounded-lg bg-[#e4e8ea]" />
          <div className="h-5 w-1/2 animate-pulse rounded-lg bg-[#e4e8ea]" />
          <div className="h-12 w-36 animate-pulse rounded-lg bg-[#dfe3e5]" />
        </div>
        <div className="h-56 w-[42%] shrink-0 animate-pulse rounded-lg bg-[#e4e8ea]" />
      </div>
      <div className="flex flex-col gap-4 px-6 py-12">
        <div className="h-8 w-1/3 animate-pulse rounded-lg bg-[#e4e8ea]" />
        <div className="h-4 w-full animate-pulse rounded-lg bg-[#e4e8ea]" />
        <div className="h-4 w-5/6 animate-pulse rounded-lg bg-[#e4e8ea]" />
        <div className="h-4 w-2/3 animate-pulse rounded-lg bg-[#e4e8ea]" />
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-stretch gap-5 bg-surface pl-6">
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-6 py-16">
        <div className="h-7 w-24 animate-pulse rounded-lg bg-[#e4e8ea]" />
        <div className="h-12 w-2/3 animate-pulse rounded-lg bg-[#e4e8ea]" />
        <div className="flex flex-col gap-2">
          <div className="h-5 w-3/4 animate-pulse rounded-lg bg-[#e4e8ea]" />
          <div className="h-5 w-1/2 animate-pulse rounded-lg bg-[#e4e8ea]" />
        </div>
        <div className="h-12 w-36 animate-pulse rounded-lg bg-[#e4e8ea]" />
      </div>
      <div className="w-[42%] shrink-0 animate-pulse self-stretch bg-[#e4e8ea]" />
    </div>
  );
}

function HomePreviewSection({
  section,
  canMoveUp,
  canMoveDown,
  isEditMode,
  applying,
  focusedSection,
  onSelectHero,
  onAddSection,
  onMoveUp,
  onMoveDown,
  onOpenQuoteModal,
  homeContent,
}: {
  section: HomeSection;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isEditMode: boolean;
  applying: boolean;
  focusedSection: FocusedSection;
  onSelectHero: () => void;
  onAddSection: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onOpenQuoteModal: () => void;
  homeContent: HomePageContent;
}) {
  if (section.kind === "hero") {
    return (
      <EditableSection
        sectionId={section.id}
        className="flex items-stretch justify-center gap-5 bg-brand pl-6"
        editable={isEditMode}
        applying={applying}
        focused={focusedSection === "hero"}
        label="Editing Hero Section"
        onClick={isEditMode ? onSelectHero : undefined}
        onAddSection={onAddSection}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onEdit={onSelectHero}
      >
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-8 py-16">
          <div className="flex w-fit items-center gap-2 rounded-lg bg-brand-hover px-2 py-1">
            <div className="flex items-center gap-1">
              <span className="text-[16px] leading-[1.25] text-white">5.0</span>
              <img src={iconStar} alt="" className="size-4" />
            </div>
            <img src={googleLogo} alt="Google" className="h-4 w-[46px]" />
          </div>
          <div className="flex w-full flex-col gap-12">
            <h1 className="font-serif text-[50px] font-bold leading-[1.25] text-white">{homeContent.heroHeading}</h1>
            <p className="text-[20px] leading-[1.25] text-white">{homeContent.heroSubheading}</p>
            <button
              onClick={
                !isEditMode
                  ? (event) => {
                      event.stopPropagation();
                      onOpenQuoteModal();
                    }
                  : undefined
              }
              className="w-fit rounded-lg bg-heading px-6 py-3 text-[16px] font-semibold text-white hover:bg-[#063546]"
            >
              Get a Quote
            </button>
          </div>
        </div>
        <div className="relative w-[42%] shrink-0 self-stretch overflow-hidden">
          <img src={heroImg} alt="" className="absolute inset-0 size-full object-cover object-[68%_35%]" />
        </div>
      </EditableSection>
    );
  }

  if (section.kind === "featured") {
    return (
      <EditableSection
        sectionId={section.id}
        className="flex items-start justify-between gap-6 overflow-hidden bg-brand-light px-6 py-16"
        editable={isEditMode}
        onAddSection={onAddSection}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
      >
        <div className="flex w-[411px] shrink-0 flex-col gap-12">
          <h2 className="font-serif text-[42px] font-bold leading-[1.25] text-[#1a1a1a]">
            The Landscape Service Difference
          </h2>
          <Feature title="The art of outdoor spaces" body="Landscape design blends creativity and functionality to transform outdoor areas into beautiful, livable spaces. From lush gardens to sleek modern patios, a well-designed landscape enhances both aesthetics and usability." />
          <Feature title="Balance and harmony" body="A successful landscape design harmonizes natural elements like plants and water with built features such as pathways and pergolas. The right balance creates a seamless flow, making the space inviting and practical." />
          <Feature title="Choosing the right plants" body="Selecting the right plants for your landscape depends on climate, soil conditions, and maintenance needs. Native and drought-resistant plants can enhance beauty while reducing upkeep and water use." />
        </div>
        <div className="size-[460px] shrink-0 overflow-hidden rounded-lg">
          <img src={house3Img} alt="" className="size-full rounded-lg object-cover" />
        </div>
      </EditableSection>
    );
  }

  if (section.kind === "servicesList") {
    return (
      <EditableSection
        sectionId={section.id}
        className="flex flex-col items-center justify-center gap-12 overflow-hidden bg-brand-light px-12 py-16"
        editable={isEditMode}
        onAddSection={onAddSection}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
      >
        <SectionHeading eyebrow="Services" title="Our specialties" align="center" />
        <div className="grid w-full grid-cols-3 gap-x-6 gap-y-6">
          <ServiceListItem title="Lawn mowing" />
          <ServiceListItem title="Seeding" />
          <ServiceListItem title="Weeding" />
          <ServiceListItem title="Landscaping" />
          <ServiceListItem title="Native plants" />
          <ServiceListItem title="Water features" />
        </div>
        <button className="rounded-sm bg-heading px-4 py-2 text-[14px] font-semibold leading-[1.25] text-white hover:bg-[#063546]">
          Get a Quote
        </button>
      </EditableSection>
    );
  }

  if (section.kind === "serviceCards") {
    return (
      <EditableSection
        sectionId={section.id}
        className="flex flex-col items-start gap-12 overflow-hidden bg-brand-light px-12 py-16"
        editable={isEditMode}
        onAddSection={onAddSection}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
      >
        <SectionHeading eyebrow="Services" title="Our specialities" />
        <div className="grid w-full grid-cols-2 gap-6">
          <ImageServiceCard image={serviceCard1} title="Landscaping" />
          <ImageServiceCard image={serviceCard2} title="Landscaping" />
          <ImageServiceCard image={serviceCard3} title="Landscaping" />
          <ImageServiceCard image={serviceCard4} title="Landscaping" />
        </div>
      </EditableSection>
    );
  }

  if (section.kind === "quote") {
    return (
      <EditableSection
        sectionId={section.id}
        className="flex flex-col items-center justify-center gap-12 bg-[#f0f7f9] px-12 py-16"
        editable={isEditMode}
        onAddSection={onAddSection}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
      >
        <SectionHeading eyebrow="Quote" title="Get started today" align="center" />
        <QuoteCard />
      </EditableSection>
    );
  }

  return (
    <HomeImageGallerySection
      sectionId={section.id}
      isEditMode={isEditMode}
      applying={applying}
      variant={section.variant}
      images={section.images}
      onAddSection={onAddSection}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
    />
  );
}

function HomeImageGallerySection({
  sectionId,
  isEditMode,
  applying,
  variant,
  images,
  onAddSection,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  sectionId: string;
  isEditMode: boolean;
  applying: boolean;
  variant?: "team";
  images?: string[];
  onAddSection: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const isTeam = variant === "team";
  const photos = images ?? [];

  return (
    <EditableSection
      sectionId={sectionId}
      className="bg-[rgba(56,101,118,0.1)] px-12 py-16"
      editable={isEditMode}
      applying={applying}
      onAddSection={onAddSection}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
    >
      <div className="flex flex-col items-start gap-8 py-4">
        <div className="flex flex-col items-start justify-center gap-6">
          <span className="bg-[#4e9271] px-3 py-2 text-[14px] font-semibold leading-[1.25] text-white">
            {isTeam ? "Team" : "Image Gallery"}
          </span>
          <h2 className="font-serif text-[30px] font-bold leading-[1.25] text-[#1a1a1a]">
            {isTeam ? "Meet our team" : "Get inspired by our work"}
          </h2>
        </div>
        <div className="grid w-full grid-cols-3 gap-4">
          {photos.map((src, i) => (
            <img key={i} src={src} alt="" className="h-[260px] w-full rounded-lg object-cover" />
          ))}
        </div>
      </div>
    </EditableSection>
  );
}

function SectionHeading({
  eyebrow,
  title,
  align = "start",
}: {
  eyebrow: string;
  title: string;
  align?: "start" | "center";
}) {
  return (
    <div className={`flex flex-col gap-6 ${align === "center" ? "items-center text-center" : "items-start"}`}>
      <div className="bg-brand px-3 py-2 text-[14px] font-semibold leading-[1.25] text-white">{eyebrow}</div>
      <h2 className="font-serif text-[42px] font-bold leading-[1.25] text-[#1a1a1a]">{title}</h2>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex w-[344px] flex-col justify-center">
        <h3 className="text-[20px] font-bold leading-[1.2] text-[#1a1a1a]">{title}</h3>
      </div>
      <p className="text-[16px] leading-[1.3] text-secondary">{body}</p>
    </div>
  );
}

function ServiceListItem({ title }: { title: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex items-center gap-4">
        <CheckIcon size={22} color="#2f9e44" />
        <h3 className="min-w-0 flex-1 text-[24px] font-semibold leading-[1.25] text-[#1a1a1a]">{title}</h3>
      </div>
      <p className="pl-[38px] text-[20px] leading-[1.25] text-[#1a1a1a]">
        Additional details about the list item. So interesting!
      </p>
    </div>
  );
}

function ImageServiceCard({ image, title }: { image: string; title: string }) {
  return (
    <div className="relative flex h-[500px] flex-col justify-end overflow-hidden rounded-lg px-6 pb-6 pt-12 shadow-[0px_1px_2px_rgba(0,0,0,0.25),0px_0px_2px_rgba(0,0,0,0.1)]">
      <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      <div className="relative flex w-full items-end gap-2 text-white">
        <h3 className="min-w-0 flex-1 font-serif text-[30px] font-bold leading-[1.25]">{title}</h3>
        <span className="flex size-8 items-center justify-center text-[24px] leading-none">→</span>
      </div>
    </div>
  );
}

function QuoteCard() {
  return (
    <div className="flex w-full flex-col gap-9 rounded-lg bg-white p-6 shadow-[0px_4px_6px_rgba(0,0,0,0.05),0px_1px_2px_rgba(0,0,0,0.1)]">
      <div className="flex h-1 w-full items-center justify-center gap-1">
        <div className="h-1 w-16 rounded-full bg-[#0f7cc3]" />
        <div className="h-1 w-16 rounded-full bg-[#d9d9d9]" />
        <div className="h-1 w-16 rounded-full bg-[#d9d9d9]" />
        <div className="h-1 w-16 rounded-full bg-[#d9d9d9]" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="pb-3">
          <h3 className="text-[20px] font-bold leading-[1.2] text-black">Contact information</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <PreviewInput label="First name" value="John" />
          <PreviewInput label="Last name" value="Smith" />
        </div>
        <PreviewInput label="Company name" />
        <PreviewInput label="Email" value="johnsmith@gmail.com" />
        <PreviewInput label="Phone" value="(511) 709-0935" />
        <PreviewInput label="Street address" value="500 10th Ave." />
        <PreviewInput label="Unit, apartment, suite, etc (optional)" />
        <div className="grid grid-cols-3 gap-3">
          <PreviewInput label="City" value="Toronto" />
          <PreviewInput label="Province" value="ON" hasChevron />
          <PreviewInput label="Postal code" />
        </div>
        <label className="flex items-center gap-3 py-1 text-[14px] leading-[1.25] text-secondary">
          <span className="flex size-4 items-center justify-center rounded-[3px] bg-[#0f7cc3]">
            <CheckIcon size={12} color="#ffffff" />
          </span>
          I agree to receive marketing emails and texts.
        </label>
        <p className="py-1 text-[10px] leading-[1.25] text-secondary">
          View our <span className="underline">terms and conditions</span>
        </p>
      </div>
      <div className="flex justify-end">
        <button className="rounded-md bg-[#0f7cc3] px-4 py-2 text-[14px] font-semibold text-white">Next</button>
      </div>
    </div>
  );
}

function PreviewInput({
  label,
  value,
  hasChevron,
}: {
  label: string;
  value?: string;
  hasChevron?: boolean;
}) {
  return (
    <div className="flex h-12 items-center justify-between rounded-md border border-[#d9dfe2] bg-white px-3">
      <div className="flex min-w-0 flex-col">
        <span className="text-[10px] leading-[1.25] text-secondary">{label}</span>
        {value && <span className="truncate text-[14px] leading-[1.25] text-heading">{value}</span>}
      </div>
      {hasChevron && <ChevronDownIcon size={18} color="#5d757e" />}
    </div>
  );
}

function LawnMowingPreview({
  isEditMode,
  focusedSection,
  content,
  onSelectHero,
  onAddSection,
  onOpenQuoteModal,
}: {
  isEditMode: boolean;
  focusedSection: FocusedSection;
  content: LawnMowingPageContent;
  onSelectHero: () => void;
  onAddSection: (sectionId: string) => void;
  onOpenQuoteModal: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex shrink-0 items-center justify-between bg-white p-6 shadow-[0px_1px_4px_0px_rgba(0,0,0,0.16)]">
        <div className="relative h-[46px] w-[200px]">
          <img src={logoMark} alt="" className="absolute left-0 top-0 h-full w-[17.7px]" />
          <img src={logoText} alt="" className="absolute right-0 top-0 h-full w-[170px]" />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[14px] font-semibold text-interactive-subtle hover:bg-surface-subtle">
              <PhoneIcon size={18} />
              604-555-1234
            </button>
            <button className="rounded-lg border border-border bg-white px-4 py-2 text-[14px] font-semibold text-interactive-subtle hover:bg-surface-subtle">
              Client Login
            </button>
            <button className="rounded-lg bg-heading px-4 py-2 text-[14px] font-semibold text-white hover:bg-[#063546]">
              Get a Quote
            </button>
          </div>
          <button className="flex size-11 items-center justify-center rounded-lg hover:bg-surface-subtle">
            <MenuIcon size={24} />
          </button>
        </div>
      </div>

      <EditableSection
        sectionId="lawnMowingHero"
        editable={isEditMode}
        focused={focusedSection === "lawnMowingHero"}
        label="Editing Hero Section"
        onClick={isEditMode ? onSelectHero : undefined}
        onAddSection={() => onAddSection("lawnMowingHero")}
        onEdit={onSelectHero}
        className="flex min-h-[270px] items-stretch bg-brand"
      >
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-6 px-8 py-16 text-white">
          <h1 className="text-[36px] font-black leading-[1.11]">{content.heroHeading}</h1>
          <p className="max-w-[420px] text-[16px] font-bold leading-[1.2]">
            {content.heroDescription}
          </p>
        </div>
        <div className="relative w-[52%] shrink-0 overflow-hidden">
          <img src={heroImg} alt="" className="absolute inset-0 size-full object-cover object-[55%_70%]" />
        </div>
      </EditableSection>

      <EditableSection
        sectionId="lawnMowingBenefits"
        editable={isEditMode}
        onAddSection={() => onAddSection("lawnMowingBenefits")}
        className="flex items-start justify-between gap-8 bg-brand-light px-6 py-16"
      >
        <div className="flex w-[411px] shrink-0 flex-col gap-12">
          <h2 className="text-[32px] font-extrabold leading-9 text-[#1a1a1a]">Why Choose Our Lawn Mowing Service</h2>
          <Feature
            title="Consistent Yard Care"
            body="We deliver regular lawn mowing to keep your yard looking neat and healthy all season long."
          />
          <Feature
            title="Professional Equipment & Techniques"
            body="Our team uses top-quality equipment and proven techniques for a clean, even cut every time."
          />
          <Feature
            title="Flexible Scheduling"
            body="Enjoy convenient scheduling options tailored to fit your busy lifestyle."
          />
        </div>
        <div className="h-[460px] w-[423px] shrink-0 overflow-hidden rounded-lg">
          <img src={serviceCard1} alt="" className="size-full object-cover" />
        </div>
      </EditableSection>

      <EditableSection
        sectionId="lawnMowingCta"
        editable={isEditMode}
        onAddSection={() => onAddSection("lawnMowingCta")}
        className="flex flex-col items-center gap-6 bg-[#0027a0] px-12 py-24 text-center text-white"
      >
        <h2 className="text-[32px] font-extrabold leading-9">Get Your Lawn Looking Its Best Today</h2>
        <p className="text-[16px] leading-[1.2]">
          Contact AwesomeJaya for expert lawn mowing services in Toronto and Alberta now.
        </p>
        <button
          onClick={
            !isEditMode
              ? (event) => {
                  event.stopPropagation();
                  onOpenQuoteModal();
                }
              : undefined
          }
          className="rounded-lg bg-white px-5 py-3 text-[16px] font-semibold text-[#1a1a1a] hover:bg-[#f1f0e9]"
        >
          Get a Quote
        </button>
      </EditableSection>

      <EditableSection
        sectionId="lawnMowingFaq"
        editable={isEditMode}
        onAddSection={() => onAddSection("lawnMowingFaq")}
        className="flex items-start gap-10 bg-[#f3f4fc] px-12 py-20"
      >
        <div className="flex w-[262px] shrink-0 flex-col items-start gap-6">
          <span className="rounded-lg bg-[#4d63a6] px-3 py-2 text-[14px] font-semibold text-white">FAQs</span>
          <h2 className="text-[32px] font-extrabold leading-9 text-[#1f2504]">We've got answers</h2>
          <p className="text-[16px] leading-6 text-[#1f2504]">
            Find answers to common questions about our expert lawn mowing services.
          </p>
          <button className="rounded-lg bg-[#0027a0] px-5 py-3 text-[16px] font-semibold text-white">
            Contact Us
          </button>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <FaqItem
            open
            question="How often should I have my lawn mowed in Toronto and Alberta?"
            answer="The frequency depends on the grass type and season, but typically weekly or bi-weekly mowing keeps your yard healthy."
          />
          <FaqItem question="What areas do you serve?" />
          <FaqItem question="How do I schedule a lawn mowing appointment?" />
          <FaqItem question="Is your equipment safe for my family and pets?" />
        </div>
      </EditableSection>

      <EditableSection
        sectionId="lawnMowingForm"
        editable={isEditMode}
        onAddSection={() => onAddSection("lawnMowingForm")}
        className="flex flex-col items-center gap-12 bg-[#eef7f9] px-12 py-24"
      >
        <SectionHeading eyebrow="Quote" title="Get started today" align="center" />
        <div className="w-full max-w-[760px]">
          <QuoteCard />
        </div>
      </EditableSection>
    </div>
  );
}

function FaqItem({ question, answer, open = false }: { question: string; answer?: string; open?: boolean }) {
  return (
    <div className="border-b border-[#dce0ef] py-4">
      <div className="flex items-start gap-4">
        <h3 className="min-w-0 flex-1 text-[18px] font-bold leading-[1.2] text-[#1f2504]">{question}</h3>
        <button className="flex size-8 shrink-0 items-center justify-center text-[#0027a0]">
          <ChevronDownIcon size={18} />
        </button>
      </div>
      {open && answer && <p className="mt-2 text-[14px] leading-[1.25] text-[#1f2504]">{answer}</p>}
    </div>
  );
}

function ProjectShowcasePreview({
  isEditMode,
  focusedSection,
  onSelectProjectOverview,
  onAddSection,
}: {
  isEditMode: boolean;
  focusedSection: FocusedSection;
  onSelectProjectOverview: () => void;
  onAddSection: (sectionId: string) => void;
}) {
  return (
    <div className="w-full shrink-0 overflow-hidden border border-[#dadada] bg-white">
      <EditableSection
        className="flex h-[270px] items-center justify-center overflow-hidden"
        editable={isEditMode}
        onAddSection={() => onAddSection("projectHero")}
      >
        <img src={projectHero} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-[#2a1c00]/50" />
        <div className="relative flex w-full flex-col items-center gap-8 px-12 py-16 text-center text-white">
          <h1 className="w-[705px] text-[36px] font-black leading-[1.11]">
            Seasonal Property Clean up in Hamilton
          </h1>
          <p className="w-[705px] text-[16px] font-bold leading-[1.11]">
            May, 2026 | Hamilton Ontario
          </p>
        </div>
      </EditableSection>

      <EditableSection
        className="flex items-start gap-8 bg-white px-12 py-16"
        editable={isEditMode}
        focused={focusedSection === "projectOverview"}
        label="Editing Project Detail Section"
        onClick={isEditMode ? onSelectProjectOverview : undefined}
        onAddSection={() => onAddSection("projectOverview")}
        onEdit={onSelectProjectOverview}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <h2 className="text-[24px] font-bold leading-[1.33] text-interactive-subtle">Project Overview</h2>
          <div className="flex flex-col gap-4 text-[16px] leading-[1.25] text-[#1f2504]">
            <p>
              This project involved a clean up and mulching service for a residential property in Hamilton. The
              goal was to complete a seasonal refresh that would bring the landscape back to a maintained and
              orderly condition.
            </p>
            <div className="flex flex-col gap-4">
              <h3 className="text-[20px] font-bold leading-[1.2] text-interactive-subtle">The Work</h3>
              <ul className="list-disc pl-6">
                <li>Completed a general property clean up to remove debris and tidy landscaped areas</li>
                <li>Applied fresh mulch to existing garden beds to help define and protect them</li>
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-[20px] font-bold leading-[1.2] text-interactive-subtle">The Outcome</h3>
              <p>
                The outdoor space was left cleaner and more organized, with refreshed garden beds that clearly
                defined the landscaped areas and prepared the property for the season.
              </p>
            </div>
          </div>
        </div>
        <ProjectInfoCard />
      </EditableSection>

      <EditableSection
        className="bg-[rgba(56,101,118,0.1)] px-12 py-16"
        editable={isEditMode}
        onAddSection={() => onAddSection("projectGallery")}
      >
        <div className="flex flex-col gap-8 py-4">
          <div className="flex flex-col items-start gap-6">
            <span className="rounded-xl bg-[#4e9271] px-3 py-2 text-[14px] font-semibold leading-[1.25] text-white">
              Image Gallery
            </span>
            <h2 className="text-[24px] font-bold leading-[1.33] text-interactive-subtle">
              Get inspired by our work
            </h2>
          </div>
          <div className="grid h-[645px] grid-cols-3 gap-4">
            <div className="flex min-w-0 flex-col gap-4">
              <img src={projectGallery1} alt="" className="h-[317px] w-full object-cover" />
              <img src={projectGallery2} alt="" className="h-[312px] w-full object-cover" />
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <img src={projectGallery3} alt="" className="h-[187px] w-full object-cover" />
              <img src={projectGallery4} alt="" className="h-[439px] w-full object-cover" />
            </div>
            <div className="flex min-w-0 flex-col">
              <img src={projectGallery5} alt="" className="h-[640px] w-full object-cover" />
            </div>
          </div>
        </div>
      </EditableSection>
    </div>
  );
}

function ProjectInfoCard() {
  return (
    <aside className="flex w-[233px] shrink-0 flex-col gap-4 rounded-lg bg-surface-subtle px-4 py-6">
      <ProjectInfoSection title="Date">2025, June</ProjectInfoSection>
      <DividerLine />
      <ProjectInfoSection title="Location">Hamilton, Ontario</ProjectInfoSection>
      <DividerLine />
      <div className="flex flex-col gap-1">
        <p className="text-[14px] font-bold leading-[1.25] text-heading">Services</p>
        <ul className="list-disc pl-5 text-[14px] leading-[1.25] text-interactive-subtle">
          <li>Residential yard clean up</li>
          <li>Garden bed maintenance</li>
          <li>Mulch installation</li>
          <li>Landscape refresh and upkeep</li>
          <li>Debris removal</li>
        </ul>
      </div>
      <DividerLine />
      <div className="flex items-center justify-between">
        <p className="text-[14px] leading-[1.25] text-heading">Share</p>
        <div className="flex items-center gap-2 text-[16px] font-semibold text-heading">
          <span>↗</span>
          <span>f</span>
          <span>✉</span>
        </div>
      </div>
    </aside>
  );
}

function ProjectInfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[14px] font-bold leading-[1.25] text-heading">{title}</p>
      <p className="text-[14px] leading-[1.25] text-interactive-subtle">{children}</p>
    </div>
  );
}

function DividerLine() {
  return <div className="h-px w-full bg-border" />;
}

/* ----------------------------------- Overlays ----------------------------------- */

function MenuRow({
  icon,
  label,
  danger,
}: {
  icon: ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <button className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-surface-subtle">
      {icon}
      <span className={`text-[14px] font-semibold ${danger ? "text-[#C0341D]" : "text-heading"}`}>
        {label}
      </span>
    </button>
  );
}

function HomeDropdown({
  selectedPage,
  hasLawnMowingPage,
  onSelectPage,
  onClose,
}: {
  selectedPage: PreviewPage;
  hasLawnMowingPage: boolean;
  onSelectPage: (page: PreviewPage) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);

  const pages: Array<{ label: string; sub: boolean; value?: PreviewPage }> = [
    { label: "Home", sub: false, value: "home" },
    { label: "Services", sub: false },
    ...(hasLawnMowingPage ? [{ label: "Lawn mowing", sub: true, value: "lawnMowing" as const }] : []),
    { label: "Project showcase", sub: false, value: "projectShowcase" },
    { label: "Weed control", sub: true },
    { label: "Sod installation", sub: true },
    { label: "Landscape Design", sub: true },
    { label: "Option label", sub: false },
    { label: "Option label", sub: false },
    { label: "Option label", sub: false },
    { label: "Option label", sub: false },
  ];

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-30 mt-2 w-[248px] overflow-hidden rounded-lg border border-border bg-surface shadow-[0px_4px_12px_0px_rgba(0,0,0,0.05),0px_1px_4px_0px_rgba(0,0,0,0.1)]"
    >
      {/* search */}
      <div className="border-b border-border px-3 pb-2 pt-1">
        <input
          autoFocus
          placeholder="Search for a page"
          className="h-9 w-full bg-transparent text-[14px] text-heading outline-none placeholder:text-secondary"
        />
      </div>
      {/* options */}
      <div className="relative max-h-[266px] overflow-y-auto px-2 py-1">
        {pages.map((p, i) => (
          <button
            key={i}
            onClick={() => (p.value ? onSelectPage(p.value) : onClose())}
            className={`flex h-11 w-full items-center rounded-md p-2 text-left text-[14px] font-medium text-heading transition-colors hover:bg-surface-subtle ${
              p.sub ? "pl-9" : ""
            } ${
              p.value === selectedPage ? "bg-surface-subtle" : ""
            }`}
          >
            {p.label}
          </button>
        ))}
        <div className="pointer-events-none sticky bottom-0 -mt-4 h-4 bg-gradient-to-b from-transparent to-surface" />
      </div>
      {/* action */}
      <div className="p-2">
        <button
          onClick={onClose}
          className="flex h-11 w-full items-center rounded-md p-2 text-[14px] font-semibold text-interactive transition-colors hover:bg-surface-subtle"
        >
          Manage pages
        </button>
      </div>
    </div>
  );
}

function QuoteRequestModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="grid w-[760px] overflow-hidden rounded-2xl bg-white shadow-[0px_20px_60px_rgba(0,0,0,0.25)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-request-title"
      >
        <div className="flex items-start justify-between gap-6 bg-brand px-8 py-7 text-white">
          <div className="flex max-w-[520px] flex-col gap-3">
            <p className="text-[14px] font-semibold uppercase tracking-[0.08em] text-white/75">Landscape Services</p>
            <h2 id="quote-request-title" className="font-serif text-[34px] font-bold leading-[1.12]">
              Request a quote
            </h2>
            <p className="text-[16px] leading-[1.35] text-white/85">
              Tell us a little about your outdoor project and we’ll follow up with next steps.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            aria-label="Close quote request"
          >
            <CloseIcon size={22} color="#ffffff" />
          </button>
        </div>

        <form
          className="grid grid-cols-2 gap-4 bg-[#fbfaf6] p-8"
          onSubmit={(event) => {
            event.preventDefault();
            onClose();
          }}
        >
          <QuoteField label="First name" placeholder="Jane" />
          <QuoteField label="Last name" placeholder="Smith" />
          <QuoteField label="Email" placeholder="jane@example.com" type="email" />
          <QuoteField label="Phone" placeholder="604-555-1234" type="tel" />

          <label className="col-span-2 flex flex-col gap-2">
            <span className="text-[14px] font-bold leading-[1.25] text-heading">What service are you interested in?</span>
            <select className="h-12 rounded-lg border border-border bg-white px-4 text-[14px] text-interactive-subtle outline-none transition-colors focus:border-interactive">
              <option>Landscape design</option>
              <option>Lawn care</option>
              <option>Clean up and mulching</option>
              <option>Hardscaping</option>
            </select>
          </label>

          <label className="col-span-2 flex flex-col gap-2">
            <span className="text-[14px] font-bold leading-[1.25] text-heading">Project details</span>
            <textarea
              placeholder="Tell us about your yard, timeline, and anything you already have in mind."
              className="min-h-[116px] resize-none rounded-lg border border-border bg-white px-4 py-3 text-[14px] leading-[1.4] text-interactive-subtle outline-none transition-colors placeholder:text-secondary focus:border-interactive"
            />
          </label>

          <div className="col-span-2 flex items-center justify-between gap-6 pt-2">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-interactive-subtle">
              <PhoneIcon size={18} />
              604-555-1234
            </div>
            <button
              type="submit"
              className="h-12 rounded-lg bg-interactive px-8 text-[16px] font-semibold text-white transition-colors hover:bg-[#2f7d20]"
            >
              Send request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QuoteField({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[14px] font-bold leading-[1.25] text-heading">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="h-12 rounded-lg border border-border bg-white px-4 text-[14px] text-interactive-subtle outline-none transition-colors placeholder:text-secondary focus:border-interactive"
      />
    </label>
  );
}

function ServicePagePromptModal({
  onBack,
  onClose,
  onCreatePage,
}: {
  onBack: () => void;
  onClose: () => void;
  onCreatePage: () => void;
}) {
  const [prompt, setPrompt] = useState("");

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 px-8"
      onClick={onClose}
      role="presentation"
    >
      <form
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          onCreatePage();
        }}
        className="flex w-[626px] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-[0px_4px_12px_rgba(0,0,0,0.08),0px_1px_4px_rgba(0,0,0,0.1)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-page-title"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
          <button
            type="button"
            onClick={onBack}
            className="flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-surface-subtle"
            aria-label="Back to add page"
          >
            <ChevronLeftIcon size={22} />
          </button>
          <h2 id="service-page-title" className="min-w-0 flex-1 text-[20px] font-bold leading-[1.2] text-heading">
            Create service page
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-surface-subtle"
            aria-label="Close"
          >
            <CloseIcon size={22} />
          </button>
        </div>

        <div className="flex flex-col gap-6 px-8 py-6">
          <label className="flex flex-col gap-2">
            <span className="text-[14px] font-semibold leading-[1.25] text-heading">Page name</span>
            <input
              value="Lawn mowing"
              readOnly
              className="h-12 rounded-lg border border-border bg-white px-4 text-[14px] text-interactive-subtle outline-none"
            />
            <span className="text-[12px] leading-[1.25] text-secondary">
              Page name is displayed in your menu and used by Jobber AI to create default content
            </span>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[14px] font-semibold leading-[1.25] text-heading">Tell Jobber AI what to create</span>
            <textarea
              autoFocus
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Create a lawn mowing service page for homeowners in Toronto and Alberta."
              className="min-h-[150px] resize-none rounded-lg border border-border bg-white px-4 py-3 text-[14px] leading-[1.4] text-interactive-subtle outline-none transition-colors placeholder:text-secondary focus:border-interactive"
            />
            <span className="text-[12px] leading-[1.25] text-secondary">
              Add details and Jobber AI will transform them into compelling web content
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-8 py-5">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-border bg-surface px-4 text-[14px] font-semibold text-interactive-subtle transition-colors hover:bg-surface-subtle"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-10 rounded-lg bg-[#0f8da5] px-4 text-[14px] font-semibold text-white transition hover:brightness-95"
          >
            Create Page
          </button>
        </div>
      </form>
    </div>
  );
}

function AddPageModal({
  onClose,
  onSelectService,
}: {
  onClose: () => void;
  onSelectService: () => void;
}) {
  const items: { title: string; desc: string }[] = [
    { title: "Service", desc: "Provide details about a service you offer" },
    { title: "Job Showcase", desc: "Select one of your jobs and we’ll create a page based on the details" },
    { title: "Custom", desc: "Create a page from a prompt" },
  ];
  const legal = [
    { title: "Privacy Policy", desc: "Description of the page" },
    { title: "Terms and Conditions", desc: "Description of the page" },
  ];

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-[600px] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08),0px_1px_4px_0px_rgba(0,0,0,0.1)]"
      >
        <div className="flex items-start gap-2 px-6 pt-5">
          <p className="flex-1 text-[24px] font-bold leading-[1.33] text-heading">Add page</p>
          <button onClick={onClose} className="flex size-6 items-center justify-center">
            <CloseIcon size={22} />
          </button>
        </div>
        <div className="flex flex-col gap-2 p-6">
          <div className="flex flex-col">
            {items.map((it) => (
              <PageItem key={it.title} {...it} onClick={it.title === "Service" ? onSelectService : undefined} />
            ))}
          </div>
          <div className="h-px w-full bg-border" />
          <div className="flex flex-col">
            {legal.map((it) => (
              <PageItem key={it.title} {...it} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddSectionModal({
  onClose,
  onSelectImageGallery,
}: {
  onClose: () => void;
  onSelectImageGallery: () => void;
}) {
  const items: { title: string; desc: string }[] = [
    { title: "Hero", desc: "Large introduction with a headline, short text, and a call-to-action" },
    { title: "List", desc: "Scannable way to show services, packages, or step-by-step instructions" },
    { title: "Cards", desc: "Small blocks for highlighting page links" },
    { title: "Testimonial", desc: "Showcase Google reviews" },
    { title: "Image gallery", desc: "Collection of photos" },
    { title: "FAQs", desc: "Common questions and answers" },
    { title: "Text and image", desc: "Paragraph and optional image" },
    { title: "Featured content", desc: "Image and multiple text blocks for highlighting key business details" },
    { title: "Banner", desc: "Wide strip across the page for highlighting a message or link" },
    { title: "Form", desc: "Embed a Jobber form" },
  ];

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/30"
      onClick={onClose}
      role="presentation"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex w-[600px] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-[0px_1px_4px_rgba(0,0,0,0.1),0px_4px_12px_rgba(0,0,0,0.05)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-section-title"
      >
        <div className="flex items-start gap-2 px-6 pt-5">
          <h2 id="add-section-title" className="min-w-0 flex-1 text-[24px] font-bold leading-[1.33] text-heading">
            Add section
          </h2>
          <button onClick={onClose} className="flex size-6 items-center justify-center">
            <CloseIcon size={22} />
          </button>
        </div>

        <div className="flex flex-col p-6">
          {items.map((item) => (
            <AddSectionItem
              key={item.title}
              {...item}
              onClick={item.title === "Image gallery" ? onSelectImageGallery : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AddSectionItem({ title, desc, onClick }: { title: string; desc: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 rounded-lg p-2 text-left transition-colors hover:bg-surface-subtle"
    >
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-[16px] font-bold leading-[1.11] text-heading">{title}</span>
        <span className="text-[14px] leading-[1.25] text-heading">{desc}</span>
      </span>
      <PlusIcon size={20} color="#032B3A" />
    </button>
  );
}

function ExitEditConfirmDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onCancel}
      role="presentation"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex w-[420px] flex-col gap-6 rounded-lg border border-border bg-surface p-6 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08),0px_1px_4px_0px_rgba(0,0,0,0.1)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-edit-title"
      >
        <div className="flex flex-col gap-2">
          <h2 id="exit-edit-title" className="text-[24px] font-bold leading-[1.33] text-heading">
            Exit edit mode
          </h2>
          <p className="text-[14px] leading-[1.25] text-secondary">
            Unsaved changes will be lost, are you sure about leaving
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="h-10 rounded-lg border border-border bg-surface px-4 text-[14px] font-semibold text-interactive-subtle transition-colors hover:bg-surface-subtle"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="h-10 rounded-lg bg-[#c0341d] px-4 text-[14px] font-semibold text-white transition hover:brightness-95"
          >
            Exit edit mode
          </button>
        </div>
      </div>
    </div>
  );
}

function PageItem({ title, desc, onClick }: { title: string; desc: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors hover:bg-surface-subtle"
    >
      <div className="flex flex-col gap-1">
        <p className="text-[14px] font-medium leading-[1.25] text-heading">{title}</p>
        <p className="text-[14px] leading-[1.25] text-secondary">{desc}</p>
      </div>
      <img src={iconPlusGreen} alt="add" className="size-6 shrink-0" />
    </button>
  );
}

/* --------------------------- Section hover toolbar --------------------------- */

function SectionToolbar({
  onAddSection,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
  onEdit,
}: {
  onAddSection?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onEdit?: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/15 to-transparent" />
      <div className="pointer-events-auto relative flex items-center gap-2">
        <div className="flex items-center overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
          <button
            disabled={!canMoveUp || !onMoveUp}
            onClick={(event) => {
              event.stopPropagation();
              onMoveUp?.();
            }}
            className="flex size-9 items-center justify-center transition-colors hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowUpIcon size={18} />
          </button>
          <span className="h-9 w-px bg-border" />
          <button
            disabled={!canMoveDown || !onMoveDown}
            onClick={(event) => {
              event.stopPropagation();
              onMoveDown?.();
            }}
            className="flex size-9 items-center justify-center transition-colors hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowDownIcon size={18} />
          </button>
        </div>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onAddSection?.();
          }}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-[14px] font-semibold text-interactive-subtle shadow-sm transition-colors hover:bg-surface-subtle"
        >
          <PlusIcon size={16} color="#233D48" />
          Add Section
        </button>
      </div>
      <button
        onClick={(event) => {
          event.stopPropagation();
          onEdit?.();
        }}
        className="pointer-events-auto relative flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-[14px] font-semibold text-interactive-subtle shadow-sm transition-colors hover:bg-surface-subtle"
      >
        <PencilIcon size={16} />
        Edit
      </button>
    </div>
  );
}

function FocusedSectionToolbar({ label }: { label: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-12 rounded-t-2xl bg-black/70">
      <div className="absolute left-1/2 top-0 flex -translate-x-1/2 items-center gap-1 rounded-b-lg bg-black px-3 pb-2 pt-4 text-[16px] font-bold leading-[1.11] text-white">
        {label}
        <PencilIcon size={14} color="#ffffff" />
      </div>
    </div>
  );
}

/* ------------------------------- Tool views ------------------------------- */

type ToolViewKey = "seo" | "receptionist" | "navigation" | "brand";

const TOOL_TITLES: Record<ToolViewKey, string> = {
  seo: "SEO and Discovery",
  receptionist: "Receptionist Chat",
  navigation: "Navigation Menu",
  brand: "Update your brand look",
};

function ToolView({ view, onBack }: { view: ToolViewKey; onBack: () => void }) {
  return (
    <>
      <div className="flex shrink-0 items-center gap-4 border-b border-[#eeece7] px-6 pb-4 pt-12">
        <button
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-surface-subtle"
        >
          <ChevronLeftIcon size={20} />
        </button>
        <h2 className="text-[16px] font-bold leading-[1.11] text-heading">{TOOL_TITLES[view]}</h2>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto">
        {view === "seo" && <SeoBody />}
        {view === "receptionist" && <ReceptionistBody />}
        {view === "navigation" && <NavigationBody />}
        {view === "brand" && <BrandBody />}
      </div>

      <ToolFooter onCancel={onBack}>{view === "seo" && <AiPromptBar />}</ToolFooter>
    </>
  );
}

function ToolFooter({ onCancel, children }: { onCancel: () => void; children?: ReactNode }) {
  return (
    <div className="shrink-0 bg-surface px-6 pb-8 pt-4">
      {children}
      <div className="flex items-center gap-2">
        <button
          onClick={onCancel}
          className="h-10 flex-1 rounded-lg border border-border bg-surface text-[14px] font-semibold text-interactive-subtle transition-colors hover:bg-surface-subtle"
        >
          Cancel
        </button>
        <button
          onClick={onCancel}
          style={{ backgroundColor: SAVE_GREEN }}
          className="h-10 flex-1 rounded-lg text-[14px] font-semibold text-white transition hover:brightness-95"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function AiPromptBar() {
  return (
    <div className="mb-4 flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <div className="flex h-12 flex-1 items-center gap-2 rounded-lg border border-border px-3">
          <input
            placeholder="Enter a prompt here"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-heading outline-none placeholder:text-secondary"
          />
          <MicIcon size={20} />
        </div>
        <button className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border transition-colors hover:bg-surface-subtle">
          <ArrowUpIcon size={20} />
        </button>
      </div>
      <p className="text-[12px] leading-[1.25] text-secondary">
        AI can make mistakes. Check important info. <span className="font-semibold">Learn more.</span>
      </p>
    </div>
  );
}

function SeoBody() {
  const [siteTitle, setSiteTitle] = useState("AwesomeJaya: Trusted painting services in Toronto");
  const [siteDescription, setSiteDescription] = useState(
    "AwesomeJaya offers expert interior and exterior painting services in Toronto. Enjoy transparent pricing, clear communication, and fast response times from licensed painters.",
  );
  return (
    <div className="flex flex-col gap-6 px-8 pt-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <h3 className="text-[16px] font-bold leading-[1.11] text-heading">Page metadata</h3>
          <p className="text-[14px] leading-[1.4] text-secondary">
            Help search engines understand what your site is about. Updates take a few days to appear in
            search results.
          </p>
        </div>
        <EditableTextField label="Site Title" value={siteTitle} onChange={setSiteTitle} />
        <EditableTextAreaField label="Site Description" value={siteDescription} onChange={setSiteDescription} />
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="text-[16px] font-bold leading-[1.11] text-heading">Preview</h3>
        <div className="rounded-lg border border-border p-3">
          <p className="text-[12px] leading-[1.4] text-secondary">awesomejaya.jobbersites.com</p>
          <p className="mt-1 text-[14px] font-medium leading-[1.3] text-[#1a0dab]">{siteTitle}</p>
          <p className="mt-1 whitespace-pre-line text-[12px] leading-[1.4] text-secondary">{siteDescription}</p>
        </div>
      </div>
    </div>
  );
}

function ReceptionistBody() {
  return (
    <div className="flex flex-col gap-6 px-8 pt-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[14px] font-bold leading-[1.25] text-heading">Show Receptionist Chat</p>
          <Toggle on />
        </div>
        <p className="text-[14px] leading-[1.4] text-secondary">
          Update will be applied to your website immediately. Try Receptionist chat via the chat icon on
          your website preview.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[14px] font-bold leading-[1.25] text-heading">Improve Receptionist knowledge</p>
        <p className="text-[14px] leading-[1.4] text-secondary">
          Add context to your Business Profile for smarter chat
        </p>
        <button className="self-start text-[14px] font-semibold text-heading underline">
          Business Profile
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[14px] font-bold leading-[1.25] text-heading">Review chats and manage settings</p>
        <p className="text-[14px] leading-[1.4] text-secondary">
          AI may make mistakes or contain inaccuracies. Manage settings and review chats to improve results.
        </p>
        <button className="self-start text-[14px] font-semibold text-heading underline">
          Receptionist Home
        </button>
      </div>
    </div>
  );
}

function NavigationBody() {
  return (
    <div className="flex flex-col gap-4 px-8 pt-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[14px] font-bold leading-[1.25] text-heading">Button</p>
        <Toggle on />
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-white">
        <div className="flex flex-col gap-0.5 px-4 pb-3 pt-2">
          <p className="text-[12px] leading-[1.25] text-secondary">Text</p>
          <p className="text-[14px] leading-[1.25] text-interactive-subtle">Contact us</p>
        </div>
        <div className="h-px w-full bg-border" />
        <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-2">
          <div className="flex flex-col gap-0.5">
            <p className="text-[12px] leading-[1.25] text-secondary">Link</p>
            <p className="text-[14px] leading-[1.25] text-interactive-subtle">
              Company Details | 778-896-8888
            </p>
          </div>
          <ChevronDownIcon size={18} />
        </div>
      </div>
      <p className="text-[14px] leading-[1.4] text-secondary">
        Contact information can be modified in{" "}
        <span className="font-semibold text-interactive">Company Settings</span>
      </p>
    </div>
  );
}

function BrandBody() {
  return (
    <div className="flex flex-col gap-4 px-8 pt-6">
      <ColorField label="Main brand color" value="#0027A0" swatch="#0027A0" />
      <ColorField label="Accent color" value="#D9D9D9" swatch="#D9D9D9" />
      <p className="text-[12px] leading-[1.4] text-secondary">
        Updates will be immediately applied to your website and across Jobber. Font and background colors
        are generated for readability.
      </p>
    </div>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-white px-4 pb-4 pt-3">
      <p className="text-[12px] leading-[1.25] text-secondary">{label}</p>
      <p className="whitespace-pre-line text-[14px] leading-[1.4] text-interactive-subtle">{value}</p>
    </div>
  );
}

function EditableTextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 rounded-lg border border-border bg-white px-4 pb-4 pt-3 focus-within:border-interactive">
      <span className="text-[12px] leading-[1.25] text-secondary">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-[14px] leading-[1.4] text-interactive-subtle outline-none"
      />
    </label>
  );
}

function EditableTextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 rounded-lg border border-border bg-white px-4 pb-4 pt-3 focus-within:border-interactive">
      <span className="text-[12px] leading-[1.25] text-secondary">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full resize-none bg-transparent text-[14px] leading-[1.4] text-interactive-subtle outline-none"
      />
    </label>
  );
}

function ColorField({ label, value, swatch }: { label: string; value: string; swatch: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[14px] font-bold leading-[1.25] text-heading">{label}</p>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-white px-4 py-2.5">
        <span
          className="size-6 shrink-0 rounded"
          style={{ backgroundColor: swatch, border: "1px solid rgba(0,0,0,0.12)" }}
        />
        <div className="flex flex-col gap-0.5">
          <p className="text-[12px] leading-[1.25] text-secondary">{label}</p>
          <p className="text-[14px] leading-[1.25] text-interactive-subtle">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on }: { on?: boolean }) {
  const [checked, setChecked] = useState(!!on);
  return (
    <button
      onClick={() => setChecked((c) => !c)}
      className="flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors"
      style={{ backgroundColor: checked ? SAVE_GREEN : "#c2cace" }}
    >
      <span
        className={`size-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`}
      />
    </button>
  );
}
