package com.project.pharmacy.repository.impl;

import com.project.pharmacy.dto.request.ProductCMSFilterRequest;
import com.project.pharmacy.dto.request.ProductFilterCustomerRequest;
import com.project.pharmacy.entity.Brand;
import com.project.pharmacy.entity.Category;
import com.project.pharmacy.entity.Product;
import com.project.pharmacy.enums.ErrorCode;
import com.project.pharmacy.exceptions.CustomException;
import com.project.pharmacy.repository.BrandRepository;
import com.project.pharmacy.repository.CategoryRepository;
import com.project.pharmacy.repository.ProductRepository;
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
        StringBuilder sql = new StringBuilder("SELECT p.* FROM products p WHERE 1=1");
        List<Object> params = new ArrayList<>();

        if(filterRequest.getBrandId() != null) {
            sql.append("JOIN brands b ON p.brand_id = b.id");
        }

        if(filterRequest.getCategoryId() != null) {
            sql.append(" JOIN categories c ON p.category_id = c.id");
        }

        if (filterRequest.getBrandId() != null) {
            sql.append(" AND p.brand_id = ?");
            params.add(filterRequest.getBrandId());
        }

        if (filterRequest.getCategoryId() != null) {
            sql.append(" AND p.category_id = ?");
            params.add(filterRequest.getCategoryId());
        }

        if (filterRequest.getTitle() != null && !filterRequest.getTitle().isBlank()) {
            sql.append(" AND LOWER(name) LIKE ?");
            params.add("%" + filterRequest.getTitle().toLowerCase() + "%");
        }

        if (filterRequest.isActive() != null) {
            sql.append(" AND active = ?");
            params.add(filterRequest.isActive());
        }

        if(filterRequest.getPriceFrom() != null) {
            sql.append(" AND price_new >= ?");
            params.add(filterRequest.getPriceFrom());
        }

        if(filterRequest.getPriceTo() != null) {
            sql.append(" AND price_new <= ?");
            params.add(filterRequest.getPriceTo());
        }
        if(filterRequest.isAscending() != null) {
            sql.append(" ORDER BY price_new ");
            sql.append(Boolean.TRUE.equals(filterRequest.isAscending()) ? "ASC" : "DESC");
        } else
            sql.append(" ORDER BY modified_at DESC");

        sql.append(" LIMIT ? OFFSET ?");
        params.add(size);
        params.add(offSet);
        return jdbcTemplate.query(sql.toString(),
                new BeanPropertyRowMapper<>(Product.class), params.toArray());
    }

    @Override
    public List<Product> findAll(int size, int offSet, ProductFilterCustomerRequest filterCustomerRequest) {
        StringBuilder sql = new StringBuilder("SELECT p.* FROM products p WHERE 1=1");
        List<Object> params = new ArrayList<>();
        Brand brand = new Brand();
        Category category = new Category();
        if(filterCustomerRequest.getBrand() != null) {
            sql.append("JOIN brands b ON p.brand_id = b.id");
            brand = brandRepository.findBySlug(filterCustomerRequest.getBrand());
        }

        if(filterCustomerRequest.getCategory() != null) {
            sql.append(" JOIN categories c ON p.category_id = c.id");
            category = categoryRepository.findBySlug(filterCustomerRequest.getCategory())
            .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND,
                    HttpStatus.NOT_FOUND, "Category not found"));
        }

        if (filterCustomerRequest.getBrand() != null) {
            sql.append(" AND p.brand_id = ?");
            params.add(brand.getId());
        }

        if (filterCustomerRequest.getCategory() != null) {
            sql.append(" AND p.category_id = ?");
            params.add(category.getId());
        }

        if (filterCustomerRequest.getTitle() != null && !filterCustomerRequest.getTitle().isBlank()) {
            sql.append(" AND LOWER(name) LIKE ?");
            params.add("%" + filterCustomerRequest.getTitle().toLowerCase() + "%");
        }

            sql.append(" AND active = ?");
            params.add(true);

        if(filterCustomerRequest.getPriceFrom() != null) {
            sql.append(" AND price_new >= ?");
            params.add(filterCustomerRequest.getPriceFrom());
        }

        if(filterCustomerRequest.getPriceTo() != null) {
            sql.append(" AND price_new <= ?");
            params.add(filterCustomerRequest.getPriceTo());
        }

        if(filterCustomerRequest.isAscending() != null) {
            sql.append(" ORDER BY price_new ");
            sql.append(Boolean.TRUE.equals(filterCustomerRequest.isAscending()) ? "ASC" : "DESC");
        } else
            sql.append(" ORDER BY modified_at DESC");

        sql.append(" LIMIT ? OFFSET ?");
        params.add(size);
        params.add(offSet);
        return jdbcTemplate.query(sql.toString(),
                new BeanPropertyRowMapper<>(Product.class), params.toArray());
    }

    @Override
    public Optional<Product> findById(Long id) {
        String sql = "SELECT * FROM products WHERE id = ?";
        Product product = jdbcTemplate.queryForObject(sql, new BeanPropertyRowMapper<>(Product.class), id);
        if(product == null) {
            throw new CustomException(ErrorCode.PRODUCT_NOT_FOUND,
                    HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm với ID: " + id);
        }
        return Optional.of(product);
    }

    @Override
    public Optional<Product> findBySlug(String slug) {
        String sql = "SELECT * FROM products WHERE slug = ?";
        Product product = jdbcTemplate.queryForObject(sql, new BeanPropertyRowMapper<>(Product.class), slug);
        if(product == null) {
            throw new CustomException(ErrorCode.PRODUCT_NOT_FOUND,
                    HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm với slug: " + slug);
        }
        return Optional.of(product);
    }

    @Override
    public boolean existsBySlug(String slug) {
        String sql = "SELECT COUNT(*) FROM products WHERE slug = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, slug);
        return count != null && count > 0;
    }

    @Override
    public List<Product> findTop15ByActiveTrue() {
        String sql = "SELECT * FROM products WHERE active = true ORDER BY modified_at DESC LIMIT ? OFFSET ?";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Product.class), 15, 0);
    }

    @Override
    public List<Product> findTop15ByBrandAndActive(Brand brand, boolean b) {
        String sql = "SELECT * FROM products " +
                    "WHERE brand_id = ? AND active = ? ORDER BY modified_at DESC LIMIT 15";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Product.class),
                brand.getId(), b);
    }

    @Override
    public long countProducts(ProductCMSFilterRequest filterRequest) {
        StringBuilder sql = new StringBuilder("SELECT count(*) FROM products p WHERE 1=1");
        List<Object> params = new ArrayList<>();

        if(filterRequest.getBrandId() != null) {
            sql.append("JOIN brands b ON p.brand_id = b.id");
        }

        if(filterRequest.getCategoryId() != null) {
            sql.append(" JOIN categories c ON p.category_id = c.id");
        }

        if (filterRequest.getBrandId() != null) {
            sql.append(" AND p.brand_id = ?");
            params.add(filterRequest.getBrandId());
        }

        if (filterRequest.getCategoryId() != null) {
            sql.append(" AND p.category_id = ?");
            params.add(filterRequest.getCategoryId());
        }

        if (filterRequest.getTitle() != null && !filterRequest.getTitle().isBlank()) {
            sql.append(" AND LOWER(name) LIKE ?");
            params.add("%" + filterRequest.getTitle().toLowerCase() + "%");
        }

        if (filterRequest.isActive() != null) {
            sql.append(" AND active = ?");
            params.add(filterRequest.isActive());
        }

        if(filterRequest.getPriceFrom() != null) {
            sql.append(" AND price_new >= ?");
            params.add(filterRequest.getPriceFrom());
        }

        if(filterRequest.getPriceTo() != null) {
            sql.append(" AND price_new <= ?");
            params.add(filterRequest.getPriceTo());
        }

        if(filterRequest.isAscending() != null) {
            sql.append(" ORDER BY price_new ");
            sql.append(Boolean.TRUE.equals(filterRequest.isAscending()) ? "ASC" : "DESC");
        } else
            sql.append(" ORDER BY modified_at DESC");

        Long total = jdbcTemplate.queryForObject(sql.toString(), Long.class, params.toArray());
        return total != null ? total : 0L;
    }

    @Transactional
    @Override
    public long countProducts(ProductFilterCustomerRequest filterCustomerRequest) {
        StringBuilder sql = new StringBuilder("SELECT count(*) FROM products p WHERE 1=1");
        List<Object> params = new ArrayList<>();
        Brand brand = new Brand();
        Category category = new Category();
        if(filterCustomerRequest.getBrand() != null) {
            sql.append("JOIN brands b ON p.brand_id = b.id");
            brand = brandRepository.findBySlug(filterCustomerRequest.getBrand());
        }

        if(filterCustomerRequest.getCategory() != null) {
            sql.append(" JOIN categories c ON p.category_id = c.id");
            category = categoryRepository.findBySlug(filterCustomerRequest.getCategory())
                    .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND,
                            HttpStatus.NOT_FOUND, "Category not found"));
        }

        if (filterCustomerRequest.getBrand() != null) {
            sql.append(" AND p.brand_id = ?");
            params.add(brand.getId());
        }

        if (filterCustomerRequest.getCategory() != null) {
            sql.append(" AND p.category_id = ?");
            params.add(category.getId());
        }

        if (filterCustomerRequest.getTitle() != null && !filterCustomerRequest.getTitle().isBlank()) {
            sql.append(" AND LOWER(name) LIKE ?");
            params.add("%" + filterCustomerRequest.getTitle().toLowerCase() + "%");
        }

        sql.append(" AND active = ?");
        params.add(true);

        if(filterCustomerRequest.getPriceFrom() != null) {
            sql.append(" AND price_new >= ?");
            params.add(filterCustomerRequest.getPriceFrom());
        }

        if(filterCustomerRequest.getPriceTo() != null) {
            sql.append(" AND price_new <= ?");
            params.add(filterCustomerRequest.getPriceTo());
        }

        if(filterCustomerRequest.isAscending() != null) {
            sql.append(" ORDER BY price_new ");
            sql.append(Boolean.TRUE.equals(filterCustomerRequest.isAscending()) ? "ASC" : "DESC");
        } else
            sql.append(" ORDER BY modified_at DESC");

        Long total = jdbcTemplate.queryForObject(sql.toString(), Long.class, params.toArray());
        return total != null ? total : 0L;
    }

    @Override
    public long countProducts() {
        String sql = "SELECT COUNT(*) FROM products";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0L;
    }

    @Transactional
    @Override
    public Product createProduct(Product product) {
        String sql = """
            INSERT INTO products (
                title, active_ingredient, dosage_form, description,
                indication, manufacturer, price_old, price_new,
                import_price, priority, quantity, registration_number,
                slug, thumbnail, number_of_likes, active, brand_id, product_type,
                created_by, modified_by, created_at, modified_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
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
            return ps;
        }, keyHolder);

        if (keyHolder.getKey() != null) {
            product.setId(keyHolder.getKey().longValue());
        }

        return product;
    }

    @Transactional
    @Override
    public Product updateProduct(Long id, Product product) {
        String sql = """
            UPDATE products SET 
                title=?, active_ingredient=?, dosage_form=?, description=?,
                indication=?, manufacturer=?, price_old=?, price_new=?,
                import_price=?, priority=?, quantity=?, registration_number=?,
                slug=?, thumbnail=?, number_of_likes=?, active=?, brand_id=?, product_type=?,
                modified_by=?, modified_at=NOW()
            WHERE id=?
            """;

        jdbcTemplate.update(sql,
                product.getTitle(), product.getActiveIngredient(), product.getDosageForm(),
                product.getDescription(), product.getIndication(), product.getManufacturer(),
                product.getPriceOld(), product.getPriceNew(), product.getImportPrice(),
                product.getPriority(), product.getQuantity(), product.getRegistrationNumber(),
                product.getSlug(), product.getThumbnail(), product.getNumberOfLikes(),
                product.getActive(), product.getBrand() != null ? product.getBrand().getId() : null,
                product.getProductType(), product.getModifiedBy(), id
        );
        return product;
    }

    @Transactional
    @Override
    public void deleteProduct(Long id) {
        String sql = "DELETE FROM products WHERE id=?";
        jdbcTemplate.update(sql, id);
    }
}
