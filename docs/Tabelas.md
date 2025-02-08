// Documentação do Banco de Dados
const databaseSchema = {
  // Tabelas principais
  machines: {
    description: "Armazena informações sobre as máquinas disponíveis",
    columns: {
      id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
      name: { type: "text", required: true },
      description: { type: "text" },
      main_image_url: { type: "text" },
      category_id: { type: "uuid", references: "categories.id" },
      secondary_category_id: { type: "uuid", references: "categories.id" },
      owner_id: { type: "uuid", references: "profiles.id" },
      created_at: { type: "timestamp with time zone", default: "now()" }
    }
  },

  categories: {
    description: "Categorias para máquinas e produtos",
    columns: {
      id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
      name: { type: "text", required: true },
      description: { type: "text" },
      banner_url: { type: "text" },
      icon_url: { type: "text" },
      parent_id: { type: "uuid", references: "categories.id" },
      created_at: { type: "timestamp with time zone", default: "now()" },
      type: { type: "text", default: "'primary'::text" },
      slug: { type: "text" }
    }
  },

  accessories: {
    description: "Acessórios disponíveis para as máquinas",
    columns: {
      id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
      name: { type: "text", required: true },
      description: { type: "text" },
      main_image_url: { type: "text" },
      price: { type: "numeric", required: true, default: 0 },
      stock: { type: "integer", required: true, default: 0 },
      owner_id: { type: "uuid", required: true, references: "profiles.id" },
      created_at: { type: "timestamp with time zone", default: "now()" }
    }
  },

  profiles: {
    description: "Perfis de usuários do sistema",
    columns: {
      id: { type: "uuid", primaryKey: true },
      email: { type: "text", required: true },
      role: { type: "text", required: true },
      name: { type: "text" },
      phone: { type: "text" },
      cpf_cnpj: { type: "text" },
      address: { type: "text" },
      city: { type: "text" },
      state: { type: "text" },
      postal_code: { type: "text" },
      avatar_url: { type: "text" },
      created_at: { type: "timestamp with time zone", default: "now()" }
    }
  },

  // Tabelas de relacionamento
  machine_images: {
    description: "Imagens associadas às máquinas",
    columns: {
      id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
      machine_id: { type: "uuid", required: true, references: "machines.id" },
      image_url: { type: "text", required: true },
      is_main: { type: "boolean", default: false },
      created_at: { type: "timestamp with time zone", default: "now()" }
    }
  },

  accessory_images: {
    description: "Imagens associadas aos acessórios",
    columns: {
      id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
      accessory_id: { type: "uuid", required: true, references: "accessories.id" },
      image_url: { type: "text", required: true },
      is_main: { type: "boolean", default: false },
      created_at: { type: "timestamp with time zone", default: "now()" }
    }
  },

  accessory_machines: {
    description: "Relacionamento entre acessórios e máquinas",
    columns: {
      id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
      accessory_id: { type: "uuid", required: true, references: "accessories.id" },
      machine_id: { type: "uuid", required: true, references: "machines.id" },
      created_at: { type: "timestamp with time zone", default: "now()" }
    }
  },

  // Sistema de Orçamentos e Aluguéis
  quotes: {
    description: "Orçamentos solicitados pelos clientes",
    columns: {
      id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
      client_id: { type: "uuid", required: true, references: "profiles.id" },
      machine_id: { type: "uuid", required: true, references: "machines.id" },
      rental_period: { type: "text", required: true },
      delivery_address: { type: "text", required: true },
      observations: { type: "text" },
      status: { type: "text", required: true, default: "'pending'::text" },
      response: { type: "text" },
      response_price: { type: "numeric" },
      landlord_id: { type: "uuid", references: "profiles.id" },
      created_at: { type: "timestamp with time zone", default: "now()" },
      updated_at: { type: "timestamp with time zone", default: "now()" }
    }
  },

  quote_accessories: {
    description: "Acessórios incluídos nos orçamentos",
    columns: {
      id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
      quote_id: { type: "uuid", required: true, references: "quotes.id" },
      accessory_id: { type: "uuid", required: true, references: "accessories.id" },
      created_at: { type: "timestamp with time zone", default: "now()" }
    }
  },

  rentals: {
    description: "Aluguéis confirmados",
    columns: {
      id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
      quote_id: { type: "uuid", references: "quotes.id" },
      machine_id: { type: "uuid", required: true, references: "machines.id" },
      client_id: { type: "uuid", required: true, references: "profiles.id" },
      rental_period: { type: "text", required: true },
      delivery_address: { type: "text", required: true }
    }
  },

  rental_accessories: {
    description: "Acessórios incluídos nos aluguéis",
    columns: {
      id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
      rental_id: { type: "uuid", required: true, references: "rentals.id" },
      accessory_id: { type: "uuid", required: true, references: "accessories.id" },
      created_at: { type: "timestamp with time zone", default: "now()" }
    }
  },

  // Configurações do Sistema
  system_settings: {
    description: "Configurações gerais do sistema",
    relatedTables: {
      quick_links: "Links rápidos mostrados no sistema",
      featured_logos: "Logos em destaque no sistema"
    }
  }
};

// Relacionamentos principais
const relationships = {
  machines: {
    belongsTo: ["categories (category_id)", "categories (secondary_category_id)", "profiles (owner_id)"],
    hasMany: ["machine_images", "accessory_machines", "quotes", "rentals"]
  },
  categories: {
    belongsTo: ["categories (parent_id)"],
    hasMany: ["categories (as parent)", "machines (as primary)", "machines (as secondary)"]
  },
  accessories: {
    belongsTo: ["profiles (owner_id)"],
    hasMany: ["accessory_images", "accessory_machines", "quote_accessories", "rental_accessories"]
  },
  profiles: {
    hasMany: ["machines (as owner)", "accessories (as owner)", "quotes (as client)", "quotes (as landlord)", "rentals (as client)"]
  }
};

module.exports = {
  databaseSchema,
  relationships
};