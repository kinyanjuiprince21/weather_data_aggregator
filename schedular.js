import {getAirQualityIndex, dailyAverages} from './app.js';
import schedule from "node-schedule";
import fs from "fs";

//defining the schedule rule for running the code
// const scheduleRule = new schedule.RecurrenceRule();
// scheduleRule.hour = 0;
// scheduleRule.minute = 3;

//creating a sscheduled job
const job = schedule.scheduleJob('* */1 * * *', async function () {
    try {
        //calling the getAirQualityIndex Function to fetch the air quality data
        await getAirQualityIndex();

        // console.log(dailyAverages);
        if (new Date().getHours() === 0 && new Date().getMinutes() === 0) {
            // Calculate averages
            const airQualityAverage = calculateAverage(dailyAverages.generalAirQuality);
            const pollutantsDialAverage = calculateAveragePollutant(dailyAverages.pollutantsDial);
            const pollutantQuantityAverage = calculateAveragePollutant(dailyAverages.pollutantQuantity);

            // console.log('Daily Averages:');
            // console.log('General Air Quality:', airQualityAverage);
            // console.log('Pollutants Dial:', pollutantsDialAverage);
            // console.log('Pollutant Quantity:', pollutantQuantityAverage);

            //creating an object with averages and date/time
            const currentDate = new Date();
            const data = {
              date: currentDate.toISOString(),
              generalAirQuality: airQualityAverage,
              pollutantsDial: pollutantsDialAverage,
              pollutantQuantity: pollutantQuantityAverage
            };

            //reading existing data or initialize an empty list
            let dataList = [];

            //check if a file with data already exists
            if (fs.existsSync('DailyAirQualityAverages.json')) {
                //read existing data from the file
                const existingData = fs.readFileSync('DailyAirQualityAverages.json', 'utf8');
                dataList = JSON.parse(existingData);
            }
            // console.log(data);
            //append the new data to the list
            dataList.push(data);


            //write the updated list back to the file
            fs.writeFileSync('DailyAirQualityAverages.json', JSON.stringify(dataList, null, 2), function (err) {
                if (err) return console.log(err);
                console.log("Data saved to DailyAirQualityAverages")
            })


        }
    } catch (error) {
        console.log(error);
    }
});
console.log(new Date().getHours());


//calculate the average
function calculateAverage(arr) {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((total, value) => total + value, 0);
    return (sum / arr.length).toFixed(2);
}


//calculate the averages for each pollutant
function calculateAveragePollutant(data) {
    const averages = {};
    for (const pollutantName in data) {
        averages[pollutantName] = calculateAverage(data[pollutantName]);
    }
    return averages;
}

job.invoke();