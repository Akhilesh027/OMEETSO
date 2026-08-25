import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { InfinityLoader } from "./components/omeetso/InfinityLoader";

export const getRouter = (queryClient: QueryClient) => {
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: () => <InfinityLoader variant="page" text="Loading Omeetso..." subtext="Buy Nearby • Sell Quickly" />,
  });

  return router;
};

