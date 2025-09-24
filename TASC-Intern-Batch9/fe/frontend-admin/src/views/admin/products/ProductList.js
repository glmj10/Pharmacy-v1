import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CFormInput,
  CInputGroup,
  CAlert,
  CFormSelect,
  CForm,
  CToaster,
  CToast,
  CToastBody,
  CToastHeader,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CCollapse,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSearch,
  cilPlus,
  cilReload,
  cilXCircle,
  cilCheckCircle,
  cilX,
  cilOptions,
  cilPencil,
  cilTrash,
  cilToggleOn,
  cilToggleOff,
  cilFilter,
} from '@coreui/icons'
import { useProducts } from '../../../hooks/useProducts'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { ProductEmptyState } from '../../../components/common/EmptyState'
import categoryService from '../../../services/category.service'
import brandService from '../../../services/brand.service'

const ProductList = () => {
  const navigate = useNavigate()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('')
  const [priceFrom, setPriceFrom] = useState('')
  const [priceTo, setPriceTo] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedBrandId, setSelectedBrandId] = useState('')
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [deleteModal, setDeleteModal] = useState({ visible: false, product: null })
  const [error, setError] = useState('')
  const [toasts, setToasts] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  
  const [searchDebounce, setSearchDebounce] = useState(null)
  
  const {
    products = [],
    loading = false,
    pagination = { currentPage: 1, totalPages: 0, totalElements: 0 },
    fetchProducts,
    deleteProduct,
    toggleProductStatus,
  } = useProducts()

  useEffect(() => {
    loadProducts(currentPage)
    loadCategories()
    loadBrands()
  }, [])

  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce)
    }
    
    const timeout = setTimeout(() => {
      if (searchInput !== searchTerm) {
        setSearchTerm(searchInput)
        setCurrentPage(1) 
        loadProducts(1, searchInput, statusFilter, sortOrder, priceFrom, priceTo, selectedCategoryId, selectedBrandId)
      }
    }, 500)
    
    setSearchDebounce(timeout)
    
    return () => clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    setCurrentPage(1) 
    loadProducts(1, searchTerm, statusFilter, sortOrder, priceFrom, priceTo, selectedCategoryId, selectedBrandId)
  }, [statusFilter, sortOrder, priceFrom, priceTo, selectedCategoryId, selectedBrandId])

  const loadProducts = async (page = 1, title = '', statusF = '', sortF = '', priceFromF = '', priceToF = '', categoryIdF = '', brandIdF = '') => {
    try {
      setCurrentPage(page)
      const params = {
        pageIndex: page,
        pageSize: pageSize,
      }
      
      if (title && title.trim()) {
        params.title = title.trim()
      }
      
      if (statusF === 'active') {
        params.isActive = true
      } else if (statusF === 'inactive') {
        params.isActive = false
      }
      
      if (sortF === 'price-asc') {
        params.isAscending = true  
      } else if (sortF === 'price-desc') {
        params.isAscending = false 
      }
      
      if (priceFromF && priceFromF.trim()) {
        params.priceFrom = parseFloat(priceFromF.trim())
      }
      
      if (priceToF && priceToF.trim()) {
        params.priceTo = parseFloat(priceToF.trim())
      }
      
      if (categoryIdF && categoryIdF.trim()) {
        params.categoryId = categoryIdF.trim()
      }
      
      if (brandIdF && brandIdF.trim()) {
        params.brandId = brandIdF.trim()
      }
      
      const result = await fetchProducts(params)
      
      if (!result || !result.success) {
        setError('Không thể tải danh sách sản phẩm')
      } else {
        setError('')
      }
    } catch (error) {
      console.error('Failed to load products:', error)
      setError('Lỗi khi tải danh sách sản phẩm')
    }
  }

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAllProductCategories()
      if (response && response.data) {
        setCategories(response.data || [])
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadBrands = async () => {
    try {
      const response = await brandService.getAllBrands()
      if (response && response.data) {
        setBrands(response.data || [])
      }
    } catch (error) {
      console.error('Failed to load brands:', error)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearchTerm(searchInput)
    setCurrentPage(1)
    loadProducts(1, searchInput, statusFilter, sortOrder, priceFrom, priceTo, selectedCategoryId, selectedBrandId)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearchTerm('')
    setStatusFilter('')
    setSortOrder('')
    setPriceFrom('')
    setPriceTo('')
    setSelectedCategoryId('')
    setSelectedBrandId('')
    setCurrentPage(1)
    loadProducts(1, '', '', '', '', '', '', '') 
  }

  const handleRefresh = () => {
    loadProducts(currentPage, searchTerm, statusFilter, sortOrder, priceFrom, priceTo, selectedCategoryId, selectedBrandId)
  }

  const handleStatusToggle = async (productId, currentStatus) => {
    try {
      const result = await toggleProductStatus(productId, currentStatus)
      if (result && result.success) {
        loadProducts(currentPage, searchTerm, statusFilter, sortOrder, priceFrom, priceTo, selectedCategoryId, selectedBrandId)
        addToast('Cập nhật trạng thái thành công', 'success')
      } else {
        addToast('Lỗi khi cập nhật trạng thái', 'error')
      }
    } catch (error) {
      console.error('Error toggling product status:', error)
      addToast('Lỗi khi thay đổi trạng thái sản phẩm', 'error')
    }
  }

  const handleDeleteProduct = async () => {
    if (!deleteModal.product) return

    try {
      const result = await deleteProduct(deleteModal.product.id)
      if (result && result.success) {
        setDeleteModal({ visible: false, product: null })
        loadProducts(currentPage, searchTerm, statusFilter, sortOrder, priceFrom, priceTo, selectedCategoryId, selectedBrandId)
        addToast('Xóa sản phẩm thành công', 'success')
      } else {
        addToast('Lỗi khi xóa sản phẩm', 'error')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      addToast('Lỗi khi xóa sản phẩm', 'error')
    }
  }

  const addToast = useCallback((message, type = 'info') => {
    const toast = {
      id: Date.now(),
      message,
      type,
      autohide: true,
      delay: 4000
    }
    setToasts(prev => [...prev, toast])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return 'N/A'
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  return (
    <>
      <CToaster placement="top-end">
        {toasts.map((toast) => (
          <CToast 
            key={toast.id} 
            autohide={toast.autohide} 
            delay={toast.delay}
            visible={true}
            color={toast.type === 'error' ? 'danger' : toast.type === 'success' ? 'success' : 'info'}
            onClose={() => removeToast(toast.id)}
          >
            <CToastHeader closeButton>
              <CIcon 
                icon={toast.type === 'error' ? cilXCircle : toast.type === 'success' ? cilCheckCircle : cilX} 
                className="me-2" 
              />
              <strong className="me-auto">
                {toast.type === 'error' ? 'Lỗi' : toast.type === 'success' ? 'Thành công' : 'Thông báo'}
              </strong>
            </CToastHeader>
            <CToastBody>{toast.message}</CToastBody>
          </CToast>
        ))}
      </CToaster>

      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Quản lý sản phẩm</strong>
              <div className="d-flex gap-2">
                <CButton 
                  color="light" 
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <CIcon icon={cilReload} className="me-1" />
                  Làm mới
                </CButton>
                <CButton 
                  color="primary" 
                  onClick={() => navigate('/products/create')}
                >
                  <CIcon icon={cilPlus} className="me-1" />
                  Thêm sản phẩm
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody>
              {/* Search and Filter Section */}
              <div className="mb-4">
                <CForm onSubmit={handleSearchSubmit}>
                  <CRow className="g-3">
                    <CCol md={8}>
                      <CInputGroup>
                        <CFormInput
                          placeholder="Tìm kiếm theo tên sản phẩm..."
                          value={searchInput || ''}
                          onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <CButton type="submit" color="primary" disabled={loading}>
                          <CIcon icon={cilSearch} />
                        </CButton>
                        {(searchInput || statusFilter || sortOrder || priceFrom || priceTo || selectedCategoryId || selectedBrandId) && (
                          <CButton 
                            type="button" 
                            color="secondary" 
                            variant="outline"
                            onClick={handleClearSearch}
                          >
                            <CIcon icon={cilX} />
                          </CButton>
                        )}
                      </CInputGroup>
                    </CCol>
                    <CCol md={4} className="d-flex justify-content-end">                        <CButton
                          color="light"
                          onClick={() => setShowFilters(!showFilters)}
                          className="d-flex align-items-center"
                        >
                          <CIcon icon={cilFilter} className="me-1" />
                          Bộ lọc
                          {(searchTerm || statusFilter || sortOrder || priceFrom || priceTo || selectedCategoryId || selectedBrandId) && (
                            <CBadge color="primary" className="ms-1">
                              {[searchTerm, statusFilter, sortOrder, priceFrom, priceTo, selectedCategoryId, selectedBrandId].filter(Boolean).length}
                            </CBadge>
                          )}
                        </CButton>
                    </CCol>
                  </CRow>
                </CForm>

                {/* Advanced Filters */}
                <CCollapse visible={showFilters}>
                  <CCard className="mt-3 border-0 bg-light">
                    <CCardBody>
                      <CRow className="g-3">
                        <CCol md={6}>
                          <label className="form-label">Trạng thái</label>
                          <CFormSelect
                            value={statusFilter || ''}
                            onChange={(e) => setStatusFilter(e.target.value)}
                          >
                            <option value="">Tất cả trạng thái</option>
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Tạm dừng</option>
                          </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                          <label className="form-label">Sắp xếp theo giá</label>
                          <CFormSelect
                            value={sortOrder || ''}
                            onChange={(e) => setSortOrder(e.target.value)}
                          >
                            <option value="">Mặc định (Mới nhất)</option>
                            <option value="price-asc">Giá thấp đến cao</option>
                            <option value="price-desc">Giá cao đến thấp</option>
                          </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                          <label className="form-label">Khoảng giá từ</label>
                          <CFormInput
                            type="number"
                            placeholder="Giá từ..."
                            value={priceFrom || ''}
                            onChange={(e) => setPriceFrom(e.target.value)}
                            min="0"
                            step="1000"
                          />
                        </CCol>
                        <CCol md={6}>
                          <label className="form-label">Khoảng giá đến</label>
                          <CFormInput
                            type="number"
                            placeholder="Giá đến..."
                            value={priceTo || ''}
                            onChange={(e) => setPriceTo(e.target.value)}
                            min="0"
                            step="1000"
                          />
                        </CCol>
                        <CCol md={6}>
                          <label className="form-label">Danh mục</label>
                          <CFormSelect
                            value={selectedCategoryId || ''}
                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                          >
                            <option value="">Tất cả danh mục</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                          <label className="form-label">Thương hiệu</label>
                          <CFormSelect
                            value={selectedBrandId || ''}
                            onChange={(e) => setSelectedBrandId(e.target.value)}
                          >
                            <option value="">Tất cả thương hiệu</option>
                            {brands.map((brand) => (
                              <option key={brand.id} value={brand.id}>
                                {brand.name}
                              </option>
                            ))}
                          </CFormSelect>
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CCollapse>

                {/* Active Filters Display */}
                {(searchTerm || statusFilter || sortOrder || priceFrom || priceTo || selectedCategoryId || selectedBrandId) && (
                  <div className="mt-3 p-3 bg-info bg-opacity-10 border border-info border-opacity-25 rounded">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                      <small className="text-info fw-bold me-2">Đang lọc theo:</small>
                      {searchTerm && (
                        <CBadge color="info" className="px-2 py-1">
                          Tên: {searchTerm}
                        </CBadge>
                      )}
                      {statusFilter && (
                        <CBadge color="info" className="px-2 py-1">
                          Trạng thái: {statusFilter === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                        </CBadge>
                      )}
                      {sortOrder && (
                        <CBadge color="info" className="px-2 py-1">
                          Sắp xếp: {sortOrder === 'price-asc' ? 'Giá thấp → cao' : sortOrder === 'price-desc' ? 'Giá cao → thấp' : 'Mặc định'}
                        </CBadge>
                      )}
                      {(priceFrom || priceTo) && (
                        <CBadge color="info" className="px-2 py-1">
                          Giá: {priceFrom && priceTo ? `${Number(priceFrom).toLocaleString()} - ${Number(priceTo).toLocaleString()}` : 
                               priceFrom ? `từ ${Number(priceFrom).toLocaleString()}` : 
                               `đến ${Number(priceTo).toLocaleString()}`} VNĐ
                        </CBadge>
                      )}
                      {selectedCategoryId && (
                        <CBadge color="info" className="px-2 py-1">
                          Danh mục: {categories.find(c => c.id === selectedCategoryId)?.name || selectedCategoryId}
                        </CBadge>
                      )}
                      {selectedBrandId && (
                        <CBadge color="info" className="px-2 py-1">
                          Thương hiệu: {brands.find(b => b.id === selectedBrandId)?.name || selectedBrandId}
                        </CBadge>
                      )}
                    </div>
                    <CButton 
                      size="sm" 
                      color="info" 
                      variant="outline" 
                      onClick={handleClearSearch}
                      className="mt-1"
                    >
                      <CIcon icon={cilX} className="me-1" />
                      Xóa tất cả bộ lọc
                    </CButton>
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <CAlert color="danger" className="mb-4">
                  <div className="d-flex align-items-center">
                    <CIcon icon={cilXCircle} className="me-2" />
                    {error}
                  </div>
                </CAlert>
              )}

              {/* Loading or Content */}
              {loading ? (
                <LoadingSpinner text="Đang tải sản phẩm..." />
              ) : !products || products.length === 0 ? (
                <ProductEmptyState 
                  isSearching={!!searchTerm || !!statusFilter || !!sortOrder}
                  onCreateNew={() => navigate('/products/create')}
                  onRefresh={handleRefresh}
                />
              ) : (
                <>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell scope="col" style={{ width: '120px' }} className="text-center">Hình ảnh</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Tên sản phẩm</CTableHeaderCell>
                        <CTableHeaderCell scope="col" style={{ width: '150px' }} className="text-end">Giá</CTableHeaderCell>
                        <CTableHeaderCell scope="col" style={{ width: '100px' }} className="text-center">Số lượng</CTableHeaderCell>
                        <CTableHeaderCell scope="col" style={{ width: '120px' }} className="text-center">Trạng thái</CTableHeaderCell>
                        <CTableHeaderCell scope="col" style={{ width: '100px' }} className="text-center">Thao tác</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {products.map((product) => (
                        <CTableRow key={product?.id || Math.random()}>
                          <CTableDataCell className="text-center align-middle">
                            <div 
                              style={{ 
                                width: '80px', 
                                height: '80px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                margin: '0 auto'
                              }}
                            >
                              {product?.thumbnailUrl || (product?.images && product.images.length > 0 && product.images[0]?.imageUrl) ? (
                                <img
                                  src={product?.thumbnailUrl || product.images[0]?.imageUrl}
                                  alt={product?.title || 'Product'}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                style={{ 
                                  display: product?.thumbnailUrl || (product?.images && product.images.length > 0) ? 'none' : 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '100%',
                                  height: '100%',
                                  fontSize: '12px',
                                  color: '#6c757d',
                                  textAlign: 'center'
                                }}
                              >
                                Không có ảnh
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell className="align-middle">
                            <strong>{product?.title || 'N/A'}</strong>
                          </CTableDataCell>
                          <CTableDataCell className="text-end align-middle">
                            <div>
                              <strong className="text-success">
                                {formatPrice(product?.priceNew)}
                              </strong>
                              {product?.priceOld && product?.priceOld !== product?.priceNew && (
                                <div>
                                  <small className="text-muted text-decoration-line-through">
                                    {formatPrice(product?.priceOld)}
                                  </small>
                                </div>
                              )}
                            </div>
                          </CTableDataCell>
                          <CTableDataCell className="text-center align-middle">
                            <CBadge color={(product?.quantity || 0) > 0 ? 'success' : 'danger'}>
                              {product?.quantity || 0}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell className="text-center align-middle">
                            <CBadge color={product?.active ? 'success' : 'danger'}>
                              {product?.active ? 'Hoạt động' : 'Tạm dừng'}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell className="text-center align-middle">
                            <CDropdown>
                              <CDropdownToggle color="ghost" caret={false} disabled={loading}>
                                <CIcon icon={cilOptions} />
                              </CDropdownToggle>
                              <CDropdownMenu>
                                <CDropdownItem onClick={() => navigate(`/products/edit/${product?.id}`)}>
                                  <CIcon icon={cilPencil} className="me-2" />
                                  Chỉnh sửa
                                </CDropdownItem>
                                <CDropdownItem
                                  onClick={() => handleStatusToggle(product?.id, product?.active)}
                                >
                                  <CIcon 
                                    icon={product?.active ? cilToggleOff : cilToggleOn} 
                                    className="me-2" 
                                  />
                                  {product?.active ? 'Tạm dừng' : 'Kích hoạt'}
                                </CDropdownItem>
                                <CDropdownItem
                                  onClick={() => setDeleteModal({ visible: true, product })}
                                  className="text-danger"
                                >
                                  <CIcon icon={cilTrash} className="me-2" />
                                  Xóa
                                </CDropdownItem>
                              </CDropdownMenu>
                            </CDropdown>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                  
                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-3 d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        Trang {pagination.currentPage} / {pagination.totalPages} - 
                        Tổng số: {pagination.totalElements || 0} sản phẩm
                      </small>
                      <CPagination aria-label="Page navigation">
                        <CPaginationItem
                          disabled={!pagination.hasPrevious}
                          onClick={() => pagination.hasPrevious && loadProducts(pagination.currentPage - 1, searchTerm, statusFilter, sortOrder, priceFrom, priceTo, selectedCategoryId, selectedBrandId)}
                        >
                          Trước
                        </CPaginationItem>
                        
                        {/* Page numbers */}
                        {(() => {
                          const totalPages = pagination.totalPages;
                          const currentPage = pagination.currentPage;
                          const maxPagesToShow = 5;
                          
                          let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
                          let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
                          
                          // Adjust start page if we're near the end
                          if (endPage - startPage + 1 < maxPagesToShow) {
                            startPage = Math.max(1, endPage - maxPagesToShow + 1);
                          }
                          
                          const pages = [];
                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <CPaginationItem
                                key={i}
                                active={i === currentPage}
                                onClick={() => loadProducts(i, searchTerm, statusFilter, sortOrder, priceFrom, priceTo, selectedCategoryId, selectedBrandId)}
                              >
                                {i}
                              </CPaginationItem>
                            );
                          }
                          
                          return pages;
                        })()}
                        
                        <CPaginationItem
                          disabled={!pagination.hasNext}
                          onClick={() => pagination.hasNext && loadProducts(pagination.currentPage + 1, searchTerm, statusFilter, sortOrder, priceFrom, priceTo, selectedCategoryId, selectedBrandId)}
                        >
                          Sau
                        </CPaginationItem>
                      </CPagination>
                    </div>
                  )}
                  
                  {/* Total count for single page */}
                  {pagination.totalPages <= 1 && (
                    <div className="mt-3">
                      <small className="text-muted">
                        Tổng số: {pagination.totalElements || 0} sản phẩm
                      </small>
                    </div>
                  )}
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Delete Confirmation Modal */}
      <CModal
        visible={deleteModal.visible}
        onClose={() => setDeleteModal({ visible: false, product: null })}
      >
        <CModalHeader>
          <CModalTitle>Xác nhận xóa</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Bạn có chắc chắn muốn xóa sản phẩm "{deleteModal.product?.title || 'này'}"?
          <br />
          <small className="text-danger">Hành động này không thể hoàn tác.</small>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setDeleteModal({ visible: false, product: null })}
          >
            Hủy
          </CButton>
          <CButton color="danger" onClick={handleDeleteProduct}>
            Xóa
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ProductList
