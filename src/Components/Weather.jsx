
import React, { useEffect, useRef, useState } from "react";
import './weather.css';
import Livedatetime from "./LiveDateTime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const Weather = () => {
    const[view, setView] = useState(false);
    const [weatherData, setWeatherData] = useState(false);
    const [forecast, setForecast] = useState([]);
    const inputRef = useRef();
    function handleClick() {
        setView(true);
    }
    const getIconUrl = (iconCode) => // Its a Func that takes one input IconCode and insert it into the Url.
        `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    const search = async (city) => {
        if(city === '') {
            alert('Enter city name');
            return;
        }
        try {
            const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${import.meta.env.VITE_WEATHER_APP_ID}`;
            const response = await fetch(url); // fetch/request Weather data for this city from API Server
            const data = await response.json(); // convert JSON text into JS object
            if(!response.ok) {
                alert(data.message);
                return;
            }
            console.log(data);
            const current = data.list[0]; 
        setWeatherData({
            humidity: current.main.humidity,
            windSpeed: current.wind.speed,
            temperature: Math.floor(current.main.temp),
            location: data.city.name,
        });
        setForecast(data.list.slice(0, 8));
        } catch (error) {
            setWeatherData(false);
            console.error('Error in fetching weather data');           
        }
    }
    function handleSearch() {
        const value = inputRef.current.value;
        if(!value.trim()) {
            search(value);
            return;
        }
        search(value);
        inputRef.current.value = "";
        inputRef.current.focus();
    }
    useEffect(()=> {
        search('London');
    }, []) // run this effect only once when the Page loaded/component mounted
    useEffect(() => {
        if (view) {
           inputRef.current?.focus(); 
           // if the input box exist, put focus into it so that user can type.
        }
    }, [view]); //run this effect everytime the view gets true.
    return (
        <div className="container">
            <div className="title">
                <h1 data-testid = 'appTitle'>
                    Weather Data app
                </h1>
            </div>
            {view ? <>
            <div className="searchBox">
                 <input ref={inputRef} type = 'text' placeholder="Enter city" onKeyDown={(e) => {
                    if(e.key === 'Enter') handleSearch() }}></input>
                 <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" onClick={() => handleSearch()}/>               
            </div></> : <>
            <div className="Location_nav">
                <div className="Location_nav_title">
                  <FontAwesomeIcon className="Location_nav_icon" icon = { faLocationDot } />
                  <p className="Location_nav_text">Location</p>
               </div>
               <div className="Location_nav_action">
                  <FontAwesomeIcon className="Location_nav_addBtn" icon = { faPlus } onClick={() => handleClick()}
                   aria-label = 'addon' />
               </div>
            </div>
            </>}
            {weatherData ? <>
            <div className='currentDateTime'>
               <Livedatetime /> 
            </div>
            <div className="temperature">
                <p className="degrees">{weatherData.temperature}°C</p>
                <p className="location">{weatherData.location}</p>
                <p><span><i>Humidity: {weatherData.humidity} %</i></span></p>
                <p><span><i>windSpeed: {weatherData.windSpeed} km/h</i></span></p>
            </div>
            <div className="forecast">
                {forecast.map((item, index) => (
                    <div className="forecast-item" key={index}>
                        <p className="forecast-date">
                            {(() => {
                                const date = new Date(item.dt * 1000);  
                                // new Date is the JavaScript date object 
                                // [item.dt is the date and time of forecast item ]
                                const day = date.getDate(); 
                                //getDate() Javascript date method used to get day of month
                                const month = date.toLocaleDateString('en-US', { month: 'short' }); //toLocaleDateString() method used to convert date object into a human readeable string [Locale: format the date based on country/Language for UK 1 Jan, for US Jan 1]
                                const getOrdinal = (d) => {
                                    if (d > 3 && d < 21) return 'th';
                                    switch (d % 10) {
                                        case 1: return 'st';
                                        case 2: return 'nd';
                                        case 3: return 'rd';
                                        default: return 'th';
                                    }};
                                    return `${day}${getOrdinal(day)} ${month}`;
                                    })()}
                                    </p>
                                    <p className="forecast-day">
                                        {new Date(item.dt * 1000).toLocaleString([], {
                                            weekday: 'long'
                                        })}
                                    </p>
                                    <p className="forecast-time">
                                        {new Date(item.dt * 1000).toLocaleString([], {
                                            hour: 'numeric',
                                            hour12: true,
                                        })}
                                    </p>
                                    <img
                                    src = {getIconUrl(item.weather[0].icon)}>
                                    </img>
                                    <p className="forecast-temp">
                                        {Math.floor(item.main.temp)}°C 
                                    </p>
                                </div>
                            ))}
                        </div>
            </> : <></>}
        </div>
    );
}
export default Weather
