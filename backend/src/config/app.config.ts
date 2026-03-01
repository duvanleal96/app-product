export default () => ({
  port: parseInt(process.env.PORT || '3000', 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'ecommerce_dev',
  },
  wompi: {
    apiUrl:
      process.env.WOMPI_API_URL || 'https://api-sandbox.co.uat.wompi.dev/v1',
    publicKey: process.env.WOMPI_PUBLIC_KEY,
    privateKey: process.env.WOMPI_PRIVATE_KEY,
    eventsKey: process.env.WOMPI_EVENTS_KEY,
    integrityKey: process.env.WOMPI_INTEGRITY_KEY,
  },
  fees: {
    baseFee: parseInt(process.env.BASE_FEE || '2000', 10) || 2000,
    deliveryFee: parseInt(process.env.DELIVERY_FEE || '5000', 10) || 5000,
  },
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : [
          'http://localhost:5173',
          'http://localhost:5174',
          'http://localhost:3000',
        ],
  },
});
