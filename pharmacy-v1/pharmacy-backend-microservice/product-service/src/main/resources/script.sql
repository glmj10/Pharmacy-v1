alter table products drop column embedding;
ALTER TABLE products ADD COLUMN embedding LONGTEXT;

create index idx_product_slug on products (slug);
