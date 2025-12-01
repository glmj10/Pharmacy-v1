package com.pharmacy_backend.product_service.repository.impl;

import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.product_service.dto.request.ProductCMSFilterRequest;
import com.pharmacy_backend.product_service.dto.request.ProductFilterCustomerRequest;
import com.pharmacy_backend.product_service.entity.Brand;
import com.pharmacy_backend.product_service.entity.Category;
import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.repository.BrandRepository;
import com.pharmacy_backend.product_service.repository.CategoryRepository;
import com.pharmacy_backend.product_service.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ProductRepositoryImpl implements ProductRepository {
    private final JdbcTemplate jdbcTemplate;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public List<Product> findAll(int size, int offSet, ProductCMSFilterRequest filterRequest) {
        StringBuilder sql = new StringBuilder("SELECT p.* FROM products p");
        List<Object> params = new ArrayList<>();
        Brand brand = null;
        Category category = null;

        if (filterRequest.getBrandId() != null) {
            sql.append(" JOIN brands b ON p.brand_id = b.id");
            brand = brandRepository.findById(filterRequest.getBrandId())
                    .orElseThrow(() -> new CustomException(ErrorCode.BRAND_NOT_FOUND,
                            HttpStatus.NOT_FOUND, "Không tìm thấy thương hiệu"));
        }

        if (filterRequest.getCategoryId() != null) {
            sql.append(" JOIN products_categories pc ON pc.product_id = p.id");
            sql.append(" JOIN categories c ON pc.category_id = c.id");
            category = categoryRepository.findById(filterRequest.getCategoryId())
                    .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND,
                            HttpStatus.NOT_FOUND, "Không tìm thấy danh mục"));
        }

        sql.append(" WHERE 1=1");

        if (brand != null && brand.getId() != null) {
            sql.append(" AND p.brand_id = ?");
            params.add(filterRequest.getBrandId());
        }

        if (category != null && category.getId() != null) {
            sql.append(" AND pc.category_id = ?");
            params.add(filterRequest.getCategoryId());
        }

        if (filterRequest.getTitle() != null && !filterRequest.getTitle().isBlank()) {
            sql.append(" AND LOWER(title) LIKE ?");
            params.add("%" + filterRequest.getTitle().toLowerCase() + "%");
        }

        if (filterRequest.isActive() != null) {
            sql.append(" AND active = ?");
            params.add(filterRequest.isActive());
        }

        if (filterRequest.getPriceFrom() != null) {
            sql.append(" AND price_new >= ?");
            params.add(filterRequest.getPriceFrom());
        }

        if (filterRequest.getPriceTo() != null) {
            sql.append(" AND price_new <= ?");
            params.add(filterRequest.getPriceTo());
        }

        if (filterRequest.isAscending() != null) {
            sql.append(" ORDER BY price_new ");
            sql.append(Boolean.TRUE.equals(filterRequest.isAscending()) ? "ASC" : "DESC");
        } else {
            sql.append(" ORDER BY modified_at DESC");
        }

        sql.append(" LIMIT ? OFFSET ?");
        params.add(size);
        params.add(offSet);
        return jdbcTemplate.query(sql.toString(),
                new BeanPropertyRowMapper<>(Product.class), params.toArray());
    }

    @Override
    public List<Product> findAll(int size, int offSet, ProductFilterCustomerRequest filterCustomerRequest) {
        StringBuilder sql = new StringBuilder("SELECT p.* FROM products p");
        List<Object> params = new ArrayList<>();
        Brand brand = null;
        Category category = null;

        if (filterCustomerRequest.getBrand() != null) {
            sql.append(" JOIN brands b ON p.brand_id = b.id");
            brand = brandRepository.findBySlug(filterCustomerRequest.getBrand());
            if (brand == null) {
                return new ArrayList<>();
            }
        }

        if (filterCustomerRequest.getCategory() != null) {
            sql.append(" JOIN products_categories pc ON pc.product_id = p.id");
            sql.append(" JOIN categories c ON pc.category_id = c.id");
            category = categoryRepository.findBySlug(filterCustomerRequest.getCategory())
                    .orElse(null);
            if (category == null) {
                return new ArrayList<>();
            }
        }

        sql.append(" WHERE 1=1");

        if (brand != null && brand.getId() != null) {
            sql.append(" AND p.brand_id = ?");
            params.add(brand.getId());
        }

        if (category != null && category.getId() != null) {
            sql.append(" AND pc.category_id = ?");
            params.add(category.getId());
        }

        if (filterCustomerRequest.getTitle() != null && !filterCustomerRequest.getTitle().isBlank()) {
            sql.append(" AND LOWER(title) LIKE ?");
            params.add("%" + filterCustomerRequest.getTitle().toLowerCase() + "%");
        }

        sql.append(" AND active = ?");
        params.add(true);

        if (filterCustomerRequest.getPriceFrom() != null) {
            sql.append(" AND price_new >= ?");
            params.add(filterCustomerRequest.getPriceFrom());
        }

        if (filterCustomerRequest.getPriceTo() != null) {
            sql.append(" AND price_new <= ?");
            params.add(filterCustomerRequest.getPriceTo());
        }

        if (filterCustomerRequest.isAscending() != null) {
            sql.append(" ORDER BY price_new ");
            sql.append(Boolean.TRUE.equals(filterCustomerRequest.isAscending()) ? "ASC" : "DESC");
        } else {
            sql.append(" ORDER BY modified_at DESC");
        }

        sql.append(" LIMIT ? OFFSET ?");
        params.add(size);
        params.add(offSet);
        return jdbcTemplate.query(sql.toString(),
                new BeanPropertyRowMapper<>(Product.class), params.toArray());
    }

    @Override
    public Optional<Product> findById(Long id) {
        String sql = "SELECT * FROM products p where p.id = ? ";
        try {
            Product product = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                Product p = new Product();
                p.setId(rs.getLong("id"));
                p.setTitle(rs.getString("title"));
                p.setActiveIngredient(rs.getString("active_ingredient"));
                p.setDosageForm(rs.getString("dosage_form"));
                p.setDescription(rs.getString("description"));
                p.setIndication(rs.getString("indication"));
                p.setManufacturer(rs.getString("manufacturer"));
                p.setPriceOld(rs.getInt("price_old"));
                p.setPriceNew(rs.getInt("price_new"));
                p.setImportPrice(rs.getInt("import_price"));
                p.setPriority(rs.getInt("priority"));
                p.setQuantity(rs.getInt("quantity"));
                p.setNoted(rs.getString("noted"));
                p.setRegistrationNumber(rs.getString("registration_number"));
                p.setSlug(rs.getString("slug"));
                p.setThumbnail(rs.getString("thumbnail"));
                p.setNumberOfLikes(rs.getInt("number_of_likes"));
                p.setActive(rs.getBoolean("active"));
                p.setProductType(rs.getString("product_type"));

                Brand brand = brandRepository.findById(rs.getLong("brand_id"))
                        .orElse(null);
                p.setBrand(brand);

                List<Category> categories = categoryRepository.findAllByProductId(p.getId());
                p.setCategories(categories);
                return p;
            }, id);

            return Optional.ofNullable(product);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<Product> findBySlug(String slug) {
        String sql = "SELECT * FROM products p where p.slug = ? ";
        try {
            Product product = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                Product p = new Product();
                p.setId(rs.getLong("id"));
                p.setTitle(rs.getString("title"));
                p.setActiveIngredient(rs.getString("active_ingredient"));
                p.setDosageForm(rs.getString("dosage_form"));
                p.setDescription(rs.getString("description"));
                p.setIndication(rs.getString("indication"));
                p.setManufacturer(rs.getString("manufacturer"));
                p.setPriceOld(rs.getInt("price_old"));
                p.setPriceNew(rs.getInt("price_new"));
                p.setImportPrice(rs.getInt("import_price"));
                p.setPriority(rs.getInt("priority"));
                p.setQuantity(rs.getInt("quantity"));
                p.setNoted(rs.getString("noted"));
                p.setRegistrationNumber(rs.getString("registration_number"));
                p.setSlug(rs.getString("slug"));
                p.setThumbnail(rs.getString("thumbnail"));
                p.setNumberOfLikes(rs.getInt("number_of_likes"));
                p.setActive(rs.getBoolean("active"));
                p.setProductType(rs.getString("product_type"));

                Brand brand = brandRepository.findById(rs.getLong("brand_id"))
                        .orElse(null);
                p.setBrand(brand);

                return p;
            }, slug);
            return Optional.ofNullable(product);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public boolean existsBySlug(String slug) {
        String sql = "SELECT COUNT(*) FROM products WHERE slug = ? ";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, slug);
        return count != null && count > 0;
    }

    @Override
    public List<Product> findTop15ByActiveTrue() {
        String sql = "SELECT * FROM products WHERE active = true ORDER BY modified_at DESC LIMIT ? OFFSET ? ";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Product.class), 15, 0);
    }

    @Override
    public List<Product> findTop15ByBrandAndActive(Brand brand, boolean b) {
        String sql = "SELECT * FROM products " +
                "WHERE brand_id = ? AND active = ? ORDER BY modified_at DESC LIMIT 15 ";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Product.class),
                brand.getId(), b);
    }

    @Override
    public long countProducts(ProductCMSFilterRequest filterRequest) {
        StringBuilder sql = new StringBuilder("SELECT count(*) FROM products p");
        List<Object> params = new ArrayList<>();

        if (filterRequest.getBrandId() != null) {
            sql.append(" JOIN brands b ON p.brand_id = b.id");
        }

        if (filterRequest.getCategoryId() != null) {
            sql.append(" JOIN products_categories pc ON pc.product_id = p.id");
            sql.append(" JOIN categories c ON pc.category_id = c.id");
        }

        sql.append(" WHERE 1=1");

        if (filterRequest.getBrandId() != null) {
            sql.append(" AND p.brand_id = ?");
            params.add(filterRequest.getBrandId());
        }

        if (filterRequest.getCategoryId() != null) {
            sql.append(" AND pc.category_id = ?");
            params.add(filterRequest.getCategoryId());
        }

        if (filterRequest.getTitle() != null && !filterRequest.getTitle().isBlank()) {
            sql.append(" AND LOWER(title) LIKE ?");
            params.add("%" + filterRequest.getTitle().toLowerCase() + "%");
        }

        if (filterRequest.isActive() != null) {
            sql.append(" AND active = ?");
            params.add(filterRequest.isActive());
        }

        if (filterRequest.getPriceFrom() != null) {
            sql.append(" AND price_new >= ?");
            params.add(filterRequest.getPriceFrom());
        }

        if (filterRequest.getPriceTo() != null) {
            sql.append(" AND price_new <= ?");
            params.add(filterRequest.getPriceTo());
        }

        Long total = jdbcTemplate.queryForObject(sql.toString(), Long.class, params.toArray());
        return total != null ? total : 0L;
    }

    @Override
    public long countProducts(ProductFilterCustomerRequest filterCustomerRequest) {
        StringBuilder sql = new StringBuilder("SELECT count(*) FROM products p");
        List<Object> params = new ArrayList<>();
        Brand brand = null;
        Category category = null;

        if (filterCustomerRequest.getBrand() != null) {
            sql.append(" JOIN brands b ON p.brand_id = b.id");
            brand = brandRepository.findBySlug(filterCustomerRequest.getBrand());
            if (brand == null) {
                return 0L;
            }
        }

        if (filterCustomerRequest.getCategory() != null) {
            sql.append(" JOIN products_categories pc ON pc.product_id = p.id");
            sql.append(" JOIN categories c ON pc.category_id = c.id");
            category = categoryRepository.findBySlug(filterCustomerRequest.getCategory())
                    .orElse(null);
            if (category == null) {
                return 0L;
            }
        }

        sql.append(" WHERE 1=1");

        if (brand != null && brand.getId() != null) {
            sql.append(" AND p.brand_id = ?");
            params.add(brand.getId());
        }

        if (category != null && category.getId() != null) {
            sql.append(" AND pc.category_id = ?");
            params.add(category.getId());
        }

        if (filterCustomerRequest.getTitle() != null && !filterCustomerRequest.getTitle().isBlank()) {
            sql.append(" AND LOWER(title) LIKE ?");
            params.add("%" + filterCustomerRequest.getTitle().toLowerCase() + "%");
        }

        sql.append(" AND active = ?");
        params.add(true);

        if (filterCustomerRequest.getPriceFrom() != null) {
            sql.append(" AND price_new >= ?");
            params.add(filterCustomerRequest.getPriceFrom());
        }

        if (filterCustomerRequest.getPriceTo() != null) {
            sql.append(" AND price_new <= ?");
            params.add(filterCustomerRequest.getPriceTo());
        }

        Long total = jdbcTemplate.queryForObject(sql.toString(), Long.class, params.toArray());
        return total != null ? total : 0L;
    }

    @Override
    public long countProducts() {
        String sql = "SELECT COUNT(*) FROM products";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0L;
    }

    @Override
    public Product createProduct(Product product) {
        String sql = """
                INSERT INTO products (
                    title, active_ingredient, dosage_form, description,
                    indication, manufacturer, price_old, price_new,
                    import_price, priority, quantity, registration_number,
                    slug, thumbnail, number_of_likes, active, brand_id, product_type,
                    created_by, modified_by, created_at, modified_at, noted
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
                """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, product.getTitle());
            ps.setString(2, product.getActiveIngredient());
            ps.setString(3, product.getDosageForm());
            ps.setString(4, product.getDescription());
            ps.setString(5, product.getIndication());
            ps.setString(6, product.getManufacturer());
            ps.setObject(7, product.getPriceOld());
            ps.setObject(8, product.getPriceNew());
            ps.setObject(9, product.getImportPrice());
            ps.setObject(10, product.getPriority());
            ps.setObject(11, product.getQuantity());
            ps.setString(12, product.getRegistrationNumber());
            ps.setString(13, product.getSlug());
            ps.setString(14, product.getThumbnail());
            ps.setObject(15, product.getNumberOfLikes());
            ps.setObject(16, product.getActive());
            ps.setObject(17, product.getBrand() != null ? product.getBrand().getId() : null);
            ps.setString(18, product.getProductType());
            ps.setObject(19, product.getCreatedBy());
            ps.setObject(20, product.getModifiedBy());
            ps.setString(21, product.getNoted());
            return ps;
        }, keyHolder);

        List<Category> categories = product.getCategories();
        if (categories != null && !categories.isEmpty() && keyHolder.getKey() != null) {
            String categorySql = "INSERT INTO products_categories (product_id, category_id) VALUES (?, ?)";
            for (Category category : categories) {
                jdbcTemplate.update(categorySql, keyHolder.getKey().longValue(), category.getId());
            }
        }

        if (keyHolder.getKey() != null) {
            product.setId(keyHolder.getKey().longValue());
        }

        return product;
    }

    @Override
    public Product updateProduct(Long id, Product product) {
        String sql = """
                UPDATE products SET 
                    title=?, active_ingredient=?, dosage_form=?, description=?,
                    indication=?, manufacturer=?, price_old=?, price_new=?,
                    import_price=?, priority=?, quantity=?, registration_number=?,
                    slug=?, thumbnail=?, number_of_likes=?, active=?, brand_id=?, product_type=?,
                    modified_by=?, modified_at=NOW(), noted=?, updated_at=NOW()
                WHERE id=?
                """;

        jdbcTemplate.update(sql,
                product.getTitle(), product.getActiveIngredient(), product.getDosageForm(),
                product.getDescription(), product.getIndication(), product.getManufacturer(),
                product.getPriceOld(), product.getPriceNew(), product.getImportPrice(),
                product.getPriority(), product.getQuantity(), product.getRegistrationNumber(),
                product.getSlug(), product.getThumbnail(), product.getNumberOfLikes(),
                product.getActive(), product.getBrand() != null ? product.getBrand().getId() : null,
                product.getProductType(), product.getModifiedBy(), product.getNoted(), id
        );

        String deleteCategorySql = "DELETE FROM products_categories WHERE product_id = ?";
        jdbcTemplate.update(deleteCategorySql, id);
        List<Category> categories = product.getCategories();
        if (categories != null && !categories.isEmpty()) {
            String insertCategorySql = "INSERT INTO products_categories (product_id, category_id) VALUES (?, ?)";
            for (Category category : categories) {
                jdbcTemplate.update(insertCategorySql, id, category.getId());
            }
        }
        return product;
    }

    @Transactional
    @Override
    public void deleteProduct(Long id) {
        String deleteCategorySql = "DELETE FROM products_categories WHERE product_id = ?";
        jdbcTemplate.update(deleteCategorySql, id);

        String deleteCommentSql = "DELETE FROM comments WHERE product_id = ?";
        jdbcTemplate.update(deleteCommentSql, id);

        String deleteWishlistSql = "DELETE FROM wishlists WHERE product_id = ?";
        jdbcTemplate.update(deleteWishlistSql, id);

        String deleteProductImageSql = "DELETE FROM product_images WHERE product_id = ?";
        jdbcTemplate.update(deleteProductImageSql, id);

        String sql = "DELETE FROM products WHERE id=?";
        jdbcTemplate.update(sql, id);
    }

    @Override
    public List<Product> updateAll(List<Product> products) {
        String sql = """
                UPDATE products SET 
                    title=?, active_ingredient=?, dosage_form=?, description=?,
                    indication=?, manufacturer=?, price_old=?, price_new=?,
                    import_price=?, priority=?, quantity=?, registration_number=?,
                    slug=?, thumbnail=?, number_of_likes=?, active=?, brand_id=?, product_type=?,
                    modified_by=?, modified_at=NOW(), noted=?, updated_at=NOW()
                WHERE id=?
                """;

        for (Product product : products) {
            jdbcTemplate.update(sql,
                    product.getTitle(), product.getActiveIngredient(), product.getDosageForm(),
                    product.getDescription(), product.getIndication(), product.getManufacturer(),
                    product.getPriceOld(), product.getPriceNew(), product.getImportPrice(),
                    product.getPriority(), product.getQuantity(), product.getRegistrationNumber(),
                    product.getSlug(), product.getThumbnail(), product.getNumberOfLikes(),
                    product.getActive(), product.getBrand() != null ? product.getBrand().getId() : null,
                    product.getProductType(), product.getModifiedBy(), product.getNoted(), product.getId()
            );
        }
        return products;
    }

    @Override
    public List<Product> findAll(boolean active) {
        String sql = "SELECT * FROM products WHERE active = ?";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Product.class), active);
    }

    @Override
    public List<Product> findByIdIn(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new ArrayList<>();
        }

        StringBuilder sql = new StringBuilder("SELECT * FROM products WHERE id IN (");
        String placeholders = String.join(",", ids.stream().map(id -> "?").toArray(String[]::new));
        sql.append(placeholders).append(")");

        return jdbcTemplate.query(sql.toString(), new BeanPropertyRowMapper<>(Product.class), ids.toArray());
    }

    @Override
    public Long findMaxId() {
        String sql = "SELECT MAX(id) FROM products";
        Long maxId = jdbcTemplate.queryForObject(sql, Long.class);
        return maxId != null ? maxId : 0L;
    }

    @Override
    public Long findMinId() {
        String sql = "SELECT MIN(id) FROM products";
        Long minId = jdbcTemplate.queryForObject(sql, Long.class);
        return minId != null ? minId : 0L;
    }

    @Override
    public List<Product> findAllFromRange(Long startId, Long endId) {
        String sql = "SELECT * FROM products WHERE id BETWEEN ? AND ? and active = true";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Product.class), startId, endId);
    }

    @Override
    public List<Product> findAllByUpdatedAtBefore(int intervalSeconds) {
        String sql = """
                SELECT * FROM products WHERE updated_at > NOW() - INTERVAL ? SECOND 
                                         AND updated_at <= NOW()
                                         AND active = true
                """;
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Product.class), intervalSeconds);
    }

    @Override
    public List<Product> findTop20ByCategoriesInAndIdNotAndActiveTrue(List<Category> categories, Long productId) {
        if (categories == null || categories.isEmpty()) {
            return new ArrayList<>();
        }

        StringBuilder sql = new StringBuilder("""
                SELECT DISTINCT p.* FROM products p
                JOIN products_categories pc ON p.id = pc.product_id
                WHERE pc.category_id IN (
                """);

        String placeholders = String.join(",", categories.stream().filter(
                c -> !c.getName().equalsIgnoreCase("THUOC")
        ).map(c -> "?").toArray(String[]::new));

        sql.append(placeholders).append(") AND p.id <> ? AND p.active = true ");
        sql.append("ORDER BY p.modified_at DESC LIMIT 20");

        List<Object> params = new ArrayList<>();
        for (Category category : categories) {
            params.add(category.getId());
        }
        params.add(productId);

        return jdbcTemplate.query(sql.toString(), new BeanPropertyRowMapper<>(Product.class), params.toArray());
    }
}
