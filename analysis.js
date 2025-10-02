/**
 * [TODO] Step 0: Import the dependencies, fs and papaparse
 */
const fs = require('fs');
const Papa = require('papaparse');

/**
 * [TODO] Step 1: Parse the Data
 *      Parse the data contained in a given file into a JavaScript objectusing the modules fs and papaparse.
 *      According to Kaggle, there should be 2514 reviews.
 * @param {string} filename - path to the csv file to be parsed
 * @returns {Object} - The parsed csv file of app reviews from papaparse.
 */
function parseData(filename) {
    if (typeof filename !== 'string') {
        throw new Error('filename must be a string');
    }
    const text = fs.readFileSync(filename, 'utf8');
    const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
    });
    return result;
}

/**
 * [TODO] Step 2: Clean the Data
 *      Filter out every data record with null column values, ignore null gender values.
 *
 *      Merge all the user statistics, including user_id, user_age, user_country, and user_gender,
 *          into an object that holds them called "user", while removing the original properties.
 *
 *      Convert review_id, user_id, num_helpful_votes, and user_age to Integer
 *
 *      Convert rating to Float
 *
 *      Convert review_date to Date
 * @param {Object} csv - a parsed csv file of app reviews
 * @returns {Object} - a cleaned csv file with proper data types and removed null values
 */
function cleanData(csv) {
    const rows = csv.data; // assume Papa.parse returns .data as an array
    const cleaned = [];

    for (let i = 0; i < rows.length; i += 1) {
        const r = rows[i];

        // 1) Filter REQUIRED columns by presence on raw strings (NOT by converted/falsy).
        //    Allowed to be missing: user_gender only.
        const missing =
            r.review_id === null ||
            r.review_id === '' ||
            r.app_name === null ||
            r.app_name === '' ||
            r.app_category === null ||
            r.app_category === '' ||
            r.review_text === null ||
            r.review_text === '' ||
            r.review_language === null ||
            r.review_language === '' ||
            r.rating === null ||
            r.rating === '' ||
            r.review_date === null ||
            r.review_date === '' ||
            r.device_type === null ||
            r.device_type === '' ||
            r.num_helpful_votes === null ||
            r.num_helpful_votes === '' ||
            r.app_version === null ||
            r.app_version === '' ||
            r.user_id === null ||
            r.user_id === '' ||
            r.user_age === null ||
            r.user_age === '' ||
            r.user_country === null ||
            r.user_country === '';
        // NOTE: user_gender intentionally NOT checked

        if (missing) {
            continue;
        }

        // 2) Convert values (assume clean data, as per your constraints)
        const review_id = parseInt(r.review_id, 10);
        const app_name = r.app_name;
        const app_category = r.app_category;
        const review_text = r.review_text;
        const review_language = r.review_language;
        const rating = parseFloat(r.rating);
        const review_date = new Date(r.review_date);
        const verified_purchase =
            r.verified_purchase === 'true' || r.verified_purchase === '1';
        const device_type = r.device_type;
        const num_helpful_votes = parseInt(r.num_helpful_votes, 10);
        const app_version = r.app_version;

        const user_id = parseInt(r.user_id, 10);
        const user_age = parseInt(r.user_age, 10);
        const user_country = r.user_country;
        const user_gender = r.user_gender; // may be null/blank

        // 3) Validate Date without isNaN: reject "Invalid Date"
        if (review_date.toString() === 'Invalid Date') {
            continue;
        }

        const obj = {
            review_id,
            app_name,
            app_category,
            review_text,
            review_language,
            rating,
            review_date,
            verified_purchase,
            device_type,
            num_helpful_votes,
            app_version,
            user: {
                user_age,
                user_country,
                user_gender,
                user_id,
            },
        };

        cleaned.push(obj);
    }

    return cleaned;
}

/**
 * [TODO] Step 3: Sentiment Analysis
 *      Write a function, labelSentiment, that takes in a rating as an argument
 *      and outputs 'positive' if rating is greater than 4, 'negative' is rating is below 2,
 *      and 'neutral' if it is between 2 and 4.
 * @param {Object} review - Review object
 * @param {number} review.rating - the numerical rating to evaluate
 * @returns {string} - 'positive' if rating is greater than 4, negative is rating is below 2,
 *                      and neutral if it is between 2 and 4.
 */
function labelSentiment({ rating }) {
    if (rating > 4.0) {
        return 'positive';
    }
    if (rating < 2.0) {
        return 'negative';
    }
    return 'neutral';
}

/**
 * [TODO] Step 3: Sentiment Analysis by App
 *      Using the previous labelSentiment, label the sentiments of the cleaned data
 *      in a new property called "sentiment".
 *      Add objects containing the sentiments for each app into an array.
 * @param {Object} cleaned - the cleaned csv data
 * @returns {{app_name: string, positive: number, neutral: number, negative: number}[]} - An array of objects, each summarizing sentiment counts for an app
 */
function sentimentAnalysisApp(cleaned) {
    const counts = {};

    for (let i = 0; i < cleaned.length; i += 1) {
        const row = cleaned[i];

        // compute tag inline to avoid any call/arg mismatch
        let tag;
        if (row.rating > 4.0) {
            tag = 'positive';
        } else if (row.rating < 2.0) {
            tag = 'negative';
        } else {
            tag = 'neutral';
        }

        // store it on the row (homework requires a 'sentiment' property)
        row.sentiment = tag;

        // normalize the app key
        const appKey =
            typeof row.app_name === 'string'
                ? row.app_name.trim()
                : row.app_name;

        if (!counts[appKey]) {
            counts[appKey] = { positive: 0, neutral: 0, negative: 0 };
        }
        if (tag === 'positive') counts[appKey].positive += 1;
        else if (tag === 'negative') counts[appKey].negative += 1;
        else counts[appKey].neutral += 1;
    }

    const out = [];

    for (const app in counts) {
        out.push({
            app_name: app,
            positive: counts[app].positive,
            neutral: counts[app].neutral,
            negative: counts[app].negative,
        });
    }

    // deterministic order
    out.sort((a, b) => {
        if (a.app_name < b.app_name) return -1;
        if (a.app_name > b.app_name) return 1;
        return 0;
    });

    return out;
}

/**
 * [TODO] Step 3: Sentiment Analysis by Language
 *      Using the previous labelSentiment, label the sentiments of the cleaned data
 *      in a new property called "sentiment".
 *      Add objects containing the sentiments for each language into an array.
 * @param {Object} cleaned - the cleaned csv data
 * @returns {{lang_name: string, positive: number, neutral: number, negative: number}[]} - An array of objects, each summarizing sentiment counts for a language
 */
function sentimentAnalysisLang(cleaned) {
    const counts = {};

    for (let i = 0; i < cleaned.length; i += 1) {
        const row = cleaned[i];

        // compute tag inline to avoid any call/arg mismatch
        let tag;
        if (row.rating > 4.0) {
            tag = 'positive';
        } else if (row.rating < 2.0) {
            tag = 'negative';
        } else {
            tag = 'neutral';
        }

        // store it on the row (homework requires a 'sentiment' property)
        row.sentiment = tag;

        // normalize language key: trim and lowercase
        let langKey = row.review_language;
        if (typeof langKey === 'string') {
            langKey = langKey.trim().toLowerCase();
        }

        if (!counts[langKey]) {
            counts[langKey] = { positive: 0, neutral: 0, negative: 0 };
        }
        if (tag === 'positive') counts[langKey].positive += 1;
        else if (tag === 'negative') counts[langKey].negative += 1;
        else counts[langKey].neutral += 1;
    }

    const out = [];

    for (const lang in counts) {
        out.push({
            lang_name: lang,
            positive: counts[lang].positive,
            neutral: counts[lang].neutral,
            negative: counts[lang].negative,
        });
    }

    out.sort((a, b) => {
        if (a.lang_name < b.lang_name) return -1;
        if (a.lang_name > b.lang_name) return 1;
        return 0;
    });

    return out;
}

/**
 * [TODO] Step 4: Statistical Analysis
 *      Answer the following questions:
 *
 *      What is the most reviewed app in this dataset, and how many reviews does it have?
 *
 *      For the most reviewed app, what is the most commonly used device?
 *
 *      For the most reviewed app, what the average star rating (out of 5.0)?
 *
 *      Add the answers to a returned object, with the format specified below.
 * @param {Object} cleaned - the cleaned csv data
 * @returns {{mostReviewedApp: string, mostReviews: number, mostUsedDevice: String, mostDevices: number, avgRating: float}} -
 *          the object containing the answers to the desired summary statistics, in this specific format.
 */
function summaryStatistics(cleaned) {
    const appCounts = {};
    for (let i = 0; i < cleaned.length; i += 1) {
        const app = cleaned[i].app_name;
        if (!appCounts[app]) appCounts[app] = 0;
        appCounts[app] += 1;
    }

    let mostReviewedApp = '';
    let mostReviews = 0;
    for (const app in appCounts) {
        if (appCounts[app] > mostReviews) {
            mostReviews = appCounts[app];
            mostReviewedApp = app;
        }
    }

    const deviceCounts = {};
    let ratingSum = 0;
    let ratingN = 0;

    for (let i = 0; i < cleaned.length; i += 1) {
        const row = cleaned[i];
        if (row.app_name === mostReviewedApp) {
            const device = row.device_type;
            if (!deviceCounts[device]) deviceCounts[device] = 0;
            deviceCounts[device] += 1;

            ratingSum += row.rating;
            ratingN += 1;
        }
    }

    let mostUsedDevice = '';
    let mostDevices = 0;
    for (const device in deviceCounts) {
        if (deviceCounts[device] > mostDevices) {
            mostDevices = deviceCounts[device];
            mostUsedDevice = device;
        }
    }

    const avgRating = ratingSum / ratingN;

    return {
        mostReviewedApp,
        mostReviews,
        mostUsedDevice,
        mostDevices,
        avgRating,
    };
}

/**
 * Do NOT modify this section!
 */
module.exports = {
    parseData,
    cleanData,
    sentimentAnalysisApp,
    sentimentAnalysisLang,
    summaryStatistics,
    labelSentiment,
};
