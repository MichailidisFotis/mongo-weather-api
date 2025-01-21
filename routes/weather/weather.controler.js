import axios from "axios"
import dotenv from "dotenv"
import userModel from "../users/models/userModel.js"



dotenv.config()


const get_current_weather =  async(req ,res)=>{

    var user_id  =  req.session.user_id

    

    var forecasts  = []

    var api_key =  process.env.WEATHER_API_KEY


    const user_preferences =  await userModel.findOne({
        _id :user_id})
    // } , 'preferences')



    if(user_preferences.preferences.length ==0)
        return res.send({
            forecasts:[]
        })

   for(var preference of user_preferences.preferences){
        await axios.get(`http://api.weatherapi.com/v1/current.json?key=${api_key}&q=${preference}&aqi=no`)
        .then((response)=>{

              forecasts.push({
                "name":response.data.location.name ,
                "time":  ""+response.data.location.localtime.split(" ")[1],
                "temperature_celc":response.data.current.temp_c,
                "condition":response.data.current.condition,
                "wind_kph":response.data.current.wind_kph,
                "humidity":response.data.current.humidity
            });
        });
   }


    return res.send({
        forecasts:forecasts
    });

}


const get_city_forecasts =  async(req,res)=>{


        const city_name = req.query.city_name;
        console.log(city_name);
        var api_key =  process.env.WEATHER_API_KEY

        var forecasts = [];
        var current;
        
        var response_body;

        try {
            await axios.get(`http://api.weatherapi.com/v1/forecast.json?key=${api_key}&days=7&q=${city_name}&aqi=no`)
            .then((response)=>{
    
                
                current ={
                    "name":response.data.location.name ,
                    "time":  ""+response.data.location.localtime.split(" ")[1],
                    "temperature_celc":response.data.current.temp_c,
                    "condition":response.data.current.condition,
                    "wind_kph":response.data.current.wind_kph,
                    "humidity":response.data.current.humidity
                };
    
                var forecast_days =  response.data.forecast.forecastday;
    
                if(!Array.isArray(forecast_days))
                    forecast_days = [forecast_days];
                
    
                forecast_days.forEach((day)=>{
                    forecasts.push({
                        "name":city_name,
                        "date":day.date,
                        "humidity": day.day.avghumidity,
                        "temperature_celc": day.day.avgtemp_c,
                        "condition": day.day.condition.text,
                        "icon": day.day.condition.icon
                    });
                });
    
    
                response_body = {
                    current,
                    forecasts
                }
                
    
                
                
            });
            
            return res.send(response_body);
            
        } catch (error) {
            return res.status(400).send({
                message: "No matching location found."
            })
        }


}








export default{get_current_weather , get_city_forecasts}