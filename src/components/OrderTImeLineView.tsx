import React from 'react';
import { format } from 'date-fns-tz';

interface TimelineItem {
  status: string;
  timeStamp: string | Date;
  updatedBy: string;
  updatedByUserId: string;
}

interface OrderTimelineProps {
  timeline?: TimelineItem[];
}

const OrderTimelineView: React.FC<OrderTimelineProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="w-[90vw] px-2 py-2 overflow-x-auto align-top">
      <div className="flex space-x-6 relative min-w-max">
        {timeline.map((item, index) => {
          const timeIST = format(new Date(item.timeStamp), "dd MMM yy, hh:mm a", {
            timeZone: 'Asia/Kolkata',
          });

          return (
            <div
              key={index}
              className="flex flex-col items-center text-center relative min-w-[120px]"
            >
              <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow mb-1 z-10" />

              {index < timeline.length - 1 && (
                <div className="absolute top-1.5 left-full w-8 h-0.5 bg-gray-300 z-0" />
              )}

              <div className="text-xs text-gray-600">{timeIST}</div>
              <div className="text-xs font-semibold text-gray-800 mt-1">{item.status}</div>
              <div className="text-[11px] text-gray-500">by {item.updatedBy}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimelineView;
