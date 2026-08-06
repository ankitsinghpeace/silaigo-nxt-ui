// src/pages/CallConfirmation.tsx or wherever your route points
"use client";

import { useRouter } from "@/lib/next-router-compat";
import React, { useEffect, useState } from "react";
import ScissorLoader from "@/components/ui/loader";

const CallScheduleConfirmation: React.FC = () => {
  const router = useRouter();

  const date = router.query.date;
  const time = router.query.time;

  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setShowLoader(false), 2600);
    return () => clearTimeout(timeout);
  }, []);

  if (showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <ScissorLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-green-600">
          Call Scheduled Successfully!
        </h1>
        <p className="text-lg text-gray-700 mb-2">
          Our sales team will reach out to you on:
        </p>
        <p className="text-lg font-medium text-gray-900 mb-2">
          <span className="font-semibold">Date:</span> {date}
        </p>
        <p className="text-lg font-medium text-gray-900 mb-2">
          <span className="font-semibold">Time:</span> {time}
        </p>
        <p className="text-md text-gray-600">
          We hope you have a great experience. Our team is excited to speak with
          you!
        </p>
      </div>
    </div>
  );
};

export default CallScheduleConfirmation;
