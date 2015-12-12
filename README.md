This is Derek Vidovic's second assignment as part of the interview process for Bluewolf Group.

#Technologies
The backend for this project is written in NodeJS. The Express framework is used to serve content.

The frontend for this project uses Angular to drive page interactivity. Bootstrap provides a little styling (not a strength of mine). I tried to use 2 JS visualization libraries, but wasn't able to get any of them working in time.

#Overview
The basic workflow is: the user types a location name, the server looks this up and returns a description of this location, the client asks for a weather forecast, and the server finds one.

The client stores a list of looked-up location IDs in a cookie. (It was more convenient when I had the cookie store full location JSON data, but cookie size limits prevent more than a couple such entries. I should look into other forms of client-local storage.) When the user visits the page with a non-empty cookie, the client sequentially asks the server about each location ID.

To save my limited API call quota, the backend caches locations for about a day and weather forecasts for about 20 minutes.

Since this is a prototype, error handling is kept to a minimum. TODO's mark places where some error handling might be wise in production.


#Sources
Code for serving static content came from [this tutorial](blog.modulus.io/absolute-beginners-guide-to-nodejs).

Some other code came from the official examples for Angular, Express, etc.

Weather icons are from [Weather Icons](erikflowers.github.io/weather-icons/).
