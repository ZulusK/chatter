const chai = require("chai");
const expect = chai.expect;
const server = require("@server");
const faker = require("faker");
const MessageModel = require("@db").MessageDriver.model;
const UserModel = require("@db").UserDriver.model;
const URL = "/messages";
const URL_SIGNUP = "/user/signup";
const config = require("@config");
const ObjectId = require("mongoose").Types.ObjectId;
describe("get", () => {
    const pagination_standard = config.get("STANDARD_PAGINATION");
    let users = null;
    let messages = null;

    function generateUser() {
        return {
            username: faker.name.firstName() + Math.floor(Math.random() * 1000),
            password: "1Am$23s" + Math.floor(Math.random() * 10000)
        };
    }

    function generateMessage() {
        return {
            text: "Sed ut perspiciatis, unde omnis" + Date.now().toLocaleString()
        };
    }

    function registerUser() {
        let user = generateUser();
        return chai.request(server)
            .post(URL_SIGNUP)
            .send(user)
            .then(res => {
                user.id = res.body.user.id;
                user.access = res.body.tokens.accessToken;
                user.refresh = res.body.tokens.refreshToken;
                return user;
            })
    }

    function createMessage(user) {
        return chai.request(server)
            .post(URL)
            .auth(user.username, user.password)
            .send(generateMessage())
            .then(res => {
                return res;
            })
    }

    before((done) => {
        // drop User's db
        const userGenerator = [];
        for (let i = 0; i < pagination_standard; i++) {
            userGenerator.push(registerUser())
        }
        UserModel.remove({}).then(() =>
            // register 10 new user
            Promise.all(userGenerator)
                .then(generatedUsers => {
                    const messageGenerator = [];
                    users = generatedUsers;
                    generatedUsers.forEach(u => {
                        // for each user create 10 messages
                        for (let i = 0; i < pagination_standard; i++) {
                            messageGenerator.push(createMessage(u))
                        }
                    });
                    return Promise.all(messageGenerator);
                })
                .then(generatedMessages => {
                    messages = generatedMessages;
                    done()
                })
                .catch(err => {
                    done(err)
                })
        );
    });

    after((done) => {
        Promise.all([
            MessageModel.remove({}).exec(),
            UserModel.remove({}).exec()
        ])
            .then(() => done())
            .catch(err => done(err));

    });

    describe("valid, get all messages", () => {
        it(`should return status 200 and all pagination info`, (done) => {
            chai.request(server)
                .get(URL)
                .end((err, res) => {
                    expect(res).have.status(200);
                    expect(res.body).to.have.all.keys(["docs", "total", "limit", "page"]);
                    expect(res.body.docs).to.have.length(res.body.limit);
                    expect(res.body.total).to.be.equal(messages.length);
                    expect(res.body.page).to.be.equal(1);
                    expect(res.body.limit).to.be.equal(pagination_standard);
                    done();
                });
        });
        it(`all ${pagination_standard} messages should contain all public fields`, (done) => {
            chai.request(server)
                .get(URL)
                .end((err, res) => {
                    expect(res).have.status(200);
                    res.body.docs.forEach(m => {
                        expect(m).to.have.all.keys(["text", "id", "author", "createdAt", "updatedAt"]);
                    });
                    done();
                });
        })
    });
    describe("search by author", () => {
        it(`should return ${pagination_standard} messages of author`, (done) => {
            chai.request(server)
                .get(URL)
                .query({author: users[0].id})
                .end((err, res) => {
                    expect(res).have.status(200);
                    expect(res.body).to.have.all.keys(["docs", "total", "limit", "page"]);
                    expect(res.body.docs).to.have.length(pagination_standard);
                    expect(res.body.total).to.be.equal(pagination_standard);
                    expect(res.body.page).to.be.equal(1);
                    expect(res.body.limit).to.be.equal(pagination_standard);
                    done();
                });
        });
        it(`all messages must contain selected author id `, (done) => {
            chai.request(server)
                .get(URL)
                .query({author: users[1].id})
                .end((err, res) => {
                    expect(res).have.status(200);
                    res.body.docs.forEach(m => {
                        expect(m.author).to.be.equal(users[1].id);
                    });
                    done();
                });
        });
        it(`should return empty array of messages, used with not-existing author's id`, (done) => {
            chai.request(server)
                .get(URL)
                .query({author: ObjectId().toHexString()})
                .end((err, res) => {
                    expect(res).have.status(200);
                    expect(res.body).to.have.all.keys(["docs", "total", "limit", "page"]);
                    expect(res.body.docs).to.have.length(0);
                    expect(res.body.total).to.be.equal(0);
                    expect(res.body.page).to.be.equal(1);
                    expect(res.body.limit).to.be.equal(pagination_standard);
                    done();
                });
        });
    });
    describe("search by invalid id of author", () => {
        it(`should return all messages`, (done) => {
            chai.request(server)
                .get(URL)
                .query({author: 123})
                .end((err, res) => {
                    expect(res).have.status(200);
                    expect(res.body.total).be.equal(pagination_standard * pagination_standard);
                    done();
                });
        });
    });
    describe("search by id", () => {
        it(`should return 1 messages with existing id`, (done) => {
            chai.request(server)
                .get(URL)
                .query({_id: messages[0].id})
                .end((err, res) => {
                    expect(res).have.status(200);
                    done();
                });
        });
        it(`should return empty array of messages, used with not-existing id`, (done) => {
            chai.request(server)
                .get(URL)
                .query({_id: ObjectId().toHexString()})
                .end((err, res) => {
                    expect(res).have.status(200);
                    expect(res.body).to.have.all.keys(["docs", "total", "limit", "page"]);
                    expect(res.body.docs).to.have.length(0);
                    expect(res.body.total).to.be.equal(0);
                    expect(res.body.page).to.be.equal(1);
                    expect(res.body.limit).to.be.equal(pagination_standard);
                    done();
                });
        });
    });
    describe("search by invalid id", () => {
        it(`should return all messages, used invalid`, (done) => {
            chai.request(server)
                .get(URL)
                .query({_id: "invalid"})
                .end((err, res) => {
                    expect(res).have.status(200);
                    expect(res.body.total).be.equal(pagination_standard * pagination_standard);
                    done();
                });
        });
    });
});
