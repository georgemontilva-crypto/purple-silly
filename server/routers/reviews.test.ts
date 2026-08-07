import { describe, expect, it } from "vitest";
import { z } from "zod";
import { reviewFields } from "./reviews";
import { reviews } from "../../drizzle/schema";

const schema = z.object(reviewFields);

const valid = {
  authorName: "Michael W.",
  rating: 5,
  title: "SillyDots",
  body: "Silly Dots are really awesome from the Mega Dose to the Hero Dose.",
  productName: "Silly Dots Hero Dose 1800mg",
  verified: true,
  active: true,
};

describe("review input schema", () => {
  it("accepts a fully populated review", () => {
    expect(schema.parse(valid)).toMatchObject(valid);
  });

  /**
   * The storefront draws `rating` as a count of filled stars, so anything
   * outside 1-5 or with a fraction would render something nonsensical.
   */
  it("bounds the rating to whole stars from 1 to 5", () => {
    for (const rating of [1, 3, 5]) {
      expect(() => schema.parse({ ...valid, rating })).not.toThrow();
    }
    for (const rating of [0, 6, -1, 4.5]) {
      expect(
        () => schema.parse({ ...valid, rating }),
        String(rating)
      ).toThrow();
    }
  });

  it("treats productName as the only optional field", () => {
    const { productName, ...withoutProduct } = valid;
    expect(() => schema.parse(withoutProduct)).not.toThrow();

    for (const key of [
      "authorName",
      "rating",
      "title",
      "body",
      "verified",
      "active",
    ] as const) {
      const { [key]: _dropped, ...missing } = valid;
      expect(
        () => schema.parse(missing),
        `"${key}" should be required`
      ).toThrow();
    }
  });

  it("rejects empty strings where the card would render a blank", () => {
    for (const key of ["authorName", "title", "body"] as const) {
      expect(() => schema.parse({ ...valid, [key]: "" }), key).toThrow();
    }
  });

  it("keeps every string inside its column width", () => {
    expect(() =>
      schema.parse({ ...valid, authorName: "a".repeat(128) })
    ).not.toThrow();
    expect(() =>
      schema.parse({ ...valid, authorName: "a".repeat(129) })
    ).toThrow();
    expect(() =>
      schema.parse({ ...valid, title: "a".repeat(256) })
    ).not.toThrow();
    expect(() => schema.parse({ ...valid, title: "a".repeat(257) })).toThrow();
    expect(() =>
      schema.parse({ ...valid, productName: "a".repeat(256) })
    ).not.toThrow();
    expect(() =>
      schema.parse({ ...valid, productName: "a".repeat(257) })
    ).toThrow();
  });

  /**
   * The seeded reviews are real customer copy and contain apostrophes, an
   * ampersand-and-symbols title, and a Unicode ellipsis. Whatever the
   * schema does, it must not reject the very data the table ships with.
   */
  it("accepts the real seeded reviews verbatim", () => {
    const seeded = [
      {
        title: "The super doses are amazing",
        body: "The super doses are amazing. Def don't take all three if you are a lightweight",
      },
      {
        title: "Holy @#$&",
        body: "These things are amazing. I took all 3 and I could hear my voice echo.",
      },
      {
        title: "Not sure what it is, but it's pretty nice",
        body: "Makes me feel like I'm floating kinda and very carefree… very nice after a long day of work.",
      },
    ];
    for (const s of seeded) {
      expect(() => schema.parse({ ...valid, ...s }), s.title).not.toThrow();
    }
  });
});

describe("reviews columns", () => {
  it("leaves the image pair and productName optional", () => {
    // A review with no photo has to render as well as one with, so nothing
    // downstream may assume these are present.
    expect(reviews.imageKey.notNull).toBe(false);
    expect(reviews.imageUrl.notNull).toBe(false);
    expect(reviews.productName.notNull).toBe(false);
  });

  it("requires the parts every card actually prints", () => {
    expect(reviews.authorName.notNull).toBe(true);
    expect(reviews.title.notNull).toBe(true);
    expect(reviews.body.notNull).toBe(true);
    expect(reviews.rating.notNull).toBe(true);
  });
});
