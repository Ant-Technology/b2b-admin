import React from "react";
import { Route, Routes } from "react-router-dom";
import Categories from "pages/categories";
import Distributors from "pages/distributors";
import Products from "pages/products";
import ProductSkus from "pages/productSkus";
import Regions from "pages/regions";
import Retailers from "pages/retailers";
import Warehouses from "pages/warehouses";
import Login from "./pages/login";
import Stocks from "pages/stocks";
import Orders from "pages/orders";
import Shipments from "pages/shipments";
import Wallets from "pages/wallets";
import Dashboard from "pages/dashboard";
import VehicleTypes from "pages/vehicleTypes";
import Vehicles from "pages/vehicles";
import Drivers from "pages/driver";
import Users from "pages/users";
import DropOffs from "pages/dropoffs";
import Sales from "pages/sales"
import Feedbacks from "pages/feedbacks"
import Config from "pages/settings/config";
import FeedbackTypes from "pages/feedbacks/feedback_type";
import Activity from "pages/activityLogs";
const RoutesComp = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/products" element={<Products />} />
      <Route path="/productvariants" element={<ProductSkus />} />
      <Route path="/regions" element={<Regions />} />
      <Route path="/retailers" element={<Retailers />} />
      <Route path="/warehouses" element={<Warehouses />} />
      <Route path="/distributors" element={<Distributors />} />
      <Route path="/stocks" element={<Stocks />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/shipments" element={<Shipments />} />
      <Route path="/wallets" element={<Wallets />} />
      <Route path="/drivers" element={<Drivers />} />
      <Route path="/vehicle_types" element={<VehicleTypes />} />
      <Route path="/vehicles" element={<Vehicles />} />
      <Route path="/users" element={<Users />} />
      <Route path="/dropoffs" element={<DropOffs />} />
      <Route path="/login" element={<Login />} />
      <Route path="/sales" element={<Sales />} />
      <Route path="/feedbacks" element={<Feedbacks/>}/>
      <Route path="/feedback-types" element = {<FeedbackTypes/>}/>
      <Route path="/config" element = {<Config/>}/>
      <Route path="/activities" element = {<Activity/>} />
    </Routes>
  );
};

export default RoutesComp;
