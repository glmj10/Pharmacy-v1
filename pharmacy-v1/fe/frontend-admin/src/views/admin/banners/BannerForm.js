import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
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
  CFormSelect,
  CFormSwitch,
  CFormFeedback,
  CSpinner,
  CImage,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSave,
  cilArrowLeft,
  cilImage,
  cilX,
} from '@coreui/icons'
import { bannerService } from '../../../services'
import { useApiCall } from '../../../hooks/useApiCall'

const BannerForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const isEdit = !!id
  const bannerFromState = location.state?.banner

  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const { execute: callApi } = useApiCall()

  const [formData, setFormData] = useState({
    name: '',
    targetUrl: '',
    type: 'SLIDER',
    priority: 0,
    isActive: true,
  })

  const [formErrors, setFormErrors] = useState({
    name: '',
    type: '',
    image: '',
  })

  useEffect(() => {
    if (isEdit) {
      if (bannerFromState) {
        // Use banner from navigation state
        setFormData({
          name: bannerFromState.name || '',
          targetUrl: bannerFromState.targetUrl || '',
          type: bannerFromState.type || 'SLIDER',
          priority: bannerFromState.priority || 0,
          isActive: bannerFromState.isActive !== undefined ? bannerFromState.isActive : true,
        })
        if (bannerFromState.imageUrl) {
          setImagePreview(bannerFromState.imageUrl)
        }
      } else {
        // Fetch banner data
        fetchBanner()
      }
    }
  }, [id, isEdit, bannerFromState])

  const fetchBanner = async () => {
    setLoading(true)
    try {
      const response = await callApi(() => bannerService.getBannerById(id))
      if (response.success && response.data) {
        const banner = response.data
        setFormData({
          name: banner.name || '',
          targetUrl: banner.targetUrl || '',
          type: banner.type || 'SLIDER',
          priority: banner.priority || 0,
          isActive: banner.isActive !== undefined ? banner.isActive : true,
        })
        if (banner.imageUrl) {
          setImagePreview(banner.imageUrl)
        }
      }
    } catch (error) {
      console.error('Error fetching banner:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, image: 'Vui lòng chọn file hình ảnh' }))
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, image: 'Kích thước file không được vượt quá 5MB' }))
        return
      }

      setImageFile(file)
      setFormErrors(prev => ({ ...prev, image: '' }))

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    // Reset file input
    const fileInput = document.getElementById('imageInput')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = 'Tên banner không được để trống'
    }

    if (!formData.type) {
      errors.type = 'Loại banner không được để trống'
    }

    if (!isEdit && !imageFile) {
      errors.image = 'Vui lòng chọn hình ảnh'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitLoading(true)
    try {
      const bannerData = {
        name: formData.name,
        targetUrl: formData.targetUrl || '',
        type: formData.type,
        priority: parseInt(formData.priority) || 0,
        isActive: formData.isActive,
      }

      let response
      if (isEdit) {
        response = await callApi(() => bannerService.updateBanner(id, bannerData, imageFile))
      } else {
        response = await callApi(() => bannerService.createBanner(bannerData, imageFile))
      }

      if (response.success) {
        navigate('/banners')
      }
    } catch (error) {
      console.error('Error saving banner:', error)
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>{isEdit ? 'Chỉnh sửa Banner' : 'Thêm Banner Mới'}</strong>
            <CButton
              color="light"
              onClick={() => navigate('/banners')}
            >
              <CIcon icon={cilArrowLeft} className="me-2" />
              Quay lại
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow>
                <CCol md={8}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="name">
                      Tên Banner <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      invalid={!!formErrors.name}
                      placeholder="Nhập tên banner"
                    />
                    <CFormFeedback invalid>{formErrors.name}</CFormFeedback>
                  </div>

                  <div className="mb-3">
                    <CFormLabel htmlFor="targetUrl">Link đích (URL)</CFormLabel>
                    <CFormInput
                      type="url"
                      id="targetUrl"
                      name="targetUrl"
                      value={formData.targetUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/promotion"
                    />
                    <small className="text-muted">
                      URL mà người dùng sẽ được chuyển đến khi click vào banner
                    </small>
                  </div>

                  <CRow>
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="type">
                          Loại Banner <span className="text-danger">*</span>
                        </CFormLabel>
                        <CFormSelect
                          id="type"
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          invalid={!!formErrors.type}
                        >
                          <option value="SLIDER">Slider (Banner trượt)</option>
                          <option value="SIDE">Side (Banner bên cạnh)</option>
                          <option value="FOOTER">Footer (Banner chân trang)</option>
                        </CFormSelect>
                        <CFormFeedback invalid>{formErrors.type}</CFormFeedback>
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
                          min="0"
                          placeholder="0"
                        />
                        <small className="text-muted">
                          Số càng cao, ưu tiên càng cao
                        </small>
                      </div>
                    </CCol>
                  </CRow>

                  <div className="mb-3">
                    <CFormSwitch
                      id="isActive"
                      name="isActive"
                      label="Kích hoạt banner"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                  </div>
                </CCol>

                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="imageInput">
                      Hình ảnh Banner {!isEdit && <span className="text-danger">*</span>}
                    </CFormLabel>
                    <CFormInput
                      type="file"
                      id="imageInput"
                      accept="image/*"
                      onChange={handleImageChange}
                      invalid={!!formErrors.image}
                    />
                    <CFormFeedback invalid>{formErrors.image}</CFormFeedback>
                    <small className="text-muted d-block mt-1">
                      Định dạng: JPG, PNG, GIF (Max: 5MB)
                    </small>
                  </div>

                  {imagePreview && (
                    <div className="position-relative">
                      <CImage
                        src={imagePreview}
                        alt="Preview"
                        className="w-100 rounded"
                        style={{ maxHeight: '300px', objectFit: 'cover' }}
                      />
                      <CButton
                        color="danger"
                        size="sm"
                        className="position-absolute top-0 end-0 m-2"
                        onClick={handleRemoveImage}
                      >
                        <CIcon icon={cilX} />
                      </CButton>
                    </div>
                  )}

                  {!imagePreview && (
                    <div
                      className="d-flex align-items-center justify-content-center border rounded"
                      style={{
                        height: '200px',
                        backgroundColor: '#f8f9fa',
                      }}
                    >
                      <div className="text-center text-muted">
                        <CIcon icon={cilImage} size="3xl" className="mb-2" />
                        <p className="mb-0">Chưa có hình ảnh</p>
                      </div>
                    </div>
                  )}
                </CCol>
              </CRow>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <CButton
                  color="secondary"
                  onClick={() => navigate('/banners')}
                  disabled={submitLoading}
                >
                  Hủy
                </CButton>
                <CButton
                  color="primary"
                  type="submit"
                  disabled={submitLoading}
                >
                  {submitLoading ? (
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
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default BannerForm
