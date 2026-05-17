/**
 * KHÁI NIỆM: Value Object — Task Title
 *
 * VALUE OBJECT là gì:
 * 1. IMMUTABLE: Một khi tạo ra, không thể thay đổi giá trị
 * 2. EQUALITY BY VALUE: So sánh bằng giá trị, không phải reference
 *    → new TaskTitle('A') === new TaskTitle('A') (về mặt logic)
 * 3. SELF-VALIDATING: Validate ngay khi tạo, không cho tạo object invalid
 * 4. NO IDENTITY: Không có ID, chỉ quan tâm giá trị
 *
 * TẠI SAO dùng Value Object thay vì plain string:
 * - string cho phép bất kỳ giá trị nào ('', '   ', string 10000 ký tự)
 * - TaskTitle đảm bảo LUÔN hợp lệ → không cần validate lại ở nơi khác
 * - Business rules nằm TẠI chỗ, không rải rác
 *
 * SO SÁNH Entity vs Value Object:
 * ┌──────────┬────────────────────┬─────────────────────┐
 * │          │ Entity             │ Value Object        │
 * ├──────────┼────────────────────┼─────────────────────┤
 * │ Identity │ CÓ (id)           │ KHÔNG               │
 * │ Equality │ So sánh bằng ID    │ So sánh bằng VALUE  │
 * │ Mutable  │ CÓ THỂ thay đổi   │ KHÔNG (immutable)   │
 * │ Ví dụ    │ User, Task, Order  │ Email, Money, Title │
 * └──────────┴────────────────────┴─────────────────────┘
 *
 * LỖI PHỔ BIẾN:
 * - Dùng primitive types (string, number) cho business concepts → mất validation
 * - Value Object có setter → vi phạm immutability
 */
export class TaskTitle {
  /**
   * Private constructor: KHÔNG cho phép tạo trực tiếp bằng new TaskTitle()
   * Bắt buộc dùng static factory method create() → đảm bảo luôn validate
   */
  private constructor(private readonly value: string) {
    Object.freeze(this); // Đóng băng object, không cho modify
  }

  /**
   * Factory method: Tạo TaskTitle với validation
   * Throw error nếu invalid → caller biết ngay, không tạo được object sai
   */
  static create(title: string): TaskTitle {
    if (!title || title.trim().length === 0) {
      throw new Error('Task title không được để trống');
    }
    if (title.trim().length > 200) {
      throw new Error('Task title không được quá 200 ký tự');
    }
    return new TaskTitle(title.trim());
  }

  /** Lấy giá trị primitive (khi cần lưu DB hoặc serialize) */
  getValue(): string {
    return this.value;
  }

  /** Value equality: So sánh 2 TaskTitle bằng giá trị */
  equals(other: TaskTitle): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
