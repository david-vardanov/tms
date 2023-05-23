const express = require('express');
const router = express.Router();
const Load = require('../models/load');
const paginate = require('express-paginate');

// Get all loads
router.get('/list', paginate.middleware(10, 50), async (req, res) => {     
    const filter = {};
      const [loadResults] = await Promise.all([
        Load.find(filter).sort({ updatedAt: 'desc' }).populate('broker').populate('assignedUser').populate('carrier').limit(req.query.limit).skip(req.skip).lean().exec(),
      ]);
  
      const [loadsCount] = await Promise.all([
        Load.countDocuments(filter),
      ]);
  
      const pageCountLoads = Math.ceil(loadsCount / req.query.limit);
      res.render('loads/index', {
        user: req.user,
        title: "List of Loads",
        loads: loadResults,
        pageCountLoads,
        pagesLoads: paginate.getArrayPages(req)(3, pageCountLoads, req.query.page),
      });
  });

// Load New
router.get('/new', (req, res) => {
  res.render('loads/new', {title: 'New Load'});
});

// Load Create
router.post('/', async (req, res) => {
  const newLoad = new Load(req.body);
  await newLoad.save();
  res.redirect('/loads/list');
});

// Load Show
router.get('/:id', async (req, res) => {
  const load = await Load.findById(req.params.id);
  res.render('loads/show', { load });
});

// Load Edit
router.get('/:id/edit', async (req, res) => {
  const load = await Load.findById(req.params.id);
  res.render('loads/edit', { load });
});

// Load Update
router.put('/:id', async (req, res) => {
  await Load.findByIdAndUpdate(req.params.id, req.body);
  res.redirect(`/loads/${req.params.id}`);
});

// Load Destroy
router.delete('/:id', async (req, res) => {
  await Load.findByIdAndDelete(req.params.id);
  res.redirect('/loads');
});

module.exports = router;
