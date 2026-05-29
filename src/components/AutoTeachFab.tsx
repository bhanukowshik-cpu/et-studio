"use client";

type Props = {
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "progress";
};

export default function AutoTeachFab({
  onClick,
  disabled,
  variant = "default",
}: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Rainbow halo glow — softer, full-spectrum gradient backdrop */}
      <span
        aria-hidden
        className={`absolute -inset-1.5 rounded-full blur-xl ${
          disabled ? "opacity-15" : "opacity-40"
        }`}
        style={{
          background:
            "conic-gradient(from 0deg, #FF8FA3 0deg, #FFB073 50deg, #FFE285 100deg, #B2E29B 150deg, #82D3F4 200deg, #A99CF2 250deg, #E29CE0 300deg, #FF8FA3 360deg)",
        }}
      />
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label="Auto Teach"
        className={`relative w-[56px] h-[56px] rounded-full bg-white shadow-[0_2px_6px_rgba(16,24,40,0.08)] flex items-center justify-center transition-transform
          ${variant === "progress" ? "opacity-90" : ""}
          ${disabled ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(16,24,40,0.10)]"}`}
      >
        <SparkleIcon />
        {variant === "progress" && !disabled && (
          <span className="absolute inset-0 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        )}
      </button>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sparkleFill" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#FFB142" />
          <stop offset="60%" stopColor="#FF9A52" />
          <stop offset="100%" stopColor="#F47B2C" />
        </linearGradient>
      </defs>
      {/* 4-pointed star (sparkle) */}
      <path
        d="M12 2.5 C 12.6 8 16 11.4 21.5 12 C 16 12.6 12.6 16 12 21.5 C 11.4 16 8 12.6 2.5 12 C 8 11.4 11.4 8 12 2.5 Z"
        fill="url(#sparkleFill)"
      />
    </svg>
  );
}
