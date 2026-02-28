import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Product } from '../../products/domain/entities/product.entity';
import { Customer } from '../../customers/domain/entities/customer.entity';
import { Transaction } from '../../transactions/domain/entities/transaction.entity';
import { Delivery } from '../../deliveries/domain/entities/delivery.entity';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432') || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'ecommerce_dev',
  entities: [Product, Customer, Transaction, Delivery],
  synchronize: true,
});

const seedProducts = [
  {
    name: 'Laptop HP Pavilion 15',
    description:
      'Laptop de alto rendimiento con procesador Intel Core i7, 16GB RAM, 512GB SSD',
    price: 2499000,
    stock: 15,
    category: 'Electrónica',
    imageUrl:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
    isActive: true,
  },
  {
    name: 'iPhone 14 Pro Max',
    description:
      'Smartphone Apple con pantalla de 6.7", cámara de 48MP, chip A16 Bionic',
    price: 5499000,
    stock: 8,
    category: 'Electrónica',
    imageUrl:
      'https://images.unsplash.com/photo-1678652197950-1e3c56c0346b?w=500',
    isActive: true,
  },
  {
    name: 'Samsung Galaxy S23 Ultra',
    description:
      'Smartphone con pantalla AMOLED de 6.8", S Pen incluido, 256GB',
    price: 4799000,
    stock: 12,
    category: 'Electrónica',
    imageUrl:
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
    isActive: true,
  },
  {
    name: 'AirPods Pro 2',
    description: 'Auriculares inalámbricos con cancelación activa de ruido',
    price: 899000,
    stock: 25,
    category: 'Audio',
    imageUrl:
      'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500',
    isActive: true,
  },
  {
    name: 'Sony WH-1000XM5',
    description:
      'Audífonos over-ear con la mejor cancelación de ruido del mercado',
    price: 1299000,
    stock: 18,
    category: 'Audio',
    imageUrl: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=500',
    isActive: true,
  },
  {
    name: 'Apple Watch Series 9',
    description:
      'Smartwatch con GPS, monitor de salud y fitness, pantalla Retina',
    price: 1899000,
    stock: 20,
    category: 'Wearables',
    imageUrl:
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500',
    isActive: true,
  },
  {
    name: 'iPad Air M2',
    description: 'Tablet con chip M2, pantalla Liquid Retina de 10.9", 256GB',
    price: 3299000,
    stock: 10,
    category: 'Electrónica',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
    isActive: true,
  },
  {
    name: 'MacBook Pro M3',
    description:
      'Laptop profesional con chip M3, 16GB RAM, 512GB SSD, pantalla de 14"',
    price: 8999000,
    stock: 5,
    category: 'Electrónica',
    imageUrl:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=500',
    isActive: true,
  },
  {
    name: 'Nintendo Switch OLED',
    description: 'Consola de videojuegos híbrida con pantalla OLED de 7"',
    price: 1499000,
    stock: 30,
    category: 'Gaming',
    imageUrl:
      'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500',
    isActive: true,
  },
  {
    name: 'PlayStation 5',
    description: 'Consola de última generación con SSD ultra rápido, 825GB',
    price: 2799000,
    stock: 7,
    category: 'Gaming',
    imageUrl:
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500',
    isActive: true,
  },
];

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const productRepository = AppDataSource.getRepository(Product);

    // Check if products already exist
    const existingProducts = await productRepository.count();
    if (existingProducts > 0) {
      console.log('⚠️  Products already exist. Skipping seed...');
      await AppDataSource.destroy();
      return;
    }

    // Insert products
    console.log('📦 Inserting products...');
    for (const productData of seedProducts) {
      const product = productRepository.create(productData);
      await productRepository.save(product);
      console.log(`  ✓ Created: ${product.name}`);
    }

    console.log('');
    console.log('✅ Seed completed successfully!');
    console.log(`📊 Total products created: ${seedProducts.length}`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seed();
