import { v4 as uuidv4 } from "uuid";
import validator from "email-validator";
import bcrypt from "bcrypt";
import register_user from "./validation_schemas/register_user.js";
import userModel from "./models/userModel.js";
import jwt from "jsonwebtoken";

const accessTokenSecret = "myaccesstoken";

//*route to get all users from the Database
const getUsers = async (req, res) => {
  const users = await userModel.find();
  res.send(users);
};

//*Singup method
const signup = async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var verify_password = req.body.verify_password;
  var firstname = req.body.firstname;
  var surname = req.body.surname;
  var email = req.body.email;

  //*check if passwords are the same
  if (password != verify_password)
    return res.status(400).send({
      message: "Passwords must match",
      signup: false,
    });

  const { error } = register_user(req.body);

  if (error) {
    return res.status(400).send({
      message: error.details[0].message.replace("_", " ").replace(/"/g, ""),

      signup: false,
    });
  }

  //*check if email form is valid
  const emailValid = validator.validate(email);

  if (!emailValid) return res.status(400).send({ message: "Email is invalid" });

  //*Check if username already exists
  const username_exists = await userModel
    .where({ username: username })
    .countDocuments();

  if (username_exists)
    return res.status(400).send({
      message: "Username already exists",
      signup: false,
    });

  //*check if email exists
  const email_exists = await userModel.where({ email: email }).countDocuments();

  if (email_exists)
    return res.status(400).send({
      message: "Email Already Exists",
      signup: false,
    });

  var hashedPassword = await bcrypt.hash(password, 10);

  //*Create user
  const user = new userModel({
    username: username,
    password: hashedPassword,
    firstname: firstname,
    surname: surname,
    email: email,
  });

  //*save document to Database
  await user.save();

  //*send response
  return res.status(201).send({
    message: "Signup Successful",
    signup: true,
  });
};

const login = async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var jwt_token;

  //*check if username is inserted
  if (!username)
    return res.status(400).send({
      message: "Username must be inserted",
      login: false,
    });

  //*check if password is inserted
  if (!password)
    return res.status(400).send({
      message: "Password must be inserted",
      login: false,
    });

  const findUser = await userModel.findOne({
    username: username,
  });

  if (!findUser) {
    return res.status(400).send({
      message: "Username not found",
      login: false,
    });
  }

  var loginUser = await bcrypt.compare(password, findUser.password);

  //   const loginUser = await userModel.findOne({
  //     username: findUser.username,
  //     password: md5(password),
  //   });

  if (loginUser) {
    jwt_token = jwt.sign({ username: findUser.username }, accessTokenSecret);

    //console.log(findUser);
    req.session.user_id = findUser._id;
    req.session.username = findUser.username;
    req.session.firstname = findUser.firstname;
    req.session.surname = findUser.surname;
    req.session.email = findUser.email;
    req.session.preferences = findUser.preferences;
    req.session.token = jwt_token;

    console.log("Username: " + req.session.username);
    // return res.redirect("/users/userIndex");

    // return res.send({
    //   session: req.session,
    // });

    return res.status(200).send({
      message: "logged",
      login: true,
      jwt: jwt_token,
    });
  } else
    return res.status(400).send({
      message: "Credentials are wrong",
      login: false,
    });
};

const signout = async (req, res) => {
  req.session.destroy();

  //  return res.redirect("/");
  return res.send("signout!!!");
};

// const save_preferences = async (req, res) => {
//   var preferences = req.body.preferences;

//   await userModel.findOneAndUpdate(
//     // { _id: req.session.user_id },
//     {
//       preferences: preferences,
//     }
//   );

//   return res.status(200).send({
//     message: "Preferences Updated",
//     update: true,
//   });
// };

const get_user_information = async (req, res) => {
  // return res.send({
  //   session: req.session,
  // });

  return res.status(200).send({
    username: req.session.username,
    firstname: req.session.firstname,
    surname: req.session.surname,
    email: req.session.email,
    preferences: req.session.preferences,
    token: req.session.token,
  });
};

const checkLoggedIn = async (req, res) => {
  console.log(req.session.token);

  if (!req.session.token)
    return res.send({
      loggedIn: false,
    });

  return res.send({
    loggedIn: true,
  });
};

const deletePreference = async (req, res) => {
  console.log("deleting");

  var preferences = req.session.preferences;

  console.log(preferences);

  var preference_to_delete = req.query.city_name;

  if (!Array.isArray(preferences)) preferences = [preferences];

  //  preferences.filter((preference)=>{
  //     preference !== preference_to_delete
  // });

  var index = preferences.findIndex(
    (preference) => preference === preference_to_delete
  );

  console.log("up:" + index);

  preferences.splice(index, 1);

  // if(!Array.isArray(updated_preferences_list))
  //   updated_preferences_list = [updated_preferences_list];

  await userModel.findOneAndUpdate(
    { _id: req.session.user_id },
    {
      preferences: preferences,
    }
  );

  req.session.preferences = preferences;

  return res.status(200).send({
    message: "deleted",
  });
};

const update_user_info = async (req, res) => {
  var { new_username, new_firstname, new_surname, new_email } = req.body;

  //var getUserInfo = await userModel.findById(req.session.user_id);

  var username_exists = await userModel.find({
    _id: { $ne: req.session.user_id },
    username: new_username,
  });

  if (username_exists.length > 0)
    return res.status(400).send({
      message: "Username already exists",
    });

  var email_exists = await userModel.find({
    _id: { $ne: req.session.user_id },
    email: new_email,
  });

  if (email_exists.length > 0)
    return res.status(400).send({
      message: "Email already exists",
    });

  await userModel.findOneAndUpdate(
    { _id: req.session.user_id },
    {
      username: new_username,
      firstname: new_firstname,
      surname: new_surname,
      email: new_email,
    }
  );


  req.session.username = new_username;
  req.session.firstname =  new_firstname;
  req.session.surname =  new_surname;
  req.session.email =  new_email; 

  return res.send({
    message:"Information updated"
  });
};

const add_preference =  async(req, res)=>{
    
  
    var city_name =  req.body.city_name;

    var current_preferences =  req.session.preferences;

    console.log('current:',current_preferences);


    if(!Array.isArray(current_preferences))
      current_preferences = [current_preferences];
    
    current_preferences.push(city_name);

    console.log(current_preferences);

    var preference_set = new Set(current_preferences);

    console.log('set:',preference_set);


      await userModel.findOneAndUpdate(
        { _id: req.session.user_id },
        {
          preferences:[...preference_set]
        }
      );

      req.session.preferences =  [...preference_set];

      console.log('size:'+preference_set.size);
      console.log('length:'+current_preferences.length);

      if (preference_set.size != current_preferences.length)
        return res.status(400).send({
          message: "City already to favorites!!!",
        });
      else
        return res.send({
          message: "City added to favorites!!!",
        });


};



export default {
  getUsers,
  signup,
  login,
  signout,
  add_preference,
  //save_preferences,
  get_user_information,
  deletePreference,
  update_user_info,
  checkLoggedIn,
};
