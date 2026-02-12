import { fireEvent, render, screen } from "@testing-library/react";
import { describe, test, expect, beforeEach } from "vitest";
import App from "./App";

//Mock fetch for weatherData
const mockWeatherData = {
  city: { name: "London" },
  list: [
    {
      dt: 1676000000, //tempStamp for forecast weatherData
      main: { temp: 10, humidity: 50 },
      weather: [{ icon: "01d" }],
      wind: { speed: 5 },
    },
  ],
};
//beforeEach(): is a hook in vitest framework, code inside this runs before every test case in describe 
beforeEach(() => {
    //This is the vitest mock fetch Func()
    global.fetch = vi.fn(() =>
        //Promise is Javascript object that represents value that has not been available yet, because of some work (request from network)
        //This mock method returns promise with immediate resolve Fake response object
        Promise.resolve({
            ok: true, //Http request succeed
            json: () => Promise.resolve(mockWeatherData),
            //Mimics a real time API fetch, and returns promise with mock weather data/Fake
        })
    );
});

describe('weatherApp components', () => {
    test('render the title and location section', () => {
        render(<App />);
        expect(screen.getByTestId('appTitle')).toBeInTheDocument();
        expect(screen.getByText('Location')).toBeInTheDocument();
        expect(screen.getByText('Location').closest('div')).toBeInTheDocument();
    });

    test('clicking add(+) show search by city Field', async () => {
        render(<App />);
        const addBtn = screen.queryByLabelText('addon', {hidden: true});
        //Used queryByLabelText instead of LabelText because if returns null 
        // when element does'nt found, prevent test from crashing. 
        fireEvent.click(addBtn);

        const InputField = await screen.findByPlaceholderText('Enter city');
        expect(InputField).toBeInTheDocument();
    });

    test('typing into inputField works & presssing enter will trigger API fetch', async () => {
        render(<App />);
        const addBtn = screen.queryByLabelText('addon', {hidden: true});
        fireEvent.click(addBtn);

        const InputField = await screen.findByPlaceholderText('Enter city');   
        
        //Typing the InputField targetvalue = 'Paris'
        fireEvent.change(InputField, {target: { value: 'Paris'}});
        //Test Target value into InputField is 'Paris
        expect(InputField.value).toBe('Paris');

        //Press Enter
        //keyDown() simulates pressing Enter key into keyboard
        fireEvent.keyDown(InputField, {key: 'Enter'});

        //Test
        //Do they componenet call API fetch correctly with argument
        //The arg HTTP to request weather Data have the string 'Paris',
        expect(fetch).toHaveBeenLastCalledWith(
            expect.stringContaining('Paris')
        );
    });

    test('render weather Data', async () => {
        render(<App />);
        //Difference between getByText and findByText:-
        //getByText: find it right now,
        //findByText: wait for an element to be appear on screen, 
        //beacuse of state update or fetch
        const temps = await screen.findAllByText("10°C"); //returns an array of matching element
        //findByText: only works if there is one exact matching.
        expect(temps.length).toBeGreaterThan(0); //atLeast one element exists
        expect(screen.getByText("London")).toBeInTheDocument();
        expect(screen.getByText("Humidity: 50 %")).toBeInTheDocument();
        expect(screen.getByText("windSpeed: 5 km\/h")).toBeInTheDocument();
    });
});

