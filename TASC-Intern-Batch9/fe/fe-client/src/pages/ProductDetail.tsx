import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, ShieldCheck, Heart, FileText, Info, Activity } from 'lucide-react'; // Thêm icons

import { useAppDispatch, useAppSelector } from '../store/hooks';
import cartService from '../api/cartService'
import { fetchTotalItems } from '../store/slices/cartSlice';
import productService from '../api/productService';
import type { Product } from '../types';
import { cn } from '../lib/utils';

import AsyncImage from '../components/common/AsyncImage';
import Breadcrumb from '../components/common/BreadCrumb';
import ProductReviews from '../components/product/ProductReviews';
import ProductSlider from '../components/common/ProductSlider';
import { useToast } from '../context/ToastContext';

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast(); // <== Khai báo

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]); // State lưu sản phẩm liên quan
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Tabs: Mô tả | Chỉ định | Thông tin chi tiết
  const [activeTab, setActiveTab] = useState<'description' | 'indication' | 'details'>('description');

  const mapProductFromBackend = (item: any): Product => ({
    id: item.id,
    title: item.name || item.title,
    price_new: Number(item.price || item.salePrice || item.priceNew || 0),
    price_old: Number(item.originalPrice || item.priceOld || 0),
    thumbnail: item.image || item.thumbnail, // UUID ảnh
    slug: item.slug,
    quantity: item.quantity || 0,
    active: item.active !== false,
    description: item.description,
    manufacturer: item.manufacturer,
    brand: item.brand,
    productType: item.productType,
    indication: item.indication,
    registrationNumber: item.registrationNumber,
    activeIngredient: item.activeIngredient,
    dosageForm: item.dosageForm,
    noted: item.noted,
    inWishlist: item.inWishlist,
    numberOfLikes: item.numberOfLikes,
    images: item.images ? item.images.map((img: any) => img.imageUrl || img.image || img.uuid || img) : []
  });

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setQuantity(1);

      try {
        if (slug) {
          const res: any = await productService.getBySlug(slug);
          const backendData = res.data; // ApiResponse.data -> ProductResponse

          if (backendData) {
            // ===> MAPPING DỮ LIỆU TỪ BACKEND <===
            const mappedProduct = mapProductFromBackend(backendData);
            setProduct(mappedProduct);
            setSelectedImage(mappedProduct.thumbnail)

            try {
              const relatedRes: any = await productService.getRelated(mappedProduct.id)
              const relatedList = relatedRes.data;

              if (Array.isArray(relatedList)) {
                const mappedRelated = relatedList.map(mapProductFromBackend);
                setRelatedProducts(mappedRelated)
              }
            } catch (err) {
              console.error("Lỗi khi lấy sản phẩm liên quan")
            }
          }
        }
      } catch (error) {
        console.error("Failed to load product detail", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo(0, 0);
  }, [slug]);

const handleAddToCart = async (isBuyNow = false) => {
    // 1. Check Đăng nhập
    if (!isAuthenticated) {
      toast.info("Yêu cầu đăng nhập", "Vui lòng đăng nhập để mua hàng.");
      navigate('/login');
      return;
    }

    if (!product) return;

    try {
      // 2. Gọi API thêm vào giỏ
      await cartService.addItemToCart({
        productId: product.id,
        quantity: quantity
      });

      // 3. Cập nhật lại số lượng trên Header
      dispatch(fetchTotalItems());

      if (isBuyNow) {
        navigate('/cart'); // Chuyển sang giỏ hàng (để user tick chọn và mua)
      } else {
        toast.success("Thành công", "Đã thêm sản phẩm vào giỏ hàng.");
      }
    } catch (error: any) {
      toast.error("Lỗi", error.response?.data?.message || "Không thể thêm vào giỏ.");
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  if (!product) return <div className="text-center py-20 text-xl text-gray-500">Sản phẩm không tồn tại.</div>;

  const breadcrumbItems = [
    { label: "Sản phẩm", link: "/products" },
    { label: product.title }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* CỘT TRÁI: HÌNH ẢNH */}
        <div className="space-y-4">
          <div className="aspect-square bg-white border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative group">
            <AsyncImage uuid={selectedImage} alt={product.title} className="w-full h-full object-contain p-4" />
            <button className={cn("absolute top-4 right-4 p-2 bg-white rounded-full shadow hover:text-red-500 transition", product.inWishlist && "text-red-500 fill-current")}>
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Gallery */}
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {[product.thumbnail, ...(product.images || [])].filter(Boolean).map((imgUuid, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(imgUuid)}
                className={cn("w-20 h-20 border rounded-lg overflow-hidden shrink-0 hover:opacity-80 transition bg-white", selectedImage === imgUuid ? "border-primary ring-1 ring-primary" : "border-gray-200")}
              >
                <AsyncImage uuid={imgUuid} className="w-full h-full object-contain p-1" />
              </button>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: THÔNG TIN */}
        <div>
          {/* Brand & Type */}
          <div className="flex items-center gap-2 mb-2 text-sm">
            {product.brand && <span className="text-primary font-bold uppercase">{product.brand.name}</span>}
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">{product.productType || 'Dược phẩm'}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight">
            {product.title}
          </h1>

          {/* Short Info (Dành cho thuốc) */}
          <div className="mb-6 space-y-1 text-sm text-gray-600">
            {product.registrationNumber && <p><span className="font-semibold">Số đăng ký:</span> {product.registrationNumber}</p>}
            {product.manufacturer && <p><span className="font-semibold">Nhà sản xuất:</span> {product.manufacturer}</p>}
            {product.activeIngredient && <p><span className="font-semibold">Hoạt chất:</span> {product.activeIngredient}</p>}
          </div>

          <div className="bg-blue-50 p-6 rounded-xl mb-6">
            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl font-bold text-primary">
                {product.price_new.toLocaleString('vi-VN')} đ
              </span>
              {product.price_old > product.price_new && (
                <span className="text-lg text-gray-400 line-through mb-1">
                  {product.price_old.toLocaleString('vi-VN')} đ
                </span>
              )}
            </div>
            {/* Tag tiết kiệm */}
            {product.price_old > product.price_new && (
              <div className="text-xs font-bold text-red-500 bg-white inline-block px-2 py-1 rounded border border-red-100">
                Tiết kiệm: {(product.price_old - product.price_new).toLocaleString('vi-VN')} đ
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center w-max border border-gray-300 rounded-lg">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 hover:bg-gray-100 transition"><Minus className="w-4 h-4 text-gray-600" /></button>
              <span className="w-12 text-center font-bold text-slate-800">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="p-3 hover:bg-gray-100 transition"><Plus className="w-4 h-4 text-gray-600" /></button>
            </div>
            {product.quantity > 0 ? (
              <div className="text-sm text-green-600 flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Còn {product.quantity} sản phẩm</div>
            ) : (
              <div className="text-sm text-red-500">Hết hàng</div>
            )}
          </div>

          <div className="flex gap-4 mb-8">
            <button onClick={() => handleAddToCart(false)} className="flex-1 py-3.5 border-2 border-primary text-primary font-bold rounded-xl hover:bg-blue-50 transition flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Thêm vào giỏ
            </button>
            <button onClick={() => handleAddToCart(true)} className="flex-1 py-3.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-lg shadow-red-200 transition">
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {/* TABS THÔNG TIN CHI TIẾT */}
      <div className="mt-12 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'description', label: 'Mô tả sản phẩm', icon: FileText },
            { id: 'indication', label: 'Công dụng & Chỉ định', icon: Activity },
            { id: 'details', label: 'Thông tin chi tiết', icon: Info },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-4 font-medium text-sm transition relative whitespace-nowrap",
                activeTab === tab.id ? "text-primary bg-blue-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
            </button>
          ))}
        </div>

        <div className="p-8 text-gray-700 leading-relaxed min-h-[200px]">
          {/* TAB 1: MÔ TẢ */}
          {activeTab === 'description' && (
            <div className="whitespace-pre-line">{product.description || "Đang cập nhật mô tả..."}</div>
          )}

          {/* TAB 2: CÔNG DỤNG / CHỈ ĐỊNH */}
          {activeTab === 'indication' && (
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Công dụng / Chỉ định:</h3>
              <p className="whitespace-pre-line mb-4">{product.indication || "Đang cập nhật..."}</p>

              {product.noted && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800 text-sm mt-4">
                  <strong>Lưu ý:</strong> {product.noted}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: THÔNG SỐ KỸ THUẬT */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
              <div className="border-b border-gray-100 pb-2">
                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Thương hiệu</span>
                <span className="font-medium text-slate-900">{product.brand?.name || "N/A"}</span>
              </div>
              <div className="border-b border-gray-100 pb-2">
                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Nhà sản xuất</span>
                <span className="font-medium text-slate-900">{product.manufacturer || "N/A"}</span>
              </div>
              <div className="border-b border-gray-100 pb-2">
                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Xuất xứ</span>
                <span className="font-medium text-slate-900">Việt Nam</span>
              </div>
              <div className="border-b border-gray-100 pb-2">
                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Số đăng ký</span>
                <span className="font-medium text-slate-900">{product.registrationNumber || "N/A"}</span>
              </div>
              <div className="border-b border-gray-100 pb-2">
                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Hoạt chất chính</span>
                <span className="font-medium text-slate-900">{product.activeIngredient || "N/A"}</span>
              </div>
              <div className="border-b border-gray-100 pb-2">
                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Dạng bào chế</span>
                <span className="font-medium text-slate-900">{product.dosageForm || "N/A"}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <ProductReviews />

      {/* ===> HIỂN THỊ SẢN PHẨM LIÊN QUAN <=== */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 mb-8 border-t border-gray-100 pt-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 border-l-4 border-primary pl-3">
            Sản phẩm liên quan
          </h2>
          {/* Sử dụng ProductSlider */}
          <ProductSlider products={relatedProducts} />
        </div>
      )}
    </div>
  );
};

export default ProductDetail;