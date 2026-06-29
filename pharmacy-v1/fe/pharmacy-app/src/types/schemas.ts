import { z } from 'zod';

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Vui lòng nhập Email" })
    .email({ message: "Email không hợp lệ" }),
  password: z
    .string()
    .min(6, { message: "Mật khẩu phải từ 6 ký tự" }),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Vui lòng nhập mật khẩu hiện tại" }),
  newPassword: z.string().min(6, { message: "Mật khẩu mới phải có ít nhất 6 ký tự" }),
  confirmPassword: z.string().min(1, { message: "Vui lòng xác nhận mật khẩu" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"], // Gán lỗi vào trường confirmPassword
});

export const EditProfileSchema = z.object({
  username: z.string().min(2, { message: "Tên hiển thị phải từ 2 ký tự" }),
});

export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>;
export type LoginFormData = z.infer<typeof LoginSchema>;
export type EditProfileFormData = z.infer<typeof EditProfileSchema>;
