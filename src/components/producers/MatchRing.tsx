interface MatchRingProps {
  score: number;
  size?: number;
}

export default function MatchRing({ score, size = 56 }: MatchRingProps) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 85 ? "#1A8C5E" : score >= 70 ? "#DBA508" : score >= 50 ? "#E67E22" : "#C44B4B";

  return (
    <div className="match-ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 56 56" width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle className="match-ring-bg" cx="28" cy="28" r={radius} />
        <circle
          className="match-ring-fill"
          cx="28"
          cy="28"
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="match-ring-score">
        <span className="number">{score}</span>
        <span className="pct">%</span>
        <span className="label">AI MATCH</span>
      </div>
    </div>
  );
}
