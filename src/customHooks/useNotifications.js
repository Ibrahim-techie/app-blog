import { useEffect } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSelector } from "react-redux";
import notificationservice from "../services/notification.service";
import { subscribeWithCleanup } from "../utils/realtime";

const PAGE_SIZE = 10;

// Marking everything read sends one realtime event per notification, so
// changes that land close together are collapsed into a single refetch.
const REFETCH_DELAY = 250;

/**
 * The signed-in user's notifications: the unread count for the bell, the
 * list for the panel (only fetched while it's open), and the actions to mark
 * them read.
 *
 * Realtime marks both stale whenever a notification arrives, is read or is
 * removed, and TanStack Query refetches — the server stays the source of
 * truth, in this tab and every other one.
 */
function useNotifications({ open = false } = {}) {
  const userId = useSelector((state) => state.auth.userData?.$id);
  const queryClient = useQueryClient();

  const unread = useQuery({
    queryKey: ["notifications", userId, "unread"],
    queryFn: () => notificationservice.getUnreadCount(userId),
    enabled: Boolean(userId),
  });

  const list = useInfiniteQuery({
    queryKey: ["notifications", userId, "list"],
    queryFn: ({ pageParam }) =>
      notificationservice.getNotifications({
        userId,
        lastId: pageParam,
        limit: PAGE_SIZE,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage) =>
      lastPage.rows.length < PAGE_SIZE ? undefined : lastPage.rows.at(-1).$id,
    enabled: Boolean(userId) && open,
  });

  useEffect(() => {
    if (!userId) return;

    let timer;
    const unsubscribe = subscribeWithCleanup(
      notificationservice.subscribeToNotifications(() => {
        clearTimeout(timer);
        timer = setTimeout(
          () =>
            queryClient.invalidateQueries({
              queryKey: ["notifications", userId],
            }),
          REFETCH_DELAY,
        );
      }),
    );

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [userId, queryClient]);

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["notifications", userId] });

  const markRead = useMutation({
    mutationFn: (notificationId) =>
      notificationservice.markRead(notificationId),
    onSettled: refresh,
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationservice.markAllRead(userId),
    onSettled: refresh,
  });

  return {
    unreadCount: unread.data ?? 0,
    notifications: list.data?.pages.flatMap((page) => page.rows) ?? [],
    isPending: list.isPending,
    isError: list.isError,
    refetch: list.refetch,
    hasNextPage: list.hasNextPage,
    isFetchingNextPage: list.isFetchingNextPage,
    fetchNextPage: list.fetchNextPage,
    markRead: markRead.mutate,
    markAllRead: markAllRead.mutate,
    isMarkingAll: markAllRead.isPending,
  };
}

export default useNotifications;
