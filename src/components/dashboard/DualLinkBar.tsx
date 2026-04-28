import CopyButton from "./CopyButton";

interface DualLinkBarProps {
  slug: string;
  bookingKey: string;
}

export default function DualLinkBar({ slug, bookingKey }: DualLinkBarProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const publicUrl = `${baseUrl}/crew/${slug}`;
  const privateUrl = `${baseUrl}/crew/${slug}?key=${bookingKey}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Public */}
      <div className="border border-[#EEE] rounded-lg px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888]">
            PUBLIC PAGE
          </p>
          <p className="text-[13px] text-[#888] mt-0.5 truncate">
            crewconnect.com/crew/{slug}
          </p>
        </div>
        <CopyButton text={publicUrl} />
      </div>

      {/* Private */}
      <div className="border border-[#DBA508] rounded-lg px-4 py-3 flex items-center justify-between bg-[#FFFDF5]">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#DBA508]">
            PRIVATE - FOR PRODUCERS
          </p>
          <p className="text-[13px] text-[#888] mt-0.5 truncate">
            crewconnect.com/crew/{slug}?key={bookingKey}
          </p>
        </div>
        <CopyButton text={privateUrl} />
      </div>
    </div>
  );
}
