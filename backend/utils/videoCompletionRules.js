import Module from '../model/Module.js';

export const getVideoAssessmentInfo = async (videoId) => {
  const module = await Module.findOne({ "videos._id": videoId });
  const video = module?.videos?.find((item) => item._id.toString() === videoId);
  const questions = Array.isArray(video?.questions) ? video.questions : [];

  return {
    module,
    video,
    hasQuestions: questions.length > 0,
    totalQuestions: questions.length,
  };
};

export const refreshTrainingProgressStatus = (trainingProgress) => {
  let anyStarted = false;

  trainingProgress.modules.forEach((module) => {
    const videos = Array.isArray(module.videos) ? module.videos : [];

    videos.forEach((video) => {
      if (
        video.pass ||
        video.assessmentCompleted ||
        Number(video.watchPercentage || 0) > 0 ||
        Number(video.watchTime || 0) > 0
      ) {
        anyStarted = true;
      }
    });

    const modulePassed = videos.length > 0 && videos.every((video) => video.pass === true);
    module.pass = modulePassed;
    if (modulePassed && !module.completedAt) {
      module.completedAt = new Date();
    }
    if (!modulePassed) {
      module.completedAt = undefined;
    }
  });

  const allModulesPassed =
    trainingProgress.modules.length > 0 &&
    trainingProgress.modules.every((module) => module.pass === true);

  trainingProgress.pass = allModulesPassed;
  if (allModulesPassed) {
    trainingProgress.status = 'Completed';
    trainingProgress.completedAt = trainingProgress.completedAt || new Date();
  } else {
    trainingProgress.status = anyStarted ? 'In Progress' : 'Pending';
    trainingProgress.completedAt = undefined;
  }

  return {
    allModulesPassed,
    anyStarted,
  };
};

export const applyWatchCompletionRule = (progressVideo, assessmentInfo) => {
  const hasQuestions = Boolean(assessmentInfo?.hasQuestions);
  progressVideo.assessmentRequired = hasQuestions;

  if (hasQuestions) {
    progressVideo.pass = progressVideo.assessmentPassed === true;
    if (!progressVideo.pass) {
      progressVideo.completedAt = undefined;
    }
    return {
      completed: progressVideo.pass,
      requiresAssessment: true,
    };
  }

  if (Number(progressVideo.watchPercentage || 0) >= 90) {
    progressVideo.pass = true;
    progressVideo.completedAt = progressVideo.completedAt || new Date();
  }

  return {
    completed: progressVideo.pass === true,
    requiresAssessment: false,
  };
};
