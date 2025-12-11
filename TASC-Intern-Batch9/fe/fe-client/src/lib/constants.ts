export const REGEX = {
  // Email chuẩn
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Số điện thoại Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09)
  PHONE_VN: /^(0[3|5|7|8|9])+([0-9]{8})$/,
  
  // Mật khẩu: Tối thiểu 6 ký tự (Có thể thêm yêu cầu chữ hoa/số nếu muốn)
  PASSWORD_MIN_LENGTH: 6
};