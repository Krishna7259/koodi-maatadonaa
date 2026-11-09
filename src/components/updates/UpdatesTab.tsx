import React, { useState } from 'react';
import { Plus, Camera, Edit3, CircleDot, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStatus } from '../../context/StatusContext';
import { StatusStory } from '../../types';
import { CreateStatusModal } from './CreateStatusModal';
import { StatusViewerModal } from './StatusViewerModal';
import { formatDistanceToNow } from 'date-fns';

export const UpdatesTab: React.FC = () => {
  const { userProfile } = useAuth();
  const { statuses, myStatuses } = useStatus();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewerStories, setViewerStories] = useState<StatusStory[]>([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Group other users' statuses by userId
  const groupedStatuses: Record<string, StatusStory[]> = {};
  statuses.forEach((s) => {
    if (!groupedStatuses[s.userId]) {
      groupedStatuses[s.userId] = [];
    }
    groupedStatuses[s.userId].push(s);
  });

  // Separate into recent and viewed
  const recentUpdates: StatusStory[][] = [];
  const viewedUpdates: StatusStory[][] = [];

  Object.values(groupedStatuses).forEach((userStories) => {
    // If all stories in this group have been viewed by userProfile
    const allViewed = userStories.every((st) =>
      st.viewers?.some((v) => v.uid === userProfile?.uid)
    );
    if (allViewed) {
      viewedUpdates.push(userStories);
    } else {
      recentUpdates.push(userStories);
    }
  });

  const openViewerFor = (storiesToView: StatusStory[]) => {
    setViewerStories(storiesToView);
    setIsViewerOpen(true);
  };

  const formatUpdateTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Today';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111B21] border-r border-[#E9EDEF] dark:border-[#222E35]">
      {/* Header */}
      <div className="h-16 px-4 bg-[#F0F2F5] dark:bg-[#202C33] flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold text-[#111B21] dark:text-[#E9EDEF]">Updates</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCreateOpen(true)}
            title="Create status"
            className="p-2 text-[#54656F] dark:text-[#AEBAC1] hover:bg-gray-200 dark:hover:bg-[#374248] rounded-full transition-colors"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Status List */}
      <div className="flex-1 overflow-y-auto">
        {/* My Status */}
        <div className="p-3 border-b border-[#E9EDEF] dark:border-[#222E35]">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F5F6F6] dark:hover:bg-[#202C33] transition-colors cursor-pointer group">
            {/* My Avatar */}
            <div
              onClick={() => {
                if (myStatuses.length > 0) openViewerFor(myStatuses);
                else setIsCreateOpen(true);
              }}
              className="relative w-12 h-12 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
            >
              <div
                className={`w-full h-full rounded-full overflow-hidden p-0.5 ${
                  myStatuses.length > 0 ? 'border-2 border-[#25D366]' : ''
                }`}
              >
                <div className="w-full h-full rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-[#075E54] dark:text-[#25D366] font-bold overflow-hidden">
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt={userProfile.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{userProfile?.displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>

              {/* Add Icon badge if no status or quick add */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCreateOpen(true);
                }}
                className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#128C7E] text-white flex items-center justify-center border-2 border-white dark:border-[#111B21] shadow-sm hover:scale-110 transition-transform"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
              </button>
            </div>

            {/* Info */}
            <div
              className="flex-1 min-w-0"
              onClick={() => {
                if (myStatuses.length > 0) openViewerFor(myStatuses);
                else setIsCreateOpen(true);
              }}
            >
              <h3 className="text-sm font-semibold text-[#111B21] dark:text-[#E9EDEF]">My Status</h3>
              <p className="text-xs text-[#667781] dark:text-[#8696A0] truncate">
                {myStatuses.length > 0
                  ? `${myStatuses.length} update${myStatuses.length > 1 ? 's' : ''} • Tap to view`
                  : 'Tap to add status update'}
              </p>
            </div>

            {/* Edit / Add Button */}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="p-2 text-[#54656F] dark:text-[#AEBAC1] hover:bg-gray-200 dark:hover:bg-[#374248] rounded-full transition-colors"
              title="Add text status"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Recent Updates */}
        {recentUpdates.length > 0 && (
          <div className="py-2">
            <h4 className="text-xs font-bold text-[#075E54] dark:text-[#25D366] px-4 py-2 uppercase tracking-wider">
              Recent updates
            </h4>
            {recentUpdates.map((group) => {
              const latest = group[0];
              return (
                <div
                  key={latest.userId}
                  onClick={() => openViewerFor(group)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5F6F6] dark:hover:bg-[#202C33] transition-colors cursor-pointer"
                >
                  <div className="relative w-12 h-12 rounded-full p-0.5 border-2 border-[#25D366] shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-[#075E54] dark:text-[#25D366] font-bold">
                      {latest.userPhoto ? (
                        <img src={latest.userPhoto} alt={latest.userName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{latest.userName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-[#111B21] dark:text-[#E9EDEF] truncate">
                      {latest.userName}
                    </h5>
                    <p className="text-xs text-[#667781] dark:text-[#8696A0]">
                      {formatUpdateTime(latest.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Viewed Updates */}
        {viewedUpdates.length > 0 && (
          <div className="py-2 border-t border-[#E9EDEF] dark:border-[#222E35]">
            <h4 className="text-xs font-bold text-[#667781] dark:text-[#8696A0] px-4 py-2 uppercase tracking-wider">
              Viewed updates
            </h4>
            {viewedUpdates.map((group) => {
              const latest = group[0];
              return (
                <div
                  key={latest.userId}
                  onClick={() => openViewerFor(group)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5F6F6] dark:hover:bg-[#202C33] transition-colors cursor-pointer opacity-75 hover:opacity-100"
                >
                  <div className="relative w-12 h-12 rounded-full p-0.5 border-2 border-gray-300 dark:border-gray-600 shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#667781] dark:text-[#8696A0] font-bold">
                      {latest.userPhoto ? (
                        <img src={latest.userPhoto} alt={latest.userName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{latest.userName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-[#111B21] dark:text-[#E9EDEF] truncate">
                      {latest.userName}
                    </h5>
                    <p className="text-xs text-[#667781] dark:text-[#8696A0]">
                      {formatUpdateTime(latest.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state if no updates */}
        {recentUpdates.length === 0 && viewedUpdates.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-[#128C7E] mb-3">
              <CircleDot className="w-8 h-8 stroke-[1.8]" />
            </div>
            <p className="text-sm font-semibold text-[#111B21] dark:text-[#E9EDEF]">No recent updates</p>
            <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1 max-w-xs">
              Status updates from your contacts will appear here and disappear after 24 hours.
            </p>
          </div>
        )}
      </div>

      {/* Status Creation Modal */}
      <CreateStatusModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      {/* Status Viewer Modal */}
      <StatusViewerModal
        isOpen={isViewerOpen}
        stories={viewerStories}
        onClose={() => setIsViewerOpen(false)}
      />
    </div>
  );
};

