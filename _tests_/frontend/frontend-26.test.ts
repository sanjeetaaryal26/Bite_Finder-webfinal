// @ts-nocheck
import {
  forgotPassword,
  resetPassword,
} from "../../lib/auth";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  getFoodFavorites,
  addFoodFavorite,
  removeFoodFavorite,
} from "../../lib/favorites";
import {
  getRestaurants,
  filterRestaurants,
  getRestaurantById,
  createRestaurant,
  searchRestaurants,
  getNearbyRestaurants,
  getTrendingRestaurants,
  getMostSavedRestaurants,
  getTopFoodByDistrict,
  getRecommendations,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../../lib/restaurants";
import { getAdminStats } from "../../lib/admin";
import { validateImageFile, getPresignedUrl } from "../../lib/upload";

jest.mock("../../lib/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  getAccessToken: jest.fn(() => "test-token"),
}));

const { default: api } = require("../../lib/api");

describe("Frontend test suite (26 tests)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("1. forgotPassword posts email to forgot-password endpoint", async () => {
    api.post.mockResolvedValue({ data: { success: true, message: "sent" } });
    await forgotPassword("user@example.com");
    expect(api.post).toHaveBeenCalledWith("/auth/forgot-password", { email: "user@example.com" });
  });

  it("2. resetPassword posts token and password", async () => {
    api.post.mockResolvedValue({ data: { success: true, message: "ok" } });
    await resetPassword("abc", "newPass123");
    expect(api.post).toHaveBeenCalledWith("/auth/reset-password/abc", { password: "newPass123" });
  });

  it("3. getFavorites fetches favorites list", async () => {
    const rows = [{ _id: "f1" }];
    api.get.mockResolvedValue({ data: { data: rows } });
    await expect(getFavorites()).resolves.toEqual(rows);
    expect(api.get).toHaveBeenCalledWith("/favorites");
  });

  it("4. addFavorite posts restaurant id", async () => {
    const row = { _id: "f1" };
    api.post.mockResolvedValue({ data: { data: row } });
    await expect(addFavorite("r1")).resolves.toEqual(row);
    expect(api.post).toHaveBeenCalledWith("/favorites/r1");
  });

  it("5. removeFavorite calls delete endpoint", async () => {
    api.delete.mockResolvedValue({});
    await removeFavorite("r1");
    expect(api.delete).toHaveBeenCalledWith("/favorites/r1");
  });

  it("6. getFoodFavorites fetches food favorites", async () => {
    const rows = [{ _id: "ff1" }];
    api.get.mockResolvedValue({ data: { data: rows } });
    await expect(getFoodFavorites()).resolves.toEqual(rows);
    expect(api.get).toHaveBeenCalledWith("/food-favorites");
  });

  it("7. addFoodFavorite posts restaurant and food id", async () => {
    const row = { _id: "ff1" };
    api.post.mockResolvedValue({ data: { data: row } });
    await expect(addFoodFavorite("r1", "food1")).resolves.toEqual(row);
    expect(api.post).toHaveBeenCalledWith("/food-favorites/r1/food1");
  });

  it("8. removeFoodFavorite calls delete endpoint", async () => {
    api.delete.mockResolvedValue({});
    await removeFoodFavorite("r1", "food1");
    expect(api.delete).toHaveBeenCalledWith("/food-favorites/r1/food1");
  });

  it("9. getRestaurants passes query params and returns list payload", async () => {
    const payload = { restaurants: [], pagination: { page: 1 } };
    api.get.mockResolvedValue({ data: { data: payload } });
    await expect(getRestaurants({ page: 1, limit: 10 })).resolves.toEqual(payload);
    expect(api.get).toHaveBeenCalledWith("/restaurants", { params: { page: 1, limit: 10 } });
  });

  it("10. filterRestaurants returns raw response data", async () => {
    const payload = { success: true, data: [] };
    api.get.mockResolvedValue({ data: payload });
    await expect(filterRestaurants({ district: "Kathmandu" })).resolves.toEqual(payload);
    expect(api.get).toHaveBeenCalledWith("/restaurants/filter", { params: { district: "Kathmandu" } });
  });

  it("11. getRestaurantById calls id endpoint", async () => {
    const payload = { _id: "r1" };
    api.get.mockResolvedValue({ data: { data: payload } });
    await expect(getRestaurantById("r1")).resolves.toEqual(payload);
    expect(api.get).toHaveBeenCalledWith("/restaurants/r1");
  });

  it("12. createRestaurant posts payload", async () => {
    const payload = { _id: "r1", name: "Test" };
    api.post.mockResolvedValue({ data: { data: payload } });
    await expect(
      createRestaurant({ name: "Test", location: { coordinates: [85.3, 27.7] } })
    ).resolves.toEqual(payload);
    expect(api.post).toHaveBeenCalled();
  });

  it("13. searchRestaurants sends food search params", async () => {
    const payload = { restaurants: [], pagination: { page: 1 } };
    api.get.mockResolvedValue({ data: { data: payload } });
    await expect(searchRestaurants({ food: "momo", page: 1 })).resolves.toEqual(payload);
    expect(api.get).toHaveBeenCalledWith("/restaurants/search", { params: { food: "momo", page: 1 } });
  });

  it("14. getNearbyRestaurants sends coordinates", async () => {
    const payload: any[] = [];
    api.get.mockResolvedValue({ data: { data: payload } });
    await expect(getNearbyRestaurants({ lng: 85.3, lat: 27.7 })).resolves.toEqual(payload);
    expect(api.get).toHaveBeenCalledWith("/restaurants/nearby", { params: { lng: 85.3, lat: 27.7 } });
  });

  it("15. getTrendingRestaurants includes limit when provided", async () => {
    const payload: any[] = [];
    api.get.mockResolvedValue({ data: { data: payload } });
    await expect(getTrendingRestaurants(5)).resolves.toEqual(payload);
    expect(api.get).toHaveBeenCalledWith("/restaurants/trending", { params: { limit: 5 } });
  });

  it("16. getTrendingRestaurants omits params when limit is missing", async () => {
    const payload: any[] = [];
    api.get.mockResolvedValue({ data: { data: payload } });
    await expect(getTrendingRestaurants()).resolves.toEqual(payload);
    expect(api.get).toHaveBeenCalledWith("/restaurants/trending", { params: undefined });
  });

  it("17. getMostSavedRestaurants includes limit param", async () => {
    const payload: any[] = [];
    api.get.mockResolvedValue({ data: { data: payload } });
    await expect(getMostSavedRestaurants(3)).resolves.toEqual(payload);
    expect(api.get).toHaveBeenCalledWith("/restaurants/most-saved", { params: { limit: 3 } });
  });

  it("18. getTopFoodByDistrict sends district param", async () => {
    const payload: any[] = [];
    api.get.mockResolvedValue({ data: { data: payload } });
    await expect(getTopFoodByDistrict("Lalitpur")).resolves.toEqual(payload);
    expect(api.get).toHaveBeenCalledWith("/restaurants/top-food", { params: { district: "Lalitpur" } });
  });

  it("19. getRecommendations calls recommendations endpoint", async () => {
    const payload: any[] = [];
    api.get.mockResolvedValue({ data: { data: payload } });
    await expect(getRecommendations()).resolves.toEqual(payload);
    expect(api.get).toHaveBeenCalledWith("/recommendations");
  });

  it("20. getMyReviews calls /reviews/me endpoint", async () => {
    const payload: any[] = [];
    api.get.mockResolvedValue({ data: { data: payload } });
    await expect(getMyReviews()).resolves.toEqual(payload);
    expect(api.get).toHaveBeenCalledWith("/reviews/me");
  });

  it("21. createReview posts rating/comment payload", async () => {
    const payload = { _id: "rev1" };
    api.post.mockResolvedValue({ data: { data: payload } });
    await expect(createReview("r1", { rating: 5, comment: "Great" })).resolves.toEqual(payload);
    expect(api.post).toHaveBeenCalledWith("/reviews/r1", { rating: 5, comment: "Great" });
  });

  it("22. updateReview puts partial review payload", async () => {
    const payload = { _id: "rev1", rating: 4 };
    api.put.mockResolvedValue({ data: { data: payload } });
    await expect(updateReview("rev1", { rating: 4 })).resolves.toEqual(payload);
    expect(api.put).toHaveBeenCalledWith("/reviews/rev1", { rating: 4 });
  });

  it("23. deleteReview hits delete endpoint", async () => {
    api.delete.mockResolvedValue({});
    await deleteReview("rev1");
    expect(api.delete).toHaveBeenCalledWith("/reviews/rev1");
  });

  it("24. getAdminStats calls admin stats endpoint", async () => {
    const payload = { totalUsers: 10 };
    api.get.mockResolvedValue({ data: { data: payload } });
    await expect(getAdminStats()).resolves.toEqual(payload);
    expect(api.get).toHaveBeenCalledWith("/admin/stats");
  });

  it("25. validateImageFile rejects unsupported mime type", () => {
    const badFile = { type: "application/pdf", size: 100 } as File;
    expect(validateImageFile(badFile)).toBe("Allowed types: JPEG, PNG, WebP");
  });

  it("26. getPresignedUrl throws when backend returns unsuccessful payload", async () => {
    api.post.mockResolvedValue({ data: { success: false, message: "Nope", data: null } });
    await expect(getPresignedUrl("x.png", "image/png", "restaurants")).rejects.toThrow("Nope");
  });
});

