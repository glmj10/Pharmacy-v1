import React, { useState, useEffect } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CFormSelect,
  CSpinner,
  CAlert,
  CInputGroup,
  CInputGroupText,
  CFormFeedback,
  CFormCheck,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave, cilArrowLeft, cilX } from '@coreui/icons'
import { productService, brandService, categoryService } from '../../../services'
import { useApiCall } from '../../../hooks/useApiCall'

const ProductForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [flatCategories, setFlatCategories] = useState([])
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [removedImageIds, setRemovedImageIds] = useState([])
  const { execute: callApi } = useApiCall()

  const [formData, setFormData] = useState({
    title: '',
    priceOld: '',
    priceNew: '',
    importPrice: '',
    quantity: '',
    manufacturer: '',
    productType: '',
    noted: '',
    indication: '',
    description: '',
    registrationNumber: '',
    activeIngredient: '',
    dosageForm: '',
    priority: 0,
    brandId: '',
    categoryIds: [],
  })

  const [formErrors, setFormErrors] = useState({
    title: '',
    priceOld: '',
    priceNew: '',
    importPrice: '',
    quantity: '',
    manufacturer: '',
    productType: '',
    brandId: '',
    categoryIds: '',
    noted: '',
    indication: '',
    description: '',
    registrationNumber: '',
    activeIngredient: '',
    dosageForm: '',
    thumbnail: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true)
      try {
        const brandsResponse = await callApi(() => brandService.getAllBrands())
        if (brandsResponse.success) {
          const brandsData = Array.isArray(brandsResponse.data) 
            ? brandsResponse.data 
            : brandsResponse.data.content || brandsResponse.data.data || []
          setBrands(brandsData)
        }

        const categoriesResponse = await callApi(() => categoryService.getAllProductCategories())
        if (categoriesResponse.success) {
          const categoriesData = Array.isArray(categoriesResponse.data) 
            ? categoriesResponse.data 
            : categoriesResponse.data.content || categoriesResponse.data.data || []
          setCategories(categoriesData)
          
          const flatten = (cats, level = 0) => {
            let result = [];
            cats.forEach(cat => {
              result.push({ ...cat, level, displayName: '　'.repeat(level) + cat.name });
              if (cat.children && cat.children.length > 0) {
                result = result.concat(flatten(cat.children, level + 1));
              }
            });
            return result;
          };
          setFlatCategories(flatten(categoriesData));
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setFlatCategories([]);
      } finally {
        setInitialLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (isEdit && brands.length > 0 && categories.length > 0) {
      const fetchProduct = async () => {
        setLoading(true)
        try {
          const response = await callApi(() => productService.getProductById(id))
          if (response.success) {
            const product = response.data
                        
            let brandId = ''
            if (product.brand && product.brand.id) {
              brandId = String(product.brand.id)
            } else if (product.brandId) {
              brandId = String(product.brandId)
            }

            let categoryIds = []
            if (product.categories && Array.isArray(product.categories)) {
              categoryIds = product.categories.map(cat => String(cat.id))
            } else if (product.categoryIds && Array.isArray(product.categoryIds)) {
              categoryIds = product.categoryIds.map(id => String(id))
            }
            
            const newFormData = {
              title: product.title || '',
              priceOld: product.priceOld || '',
              priceNew: product.priceNew || '',
              importPrice: product.importPrice || '',
              quantity: product.quantity || '',
              manufacturer: product.manufacturer || '',
              productType: product.productType || '',
              noted: product.noted || '',
              indication: product.indication || '',
              description: product.description || '',
              registrationNumber: product.registrationNumber || '',
              activeIngredient: product.activeIngredient || '',
              dosageForm: product.dosageForm || '',
              priority: product.priority || 0,
              brandId: brandId,
              categoryIds: categoryIds,
            }
            setFormData(newFormData)
            
            if (product.thumbnailUrl) {
              setThumbnailPreview(product.thumbnailUrl)
            }

            if (product.images && product.images.length > 0) {
              setExistingImages(product.images)
            }
          } else {
            console.error('Failed to load product:', response.message)
            navigate('/products')
          }
        } catch (error) {
          console.error('Error fetching product:', error)
          navigate('/products')
        } finally {
          setLoading(false)
        }
      }
      fetchProduct()
    }
  }, [id, isEdit, brands, categories, navigate])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'categorySelect') {
      // Thêm category vào mảng nếu chưa có
      const id = value;
      if (id && !formData.categoryIds.includes(id)) {
        setFormData(prev => ({
          ...prev,
          categoryIds: [...prev.categoryIds, id]
        }));
        setFormErrors(prev => ({ ...prev, categoryIds: '' }));
      }
      return;
    }
    if (name === 'categoryIds') {
      // Không dùng nữa, chỉ để tránh lỗi
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Xóa category khỏi mảng đã chọn
  const removeCategoryTag = (id) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.filter(cid => cid !== id)
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setThumbnailPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setImageFiles(files)
      
      const previews = files.map(file => {
        const reader = new FileReader()
        return new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result)
          reader.readAsDataURL(file)
        })
      })

      Promise.all(previews).then(urls => {
        setImagePreviews(urls)
      })
    }
  }

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index) => {
    const imageToRemove = existingImages[index]
    if (imageToRemove && imageToRemove.id) {
      setRemovedImageIds(prev => [...prev, imageToRemove.id])
    }
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview('')
  }

  const resetForm = () => {
    setFormData({
      title: '',
      priceOld: '',
      priceNew: '',
      importPrice: '',
      quantity: '',
      manufacturer: '',
      productType: '',
      noted: '',
      indication: '',
      description: '',
      registrationNumber: '',
      activeIngredient: '',
      dosageForm: '',
      priority: 0,
      brandId: '',
      categoryIds: [],
    })
    setThumbnailFile(null)
    setThumbnailPreview('')
    setImageFiles([])
    setImagePreviews([])
    setExistingImages([])
    setRemovedImageIds([])
    setFormErrors({})
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.title.trim()) {
      errors.title = 'Tên sản phẩm là bắt buộc'
    }
    
    if (!formData.priceOld || formData.priceOld <= 0) {
      errors.priceOld = 'Giá gốc phải lớn hơn 0'
    }
    
    if (!formData.priceNew || formData.priceNew <= 0) {
      errors.priceNew = 'Giá mới phải lớn hơn 0'
    }
    
    if (!formData.importPrice || formData.importPrice <= 0) {
      errors.importPrice = 'Giá nhập phải lớn hơn 0'
    }
    
    if (!formData.quantity || formData.quantity < 0) {
      errors.quantity = 'Số lượng phải >= 0'
    }
    
    if (!formData.manufacturer.trim()) {
      errors.manufacturer = 'Nhà sản xuất là bắt buộc'
    }
    
    if (!formData.productType.trim()) {
      errors.productType = 'Loại sản phẩm là bắt buộc'
    }
    
    if (!formData.brandId) {
      errors.brandId = 'Thương hiệu là bắt buộc'
    }
    
    if (!formData.categoryIds || formData.categoryIds.length === 0) {
      errors.categoryIds = 'Danh mục là bắt buộc'
    }

    if (!formData.noted.trim()) {
      errors.noted = 'Ghi chú là bắt buộc'
    }

    if (!formData.indication.trim()) {
      errors.indication = 'Chỉ định là bắt buộc'
    }

    if (!formData.description.trim()) {
      errors.description = 'Mô tả là bắt buộc'
    }

    if (!formData.registrationNumber.trim()) {
      errors.registrationNumber = 'Số đăng ký là bắt buộc'
    }

    if (!formData.activeIngredient.trim()) {
      errors.activeIngredient = 'Hoạt chất là bắt buộc'
    }

    if (!formData.dosageForm.trim()) {
      errors.dosageForm = 'Dạng bào chế là bắt buộc'
    }
    
    if (!isEdit && !thumbnailFile && !thumbnailPreview) {
      errors.thumbnail = 'Hình ảnh đại diện là bắt buộc'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    try {
      const submitFormData = new FormData()
      
      const productRequest = {
        title: formData.title.trim(),
        priceOld: parseFloat(formData.priceOld) || 0,
        priceNew: parseFloat(formData.priceNew) || 0,
        importPrice: parseFloat(formData.importPrice) || 0,
        quantity: parseInt(formData.quantity) || 0,
        manufacturer: formData.manufacturer.trim(),
        productType: formData.productType.trim(),
        noted: formData.noted.trim(),
        indication: formData.indication.trim(),
        description: formData.description.trim(),
        registrationNumber: formData.registrationNumber.trim(),
        activeIngredient: formData.activeIngredient.trim(),
        dosageForm: formData.dosageForm.trim(),
        priority: parseInt(formData.priority) || 0,
        brandId: parseInt(formData.brandId) || null,
        categoryIds: formData.categoryIds.map(id => parseInt(id)),
      }
      
      console.log('Product request being sent:', productRequest);
      
      const productBlob = new Blob([JSON.stringify(productRequest)], { type: 'application/json' })
      submitFormData.append('product', productBlob)
      
      if (thumbnailFile) {
        submitFormData.append('thumbnail', thumbnailFile)
      }
      
      imageFiles.forEach((file, index) => {
        submitFormData.append('images', file)
      })
      
      if (isEdit && removedImageIds.length > 0) {
        submitFormData.append('removedImageIds', JSON.stringify(removedImageIds))
      }
      
      if (isEdit) {
        await callApi(() => 
          productService.updateProduct(id, submitFormData),
          {
            successMessage: 'Cập nhật sản phẩm thành công!',
            showSuccessNotification: true,
            onSuccess: () => {
              navigate('/products/list')
            }
          }
        )
      } else {
        await callApi(() => 
          productService.createProduct(submitFormData),
          {
            successMessage: 'Tạo sản phẩm thành công!',
            showSuccessNotification: true,
            onSuccess: () => {
              navigate('/products/list')
            }
          }
        )
      }
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner color="primary" size="lg" />
        <span className="ms-2">Đang tải dữ liệu...</span>
      </div>
    )
  }

  if (loading && isEdit) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner color="primary" size="lg" />
        <span className="ms-2">Đang tải thông tin sản phẩm...</span>
      </div>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</strong>
            </div>
            <CButton 
              color="secondary" 
              onClick={() => navigate('/products/list')}
              className="me-2"
            >
              <CIcon icon={cilArrowLeft} className="me-1" />
              Quay lại
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow>
                <CCol md={8}>
                  {/* Title */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="title">Tên sản phẩm *</CFormLabel>
                    <CFormInput
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      invalid={!!formErrors.title}
                      placeholder="Nhập tên sản phẩm"
                    />
                    {formErrors.title && (
                      <CFormFeedback invalid>
                        {formErrors.title}
                      </CFormFeedback>
                    )}
                  </div>

                  {/* Price */}
                  <CRow>
                    <CCol md={4}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="priceOld">Giá gốc *</CFormLabel>
                        <CInputGroup>
                          <CFormInput
                            type="number"
                            id="priceOld"
                            name="priceOld"
                            value={formData.priceOld}
                            onChange={handleInputChange}
                            invalid={!!formErrors.priceOld}
                            placeholder="0"
                          />
                          <CInputGroupText>VND</CInputGroupText>
                        </CInputGroup>
                        {formErrors.priceOld && (
                          <CFormFeedback invalid>
                            {formErrors.priceOld}
                          </CFormFeedback>
                        )}
                      </div>
                    </CCol>
                    <CCol md={4}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="priceNew">Giá bán *</CFormLabel>
                        <CInputGroup>
                          <CFormInput
                            type="number"
                            id="priceNew"
                            name="priceNew"
                            value={formData.priceNew}
                            onChange={handleInputChange}
                            invalid={!!formErrors.priceNew}
                            placeholder="0"
                          />
                          <CInputGroupText>VND</CInputGroupText>
                        </CInputGroup>
                        {formErrors.priceNew && (
                          <CFormFeedback invalid>
                            {formErrors.priceNew}
                          </CFormFeedback>
                        )}
                      </div>
                    </CCol>
                    <CCol md={4}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="importPrice">Giá nhập *</CFormLabel>
                        <CInputGroup>
                          <CFormInput
                            type="number"
                            id="importPrice"
                            name="importPrice"
                            value={formData.importPrice}
                            onChange={handleInputChange}
                            invalid={!!formErrors.importPrice}
                            placeholder="0"
                          />
                          <CInputGroupText>VND</CInputGroupText>
                        </CInputGroup>
                        {formErrors.importPrice && (
                          <CFormFeedback invalid>
                            {formErrors.importPrice}
                          </CFormFeedback>
                        )}
                      </div>
                    </CCol>
                  </CRow>

                  {/* Quantity */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="quantity">Số lượng *</CFormLabel>
                    <CFormInput
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      invalid={!!formErrors.quantity}
                      placeholder="0"
                    />
                    {formErrors.quantity && (
                      <CFormFeedback invalid>
                        {formErrors.quantity}
                      </CFormFeedback>
                    )}
                  </div>

                  {/* Manufacturer */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="manufacturer">Nhà sản xuất *</CFormLabel>
                    <CFormInput
                      type="text"
                      id="manufacturer"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      invalid={!!formErrors.manufacturer}
                      placeholder="Nhập tên nhà sản xuất"
                    />
                    {formErrors.manufacturer && (
                      <CFormFeedback invalid>
                        {formErrors.manufacturer}
                      </CFormFeedback>
                    )}
                  </div>

                  {/* Type */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="productType">Loại sản phẩm *</CFormLabel>
                    <CFormInput
                      type="text"
                      id="productType"
                      name="productType"
                      value={formData.productType}
                      onChange={handleInputChange}
                      invalid={!!formErrors.productType}
                      placeholder="Nhập loại sản phẩm"
                    />
                    {formErrors.productType && (
                      <CFormFeedback invalid>
                        {formErrors.productType}
                      </CFormFeedback>
                    )}
                  </div>

                  {/* Description with CKEditor */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="description">Mô tả *</CFormLabel>
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.description}
                      onChange={(event, editor) => {
                        const data = editor.getData()
                        setFormData(prev => ({
                          ...prev,
                          description: data
                        }))
                      }}
                    />
                    {formErrors.description && (
                      <div className="invalid-feedback d-block">
                        {formErrors.description}
                      </div>
                    )}
                  </div>

                  {/* Noted */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="noted">Ghi chú *</CFormLabel>
                    <CFormTextarea
                      id="noted"
                      name="noted"
                      value={formData.noted}
                      onChange={handleInputChange}
                      invalid={!!formErrors.noted}
                      rows={3}
                      placeholder="Nhập ghi chú"
                    />
                    {formErrors.noted && (
                      <CFormFeedback invalid>
                        {formErrors.noted}
                      </CFormFeedback>
                    )}
                  </div>

                  {/* Indication */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="indication">Chỉ định *</CFormLabel>
                    <CFormTextarea
                      id="indication"
                      name="indication"
                      value={formData.indication}
                      onChange={handleInputChange}
                      invalid={!!formErrors.indication}
                      rows={3}
                      placeholder="Nhập chỉ định sử dụng"
                    />
                    {formErrors.indication && (
                      <CFormFeedback invalid>
                        {formErrors.indication}
                      </CFormFeedback>
                    )}
                  </div>

                  {/* Additional Fields */}
                  <CRow>
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="registrationNumber">Số đăng ký *</CFormLabel>
                        <CFormInput
                          type="text"
                          id="registrationNumber"
                          name="registrationNumber"
                          value={formData.registrationNumber}
                          onChange={handleInputChange}
                          invalid={!!formErrors.registrationNumber}
                          placeholder="Nhập số đăng ký"
                        />
                        {formErrors.registrationNumber && (
                          <CFormFeedback invalid>
                            {formErrors.registrationNumber}
                          </CFormFeedback>
                        )}
                      </div>
                    </CCol>
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="activeIngredient">Hoạt chất *</CFormLabel>
                        <CFormInput
                          type="text"
                          id="activeIngredient"
                          name="activeIngredient"
                          value={formData.activeIngredient}
                          onChange={handleInputChange}
                          invalid={!!formErrors.activeIngredient}
                          placeholder="Nhập hoạt chất"
                        />
                        {formErrors.activeIngredient && (
                          <CFormFeedback invalid>
                            {formErrors.activeIngredient}
                          </CFormFeedback>
                        )}
                      </div>
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="dosageForm">Dạng bào chế *</CFormLabel>
                        <CFormInput
                          type="text"
                          id="dosageForm"
                          name="dosageForm"
                          value={formData.dosageForm}
                          onChange={handleInputChange}
                          invalid={!!formErrors.dosageForm}
                          placeholder="Nhập dạng bào chế"
                        />
                        {formErrors.dosageForm && (
                          <CFormFeedback invalid>
                            {formErrors.dosageForm}
                          </CFormFeedback>
                        )}
                      </div>
                    </CCol>
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="priority">Độ ưu tiên</CFormLabel>
                        <CFormInput
                          type="number"
                          id="priority"
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          placeholder="0"
                        />
                      </div>
                    </CCol>
                  </CRow>
                </CCol>

                <CCol md={4}>
                  {/* Brand */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="brandId">Thương hiệu *</CFormLabel>
                    <CFormSelect
                      id="brandId"
                      name="brandId"
                      value={formData.brandId}
                      onChange={handleInputChange}
                      invalid={!!formErrors.brandId}
                    >
                      <option value="">Chọn thương hiệu</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </CFormSelect>
                    {formErrors.brandId && (
                      <CFormFeedback invalid>
                        {formErrors.brandId}
                      </CFormFeedback>
                    )}
                  </div>

                  <div className="mb-3">
                    <CFormLabel htmlFor="categorySelect">Danh mục *</CFormLabel>
                    <select
                      id="categorySelect"
                      name="categorySelect"
                      className="form-select"
                      onChange={handleInputChange}
                      value=""
                    >
                      <option value="">Chọn danh mục để thêm</option>
                      {flatCategories.map(cat => (
                        <option key={cat.id} value={cat.id} disabled={formData.categoryIds.includes(cat.id)}>
                          {cat.displayName}
                        </option>
                      ))}
                    </select>
                    {formErrors.categoryIds && <div className="text-danger mt-1">{formErrors.categoryIds}</div>}
                    <div className="mt-2 d-flex flex-wrap gap-2">
                      {formData.categoryIds.map(cid => {
                        const cat = flatCategories.find(c => String(c.id) === String(cid));
                        if (!cat) return null;
                        return (
                          <span key={cid} className="badge bg-primary d-flex align-items-center" style={{ fontSize: '1em', padding: '0.5em 1em', borderRadius: '16px' }}>
                            {cat.name}
                            <button type="button" className="btn-close ms-2" aria-label="Xóa" style={{ fontSize: '0.8em', filter: 'invert(1)' }} onClick={() => removeCategoryTag(cid)}></button>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="thumbnail">
                      Hình ảnh đại diện {!isEdit && '*'}
                    </CFormLabel>
                    <CFormInput
                      type="file"
                      id="thumbnail"
                      name="thumbnail"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      invalid={!!formErrors.thumbnail}
                    />
                    {formErrors.thumbnail && (
                      <CFormFeedback invalid>
                        {formErrors.thumbnail}
                      </CFormFeedback>
                    )}
                    
                    {/* Thumbnail Preview */}
                    {thumbnailPreview && (
                      <div className="mt-3 position-relative">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail Preview"
                          style={{ 
                            width: '100%', 
                            height: '200px', 
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #dee2e6'
                          }}
                        />
                        <CButton
                          color="danger"
                          size="sm"
                          className="position-absolute top-0 end-0 m-2"
                          onClick={removeThumbnail}
                        >
                          <CIcon icon={cilX} />
                        </CButton>
                      </div>
                    )}
                  </div>

                  {/* Images */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="images">Hình ảnh sản phẩm</CFormLabel>
                    <CFormInput
                      type="file"
                      id="images"
                      name="images"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                    />
                    
                    {existingImages.length > 0 && (
                      <div className="mt-3">
                        <small className="text-muted">Hình ảnh hiện tại:</small>
                        <div className="row mt-2">
                          {existingImages.map((image, index) => (
                            <div key={index} className="col-6 mb-2">
                              <div className="position-relative">
                                <img
                                  src={image.imageUrl}
                                  alt={`Existing ${index + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '100px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                    border: '1px solid #dee2e6'
                                  }}
                                />
                                <CButton
                                  color="danger"
                                  size="sm"
                                  className="position-absolute top-0 end-0 m-1"
                                  onClick={() => removeExistingImage(index)}
                                >
                                  <CIcon icon={cilX} />
                                </CButton>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* New Images Preview */}
                    {imagePreviews.length > 0 && (
                      <div className="mt-3">
                        <small className="text-muted">Hình ảnh mới:</small>
                        <div className="row mt-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="col-6 mb-2">
                              <div className="position-relative">
                                <img
                                  src={preview}
                                  alt={`New ${index + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '100px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                    border: '1px solid #dee2e6'
                                  }}
                                />
                                <CButton
                                  color="danger"
                                  size="sm"
                                  className="position-absolute top-0 end-0 m-1"
                                  onClick={() => removeImage(index)}
                                >
                                  <CIcon icon={cilX} />
                                </CButton>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid gap-2">
                    <CButton 
                      type="submit" 
                      color="primary" 
                      disabled={loading}
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <CIcon icon={cilSave} className="me-2" />
                          {isEdit ? 'Cập nhật' : 'Tạo mới'}
                        </>
                      )}
                    </CButton>
                  </div>
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ProductForm
