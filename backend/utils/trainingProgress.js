const roundNumber = (value, digits = 2) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Number(number.toFixed(digits));
};

export const calculateTrainingProgressStats = (progressRecord = {}) => {
  const modules = Array.isArray(progressRecord?.modules) ? progressRecord.modules : [];

  let totalModules = 0;
  let completedModules = 0;
  let totalVideos = 0;
  let completedVideos = 0;
  const completedVideoIds = new Set();

  modules.forEach((module) => {
    totalModules += 1;
    if (module?.pass) completedModules += 1;

    const videos = Array.isArray(module?.videos) ? module.videos : [];
    videos.forEach((video) => {
      totalVideos += 1;
      const videoKey = String(video?.videoId || video?._id || '');

      if (video?.pass && (!videoKey || !completedVideoIds.has(videoKey))) {
        completedVideos += 1;
        if (videoKey) completedVideoIds.add(videoKey);
      }
    });
  });

  const moduleCompletionPercentage =
    totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
  const videoCompletionPercentage =
    totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
  const weightedPercentage =
    totalModules > 0 || totalVideos > 0
      ? moduleCompletionPercentage * 0.4 + videoCompletionPercentage * 0.6
      : progressRecord?.pass
        ? 100
        : 0;

  return {
    totalModules,
    completedModules,
    totalVideos,
    completedVideos,
    moduleCompletionPercentage: roundNumber(moduleCompletionPercentage),
    videoCompletionPercentage: roundNumber(videoCompletionPercentage),
    progressPercentage: Math.round(weightedPercentage),
    progressPercentagePrecise: roundNumber(weightedPercentage),
    progressPercentageText: `${roundNumber(weightedPercentage).toFixed(2)}%`,
  };
};
