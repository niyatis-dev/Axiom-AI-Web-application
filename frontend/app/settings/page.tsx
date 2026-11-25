"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SettingsModal from "@/components/SettingsModal";

export default function SettingsPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    router.push("/");
  };

  return (
    <div className="app" style={{ alignItems: "center", justifyContent: "center" }}>
      <SettingsModal
        initialTab="Appearance"
        open={open}
        onClose={handleClose}
      />
    </div>
  );
}
