import defaultAvatar from '../../../assets/images/avatars/default-avatar.png';
import React, { useState, useEffect } from 'react'
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
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CPagination,
  CPaginationItem,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CSpinner,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormSelect,
  CFormCheck,
  CAvatar,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSearch,
  cilOptions,
  cilUser,
} from '@coreui/icons'
import { userService, roleService } from '../../../services'
import { useApiCall } from '../../../hooks/useApiCall'

const UserList = () => {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoleCode, setSelectedRoleCode] = useState('')
  const [roleModal, setRoleModal] = useState({
    visible: false,
    user: null,
    selectedRoles: []
  })
  
  const { execute: callApi } = useApiCall()

  const fetchRoles = async () => {
    try {
      const response = await callApi(() => roleService.getAllRoles())
      if (response.success) {
        setRoles(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  const fetchUsers = async (page = 1, search = '', roleCode = '') => {
    setLoading(true)
    try {
      const params = {
        pageIndex: page,
        pageSize: 10,
        ...(search && { email: search }),
        ...(roleCode && { roleCode: roleCode }),
      }
      
      const response = await callApi(() => userService.getUsers(params))
      if (response.success) {
        const usersData = Array.isArray(response.data) 
          ? response.data 
          : response.data.content || response.data.data || []
        setUsers(usersData)
        setTotalPages(response.data.totalPages || 1)
        setCurrentPage(page)
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      fetchUsers(1, searchTerm, selectedRoleCode)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedRoleCode])

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchUsers(1, searchTerm, selectedRoleCode)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchUsers(page, searchTerm, selectedRoleCode)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedRoleCode('')
    setCurrentPage(1)
    fetchUsers(1, '', '')
  }

  const handleRoleChange = async () => {
    if (!roleModal.user || roleModal.selectedRoles.length === 0) return

    try {
      const response = await callApi(() => 
        userService.changeUserRole(roleModal.user.id, roleModal.selectedRoles),
        {
          successMessage: 'Phân quyền người dùng thành công!',
          showSuccessNotification: true,
          onSuccess: () => {
            setRoleModal({ visible: false, user: null, selectedRoles: [] })
            fetchUsers(currentPage, searchTerm, selectedRoleCode)
          }
        }
      )
    } catch (error) {
      console.error('Error updating user roles:', error)
    }
  }

  const openRoleModal = (user) => {
    const currentRoleCodes = user.roles ? user.roles.map(role => role.code) : []
    setRoleModal({
      visible: true,
      user,
      selectedRoles: currentRoleCodes
    })
  }

  const handleRoleSelection = (roleCode) => {
    setRoleModal(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(roleCode)
        ? prev.selectedRoles.filter(code => code !== roleCode)
        : [...prev.selectedRoles, roleCode]
    }))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getRolesBadge = (roles) => {    
    if (!roles) {
      console.log('Roles is undefined/null');
      return <CBadge color="secondary">No roles</CBadge>;
    }
    
    if (typeof roles === 'string') {
      return (
        <CBadge 
          color={roles === 'ADMIN' ? 'danger' : roles === 'USER' ? 'info' : roles === 'STAFF' ? 'warning' : 'secondary'}
          className="me-1"
        >
          {roles}
        </CBadge>
      );
    }
    
    if (!Array.isArray(roles)) {
      console.log('Roles is not an array:', typeof roles, roles);
      return <CBadge color="secondary">Invalid roles</CBadge>;
    }
    
    if (roles.length === 0) {
      return <CBadge color="secondary">No roles</CBadge>;
    }
    
    return roles.map((role, index) => {
      const roleName = typeof role === 'object' && role.name ? role.name: 
                      typeof role === 'object' && role.name ? role.name : role;
      
      return (
        <CBadge 
          key={index} 
          color={role.code === 'ADMIN' ? 'danger' : role.code === 'USER' ? 'info' : role.code === 'STAFF' ? 'warning' : 'secondary'}
          className="me-1"
        >
          {roleName}
        </CBadge>
      );
    });
  }

  const generatePaginationItems = () => {
    const items = []
    const maxVisiblePages = 5 
    const halfVisible = Math.floor(maxVisiblePages / 2)
    
    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, currentPage + halfVisible)
    
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages)
    }
    if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1)
    }
    
    if (startPage > 1) {
      items.push(
        <CPaginationItem
          key={1}
          onClick={() => handlePageChange(1)}
          style={{ cursor: 'pointer' }}
          title="Trang 1"
        >
          1
        </CPaginationItem>
      )
      
      if (startPage > 2) {
        items.push(
          <CPaginationItem key="start-ellipsis" disabled>
            ...
          </CPaginationItem>
        )
      }
    }
    
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <CPaginationItem
          key={page}
          active={currentPage === page}
          onClick={() => handlePageChange(page)}
          style={{ cursor: 'pointer' }}
          title={`Trang ${page}`}
        >
          {page}
        </CPaginationItem>
      )
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <CPaginationItem key="end-ellipsis" disabled>
            ...
          </CPaginationItem>
        )
      }
      
      items.push(
        <CPaginationItem
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          style={{ cursor: 'pointer' }}
          title={`Trang ${totalPages}`}
        >
          {totalPages}
        </CPaginationItem>
      )
    }
    
    return items
  }

  return (
    <>
      <style>
        {`
          .user-avatar {
            overflow: hidden !important;
            border-radius: 50% !important;
          }
          
          .user-avatar img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            border-radius: 50% !important;
          }
          
          .avatar-md {
            width: 40px !important;
            height: 40px !important;
          }
        `}
      </style>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Quản lý người dùng</strong>
            </CCardHeader>
            <CCardBody>
              {/* Search and Filters */}
              <CRow className="mb-3">
                <CCol md={6}>
                  <form onSubmit={handleSearch}>
                    <CInputGroup>
                      <CFormInput
                        placeholder="Tìm kiếm theo email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        type="email"
                      />
                      <CInputGroupText>
                        <CButton type="submit" color="light">
                          <CIcon icon={cilSearch} />
                        </CButton>
                      </CInputGroupText>
                      {searchTerm && (
                        <CInputGroupText>
                          <CButton 
                            color="light" 
                            onClick={() => setSearchTerm('')}
                            title="Xóa tìm kiếm"
                          >
                            ×
                          </CButton>
                        </CInputGroupText>
                      )}
                    </CInputGroup>
                  </form>
                  {searchTerm && (
                    <small className="text-muted mt-1 d-block">
                      Đang tìm kiếm: "{searchTerm}"
                    </small>
                  )}
                </CCol>
                <CCol md={6}>
                  <CFormSelect
                    value={selectedRoleCode}
                    onChange={(e) => setSelectedRoleCode(e.target.value)}
                    className="mb-2"
                  >
                    <option value="">Tất cả vai trò</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.code}>
                        {role.name}
                      </option>
                    ))}
                  </CFormSelect>
                  {selectedRoleCode && (
                    <small className="text-muted d-block">
                      Lọc theo vai trò: {roles.find(r => r.code === selectedRoleCode)?.name}
                    </small>
                  )}
                </CCol>
              </CRow>
              
              {/* Clear Filters Button */}
              {(searchTerm || selectedRoleCode) && (
                <CRow className="mb-3">
                  <CCol xs={12}>
                    <CButton 
                      color="secondary" 
                      variant="outline" 
                      size="sm"
                      onClick={handleClearFilters}
                    >
                      Xóa tất cả bộ lọc
                    </CButton>
                  </CCol>
                </CRow>
              )}

              {/* Table */}
              {loading ? (
                <div className="text-center py-4">
                  <CSpinner color="primary" />
                </div>
              ) : (
                <>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell scope="col">Người dùng</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Vai trò</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Ngày tạo</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Thao tác</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {Array.isArray(users) && users.map((user) => (
                        <CTableRow key={user.id}>
                          <CTableDataCell>
                            <div className="d-flex align-items-center">
                              <CAvatar
                                src={user.profilePicUrl && typeof user.profilePicUrl === 'string' && user.profilePicUrl.trim() !== ''
                                  ? user.profilePicUrl
                                  : defaultAvatar}
                                size="md"
                                className="me-3 user-avatar avatar-md"
                                onError={(e) => {
                                  if (e.target.src !== defaultAvatar) {
                                    e.target.src = defaultAvatar;
                                  }
                                }}
                              />
                              <div>
                                <strong>{user.username}</strong>
                                <br />
                                <small className="text-muted">ID: {user.id}</small>
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            {user.email}
                          </CTableDataCell>
                          <CTableDataCell>
                            {getRolesBadge(user.roles)}
                          </CTableDataCell>
                          <CTableDataCell>
                            <small>{formatDate(user.createdAt)}</small>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CDropdown>
                              <CDropdownToggle color="ghost" caret={false}>
                                <CIcon icon={cilOptions} />
                              </CDropdownToggle>
                              <CDropdownMenu>
                                <CDropdownItem
                                  onClick={() => openRoleModal(user)}
                                >
                                  <CIcon icon={cilUser} className="me-2" />
                                  Phân quyền
                                </CDropdownItem>
                              </CDropdownMenu>
                            </CDropdown>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">
                          Trang {currentPage} / {totalPages} (Hiển thị tối đa {users.length} kết quả)
                        </small>
                        <small className="text-muted">
                          Tổng: {totalPages} trang
                        </small>
                      </div>
                      <CPagination align="center">
                        <CPaginationItem
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(1)}
                          style={{ cursor: currentPage === 1 ? 'default' : 'pointer' }}
                          title="Trang đầu"
                        >
                          «
                        </CPaginationItem>
                        <CPaginationItem
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                          style={{ cursor: currentPage === 1 ? 'default' : 'pointer' }}
                          title="Trang trước"
                        >
                          Trước
                        </CPaginationItem>
                        {generatePaginationItems()}
                        <CPaginationItem
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
                          style={{ cursor: currentPage === totalPages ? 'default' : 'pointer' }}
                          title="Trang sau"
                        >
                          Sau
                        </CPaginationItem>
                        <CPaginationItem
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(totalPages)}
                          style={{ cursor: currentPage === totalPages ? 'default' : 'pointer' }}
                          title="Trang cuối"
                        >
                          »
                        </CPaginationItem>
                      </CPagination>
                    </div>
                  )}
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Role Assignment Modal */}
      <CModal
        visible={roleModal.visible}
        onClose={() => setRoleModal({ visible: false, user: null, selectedRoles: [] })}
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>Phân quyền người dùng</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Người dùng: <strong>{roleModal.user?.username}</strong></p>
          <p>Email: <strong>{roleModal.user?.email}</strong></p>
          <p className="mb-3">Chọn vai trò cho người dùng:</p>
          
          <div className="d-flex flex-wrap gap-3">
            {roles.map((role) => (
              <CFormCheck
                key={role.id}
                id={`role-${role.id}`}
                checked={roleModal.selectedRoles.includes(role.code)}
                onChange={() => handleRoleSelection(role.code)}
                label={
                  <CBadge 
                    color={role.code === 'ADMIN' ? 'danger' : role.code === 'USER' ? 'info' : role.code === 'STAFF' ? 'warning' : 'secondary'}
                    className="ms-1"
                  >
                    {role.code}
                  </CBadge>
                }
              />
            ))}
          </div>
          
          {roleModal.selectedRoles.length === 0 && (
            <p className="text-warning mt-2">
              <small>Vui lòng chọn ít nhất một vai trò</small>
            </p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setRoleModal({ visible: false, user: null, selectedRoles: [] })}
          >
            Hủy
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleRoleChange}
            disabled={roleModal.selectedRoles.length === 0}
          >
            Cập nhật vai trò
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default UserList
