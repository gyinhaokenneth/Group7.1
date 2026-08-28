import React, { useState } from 'react';
import { X, Bell, TrendingUp, AlertCircle, Building2, CheckCheck } from 'lucide-react';
import { TabType } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: TabType) => void;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'trend' | 'algorithm' | 'rate';
  read: boolean;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Q3 Residential Yield Benchmark Released',
      description: 'Core Central Region gross rental yield stabilized at 2.9%, with suburban districts offering up to 4.1%.',
      time: '2 hours ago',
      type: 'trend',
      read: false,
    },
    {
      id: 'n3',
      title: 'Model v4.2 Calibration Complete',
      description: 'Our automated appraisal engine now incorporates 14,000 newly lodged caveats across prime central subzones.',
      time: '3 days ago',
      type: 'algorithm',
      read: true,
    },
    {
      id: 'n4',
      title: 'Interest Rate Corridor Update',
      description: 'Central bank benchmark rate steadying triggers compressed cap rate dynamics for freehold landed parcels.',
      time: '5 days ago',
      type: 'rate',
      read: true,
    },
  ]);

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] rounded-sm max-w-md w-full p-6 shadow-2xl border border-[#1A1A1A]/15 relative animate-scaleUp">
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3 mb-4">
          <div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7355] block mb-0.5">
              Intel & Briefings
            </span>
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-[#8C7355]" />
              <h3 className="font-serif text-[22px] font-light text-[#1A1A1A]">
                Market Dispatches
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-[#1A1A1A]/60 hover:text-[#8C7355] cursor-pointer flex items-center gap-1 transition-colors"
            >
              <CheckCheck size={13} />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#1A1A1A]/60 hover:text-[#1A1A1A] rounded-sm hover:bg-[#E2DFD8]/40 cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.type === 'trend') {
                  onClose();
                  onNavigateTab('trends');
                }
              }}
              className={`p-3.5 rounded-sm border transition-all cursor-pointer ${
                item.read
                  ? 'bg-[#F5F2ED]/40 border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:border-[#1A1A1A]/25'
                  : 'bg-[#FFFFFF] border-[#8C7355]/40 shadow-xs text-[#1A1A1A] hover:border-[#8C7355]'
              }`}
            >
              <div className="flex justify-between items-start gap-2 mb-1">
                <h4 className="font-serif text-[14px] font-medium flex items-center gap-2">
                  {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-[#8C7355] shrink-0" />}
                  <span>{item.title}</span>
                </h4>
                <span className="font-sans text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 whitespace-nowrap">{item.time}</span>
              </div>
              <p className="font-serif text-[13px] text-[#1A1A1A]/70 leading-relaxed pl-3.5">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-4 mt-4 border-t border-[#1A1A1A]/10 text-center">
          <button
            onClick={onClose}
            className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-[#8C7355] transition-colors cursor-pointer"
          >
            Dismiss Briefing
          </button>
        </div>
      </div>
    </div>
  );
};
