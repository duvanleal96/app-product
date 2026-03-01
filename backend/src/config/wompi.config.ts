export const wompiConfig = {
  baseUrl:
    process.env.WOMPI_BASE_URL || 'https://api-sandbox.co.uat.wompi.dev/v1',
  publicKey:
    process.env.WOMPI_PUBLIC_KEY ||
    'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7',
  privateKey:
    process.env.WOMPI_PRIVATE_KEY ||
    'prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg',
  eventsSecret:
    process.env.WOMPI_EVENTS_SECRET ||
    'stagtest_events_2PDUmhMywUkvb1LvxYnayFbmofT7w39N',
  integritySecret:
    process.env.WOMPI_INTEGRITY_SECRET ||
    'stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp',
  currency: 'COP',
  environment: 'sandbox',
};
