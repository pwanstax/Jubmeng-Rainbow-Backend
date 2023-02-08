import User from "../models/user.model.js";
import Clinic from "../models/clinic.model.js";
import Service from "../models/service.model.js";
import PetFriendly from "../models/petfriendly.model.js";

export const createProduct = (req, res, next) => {
  const {
    owner,
    name,
    phones,
    social_networks,
    status,
    description,
    province,
    latitude,
    longitude,
    images,
    license_id,
    place_type,
  } = req.body.product;

  const type = req.params.type;
  let product = new Clinic(); //must change
  if (type == "clinic") product = new Clinic();
  else if (type == "service") product = Service();
  else if (type == "petfriendly") product = new PetFriendly();
  else {
    return res.status(500).json({
      message:
        "request parameter must be 'clinic' or 'service' or 'petfriendly'",
    });
  }

  if (owner) product.owner = owner;
  if (name) product.name = name;
  if (phones) product.phones = phones;
  if (social_networks) product.social_networks = social_networks;
  if (status) product.status = status;
  if (description) product.description = description;
  if (province) product.province = province;
  if (latitude && longitude) product.setLocation(latitude, longitude);
  if (images) product.images = images;
  if (license_id) product.license_id = license_id;
  if (type == "petfriendly" && place_type) product.place_type = place_type;

  product
    .save()
    .then(function () {
      return res.json({ product: product.toAuthJSON() });
    })
    .catch(function (error) {
      if (error.code === 11000) {
        return res.status(400).send({
          error: "license_id already exists",
        });
      }
      next(error);
    });
};

export const getEachProducts = async (req, res, next) => {
  let condition = {};
  let show_attrs = {
    owner: 1,
    name: 1,
    province: 1,
    location: 1,
    status: 1,
  };
  let Product;
  const type = req.params.type;
  if (type == "clinic") Product = Clinic;
  else if (type == "service") Product = Service;
  else if (type == "petfriendly") {
    Product = PetFriendly;
    show_attrs.place_type = 1;
  } else {
    return res.status(500).json({
      message:
        "request parameter must be 'clinic' or 'service' or 'petfriendly'",
    });
  }
  try {
    const products = await Product.find(condition, show_attrs).lean();
    return res.json(products);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getProducts = async (req, res, next) => {
  let condition = {};
  let show_attrs = {
    owner: 1,
    name: 1,
    province: 1,
    location: 1,
    status: 1,
  };

  try {
    const clinics = await Clinic.find(condition, show_attrs).lean();
    const services = await Service.find(condition, show_attrs).lean();
    show_attrs.place_type = 1;
    const petfriendlies = await PetFriendly.find(condition, show_attrs).lean();

    const all = clinics.concat(services, petfriendlies);
    return res.json(all);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getProductInfo = async (req, res, next) => {
  let Product;
  const type = req.params.type;
  const id = req.params.id;
  if (type == "clinic") Product = Clinic;
  else if (type == "service") Product = Service;
  else if (type == "petfriendly") Product = PetFriendly;
  else {
    return res.status(500).json({
      message:
        "request parameter must be 'clinic' or 'service' or 'petfriendly'",
    });
  }
  try {
    const product = await Product.findById(id).lean();
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};