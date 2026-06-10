function Svg({ size = 22, children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const HomeIcon = ({ size }) => (
  <Svg size={size}>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h5v-6h4v6h5V10" />
  </Svg>
);

export const ClockIcon = ({ size }) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);

export const PlusIcon = ({ size }) => (
  <Svg size={size}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const CapIcon = ({ size }) => (
  <Svg size={size}>
    <path d="M3 9l9-4 9 4-9 4-9-4z" />
    <path d="M7 11v4c0 1 2.5 2.5 5 2.5s5-1.5 5-2.5v-4" />
  </Svg>
);

export const UserIcon = ({ size }) => (
  <Svg size={size}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </Svg>
);

export const SunIcon = ({ size }) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
  </Svg>
);

export const MoonIcon = ({ size }) => (
  <Svg size={size}>
    <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
  </Svg>
);

export const GlobeIcon = ({ size }) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
  </Svg>
);

export const PlayIcon = ({ size }) => (
  <Svg size={size}>
    <path d="M7 5v14l11-7z" />
  </Svg>
);

export const PauseIcon = ({ size }) => (
  <Svg size={size}>
    <path d="M9 5v14M15 5v14" />
  </Svg>
);

export const PrevIcon = ({ size }) => (
  <Svg size={size}>
    <path d="M15 6l-6 6 6 6" />
  </Svg>
);

export const NextIcon = ({ size }) => (
  <Svg size={size}>
    <path d="M9 6l6 6-6 6" />
  </Svg>
);

export const RestartIcon = ({ size }) => (
  <Svg size={size}>
    <path d="M4 4v6h6" />
    <path d="M20 12a8 8 0 1 0-2.3 5.7" />
  </Svg>
);

export const CheckIcon = ({ size }) => (
  <Svg size={size}>
    <path d="M4 12l5 5L20 6" />
  </Svg>
);

