# Simple public chat
The NodeJS app - a simple public chat. Where unauthenticated users can post text and everyone else can read them. Posts stored in database, and users can get or create posts by using REST API.

Basic requirements
Post must contain username and text.
Before save a post check that text is less than 200 symbols and username contains only letters and numbers.
REST API should have 2 endpoints:
Get all posts.
Create post. Should return error if text or username failed validation.
Postman collection for testing
Documentation using swagger
Additional requirements (Nice to have)
Preferably use Mongo or PostgreSQL.
Write tests for endpoints, so we can easily make sure that API is work.
Use Sequelize or another ORM.
Deploy using Digital Ocean or etc.
Use docker container and deploy using CI/CD (for example Wercker).
JWT Authentication\Authorization