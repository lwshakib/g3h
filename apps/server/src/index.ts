import httpServer from "./app.js";

import "dotenv/config";
import logger from "./logger/winston.logger.js";

async function startServer() {
  const port = process.env.PORT || 4000;
  httpServer.listen(port, () => {
    logger.info(`Server is running on http://localhost:${port}`);
  });
}
startServer();