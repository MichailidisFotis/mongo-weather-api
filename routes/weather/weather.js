import bodyParser from "body-parser";

import express from "express";
import axios from "axios";
import requireLogin from "../../middlewares/requireLogin.js";
import weatherControler from "./weather.controler.js";

var jsonParser = bodyParser.json();




const router = express.Router();



router.get("/current-weather", requireLogin ,  weatherControler.get_current_weather);
router.get("/forecasts",requireLogin,jsonParser , weatherControler.get_city_forecasts);








export default router