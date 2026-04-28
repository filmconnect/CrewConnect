"use client";

import { useActionState, useState } from "react";
import { updateProfile } from "@/actions/crew";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { ActionResult } from "@/types";

interface ProfileData {
  name: string;
  role: string;
  city: string;
  country: string;
  bio: string;
  dayRate?: number;
  rateIncludesEquipment: boolean;
  equipment: string;
  languages: string;
  vimeoUrl: string;
  youtubeUrl: string;
  imdbUrl: string;
  websiteUrl: string;
  avatarUrl: string;
}

const initialState: ActionResult = { success: false };

export default function ProfileForm({ profile }: { profile: ProfileData }) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState);
  const [rateInclEquip, setRateInclEquip] = useState(profile.rateIncludesEquipment);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl);
  const [avatarUploading, setAvatarUploading] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const { uploadAvatar } = await import("@/actions/avatar");
      const result = await uploadAvatar(fd);
      if (result.success && result.data) {
        setAvatarPreview(result.data);
      }
    } finally {
      setAvatarUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-8">
      {/* Basic info */}
      <section>
        <h2 className="text-[16px] font-bold text-[#DBA508] mb-4">Basic info</h2>

        <div className="flex items-start gap-4 mb-5">
          {/* Avatar upload */}
          <div className="w-[80px] h-[80px] rounded-lg bg-[#111] flex items-center justify-center text-white text-[24px] font-bold shrink-0 relative overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2)
            )}
            <label className="absolute bottom-1 right-1 w-6 h-6 bg-[#FAFAFA] rounded-full flex items-center justify-center text-[10px] text-[#888] border border-[#EEE] cursor-pointer hover:bg-white transition-colors">
              {avatarUploading ? "…" : "📷"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="sr-only"
              />
            </label>
          </div>
          <div className="flex-1">
            <Input
              name="name"
              label="Full Name"
              defaultValue={profile.name}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            name="role"
            label="Primary Role"
            defaultValue={profile.role}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              name="city"
              label="City"
              defaultValue={profile.city}
              placeholder="Zagreb"
            />
            <Input
              name="country"
              label="Country"
              defaultValue={profile.country}
              placeholder="Croatia"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] block mb-1.5">
            Biography
          </label>
          <textarea
            name="bio"
            defaultValue={profile.bio}
            placeholder="Tell producers about yourself, your experience, and your style..."
            rows={4}
            maxLength={500}
            className="w-full border border-[#EEE] rounded-md px-3 py-3 text-[14px] text-[#111] placeholder:text-[#CCC] focus:outline-none focus:border-[#111] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] block mb-1.5">
              Equipment{" "}
              <span className="normal-case text-[#BBB] tracking-normal font-normal">
                (optional - leave empty if you don&apos;t bring gear)
              </span>
            </label>
            <textarea
              name="equipment"
              defaultValue={profile.equipment}
              rows={4}
              placeholder="ARRI Alexa Mini LF&#10;Zeiss Supereme Primes"
              className="w-full border border-[#EEE] rounded-md px-3 py-3 text-[14px] text-[#111] placeholder:text-[#CCC] focus:outline-none focus:border-[#111] resize-none"
            />
          </div>
          <div className="space-y-4">
            <Input
              name="dayRate"
              label="Day Rate (€)"
              type="number"
              defaultValue={profile.dayRate !== undefined ? String(profile.dayRate) : ""}
              placeholder="550"
              min={0}
            />
            {/* Rate includes equipment toggle */}
            <div
              className={`rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                rateInclEquip
                  ? "bg-[#FFF8E1] border border-[#F5E6A3]"
                  : "bg-[#FAFAFA] border border-[#EEE]"
              }`}
              onClick={() => setRateInclEquip(!rateInclEquip)}
            >
              <div>
                <p className="text-[13px] font-medium text-[#111]">
                  Rate includes equipment
                </p>
                <p className="text-[11px] text-[#888] mt-0.5">
                  Your day rate covers you + your gear
                </p>
              </div>
              <div
                className={`w-10 h-6 rounded-full relative transition-colors ${
                  rateInclEquip ? "bg-[#111]" : "bg-[#DDD]"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                    rateInclEquip ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </div>
              <input
                type="hidden"
                name="rateIncludesEquipment"
                value={rateInclEquip ? "on" : ""}
              />
            </div>
          </div>
        </div>

        <Input
          name="languages"
          label="Languages"
          defaultValue={profile.languages}
          placeholder="Croatian, English, German"
        />
      </section>

      {/* Links */}
      <section>
        <h2 className="text-[16px] font-bold text-[#DBA508] mb-4">Links</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="vimeoUrl"
            label="Vimeo"
            defaultValue={profile.vimeoUrl}
            placeholder="vimeo.com/yourname"
          />
          <Input
            name="youtubeUrl"
            label="YouTube"
            defaultValue={profile.youtubeUrl}
            placeholder="youtube.com/@yourname"
          />
          <Input
            name="imdbUrl"
            label="IMDb"
            defaultValue={profile.imdbUrl}
            placeholder="imdb.com/name/nm1234567"
          />
          <Input
            name="websiteUrl"
            label="Website"
            defaultValue={profile.websiteUrl}
            placeholder="yourwebsite.com"
          />
        </div>
      </section>

      {/* Submit */}
      {state.error ? (
        <p className="text-[13px] text-[#C44B4B]">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-[13px] text-[#1A8C5E]">Profile saved!</p>
      ) : null}

      <Button type="submit" variant="gold" loading={isPending}>
        Save profile
      </Button>
    </form>
  );
}
