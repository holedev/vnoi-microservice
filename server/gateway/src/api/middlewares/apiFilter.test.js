import { apiFilter } from "./apiFilter";

describe("apiFilter middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      path: "/api/users",
      url: "/api/users"
    };
    res = {};
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should modify req.url if req.path starts with /api", () => {
    apiFilter(req, res, next);

    expect(req.url).toBe("/users");
    expect(next).toHaveBeenCalled();
  });

  it("Should not modify req.url if req.path does not start with /api", () => {
    req.path = "/public/users";

    apiFilter(req, res, next);

    expect(req.url).toBe("/api/users");
    expect(next).toHaveBeenCalled();
  });
});
