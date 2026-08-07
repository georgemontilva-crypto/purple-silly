import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  ALLOWED_ATTACHMENT_TYPES,
  APPLICATION_STATUSES,
  DISTRIBUTOR_TYPES,
  MAX_ATTACHMENT_BYTES,
  attachmentKey,
  wholesaleFields,
} from "./wholesale";
import { wholesaleApplications } from "../../drizzle/schema";

const schema = z.object(wholesaleFields);

const valid = {
  businessName: "Green Leaf Provisions",
  dba: "Green Leaf",
  firstName: "Ada",
  lastName: "Okoro",
  phone: "+1 555 010 2030",
  email: "ada@greenleaf.example",
  address: "18 Harbour Road, Suite 4",
  city: "Portland",
  state: "Oregon",
  postalCode: "97205",
  country: "United States",
  distributorType: "2-5 Store" as const,
};

describe("wholesale application schema", () => {
  it("accepts a complete application without the optional fields", () => {
    expect(schema.parse(valid)).toMatchObject(valid);
  });

  it("treats only notes and the attachment as optional", () => {
    for (const key of [
      "businessName",
      "dba",
      "firstName",
      "lastName",
      "phone",
      "email",
      "address",
      "city",
      "state",
      "postalCode",
      "country",
      "distributorType",
    ] as const) {
      const { [key]: _dropped, ...missing } = valid;
      expect(
        () => schema.parse(missing),
        `"${key}" should be required`
      ).toThrow();
    }
    expect(() => schema.parse({ ...valid, notes: undefined })).not.toThrow();
    expect(() =>
      schema.parse({ ...valid, notes: "Two stores, opening a third." })
    ).not.toThrow();
  });

  it("rejects blanks where a required field would store an empty string", () => {
    for (const key of [
      "businessName",
      "dba",
      "firstName",
      "city",
      "postalCode",
    ] as const) {
      expect(() => schema.parse({ ...valid, [key]: "" }), key).toThrow();
    }
  });

  it("requires a real email address", () => {
    expect(() =>
      schema.parse({ ...valid, email: "ada-at-greenleaf" })
    ).toThrow();
  });

  it("accepts every distributor type the form offers, and nothing else", () => {
    for (const distributorType of DISTRIBUTOR_TYPES) {
      expect(() => schema.parse({ ...valid, distributorType })).not.toThrow();
    }
    expect(() =>
      schema.parse({ ...valid, distributorType: "10+ Store" })
    ).toThrow();
  });

  /**
   * status is deliberately absent from wholesaleFields: the submit
   * endpoint is public, and an applicant must not be able to post
   * themselves in as "approved".
   */
  it("does not let the public payload carry a status", () => {
    expect("status" in wholesaleFields).toBe(false);
    expect(schema.parse({ ...valid, status: "approved" })).not.toHaveProperty(
      "status"
    );
  });

  it("keeps every string inside its column width", () => {
    expect(() =>
      schema.parse({ ...valid, businessName: "a".repeat(256) })
    ).not.toThrow();
    expect(() =>
      schema.parse({ ...valid, businessName: "a".repeat(257) })
    ).toThrow();
    expect(() =>
      schema.parse({ ...valid, postalCode: "a".repeat(32) })
    ).not.toThrow();
    expect(() =>
      schema.parse({ ...valid, postalCode: "a".repeat(33) })
    ).toThrow();
    expect(() =>
      schema.parse({ ...valid, address: "a".repeat(512) })
    ).not.toThrow();
    expect(() =>
      schema.parse({ ...valid, address: "a".repeat(513) })
    ).toThrow();
  });
});

describe("attachment object keys", () => {
  it("files every upload under one prefix", () => {
    expect(attachmentKey("licence.pdf")).toMatch(/^wholesale\//);
  });

  it("keeps a plain extension, and normalises its case", () => {
    expect(attachmentKey("licence.PDF")).toMatch(/\.pdf$/);
    expect(attachmentKey("storefront.jpeg")).toMatch(/\.jpeg$/);
  });

  /**
   * The filename comes from an unauthenticated browser on a public form —
   * the most exposed upload path in the app. None of it may reach the key
   * except an extension that survives the pattern.
   */
  it("never lets a crafted filename escape the prefix", () => {
    const nasty = [
      "../../etc/passwd",
      "licence.pdf?acl=public-read",
      "licence.pdf/../../evil",
      "a." + "x".repeat(200),
      "no-extension",
      "trailing.",
      "weird.p df",
      "../../../wholesale/../secrets.pdf",
    ];
    for (const name of nasty) {
      const key = attachmentKey(name);
      expect(key, name).toMatch(/^wholesale\/[0-9]+-[a-z0-9]+\.[a-z0-9]{1,5}$/);
      expect(key, name).not.toContain("..");
      expect(key, name).not.toContain("?");
    }
  });

  it("does not collide across repeated uploads of one file", () => {
    const keys = new Set(
      Array.from({ length: 50 }, () => attachmentKey("licence.pdf"))
    );
    expect(keys.size).toBe(50);
  });
});

describe("attachment limits", () => {
  it("allows the document types a retailer actually sends", () => {
    expect(ALLOWED_ATTACHMENT_TYPES).toContain("application/pdf");
    expect(ALLOWED_ATTACHMENT_TYPES).toContain("image/jpeg");
    expect(ALLOWED_ATTACHMENT_TYPES).toContain(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  });

  it("caps attachments at 10MB", () => {
    expect(MAX_ATTACHMENT_BYTES).toBe(10 * 1024 * 1024);
  });
});

describe("wholesale_applications columns", () => {
  it("stores each address part separately so the CSV can be sorted", () => {
    for (const col of [
      "address",
      "city",
      "state",
      "postalCode",
      "country",
    ] as const) {
      expect(wholesaleApplications[col].notNull, col).toBe(true);
    }
  });

  it("leaves notes and the attachment nullable", () => {
    expect(wholesaleApplications.notes.notNull).toBe(false);
    expect(wholesaleApplications.fileKey.notNull).toBe(false);
    expect(wholesaleApplications.fileUrl.notNull).toBe(false);
    expect(wholesaleApplications.fileName.notNull).toBe(false);
  });

  it("starts every application at the front of the pipeline", () => {
    expect(wholesaleApplications.status.default).toBe("new");
    expect(APPLICATION_STATUSES[0]).toBe("new");
  });

  it("defaults country to United States, as the form does", () => {
    expect(wholesaleApplications.country.default).toBe("United States");
  });
});
