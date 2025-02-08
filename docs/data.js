[
    {
      "table_name": "accessories",
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "gen_random_uuid()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "accessories",
      "column_name": "name",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "accessories",
      "column_name": "description",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "accessories",
      "column_name": "main_image_url",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "accessories",
      "column_name": "price",
      "data_type": "numeric",
      "is_nullable": "NO",
      "column_default": "0",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "accessories",
      "column_name": "stock",
      "data_type": "integer",
      "is_nullable": "NO",
      "column_default": "0",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "accessories",
      "column_name": "owner_id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "accessories",
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "accessory_images",
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "gen_random_uuid()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "accessory_images",
      "column_name": "accessory_id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": "accessories",
      "foreign_column_name": "id"
    },
    {
      "table_name": "accessory_images",
      "column_name": "image_url",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "accessory_images",
      "column_name": "is_main",
      "data_type": "boolean",
      "is_nullable": "YES",
      "column_default": "false",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "accessory_images",
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "accessory_machines",
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "gen_random_uuid()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "accessory_machines",
      "column_name": "accessory_id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": "accessories",
      "foreign_column_name": "id"
    },
    {
      "table_name": "accessory_machines",
      "column_name": "machine_id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": "machines",
      "foreign_column_name": "id"
    },
    {
      "table_name": "accessory_machines",
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "categories",
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "gen_random_uuid()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "categories",
      "column_name": "name",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "categories",
      "column_name": "description",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "categories",
      "column_name": "banner_url",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "categories",
      "column_name": "icon_url",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "categories",
      "column_name": "parent_id",
      "data_type": "uuid",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": "categories",
      "foreign_column_name": "id"
    },
    {
      "table_name": "categories",
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "categories",
      "column_name": "type",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "'primary'::text",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "categories",
      "column_name": "slug",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "featured_logos",
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "uuid_generate_v4()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "featured_logos",
      "column_name": "system_settings_id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": "system_settings",
      "foreign_column_name": "id"
    },
    {
      "table_name": "featured_logos",
      "column_name": "title",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "featured_logos",
      "column_name": "image_url",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "featured_logos",
      "column_name": "order_index",
      "data_type": "integer",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "featured_logos",
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "NO",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "featured_logos",
      "column_name": "updated_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "NO",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "machine_images",
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "gen_random_uuid()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "machine_images",
      "column_name": "machine_id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": "machines",
      "foreign_column_name": "id"
    },
    {
      "table_name": "machine_images",
      "column_name": "image_url",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "machine_images",
      "column_name": "is_main",
      "data_type": "boolean",
      "is_nullable": "YES",
      "column_default": "false",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "machine_images",
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "machines",
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "gen_random_uuid()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "machines",
      "column_name": "name",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "machines",
      "column_name": "description",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "machines",
      "column_name": "main_image_url",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "machines",
      "column_name": "category_id",
      "data_type": "uuid",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": "categories",
      "foreign_column_name": "id"
    },
    {
      "table_name": "machines",
      "column_name": "secondary_category_id",
      "data_type": "uuid",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": "categories",
      "foreign_column_name": "id"
    },
    {
      "table_name": "machines",
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "machines",
      "column_name": "owner_id",
      "data_type": "uuid",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": "profiles",
      "foreign_column_name": "id"
    },
    {
      "table_name": "products",
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "uuid_generate_v4()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "products",
      "column_name": "name",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "products",
      "column_name": "description",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "products",
      "column_name": "category",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "products",
      "column_name": "tags",
      "data_type": "ARRAY",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "products",
      "column_name": "image_url",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "products",
      "column_name": "price",
      "data_type": "numeric",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "products",
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "products",
      "column_name": "updated_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "profiles",
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "profiles",
      "column_name": "email",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "profiles",
      "column_name": "role",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "profiles",
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "profiles",
      "column_name": "name",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "profiles",
      "column_name": "phone",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "profiles",
      "column_name": "cpf_cnpj",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "profiles",
      "column_name": "address",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "profiles",
      "column_name": "city",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "profiles",
      "column_name": "state",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "profiles",
      "column_name": "postal_code",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "profiles",
      "column_name": "avatar_url",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "quick_links",
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "uuid_generate_v4()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "quick_links",
      "column_name": "system_settings_id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": "system_settings",
      "foreign_column_name": "id"
    },
    {
      "table_name": "quick_links",
      "column_name": "title",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "quick_links",
      "column_name": "url",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "quick_links",
      "column_name": "order_index",
      "data_type": "integer",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "quick_links",
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "NO",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "quick_links",
      "column_name": "updated_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "NO",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "quote_accessories",
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "gen_random_uuid()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "quote_accessories",
      "column_name": "quote_id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": "quotes",
      "foreign_column_name": "id"
    },
    {
      "table_name": "quote_accessories",
      "column_name": "accessory_id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": "accessories",
      "foreign_column_name": "id"
    },
    {
      "table_name": "quote_accessories",
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "quotes",
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "gen_random_uuid()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "quotes",
      "column_name": "client_id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": "profiles",
      "foreign_column_name": "id"
    },
    {
      "table_name": "quotes",
      "column_name": "rental_period",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "quotes",
      "column_name": "delivery_address",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "quotes",
      "column_name": "observations",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "quotes",
      "column_name": "status",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "'pending'::text",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "quotes",
      "column_name": "response",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "quotes",
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "quotes",
      "column_name": "updated_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "quotes",
      "column_name": "response_price",
      "data_type": "numeric",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "quotes",
      "column_name": "landlord_id",
      "data_type": "uuid",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": "profiles",
      "foreign_column_name": "id"
    },
    {
      "table_name": "quotes",
      "column_name": "machine_id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": "machines",
      "foreign_column_name": "id"
    },
    {
      "table_name": "rental_accessories",
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "gen_random_uuid()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "rental_accessories",
      "column_name": "rental_id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": "rentals",
      "foreign_column_name": "id"
    },
    {
      "table_name": "rental_accessories",
      "column_name": "accessory_id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": "accessories",
      "foreign_column_name": "id"
    },
    {
      "table_name": "rental_accessories",
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "rentals",
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "gen_random_uuid()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "rentals",
      "column_name": "quote_id",
      "data_type": "uuid",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "rentals",
      "column_name": "machine_id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": "machines",
      "foreign_column_name": "id"
    },
    {
      "table_name": "rentals",
      "column_name": "client_id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": "profiles",
      "foreign_column_name": "id"
    },
    {
      "table_name": "rentals",
      "column_name": "rental_period",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "rentals",
      "column_name": "delivery_address",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "rentals",
      "column_name": "start_date",
      "data_type": "timestamp with time zone",
      "is_nullable": "NO",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "rentals",
      "column_name": "end_date",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "rentals",
      "column_name": "status",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "'active'::text",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "rentals",
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "rentals",
      "column_name": "updated_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "rentals",
      "column_name": "price",
      "data_type": "numeric",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "rentals",
      "column_name": "landlord_id",
      "data_type": "uuid",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": "profiles",
      "foreign_column_name": "id"
    },
    {
      "table_name": "returns",
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "gen_random_uuid()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "returns",
      "column_name": "rental_id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": "rentals",
      "foreign_column_name": "id"
    },
    {
      "table_name": "returns",
      "column_name": "return_method",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "returns",
      "column_name": "return_address",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "returns",
      "column_name": "requested_date",
      "data_type": "timestamp with time zone",
      "is_nullable": "NO",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "returns",
      "column_name": "completed_date",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "returns",
      "column_name": "status",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "'pending'::text",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "returns",
      "column_name": "observations",
      "data_type": "text",
      "is_nullable": "YES",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "returns",
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "returns",
      "column_name": "updated_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "system_settings",
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "uuid_generate_v4()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "system_settings",
      "column_name": "light_header_color",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "'#001a41'::text",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "system_settings",
      "column_name": "light_header_text_color",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "'#ffffff'::text",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "system_settings",
      "column_name": "light_footer_color",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "'#001a41'::text",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "system_settings",
      "column_name": "light_footer_text_color",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "'#ffffff'::text",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "system_settings",
      "column_name": "dark_header_color",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "'#001a41'::text",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "system_settings",
      "column_name": "dark_header_text_color",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "'#ffffff'::text",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "system_settings",
      "column_name": "dark_footer_color",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "'#001a41'::text",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "system_settings",
      "column_name": "dark_footer_text_color",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "'#ffffff'::text",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "system_settings",
      "column_name": "light_header_logo_url",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "''::text",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "system_settings",
      "column_name": "light_footer_logo_url",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "''::text",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "system_settings",
      "column_name": "dark_header_logo_url",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "''::text",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "system_settings",
      "column_name": "dark_footer_logo_url",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "''::text",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "system_settings",
      "column_name": "address",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "''::text",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "system_settings",
      "column_name": "phone",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "''::text",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "system_settings",
      "column_name": "email",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "''::text",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "system_settings",
      "column_name": "quick_links_enabled",
      "data_type": "boolean",
      "is_nullable": "YES",
      "column_default": "true",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "system_settings",
      "column_name": "featured_logos_enabled",
      "data_type": "boolean",
      "is_nullable": "YES",
      "column_default": "true",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "system_settings",
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "system_settings",
      "column_name": "updated_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "technical_data",
      "column_name": "id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": "gen_random_uuid()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "technical_data",
      "column_name": "machine_id",
      "data_type": "uuid",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": "machines",
      "foreign_column_name": "id"
    },
    {
      "table_name": "technical_data",
      "column_name": "label",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "technical_data",
      "column_name": "value",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": null,
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "technical_data",
      "column_name": "is_highlight",
      "data_type": "boolean",
      "is_nullable": "YES",
      "column_default": "false",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "technical_data",
      "column_name": "created_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "YES",
      "column_default": "now()",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "table_name": "technical_data",
      "column_name": "is_obsolete",
      "data_type": "boolean",
      "is_nullable": "YES",
      "column_default": "false",
      "foreign_table_name": null,
      "foreign_column_name": null
    }
  ]