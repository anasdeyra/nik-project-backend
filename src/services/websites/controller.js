const { Website } = require("../../models/website");
const axios = require("axios");

function fetchDomain(domain) {
  const options = {
    method: "GET",
    url: "https://similar-web.p.rapidapi.com/get-analysis",
    params: { domain },
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "similar-web.p.rapidapi.com",
    },
  };

  return axios.request(options);
}

const addWebsite = async (req, res) => {
  try {
    const { name, domain } = req.body;
    const { data, status } = await fetchDomain(domain);

    if (status === 204) {
      return res.status(400).json({
        message: "no data found for this domain! maybe the domain is invalid.",
      });
    }

    const { EstimatedMonthlyVisits } = data;

    //convert the object to an array of objects
    const dataPoints = Object.entries(EstimatedMonthlyVisits).map(
      ([date, visitsCount]) => ({
        date,
        visitsCount: String(visitsCount),
      })
    );

    const newWebsite = await Website.create({ name, domain, dataPoints });
    res.json(newWebsite);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getWebsites = async (req, res) => {
  try {
    const websites = await Website.find();
    res.json(websites);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const removeWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    await Website.findByIdAndDelete(id);
    res.json({ message: "Website deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateAllWebsites = async (req, res) => {
  try {
    const websites = await Website.find();
    const promises = await Promise.all(
      websites.map(async (website) => {
        const { data, status } = await fetchDomain(website.domain);

        if (status === 204) {
          return res.status(400).json({
            message:
              "no data found for this domain! maybe the domain is invalid.",
          });
        }

        const { EstimatedMonthlyVisits } = data;

        //convert the object to an array of objects
        const dataPoints = Object.entries(EstimatedMonthlyVisits).map(
          ([date, visitsCount]) => ({
            date,
            visitsCount: String(visitsCount),
          })
        );

        const upserts = dataPoints.map(async (dp) => {
          if (website.dataPoints.find((d) => d.date === dp.date)) {
            return website.updateOne(
              {
                $set: { "dataPoints.$[elem].visitsCount": dp.visitsCount },
              },
              { arrayFilters: [{ "elem.date": dp.date }] }
            );
          } else {
            return website.updateOne({
              $push: { dataPoints: dp },
            });
          }
        });
        return Promise.all(upserts);
      })
    );

    let callCount = 0;
    let lastCallTime = Date.now();

    const maxCallsPerMinute = 5;
    const intervalinMs = 1000;

    async function rateLimitedApiCall(promise) {
      // Check if rate limit has been reached
      if (
        callCount >= maxCallsPerMinute &&
        Date.now() - lastCallTime < intervalinMs
      ) {
        console.log("Rate limit reached. Waiting...");
        await new Promise((resolve) =>
          setTimeout(resolve, 60000 - (Date.now() - lastCallTime))
        );
      }

      // Make API call
      console.log("Making API call...");
      callCount++;
      lastCallTime = Date.now();

      // Wait for the promise to resolve
      return promise;
    }

    async function runPromises() {
      const rateLimitedPromises = promises.map(rateLimitedApiCall);
      await Promise.all(rateLimitedPromises);
    }

    runPromises()
      .then(() => {
        res.status(200).json({ message: "All websites updated." });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Something went wrong." });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addWebsite,
  getWebsites,
  removeWebsite,
  updateAllWebsites,
};
