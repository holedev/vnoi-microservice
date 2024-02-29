export const getBgSubmitByScore = (score) => {
    if (score >= 8) {
        return "#07bc0c";
    } else if (score >= 6) {
        return "#3498db";
    } else if (score >= 4) {
        return "#f1c40f";
    } else return "#e74c3c";
};
