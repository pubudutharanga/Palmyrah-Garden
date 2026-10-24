import { describe, expect, it } from "vitest";

import { escapeCsv, toCsv } from "@/lib/prototype/csv";

describe("CSV escaping", () => {
  it("leaves plain values alone and preserves numbers", () => {
    expect(escapeCsv("PGR-7K3M9Q")).toBe("PGR-7K3M9Q");
    expect(escapeCsv(973_500)).toBe("973500");
    expect(escapeCsv(null)).toBe("");
    expect(escapeCsv(undefined)).toBe("");
  });

  it("quotes commas, double quotes and line breaks", () => {
    expect(escapeCsv("Perera, Nimal")).toBe('"Perera, Nimal"');
    expect(escapeCsv('A "quiet" room')).toBe('"A ""quiet"" room"');
    expect(escapeCsv("line one\nline two")).toBe('"line one\nline two"');
    expect(escapeCsv("line one\r\nline two")).toBe('"line one\r\nline two"');
  });

  it("neutralises spreadsheet formulas", () => {
    expect(escapeCsv("=1+1")).toBe("'=1+1");
    expect(escapeCsv("+94 77 123 4567")).toBe("'+94 77 123 4567");
    expect(escapeCsv("-10")).toBe("'-10");
    expect(escapeCsv("@SUM(A1:A2)")).toBe("'@SUM(A1:A2)");
    expect(escapeCsv("\t=1+1")).toBe("'\t=1+1");
  });

  it("builds CRLF rows with headers", () => {
    expect(
      toCsv(
        ["Reference", "Guest", "Note"],
        [
          ["PGR-1", "Nimal", "Perera, Nimal"],
          ["PGR-2", 'A "quiet" room', "=1+1"],
        ],
      ),
    ).toBe(
      'Reference,Guest,Note\r\nPGR-1,Nimal,"Perera, Nimal"\r\nPGR-2,"A ""quiet"" room",\'=1+1',
    );
  });
});
