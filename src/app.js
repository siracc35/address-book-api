const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory "database"
let addresses = [
  { id: 1, firstName: 'Ayse', lastName: 'Yilmaz', email: 'ayse@example.com', phone: '05321112233', city: 'Izmir', favorite: true },
  { id: 2, firstName: 'Mehmet', lastName: 'Demir', email: 'mehmet@example.com', phone: '05332223344', city: 'Istanbul', favorite: false },
  { id: 3, firstName: 'John', lastName: 'Smith', email: 'john@example.com', phone: '2025550147', city: 'Washington', favorite: false },
];
let nextId = 4;

const spec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'Address Book API', version: '1.0.0' },
    components: {
      schemas: {
        Address: {
          type: 'object',
          required: ['firstName', 'lastName'],
          properties: {
            id: { type: 'integer', readOnly: true },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            city: { type: 'string' },
            favorite: { type: 'boolean' },
          },
        },
      },
    },
  },
  apis: [__filename],
});

app.get('/', (req, res) => res.redirect('/api-docs'));
app.get('/api-docs.json', (req, res) => res.json(spec));

// Swagger UI is loaded from a CDN (swagger-ui-express's static files don't work well on Vercel)
app.get('/api-docs', (req, res) => {
  res.send(`<!doctype html>
<html><head><title>Address Book API</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css"></head>
<body><div id="swagger-ui"></div>
<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>SwaggerUIBundle({ url: '/api-docs.json', dom_id: '#swagger-ui' });</script>
</body></html>`);
});

/**
 * @openapi
 * /addresses:
 *   get:
 *     summary: List addresses, with optional search, favorite filter and sorting
 *     parameters:
 *       - { name: search, in: query, schema: { type: string }, description: "Matches name, email, phone or city" }
 *       - { name: favorite, in: query, schema: { type: boolean } }
 *       - { name: sortBy, in: query, schema: { type: string, enum: [firstName, lastName, email, city], default: lastName } }
 *       - { name: order, in: query, schema: { type: string, enum: [asc, desc], default: asc } }
 *     responses:
 *       200:
 *         description: List of addresses
 *         content:
 *           application/json:
 *             schema: { type: array, items: { $ref: '#/components/schemas/Address' } }
 */
app.get('/addresses', (req, res) => {
  const { search, favorite, sortBy = 'lastName', order = 'asc' } = req.query;
  let list = [...addresses];

  if (favorite !== undefined) list = list.filter((a) => a.favorite === (favorite === 'true'));
  if (search) {
    const q = search.toLowerCase();
    list = list.filter((a) => [a.firstName, a.lastName, a.email, a.phone, a.city]
      .some((v) => (v || '').toLowerCase().includes(q)));
  }

  if (!['firstName', 'lastName', 'email', 'city'].includes(sortBy)) {
    return res.status(400).json({ error: 'Invalid sortBy' });
  }
  list.sort((a, b) => (a[sortBy] || '').localeCompare(b[sortBy] || ''));
  if (order === 'desc') list.reverse();

  res.json(list);
});

/**
 * @openapi
 * /addresses/{id}:
 *   get:
 *     summary: Get one address
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: The address
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Address' }
 *       404: { description: Not found }
 */
app.get('/addresses/:id', (req, res) => {
  const address = addresses.find((a) => a.id === Number(req.params.id));
  if (!address) return res.status(404).json({ error: 'Address not found' });
  res.json(address);
});

/**
 * @openapi
 * /addresses:
 *   post:
 *     summary: Create an address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Address' }
 *     responses:
 *       201: { description: Created }
 *       400: { description: firstName and lastName are required }
 */
app.post('/addresses', (req, res) => {
  const { firstName, lastName, email, phone, city } = req.body;
  if (!firstName || !lastName) return res.status(400).json({ error: 'firstName and lastName are required' });

  const address = { id: nextId++, firstName, lastName, email, phone, city, favorite: false };
  addresses.push(address);
  res.status(201).json(address);
});

/**
 * @openapi
 * /addresses/{id}:
 *   put:
 *     summary: Edit an address (only the fields you send are changed)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Address' }
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Not found }
 */
app.put('/addresses/:id', (req, res) => {
  const address = addresses.find((a) => a.id === Number(req.params.id));
  if (!address) return res.status(404).json({ error: 'Address not found' });

  const { firstName, lastName, email, phone, city, favorite } = req.body;
  Object.assign(address, JSON.parse(JSON.stringify({ firstName, lastName, email, phone, city, favorite })));
  res.json(address);
});

/**
 * @openapi
 * /addresses/{id}:
 *   delete:
 *     summary: Delete an address
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Deleted }
 *       404: { description: Not found }
 */
app.delete('/addresses/:id', (req, res) => {
  const index = addresses.findIndex((a) => a.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Address not found' });
  addresses.splice(index, 1);
  res.status(204).end();
});

/**
 * @openapi
 * /addresses/{id}/favorite:
 *   patch:
 *     summary: Toggle favorite on/off
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: The updated address
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Address' }
 *       404: { description: Not found }
 */
app.patch('/addresses/:id/favorite', (req, res) => {
  const address = addresses.find((a) => a.id === Number(req.params.id));
  if (!address) return res.status(404).json({ error: 'Address not found' });
  address.favorite = !address.favorite;
  res.json(address);
});

module.exports = app;
