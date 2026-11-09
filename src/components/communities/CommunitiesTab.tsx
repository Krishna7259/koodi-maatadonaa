import React from 'react';
import { Users, Plus, ChevronRight, MessageSquare, Megaphone, Shield } from 'lucide-react';

interface CommunitiesTabProps {
  onOpenNewGroup: () => void;
}

export const CommunitiesTab: React.FC<CommunitiesTabProps> = ({ onOpenNewGroup }) => {
  const sampleCommunities = [
    {
      id: 'comm-1',
      name: 'Koodi Maatadona Hub',
      description: 'Official announcements and community discussions for Koodi Maatadona users.',
      membersCount: 42,
      channels: [
        { name: 'Announcements', type: 'announcement', unread: 2 },
        { name: 'General Discussion', type: 'chat', unread: 0 },
        { name: 'Tech & Architecture', type: 'chat', unread: 0 },
      ],
    },
    {
      id: 'comm-2',
      name: 'Bengaluru Tech & AI Guild',
      description: 'Developers, designers and AI enthusiasts building modern real-time systems.',
      membersCount: 128,
      channels: [
        { name: 'Announcements', type: 'announcement', unread: 0 },
        { name: 'React & Mobile Devs', type: 'chat', unread: 5 },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111B21] border-r border-[#E9EDEF] dark:border-[#222E35]">
      {/* Header */}
      <div className="h-16 px-4 bg-[#F0F2F5] dark:bg-[#202C33] flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold text-[#111B21] dark:text-[#E9EDEF]">Communities</h1>
        <button
          onClick={onOpenNewGroup}
          title="New community"
          className="p-2 text-[#54656F] dark:text-[#AEBAC1] hover:bg-gray-200 dark:hover:bg-[#374248] rounded-full transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Intro Banner */}
        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-[#E9EDEF] dark:border-[#222E35]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#128C7E] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[#111B21] dark:text-[#E9EDEF]">
                Stay connected with a Community
              </h3>
              <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-0.5 leading-relaxed">
                Communities bring members together in topic-based groups, and make it easy to manage admin announcements.
              </p>
              <button
                onClick={onOpenNewGroup}
                className="mt-3 px-3.5 py-1.5 bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Start a community
              </button>
            </div>
          </div>
        </div>

        {/* Communities List */}
        <div className="divide-y divide-[#E9EDEF] dark:divide-[#222E35]">
          {sampleCommunities.map((comm) => (
            <div key={comm.id} className="p-4 hover:bg-[#F5F6F6] dark:hover:bg-[#202C33]/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {comm.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-[#111B21] dark:text-[#E9EDEF] truncate">
                    {comm.name}
                  </h4>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] truncate mt-0.5">
                    {comm.description}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                    {comm.membersCount} members
                  </p>
                </div>
              </div>

              {/* Channels */}
              <div className="mt-3 pl-4 space-y-1 border-l-2 border-[#128C7E]/30 dark:border-[#25D366]/30">
                {comm.channels.map((ch, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#202C33] cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2 text-[#111B21] dark:text-[#E9EDEF]">
                      {ch.type === 'announcement' ? (
                        <Megaphone className="w-3.5 h-3.5 text-[#128C7E] shrink-0" />
                      ) : (
                        <MessageSquare className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      )}
                      <span className="font-medium">{ch.name}</span>
                    </div>

                    {ch.unread > 0 && (
                      <span className="px-1.5 py-0.5 bg-[#25D366] text-[#075E54] text-[10px] font-bold rounded-full">
                        {ch.unread}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

