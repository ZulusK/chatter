const chai = require("chai");
const expect = chai.expect;
const server = require("@server");
const faker = require("faker");
const UserModel = require("@db").UserDriver.model;
const URL = "/user/signup";
const ObjectId = require("mongoose").Types.ObjectId;

function generateUser() {
    return {
        username: faker.name.firstName(),
        password: faker.internet.password()
    };
}

describe("/signup", () => {
    beforeEach((done) => {
        UserModel.remove({}, err => done(err));
    });
    describe("Send valid username and psw", () => {
        it("should create user, with specified valid fields", (done) => {
            let user = generateUser();
            chai.request(server)
                .post(URL)
                .send(user)
                .end((err, res) => {
                    expect(res).have.status(200);
                    expect(res.body).to.have.all.keys(["user", "tokens"]);
                    expect(res.body.user).to.have.all.keys(["username", "createdAt", "updatedAt", "id"]);
                    expect(res.body.user.username).to.equal(user.username);
                    expect(res.body.user.id).to.be.a("string");
                    expect(ObjectId.isValid(res.body.user.id)).to.be.true;
                    done();
                });
        });
        it("should return access and refresh tokens", (done) => {
            let user = generateUser();
            chai.request(server)
                .post(URL)
                .send(user)
                .end((err, res) => {
                    expect(res).have.status(200);
                    expect(res.body.tokens).to.have.all.keys(["accessToken", "refreshToken"]);
                    expect(res.body.tokens.accessToken).to.have.all.keys(["token", "expiredIn"]);
                    expect(res.body.tokens.refreshToken).to.have.all.keys(["token", "expiredIn"]);
                    expect(res.body.tokens.accessToken.token).to.be.a("string");
                    expect(res.body.tokens.refreshToken.token).to.be.a("string");
                    expect(res.body.tokens.token).to.not.be.equal(res.body.tokens.refreshToken.token);
                    done();
                });
        });
        it("should encrypt password", (done) => {
            let user = generateUser();
            chai.request(server)
                .post(URL)
                .send(user)
                .end(async () => {
                    let createdUser = await UserModel.findOne({username: user.username}).exec();
                    expect(createdUser).to.have.property("password");
                    expect(createdUser.password).to.be.a("string");
                    expect(createdUser.password).to.be.not.empty;
                    expect(createdUser.password).to.be.not.equal(user.password);
                    done();
                });
        });
    });
});
