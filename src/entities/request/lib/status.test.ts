import { describe, expect, it } from "vitest";

import {
  formatDisplayTextForRole,
  getEntityLabel,
  getStatusLabels,
  normalizeStatus,
} from "./status";

describe("request status helpers", () => {
  it("normalizes legacy Thai status text", () => {
    expect(normalizeStatus("การยื่นคำร้องเสร็จสิ้น")).toBe("submitted");
    expect(normalizeStatus("อยู่ระหว่างการดำเนินการ")).toBe("processing");
    expect(normalizeStatus("คำร้องได้รับการอนุมัติ")).toBe("approved");
    expect(normalizeStatus("ถูกยกเลิกคำร้อง (ตีกลับ)")).toBe("rejected");
  });

  it("keeps lecturer wording compatible with legacy copy", () => {
    expect(getEntityLabel("lecturer")).toBe("คำขอ");
    expect(formatDisplayTextForRole("คำร้องได้รับการอนุมัติ", "lecturer")).toBe(
      "คำขอได้รับการอนุมัติ",
    );
    expect(getStatusLabels("lecturer").approved).toBe("คำขอได้รับการอนุมัติ");
  });
});
