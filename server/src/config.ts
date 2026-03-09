export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  oscPort: parseInt(process.env.OSC_PORT || '8001', 10),
  oscInterface: process.env.OSC_INTERFACE || '0.0.0.0',
  qlabHost: process.env.QLAB_HOST || '127.0.0.1',
  qlabOscPort: parseInt(process.env.QLAB_OSC_PORT || '53000', 10),
  dataDir: process.env.DATA_DIR || './data',
};
