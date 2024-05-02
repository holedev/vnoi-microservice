export const getLevelString = (level) => {
  switch (level) {
    case 0:
      return 'Easy';
    case 1:
      return 'Medium';
    case 2:
      return 'Hard';
    default:
      return '---';
  }
};

export const _PROBLEM_STATUS = {
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
};

export const _PROBLEM_LEVEL = {
  EASY: 0,
  MEDIUM: 1,
  HARD: 2,
};
