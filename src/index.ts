
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import routes from './routes';
import { setupSwagger } from './swagger';

const app = express();

app.use(express.json());
app.use(cors());

setupSwagger(app);

app.use('', routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`);
});

