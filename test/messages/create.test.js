const chai = require("chai");
const expect = chai.expect;
const server = require("@server");
const faker = require("faker");
const MessageModel = require("@db").MessageModel.model;
const URL = "/messages";
const URL_SIGNUP = "/user/signup";
const URL_TOKEN_UPDATE = "/user/access-token";
const config = require("@config");

const rules = config.get("validationRules");

function generateUser() {
    return {
        username: faker.name.firstName() + Math.floor(Math.random() * 1000),
        password: "1Am$23s" + Math.floor(Math.random() * 10000)
    };
}

function generateMessage() {
    return {
        text: "Sed ut perspiciatis, unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa, quae ab illo inventore veritatis et quasi architecto beatae"
    };
}

function updateToken() {
    return chai.request(server)
        .get(URL_TOKEN_UPDATE)
        .set("authorization", `Bearer ${TOKEN_REFRESH.token}`)
        .then(res => {
            TOKEN_ACCESS = res.body.accessToken;
            done();
        })
        .catch(err => done(err))
}

describe(() => {
    let TOKEN_ACCESS = null;
    let TOKEN_REFRESH = null;
    let AUTHOR = null;

    before((done) => {
        // register new user
        AUTHOR = generateUser();
        chai.request(server)
            .post(URL_SIGNUP)
            .send(AUTHOR)
            .then(res => {
                TOKEN_ACCESS = res.body.accessToken;
                TOKEN_REFRESH = res.body.refreshToken;
                done();
            })
            .catch(err => done(err))
    });
    beforeEach(done => {
        //clean DB and update token
        Promise.all([MessageModel.remove({}).exec(), updateToken()])
            .then(() => done())
            .catch(err => done(err));
    });

    after((done) => {
        MessageModel.remove({}, err => done(err));
    });

    describe("valid", () => {
        const message = generateMessage();
        it("should return status 200 and message", (done) => {
            chai.request(server)
                .post(URL)
                .set("authorization", `Bearer ${TOKEN_ACCESS.token}`)
                .send(message)
                .end((err, res) => {
                    expect(res).have.status(200);
                    expect(res.body).to.have.all.keys(["text", "id", "author", "createdAt", "updatedAt"]);
                    expect(res.body.text).to.be.equal(message.text);
                    expect(res.body.author).to.be.equal(AUTHOR.username);
                    done();
                });
        });
        it("old tokens is not outdated", (done) => {
            chai.request(server)
                .get(URL)
                .set("authorization", `Bearer ${TOKEN_REFRESH.token}`)
                .end((err, res) => {
                    // try to get access to private url using old tokens
                    chai.request(server)
                        .post(PRIVATE_URL)
                        .set("authorization", `Bearer ${TOKEN_ACCESS.token}`)
                        .end((err, res) => {
                            expect(res).have.status(200);
                            done();
                        });
                });
        });
    });
    describe("invalid token", () => {
        it("should return status 401", (done) => {
            chai.request(server)
                .get(URL)
                .set("authorization", `Bearer asnkanlnKNXAIOXinxoin`)
                .end((err, res) => {
                    expect(res).have.status(401);
                    done();
                });
        });
        it("old tokens is not outdated", (done) => {
            chai.request(server)
                .get(URL)
                .set("authorization", `Bearer ${TOKEN_REFRESH.token}`)
                .end((err, res) => {
                    // try to get access to private url using old tokens
                    chai.request(server)
                        .post(PRIVATE_URL)
                        .set("authorization", `Bearer ${TOKEN_ACCESS.token}`)
                        .end((err, res) => {
                            expect(res).have.status(200);
                            done();
                        });
                });
        });
    });
})
;
