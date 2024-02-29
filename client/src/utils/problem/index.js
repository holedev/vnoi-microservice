export const getLevelString = (level) => {
    switch (level) {
        case 0:
            return "Easy";
        case 1:
            return "Medium";
        case 2:
            return "Hard";
        default:
            return "---";
    }
};
