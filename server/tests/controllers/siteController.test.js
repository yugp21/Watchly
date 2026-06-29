require("../setupTestDB");
const request = require("supertest");
const app = require("../../app");

jest.mock("../../services/scraper");
jest.mock("../../services/mailService");

const { scrapeText } = require("../../services/scraper");
const { sendChangeAlert } = require("../../services/mailService");

const createAuthedAccount = async () => {
  const res = await request(app).post("/api/accounts/create").send({});
  return res.body.data;
};

describe("Site API", () => {
  let auth;
  let headers;

  beforeEach(async () => {
    auth = await createAuthedAccount();
    headers = { Authorization: `Bearer ${auth.username}:${auth.token}` };
    scrapeText.mockReset();
    sendChangeAlert.mockReset();
  });

  describe("POST /api/sites", () => {
    it("returns 400 for invalid email", async () => {
      const res = await request(app)
        .post("/api/sites")
        .set(headers)
        .send({
          url: "https://example.com",
          email: "bad-email",
          checkInterval: 1,
        });
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid checkInterval", async () => {
      const res = await request(app)
        .post("/api/sites")
        .set(headers)
        .send({
          url: "https://example.com",
          email: "a@b.com",
          checkInterval: 3,
        });
      expect(res.status).toBe(400);
    });

    it("creates a site with active status when scrape succeeds", async () => {
      scrapeText.mockResolvedValue("some page content here");
      const res = await request(app)
        .post("/api/sites")
        .set(headers)
        .send({
          url: "https://example.com",
          email: "a@b.com",
          checkInterval: 1,
        });
      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe("active");
    });

    it("creates a site with unreachable status when scrape fails", async () => {
      scrapeText.mockRejectedValue(new Error("fail"));
      const res = await request(app)
        .post("/api/sites")
        .set(headers)
        .send({
          url: "https://example.com",
          email: "a@b.com",
          checkInterval: 1,
        });
      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe("unreachable");
    });

    it("returns 409 for duplicate URL on same account", async () => {
      scrapeText.mockResolvedValue("content");
      await request(app)
        .post("/api/sites")
        .set(headers)
        .send({ url: "https://dupe.com", email: "a@b.com", checkInterval: 1 });
      const res = await request(app)
        .post("/api/sites")
        .set(headers)
        .send({ url: "https://dupe.com", email: "a@b.com", checkInterval: 1 });
      expect(res.status).toBe(409);
    });

    it("returns 403 when monitor limit (20) is reached", async () => {
      scrapeText.mockResolvedValue("content");
      for (let i = 0; i < 20; i++) {
        await request(app)
          .post("/api/sites")
          .set(headers)
          .send({
            url: `https://site${i}.com`,
            email: "a@b.com",
            checkInterval: 1,
          });
      }
      const res = await request(app)
        .post("/api/sites")
        .set(headers)
        .send({
          url: "https://site21.com",
          email: "a@b.com",
          checkInterval: 1,
        });
      expect(res.status).toBe(403);
    });

    it("truncates label to 60 characters", async () => {
      scrapeText.mockResolvedValue("content");
      const longLabel = "x".repeat(100);
      const res = await request(app)
        .post("/api/sites")
        .set(headers)
        .send({
          url: "https://labeltest.com",
          email: "a@b.com",
          checkInterval: 1,
          label: longLabel,
        });
      expect(res.body.data.label.length).toBe(60);
    });
  });

  describe("DELETE /api/sites/:id", () => {
    it("returns 404 if site not found or not owned by user", async () => {
      const res = await request(app)
        .delete("/api/sites/000000000000000000000000")
        .set(headers);
      expect(res.status).toBe(404);
    });

    it("deletes a site successfully", async () => {
      scrapeText.mockResolvedValue("content");
      const create = await request(app)
        .post("/api/sites")
        .set(headers)
        .send({
          url: "https://deleteme.com",
          email: "a@b.com",
          checkInterval: 1,
        });
      const id = create.body.data._id;
      const res = await request(app).delete(`/api/sites/${id}`).set(headers);
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/sites/check-now/:id", () => {
    it("returns 404 if site not found", async () => {
      const res = await request(app)
        .post("/api/sites/check-now/000000000000000000000000")
        .set(headers);
      expect(res.status).toBe(404);
    });

    it("marks site unreachable if scrape fails on check-now", async () => {
      scrapeText.mockResolvedValueOnce("content");
      const create = await request(app)
        .post("/api/sites")
        .set(headers)
        .send({
          url: "https://checknow1.com",
          email: "a@b.com",
          checkInterval: 1,
        });
      const id = create.body.data._id;

      scrapeText.mockRejectedValueOnce(new Error("down"));
      const res = await request(app)
        .post(`/api/sites/check-now/${id}`)
        .set(headers);
      expect(res.status).toBe(200);
      expect(res.body.unreachable).toBe(true);
    });

    it("detects a change, sends alert, and updates hash", async () => {
      scrapeText.mockResolvedValueOnce("original content");
      const create = await request(app)
        .post("/api/sites")
        .set(headers)
        .send({
          url: "https://checknow2.com",
          email: "a@b.com",
          checkInterval: 1,
        });
      const id = create.body.data._id;

      // Simulate email being verified before alert can be sent
      const Site = require("../../models/Site");
      await Site.findByIdAndUpdate(id, { emailVerified: true });

      scrapeText.mockResolvedValueOnce("changed content here");
      const res = await request(app)
        .post(`/api/sites/check-now/${id}`)
        .set(headers);
      expect(res.status).toBe(200);
      expect(res.body.changed).toBe(true);
      expect(sendChangeAlert).toHaveBeenCalled();
    });

    it("reports no change and does not send an email", async () => {
      scrapeText.mockResolvedValue("same content every time");
      const create = await request(app)
        .post("/api/sites")
        .set(headers)
        .send({
          url: "https://checknow3.com",
          email: "a@b.com",
          checkInterval: 1,
        });
      const id = create.body.data._id;
      const res = await request(app)
        .post(`/api/sites/check-now/${id}`)
        .set(headers);
      expect(res.status).toBe(200);
      expect(res.body.changed).toBe(false);
      expect(sendChangeAlert).not.toHaveBeenCalled();
    });

    it("caps changeHistory at 10 entries", async () => {
      scrapeText.mockResolvedValueOnce("v0");
      const create = await request(app)
        .post("/api/sites")
        .set(headers)
        .send({
          url: "https://history.com",
          email: "a@b.com",
          checkInterval: 1,
        });
      const id = create.body.data._id;

      for (let i = 1; i <= 12; i++) {
        scrapeText.mockResolvedValueOnce(`version ${i}`);
        await request(app).post(`/api/sites/check-now/${id}`).set(headers);
      }

      const res = await request(app).get("/api/sites").set(headers);
      const site = res.body.data.find((s) => s._id === id);
      expect(site.changeHistory.length).toBeLessThanOrEqual(10);
    });
  });
});
