const StatisticsService = {
  handleEvent: async (payload) => {
    const { action, data } = payload;

    console.log(action, data);
  }
};

export { StatisticsService };
