// --- CallBookingModal.tsx (Simple Mockup)
import React from "react";
import { Button } from "@/components/ui/button";

const CallBookingModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-2">Schedule a Call</h2>
        <p className="text-sm text-gray-500 mb-4">
          Our fashion expert will call you to assist with your order.
        </p>
        {/* Insert slot picker or contact form */}
        <Button className="w-full mb-2">Confirm Slot</Button>
        <Button variant="outline" className="w-full" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CallBookingModal;
