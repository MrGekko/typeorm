import "reflect-metadata";
import {createTestingConnections, closeTestingConnections, reloadTestingDatabases} from "../../utils/test-utils";
import {Connection} from "../../../src/connection/Connection";
import {Post} from "./entity/Post";
import {expect} from "chai";
import {PostStatus} from "./model/PostStatus";

describe("github issues > #182 enums are not saved properly", () => {

    let connections: Connection[];
    before(async () => connections = await createTestingConnections({
        entities: [__dirname + "/entity/*{.js,.ts}"],
        schemaCreate: true,
        dropSchemaOnConnection: true,
        enabledDrivers: ["mysql"] // we can properly test lazy-relations only on one platform
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));

    it("should persist successfully with enum values", () => Promise.all(connections.map(async connection => {

        const post1 = new Post();
        post1.status = PostStatus.NEW;
        post1.title = "Hello Post #1";

        // persist
        await connection.entityManager.persist(post1);

        const loadedPosts1 = await connection.entityManager.findOne(Post, { where: { title: "Hello Post #1" } });
        expect(loadedPosts1!).not.to.be.empty;
        loadedPosts1!.should.be.eql({
            id: 1,
            title: "Hello Post #1",
            status: PostStatus.NEW
        });

        // remove persisted
        await connection.entityManager.remove(post1);

        const post2 = new Post();
        post2.status = PostStatus.ACTIVE;
        post2.title = "Hello Post #1";

        // persist
        await connection.entityManager.persist(post2);

        const loadedPosts2 = await connection.entityManager.findOne(Post, { where: { title: "Hello Post #1" } });
        expect(loadedPosts2!).not.to.be.empty;
        loadedPosts2!.should.be.eql({
            id: 2,
            title: "Hello Post #1",
            status: PostStatus.ACTIVE
        });

        // remove persisted
        await connection.entityManager.remove(post2);

        const post3 = new Post();
        post3.status = PostStatus.ACHIEVED;
        post3.title = "Hello Post #1";

        // persist
        await connection.entityManager.persist(post3);

        const loadedPosts3 = await connection.entityManager.findOne(Post, { where: { title: "Hello Post #1" } });
        expect(loadedPosts3!).not.to.be.empty;
        loadedPosts3!.should.be.eql({
            id: 3,
            title: "Hello Post #1",
            status: PostStatus.ACHIEVED
        });

        // remove persisted
        await connection.entityManager.remove(post3);

    })));

});
