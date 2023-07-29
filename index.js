// import {createRequire} from "module";
// const require = createRequire(import.meta.url);
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import url from 'url';
import urlJoin from 'url-join';
import rp from 'request-promise';
import dotenv from 'dotenv';
import { Telegraf } from 'telegraf';

dotenv.config()

function getENV(envName) {
  if (process.env[envName] && process.env[envName].length === 0) {
    console.error(`Error loading env variable ${envName}`)
    process.exit(1)
  }
  return process.env[envName]
}

async function getDictCount(dict) {
  return Object.keys(dict).length;
}

async function isTimeApiAlive() {
  return new Promise(async (resolve, reject) => {
    const timeApi = getENV('TIME_API')
    const options = {
      method: 'GET',
      uri: timeApi,
      json: true
    }
    await rp(options)
      .then(function (response) {
        if (response && response.status && response.status) {
          if (response.status === 'ok') {
            resolve({apiWebsite: true, timeApiStatus: true})
          } else {
            resolve({apiWebsite: true, timeApiStatus: false})
          }
        } else {
          resolve({apiWebsite: false, timeApiStatus: false})
        }
      })
      .catch(function (err) {
        const error = err.error
        resolve({apiWebsite: false, timeApiStatus: false, error: error})
      })
  })
}

async function getCurrentTimeFromAPI() {
  return new Promise(async (resolve, reject) => {
    const isApiAlive = await isTimeApiAlive()
    var callbackData = {
      status: false,
      data: null,
    }
    if (isApiAlive.apiWebsite && isApiAlive.timeApiStatus) {
      const timeApi = getENV('TIME_API')
      const callingURL = url.resolve(timeApi, 'datetime')
      const options = {
        method: 'GET',
        uri: callingURL,
        json: true
      }
      await rp(options)
        .then(function (response) {
          if (response && response.time && response.dates) {
            callbackData.status = true
            callbackData.data = response
            resolve(callbackData)
          }
        })
        .catch(function (err) {
          const error = err.error
          callbackData.error = error
          resolve(callbackData)
        })
    }
  })
}

async function getDayEvents(day, month, year, type) {
  return new Promise(async (resolve, reject) => {
    const isApiAlive = await isTimeApiAlive()
    var callbackData = {
      status: false,
      data: null,
    }
    if (isApiAlive.apiWebsite && isApiAlive.timeApiStatus) {
      const timeApi = getENV('TIME_API')
      var callingURL = urlJoin(timeApi, `events`)
      callingURL = url.format({
        pathname: callingURL,
        query: {
          day: day,
          month: month,
          year: year,
          type: type
        }
      })
      const options = {
        method: 'GET',
        uri: callingURL,
        json: true
      }
      await rp(options)
        .then(function (response) {
          if (response && response.events) {
            callbackData.status = true
            callbackData.data = response
            resolve(callbackData)
          }
        })
        .catch(function (err) {
          const error = err.error
          callbackData.error = error
          resolve(callbackData)
        })
    }
  })
}

async function getMonthEvents(month, year) {
  return new Promise(async (resolve, reject) => {
    const isApiAlive = await isTimeApiAlive()
    var callbackData = {
      status: false,
      data: null,
    }
    if (isApiAlive.apiWebsite && isApiAlive.timeApiStatus) {
      const timeApi = getENV('TIME_API')
      var callingURL = urlJoin(timeApi, `events`, `month`)
      callingURL = url.format({
        pathname: callingURL,
        query: {
          month: month,
          year: year,
        }
      })
      console.log(callingURL)
      const options = {
        method: 'GET',
        uri: callingURL,
        json: true
      }
      await rp(options)
        .then(function (response) {
          if (response) {
            callbackData.status = true
            callbackData.data = response
            resolve(callbackData)
          }
        })
        .catch(function (err) {
          const error = err.error
          callbackData.error = error
          resolve(callbackData)
        })
    }
  })
}

const persianMonths = {
  1: 'فروردین',
  2: 'اردیبهشت',
  3: 'خرداد',
  4: 'تیر',
  5: 'مرداد',
  6: 'شهریور',
  7: 'مهر',
  8: 'آبان',
  9: 'آذر',
  10: 'دی',
  11: 'بهمن',
  12: 'اسفند',
}

const time = await getCurrentTimeFromAPI()
if (time.status) {
  const timeData = time.data
  console.log(`Current time is ${timeData.time}`)
  console.log(`Current date is ${timeData.dates.shamsi.numeral}`)
  const dateNumeralArray = timeData.dates.shamsi.numeral.split('-').map(Number)//.reverse()
  const dayString = timeData.dates.shamsi.text.split('-')[0].trim()
  const monthString = persianMonths[dateNumeralArray[1]]
  console.log(dayString)
  console.log(monthString)
}