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
} from "./Icons";

const FRAME_W = 1440;
const FRAME_H = 1024;

const SAVE_GREEN = "#2f9e44";

type Overlay = "home" | "addPage" | "addSection" | "more" | "publish" | "quote" | null;
type LeftView =
  | "landing"
  | "seo"
  | "receptionist"
  | "navigation"
  | "brand"
  | "edit"
  | "heroEdit"
  | "projectEdit"
  | "projectOverviewEdit";
type PreviewPage = "home" | "projectShowcase";
type HomeSectionKind = "hero" | "featured" | "servicesList" | "serviceCards" | "quote" | "imageGallery";
type HomeSection = {
  id: string;
  kind: HomeSectionKind;
};
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
  const [showExitEditConfirm, setShowExitEditConfirm] = useState(false);
  const [savedHomeContent, setSavedHomeContent] = useState<HomePageContent>(DEFAULT_HOME_CONTENT);
  const [draftHomeContent, setDraftHomeContent] = useState<HomePageContent>(DEFAULT_HOME_CONTENT);
  const [addSectionTarget, setAddSectionTarget] = useState<{ mode: "append" } | { mode: "after"; sectionId: string }>({
    mode: "append",
  });
  const [pendingScrollSectionId, setPendingScrollSectionId] = useState<string | null>(null);
  const isEditMode =
    leftView === "edit" ||
    leftView === "heroEdit" ||
    leftView === "projectEdit" ||
    leftView === "projectOverviewEdit";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOverlay(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggle = (o: Overlay) => setOverlay((cur) => (cur === o ? null : o));
  const handlePreviewPageChange = (page: PreviewPage) => {
    setPreviewPage(page);
    if (isEditMode) {
      setLeftView(page === "projectShowcase" ? "projectEdit" : "edit");
    }
  };
  const beginEditMode = () => {
    setDraftHomeContent(savedHomeContent);
    setLeftView(previewPage === "projectShowcase" ? "projectEdit" : "edit");
  };
  const discardEditMode = () => {
    setDraftHomeContent(savedHomeContent);
    setShowExitEditConfirm(false);
    setPendingScrollSectionId(null);
    setLeftView("landing");
  };
  const saveEditMode = () => {
    setSavedHomeContent(draftHomeContent);
    setPendingScrollSectionId(null);
    setLeftView("landing");
  };
  const openAddSection = (target: { mode: "append" } | { mode: "after"; sectionId: string }) => {
    setAddSectionTarget(target);
    setOverlay("addSection");
  };
  const addImageGallerySection = () => {
    const nextSection: HomeSection = {
      id: `imageGallery-${Date.now()}`,
      kind: "imageGallery",
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
    } else {
      const nextSavedContent = insertSection(savedHomeContent);
      setSavedHomeContent(nextSavedContent);
      setDraftHomeContent(nextSavedContent);
    }

    setPendingScrollSectionId(nextSection.id);
    setOverlay(null);
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
          onPublishMenu={() => toggle("publish")}
          publishOpen={overlay === "publish"}
          homeContent={draftHomeContent}
          onHomeContentChange={(patch) => setDraftHomeContent((current) => ({ ...current, ...patch }))}
        />
        <Canvas
          overlay={overlay}
          toggle={toggle}
          setOverlay={setOverlay}
          isEditMode={isEditMode}
          focusedSection={
            leftView === "heroEdit" ? "hero" : leftView === "projectOverviewEdit" ? "projectOverview" : null
          }
          onEditWebsite={beginEditMode}
          onCancelEdit={discardEditMode}
          onSaveEdit={saveEditMode}
          onSelectHero={() => setLeftView("heroEdit")}
          onSelectProjectOverview={() => setLeftView("projectOverviewEdit")}
          onAddSection={(sectionId) => openAddSection({ mode: "after", sectionId })}
          onMoveSection={moveHomeSection}
          onOpenQuoteModal={() => {
            if (!isEditMode) setOverlay("quote");
          }}
          scrollToSectionId={pendingScrollSectionId}
          onScrollToSectionHandled={() => setPendingScrollSectionId(null)}
          previewPage={previewPage}
          onPreviewPageChange={handlePreviewPageChange}
          homeContent={isEditMode ? draftHomeContent : savedHomeContent}
        />

        {/* Add page modal (triggered by + beside Home dropdown) */}
        {overlay === "addPage" && <AddPageModal onClose={() => setOverlay(null)} />}
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
  onPublishMenu,
  publishOpen,
  homeContent,
  onHomeContentChange,
}: {
  leftView: LeftView;
  setLeftView: (v: LeftView) => void;
  onRequestExitEdit: () => void;
  onAddSection: () => void;
  onPublishMenu: () => void;
  publishOpen: boolean;
  homeContent: HomePageContent;
  onHomeContentChange: (patch: Partial<HomePageContent>) => void;
}) {
  if (leftView === "edit") {
    return (
      <div className="flex h-full w-[415px] shrink-0 flex-col overflow-hidden bg-surface">
        <EditSectionsPanel
          onClose={onRequestExitEdit}
          onAddSection={onAddSection}
          sections={homeContent.sections}
          onSelectHero={() => setLeftView("heroEdit")}
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

  return (
    <div className="flex h-full w-[415px] shrink-0 flex-col overflow-hidden bg-surface">
      {leftView === "landing" ? (
        <LandingPanel onOpen={setLeftView} onPublishMenu={onPublishMenu} publishOpen={publishOpen} />
      ) : (
        <ToolView view={leftView} onBack={() => setLeftView("landing")} />
      )}
    </div>
  );
}

function LandingPanel({
  onOpen,
  onPublishMenu,
  publishOpen,
}: {
  onOpen: (v: LeftView) => void;
  onPublishMenu: () => void;
  publishOpen: boolean;
}) {
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

      {/* Footer */}
      <div className="flex w-[412px] shrink-0 flex-col px-6 pb-8 pt-4">
        <div className="relative flex h-12 items-center justify-end">
          <button className="flex h-12 items-center rounded-l-lg bg-heading px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#063546]">
            Publish Website
          </button>
          <div className="ml-px">
            <button
              onClick={onPublishMenu}
              className="flex h-12 items-center justify-center rounded-r-lg bg-heading px-2 transition-colors hover:bg-[#063546]"
            >
              <ChevronDownIcon size={20} color="#ffffff" />
            </button>
          </div>

          {publishOpen && (
            <div className="absolute bottom-full right-0 z-30 mb-2 w-[220px] rounded-lg border border-border bg-surface p-2 shadow-[0px_4px_6px_rgba(0,0,0,0.08),0px_1px_2px_rgba(0,0,0,0.1)]">
              <MenuRow icon={<CheckIcon size={22} />} label="Save draft" />
            </div>
          )}
        </div>
      </div>
    </>
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
}: {
  onClose: () => void;
  onAddSection: () => void;
  sections: HomeSection[];
  onSelectHero: () => void;
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
          <ReadonlyField
            label="Subheading"
            value={content.heroSubheading}
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
  focusedSection,
  onEditWebsite,
  onCancelEdit,
  onSaveEdit,
  onSelectHero,
  onSelectProjectOverview,
  onAddSection,
  onMoveSection,
  onOpenQuoteModal,
  scrollToSectionId,
  onScrollToSectionHandled,
  previewPage,
  onPreviewPageChange,
  homeContent,
}: {
  overlay: Overlay;
  toggle: (o: Overlay) => void;
  setOverlay: (o: Overlay) => void;
  isEditMode: boolean;
  focusedSection: "hero" | "projectOverview" | null;
  onEditWebsite: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onSelectHero: () => void;
  onSelectProjectOverview: () => void;
  onAddSection: (sectionId: string) => void;
  onMoveSection: (sectionId: string, direction: "up" | "down") => void;
  onOpenQuoteModal: () => void;
  scrollToSectionId: string | null;
  onScrollToSectionHandled: () => void;
  previewPage: PreviewPage;
  onPreviewPageChange: (page: PreviewPage) => void;
  homeContent: HomePageContent;
}) {
  const previewScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollToSectionId || previewPage !== "home") return;

    const frame = requestAnimationFrame(() => {
      const container = previewScrollRef.current;
      const section = document.getElementById(`preview-section-${scrollToSectionId}`);

      if (container && section) {
        const containerRect = container.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        container.scrollTo({
          top: container.scrollTop + sectionRect.top - containerRect.top - 8,
          behavior: "smooth",
        });
      }

      onScrollToSectionHandled();
    });

    return () => cancelAnimationFrame(frame);
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
                    className="flex h-10 items-center rounded-lg bg-heading px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#063546]"
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
                    {previewPage === "home" ? "Home" : "Project showcase"}
                    <ChevronDownIcon size={18} />
                  </button>
                  {overlay === "home" && (
                    <HomeDropdown
                      selectedPage={previewPage}
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

            {/* Website preview */}
            <div
              ref={previewScrollRef}
              className="flex flex-1 items-start justify-center overflow-x-hidden overflow-y-auto pb-12"
            >
              <WebsitePreview
                previewPage={previewPage}
                isEditMode={isEditMode}
                focusedSection={focusedSection}
                onSelectHero={onSelectHero}
                onSelectProjectOverview={onSelectProjectOverview}
                onAddSection={onAddSection}
                onMoveSection={onMoveSection}
                onOpenQuoteModal={onOpenQuoteModal}
                homeContent={homeContent}
              />
            </div>
            {overlay === "quote" && !isEditMode && <QuoteRequestModal onClose={() => setOverlay(null)} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Website preview ----------------------------- */

function WebsitePreview({
  previewPage,
  isEditMode,
  focusedSection,
  onSelectHero,
  onSelectProjectOverview,
  onAddSection,
  onMoveSection,
  onOpenQuoteModal,
  homeContent,
}: {
  previewPage: PreviewPage;
  isEditMode: boolean;
  focusedSection: "hero" | "projectOverview" | null;
  onSelectHero: () => void;
  onSelectProjectOverview: () => void;
  onAddSection: (sectionId: string) => void;
  onMoveSection: (sectionId: string, direction: "up" | "down") => void;
  onOpenQuoteModal: () => void;
  homeContent: HomePageContent;
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

      {homeContent.sections.map((section, index) => (
        <HomePreviewSection
          key={section.id}
          section={section}
          canMoveUp={index > 0}
          canMoveDown={index < homeContent.sections.length - 1}
          isEditMode={isEditMode}
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
        isFocused ? "overflow-hidden rounded-2xl" : ""
      } ${className}`}
    >
      {editable &&
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
    </section>
  );
}

function HomePreviewSection({
  section,
  canMoveUp,
  canMoveDown,
  isEditMode,
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
  focusedSection: "hero" | "projectOverview" | null;
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
              className="w-fit rounded-lg bg-white px-6 py-3 text-[16px] font-semibold text-interactive-subtle hover:bg-[#f1f0e9]"
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
        <button className="rounded-sm bg-brand px-4 py-2 text-[14px] font-semibold leading-[1.25] text-white hover:bg-brand-hover">
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
  onAddSection,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  sectionId: string;
  isEditMode: boolean;
  onAddSection: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <EditableSection
      sectionId={sectionId}
      className="bg-[rgba(56,101,118,0.1)] px-12 py-16"
      editable={isEditMode}
      onAddSection={onAddSection}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
    >
      <div className="flex flex-col items-start gap-8 py-4">
        <div className="flex flex-col items-start justify-center gap-6">
          <span className="bg-[#4e9271] px-3 py-2 text-[14px] font-semibold leading-[1.25] text-white">
            Image Gallery
          </span>
          <h2 className="font-serif text-[30px] font-bold leading-[1.25] text-[#1a1a1a]">
            Get inspired by our work
          </h2>
        </div>
        <div className="grid h-[645px] w-full grid-cols-3 gap-4">
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

function ProjectShowcasePreview({
  isEditMode,
  focusedSection,
  onSelectProjectOverview,
  onAddSection,
}: {
  isEditMode: boolean;
  focusedSection: "hero" | "projectOverview" | null;
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
  onSelectPage,
  onClose,
}: {
  selectedPage: PreviewPage;
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
    { label: "Project showcase", sub: false, value: "projectShowcase" },
    { label: "Lawn mowing", sub: true },
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
              className="h-12 rounded-lg bg-heading px-8 text-[16px] font-semibold text-white transition-colors hover:bg-[#063546]"
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

function AddPageModal({ onClose }: { onClose: () => void }) {
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
              <PageItem key={it.title} {...it} />
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

function PageItem({ title, desc }: { title: string; desc: string }) {
  return (
    <button className="flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors hover:bg-surface-subtle">
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
        <ReadonlyField label="Site Title" value="AwesomeJaya: Trusted painting services in Toronto" />
        <ReadonlyField
          label="Site Description"
          value="AwesomeJaya offers expert interior and exterior painting services in Toronto. Enjoy transparent pricing, clear communication, and fast response times from licensed painters."
        />
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="text-[16px] font-bold leading-[1.11] text-heading">Preview</h3>
        <div className="rounded-lg border border-border p-3">
          <p className="text-[12px] leading-[1.4] text-secondary">awesomejaya.jobbersites.com</p>
          <p className="mt-1 text-[14px] font-medium leading-[1.3] text-[#1a0dab]">
            AwesomeJaya: Trusted painting services in Toronto
          </p>
          <p className="mt-1 text-[12px] leading-[1.4] text-secondary">
            AwesomeJaya offers expert interior and exterior painting services in Toronto. Enjoy transparent
            pricing, clear communication, and fast response times from licensed painters.
          </p>
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
