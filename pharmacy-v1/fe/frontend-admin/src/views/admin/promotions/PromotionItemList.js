import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
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
  CSpinner,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormInput,
  CFormLabel,
  CFormFeedback,
  CPagination,
  CPaginationItem,
  CBadge,
  CAlert,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilTrash,
  cilPlus,
  cilSave,
  cilList,
  cilArrowLeft,
  cilPencil,
  cilSearch,
} from '@coreui/icons'
import { promotionService, productService } from '../../../services'
import { useApiCall } from '../../../hooks/useApiCall'

const PromotionItemList = () => {
  const { eventId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const promotion = location.state?.promotion

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState({ visible: false, item: null })
  const [deleteModal, setDeleteModal] = useState({ visible: false, items: [] })
  
  // Product search
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [currentProductPage, setCurrentProductPage] = useState(1)
  const [totalProductPages, setTotalProductPages] = useState(0)
  const [totalProductElements, setTotalProductElements] = useState(0)
  const PRODUCT_PAGE_SIZE = 20
  
  // Selected products for batch add
  const [selectedProducts, setSelectedProducts] = useState([])
  
  // Pagination state (1-based)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const PAGE_SIZE = 10
  
  const { execute: callApi } = useApiCall()

  const [formErrors, setFormErrors] = useState({})

  const fetchItems = async (page = 1) => {
    setLoading(true)
    try {
      const params = {
        pageIndex: page,
        pageSize: PAGE_SIZE,
      }
      
      const response = await callApi(() => promotionService.getPromotionItems(eventId, params))
      if (response.success) {
        const data = response.data
        setItems(data.content || [])
        setTotalPages(data.totalPages || 1)
        setTotalElements(data.totalElements || 0)
        setCurrentPage(data.currentPage || page)
      } else {
        setItems([])
      }
    } catch (error) {
      console.error('Error fetching items:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const searchProducts = async (keyword = '', page = 1) => {
    setSearchLoading(true)
    try {
      const params = {
        pageIndex: page,
        pageSize: PRODUCT_PAGE_SIZE
      }
      
      // Nếu có keyword thì filter theo tên
      if (keyword.trim()) {
        params.name = keyword
      }
      
      const response = await callApi(() => productService.getProductsCMS(params))
      if (response.success) {
        const data = response.data
        setProducts(data.content || data.data || [])
        setTotalProductPages(data.totalPages || 1)
        setTotalProductElements(data.totalElements || 0)
        setCurrentProductPage(data.currentPage || page)
      }
    } catch (error) {
      console.error('Error searching products:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    if (eventId) {
      fetchItems()
    }
  }, [eventId])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentProductPage(1)
      searchProducts(searchTerm, 1)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handlePageChange = (page) => {
    fetchItems(page)
  }

  const openAddModal = () => {
    setAddModal(true)
    setSearchTerm('')
    setSelectedProducts([])
    setCurrentProductPage(1)
    // Load toàn bộ sản phẩm khi mở modal
    searchProducts('', 1)
  }

  const handleProductPageChange = (page) => {
    searchProducts(searchTerm, page)
  }

  const handleProductSelect = (product) => {
    const exists = selectedProducts.find(p => p.productId === product.id)
    if (exists) {
      setSelectedProducts(selectedProducts.filter(p => p.productId !== product.id))
    } else {
      setSelectedProducts([...selectedProducts, {
        productId: product.id,
        productName: product.title,
        originalPrice: product.priceNew,
        salePrice: Math.round(product.priceNew * 0.9) // Default 10% discount
      }])
    }
  }

  const handleSalePriceChange = (productId, value) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.productId === productId ? { ...p, salePrice: parseInt(value) || 0 } : p
    ))
  }

  const validateBatchAdd = () => {
    if (selectedProducts.length === 0) {
      return false
    }

    for (const product of selectedProducts) {
      if (!product.salePrice || product.salePrice <= 0) {
        return false
      }
      if (product.salePrice >= product.originalPrice) {
        return false
      }
    }
    
    return true
  }

  const handleBatchAdd = async () => {
    if (!validateBatchAdd()) {
      return
    }

    try {
      const data = {
        promotionEventId: parseInt(eventId),
        promotionItemRequests: selectedProducts.map(p => ({
          productId: p.productId,
          salePrice: p.salePrice
        }))
      }

      const response = await callApi(() => promotionService.createPromotionItems(data), {
        successMessage: `Thêm thành công ${selectedProducts.length} sản phẩm`,
        errorMessage: 'Thêm sản phẩm thất bại',
      })

      if (response.success && response.data) {
        const result = response.data
        if (result.failedCount > 0) {
          alert(`Thêm thành công ${result.successCount}/${result.totalRequested} sản phẩm.\nThất bại: ${result.failedCount}`)
        }
      }

      setAddModal(false)
      setSelectedProducts([])
      setSearchTerm('')
      setProducts([])
      fetchItems(currentPage)
    } catch (error) {
      console.error('Error adding items:', error)
    }
  }

  const handleUpdateItem = async (item, newSalePrice) => {
    try {
      await callApi(() => promotionService.updatePromotionItem(item.id, {
        productId: item.productId,
        salePrice: parseInt(newSalePrice)
      }), {
        successMessage: 'Cập nhật giá sale thành công',
        errorMessage: 'Cập nhật giá sale thất bại',
      })

      setEditModal({ visible: false, item: null })
      fetchItems(currentPage)
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  const handleDeleteItems = async (itemIds) => {
    try {
      await callApi(() => promotionService.deletePromotionItems(itemIds), {
        successMessage: 'Xóa sản phẩm thành công',
        errorMessage: 'Xóa sản phẩm thất bại',
      })

      setDeleteModal({ visible: false, items: [] })
      fetchItems(currentPage)
    } catch (error) {
      console.error('Error deleting items:', error)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value)
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null
    
    const pages = []
    const showPages = 5
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2))
    let endPage = Math.min(totalPages, startPage + showPages - 1)
    
    if (endPage - startPage < showPages - 1) {
      startPage = Math.max(1, endPage - showPages + 1)
    }
    
    return (
      <CPagination align="center">
        <CPaginationItem 
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Trước
        </CPaginationItem>
        
        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
          <CPaginationItem
            key={page}
            active={page === currentPage}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </CPaginationItem>
        ))}
        
        <CPaginationItem 
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Sau
        </CPaginationItem>
      </CPagination>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <CButton
                  color="light"
                  size="sm"
                  className="me-3"
                  onClick={() => navigate('/promotions')}
                >
                  <CIcon icon={cilArrowLeft} className="me-2" />
                  Quay lại
                </CButton>
                <CIcon icon={cilList} size="xl" className="me-2" />
                <strong>Sản phẩm trong chương trình: {promotion?.name || 'N/A'}</strong>
              </div>
              <CButton color="primary" onClick={openAddModal}>
                <CIcon icon={cilPlus} className="me-2" />
                Thêm sản phẩm
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <div className="mb-3 text-muted">
              <small>Tổng số: {totalElements} sản phẩm</small>
            </div>

            {loading ? (
              <div className="text-center p-5">
                <CSpinner color="primary" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center p-5 text-muted">
                <CIcon icon={cilList} size="3xl" className="mb-3 opacity-25" />
                <p>Chưa có sản phẩm nào trong chương trình này</p>
              </div>
            ) : (
              <>
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Sản phẩm</CTableHeaderCell>
                      <CTableHeaderCell>Giá gốc</CTableHeaderCell>
                      <CTableHeaderCell>Giá sale</CTableHeaderCell>
                      <CTableHeaderCell>Giảm giá</CTableHeaderCell>
                      <CTableHeaderCell>Hành động</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {items.map((item, index) => {
                      const discount = item.product && item.product.priceNew 
                        ? Math.round((1 - item.salePrice / item.product.priceNew) * 100)
                        : 0
                      
                      return (
                        <CTableRow key={item.id}>
                          <CTableHeaderCell scope="row">
                            {(currentPage - 1) * PAGE_SIZE + index + 1}
                          </CTableHeaderCell>
                          <CTableDataCell>
                            <strong>{item.product?.title || 'N/A'}</strong>
                          </CTableDataCell>
                          <CTableDataCell>
                            {item.product?.priceNew ? formatCurrency(item.product.priceNew) : 'N/A'}
                          </CTableDataCell>
                          <CTableDataCell>
                            <strong className="text-danger">{formatCurrency(item.salePrice)}</strong>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color="success">-{discount}%</CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButton
                              color="info"
                              size="sm"
                              className="me-2"
                              onClick={() => setEditModal({ visible: true, item })}
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={() => setDeleteModal({ visible: true, items: [item.id] })}
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      )
                    })}
                  </CTableBody>
                </CTable>

                {renderPagination()}
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Add Products Modal */}
      <CModal
        size="xl"
        visible={addModal}
        onClose={() => {
          setAddModal(false)
          setSelectedProducts([])
          setSearchTerm('')
          setProducts([])
        }}
      >
        <CModalHeader>
          <CModalTitle>Thêm sản phẩm vào chương trình</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol md={12} className="mb-3">
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilSearch} />
                </CInputGroupText>
                <CFormInput
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CInputGroup>
            </CCol>

            {/* Search Results */}
            <CCol md={12} className="mb-3">
              {searchLoading ? (
                <div className="text-center p-3">
                  <CSpinner size="sm" />
                  <div className="small text-muted mt-2">Đang tải danh sách sản phẩm...</div>
                </div>
              ) : products.length > 0 ? (
                <div>
                  <div className="mb-2 d-flex justify-content-between align-items-center">
                    <small className="text-muted">Tìm thấy {totalProductElements} sản phẩm (Trang {currentProductPage}/{totalProductPages})</small>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '4px' }}>
                    {products.map(product => (
                      <div
                        key={product.id}
                        style={{ 
                          padding: '10px', 
                          borderBottom: '1px solid #dee2e6',
                          cursor: 'pointer',
                          backgroundColor: selectedProducts.find(p => p.productId === product.id) ? '#e7f3ff' : 'white'
                        }}
                        onClick={() => handleProductSelect(product)}
                      >
                        <strong>{product.title}</strong>
                        <div className="small text-muted">Giá: {formatCurrency(product.priceNew)}</div>
                      </div>
                    ))}
                  </div>
                  {totalProductPages > 1 && (
                    <CPagination align="center" size="sm" className="mt-2">
                      <CPaginationItem 
                        disabled={currentProductPage === 1}
                        onClick={() => handleProductPageChange(currentProductPage - 1)}
                      >
                        Trước
                      </CPaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalProductPages) }, (_, i) => {
                        let page;
                        if (totalProductPages <= 5) {
                          page = i + 1;
                        } else if (currentProductPage <= 3) {
                          page = i + 1;
                        } else if (currentProductPage >= totalProductPages - 2) {
                          page = totalProductPages - 4 + i;
                        } else {
                          page = currentProductPage - 2 + i;
                        }
                        return (
                          <CPaginationItem
                            key={page}
                            active={page === currentProductPage}
                            onClick={() => handleProductPageChange(page)}
                          >
                            {page}
                          </CPaginationItem>
                        );
                      })}
                      
                      <CPaginationItem 
                        disabled={currentProductPage === totalProductPages}
                        onClick={() => handleProductPageChange(currentProductPage + 1)}
                      >
                        Sau
                      </CPaginationItem>
                    </CPagination>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted p-3">
                  <small>Không tìm thấy sản phẩm nào</small>
                </div>
              )}
            </CCol>

            {/* Selected Products */}
            {selectedProducts.length > 0 && (
              <CCol md={12}>
                <h6>Sản phẩm đã chọn ({selectedProducts.length})</h6>
                <CTable striped>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Sản phẩm</CTableHeaderCell>
                      <CTableHeaderCell>Giá gốc</CTableHeaderCell>
                      <CTableHeaderCell>Giá sale *</CTableHeaderCell>
                      <CTableHeaderCell>Xóa</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {selectedProducts.map(product => (
                      <CTableRow key={product.productId}>
                        <CTableDataCell>{product.productName}</CTableDataCell>
                        <CTableDataCell>{formatCurrency(product.originalPrice)}</CTableDataCell>
                        <CTableDataCell>
                          <CFormInput
                            type="number"
                            size="sm"
                            value={product.salePrice}
                            onChange={(e) => handleSalePriceChange(product.productId, e.target.value)}
                            invalid={product.salePrice >= product.originalPrice || product.salePrice <= 0}
                          />
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => setSelectedProducts(selectedProducts.filter(p => p.productId !== product.productId))}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </CCol>
            )}
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => {
              setAddModal(false)
              setSelectedProducts([])
              setSearchTerm('')
              setProducts([])
            }}
          >
            Hủy
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleBatchAdd}
            disabled={!validateBatchAdd()}
          >
            <CIcon icon={cilSave} className="me-2" />
            Thêm {selectedProducts.length} sản phẩm
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit Item Modal */}
      <CModal
        visible={editModal.visible}
        onClose={() => setEditModal({ visible: false, item: null })}
      >
        <CModalHeader>
          <CModalTitle>Chỉnh sửa giá sale</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.target)
          handleUpdateItem(editModal.item, formData.get('salePrice'))
        }}>
          <CModalBody>
            <div className="mb-3">
              <CFormLabel>Sản phẩm</CFormLabel>
              <CFormInput value={editModal.item?.product?.title || ''} disabled />
            </div>
            <div className="mb-3">
              <CFormLabel>Giá gốc</CFormLabel>
              <CFormInput value={editModal.item?.product?.priceNew ? formatCurrency(editModal.item.product.priceNew) : ''} disabled />
            </div>
            <div className="mb-3">
              <CFormLabel>Giá sale *</CFormLabel>
              <CFormInput
                type="number"
                name="salePrice"
                defaultValue={editModal.item?.salePrice || ''}
                required
                min="1"
                max={editModal.item?.product?.priceNew || 999999999}
              />
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setEditModal({ visible: false, item: null })}>
              Hủy
            </CButton>
            <CButton color="primary" type="submit">
              <CIcon icon={cilSave} className="me-2" />
              Cập nhật
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Delete Confirmation Modal */}
      <CModal
        visible={deleteModal.visible}
        onClose={() => setDeleteModal({ visible: false, items: [] })}
      >
        <CModalHeader>
          <CModalTitle>Xác nhận xóa</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Bạn có chắc chắn muốn xóa {deleteModal.items.length} sản phẩm khỏi chương trình?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal({ visible: false, items: [] })}>
            Hủy
          </CButton>
          <CButton color="danger" onClick={() => handleDeleteItems(deleteModal.items)}>
            <CIcon icon={cilTrash} className="me-2" />
            Xóa
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default PromotionItemList
