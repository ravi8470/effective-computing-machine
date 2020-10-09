# web-scrapper-node

A simple node.js app to recursively crawl web pages for links and store them in the database along with some additional info.

# Tech/framework used

1. node.js
2. mongodb
3. Docker

# Installation

  ### prerequisite : docker and docker-compose should be installed 
1. clone the project
2. go to project root directory
3. run cmd - 'docker-compose up'

# How to use?

1. After starting the project, access the mongo container with command -
"docker container exec -it web-scrapper-node_mongo_1 bash"
2. log into mongo shell by using command - 'mongo'
3. Run command - 'use scrapperDB'
4. Run command - 'db.urls.find().pretty()' to view all the urls crawled along with  their refCount and query params.