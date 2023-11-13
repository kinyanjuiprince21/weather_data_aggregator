import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

// Create a map to store daily averages
const dailyAverages = {
    generalAirQuality: [],
    pollutantsDial: {},
    pollutantQuantity: {},
};



export { dailyAverages };
export async function getAirQualityIndex() {
    try {
        const response = await fetch('https://weather.com/en-KE/forecast/air-quality/l/6c29e343c3e74d744ff89ff9dfc5669fd4ecf5cfe43bf6e1a351a32681f611c3');
        const body = await response.text();
        const $ = cheerio.load(body);

        const airAnalysis = {
            title: $('.Card--containerQuery--T7772 > .LocationPageTitle--LocationPageTitle--31k4p').text(),
            generalAirAnalysis: [],
            allPollutants: [],
        };



        const generalAirQuality = $('.Card--containerQuery--T7772').first().find('.AirQuality--extendedDialText--1kqIb').text().trim();
        const generalAirSeverity = $('.Card--containerQuery--T7772').first().find('.AirQuality--extendedDialCategoryText--2V7SX').text();
        const generalAirSeverityDescription = $('.Card--containerQuery--T7772').first().find('.AirQualityText--severityText--1Bkxv').text();
        const primaryPollutant = $('.Card--containerQuery--T7772').first().find('.AirQuality--rightCol--2HhXi > .AirQuality--pollutantName--3SjhF').text();

        airAnalysis.generalAirAnalysis.push({
                generalAirQuality,
                generalAirSeverity,
                generalAirSeverityDescription,
                primaryPollutant,
            });
        $('.Card--containerQuery--T7772 > .Card--content--1GQMr > .AirQuality--allPollutantDials--2h_JC > .AirQuality--dial--3TK5w').each((i, el) => {
            const pollutantDial = $(el).find('.AirQuality--pollutantDialText--2Q5Oh').text().trim();
            const pollutantName = $(el).find('.AirQuality--pollutantName--3SjhF').text();
            const pollutantSeverity = $(el).find('.AirQuality--pollutantCategory--1iNHF').text();
            const pollutantQuantity = $(el).find('.AirQuality--pollutantMeasurement--2s1IZ').text();
            airAnalysis.allPollutants.push({
                pollutantDial,
                pollutantName,
                pollutantSeverity,
                pollutantQuantity,
            });
        });

        // Push daily data into the dailyAverages map
        dailyAverages.generalAirQuality.push(Number(generalAirQuality));

        airAnalysis.allPollutants.forEach((pollutantData) => {
            const { pollutantName, pollutantDial, pollutantQuantity } = pollutantData;

            //Creating empty lists of  pollutantDial and pollutantQuantity  and pushing them into the respective daily averages maps
            if (!dailyAverages.pollutantsDial[pollutantName]) {
                dailyAverages.pollutantsDial[pollutantName] = [];
            }
            if (!dailyAverages.pollutantQuantity[pollutantName]) {
                dailyAverages.pollutantQuantity[pollutantName] = [];
            }

            dailyAverages.pollutantsDial[pollutantName].push(Number(pollutantDial));
            dailyAverages.pollutantQuantity[pollutantName].push(parseFloat(pollutantQuantity.match(/[\d.]+/)[0]));
        });

        // console.log(dailyAverages);
    } catch (e) {
        console.log(e);
    }
}
