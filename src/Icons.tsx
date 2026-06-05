type IconProps = { size?: number; className?: string; color?: string };

const base = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  className,
});

export const CloseIcon = ({ size = 20, className, color = "#233D48" }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </svg>
);

export const MonitorIcon = ({ size = 20, className, color = "#233D48" }: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="3" y="4" width="18" height="12" rx="1.5" stroke={color} strokeWidth={1.8} />
    <path d="M9 20h6M12 16v4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

export const SmartphoneIcon = ({ size = 20, className, color = "#233D48" }: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="7" y="2.5" width="10" height="19" rx="2" stroke={color} strokeWidth={1.8} />
    <path d="M10.5 18.5h3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

export const MoreIcon = ({ size = 20, className, color = "#233D48" }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="5" cy="12" r="1.8" fill={color} />
    <circle cx="12" cy="12" r="1.8" fill={color} />
    <circle cx="19" cy="12" r="1.8" fill={color} />
  </svg>
);

export const PencilIcon = ({ size = 20, className, color = "#233D48" }: IconProps) => (
  <svg {...base(size, className)}>
    <path
      d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <path d="M13.5 6.5l4 4" stroke={color} strokeWidth={1.8} />
  </svg>
);

export const PhoneIcon = ({ size = 20, className, color = "#233D48" }: IconProps) => (
  <svg {...base(size, className)}>
    <path
      d="M6.5 4h3l1.2 4-2 1.3a11 11 0 0 0 5 5l1.3-2 4 1.2v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </svg>
);

export const MenuIcon = ({ size = 24, className, color = "#233D48" }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M4 7h16M4 12h16M4 17h16" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </svg>
);

export const PlusIcon = ({ size = 20, className, color = "#ffffff" }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
  </svg>
);

export const ChevronDownIcon = ({ size = 20, className, color = "#233D48" }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M6 9l6 6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const MegaphoneIcon = ({ size = 22, className, color = "#032B3A" }: IconProps) => (
  <svg {...base(size, className)}>
    <path
      d="M4 10v4a1 1 0 0 0 1 1h2l2 4h2v-4l8 3V6L11 9H5a1 1 0 0 0-1 1z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </svg>
);

export const TrashIcon = ({ size = 22, className, color = "#C0341D" }: IconProps) => (
  <svg {...base(size, className)}>
    <path
      d="M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13M10 11v6M14 11v6"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CheckIcon = ({ size = 22, className, color = "#388523" }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M5 13l4 4L19 7" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronLeftIcon = ({ size = 20, className, color = "#233D48" }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M15 6l-6 6 6 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowUpIcon = ({ size = 20, className, color = "#233D48" }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M12 19V5M6 11l6-6 6 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowDownIcon = ({ size = 20, className, color = "#233D48" }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M12 5v14M6 13l6 6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const MicIcon = ({ size = 20, className, color = "#5d757e" }: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="9" y="3" width="6" height="11" rx="3" stroke={color} strokeWidth={1.8} />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

export const ImageIcon = ({ size = 20, className, color = "#233D48" }: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="4" y="5" width="16" height="14" rx="2" stroke={color} strokeWidth={1.8} />
    <circle cx="9" cy="10" r="1.5" fill={color} />
    <path d="M6.5 17l4.2-4.2 2.5 2.5 1.5-1.5L18 17" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
  </svg>
);
