'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var mongoose = require('mongoose');
var Order = mongoose.model('Order');

//for RESTful routes-- a get usually returns a collection
router.get('/', function(req, res,next){
  //returns a new order
  var order = new Order();
  res.json(order);
});

//who is the user? don't you know the user from passport?
//req.user?
router.get('/:userId', function(req,res,next){
  Order.find({user: req.params.userId, status: 'created' })
  .then(function(orders){
    res.json(orders);
  }, next);
});

router.put('/:orderId', function(req,res, next){
  Order.findById(req.params.orderId).then(function(order){
    if (order){
      order.items = req.body.items;
      order.save().then(function(){
        return res.json(order);
      }, next);//no need for next
    } else {// no need for else if you return before
      res.json(order);
  }
  });
});

router.post('/', function(req,res,next){
  //Creates a new order from the recieved data
  Order.create(req.body).then(function(order){
    res.json(order);
  }, next);
});

//this could be RESTful-- if status is changing to 'checkout' state-- then you know you are checking out..
router.put('/checkout/:orderId', function(req,res,next){
  Order.findById(req.params.orderId).then(function(order){
    order.status = req.body.status;
    order.email = req.body.email;
    order.address = req.body.address;
    order.save().then(function(){
      res.sendStatus(200);
    });
  });
});

router.delete('/:orderId', function(req,res,next){
  Order.remove({_id: req.params.orderId})
  .then(function(){
    res.sendStatus(203);
  },next);
});

//this could also be RESTful
// POST to /:orderId/lineItems to add a lineItem
// PUT to /:orderId/lineItems/:id to edit a lineItem
// DELETE to /:orderId/lineItems/:id to edit a lineItem
router.post('/addItem', function(req, res, next) {
  //no need for promises
  var p = new Promise(function(resolve, reject) {
    if (req.session.order) {
      Order.findById(req.session.order)
        .then(resolve);
    } else {
      var o = new Order();
      req.session.order = o._id;
      resolve(o);
    }

  });

  p.then(function(order) {
      return order.addItem(req.body);
    })
    .then(function(order) {
      res.send(order);
    });
});

router.post('/removeItem', function(req, res) {
  Order.findById(req.session.order)
    .then(function(order) {
      return order.removeItem(req.body);
    })
    .then(function(order) {
      res.send(order);
    });
});

router.post('/commit', function(req, res, next) {
  Order.findById(req.session.order)
    .then(function(order){
      return order.commit();
    })
    .then(function(order) {
      res.send(order);
    }, next);
});
