import bodyParser from "body-parser";

import express from "express";
import usersControler from "./users.controler.js"
import requireLogin from "../../middlewares/requireLogin.js";


var jsonParser = bodyParser.json();




const router = express.Router();


router.post("/login" , jsonParser , usersControler.login);
router.post("/signup" , jsonParser , usersControler.signup);
router.post("/signout", requireLogin , usersControler.signout);

router.get("/get-all-users" ,jsonParser , usersControler.getUsers);
router.get("/get-user-info" ,jsonParser, requireLogin, usersControler.get_user_information);
router.get("/check-logged-in" , usersControler.checkLoggedIn);

router.patch("/update-user-info" , jsonParser ,requireLogin , usersControler.update_user_info);
router.patch("/add-preference", jsonParser, requireLogin , usersControler.add_preference);

router.delete("/delete-city-from-favorites" , jsonParser , requireLogin ,  usersControler.deletePreference);




export default router