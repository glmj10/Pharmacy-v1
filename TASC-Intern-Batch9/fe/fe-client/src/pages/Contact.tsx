import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, Phone, Mail, Clock, Send, Loader2, Facebook, Instagram, Youtube } from 'lucide-react';
import Breadcrumb from '../components/common/BreadCrumb';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';
import { REGEX } from '../lib/constants';

interface ContactFormInputs {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const Contact: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormInputs>({
    mode: 'onBlur'
  });

  const onSubmit = async (data: ContactFormInputs) => {
    setIsSubmitting(true);
    // Giả lập gọi API gửi liên hệ
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Contact Data:", data);
    toast.success("Gửi thành công", "Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất!");
    reset();
    setIsSubmitting(false);
  };

  const breadcrumbItems = [
    { label: "Liên hệ" }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-10">
      
      {/* 1. HEADER BANNER */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb items={breadcrumbItems} className="mb-4" />
          <h1 className="text-3xl font-bold text-slate-900">Liên hệ với chúng tôi</h1>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Pharmacy luôn sẵn sàng lắng nghe ý kiến đóng góp cũng như giải đáp thắc mắc của bạn về sản phẩm và dịch vụ.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 2. CỘT TRÁI: THÔNG TIN LIÊN HỆ */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Info Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-slate-900 mb-6 border-l-4 border-primary pl-3">
                Thông tin liên lạc
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-primary rounded-full shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 mb-1">Địa chỉ</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      123 Đường Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-full shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 mb-1">Điện thoại</p>
                    <p className="text-sm text-gray-600">
                      <a href="tel:1900123456" className="hover:text-primary transition">1900 123 456</a> (Tư vấn)
                    </p>
                    <p className="text-sm text-gray-600">
                      <a href="tel:0912345678" className="hover:text-primary transition">0912 345 678</a> (Khiếu nại)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-full shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 mb-1">Email</p>
                    <p className="text-sm text-gray-600">hotro@pharmacy.com</p>
                    <p className="text-sm text-gray-600">lienhe@pharmacy.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-full shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 mb-1">Giờ làm việc</p>
                    <p className="text-sm text-gray-600">Thứ 2 - Thứ 7: 7:00 - 21:00</p>
                    <p className="text-sm text-gray-600">Chủ nhật: 8:00 - 17:00</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-500 mb-4">Kết nối với chúng tôi</p>
                <div className="flex gap-4">
                  <button className="p-2 bg-gray-100 rounded-full text-blue-600 hover:bg-blue-600 hover:text-white transition">
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-gray-100 rounded-full text-pink-600 hover:bg-pink-600 hover:text-white transition">
                    <Instagram className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-gray-100 rounded-full text-red-600 hover:bg-red-600 hover:text-white transition">
                    <Youtube className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. CỘT PHẢI: FORM LIÊN HỆ */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 h-full">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Gửi thắc mắc cho chúng tôi</h3>
              <p className="text-gray-500 mb-8 text-sm">
                Nếu bạn có câu hỏi về thuốc, bệnh lý hoặc đơn hàng, vui lòng điền vào biểu mẫu dưới đây.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                    <input
                      {...register("name", { required: "Vui lòng nhập họ tên" })}
                      className={cn("w-full px-4 py-3 border rounded-xl focus:ring-primary focus:border-primary outline-none transition", errors.name ? "border-red-300" : "border-gray-200")}
                      placeholder="Nguyễn Văn A"
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      {...register("email", { 
                        required: "Vui lòng nhập email",
                        pattern: { value: REGEX.EMAIL, message: "Email không hợp lệ" }
                      })}
                      className={cn("w-full px-4 py-3 border rounded-xl focus:ring-primary focus:border-primary outline-none transition", errors.email ? "border-red-300" : "border-gray-200")}
                      placeholder="name@example.com"
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                    <input
                      {...register("phone", { 
                        required: "Vui lòng nhập số điện thoại",
                        pattern: { value: REGEX.PHONE_VN, message: "SĐT không hợp lệ" }
                      })}
                      className={cn("w-full px-4 py-3 border rounded-xl focus:ring-primary focus:border-primary outline-none transition", errors.phone ? "border-red-300" : "border-gray-200")}
                      placeholder="0912..."
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chủ đề cần hỗ trợ</label>
                    <select
                      {...register("subject")}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition bg-white"
                    >
                      <option value="Tuvan">Tư vấn thuốc & Bệnh lý</option>
                      <option value="DonHang">Vấn đề Đơn hàng & Vận chuyển</option>
                      <option value="KhieuNai">Khiếu nại & Góp ý</option>
                      <option value="HopTac">Liên hệ hợp tác</option>
                      <option value="Khac">Khác</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung tin nhắn *</label>
                  <textarea
                    {...register("message", { required: "Vui lòng nhập nội dung" })}
                    rows={5}
                    className={cn("w-full px-4 py-3 border rounded-xl focus:ring-primary focus:border-primary outline-none transition resize-none", errors.message ? "border-red-300" : "border-gray-200")}
                    placeholder="Mô tả chi tiết vấn đề bạn cần hỗ trợ..."
                  ></textarea>
                  {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Gửi tin nhắn</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* 4. GOOGLE MAP (IFRAME) */}
        <div className="mt-12 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4">Bản đồ chỉ đường</h3>
          <div className="w-full h-[400px] rounded-xl overflow-hidden bg-gray-100">
            {/* Iframe Google Map (Hà Nội làm ví dụ) */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0968141837515!2d105.78007331476342!3d21.02881188599828!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab86cece9ac1%3A0xa9bc04e04602dd85!2zRlBUIENh4bqndSBHaeG6pXk!5e0!3m2!1svi!2s!4v1647854628549!5m2!1svi!2s" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy"
              title="Google Map"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;