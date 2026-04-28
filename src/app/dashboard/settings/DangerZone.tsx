"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAccount } from "@/actions/settings";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";

export default function DangerZone() {
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAccount();
      if (result.success) {
        router.push("/auth/login");
      }
    });
  }

  return (
    <section>
      <h2 className="text-[16px] font-bold text-[#C44B4B] mb-4">Danger zone</h2>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[14px] font-bold">Delete account</p>
          <p className="text-[13px] text-[#888]">
            Permanently delete your profile and all data
          </p>
        </div>
        <Button variant="danger" onClick={() => setShowModal(true)}>
          Delete account
        </Button>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Delete account">
        <p className="text-[14px] text-[#888] mb-4">
          This will permanently delete your profile, bookings, credits, clips, and all
          associated data. This action cannot be undone.
        </p>
        <p className="text-[14px] text-[#111] font-bold mb-3">
          Type DELETE to confirm:
        </p>
        <Input
          placeholder="DELETE"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
        />
        <div className="flex gap-3 mt-4">
          <Button
            variant="danger"
            fullWidth
            disabled={confirmText !== "DELETE" || isPending}
            loading={isPending}
            onClick={handleDelete}
          >
            Permanently delete
          </Button>
          <Button variant="outline" fullWidth onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </section>
  );
}
