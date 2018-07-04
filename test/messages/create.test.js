const chai = require("chai");
const expect = chai.expect;
const server = require("@server");
const faker = require("faker");
const MessageModel = require("@db").MessageDriver.model;
const UserModel = require("@db").UserDriver.model;
const URL = "/messages";
const URL_SIGNUP = "/user/signup";
const URL_TOKEN_UPDATE = "/user/access-token";
const config = require("@config");

const rules = config.get("validationRules");

describe("", () => {

    let TOKEN_ACCESS = null;
    let TOKEN_REFRESH = null;
    let AUTHOR = null;

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

    before((done) => {
        // register new user
        AUTHOR = generateUser();
        UserModel.remove({}).then(() =>
            chai.request(server)
                .post(URL_SIGNUP)
                .send(AUTHOR)
                .then(res => {
                    AUTHOR.id = res.body.user.id;
                    TOKEN_ACCESS = res.body.tokens.accessToken;
                    TOKEN_REFRESH = res.body.tokens.refreshToken;
                    done();
                })
                .catch(err => done(err))
        );
    });
    beforeEach(done => {
        //clean DB and update token
        Promise.all(
            [
                MessageModel.remove({}).exec(),
                chai.request(server)
                    .get(URL_TOKEN_UPDATE)
                    .set("authorization", `Bearer ${TOKEN_REFRESH.token}`)
                    .then(res => {
                        TOKEN_ACCESS = res.body.accessToken;
                    })
            ])
            .then(() => done())
            .catch(err => done(err));
    });

    after((done) => {
        MessageModel.remove({}, err => done(err));
    });

    describe("valid, auth access token", () => {
        const message = generateMessage();
        it("should return status 200 and created message", (done) => {
            chai.request(server)
                .post(URL)
                .set("authorization", `Bearer ${TOKEN_ACCESS.token}`)
                .send(message)
                .end((err, res) => {
                    expect(res).have.status(200);
                    expect(res.body).to.have.all.keys(["text", "id", "author", "createdAt", "updatedAt"]);
                    expect(res.body.text).to.be.equal(message.text);
                    expect(res.body.author).to.be.equal(AUTHOR.id);
                    done();
                });
        });
    });
    describe("valid, basic auth ", () => {
        const message = generateMessage();
        it("should return status 200 and created message", (done) => {
            chai.request(server)
                .post(URL)
                .auth(AUTHOR.username, AUTHOR.password)
                .send(message)
                .end((err, res) => {
                    expect(res).have.status(200);
                    expect(res.body).to.have.all.keys(["text", "id", "author", "createdAt", "updatedAt"]);
                    expect(res.body.text).to.be.equal(message.text);
                    expect(res.body.author).to.be.equal(AUTHOR.id);
                    done();
                });
        });
    });
    describe("invalid token", () => {
        const message = generateMessage();
        it("should return status 401", (done) => {
            chai.request(server)
                .post(URL)
                .set("authorization", `Bearer asnkanlnKNXAIOXinxoin`)
                .send(message)
                .end((err, res) => {
                    expect(res).have.status(401);
                    done();
                });
        });
    });
    describe("invalid basic credentials", () => {
        it("should reject invalid password with status 401", (done) => {
            const message = generateMessage();
            chai.request(server)
                .post(URL)
                .auth(AUTHOR.username, AUTHOR.password + 123)
                .send(message)
                .end((err, res) => {
                    expect(res).have.status(401);
                    done();
                });
        });
        it("should reject invalid username with status 401", (done) => {
            const message = generateMessage();
            chai.request(server)
                .post(URL)
                .auth(AUTHOR.username + 124, AUTHOR.password)
                .send(message)
                .end((err, res) => {
                    expect(res).have.status(401);
                    done();
                });
        });
    });
    describe("invalid text", () => {
        it("should reject with status 400, text.length>200", (done) => {
            const message=generateMessage();
            message.text+=message.text;
            console.log(message.text.length)
            chai.request(server)
                .post(URL)
                .set("authorization", `Bearer ${TOKEN_ACCESS.token}`)
                .send(message)
                .end((err, res) => {
                    expect(res).have.status(400);
                    expect(res.body.errors).have.all.keys(["text"]);
                    expect(res.body.errors.text.msg).to.equal(`text must be less, that ${rules.message.length.max} symbols`);
                    done();
                });
        });
        it("should reject with status 400, missing text", (done) => {
            chai.request(server)
                .post(URL)
                .set("authorization", `Bearer ${TOKEN_ACCESS.token}`)
                .end((err, res) => {
                    expect(res).have.status(400);
                    expect(res.body.errors).have.all.keys(["text"]);
                    expect(res.body.errors.text.msg).to.equal(`text is required`);
                    done();
                });
        });
    });
});
