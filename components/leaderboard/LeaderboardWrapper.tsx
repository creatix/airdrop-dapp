import { useState } from "react";
import { screenWidth } from "@/lib/helpers";
import { useMediaQuery } from "usehooks-ts";
import { motion } from "framer-motion";
import Leaderboard from "./Leaderboard";

const leaderboardTimeRanges = [
  {
    name: "All-Time",
    mobile: true
  },
  {
    name: "Last 30 days",
    mobile: true
  },
  {
    name: "Last 7 days",
    mobile: true
  },
  {
    name: "Last 24 hrs",
    mobile: false
  },
]

const LeaderboardWrapper = () => {
  const [selectedLeaderboardTimeRange, setSelectedLeaderboardTimeRange] = useState(leaderboardTimeRanges[0].name);
  const matches = useMediaQuery(`(min-width: ${screenWidth.EXTRA_LARGE + 1}px)`);

  return (
    <motion.div
      className="w-8/9 flex flex-col mt-[65px] mb-[187px] xl:mt-[52px] xl:mb-[150px] xl:w-9/12 md:w-9/10 max-w-7xl"
      key="dashboard"
      initial={{
        y: -300,
        opacity: 0
      }}
      animate={{
        y: 0,
        opacity: 1
      }}
      exit={{
        y: 300,
        opacity: 0
      }}
      transition= {{
        staggerChildren: 0.3,
      }}
    >
      <div className="flex flex-col">
        <div className="flex flex-row md:flex-col justify-between items-end md:items-start gap-2 mb-[31px] xl:mb-6">
          <p className="text-3xl xl:text-2xl text-white font-semibold">
            Leaderboard
          </p>
          <div className="flex gap-2">
            {leaderboardTimeRanges.map((leaderboardTimeRange) =>
              (!matches && !leaderboardTimeRange.mobile ? false : true) && (
                <motion.p
                  key={leaderboardTimeRange.name}
                  className={`transition-all ease-in-out duration-300 text-lg xl:text-base font-semibold ${selectedLeaderboardTimeRange === leaderboardTimeRange.name ? "text-white" : "text-monsoon cursor-pointer"}`}
                  onClick={() => setSelectedLeaderboardTimeRange(leaderboardTimeRange.name)}
                >
                  {leaderboardTimeRange.name}
                </motion.p>
              )
            )}
          </div>
        </div>
        <Leaderboard />
      </div>
    </motion.div>
  )
}

export default LeaderboardWrapper;
