const express = require('express');
const router = express.Router();
const Carrier = require('../models/carrier');
const Invite = require('../models/invite');
const paginate = require('express-paginate');
//const { ensureAuthenticated } = require('../config/auth');



// Define a basic route for the homepage

router.get('/', paginate.middleware(10, 50), async (req, res) => {
  if (req.isAuthenticated()) {
    const currentDate = new Date();
    const [invitesResults, carriersResults] = await Promise.all([
      Invite.find({ expiresAt: { $gte: currentDate } }).sort({ createdAt: 'desc' }).limit(req.query.limit).skip(req.skip).lean().exec(),
      Carrier.find({ status: 'inModeration' }).sort({ updatedAt: 'desc' }).limit(req.query.limit).skip(req.skip).lean().exec(),
    ]);

    const [invitesCount, carriersCount] = await Promise.all([
      Invite.countDocuments({ expiresAt: { $gte: currentDate } }),
      Carrier.countDocuments({ status: 'need modify' }),
    ]);

    const pageCountInvites = Math.ceil(invitesCount / req.query.limit);
    const pageCountCarriers = Math.ceil(carriersCount / req.query.limit);

    res.render('dashboard/index', {
      user: req.user,
      title: "Dashboard",
      invites: invitesResults,
      carriers: carriersResults,
      pageCountInvites,
      pageCountCarriers,
      pagesInvites: paginate.getArrayPages(req)(3, pageCountInvites, req.query.page),
      pagesCarriers: paginate.getArrayPages(req)(3, pageCountCarriers, req.query.page),
    });

  } else {
    res.render('homepage', {
      user: req.user,title: "Under Construction"
    });
  }
});
  
  router.get('/about', (req, res) => {
    res.render('about', {
      title: 'About - AGD Logistics',
      //description: 'AGD Logistics is a premier freight brokerage company in the United States, specializing in Full Truckload (FTL), Less Than Truckload (LTL), and Partial Load transportation services. Founded on April 21, 2020, we provide tailored solutions to meet your specific shipping needs, ensuring a seamless and efficient shipping experience. Choose AGD Logistics as your trusted partner for all your freight brokerage needs.'
    });
  });

  router.get('/carriers', (req, res) => {
    res.render('carrier', {
      title: 'Carriers - AGD Logistics',
      //description: 'AGD Logistics is a premier freight brokerage company in the United States, specializing in Full Truckload (FTL), Less Than Truckload (LTL), and Partial Load transportation services. Founded on April 21, 2020, we provide tailored solutions to meet your specific shipping needs, ensuring a seamless and efficient shipping experience. Choose AGD Logistics as your trusted partner for all your freight brokerage needs.'
    });
  });

  router.get('/partnership', (req, res) => {
    res.render('partnership', {
      title: 'Partnership with AGD Logistics',
      //description: 'AGD Logistics is a premier freight brokerage company in the United States, specializing in Full Truckload (FTL), Less Than Truckload (LTL), and Partial Load transportation services. Founded on April 21, 2020, we provide tailored solutions to meet your specific shipping needs, ensuring a seamless and efficient shipping experience. Choose AGD Logistics as your trusted partner for all your freight brokerage needs.'
    });
  });

  router.get('/services', (req, res) => {
    res.render('services', {
      title: 'Services - AGD Logistics',
      //description: 'AGD Logistics is a premier freight brokerage company in the United States, specializing in Full Truckload (FTL), Less Than Truckload (LTL), and Partial Load transportation services. Founded on April 21, 2020, we provide tailored solutions to meet your specific shipping needs, ensuring a seamless and efficient shipping experience. Choose AGD Logistics as your trusted partner for all your freight brokerage needs.'
    });
  });

  router.get('/contacts', (req, res) => {
    res.render('contacts', {
      title: 'Contacts - AGD Logistics',
      //description: 'AGD Logistics is a premier freight brokerage company in the United States, specializing in Full Truckload (FTL), Less Than Truckload (LTL), and Partial Load transportation services. Founded on April 21, 2020, we provide tailored solutions to meet your specific shipping needs, ensuring a seamless and efficient shipping experience. Choose AGD Logistics as your trusted partner for all your freight brokerage needs.'
    });
  });

  module.exports = router;