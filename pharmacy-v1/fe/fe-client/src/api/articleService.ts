import type { Article } from '../types/article.types';

// DỮ LIỆU GIẢ
const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    title: "5 cách tăng cường hệ miễn dịch vào thời điểm giao mùa",
    slug: "tang-cuong-he-mien-dich-giao-mua",
    thumbnail: "https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&q=80&w=800",
    summary: "Thời điểm giao mùa là lúc cơ thể dễ mắc bệnh nhất. Hãy cùng tìm hiểu 5 cách đơn giản để bảo vệ sức khỏe của bạn và gia đình.",
    content: `
      <p>Thời tiết thay đổi thất thường là điều kiện thuận lợi cho vi khuẩn và virus phát triển. Để bảo vệ cơ thể, bạn cần chú ý:</p>
      <h3>1. Bổ sung Vitamin C</h3>
      <p>Vitamin C đóng vai trò quan trọng trong việc củng cố hàng rào miễn dịch...</p>
      <h3>2. Ngủ đủ giấc</h3>
      <p>Giấc ngủ giúp cơ thể phục hồi và tái tạo năng lượng...</p>
      <h3>3. Uống đủ nước</h3>
      <p>Nước giúp đào thải độc tố và duy trì độ ẩm cho niêm mạc mũi họng...</p>
    `,
    category: "Sống khỏe",
    author: "Dược sĩ Lan Anh",
    createdAt: "2023-10-20"
  },
  {
    id: 2,
    title: "Phân biệt cảm cúm và cảm lạnh thông thường",
    slug: "phan-biet-cam-cum-cam-lanh",
    thumbnail: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=800",
    summary: "Nhiều người thường nhầm lẫn giữa cảm cúm và cảm lạnh. Bài viết này sẽ giúp bạn nhận biết các triệu chứng để có hướng điều trị phù hợp.",
    content: "<p>Nội dung chi tiết về cách phân biệt...</p>",
    category: "Bệnh thường gặp",
    author: "Bác sĩ Tuấn",
    createdAt: "2023-10-18"
  },
  {
    id: 3,
    title: "Top 3 loại máy đo huyết áp tốt nhất cho người cao tuổi",
    slug: "may-do-huyet-ap-cho-nguoi-gia",
    thumbnail: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
    summary: "Đánh giá chi tiết các dòng máy đo huyết áp Omron, Microlife... dựa trên độ chính xác và tính năng dễ sử dụng.",
    content: "<p>Review chi tiết các loại máy...</p>",
    category: "Thiết bị y tế",
    author: "Dược sĩ Minh",
    createdAt: "2023-10-15"
  },
  {
    id: 4,
    title: "Thực phẩm chức năng: Dùng sao cho đúng?",
    slug: "su-dung-thuc-pham-chuc-nang-dung-cach",
    thumbnail: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&q=80&w=800",
    summary: "Không phải cứ uống nhiều là tốt. Hãy nghe chuyên gia tư vấn về liều lượng và thời điểm sử dụng TPCN.",
    content: "<p>Nội dung về TPCN...</p>",
    category: "Tư vấn thuốc",
    author: "Dược sĩ Hạnh",
    createdAt: "2023-10-10"
  }
];

const articleService = {
  // Lấy danh sách bài viết
  getArticles: async (): Promise<Article[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_ARTICLES), 500);
    });
  },

  // Lấy chi tiết bài viết
  getArticleBySlug: async (slug: string): Promise<Article | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const article = MOCK_ARTICLES.find(a => a.slug === slug);
        resolve(article || null);
      }, 500);
    });
  },

  // Lấy bài viết liên quan (trừ bài hiện tại)
  getRelatedArticles: async (slug: string): Promise<Article[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const related = MOCK_ARTICLES.filter(a => a.slug !== slug).slice(0, 3);
        resolve(related);
      }, 500);
    });
  }
};

export default articleService;