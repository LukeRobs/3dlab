require('dotenv').config();
const { pool } = require('./client');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── Settings ─────────────────────────────────────────────────────────────
    await client.query(`
      UPDATE settings SET value = $1, updated_at = NOW() WHERE key = 'store_name'
    `, ['Loja Geek 3D']);
    await client.query(`
      UPDATE settings SET value = $1, updated_at = NOW() WHERE key = 'store_description'
    `, ['Produtos geek impressos em 3D com qualidade e paixão!']);
    await client.query(`
      UPDATE settings SET value = $1, updated_at = NOW() WHERE key = 'electricity_kwh_price'
    `, ['0.75']);
    await client.query(`
      UPDATE settings SET value = $1, updated_at = NOW() WHERE key = 'printer_power_watts'
    `, ['200']);
    console.log('✓ Settings atualizadas');

    // ── Categories ────────────────────────────────────────────────────────────
    const catResult = await client.query(`
      INSERT INTO categories (name, slug) VALUES
        ('Personagens', 'personagens'),
        ('Miniaturas', 'miniaturas'),
        ('Decoração', 'decoracao'),
        ('Acessórios', 'acessorios'),
        ('Games', 'games')
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, slug
    `);
    const cats = Object.fromEntries(catResult.rows.map(r => [r.slug, r.id]));
    console.log('✓ Categorias criadas:', Object.keys(cats).join(', '));

    // ── Materials ─────────────────────────────────────────────────────────────
    const matResult = await client.query(`
      INSERT INTO materials (name, type, price_per_gram) VALUES
        ('PLA Branco',   'filament', 0.08),
        ('PLA Preto',    'filament', 0.08),
        ('PLA Cinza',    'filament', 0.09),
        ('PLA Vermelho', 'filament', 0.10),
        ('PETG Neutro',  'filament', 0.12),
        ('Resina Padrão','resin',    0.18)
      ON CONFLICT DO NOTHING
      RETURNING id, name
    `);
    // Buscar todos os materiais (incluindo os já existentes)
    const matAll = await client.query(`SELECT id, name FROM materials`);
    const mats = Object.fromEntries(matAll.rows.map(r => [r.name, r.id]));
    console.log('✓ Materiais criados:', Object.keys(mats).join(', '));

    // ── Products ──────────────────────────────────────────────────────────────
    const products = [
      {
        name: 'Funko Darth Vader',
        slug: 'funko-darth-vader',
        description: 'Funko Pop estilo do icônico Darth Vader de Star Wars, impresso com detalhes incríveis em PLA preto. Perfeito para fãs da saga.',
        price: 45.00,
        print_time_minutes: 180,
        category: 'personagens',
        materials: [['PLA Preto', 120], ['PLA Cinza', 20]],
        image: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=400',
      },
      {
        name: 'Yoda Miniatura',
        slug: 'yoda-miniatura',
        description: 'Miniatura detalhada do Mestre Yoda em posição meditativa. Ótimo presente para fãs de Star Wars.',
        price: 38.00,
        print_time_minutes: 150,
        category: 'personagens',
        materials: [['PLA Verde', 80], ['PLA Cinza', 15]],
        image: 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=400',
      },
      {
        name: 'Suporte Controle Xbox',
        slug: 'suporte-controle-xbox',
        description: 'Suporte de parede elegante para controle Xbox. Encaixe perfeito, fácil de instalar, mantém seu setup organizado.',
        price: 25.00,
        print_time_minutes: 90,
        category: 'acessorios',
        materials: [['PLA Preto', 60]],
        image: 'https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=400',
      },
      {
        name: 'Chaveiro Among Us',
        slug: 'chaveiro-among-us',
        description: 'Chaveiro divertido do personagem Among Us com argola metálica. Disponível em diversas cores.',
        price: 15.00,
        print_time_minutes: 40,
        category: 'acessorios',
        materials: [['PLA Vermelho', 15]],
        image: 'https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=400',
      },
      {
        name: 'Dungeons & Dragons — Dragão',
        slug: 'dnd-dragao',
        description: 'Miniatura de dragão articulada para campanhas de D&D. Impressa em resina para máximo nível de detalhe nas escamas e garras.',
        price: 120.00,
        print_time_minutes: 480,
        category: 'miniaturas',
        materials: [['Resina Padrão', 200]],
        image: 'https://images.unsplash.com/photo-1641154748135-8032a61a3f80?w=400',
      },
      {
        name: 'Guerreiro Élfio',
        slug: 'guerreiro-elfio',
        description: 'Miniatura de guerreiro élfio para RPG de mesa, detalhes finos na armadura e espada. Ideal para pintura.',
        price: 55.00,
        print_time_minutes: 240,
        category: 'miniaturas',
        materials: [['Resina Padrão', 80]],
        image: 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=400',
      },
      {
        name: 'Porta-Canetas Gamer',
        slug: 'porta-canetas-gamer',
        description: 'Porta-canetas temático gamer com compartimentos para canetas, lápis e pequenos objetos. Design moderno e funcional.',
        price: 32.00,
        print_time_minutes: 120,
        category: 'decoracao',
        materials: [['PLA Preto', 90], ['PLA Vermelho', 20]],
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
      },
      {
        name: 'Enfeite Cogumelo Mario',
        slug: 'enfeite-cogumelo-mario',
        description: 'Enfeite decorativo do cogumelo Super Mushroom do Super Mario. Traz charme e cor para qualquer ambiente.',
        price: 22.00,
        print_time_minutes: 75,
        category: 'games',
        materials: [['PLA Vermelho', 40], ['PLA Branco', 20]],
        image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=400',
      },
      {
        name: 'Suporte Headset Gamer',
        slug: 'suporte-headset-gamer',
        description: 'Suporte para headset gamer em formato minimalista. Estável, elegante e com slot para cabo.',
        price: 42.00,
        print_time_minutes: 160,
        category: 'acessorios',
        materials: [['PETG Neutro', 130]],
        image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=400',
      },
      {
        name: 'Placa Nome Personalizada',
        slug: 'placa-nome-personalizada',
        description: 'Placa decorativa com nome personalizado para mesa ou parede. Fonte geek, acabamento premium.',
        price: 28.00,
        print_time_minutes: 95,
        category: 'decoracao',
        materials: [['PLA Cinza', 50], ['PLA Preto', 10]],
        image: 'https://images.unsplash.com/photo-1586380951230-b3d4ba4773e4?w=400',
      },
    ];

    // Materiais que podem não existir (fallback para PLA Preto)
    const fallbackMat = mats['PLA Preto'] || Object.values(mats)[0];

    for (const p of products) {
      // Insert product
      const { rows: [prod] } = await client.query(`
        INSERT INTO products (name, slug, description, price, category_id, print_time_minutes, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          category_id = EXCLUDED.category_id,
          print_time_minutes = EXCLUDED.print_time_minutes,
          updated_at = NOW()
        RETURNING id
      `, [p.name, p.slug, p.description, p.price, cats[p.category], p.print_time_minutes]);

      // Insert primary image
      await client.query(`
        INSERT INTO product_images (product_id, url, is_primary, sort_order)
        VALUES ($1, $2, true, 0)
        ON CONFLICT DO NOTHING
      `, [prod.id, p.image]).catch(() => {
        // product_images may have a unique constraint — ignore duplicate
      });

      // Insert materials
      for (const [matName, qty] of p.materials) {
        const matId = mats[matName] || fallbackMat;
        if (!matId) continue;
        await client.query(`
          INSERT INTO product_materials (product_id, material_id, quantity_grams)
          VALUES ($1, $2, $3)
          ON CONFLICT (product_id, material_id) DO UPDATE SET quantity_grams = EXCLUDED.quantity_grams
        `, [prod.id, matId, qty]);
      }

      console.log(`  ✓ ${p.name}`);
    }

    // ── Recalculate costs ────────────────────────────────────────────────────
    // Update cost_calculated for all products
    await client.query(`
      UPDATE products p SET cost_calculated = (
        SELECT COALESCE(SUM(pm.quantity_grams * m.price_per_gram), 0) +
               (p.print_time_minutes / 60.0) *
               (CAST((SELECT value FROM settings WHERE key='printer_power_watts') AS DECIMAL) / 1000) *
               CAST((SELECT value FROM settings WHERE key='electricity_kwh_price') AS DECIMAL)
        FROM product_materials pm
        JOIN materials m ON m.id = pm.material_id
        WHERE pm.product_id = p.id
      ), updated_at = NOW()
    `);
    console.log('✓ Custos recalculados');

    await client.query('COMMIT');
    console.log('\n🎉 Seed completo! Dados inseridos com sucesso.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro no seed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => { console.error(err); process.exit(1); });
