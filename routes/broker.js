const express = require('express');
const router = express.Router();
const Broker = require('../models/broker');
const isAuthenticated = require('../middlewares/authMiddleware');
const paginate = require('express-paginate');
// Get all brokers
router.get('/list', paginate.middleware(10, 50), async (req, res) => {     
    const filter = {};
      const [brokerResults] = await Promise.all([
        Broker.find(filter).sort({ updatedAt: 'desc' }).limit(req.query.limit).skip(req.skip).lean().exec(),
      ]);
  
      const [brokersCount] = await Promise.all([
        Broker.countDocuments(filter),
      ]);
  
      const pageCountBrokers = Math.ceil(brokersCount / req.query.limit);
      res.render('brokers/index', {
        user: req.user,
        title: "List of Brokers",
        brokers: brokerResults,
        pageCountBrokers,
        pagesBrokers: paginate.getArrayPages(req)(3, pageCountBrokers, req.query.page),
      });
  });

// Get form for new broker
router.get('/new', (req, res) => {
    res.render('brokers/new', {title: 'New Broker'});
});

// Search
router.get("/search", isAuthenticated, async (req, res) => {
  try {
    const { query } = req.query;
    console.log(query);
    if (query && query.length >= 3) {
      const brokers = await Broker.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { mcNumber: { $regex: query, $options: "i" } },
        ],
      })
        .limit(10)
        .lean();

      res.status(200).json({ success: true, brokers });
    } else {
      res.status(400).json({ success: false, message: "Invalid query" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Create new broker
router.post('/', async (req, res) => {
    const broker = new Broker(req.body.broker);
    await broker.save();
    res.redirect(`/brokers/list`);
});

// Get a specific broker
router.get('/:id', async (req, res) => {
    const broker = await Broker.findById(req.params.id);
    res.render('brokers/show', { broker });
});



// Get form for editing broker
router.get('/:id/edit', async (req, res) => {
    const broker = await Broker.findById(req.params.id);
    res.render('brokers/edit', { broker, title: 'Edit Broker' });
});

// Update a broker
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const broker = await Broker.findByIdAndUpdate(id, { ...req.body.broker });
    res.redirect(`/brokers/${broker._id}`);
});

// Delete a broker
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await Broker.findByIdAndDelete(id);
    res.redirect('/brokers');
});

module.exports = router;
