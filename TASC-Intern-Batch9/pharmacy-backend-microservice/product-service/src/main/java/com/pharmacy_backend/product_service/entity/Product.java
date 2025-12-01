package com.pharmacy_backend.product_service.entity;


import com.pharmacy_backend.common.entity.base.BaseModifyEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "products")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Product extends BaseModifyEntity {
    String title;
    @Column(name = "active_ingredient")
    String activeIngredient;
    @Column(name = "dosage_form")
    String dosageForm;
    @Column(columnDefinition = "TEXT")
    String description;

    String indication;
    String manufacturer;
    @Column(name = "price_old")
    Integer priceOld;
    @Column(name = "price_new")
    Integer priceNew;
    @Column(name = "import_price")
    Integer importPrice;
    Integer priority = 0;
    Integer quantity;

    String noted;

    @Column(name = "registration_number")
    String registrationNumber;
    String slug;
    String thumbnail;

    @Column(name = "number_of_likes")
    Integer numberOfLikes = 0;

    Boolean active = true;

    @OneToMany(mappedBy = "product",fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    List<ProductImage> productImages;

    @ManyToMany(cascade = {CascadeType.ALL}, fetch = FetchType.LAZY)
    @JoinTable(name = "products_categories", joinColumns = @JoinColumn(name = "product_id"),
                                            inverseJoinColumns = @JoinColumn(name = "category_id"))
    List<Category> categories = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<Wishlist> wishlists = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<Comment> comments = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "brand_id")
    Brand brand;

    @Column(name = "product_type")
    String productType;
}
