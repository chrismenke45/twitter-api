# Twitter Clone Backend
This is the backend to the [twitter clone](https://chrismenke45.github.io/twitter-client) made with Node.js/Express.js and MongoDB: 
![desktop](https://user-images.githubusercontent.com/86500980/223279307-b70d1a90-86d8-41c2-b6d5-9354d51794e9.png)
## How it's made:
Tech used: Node.js, Express.js, MongoDB, Twitter OAuth
<br />
Twitter OAuth was used to authenticate users and prepopulate their account. It was tested with postman before being integrated with the [frontend.](https://github.com/chrismenke45/twitter-client)
## Optimizations
There is a lot I'd change about this site if I started from scratch again.  I am currently storing all images in binary blobs within my MongoDB database. This is not only slow, but also would be very expensive if the site were to scale.  Instead I would store my images in an imagestore such as cloudinary or google firestore. I also should have set up the database schema to not double store data. Currently, user models store a list of all their following and followers. I should have just stored following and made a query for followers whenevever it was needed.
## Lessons learned
This project taught me about cors and how it affects frontend and backends hosted at different domains.  It made working with cookies hard, so I opted for stateless JWT auth instead of session based auth with cookies.
