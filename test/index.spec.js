const request = require("supertest");
const Koa = require("koa");
const etag = require("..");
const fs = require("fs");
const stream = require("stream");
describe("when body is a stream without a .path smaller than sizelimit", function () {
    it("should add an ETag", function (done) {
        const app = new Koa();

        app.use(etag({ sizelimit: 1000 * 1024 }));

        app.use(function (ctx, next) {
            return next().then(function () {
                ctx.body = fs.createReadStream("package.json").pipe(
                    new stream.Transform({
                        transform(chunk, encoding, callback) {
                            // console.log(chunk.toString(), encoding);
                            callback(null, chunk);
                        },
                    })
                );
            });
        });

        var response = request(app.listen()).get("/");
        // console.log(response);
        response.expect((r) => {
            console.log(r.headers);
            return r;
        });
        response.expect("ETag", /.+/).end(done);
    });

    it("should not cause the response stream to hang", function (done) {
        const app = new Koa()
            .use(etag({ sizelimit: 100000000 }))
            .use(function (ctx, next) {
                return next().then(function () {
                    ctx.body = stream.Readable.from(
                        (async function* () {
                            yield Buffer.from("X".repeat(5000000));
                        })()
                    );
                });
            });

        var response = request(app.listen()).get("/");
        // console.log(response);
        response.expect((r) => {
            console.log(r.headers);
            return r;
        });
        response.expect("ETag", /.+/)
        response.expect("X".repeat(5000000))
        .end(done);
    });
});
describe("when body is a stream without a .path larger than sizelimit", function () {
    it("should not add an ETag", function (done) {
        const app = new Koa();

        app.use(etag({ sizelimit: 1000 }));

        app.use(function (ctx, next) {
            return next().then(function () {
                ctx.body = fs.createReadStream("package.json").pipe(
                    new stream.Transform({
                        transform(chunk, encoding, callback) {
                            // console.log(chunk.toString(), encoding);
                            callback(null, chunk);
                        },
                    })
                );
            });
        });

        var response = request(app.listen()).get("/");
        // console.log(response);
        response.expect((r) => {
            console.log(r.headers);
            return typeof r.headers.etag === "undefined";
        });
        response.end(done);
    });
});
describe("etag()", function () {
    describe("when body is missing", function () {
        it("should not add ETag", function (done) {
            const app = new Koa();

            app.use(etag());

            app.use(function (ctx, next) {
                return next();
            });

            request(app.listen())
                .get("/")
                .expect((r) => {
                    console.log(r.headers);
                    return r;
                })
                .end(done);
        });
    });

    describe("when ETag is exists", function () {
        it("should not add ETag", function (done) {
            const app = new Koa();

            app.use(etag());

            app.use(function (ctx, next) {
                ctx.body = { hi: "etag" };
                ctx.etag = "etaghaha";
                return next();
            });

            request(app.listen())
                .get("/")
                .expect((r) => {
                    console.log(r.headers);
                    return r;
                })
                .expect("etag", '"etaghaha"')
                .expect({ hi: "etag" })

                .expect(200, done);
        });
    });

    describe("when body is a string", function () {
        it("should add ETag", function (done) {
            const app = new Koa();

            app.use(etag());

            app.use(function (ctx, next) {
                return next().then(function () {
                    ctx.body = "Hello World";
                });
            });

            request(app.listen())
                .get("/")
                .expect((r) => {
                    console.log(r.headers);
                    return r;
                })
                .expect("ETag", '"b-Ck1VqNd45QIvq3AZd8XYQLvEhtA"')

                .end(done);
        });
    });

    describe("when body is a Buffer", function () {
        it("should add ETag", function (done) {
            const app = new Koa();

            app.use(etag());

            app.use(function (ctx, next) {
                return next().then(function () {
                    ctx.body = Buffer.from("Hello World");
                });
            });

            request(app.listen())
                .get("/")
                .expect((r) => {
                    console.log(r.headers);
                    return r;
                })
                .expect("ETag", '"b-Ck1VqNd45QIvq3AZd8XYQLvEhtA"')

                .end(done);
        });
    });

    describe("when body is JSON", function () {
        it("should add ETag", function (done) {
            const app = new Koa();

            app.use(etag());

            app.use(function (ctx, next) {
                return next().then(function () {
                    ctx.body = { foo: "bar" };
                });
            });

            request(app.listen())
                .get("/")
                .expect((r) => {
                    console.log(r.headers);
                    return r;
                })
                .expect("ETag", '"d-pedE0BZFQNM7HX6mFsKPL6l+dUo"')
                .end(done);
        });
    });

    describe("when body is a stream with a .path", function () {
        it("should add an ETag", function (done) {
            const app = new Koa();

            app.use(etag());

            app.use(function (ctx, next) {
                return next().then(function () {
                    ctx.body = fs.createReadStream("package.json");
                });
            });

            request(app.listen())
                .get("/")
                .expect((r) => {
                    console.log(r.headers);
                    return r;
                })
                .expect("ETag", /^W\/.+/)
                .end(done);
        });
    });

    describe("when with options", function () {
        it("should add weak ETag", function (done) {
            const app = new Koa();
            const options = { weak: true };

            app.use(etag(options));

            app.use(function (ctx, next) {
                return next().then(function () {
                    ctx.body = "Hello World";
                });
            });

            request(app.listen())
                .get("/")
                .expect((r) => {
                    console.log(r.headers);
                    return r;
                })
                .expect("ETag", 'W/"b-Ck1VqNd45QIvq3AZd8XYQLvEhtA"')
                .end(done);
        });
    });
});
