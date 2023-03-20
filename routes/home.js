const express = require('express');
const router = express.Router();


// Define a basic route for the homepage
router.get('/', (req, res) => {
    console.log(req.user);
    res.render('homepage', {
      title: 'AGD Logistics - Your Trusted Freight Brokerage Partner',
      description: 'AGD Logistics is a premier freight brokerage company in the United States, specializing in Full Truckload (FTL), Less Than Truckload (LTL), and Partial Load transportation services. Founded on April 21, 2020, we provide tailored solutions to meet your specific shipping needs, ensuring a seamless and efficient shipping experience. Choose AGD Logistics as your trusted partner for all your freight brokerage needs.',
      user: req.user
    });
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