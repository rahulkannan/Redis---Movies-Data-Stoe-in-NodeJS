const fetch = require("node-fetch");
const redis = require('async-redis');

const dataSourceUrl = 'http://www.omdbapi.com?apikey=e7392bd6&t=';
const client = redis.createClient(6379);
const expirationTime = 200; //Seconds
const movieKeyFormat = 'movie.name=';

// GET MOVIE NAME INPUT FROM CLI.
function getInput() {
	const readline = require('readline').createInterface({
		input: process.stdin,
		output: process.stdout
	})

	readline.question(`Enter movie name : `, async function (name) {
		await getData(name);
		readline.close();
		getInput();
	})
}
getInput();

// CHECK FOR DATA IN REDIS / FETCH DATA FROM API.
async function getData(name) {
	let data = await getCache(name);
	if (data != null) {
		console.log("Data fetched From Redis " + JSON.stringify(data));
		return data;
	}
	let url = dataSourceUrl + name;
	const response = await fetch(url);
	data = await response.json();
	console.log("Data fetched From API " + JSON.stringify(data));
	setCache(name, data);
}

// REDIS APIS
async function setCache(movieName, data) {
	let key = movieKeyFormat + movieName;
	data = JSON.stringify(data);
	return await setRedisCache(key, data);
}

async function getRedisCache(key) {
	return await client.get(key);
}

async function clearCache(key) {
	key = movieKeyFormat + movieName;
	clearRedisCache(key);
}

// REDIS CORE.
async function setRedisCache(key, value) {
	await client.setex(key, expirationTime, value);
}

async function getCache(movieName) {
	let key = movieKeyFormat + movieName;
	let data = await getRedisCache(key);
	return JSON.parse(data);
}

async function clearRedisCache(key) {
	await client.del(key);
}

