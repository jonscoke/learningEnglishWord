import { Suspense, lazy, useMemo, useState } from "react";
import { Box, Center, Spinner } from "@chakra-ui/react";
import BottomNav from "./components/layout/BottomNav";

const LearnPage = lazy(() => import("./pages/LearnPage"));
const PracticePage = lazy(() => import("./pages/PracticePage"));
const ProgressPage = lazy(() => import("./pages/ProgressPage"));

const App = () => {
  const [activeTab, setActiveTab] = useState("learn");

  const page = useMemo(() => {
    if (activeTab === "practice") {
      return <PracticePage />;
    }

    if (activeTab === "progress") {
      return <ProgressPage />;
    }

    return <LearnPage />;
  }, [activeTab]);

  return (
    <Box minH="100vh">
      <Suspense
        fallback={
          <Center minH="60vh">
            <Spinner color="teal.500" thickness="4px" />
          </Center>
        }
      >
        {page}
      </Suspense>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </Box>
  );
};

export default App;